import express from 'express';
import { body, validationResult } from 'express-validator';
import BlogPost from '../models/BlogPost.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/blog
// @desc    Get all blog posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      page = 1, 
      limit = 10,
      featured = false,
      search 
    } = req.query;
    
    const query = { isPublished: true };

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const posts = await BlogPost.find(query)
      .populate('author', 'name profileImage')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ publishedAt: -1 });

    const total = await BlogPost.countDocuments(query);

    res.json({
      success: true,
      posts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch blog posts' 
    });
  }
});

// @route   GET /api/blog/:slug
// @desc    Get blog post by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, isPublished: true })
      .populate('author', 'name profileImage city bikeType')
      .populate('comments.user', 'name profileImage');

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Blog post not found' 
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch blog post' 
    });
  }
});

// @route   POST /api/blog
// @desc    Create a blog post (admin only for now)
// @access  Private
router.post('/', protect, [
  body('title').trim().isLength({ min: 10, max: 200 }).withMessage('Title must be 10-200 characters'),
  body('excerpt').trim().isLength({ min: 20, max: 300 }).withMessage('Excerpt must be 20-300 characters'),
  body('content').notEmpty().withMessage('Content is required'),
  body('category').isIn(['Riding Tips', 'Travel', 'Reviews', 'Maintenance', 'Safety', 'Community', 'News', 'Other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const post = new BlogPost({
      ...req.body,
      author: req.user.id || req.user._id,
      publishedAt: req.body.isPublished ? new Date() : null
    });

    await post.save();

    const populatedPost = await BlogPost.findById(post._id)
      .populate('author', 'name profileImage');

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      post: populatedPost
    });
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create blog post' 
    });
  }
});

// @route   POST /api/blog/:id/like
// @desc    Like/unlike a blog post
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Blog post not found' 
      });
    }

    const userId = req.user.id || req.user._id;
    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === userId.toString()
    );

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push({ user: userId });
    }

    await post.save();

    res.json({
      success: true,
      liked: likeIndex === -1,
      likeCount: post.likes.length
    });
  } catch (error) {
    console.error('Like blog post error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to like blog post' 
    });
  }
});

// @route   POST /api/blog/:id/comment
// @desc    Add a comment to a blog post
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

    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Blog post not found' 
      });
    }

    const userId = req.user.id || req.user._id;
    const { content } = req.body;

    post.comments.push({
      user: userId,
      content: content.trim()
    });

    await post.save();

    const populatedPost = await BlogPost.findById(post._id)
      .populate('comments.user', 'name profileImage');

    res.json({
      success: true,
      message: 'Comment added successfully',
      post: populatedPost
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

