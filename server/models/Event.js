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

