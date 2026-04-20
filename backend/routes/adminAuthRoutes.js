const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminAuthController');
const adminAuth = require('../middleware/adminAuth');

router.post('/register', ctrl.registerAdmin);
router.post('/login', ctrl.loginAdmin);
router.get('/me', adminAuth, ctrl.getCurrentAdmin);
router.put('/me', adminAuth, ctrl.updateCurrentAdmin);

module.exports = router;
