const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    mobileNumber: {
      type: String
    },

    libraryAddress: {
      type: String
    },

    profilePic: {
      type: String
    },

    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

/* 🔐 HASH PASSWORD BEFORE SAVE */
adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


module.exports = mongoose.model('Admin', adminSchema);
