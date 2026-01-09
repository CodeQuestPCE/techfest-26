const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => `TKT-${uuidv4().substring(0, 8).toUpperCase()}`
  },
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true
  },
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
  qrCode: {
    type: String,
    required: true
  },
  ticketType: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['valid', 'used', 'cancelled', 'expired'],
    default: 'valid'
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  usedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);
