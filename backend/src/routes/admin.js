const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const settingsController = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require admin access
router.use(protect);
router.use(authorize('admin', 'coordinator'));

// @route   GET /api/admin/registrations/pending
// @desc    Get all pending registrations
// @access  Private/Admin
router.get('/registrations/pending', adminController.getPendingRegistrations);

// @route   GET /api/admin/registrations
// @desc    Get all registrations with filters
// @access  Private/Admin
router.get('/registrations', adminController.getAllRegistrations);

// @route   PUT /api/admin/registrations/:id/approve
// @desc    Approve a registration
// @access  Private/Admin
router.put('/registrations/:id/approve', adminController.approveRegistration);

// @route   PUT /api/admin/registrations/:id/reject
// @desc    Reject a registration
// @access  Private/Admin
router.put('/registrations/:id/reject', adminController.rejectRegistration);

// @route   GET /api/admin/settings/payment
// @desc    Get payment settings
// @access  Private/Admin
router.get('/settings/payment', settingsController.getPaymentSettings);

// @route   PUT /api/admin/settings/payment
// @desc    Update payment settings
// @access  Private/Admin
router.put('/settings/payment', settingsController.updatePaymentSettings);

// @route   POST /api/admin/settings/payment/upload-qr
// @desc    Upload payment QR code image
// @access  Private/Admin
router.post('/settings/payment/upload-qr', upload.single('qrCode'), settingsController.uploadPaymentQR);

module.exports = router;
