// server/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validator = require('../middleware/validator');

// Send OTP
router.post('/send-otp', validator.validatePhone, authController.sendOTP);

// Verify OTP
router.post('/verify-otp', validator.validateVerify, authController.verifyOTP);

// Validate session token
router.post('/validate-session', authController.validateSession);

module.exports = router;