const Shift = require('../models/Shift');
const Booking = require('../models/Booking');

/* ======================
   CREATE SHIFT
====================== */
exports.createShift = async (req, res) => {
  try {
    const { shiftName, startTime, endTime, price } = req.body;

    if (!shiftName || !startTime || !endTime || !price) {
      return res.status(400).json({ message: 'All fields required' });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ message: 'Invalid shift time' });
    }

    const exists = await Shift.findOne({ shiftName });
    if (exists) {
      return res.status(400).json({ message: 'Shift already exists' });
    }

    const shift = await Shift.create({
      shiftName,
      startTime,
      endTime,
      price,
      isActive: true
    });

    res.status(201).json({ success: true, data: shift });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================
   GET ALL SHIFTS
====================== */
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().sort({ startTime: 1 });
    res.json({ success: true, data: shifts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================
   UPDATE SHIFT
====================== */
exports.updateShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json({ success: true, data: shift });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================
   DEACTIVATE SHIFT
   (allowed even if booking exists)
====================== */
exports.deactivateShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json({ success: true, data: shift });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================
   DELETE SHIFT (SAFE)
   ❌ NOT ALLOWED if booking exists
====================== */
exports.deleteShift = async (req, res) => {
  try {
    const bookingCount = await Booking.countDocuments({
      shiftId: req.params.id,
      status: 'booked'
    });

    if (bookingCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete shift. Bookings already exist.'
      });
    }

    await Shift.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Shift deleted permanently'
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

