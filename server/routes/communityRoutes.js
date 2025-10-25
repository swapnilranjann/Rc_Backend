import express from 'express';
import { body, validationResult } from 'express-validator';
import Community from '../models/Community.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/communities
// @desc    Get all communities with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, bikeType, page = 1, limit = 10, search } = req.query;
    const query = { isPublic: true };

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (bikeType) {
      query.bikeType = bikeType;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const communities = await Community.find(query)
      .populate('admin', 'name profileImage')
      .populate('members.user', 'name profileImage')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ memberCount: -1, createdAt: -1 });

    const total = await Community.countDocuments(query);

    res.json({
      communities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/communities/:id
// @desc    Get community by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('admin', 'name profileImage city bikeType')
      .populate('moderators', 'name profileImage')
      .populate('members.user', 'name profileImage city bikeType');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json({ community });
  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities
// @desc    Create a new community
// @access  Private
router.post('/', protect, [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
  body('description').trim().isLength({ min: 20, max: 500 }).withMessage('Description must be 20-500 characters'),
  body('state').optional().trim(),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('bikeType').trim().notEmpty().withMessage('Bike type is required')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({ 
        message: errorMessages,
        errors: errors.array() 
      });
    }

    const { name, description, state, city, bikeType, coverImage, rules, tags } = req.body;
    
    // Validate user ID
    const userId = req.user.id || req.user._id;
    if (!userId) {
      return res.status(401).json({ message: 'User authentication failed' });
    }
    
    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedDescription = description.trim();
    const sanitizedCity = city.trim();
    const sanitizedBikeType = bikeType.trim();
    
    if (!sanitizedName || !sanitizedDescription || !sanitizedCity || !sanitizedBikeType) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    // Check if community with same name exists in the city
    const existingCommunity = await Community.findOne({ 
      name: { $regex: new RegExp(`^${sanitizedName}$`, 'i') },
      city: { $regex: new RegExp(`^${sanitizedCity}$`, 'i') }
    });

    if (existingCommunity) {
      return res.status(400).json({ message: `A community named "${sanitizedName}" already exists in ${sanitizedCity}` });
    }

    const community = new Community({
      name,
      description,
      city,
      bikeType,
      coverImage,
      admin: req.user._id,
      rules: rules || [],
      tags: tags || []
    });

    // Add admin as first member
    community.members.push({
      user: req.user._id,
      joinedAt: new Date()
    });

    await community.save();

    // Add community to user's joined communities
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { joinedCommunities: community._id }
    });

    const populatedCommunity = await Community.findById(community._id)
      .populate('admin', 'name profileImage city bikeType')
      .populate('members.user', 'name profileImage city bikeType');

    res.status(201).json({
      message: 'Community created successfully',
      community: populatedCommunity
    });
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/:id/join
// @desc    Join a community
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if already a member
    const isMember = community.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this community' });
    }

    // Add user to community members
    community.members.push({
      user: req.user._id,
      joinedAt: new Date()
    });

    await community.save();

    // Add community to user's joined communities
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { joinedCommunities: community._id }
    });

    res.json({ message: 'Successfully joined the community' });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/:id/leave
// @desc    Leave a community
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is the admin
    if (community.admin.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot leave the community. Transfer admin rights first.' });
    }

    // Remove user from community members
    community.members = community.members.filter(
      member => member.user.toString() !== req.user._id.toString()
    );

    await community.save();

    // Remove community from user's joined communities
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedCommunities: community._id }
    });

    res.json({ message: 'Successfully left the community' });
  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/communities/:id
// @desc    Update community (admin only)
// @access  Private
router.put('/:id', protect, [
  body('name').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is admin
    if (community.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can update community' });
    }

    const { name, description, coverImage, rules, tags } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (rules) updateData.rules = rules;
    if (tags) updateData.tags = tags;

    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('admin', 'name profileImage city bikeType')
     .populate('members.user', 'name profileImage city bikeType');

    res.json({
      message: 'Community updated successfully',
      community: updatedCommunity
    });
  } catch (error) {
    console.error('Update community error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

