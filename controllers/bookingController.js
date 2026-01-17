const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Student = require('../models/Student');

/**
 * CREATE BOOKING (Seat + Shift based)
 */
exports.createBooking = async (req, res) => {
  try {
    const { studentId, seatId, shiftId } = req.body;

    if (!studentId || !seatId || !shiftId) {
      return res.status(400).json({
        message: 'studentId, seatId and shiftId are required'
      });
    }

    // 🔍 student check
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 🔍 seat check
    const seat = await Seat.findById(seatId);
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    // ❌ maintenance seat
    if (seat.status === 'maintenance') {
      return res.status(400).json({ message: 'Seat under maintenance' });
    }

    // 👩 girls-only seat check
    if (seat.status === 'girls_only' && student.gender !== 'female') {
      return res.status(403).json({
        message: 'This seat is reserved for girls only'
      });
    }

    // ❌ same student already booked in this shift
    const studentShiftBooking = await Booking.findOne({
      studentId,
      shiftId,
      status: 'booked'
    });

    if (studentShiftBooking) {
      return res.status(400).json({
        message: 'Student already has a booking in this shift'
      });
    }

    // ❌ same seat already booked in this shift
    const seatShiftBooking = await Booking.findOne({
      seatId,
      shiftId,
      status: 'booked'
    });

    if (seatShiftBooking) {
      return res.status(400).json({
        message: 'Seat already booked in this shift'
      });
    }

    // ✅ create booking
    const booking = await Booking.create({
      bookingId: `BK-${Date.now()}`,
      studentId,
      seatId,
      shiftId,
      bookingType: 'SEAT',
      status: 'booked'
    });

    res.status(201).json({
      success: true,
      message: 'Seat booked successfully',
      data: booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL BOOKINGS (Dashboard)
 */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('studentId')
      .populate('seatId')
      .populate('shiftId')
      .populate('paymentId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET BOOKINGS BY SHIFT
 */
exports.getBookingsByShift = async (req, res) => {
  try {
    const { shiftId } = req.params;

    const bookings = await Booking.find({ shiftId })
      .populate('studentId')
      .populate('seatId')
      .populate('shiftId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET BOOKINGS BY GENDER
 */
exports.getBookingsByGender = async (req, res) => {
  try {
    const { gender } = req.params;

    const bookings = await Booking.find()
      .populate({
        path: 'studentId',
        match: { gender }
      })
      .populate('seatId')
      .populate('shiftId');

    const filtered = bookings.filter(b => b.studentId !== null);

    res.json({
      success: true,
      total: filtered.length,
      data: filtered
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET BOOKING BY ID
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('studentId')
      .populate('seatId')
      .populate('shiftId')
      .populate('paymentId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
