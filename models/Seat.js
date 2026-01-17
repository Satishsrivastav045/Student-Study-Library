const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    seatNo: {
      type: String,
      required: true,
      unique: true
    },
    row: {
      type: String,
      required: true
    },
    column: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'maintenance', 'girls_only', 'blocked'],
      default: 'available'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Seat', seatSchema);

