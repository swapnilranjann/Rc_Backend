import express from 'express';
import { body, validationResult } from 'express-validator';
import SuccessStory from '../models/SuccessStory.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/success-stories
// @desc    Get all success stories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      page = 1, 
      limit = 10,
      featured = false 
    } = req.query;
    
    const query = { isApproved: true };

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const stories = await SuccessStory.find(query)
      .populate('user', 'name profileImage city bikeType')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await SuccessStory.countDocuments(query);

    res.json({
      success: true,
      stories,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get success stories error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch success stories' 
    });
  }
});

// @route   GET /api/success-stories/:id
// @desc    Get success story by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id)
      .populate('user', 'name profileImage city bikeType')
      .populate('comments.user', 'name profileImage');

    if (!story) {
      return res.status(404).json({ 
        success: false,
        message: 'Success story not found' 
      });
    }

    res.json({
      success: true,
      story
    });
  } catch (error) {
    console.error('Get success story error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch success story' 
    });
  }
});

// @route   POST /api/success-stories
// @desc    Submit a success story
// @access  Private
router.post('/', protect, [
  body('title').trim().isLength({ min: 10, max: 150 }).withMessage('Title must be 10-150 characters'),
  body('story').trim().isLength({ min: 50, max: 2000 }).withMessage('Story must be 50-2000 characters'),
  body('category').isIn(['Solo Ride', 'Group Ride', 'Long Distance', 'Adventure', 'Touring', 'First Ride', 'Other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const story = new SuccessStory({
      ...req.body,
      user: req.user.id || req.user._id
    });

    await story.save();

    const populatedStory = await SuccessStory.findById(story._id)
      .populate('user', 'name profileImage city bikeType');

    res.status(201).json({
      success: true,
      message: 'Success story submitted! It will be visible after admin approval.',
      story: populatedStory
    });
  } catch (error) {
    console.error('Create success story error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit success story' 
    });
  }
});

// @route   POST /api/success-stories/:id/like
// @desc    Like/unlike a success story
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ 
        success: false,
        message: 'Success story not found' 
      });
    }

    const userId = req.user.id || req.user._id;
    const likeIndex = story.likes.findIndex(
      like => like.user.toString() === userId.toString()
    );

    if (likeIndex > -1) {
      story.likes.splice(likeIndex, 1);
    } else {
      story.likes.push({ user: userId });
    }

    await story.save();

    res.json({
      success: true,
      liked: likeIndex === -1,
      likeCount: story.likes.length
    });
  } catch (error) {
    console.error('Like success story error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to like success story' 
    });
  }
});

// @route   POST /api/success-stories/:id/comment
// @desc    Add a comment to a success story
// @access  Private
router.post('/:id/comment', protect, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const story = await SuccessStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ 
        success: false,
        message: 'Success story not found' 
      });
    }

    const userId = req.user.id || req.user._id;
    const { content } = req.body;

    story.comments.push({
      user: userId,
      content: content.trim()
    });

    await story.save();

    const populatedStory = await SuccessStory.findById(story._id)
      .populate('comments.user', 'name profileImage');

    res.json({
      success: true,
      message: 'Comment added successfully',
      story: populatedStory
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add comment' 
    });
  }
});

export default router;

