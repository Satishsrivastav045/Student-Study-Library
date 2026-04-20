const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    method: {
      type: String,
      enum: ['cash', 'upi', 'card'],
      required: true
    },

    status: {
      type: String,
      enum: ['paid', 'unpaid', 'cancelled'],
      default: 'unpaid'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);


