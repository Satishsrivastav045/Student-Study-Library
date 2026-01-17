const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },

  shiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    required: true
  },

  // seat optional (full shift case)
  seatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat',
    default: null
  },

  bookingType: {
    type: String,
    enum: ['SEAT', 'FULL_SHIFT'],
    default: 'SEAT'
  },

  status: {
    type: String,
    enum: ['booked', 'cancelled'],
    default: 'booked'
  },
  paymentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Payment',
  default: null
}

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
