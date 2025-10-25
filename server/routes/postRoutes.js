import express from 'express';
import { body, validationResult } from 'express-validator';
import Post from '../models/Post.js';
import Community from '../models/Community.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      community, 
      postType, 
      author, 
      page = 1, 
      limit = 10, 
      search 
    } = req.query;
    
    const query = { isActive: true };

    if (community) {
      query.community = community;
    }

    if (postType) {
      query.postType = postType;
    }

    if (author) {
      query.author = author;
    }

    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'name profileImage city bikeType')
      .populate('community', 'name city bikeType')
      .populate('comments.author', 'name profileImage')
      .populate('likes.user', 'name profileImage')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profileImage city bikeType')
      .populate('community', 'name city bikeType')
      .populate('comments.author', 'name profileImage')
      .populate('likes.user', 'name profileImage');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be 1-2000 characters'),
  body('community').isMongoId().withMessage('Valid community ID is required'),
  body('postType').optional().isIn(['text', 'image', 'ride_experience', 'event_update', 'general']).withMessage('Invalid post type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      content,
      community,
      images,
      postType,
      tags,
      rideDetails
    } = req.body;

    // Check if community exists and user is a member
    const communityDoc = await Community.findById(community);
    if (!communityDoc) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const isMember = communityDoc.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member of the community to post' });
    }

    const post = new Post({
      author: req.user._id,
      community,
      content,
      images: images || [],
      postType: postType || 'text',
      tags: tags || [],
      rideDetails: rideDetails || {}
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name profileImage city bikeType')
      .populate('community', 'name city bikeType');

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    // Validate post ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already liked - use consistent user ID
    const userId = req.user.id || req.user._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User authentication failed' });
    }

    const existingLike = post.likes.find(
      like => like.user && like.user.toString() === userId.toString()
    );

    if (existingLike) {
      // Unlike the post
      post.likes = post.likes.filter(
        like => like.user && like.user.toString() !== userId.toString()
      );
      await post.save();
      res.json({ success: true, message: 'Post unliked', liked: false, likeCount: post.likes.length });
    } else {
      // Like the post
      post.likes.push({
        user: userId,
        likedAt: new Date()
      });
      await post.save();
      res.json({ success: true, message: 'Post liked', liked: true, likeCount: post.likes.length });
    }
  } catch (error) {
    console.error('Like post error:', error.message, error.stack);
    
    // Handle specific errors
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    res.status(500).json({ message: 'Failed to like post. Please try again.' });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add comment to a post
// @access  Private
router.post('/:id/comment', protect, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid comment data',
        errors: errors.array() 
      });
    }

    // Validate post ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { content } = req.body;
    
    // Use consistent user ID (fixed: was using _id which doesn't exist)
    const userId = req.user.id || req.user._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User authentication failed' });
    }

    // Sanitize content
    const sanitizedContent = content.trim();
    
    if (!sanitizedContent) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    post.comments.push({
      author: userId,
      content: sanitizedContent,
      createdAt: new Date()
    });

    await post.save();

    // Populate and return updated post
    const populatedPost = await Post.findById(post._id)
      .populate('comments.author', 'name profileImage');

    res.json({
      success: true,
      message: 'Comment added successfully',
      post: populatedPost,
      commentCount: post.comments.length
    });
  } catch (error) {
    console.error('Add comment error:', error.message, error.stack);
    
    // Handle specific errors
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to add comment. Please try again.' });
  }
});

// @route   POST /api/posts/:id/comments/:commentId/like
// @desc    Like/unlike a comment
// @access  Private
router.post('/:id/comments/:commentId/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if already liked
    const existingLike = comment.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike the comment
      comment.likes = comment.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
      await post.save();
      res.json({ message: 'Comment unliked', liked: false });
    } else {
      // Like the comment
      comment.likes.push({
        user: req.user._id,
        likedAt: new Date()
      });
      await post.save();
      res.json({ message: 'Comment liked', liked: true });
    }
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post (author only)
// @access  Private
router.put('/:id', protect, [
  body('content').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be 1-2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the author can update this post' });
    }

    const { content, images, tags, rideDetails } = req.body;
    const updateData = {};

    if (content) updateData.content = content;
    if (images) updateData.images = images;
    if (tags) updateData.tags = tags;
    if (rideDetails) updateData.rideDetails = rideDetails;

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name profileImage city bikeType')
     .populate('community', 'name city bikeType')
     .populate('comments.author', 'name profileImage')
     .populate('likes.user', 'name profileImage');

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post (author only)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the author can delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

