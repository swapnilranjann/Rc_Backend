import express from 'express';
import GearReview from '../models/GearReview.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all gear reviews
// @route   GET /api/gear-reviews
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, sort = '-createdAt' } = req.query;
    
    const query = { isApproved: true };
    if (type) query.productType = type;

    const reviews = await GearReview.find(query)
      .populate('user', 'name profileImage')
      .sort(sort)
      .limit(50);

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Get gear reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gear reviews'
    });
  }
});

// @desc    Create gear review
// @route   POST /api/gear-reviews
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productName, productType, brand, rating, price, review, pros, cons, images } = req.body;

    // Validation
    if (!productName || !productType || !brand || !rating || !price || !review) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const gearReview = new GearReview({
      user: req.user.id,
      productName,
      productType,
      brand,
      rating,
      price,
      review,
      pros: pros || [],
      cons: cons || [],
      images: images || []
    });

    await gearReview.save();
    await gearReview.populate('user', 'name profileImage');

    res.status(201).json({
      success: true,
      review: gearReview
    });
  } catch (error) {
    console.error('Create gear review error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create gear review'
    });
  }
});

// @desc    Like gear review
// @route   POST /api/gear-reviews/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const review = await GearReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const userId = req.user.id;
    const likeIndex = review.likes.indexOf(userId);

    if (likeIndex > -1) {
      review.likes.splice(likeIndex, 1);
    } else {
      review.likes.push(userId);
    }

    await review.save();

    res.json({
      success: true,
      likes: review.likes.length
    });
  } catch (error) {
    console.error('Like gear review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like review'
    });
  }
});

// @desc    Comment on gear review
// @route   POST /api/gear-reviews/:id/comment
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const review = await GearReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.comments.push({
      user: req.user.id,
      text: text.trim()
    });

    await review.save();
    await review.populate('comments.user', 'name profileImage');

    res.json({
      success: true,
      comments: review.comments
    });
  } catch (error) {
    console.error('Comment on gear review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

export default router;

