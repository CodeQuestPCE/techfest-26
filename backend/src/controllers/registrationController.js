const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const QRCode = require('qrcode');
const crypto = require('crypto');

const emailService = require('../utils/emailService');
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

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

    // Fetch current user early so we can sanitize teamMembers (remove leader if accidentally included)
    const currentUser = await User.findById(req.user.id).select('name email phone');

    // Ensure teamMembers is an array and remove any entry that matches the leader (by email/phone/name)
    if (!Array.isArray(teamMembers)) {
      teamMembers = [];
    } else {
      teamMembers = teamMembers.filter((m, idx, arr) => {
        if (!m) return false;
        const memEmail = (m.email || '').toString().toLowerCase();
        const memPhone = (m.phone || '').toString();
        const memName = (m.name || '').toString().trim().toLowerCase();

        // Exclude if matches leader
        if ((currentUser.email && memEmail && memEmail === (currentUser.email || '').toString().toLowerCase()) ||
            (currentUser.phone && memPhone && memPhone === (currentUser.phone || '').toString()) ||
            (currentUser.name && memName && memName === (currentUser.name || '').toString().toLowerCase())) {
          return false;
        }

        // Deduplicate by email or phone among other members (keep first occurrence)
        for (let j = 0; j < idx; j++) {
          const prev = arr[j] || {};
          const prevEmail = (prev.email || '').toString().toLowerCase();
          const prevPhone = (prev.phone || '').toString();
          if ((memEmail && prevEmail && memEmail === prevEmail) || (memPhone && prevPhone && memPhone === prevPhone)) {
            return false;
          }
        }

        return true;
      });
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


    // Upload payment screenshot to Cloudinary
    let paymentScreenshotUrl = null;
    if (req.file && req.file.buffer) {
      try {
        const result = await cloudinaryUpload(req.file.buffer, req.file.mimetype);
        paymentScreenshotUrl = result.secure_url;
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload payment screenshot',
          error: err.message
        });
      }
    }

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

    // Atomic ticket availability check: decrement available and increment registeredCount
    const ticketUpdateResult = await Event.updateOne(
      { _id: eventId, "ticketTypes.name": ticketType, "ticketTypes.available": { $gte: quantity } },
      { $inc: { "ticketTypes.$.available": -quantity, registeredCount: quantity } }
    );
    if (ticketUpdateResult.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: `Not enough ${ticketType} tickets available. Please try again.`
      });
    }

    // Validate team size for team events.
    // Frontend sends `teamMembers` as "other" members (leader is the registrant),
    // so total team size = 1 (leader) + teamMembers.length
    if (event.eventType === 'team') {
      const otherCount = Array.isArray(teamMembers) ? teamMembers.length : 0;
      const totalMembers = 1 + otherCount;
      console.log('Team validation - minSize:', event.minTeamSize, 'maxSize:', event.maxTeamSize, 'otherMembers:', otherCount, 'totalMembers:', totalMembers);
      if (!teamName || totalMembers < event.minTeamSize || totalMembers > event.maxTeamSize) {
        console.log('Team size validation failed');
        return res.status(400).json({
          success: false,
          message: `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize}`
        });
      }
    }

    console.log('All validations passed, creating registration...');

    const unitPrice = ticket && ticket.price && ticket.price > 0 ? ticket.price : (event.registrationFee || 0);
    const totalAmount = unitPrice * quantity;

    // Create registration with Pending status
    let registration;
    try {
      registration = await Registration.create({
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
    } catch (err) {
      // Revert reservation if registration creation fails
      await Event.updateOne(
        { _id: eventId, "ticketTypes.name": ticketType },
        { $inc: { "ticketTypes.$.available": quantity, registeredCount: -quantity } }
      );
      throw err;
    }

    // No need to manually decrement ticket.available here (atomic update above)

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

    // Atomic increment of ticket availability and decrement registeredCount on cancellation
    await Event.updateOne(
      { _id: registration.event, "ticketTypes.name": registration.ticketType },
      { $inc: { "ticketTypes.$.available": registration.quantity, registeredCount: -registration.quantity } }
    );

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

// @desc    Update (edit) a rejected registration and resubmit for verification
exports.updateRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    // Only owner can edit (admin can also, but for resubmit this is owner flow)
    if (registration.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Only allow edits when registration is rejected (explicit resubmit flow)
    if (registration.status !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Only rejected registrations can be edited and resubmitted' });
    }

    let { teamName, teamMembers, utrNumber } = req.body;

    // Parse teamMembers if string
    if (typeof teamMembers === 'string') {
      try {
        teamMembers = JSON.parse(teamMembers);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid team members format' });
      }
    }

    // Fetch current user to sanitize team members (remove leader duplicates)
    const currentUser = await User.findById(req.user.id).select('name email phone');

    if (!Array.isArray(teamMembers)) teamMembers = [];
    else {
      teamMembers = teamMembers.filter((m, idx, arr) => {
        if (!m) return false;
        const memEmail = (m.email || '').toString().toLowerCase();
        const memPhone = (m.phone || '').toString();
        const memName = (m.name || '').toString().trim().toLowerCase();

        if ((currentUser.email && memEmail && memEmail === (currentUser.email || '').toString().toLowerCase()) ||
            (currentUser.phone && memPhone && memPhone === (currentUser.phone || '').toString()) ||
            (currentUser.name && memName && memName === (currentUser.name || '').toString().toLowerCase())) {
          return false;
        }

        for (let j = 0; j < idx; j++) {
          const prev = arr[j] || {};
          const prevEmail = (prev.email || '').toString().toLowerCase();
          const prevPhone = (prev.phone || '').toString();
          if ((memEmail && prevEmail && memEmail === prevEmail) || (memPhone && prevPhone && memPhone === prevPhone)) {
            return false;
          }
        }

        return true;
      });
    }

    // Validate team size constraints if this is a team event
    const event = await Event.findById(registration.event);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.eventType === 'team') {
      const otherCount = Array.isArray(teamMembers) ? teamMembers.length : 0;
      const total = 1 + otherCount;
      if (!teamName || total < event.minTeamSize || total > event.maxTeamSize) {
        return res.status(400).json({ success: false, message: `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize}` });
      }
    }

    // Check if utr changed and is unique (exclude current registration)
    if (utrNumber && utrNumber !== registration.utrNumber) {
      const existingUTR = await Registration.findOne({ utrNumber });
      if (existingUTR) {
        return res.status(400).json({ success: false, message: 'UTR number already used. Please use a different UTR number.' });
      }
    }

    // If a new payment screenshot was uploaded, replace it
    if (req.file && req.file.buffer) {
      try {
        const result = await cloudinaryUpload(req.file.buffer, req.file.mimetype);
        registration.paymentScreenshotUrl = result.secure_url;
      } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to upload payment screenshot', error: err.message });
      }
    }

    // Apply edits
    if (typeof teamName === 'string') registration.teamName = teamName;
    registration.teamMembers = teamMembers;
    if (utrNumber) registration.utrNumber = utrNumber;

    // Reset status to pending for re-verification
    registration.status = 'pending';
    registration.paymentStatus = 'pending';

    await registration.save();

    const user = await User.findById(req.user.id);
    await emailService.sendRegistrationResubmittedEmail(user.email, user.name, event.title);

    res.json({ success: true, message: 'Registration updated and resubmitted for verification', data: registration });
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update registration' });
  }
};
