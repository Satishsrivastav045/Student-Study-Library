const Booking = require('../models/Booking');
const Seat = require('../models/Seat');

exports.getDashboardStats = async (req, res) => {
  try {
    const { shiftId, bookingDate } = req.query;

    const totalSeats = await Seat.countDocuments();

    const filter = { status: 'booked' };

    // 🔹 shift filter (IMPORTANT)
    if (shiftId) {
      filter.shiftId = shiftId;
    }

    // 🔹 date filter
    if (bookingDate) {
      filter.bookingDate = bookingDate;
    }

    const totalBookings = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        totalSeats,
        totalBookings,
        availableSeats: totalSeats - totalBookings
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

