const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const QRCode = require('qrcode');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

// @desc    Create registration with manual payment
exports.createRegistration = async (req, res) => {
  try {
    const { eventId, ticketType, quantity, attendeeInfo, teamName, teamMembers, utrNumber } = req.body;

    // Get the uploaded file path
    const paymentScreenshotUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!paymentScreenshotUrl) {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot is required'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find ticket type
    const ticket = event.ticketTypes.find(t => t.name === ticketType);
    if (!ticket) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket type'
      });
    }

    // Check overall event capacity
    if (event.capacity && event.registeredCount + quantity > event.capacity) {
      return res.status(400).json({
        success: false,
        message: `Event is full! Only ${event.capacity - event.registeredCount} spots remaining.`
      });
    }

    // Check ticket type availability
    if (ticket.available < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough ${ticketType} tickets available. Only ${ticket.available} remaining.`
      });
    }

    // Check if UTR already exists
    if (utrNumber) {
      const existingUTR = await Registration.findOne({ utrNumber });
      if (existingUTR) {
        return res.status(400).json({
          success: false,
          message: 'UTR number already used'
        });
      }
    }

    // Validate team size for team events
    if (event.eventType === 'team') {
      if (!teamName || !teamMembers || teamMembers.length < event.minTeamSize || teamMembers.length > event.maxTeamSize) {
        return res.status(400).json({
          success: false,
          message: `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize}`
        });
      }
    }

    const totalAmount = ticket.price * quantity;

    // Create registration with Pending status
    const registration = await Registration.create({
      event: eventId,
      user: req.user.id,
      ticketType,
      quantity,
      totalAmount,
      attendeeInfo,
      teamName,
      teamMembers,
      utrNumber,
      paymentScreenshotUrl,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Temporarily reserve tickets (don't increment registeredCount yet - only on approval)
    ticket.available -= quantity;
    await event.save();

    // Send email notification
    const user = await User.findById(req.user.id);
    await emailService.sendRegistrationSubmittedEmail(user.email, user.name, event.title);

    res.status(201).json({
      success: true,
      message: 'Registration submitted. Payment verification pending.',
      data: registration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user registrations
exports.getUserRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
      .populate('event', 'title startDate endDate location')
      .sort({ registeredAt: -1 });

    res.json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single registration
exports.getRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check ownership
    if (registration.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel registration
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check ownership
    if (registration.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Update event availability
    const event = await Event.findById(registration.event);
    const ticket = event.ticketTypes.find(t => t.name === registration.ticketType);
    ticket.available += registration.quantity;
    event.registeredCount -= registration.quantity;
    await event.save();

    // Cancel tickets
    await Ticket.updateMany(
      { registration: registration._id },
      { status: 'cancelled' }
    );

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get event registrations
exports.getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('user', 'name email phone')
      .sort({ registeredAt: -1 });

    res.json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
