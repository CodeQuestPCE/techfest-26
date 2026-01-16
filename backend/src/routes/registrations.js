const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');
const { registrationLimiter } = require('../middleware/rateLimiter');
const memoryUpload = require('../middleware/memoryUpload');

// @route   POST /api/registrations
// @desc    Create new registration with manual payment
// @access  Private
router.post(
  '/',
  protect,
  registrationLimiter,
  memoryUpload.single('paymentScreenshot'),
  registrationController.createRegistration
);

// @route   GET /api/registrations
// @desc    Get user registrations
// @access  Private
router.get('/', protect, registrationController.getUserRegistrations);

// @route   GET /api/registrations/:id
// @desc    Get single registration
// @access  Private
router.get('/:id', protect, registrationController.getRegistration);

// @route   PUT /api/registrations/:id/cancel
// @desc    Cancel registration
// @access  Private
router.put('/:id/cancel', protect, registrationController.cancelRegistration);

// @route   PATCH /api/registrations/:id
// @desc    Edit a rejected registration and resubmit (owner)
// @access  Private
router.patch('/:id', protect, memoryUpload.single('paymentScreenshot'), registrationController.updateRegistration);

// @route   GET /api/registrations/event/:eventId
// @desc    Get event registrations (organizer/admin)
// @access  Private
router.get('/event/:eventId', protect, registrationController.getEventRegistrations);

module.exports = router;
