const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

// @route   POST /api/certificates/generate/:registrationId
// @desc    Generate certificate
// @access  Private
router.post('/generate/:registrationId', protect, certificateController.generateCertificate);

// @route   GET /api/certificates/download/:registrationId
// @desc    Download certificate
// @access  Private
router.get('/download/:registrationId', protect, certificateController.downloadCertificate);

module.exports = router;
