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
    console.log('Registration request body:', req.body);
    console.log('Uploaded file:', req.file);
    
    let { eventId, ticketType, quantity, attendeeInfo, teamName, teamMembers, utrNumber } = req.body;

    // Parse teamMembers if it's a JSON string
    if (typeof teamMembers === 'string') {
      try {
        teamMembers = JSON.parse(teamMembers);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid team members format'
        });
      }
    }

    // Convert quantity to number
    quantity = parseInt(quantity, 10);

    // Validate required fields
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    if (!ticketType) {
      return res.status(400).json({
        success: false,
        message: 'Ticket type is required'
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    if (!utrNumber) {
      return res.status(400).json({
        success: false,
        message: 'UTR number is required'
      });
    }

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

    // Check if user already registered for this event
    const existingRegistration = await Registration.findOne({ 
      event: eventId, 
      user: req.user.id 
    });
    if (existingRegistration) {
      console.log('User already registered for this event');
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event. You can only register once per event.'
      });
    }

    // Check if UTR already exists
    if (utrNumber) {
      const existingUTR = await Registration.findOne({ utrNumber });
      if (existingUTR) {
        console.log('UTR already exists:', utrNumber);
        return res.status(400).json({
          success: false,
          message: 'UTR number already used. Please use a different UTR number.'
        });
      }
    }

    // Validate team size for team events
    if (event.eventType === 'team') {
      console.log('Team validation - minSize:', event.minTeamSize, 'maxSize:', event.maxTeamSize, 'teamMembers:', teamMembers?.length);
      if (!teamName || !teamMembers || teamMembers.length < event.minTeamSize || teamMembers.length > event.maxTeamSize) {
        console.log('Team size validation failed');
        return res.status(400).json({
          success: false,
          message: `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize}`
        });
      }
    }

    console.log('All validations passed, creating registration...');

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

    // Reserve tickets AFTER successful registration creation
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
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// @desc    Get user registrations
exports.getUserRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
      .populate('event', 'title startDate endDate location eventType')
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
