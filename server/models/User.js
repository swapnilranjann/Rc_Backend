import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not using Google OAuth
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  bikeType: {
    type: String,
    enum: ['Royal Enfield', 'Bajaj', 'TVS', 'Honda', 'Yamaha', 'KTM', 'Harley Davidson', 'Ducati', 'Kawasaki', 'Suzuki', 'Other', ''],
    default: ''
  },
  bikeModel: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot exceed 200 characters'],
    default: ''
  },
  themeColor: {
    type: String,
    enum: [
      'blue', 'orange', 'green', 'purple', 'red', 'pink', 'teal', 'indigo', 'cyan', 'amber', 'lime', 'rose', 'violet', 'emerald', 'sky', 'fuchsia',
      'sunset-mix', 'ocean-mix', 'forest-mix', 'cosmic-mix', 'fire-mix', 'ice-mix', 'gold-mix', 'silver-mix', 'rainbow-mix', 'neon-mix', 'aurora-mix', 'steel-mix', 'coral-mix', 'mint-mix', 'lavender-mix', 'peach-mix'
    ],
    default: 'blue'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  joinedCommunities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  }],
  registeredEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ city: 1 });
userSchema.index({ bikeType: 1 });
userSchema.index({ name: 'text' }); // Text search on name

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', userSchema);
