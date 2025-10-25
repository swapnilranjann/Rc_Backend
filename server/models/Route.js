import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Route title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startLocation: {
    name: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  endLocation: {
    name: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  distance: {
    type: Number, // in kilometers
    required: true,
    min: [0, 'Distance cannot be negative']
  },
  duration: {
    hours: Number,
    minutes: Number
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    default: 'Medium'
  },
  terrain: {
    type: String,
    enum: ['highway', 'mountain', 'coastal', 'city', 'offroad', 'mixed'],
    default: 'mixed'
  },
  waypoints: [{
    name: String,
    type: {
      type: String,
      enum: ['fuel', 'food', 'rest', 'scenic', 'photo', 'other']
    },
    description: String
  }],
  bestSeason: {
    type: [String],
    enum: ['Spring', 'Summer', 'Monsoon', 'Autumn', 'Winter']
  },
  images: [{
    type: String,
    maxlength: [500, 'Image URL cannot exceed 500 characters']
  }],
  coverImage: String,
  recommendedBikes: [String],
  tips: [String],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
routeSchema.index({ title: 'text', description: 'text' });
routeSchema.index({ startLocation: 1, endLocation: 1 });
routeSchema.index({ difficulty: 1 });
routeSchema.index({ terrain: 1 });
routeSchema.index({ 'rating.average': -1 });
routeSchema.index({ views: -1 });
routeSchema.index({ isFeatured: 1 });

export default mongoose.model('Route', routeSchema);

