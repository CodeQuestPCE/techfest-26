const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const QRCode = require('qrcode');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const { logAction } = require('./logController');

// @desc    Get all pending registrations (Admin only)
exports.getPendingRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ status: 'pending' })
      .populate('user', 'name email phone college')
      .populate('event', 'title startDate eventType')
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

// @desc    Approve registration (Admin only)
exports.approveRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event')
      .populate('user');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (registration.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Registration is not in pending status'
      });
    }

    // Update registration status
    registration.status = 'verified';
    registration.paymentStatus = 'completed';

    // registeredCount is incremented at reservation time; no-op here to avoid double-counting

    // Generate QR code hash
    const qrHash = crypto.randomBytes(32).toString('hex');
    registration.qrCodeHash = qrHash;
    await registration.save();

    // Generate tickets with QR codes
    const tickets = [];
    for (let i = 0; i < registration.quantity; i++) {
      const qrData = JSON.stringify({
        registrationId: registration._id,
        eventId: registration.event._id,
        userId: registration.user._id,
        qrHash: qrHash
      });

      const qrCode = await QRCode.toDataURL(qrData);

      const newTicket = await Ticket.create({
        registration: registration._id,
        event: registration.event._id,
        user: registration.user._id,
        qrCode,
        ticketType: registration.ticketType,
        price: registration.totalAmount / registration.quantity
      });

      tickets.push(newTicket);
    }

    // Award points to referrer if user was referred
    if (registration.user.referredBy) {
      await User.findByIdAndUpdate(
        registration.user.referredBy,
        { $inc: { points: 10 } } // 10 points per verified registration
      );
    }

    // Send approval email
    await emailService.sendRegistrationApprovedEmail(
      registration.user.email,
      registration.user.name,
      registration.event.title,
      qrCode
    );

    // Log admin action
    await logAction('approve_registration', req.user.id, {
      targetUser: registration.user._id,
      targetEvent: registration.event._id,
      targetRegistration: registration._id
    });

    res.json({
      success: true,
      message: 'Registration approved and tickets generated',
      data: {
        registration,
        tickets
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject registration (Admin only)
exports.rejectRegistration = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rejection reason'
      });
    }

    const registration = await Registration.findById(req.params.id)
      .populate('event')
      .populate('user');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (registration.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Registration is not in pending status'
      });
    }

    // Update registration status
    registration.status = 'rejected';
    registration.paymentStatus = 'failed';
    registration.rejectionReason = reason;
    await registration.save();

    // Restore ticket availability
    const event = await Event.findById(registration.event._id);
    const ticket = event.ticketTypes.find(t => t.name === registration.ticketType);
    if (ticket) {
      // Restore availability but clamp to ticket.quantity
      ticket.available = Math.min((ticket.available || 0) + registration.quantity, ticket.quantity || (event.capacity || 0));
      // Ensure registeredCount does not go below 0
      event.registeredCount = Math.max(0, (event.registeredCount || 0) - registration.quantity);
      await event.save();
    }

    // Send rejection email
    // Log admin action
    await logAction('reject_registration', req.user.id, {
      targetUser: registration.user._id,
      targetEvent: registration.event._id,
      targetRegistration: registration._id,
      details: { reason }
    });

    await emailService.sendRegistrationRejectedEmail(
      registration.user.email,
      registration.user.name,
      registration.event.title,
      reason
    );

    res.json({
      success: true,
      message: 'Registration rejected',
      data: registration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all registrations with filters (Admin only)
exports.getAllRegistrations = async (req, res) => {
  try {
    const { status, eventId } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (eventId) query.event = eventId;

    const registrations = await Registration.find(query)
      .populate('user', 'name email phone college')
      .populate('event', 'title startDate eventType')
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
