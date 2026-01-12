const NotificationLog = require('../models/NotificationLog');

// Log admin action
exports.logAction = async (action, performedBy = null, details = {}) => {
  try {
    await NotificationLog.create({
      action,
      performedBy,
      details,
      timestamp: details.timestamp || new Date()
    });
  } catch (error) {
    console.error('Failed to log action:', error.message);
  }
};

// Get admin activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { action, userId, limit = 100 } = req.query;

    let query = {};
    if (action) query.action = action;
    if (userId) query.performedBy = userId;

    const logs = await NotificationLog.find(query)
      .populate('performedBy', 'name email role')
      .populate('targetUser', 'name email')
      .populate('targetEvent', 'title')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    // Normalize and add displayTimestamp for frontend
    const data = logs.map(l => {
      const ts = l.timestamp || l.createdAt || null;
      return {
        _id: l._id,
        action: l.action,
        performedBy: l.performedBy || null,
        targetUser: l.targetUser || null,
        targetEvent: l.targetEvent || null,
        targetRegistration: l.targetRegistration || null,
        details: l.details || {},
        timestamp: ts,
        displayTimestamp: ts ? new Date(ts).toISOString() : null
      };
    });

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user-specific logs
exports.getUserLogs = async (req, res) => {
  try {
    const logs = await NotificationLog.find({ targetUser: req.params.userId })
      .populate('performedBy', 'name email role')
      .sort({ timestamp: -1 })
      .limit(50);

    const data = logs.map(l => {
      const ts = l.timestamp || l.createdAt || null;
      return {
        _id: l._id,
        action: l.action,
        performedBy: l.performedBy || null,
        details: l.details || {},
        timestamp: ts,
        displayTimestamp: ts ? new Date(ts).toISOString() : null
      };
    });

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
