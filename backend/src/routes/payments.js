const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// @route   POST /api/payments/create-intent
// @desc    Create payment intent
// @access  Private
router.post('/create-intent', protect, paymentController.createPaymentIntent);

// @route   POST /api/payments/webhook
// @desc    Stripe webhook
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

// @route   GET /api/payments/:id
// @desc    Get payment details
// @access  Private
router.get('/:id', protect, paymentController.getPayment);

module.exports = router;
