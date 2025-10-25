import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (paginated)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const users = await User.find()
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/users/profile/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('joinedCommunities', 'name city bikeType')
      .populate('registeredEvents', 'title eventDate location');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('bikeType').optional().isIn(['Royal Enfield', 'Bajaj', 'TVS', 'Honda', 'Yamaha', 'KTM', 'Harley Davidson', 'Ducati', 'Kawasaki', 'Suzuki', 'Other']).withMessage('Invalid bike type'),
  body('bio').optional().isLength({ max: 200 }).withMessage('Bio cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, city, bikeType, bikeModel, bio } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (city) updateData.city = city;
    if (bikeType) updateData.bikeType = bikeType;
    if (bikeModel !== undefined) updateData.bikeModel = bikeModel;
    if (bio !== undefined) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile-image
// @desc    Update profile image
// @access  Private
router.put('/profile-image', protect, async (req, res) => {
  try {
    const { profileImage } = req.body;

    if (!profileImage) {
      return res.status(400).json({ message: 'Profile image URL is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile image updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/search
// @desc    Search users by name or city
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, city, bikeType, page = 1, limit = 10 } = req.query;
    const query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (bikeType) {
      query.bikeType = bikeType;
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/follow/:id
// @desc    Follow a user
// @access  Private
router.post('/follow/:id', protect, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    if (req.user.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { following: targetUserId }
    });

    // Add to target user's followers
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: req.user._id }
    });

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/unfollow/:id
// @desc    Unfollow a user
// @access  Private
router.post('/unfollow/:id', protect, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Remove from following list
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: targetUserId }
    });

    // Remove from target user's followers
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: req.user._id }
    });

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

