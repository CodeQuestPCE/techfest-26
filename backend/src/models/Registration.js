const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamName: {
    type: String,
    trim: true
  },
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  ticketType: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  utrNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  paymentScreenshotUrl: {
    type: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'cancelled'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  },
  qrCodeHash: {
    type: String,
    unique: true,
    sparse: true
  },
  checkInStatus: {
    type: Boolean,
    default: false
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  attendeeInfo: {
    name: String,
    email: String,
    phone: String,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  checkInTime: {
    type: Date
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ event: 1, user: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
