const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Student = require('../models/Student');
const Shift = require('../models/Shift');

/* ===============================
   COMMON VALIDATION
================================ */
const validateSeatAndStudent = async (studentId, seatId) => {
  const student = await Student.findById(studentId);
  if (!student) throw new Error('Student not found');

  const seat = await Seat.findById(seatId);
  if (!seat) throw new Error('Seat not found');

  if (seat.status === 'maintenance') {
    throw new Error('Seat under maintenance');
  }

  if (seat.status === 'blocked') {
    throw new Error('Seat is blocked');
  }

  if (seat.status === 'girls_only' && student.gender !== 'female') {
    throw new Error('Girls only seat');
  }

  return seat;
};

/* =====================================================
   1️⃣ SINGLE SHIFT BOOKING
===================================================== */
exports.createBooking = async (req, res) => {
  try {
    const { studentId, seatId, shiftId, bookingDate } = req.body;

    if (!studentId || !seatId || !shiftId || !bookingDate) {
      return res.status(400).json({
        message: 'studentId, seatId, shiftId and bookingDate are required'
      });
    }

    const seat = await validateSeatAndStudent(studentId, seatId);

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // ❌ prevent duplicate booking
    const exists = await Booking.findOne({
      seatId,
      shiftId,
      bookingDate,
      status: 'booked'
    });
    if (exists) {
      return res.status(400).json({
        message: 'Seat already booked for this shift and date'
      });
    }

    const booking = await Booking.create({
      bookingId: `BK-${Date.now()}`,
      studentId,
      seatId,
      shiftId,
      bookingDate,
      bookingType: 'SEAT',
      status: 'booked',
      paymentAmount: shift.price,
      paymentId: null
    });

    res.status(201).json({
      success: true,
      message: 'Seat booked successfully',
      data: booking
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   2️⃣ MULTI SHIFT BOOKING
===================================================== */
exports.createMultiShiftBooking = async (req, res) => {
  try {
    const { studentId, seatId, shiftIds, bookingDate } = req.body;

    if (!studentId || !seatId || !Array.isArray(shiftIds) || !bookingDate) {
      return res.status(400).json({
        message: 'studentId, seatId, shiftIds and bookingDate are required'
      });
    }

    const seat = await validateSeatAndStudent(studentId, seatId);
    const created = [];

    for (const shiftId of shiftIds) {
      const shift = await Shift.findById(shiftId);
      if (!shift) continue;

      const exists = await Booking.findOne({
        seatId,
        shiftId,
        bookingDate,
        status: 'booked'
      });
      if (exists) continue;

      const booking = await Booking.create({
        bookingId: `BK-${Date.now()}-${shiftId}`,
        studentId,
        seatId,
        shiftId,
        bookingDate,
        bookingType: 'SEAT',
        status: 'booked',
        paymentAmount: shift.price,
        paymentId: null
      });

      created.push(booking);
    }

    // ✅ Availability is checked dynamically from Booking collection, no need to update seat status

    res.json({
      success: true,
      totalBooked: created.length,
      data: created
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   3️⃣ FULL DAY BOOKING
===================================================== */
exports.createFullDayBooking = async (req, res) => {
  try {
    const { studentId, seatId, bookingDate } = req.body;

    if (!studentId || !seatId || !bookingDate) {
      return res.status(400).json({
        message: 'studentId, seatId and bookingDate are required'
      });
    }

    const seat = await validateSeatAndStudent(studentId, seatId);
    const shifts = await Shift.find({ isActive: true });

    const created = [];

    for (const shift of shifts) {
      const exists = await Booking.findOne({
        seatId,
        shiftId: shift._id,
        bookingDate,
        status: 'booked'
      });
      if (exists) continue;

      const booking = await Booking.create({
        bookingId: `BK-${Date.now()}-${shift._id}`,
        studentId,
        seatId,
        shiftId: shift._id,
        bookingDate,
        bookingType: 'FULL_DAY',
        status: 'booked',
        paymentAmount: shift.price,
        paymentId: null
      });

      created.push(booking);
    }

    if (created.length > 0) {
      // ✅ Availability is checked dynamically from Booking collection, no need to update seat status
    }

    res.json({
      success: true,
      totalBooked: created.length,
      data: created
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   4️⃣ CANCEL BOOKING (IMPORTANT)
===================================================== */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('paymentId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'cancelled';
    await booking.save();

    if (booking.paymentId) {
      booking.paymentId.status = 'cancelled';
      await booking.paymentId.save();
    }

    // 🔄 free seat again
    await Seat.findByIdAndUpdate(booking.seatId, {
      status: 'available'
    });

    res.json({
      success: true,
      message: 'Booking cancelled and seat released'
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   5️⃣ GET ALL BOOKINGS
===================================================== */
exports.getAllBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate('studentId')
    .populate('seatId')
    .populate('shiftId')
    .populate('paymentId')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: bookings });
};

/* =====================================================
   6️⃣ GET BOOKINGS BY SHIFT
===================================================== */
exports.getBookingsByShift = async (req, res) => {
  const bookings = await Booking.find({
    shiftId: req.params.shiftId,
    status: 'booked'
  })
    .populate('studentId')
    .populate('seatId')
    .populate('shiftId')
    .populate('paymentId');

  res.json({ success: true, data: bookings });
};

/* =====================================================
   7️⃣ GET BOOKINGS BY GENDER
===================================================== */
exports.getBookingsByGender = async (req, res) => {
  const bookings = await Booking.find()
    .populate({
      path: 'studentId',
      match: { gender: req.params.gender }
    })
    .populate('seatId')
    .populate('shiftId')
    .populate('paymentId');

  res.json({
    success: true,
    data: bookings.filter(b => b.studentId)
  });
};

/* =====================================================
   8️⃣ GET BOOKING BY ID
===================================================== */
exports.getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('studentId')
    .populate('seatId')
    .populate('shiftId')
    .populate('paymentId');

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  res.json({ success: true, data: booking });
};
