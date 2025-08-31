const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const crypto = require('crypto');
const { User, Booking, Availability } = require('./models');
const sendEmail = require('./emailService');

const router = express.Router();

// --- Helper to sign JWT ---
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// --- Middleware to Protect Routes ---
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ message: 'The user for this token no longer exists.' });
    }
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
};

// --- AUTHENTICATION ROUTES ---

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    const newUser = await User.create({ name, email, password });

    const token = signToken(newUser._id);

    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Error creating account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await argon2.verify(user.password, password))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const token = signToken(user._id);
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: 'An error occurred during login.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // To prevent email enumeration, always send a success-like response.
    return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  const resetURL = `${frontendUrl}/reset-password/${resetToken}`;

  const message = `Forgot your password? Click the link to reset it: \n\n${resetURL}\n\nThis link is valid for 10 minutes. If you didn't request this, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password Reset Token',
      message,
    });
    res.status(200).json({ message: 'A password reset link has been sent to your email.' });
  } catch (err) {
    console.error('Email sending error:', err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ message: 'There was an error sending the email. Please try again later.' });
  }
});

router.put('/reset-password/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    user.password = undefined;

    const token = signToken(user._id);
    res.status(200).json({ status: 'success', token, data: { user }});
  } catch(error) {
    console.error("Password Reset Error:", error);
    res.status(500).json({ message: 'An error occurred while resetting the password.' });
  }
});


// --- SCHEDULING & BOOKING ROUTES ---

router.get('/availability', async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const datesToEnsure = Array.from({ length: 14 }, (_, i) => {
            const date = new Date(today);
            date.setUTCDate(today.getUTCDate() + i);
            return date;
        });

        const bulkOps = datesToEnsure.map(date => ({
            updateOne: {
                filter: { date: date },
                update: { $setOnInsert: { date: date } },
                upsert: true,
            },
        }));

        await Availability.bulkWrite(bulkOps);

        const endDate = new Date(datesToEnsure[datesToEnsure.length - 1]);
        endDate.setUTCDate(endDate.getUTCDate() + 1);

        const availabilities = await Availability.find({
            date: { $gte: today, $lt: endDate }
        }).sort({ date: 'asc' });

        const formattedAvailability = {};
        availabilities.forEach(doc => {
            const dateKey = doc.date.toISOString().split('T')[0];
            formattedAvailability[dateKey] = Object.fromEntries(doc.timeSlots);
        });

        res.status(200).json(formattedAvailability);
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ message: "Failed to retrieve class availability." });
    }
});


router.post('/bookings', protect, async (req, res) => {
    const { planId, selectedClasses, totalCost, currency } = req.body;

    if (!planId || !selectedClasses || !selectedClasses.length) {
        return res.status(400).json({ message: 'Missing required booking information.' });
    }

    try {
        const updatePromises = selectedClasses.map(classSlot => {
            const createUTCDate = (dateString) => {
                const [year, month, day] = dateString.split('-').map(Number);
                return new Date(Date.UTC(year, month - 1, day));
            };
            const slotDate = createUTCDate(classSlot.date);
            const updateField = `timeSlots.${classSlot.time}`;
            return Availability.updateOne(
                { date: slotDate, [updateField]: { $gt: 0 } },
                { $inc: { [updateField]: -1 } }
            );
        });

        const updateResults = await Promise.all(updatePromises);
        if (updateResults.some(result => result.modifiedCount === 0)) {
            throw new Error('One or more of your selected time slots were just booked. Please revise your schedule.');
        }

        const newBooking = await Booking.create({
            user: req.user._id,
            planId,
            selectedClasses,
            totalCost,
            currency,
        });

        res.status(201).json({ message: 'Booking successful!', booking: newBooking });
    } catch (error) {
        console.error('Booking failed (non-transactional):', error);
        res.status(400).json({ message: error.message || 'Booking failed. Please try again.' });
    }
});

module.exports = router;

