const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// CREATE payment
router.post('/', paymentController.createPayment);

// MARK payment as paid
router.put('/paid/:id', paymentController.markPaymentPaid);

// GET all payments
router.get('/', paymentController.getAllPayments);

// GET unpaid payments
router.get('/unpaid', paymentController.getUnpaidPayments);

module.exports = router;
