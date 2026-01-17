const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

/**
 * CREATE SEAT
 */
exports.createSeat = async (req, res) => {
  try {
    const seat = await Seat.create(req.body);
    res.status(201).json({
      success: true,
      data: seat
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL SEATS
 */
exports.getAllSeats = async (req, res) => {
  try {
    const seats = await Seat.find();
    res.json({
      success: true,
      total: seats.length,
      data: seats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE SEAT
 */
exports.updateSeat = async (req, res) => {
  try {
    const seat = await Seat.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    res.json({
      success: true,
      data: seat
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * TOTAL SEATS COUNT
 */
exports.getTotalSeatsCount = async (req, res) => {
  try {
    const count = await Seat.countDocuments();
    res.json({
      success: true,
      totalSeats: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GIRLS RESERVED SEATS COUNT
 */
exports.getGirlsReservedSeatsCount = async (req, res) => {
  try {
    const count = await Seat.countDocuments({ status: 'girls_only' });
    res.json({
      success: true,
      girlsReservedSeats: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🔥 SHIFT-WISE SEAT AVAILABILITY
 * All seats + bookings → availability
 */
exports.getSeatsByShift = async (req, res) => {
  try {
    const { shiftId } = req.params;

    // 🛡️ IMPORTANT SAFETY CHECK
    if (!mongoose.Types.ObjectId.isValid(shiftId)) {
      return res.status(400).json({
        message: 'Invalid shiftId'
      });
    }

    // 1️⃣ All seats
    const seats = await Seat.find();

    // 2️⃣ Booked seats for shift
    const bookings = await Booking.find({
      shiftId,
      status: 'booked'
    });

    const bookedSeatIds = bookings
      .filter(b => b.seatId)
      .map(b => b.seatId.toString());

    // 3️⃣ Mark availability
    const result = seats.map(seat => ({
      ...seat.toObject(),
      isAvailable: !bookedSeatIds.includes(seat._id.toString())
    }));

    res.json({
      success: true,
      total: result.length,
      data: result
    });

  } catch (error) {
    console.error('Seat by shift error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

