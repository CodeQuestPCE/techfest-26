const express = require('express');
const router = express.Router();
const checkInController = require('../controllers/checkInController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/checkin/validate
// @desc    Validate QR and check-in user
// @access  Private (Volunteer/Coordinator/Admin)
router.post('/validate', protect, authorize('admin', 'coordinator', 'ambassador'), checkInController.validateCheckIn);

// @route   GET /api/checkin/status/:qrHash
// @desc    Get check-in status
// @access  Private
router.get('/status/:qrHash', protect, checkInController.getCheckInStatus);

// @route   GET /api/checkin/stats/:eventId
// @desc    Get event check-in statistics
// @access  Private (Admin/Coordinator)
router.get('/stats/:eventId', protect, authorize('admin', 'coordinator'), checkInController.getEventCheckInStats);

module.exports = router;
