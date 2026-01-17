const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookingController');

// CREATE booking (seat + shift)
router.post('/', ctrl.createBooking);

// GET all bookings (dashboard)
router.get('/', ctrl.getAllBookings);

// GET booking by id
router.get('/:id', ctrl.getBookingById);

// GET bookings by shift
router.get('/shift/:shiftId', ctrl.getBookingsByShift);

// GET bookings by gender
router.get('/gender/:gender', ctrl.getBookingsByGender);

module.exports = router;
