const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true
    },

    groupId: {
      type: String,
      default: () => `BG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      index: true
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

    seatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
      required: true
    },

    bookingType: {
      type: String,
      enum: ['SEAT', 'FULL_DAY'],
      default: 'SEAT'
    },

    bookingDate: {
      type: String,
      required: true
    },

    paymentAmount: {
      type: Number,
      required: true,
      default: 0
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
  },
  { timestamps: true }
);

bookingSchema.index(
  { seatId: 1, shiftId: 1, bookingDate: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'booked' }
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
