import mongoose from 'mongoose';

const gearReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  productType: {
    type: String,
    required: [true, 'Product type is required'],
    enum: ['Helmet', 'Jacket', 'Gloves', 'Boots', 'Pants', 'Rain Gear', 'Accessories', 'Other']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  review: {
    type: String,
    required: [true, 'Review is required'],
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  pros: [{
    type: String,
    maxlength: [200, 'Pro cannot exceed 200 characters']
  }],
  cons: [{
    type: String,
    maxlength: [200, 'Con cannot exceed 200 characters']
  }],
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image must be a valid URL'
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isApproved: {
    type: Boolean,
    default: true // Auto-approve for now
  }
}, {
  timestamps: true
});

// Index for faster queries
gearReviewSchema.index({ productType: 1, rating: -1 });
gearReviewSchema.index({ user: 1 });

export default mongoose.model('GearReview', gearReviewSchema);

