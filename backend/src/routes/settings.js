const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// @route   GET /api/settings/payment
// @desc    Get payment settings (public)
// @access  Public
router.get('/payment', settingsController.getPaymentSettings);

module.exports = router;
