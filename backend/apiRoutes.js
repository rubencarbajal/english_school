const express = require('express');
const mongoose = require('mongoose');
const { Booking, Availability } = require('./models.js');

const router = express.Router();

/**
 * =============================================================================
 * GET /api/availability
 * =============================================================================
 * Fetches the class availability for the next 14 days.
 * This version uses an atomic "upsert" operation to prevent race conditions
 * and explicitly uses UTC for all date operations to avoid timezone issues.
 */
router.get('/availability', async (req, res) => {
  try {
    // Create a date for today at midnight UTC to ensure consistency
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const dates = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(today);
      // Use setUTCDate to safely increment the day in UTC
      date.setUTCDate(today.getUTCDate() + i);
      return date;
    });

    // --- Atomic Find-or-Create using bulkWrite with upsert ---
    const bulkOps = dates.map(date => ({
      updateOne: {
        filter: { date }, // The unique key to find a document by
        update: {
          $setOnInsert: {
            date: date,
            timeSlots: new Availability().timeSlots
          }
        },
        upsert: true // If no doc matches 'filter', create it
      }
    }));

    if (bulkOps.length > 0) {
      await Availability.bulkWrite(bulkOps);
    }
    
    // Now that we're guaranteed all 14 days exist, we can safely fetch them.
    const availabilities = await Availability.find({ date: { $in: dates } }).sort({ date: 'asc' });

    // Format the response for the frontend
    const responsePayload = {};
    availabilities.forEach(doc => {
      const dateString = doc.date.toISOString().split('T')[0];
      responsePayload[dateString] = Object.fromEntries(doc.timeSlots);
    });

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Failed to retrieve class availability.' });
  }
});


/**
 * =============================================================================
 * POST /api/bookings
 * =============================================================================
 * Creates a new booking. This version also ensures dates are handled in UTC.
 */
router.post('/bookings', async (req, res) => {
  const { userId, planId, selectedClasses, totalCost, currency, paymentAuthorized } = req.body;

  if (!userId || !planId || !selectedClasses || selectedClasses.length === 0) {
    return res.status(400).json({ message: 'Missing required booking information.' });
  }

  // Helper to create a UTC date from a 'YYYY-MM-DD' string
  const createUTCDate = (dateString) => {
    const parts = dateString.split('-').map(p => parseInt(p, 10));
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  };

  if (process.env.DB_TRANSACTIONS_ENABLED === 'true') {
    // --- Transactional Path (for Replica Sets / Clusters) ---
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      for (const classSlot of selectedClasses) {
        const slotDate = createUTCDate(classSlot.date); // Use UTC helper
        const availability = await Availability.findOne({ date: slotDate }).session(session);

        if (!availability || availability.timeSlots.get(classSlot.time) < 1) {
          throw new Error(`The slot for ${classSlot.date} at ${classSlot.time} is no longer available.`);
        }
      }

      const updatePromises = selectedClasses.map(classSlot => {
        const slotDate = createUTCDate(classSlot.date); // Use UTC helper
        const updateField = `timeSlots.${classSlot.time}`;
        return Availability.updateOne(
          { date: slotDate },
          { $inc: { [updateField]: -1 } },
          { session }
        );
      });
      await Promise.all(updatePromises);

      const newBooking = new Booking({ userId, planId, selectedClasses, totalCost, currency, paymentAuthorized });
      await newBooking.save({ session });

      await session.commitTransaction();
      res.status(201).json({ message: 'Booking successful!', booking: newBooking });

    } catch (error) {
      await session.abortTransaction();
      console.error('Booking transaction failed:', error);
      res.status(400).json({ message: error.message || 'Booking failed. Please try again.' });
    } finally {
      session.endSession();
    }
  } else {
    // --- Non-Transactional Path (for Standalone MongoDB) ---
    try {
      for (const classSlot of selectedClasses) {
        const slotDate = createUTCDate(classSlot.date); // Use UTC helper
        const availability = await Availability.findOne({ date: slotDate });
        if (!availability || availability.timeSlots.get(classSlot.time) < 1) {
          throw new Error(`The slot for ${classSlot.date} at ${classSlot.time} is no longer available.`);
        }
      }

      const updatePromises = selectedClasses.map(classSlot => {
        const slotDate = createUTCDate(classSlot.date); // Use UTC helper
        const updateField = `timeSlots.${classSlot.time}`;
        return Availability.updateOne(
          { date: slotDate, [updateField]: { $gt: 0 } },
          { $inc: { [updateField]: -1 } }
        );
      });
      const updateResults = await Promise.all(updatePromises);
      
      if (updateResults.some(result => result.modifiedCount === 0)) {
        throw new Error('One or more time slots were booked by another user. Please choose different slots.');
      }

      const newBooking = new Booking({ userId, planId, selectedClasses, totalCost, currency, paymentAuthorized });
      await newBooking.save();

      res.status(201).json({ message: 'Booking successful!', booking: newBooking });

    } catch (error) {
      console.error('Booking failed (non-transactional):', error);
      res.status(400).json({ message: error.message || 'Booking failed. Please try again.' });
    }
  }
});

module.exports = router;

