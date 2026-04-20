const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/shiftController');

// CREATE shift
router.post('/', ctrl.createShift);

// GET all shifts
router.get('/', ctrl.getAllShifts);

// UPDATE shift
router.put('/:id', ctrl.updateShift);

// DEACTIVATE & DELETE shift
router.put('/deactivate/:id', ctrl.deactivateShift);
router.delete('/:id', ctrl.deleteShift);


module.exports = router;
