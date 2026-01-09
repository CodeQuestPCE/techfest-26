const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['approve_registration', 'reject_registration', 'create_event', 'delete_event', 'update_event', 'check_in_user']
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  targetRegistration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration'
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
notificationLogSchema.index({ performedBy: 1, timestamp: -1 });
notificationLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
