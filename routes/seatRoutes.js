const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/seatController');

router.get('/count/total', ctrl.getTotalSeatsCount);
router.get('/count/girls', ctrl.getGirlsReservedSeatsCount);

// 🔥 THIS LINE IS IMPORTANT
router.get('/shift/:shiftId', ctrl.getSeatsByShift);

router.post('/', ctrl.createSeat);
router.get('/', ctrl.getAllSeats);
router.put('/:id', ctrl.updateSeat);

module.exports = router;

