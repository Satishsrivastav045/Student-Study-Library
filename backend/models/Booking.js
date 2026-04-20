const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
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

module.exports = mongoose.model('Booking', bookingSchema);

