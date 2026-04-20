const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true  
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
  email: {
    type: String
  },
  idType: {
    type: String
  },
  idNumber: {
    type: String
  },
  address: {
    type: String
  },
  fatherName: {
    type: String
  },
  fatherPhoneNumber: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    default: false   
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

studentSchema.index(
  { deletedAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
);

module.exports = mongoose.model('Student', studentSchema);
