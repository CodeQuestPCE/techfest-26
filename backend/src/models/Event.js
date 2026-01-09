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
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    available: {
      type: Number,
      required: true
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
  next();
});

module.exports = mongoose.model('Event', eventSchema);
