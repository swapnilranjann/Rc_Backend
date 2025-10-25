import mongoose from 'mongoose';

const successStorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  story: {
    type: String,
    required: [true, 'Story is required'],
    maxlength: [2000, 'Story cannot exceed 2000 characters']
  },
  rideDetails: {
    from: String,
    to: String,
    distance: Number,
    duration: String,
    bike: String
  },
  images: [{
    type: String,
    maxlength: [500, 'Image URL cannot exceed 500 characters']
  }],
  coverImage: String,
  category: {
    type: String,
    enum: ['Solo Ride', 'Group Ride', 'Long Distance', 'Adventure', 'Touring', 'First Ride', 'Other'],
    default: 'Other'
  },
  tags: [String],
  isApproved: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
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
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
successStorySchema.index({ user: 1 });
successStorySchema.index({ isApproved: 1, isFeatured: 1 });
successStorySchema.index({ category: 1 });
successStorySchema.index({ createdAt: -1 });

export default mongoose.model('SuccessStory', successStorySchema);

