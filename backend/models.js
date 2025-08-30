const mongoose = require('mongoose');
const argon2 = require('argon2');
const crypto = require('crypto');

// --- NEW: User Schema ---
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address.',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: 8,
    select: false, // Do not send the password in query results by default
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Hash password before saving the user document
UserSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with a cost of 12
  this.password = await argon2.hash(this.password);
  next();
});

// Method to generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expiration for 10 minutes from now
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};


// --- Booking Schema (Updated) ---
const BookingSchema = new mongoose.Schema({
  // Link to the user who made the booking
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  planId: {
    type: String,
    required: true,
  },
  selectedClasses: [{
    date: { type: String, required: true },
    time: { type: String, required: true },
  }],
  totalCost: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'MXN',
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
});

const AvailabilitySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  timeSlots: {
    type: Map,
    of: Number,
    default: {
      '10:00 AM': 1,
      '11:00 AM': 1,
      '1:00 PM': 1,
      '3:00 PM': 1,
      '5:00 PM': 1,
    },
  },
});

const User = mongoose.model('User', UserSchema);
const Booking = mongoose.model('Booking', BookingSchema);
const Availability = mongoose.model('Availability', AvailabilitySchema);

module.exports = { User, Booking, Availability };

