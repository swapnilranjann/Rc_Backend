import express from 'express';
import { body, validationResult } from 'express-validator';
import Route from '../models/Route.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/routes
// @desc    Get all routes (popular routes)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      difficulty, 
      terrain, 
      page = 1, 
      limit = 10,
      sort = '-rating.average',
      featured = false 
    } = req.query;
    
    const query = { isPublic: true };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (terrain) {
      query.terrain = terrain;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const routes = await Route.find(query)
      .populate('creator', 'name profileImage city bikeType')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Route.countDocuments(query);

    res.json({
      success: true,
      routes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch routes' 
    });
  }
});

// @route   GET /api/routes/:id
// @desc    Get route by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('creator', 'name profileImage city bikeType')
      .populate('reviews.user', 'name profileImage');

    if (!route) {
      return res.status(404).json({ 
        success: false,
        message: 'Route not found' 
      });
    }

    // Increment views
    route.views += 1;
    await route.save();

    res.json({
      success: true,
      route
    });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch route' 
    });
  }
});

// @route   POST /api/routes
// @desc    Create a new route
// @access  Private
router.post('/', protect, [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('description').trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be 20-1000 characters'),
  body('startLocation.name').notEmpty().withMessage('Start location is required'),
  body('endLocation.name').notEmpty().withMessage('End location is required'),
  body('distance').isFloat({ min: 0 }).withMessage('Distance must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const route = new Route({
      ...req.body,
      creator: req.user.id || req.user._id
    });

    await route.save();

    const populatedRoute = await Route.findById(route._id)
      .populate('creator', 'name profileImage city bikeType');

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      route: populatedRoute
    });
  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create route' 
    });
  }
});

// @route   POST /api/routes/:id/like
// @desc    Like/unlike a route
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({ 
        success: false,
        message: 'Route not found' 
      });
    }

    const userId = req.user.id || req.user._id;
    const likeIndex = route.likes.findIndex(
      like => like.user.toString() === userId.toString()
    );

    if (likeIndex > -1) {
      // Unlike
      route.likes.splice(likeIndex, 1);
    } else {
      // Like
      route.likes.push({ user: userId });
    }

    await route.save();

    res.json({
      success: true,
      liked: likeIndex === -1,
      likeCount: route.likes.length
    });
  } catch (error) {
    console.error('Like route error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to like route' 
    });
  }
});

// @route   POST /api/routes/:id/review
// @desc    Add a review to a route
// @access  Private
router.post('/:id/review', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({ 
        success: false,
        message: 'Route not found' 
      });
    }

    const userId = req.user.id || req.user._id;
    const { rating, comment } = req.body;

    // Check if user already reviewed
    const existingReview = route.reviews.findIndex(
      review => review.user.toString() === userId.toString()
    );

    if (existingReview > -1) {
      route.reviews[existingReview].rating = rating;
      route.reviews[existingReview].comment = comment;
    } else {
      route.reviews.push({
        user: userId,
        rating,
        comment
      });
    }

    // Recalculate average rating
    const totalRating = route.reviews.reduce((sum, review) => sum + review.rating, 0);
    route.rating.average = totalRating / route.reviews.length;
    route.rating.count = route.reviews.length;

    await route.save();

    const populatedRoute = await Route.findById(route._id)
      .populate('reviews.user', 'name profileImage');

    res.json({
      success: true,
      message: 'Review added successfully',
      route: populatedRoute
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add review' 
    });
  }
});

export default router;

