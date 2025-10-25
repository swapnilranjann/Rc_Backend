import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  images: {
    type: [String], // Cloudinary URLs
    validate: {
      validator: function(v) {
        return v.length <= 10;
      },
      message: 'Cannot upload more than 10 images'
    }
  },
  postType: {
    type: String,
    enum: ['text', 'image', 'ride_experience', 'event_update', 'general'],
    default: 'text'
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
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
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
    }]
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For ride experience posts
  rideDetails: {
    distance: Number, // in kilometers
    duration: Number, // in hours
    route: String,
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Expert']
    },
    weather: String,
    bikeModel: String
  }
}, {
  timestamps: true
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Index for better query performance
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ content: 'text' });
postSchema.index({ postType: 1, createdAt: -1 });

export default mongoose.model('Post', postSchema);

