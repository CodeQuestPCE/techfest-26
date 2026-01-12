const Event = require('../models/Event');

// @desc    Get all events
exports.getEvents = async (req, res) => {
  try {
    const { category, search, startDate, endDate, city } = req.query;
    
    let query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single event
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email phone');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create event
exports.createEvent = async (req, res) => {
  try {

    req.body.organizer = req.user.id;

    // Ensure ticketTypes[0].price matches registrationFee
    if (Array.isArray(req.body.ticketTypes) && req.body.ticketTypes.length > 0 && typeof req.body.registrationFee === 'number') {
      req.body.ticketTypes[0].price = req.body.registrationFee;
    }

    // Validate startDate and endDate
    if (!req.body.startDate || isNaN(Date.parse(req.body.startDate))) {
      return res.status(400).json({
        success: false,
        message: 'A valid start date is required.'
      });
    }
    if (!req.body.endDate || isNaN(Date.parse(req.body.endDate))) {
      return res.status(400).json({
        success: false,
        message: 'A valid end date is required.'
      });
    }

    const event = await Event.create(req.body);

    // Log admin action
    try {
      const logController = require('./logController');
      await logController.logAction('create_event', req.user.id, {
        targetEvent: event._id,
        details: req.body,
        ipAddress: req.ip
      });
    } catch (err) {
      console.error('Failed to log event creation:', err);
    }

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update event
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }


    // Ensure ticketTypes[0].price matches registrationFee
    if (Array.isArray(req.body.ticketTypes) && req.body.ticketTypes.length > 0 && typeof req.body.registrationFee === 'number') {
      req.body.ticketTypes[0].price = req.body.registrationFee;
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Log admin action
    try {
      const logController = require('./logController');
      await logController.logAction('update_event', req.user.id, {
        targetEvent: event._id,
        details: req.body,
        ipAddress: req.ip
      });
    } catch (err) {
      console.error('Failed to log event update:', err);
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check ticket availability
exports.checkAvailability = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const availability = event.ticketTypes.map(ticket => ({
      name: ticket.name,
      available: ticket.available,
      quantity: ticket.quantity,
      price: ticket.price
    }));

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
