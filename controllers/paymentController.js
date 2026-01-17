const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

/**
 * CREATE PAYMENT
 */
exports.createPayment = async (req, res) => {
  try {
    const { bookingId, method, amount } = req.body;

    if (!bookingId || !method || !amount) {
      return res.status(400).json({
        message: 'bookingId, method and amount are required'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentId) {
      return res.status(400).json({
        message: 'Payment already exists for this booking'
      });
    }

    const payment = await Payment.create({
      paymentId: `PAY-${Date.now()}`,
      bookingId,
      method,
      amount,
      status: 'paid'
    });

    booking.paymentId = payment._id;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Payment created and linked to booking',
      data: payment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ✅ MARK PAYMENT AS PAID (REQUIRED)
 */
exports.markPaymentPaid = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = 'paid';
    await payment.save();

    res.json({
      success: true,
      message: 'Payment marked as paid',
      data: payment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL PAYMENTS
 */
exports.getAllPayments = async (req, res) => {
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
 * GET UNPAID PAYMENTS
 */
exports.getUnpaidPayments = async (req, res) => {
  const unpaid = await Payment.find({ status: 'unpaid' })
    .populate('bookingId');

  res.json({
    success: true,
    total: unpaid.length,
    data: unpaid
  });
};

