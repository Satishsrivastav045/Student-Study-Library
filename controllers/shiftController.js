const Shift = require('../models/Shift');

// Create Shift
exports.createShift = async (req, res) => {
  try {
    const { shiftName, startingTime, endingTime } = req.body;
    if (!shiftName || !startingTime || !endingTime) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const shift = await Shift.create({ shiftName, startingTime, endingTime });
    res.status(201).json({ success: true, data: shift });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Shifts
exports.getAllShifts = async (req, res) => {
  const shifts = await Shift.find().sort({ createdAt: -1 });
  res.json({ success: true, total: shifts.length, data: shifts });
};

// Update Shift
exports.updateShift = async (req, res) => {
  const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  if (!shift) return res.status(404).json({ message: 'Shift not found' });
  res.json({ success: true, data: shift });
};
// Total Number of Shifts
exports.getTotalSeatsCount = async (req, res) => {
  try {
    const total = await Seat.countDocuments();

    res.json({
      success: true,
      totalSeats: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Delete Shift
exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);

    if (!shift) {
      return res.status(404).json({
        message: 'Shift not found'
      });
    }

    res.json({
      success: true,
      message: 'Shift deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
