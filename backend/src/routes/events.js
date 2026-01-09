const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', eventController.getEvents);

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', eventController.getEvent);

// @route   POST /api/events
// @desc    Create new event
// @access  Private (organizer, admin, coordinator)
router.post('/', protect, authorize('organizer', 'admin', 'coordinator'), eventController.createEvent);

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (owner, admin)
router.put('/:id', protect, eventController.updateEvent);

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (owner, admin)
router.delete('/:id', protect, eventController.deleteEvent);

// @route   GET /api/events/:id/availability
// @desc    Check ticket availability
// @access  Public
router.get('/:id/availability', eventController.checkAvailability);

module.exports = router;
