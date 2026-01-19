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
    // Populate missing fields in ticketTypes and clamp values
    this.ticketTypes = this.ticketTypes.map(ticket => {
      const quantity = (ticket.quantity !== undefined && ticket.quantity !== null && ticket.quantity >= 0)
        ? ticket.quantity
        : (this.capacity > 0 ? this.capacity : defaultQty);
      let available = (ticket.available !== undefined && ticket.available !== null && ticket.available >= 0)
        ? ticket.available
        : (this.capacity > 0 ? this.capacity : defaultQty);
      // Ensure available is never greater than quantity
      available = Math.min(available, quantity);

      return {
        name: ticket.name || 'General',
        price: (ticket.price !== undefined && ticket.price !== null) ? ticket.price : (this.registrationFee !== undefined ? this.registrationFee : 0),
        quantity,
        available,
        description: ticket.description
      };
    });
  }

  // Clamp registeredCount between 0 and capacity (if capacity set)
  if (typeof this.registeredCount === 'number') {
    if (this.capacity && this.registeredCount > this.capacity) {
      this.registeredCount = this.capacity;
    }
    if (this.registeredCount < 0) this.registeredCount = 0;
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

// Post-save: strictly clamp ticketTypes.available and registeredCount
eventSchema.post('save', function(doc, next) {
  let changed = false;
  if (Array.isArray(doc.ticketTypes)) {
    doc.ticketTypes.forEach(ticket => {
      const origAvailable = ticket.available;
      const origQuantity = ticket.quantity;
      if (ticket.available < 0) { ticket.available = 0; changed = true; }
      if (ticket.quantity < 0) { ticket.quantity = 0; changed = true; }
      if (ticket.available > ticket.quantity) { ticket.available = ticket.quantity; changed = true; }
    });
  }
  if (typeof doc.registeredCount === 'number') {
    if (doc.registeredCount < 0) { doc.registeredCount = 0; changed = true; }
    if (doc.capacity && doc.registeredCount > doc.capacity) { doc.registeredCount = doc.capacity; changed = true; }
  }
  if (changed) {
    doc.save().then(() => next()).catch(next);
  } else {
    next();
  }
});
