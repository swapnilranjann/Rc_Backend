import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/follow/:userId
// @desc    Follow a user
// @access  Private
router.post('/:userId', protect, async (req, res) => {
  try {
    const userIdToFollow = req.params.userId;
    const currentUserId = req.user.id || req.user._id;

    // Validate user ID format
    if (!userIdToFollow.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Can't follow yourself
    if (userIdToFollow === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Check if user to follow exists
    const userToFollow = await User.findById(userIdToFollow);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    const currentUser = await User.findById(currentUserId);
    if (currentUser.following.includes(userIdToFollow)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following list of current user
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: userIdToFollow }
    });

    // Add to followers list of target user
    await User.findByIdAndUpdate(userIdToFollow, {
      $addToSet: { followers: currentUserId }
    });

    res.json({ 
      success: true, 
      message: 'Successfully followed user',
      following: true 
    });
  } catch (error) {
    console.error('Follow user error:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to follow user. Please try again.' });
  }
});

// @route   DELETE /api/follow/:userId
// @desc    Unfollow a user
// @access  Private
router.delete('/:userId', protect, async (req, res) => {
  try {
    const userIdToUnfollow = req.params.userId;
    const currentUserId = req.user.id || req.user._id;

    // Validate user ID format
    if (!userIdToUnfollow.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Remove from following list of current user
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userIdToUnfollow }
    });

    // Remove from followers list of target user
    await User.findByIdAndUpdate(userIdToUnfollow, {
      $pull: { followers: currentUserId }
    });

    res.json({ 
      success: true, 
      message: 'Successfully unfollowed user',
      following: false 
    });
  } catch (error) {
    console.error('Unfollow user error:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to unfollow user. Please try again.' });
  }
});

// @route   GET /api/follow/followers/:userId
// @desc    Get user's followers list
// @access  Private
router.get('/followers/:userId', protect, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate user ID format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId)
      .populate('followers', 'name email profileImage city bikeType bikeModel bio')
      .select('followers');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      followers: user.followers,
      count: user.followers.length
    });
  } catch (error) {
    console.error('Get followers error:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to get followers. Please try again.' });
  }
});

// @route   GET /api/follow/following/:userId
// @desc    Get user's following list
// @access  Private
router.get('/following/:userId', protect, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate user ID format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId)
      .populate('following', 'name email profileImage city bikeType bikeModel bio')
      .select('following');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      following: user.following,
      count: user.following.length
    });
  } catch (error) {
    console.error('Get following error:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to get following. Please try again.' });
  }
});

// @route   GET /api/follow/status/:userId
// @desc    Check if current user is following another user
// @access  Private
router.get('/status/:userId', protect, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id || req.user._id;

    // Validate user ID format
    if (!targetUserId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const currentUser = await User.findById(currentUserId).select('following');
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.some(
      id => id.toString() === targetUserId
    );

    res.json({
      success: true,
      isFollowing
    });
  } catch (error) {
    console.error('Get follow status error:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to check follow status. Please try again.' });
  }
});

export default router;

