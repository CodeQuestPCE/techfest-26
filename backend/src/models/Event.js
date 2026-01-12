const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide event title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide event description']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please provide event category'],
    enum: ['technical', 'cultural', 'workshop', 'seminar', 'conference', 'competition', 'hackathon', 'sports', 'gaming', 'festival', 'concert', 'exhibition', 'meetup', 'networking', 'training', 'debate', 'quiz', 'dance', 'art-design', 'other']
  },
  eventType: {
    type: String,
    enum: ['solo', 'team'],
    default: 'solo'
  },
  minTeamSize: {
    type: Number,
    default: 1
  },
  maxTeamSize: {
    type: Number,
    default: 1
  },
  registrationFee: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date']
  },
  location: {
    venue: {
      type: String,
      required: true
    },
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  images: [{
    type: String
  }],
  bannerImage: {
    type: String
  },
  coordinators: [{
    name: String,
    email: String,
    phone: String
  }],
  ticketTypes: [{
    name: {
      type: String,
      default: 'General'
    },
    price: {
      type: Number,
      default: 0,
      min: 0
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    available: {
      type: Number,
      default: 0
    },
    description: String
  }],
  capacity: {
    type: Number,
    required: true
  },
  registeredCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String
  }],
  requirements: {
    type: String
  },
  paymentDetails: {
    upiId: {
      type: String,
      trim: true
    },
    qrCodeUrl: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Ensure ticketTypes has valid data
  const defaultQty = 100;
  if (!this.ticketTypes || this.ticketTypes.length === 0) {
    this.ticketTypes = [{
      name: 'General',
      price: this.registrationFee !== undefined ? this.registrationFee : 0,
      quantity: this.capacity > 0 ? this.capacity : defaultQty,
      available: this.capacity > 0 ? this.capacity : defaultQty
    }];
  } else {
    // Populate missing fields in ticketTypes
    this.ticketTypes = this.ticketTypes.map(ticket => ({
      name: ticket.name || 'General',
      price: (ticket.price !== undefined && ticket.price !== null) ? ticket.price : (this.registrationFee !== undefined ? this.registrationFee : 0),
      quantity: ticket.quantity !== undefined && ticket.quantity > 0 ? ticket.quantity : (this.capacity > 0 ? this.capacity : defaultQty),
      available: ticket.available !== undefined && ticket.available > 0 ? ticket.available : (this.capacity > 0 ? this.capacity : defaultQty),
      description: ticket.description
    }));
  }
  
  next();
});

// Indexes for query optimization
eventSchema.index({ title: 'text', description: 'text', tags: 'text' }); // Text search
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ status: 1, isPublic: 1 });
eventSchema.index({ organizer: 1, createdAt: -1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ registeredCount: -1 });

// Compound indexes for common queries
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ category: 1, startDate: 1 });
eventSchema.index({ status: 1, isPublic: 1, startDate: 1 });

// Geospatial index for location-based queries
eventSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Event', eventSchema);
