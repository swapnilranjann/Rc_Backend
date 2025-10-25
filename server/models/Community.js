import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Community name is required'],
    trim: true,
    maxlength: [100, 'Community name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Community description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  bikeType: {
    type: String,
    required: [true, 'Bike type is required'],
    enum: ['Royal Enfield', 'Bajaj', 'TVS', 'Honda', 'Yamaha', 'KTM', 'Harley Davidson', 'Ducati', 'Kawasaki', 'Suzuki', 'All Types']
  },
  coverImage: {
    type: String,
    default: null
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  memberCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  rules: [{
    type: String,
    maxlength: [200, 'Rule cannot exceed 200 characters']
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Update member count when members array changes
communitySchema.pre('save', function(next) {
  this.memberCount = this.members.length;
  next();
});

// Index for better query performance
communitySchema.index({ city: 1, bikeType: 1 });
communitySchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Community', communitySchema);
