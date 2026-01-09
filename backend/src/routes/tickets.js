const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

// @route   GET /api/tickets
// @desc    Get user tickets
// @access  Private
router.get('/', protect, ticketController.getUserTickets);

// @route   GET /api/tickets/:id
// @desc    Get single ticket
// @access  Private
router.get('/:id', protect, ticketController.getTicket);

// @route   POST /api/tickets/:id/validate
// @desc    Validate and use ticket
// @access  Private
router.post('/:id/validate', protect, ticketController.validateTicket);

// @route   GET /api/tickets/qr/:ticketNumber
// @desc    Get ticket by QR code
// @access  Private
router.get('/qr/:ticketNumber', protect, ticketController.getTicketByQR);

module.exports = router;
