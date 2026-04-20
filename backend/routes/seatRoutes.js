const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/seatController');

router.get('/count/total', ctrl.getTotalSeatsCount);
router.get('/count/girls', ctrl.getGirlsReservedSeatsCount);
router.post('/bulk', ctrl.bulkCreateSeats);
router.get('/shift/:shiftId', ctrl.getSeatsByShift);
router.post('/', ctrl.createSeat);
router.get('/', ctrl.getAllSeats);
router.put('/:id', ctrl.updateSeat);
router.delete('/:id', ctrl.deleteSeat); 
module.exports = router;

