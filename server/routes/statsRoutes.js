import express from 'express';
import User from '../models/User.js';
import Community from '../models/Community.js';
import Event from '../models/Event.js';

const router = express.Router();

// @desc    Get platform statistics
// @route   GET /api/stats
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalCommunities = await Community.countDocuments();
    const totalEvents = await Event.countDocuments();
    
    // Get unique cities count
    const cities = await Community.distinct('city');
    const totalCities = cities.length;
    
    // Get total rides (completed events)
    const completedRides = await Event.countDocuments({
      eventDate: { $lt: new Date() }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCommunities,
        totalEvents,
        totalCities,
        completedRides
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

export default router;

