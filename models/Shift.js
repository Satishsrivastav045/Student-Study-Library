const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  shiftName: {
    type: String,
    required: true
  },
  startingTime: {
    type: String,
    required: true
  },
  endingTime: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
