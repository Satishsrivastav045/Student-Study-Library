const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

/**
 * CREATE PAYMENT
 */
const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, method } = req.body;

    if (!bookingId || !method) {
      return res.status(400).json({
        message: 'bookingId and method are required'
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate('studentId')
      .populate('paymentId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentId) {
      return res.status(400).json({
        message: 'Payment already done'
      });
    }

    if (booking.status !== 'booked') {
      return res.status(400).json({
        message: 'Cannot create payment for a cancelled booking'
      });
    }

    const billDate = booking.bookingDate || '';
    const studentId = booking.studentId?._id || booking.studentId;

    const unsettledBookings = await Booking.find({
      studentId,
      status: 'booked',
      paymentId: null,
      bookingDate: { $lte: billDate }
    })
      .populate('shiftId')
      .sort({ bookingDate: 1, createdAt: 1 });

    const billBookings = unsettledBookings.some((item) => item._id.equals(booking._id))
      ? unsettledBookings
      : [...unsettledBookings, booking];

    const totalAmount = billBookings.reduce((sum, item) => {
      const itemAmount =
        Number(item.paymentAmount) ||
        Number(item.shiftId?.price) ||
        0;
      return sum + itemAmount;
    }, 0);

    const payment = await Payment.create({
      paymentId: `PAY-${Date.now()}`,
      bookingId,
      amount: totalAmount,
      method,
      status: 'paid'
    });

    for (const item of billBookings) {
      await Booking.findByIdAndUpdate(item._id, {
        paymentId: payment._id
      });
    }

    res.status(201).json({
      success: true,
      data: payment,
      totalAmount,
      settledBookings: billBookings.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL PAYMENTS (Bookings with payment)
 */
const getAllPayments = async (req, res) => {
  const bookings = await Booking.find()
    .populate('studentId')
    .populate('seatId')
    .populate('shiftId')
    .populate('paymentId')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: bookings });
};

module.exports = {
  createPayment,
  getAllPayments
};
