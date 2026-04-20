const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookingController');

router.post('/', ctrl.createBooking);
router.post('/multi-shift', ctrl.createMultiShiftBooking);
router.post('/full-day', ctrl.createFullDayBooking);

router.get('/', ctrl.getAllBookings);
router.get('/shift/:shiftId', ctrl.getBookingsByShift);
router.get('/gender/:gender', ctrl.getBookingsByGender);
router.get('/:id', ctrl.getBookingById);


module.exports = router;
