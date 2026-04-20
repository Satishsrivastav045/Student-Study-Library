const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// ✅ CREATE PAYMENT
router.post('/', paymentController.createPayment);

// ✅ GET ALL PAYMENTS
router.get('/', paymentController.getAllPayments);

module.exports = router;
