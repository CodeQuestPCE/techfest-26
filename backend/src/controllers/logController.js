const NotificationLog = require('../models/NotificationLog');

// Log admin action
exports.logAction = async (action, performedBy, details = {}) => {
  try {
    await NotificationLog.create({
      action,
      performedBy,
      ...details,
      timestamp: new Date()
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

    res.json({
      success: true,
      count: logs.length,
      data: logs
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

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
