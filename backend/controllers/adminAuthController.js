const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* ======================
   REGISTER ADMIN
====================== */
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // ❌ bcrypt.hash removed
    const admin = await Admin.create({
      name,
      email,
      password
    });

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        mobileNumber: admin.mobileNumber || '',
        libraryAddress: admin.libraryAddress || '',
        profilePic: admin.profilePic || ''
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================
   LOGIN ADMIN
====================== */
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email & password required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        mobileNumber: admin.mobileNumber || '',
        libraryAddress: admin.libraryAddress || '',
        profilePic: admin.profilePic || ''
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================
   GET CURRENT ADMIN
====================== */
exports.getCurrentAdmin = async (req, res) => {
  try {
    const adminId = req.admin?.id;
    const admin = await Admin.findById(adminId).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================
   UPDATE CURRENT ADMIN
====================== */
exports.updateCurrentAdmin = async (req, res) => {
  try {
    const adminId = req.admin?.id;
    const {
      name,
      email,
      mobileNumber,
      libraryAddress,
      profilePic,
      currentPassword,
      newPassword
    } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (email && email !== admin.email) {
      const exists = await Admin.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      admin.email = email;
    }

    if (name) admin.name = name;
    if (mobileNumber !== undefined) admin.mobileNumber = mobileNumber;
    if (libraryAddress !== undefined) admin.libraryAddress = libraryAddress;
    if (profilePic !== undefined) admin.profilePic = profilePic;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password required' });
      }

      const match = await bcrypt.compare(currentPassword, admin.password);
      if (!match) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      admin.password = newPassword;
    }

    await admin.save();

    res.json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        mobileNumber: admin.mobileNumber || '',
        libraryAddress: admin.libraryAddress || '',
        profilePic: admin.profilePic || ''
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
