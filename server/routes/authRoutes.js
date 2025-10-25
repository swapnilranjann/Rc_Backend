import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ============================================================================
// GOOGLE OAUTH ONLY - NO TRADITIONAL SIGNUP/LOGIN
// ============================================================================

// @desc    Google OAuth login
// @route   GET /api/auth/google
// @access  Public
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>🔧 Google OAuth Not Configured</h1>
          <p>Please add Google OAuth credentials to .env file</p>
          <p>See <code>GOOGLE-OAUTH-SETUP.md</code> for instructions</p>
          <br>
          <a href="/api/health" style="color: #FF4D00;">Check API Status</a>
        </body>
      </html>
    `);
  }
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })(req, res, next);
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login-failed',
    session: false
  }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Redirect to frontend with token
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendURL}/auth-success.html?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
  }
);

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('joinedCommunities')
      .populate('registeredEvents');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Update user profile (bike info after OAuth)
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, city, bikeType, bikeModel, bio } = req.body;
    
    // Build update object with only provided fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (city !== undefined) updateFields.city = city;
    if (bikeType !== undefined) updateFields.bikeType = bikeType;
    if (bikeModel !== undefined) updateFields.bikeModel = bikeModel;
    if (bio !== undefined) updateFields.bio = bio;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Dev login - Create JWT token for testing (DEVELOPMENT ONLY)
// @route   POST /api/auth/dev-login
// @access  Public (only in development)
router.post('/dev-login', async (req, res) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Dev login is not available in production'
    });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find the user
    const user = await User.findById(userId)
      .populate('joinedCommunities')
      .populate('registeredEvents');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        city: user.city,
        bikeType: user.bikeType,
        bikeModel: user.bikeModel,
        bio: user.bio,
        joinedCommunities: user.joinedCommunities,
        registeredEvents: user.registeredEvents,
        followers: user.followers,
        following: user.following,
        authProvider: user.authProvider,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Dev login error:', error);
    res.status(500).json({
      success: false,
      message: 'Dev login failed',
      error: error.message
    });
  }
});

export default router;
