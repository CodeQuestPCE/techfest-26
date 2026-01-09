const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/logs
// @desc    Get all activity logs
// @access  Private/Admin
router.get('/', logController.getActivityLogs);

// @route   GET /api/logs/user/:userId
// @desc    Get user-specific logs
// @access  Private/Admin
router.get('/user/:userId', logController.getUserLogs);

module.exports = router;
