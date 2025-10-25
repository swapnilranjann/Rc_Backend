import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  location: {
    name: {
      type: String,
      required: [true, 'Location name is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  maxParticipants: {
    type: Number,
    default: 50,
    min: [1, 'Max participants must be at least 1']
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'cancelled'],
      default: 'registered'
    }
  }],
  eventType: {
    type: String,
    enum: ['Ride', 'Meetup', 'Tour', 'Racing', 'Charity', 'Other'],
    default: 'Ride'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    default: 'Easy'
  },
  distance: {
    type: Number, // in kilometers
    min: [0, 'Distance cannot be negative']
  },
  
  // 🗺️ ROUTE DETAILS - World-class route planning
  routeDetails: {
    startLocation: {
      name: String,
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    endLocation: {
      name: String,
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    waypoints: [{
      name: String,
      type: {
        type: String,
        enum: ['fuel', 'food', 'rest', 'scenic', 'other']
      },
      description: String
    }],
    routeType: {
      type: String,
      enum: ['highway', 'scenic', 'mountain', 'coastal', 'mixed'],
      default: 'mixed'
    },
    estimatedDuration: {
      hours: Number,
      minutes: Number
    },
    breakTime: {
      type: Number, // in minutes
      default: 30
    }
  },
  
  // 💰 COST ESTIMATION - Professional cost breakdown
  costEstimate: {
    fuelCost: {
      perBike: Number,
      total: Number
    },
    tollCharges: {
      amount: Number,
      numberOfTolls: Number
    },
    parkingFees: Number,
    miscellaneous: Number,
    totalPerPerson: Number,
    totalForGroup: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    lastUpdated: Date
  },
  
  // 🏍️ BIKE REQUIREMENTS - Smart recommendations
  bikeRequirements: {
    recommended: [String], // e.g., ['Adventure', 'Touring', 'Cruiser']
    minimumCC: Number,
    terrainSuitability: {
      type: String,
      enum: ['city', 'highway', 'offroad', 'mixed'],
      default: 'mixed'
    }
  },
  
  // ⏱️ TIMING DETAILS - Professional time management
  timing: {
    departureTime: String,
    estimatedArrival: String,
    checkpoints: [{
      location: String,
      estimatedTime: String,
      purpose: String // e.g., 'Breakfast', 'Photo stop', 'Fuel'
    }]
  },
  
  coverImage: {
    type: String,
    default: null
  },
  requirements: [{
    type: String,
    maxlength: [200, 'Requirement cannot exceed 200 characters']
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Update current participants count
eventSchema.pre('save', function(next) {
  this.currentParticipants = this.participants.filter(p => p.status === 'registered').length;
  next();
});

// Index for better query performance
eventSchema.index({ eventDate: 1, location: 1 });
eventSchema.index({ community: 1, eventDate: 1 });
eventSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Event', eventSchema);

