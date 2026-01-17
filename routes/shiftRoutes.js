const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/shiftController');

router.get('/count/total', ctrl.getTotalSeatsCount);
router.post('/', ctrl.createShift);
router.get('/', ctrl.getAllShifts);
router.put('/:id', ctrl.updateShift);
router.delete('/:id', ctrl.deleteShift);

module.exports = router;
