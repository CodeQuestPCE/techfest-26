const express = require('express');
const router = express.Router();
const ambassadorController = require('../controllers/ambassadorController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/ambassadors/leaderboard
// @desc    Get ambassador leaderboard
// @access  Public
router.get('/leaderboard', ambassadorController.getLeaderboard);

// @route   GET /api/ambassadors/stats
// @desc    Get ambassador personal stats
// @access  Private (Ambassador only)
router.get('/stats', protect, authorize('ambassador'), ambassadorController.getAmbassadorStats);

// @route   POST /api/ambassadors/generate-code
// @desc    Generate referral code
// @access  Private (Ambassador only)
router.post('/generate-code', protect, authorize('ambassador'), ambassadorController.generateReferralCode);

module.exports = router;
