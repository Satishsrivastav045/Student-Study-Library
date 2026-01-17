const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true   // Primary Key type
  },
  name: {
    type: String,
    required: true
  },
  gender: {
  type: String,
  enum: ['male', 'female'],
  required: true
},
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    default: false   // soft delete
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
