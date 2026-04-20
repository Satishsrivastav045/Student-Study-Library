const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

/* =========================
   🔥 BULK CREATE SEATS
========================= */
exports.bulkCreateSeats = async (req, res) => {
  try {
    const { row, startColumn, totalSeats, status } = req.body;

    if (!row || !startColumn || !totalSeats) {
      return res.status(400).json({
        message: 'row, startColumn and totalSeats are required'
      });
    }

    const seats = [];
    for (let i = 0; i < totalSeats; i++) {
      const col = Number(startColumn) + i;
      seats.push({
        seatNo: `${row}${col}`,
        row,
        column: String(col),
        status: status || 'available'
      });
    }

    await Seat.insertMany(seats, { ordered: false });

    res.status(201).json({
      success: true,
      message: `${seats.length} seats created`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   CREATE SINGLE SEAT
========================= */
exports.createSeat = async (req, res) => {
  try {
    const seat = await Seat.create(req.body);
    res.status(201).json({ success: true, data: seat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET ALL SEATS
========================= */
exports.getAllSeats = async (req, res) => {
  try {
    const seats = await Seat.find().sort({ row: 1, column: 1 });
    res.json({ success: true, total: seats.length, data: seats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   UPDATE SEAT
========================= */
exports.updateSeat = async (req, res) => {
  try {
    const seat = await Seat.findById(req.params.id);
    if (!seat) return res.status(404).json({ message: 'Seat not found' });

    seat.status = req.body.status;
    await seat.save();

    res.json({ success: true, data: seat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   🗑️ DELETE SEAT
========================= */
exports.deleteSeat = async (req, res) => {
  try {
    const seat = await Seat.findById(req.params.id);
    if (!seat) return res.status(404).json({ message: 'Seat not found' });

    await seat.deleteOne();
    res.json({ success: true, message: 'Seat deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   COUNTS
========================= */
exports.getTotalSeatsCount = async (req, res) => {
  const count = await Seat.countDocuments();
  res.json({ success: true, totalSeats: count });
};

exports.getGirlsReservedSeatsCount = async (req, res) => {
  const count = await Seat.countDocuments({ status: 'girls_only' });
  res.json({ success: true, girlsReservedSeats: count });
};

/* =========================
   🔥 SHIFT WISE SEAT AVAILABILITY (per date)
========================= */
exports.getSeatsByShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { bookingDate } = req.query;

    const seats = await Seat.find();
    
    // Build query for bookings
    const bookingQuery = {
      shiftId,
      status: 'booked'
    };
    
    // If bookingDate is provided, filter by that specific date
    if (bookingDate) {
      bookingQuery.bookingDate = bookingDate;
    }

    const bookings = await Booking.find(bookingQuery).select('seatId');
    const bookedSeatIds = bookings.map(b => b.seatId.toString());

    const result = seats.map(seat => ({
      ...seat.toObject(),
      isAvailable:
        seat.status === 'available' &&
        !bookedSeatIds.includes(seat._id.toString())
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


