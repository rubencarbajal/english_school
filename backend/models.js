const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * =============================================================================
 * BOOKING SCHEMA
 * =============================================================================
 * This schema stores the details of each booking made by a user. It links a user
 * to the specific classes they've booked and the plan they purchased.
 */

const BookingSchema = new Schema({
  // A reference to the user who made the booking.
  // In a full auth system, this might be a mongoose.Schema.Types.ObjectId ref.
  // For now, the string ID from the frontend is sufficient.
  userId: {
    type: String,
    required: [true, 'User ID is required.'],
    index: true, // Index for faster queries by user
  },

  // The ID of the purchased plan (e.g., 'plan1', 'plan5', 'plan10').
  planId: {
    type: String,
    required: [true, 'Plan ID is required.'],
    enum: ['plan1', 'plan5', 'plan10'], // Ensures only valid plan IDs are stored
  },

  // An array of the specific class slots the user has booked.
  selectedClasses: [{
    _id: false, // Don't create a separate _id for each class entry
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // e.g., "10:00 AM"
      required: true,
    }
  }],

  // The total cost of the booking.
  totalCost: {
    type: Number,
    required: [true, 'Total cost is required.'],
  },

  // The currency of the payment.
  currency: {
    type: String,
    required: [true, 'Currency is required.'],
    default: 'MXN',
  },

  // A flag to indicate if the payment was successful.
  // This would be set to true after a successful transaction with a payment gateway.
  paymentAuthorized: {
    type: Boolean,
    default: false,
  },

}, {
  // Automatically add 'createdAt' and 'updatedAt' fields to the document.
  timestamps: true,
});


/**
 * =============================================================================
 * AVAILABILITY SCHEMA
 * =============================================================================
 * This schema stores the number of available slots for each time on a specific date.
 * Each document in this collection represents a single day's schedule.
 */
const AvailabilitySchema = new Schema({
  // The specific date for which availability is being tracked.
  // It should be stored with the time part set to midnight (00:00:00) UTC
  // to ensure uniqueness and easy lookups by date alone.
  date: {
    type: Date,
    required: true,
    unique: true, // Each date should have only one availability document
    index: true,
  },

  // A map to store the number of available slots for each time.
  // The key is the time slot (e.g., "10:00 AM") and the value is the count.
  // This is flexible, allowing you to add/remove time slots easily.
  timeSlots: {
    type: Map,
    of: Number, // The values in the map must be numbers
    required: true,
    default: {
      '10:00 AM': 1, // Default to 1 slot per time if not specified
      '11:00 AM': 1,
      '1:00 PM': 1,
      '3:00 PM': 1,
      '5:00 PM': 1,
    }
  },
});


// Create the models from the schemas
const Booking = mongoose.model('Booking', BookingSchema);
const Availability = mongoose.model('Availability', AvailabilitySchema);

// Export the models for use in other parts of your application
module.exports = {
  Booking,
  Availability,
};
