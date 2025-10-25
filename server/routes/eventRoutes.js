import express from 'express';
import { body, validationResult } from 'express-validator';
import Event from '../models/Event.js';
import Community from '../models/Community.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      city, 
      bikeType, 
      eventType, 
      difficulty, 
      page = 1, 
      limit = 10, 
      search,
      upcoming = true 
    } = req.query;
    
    const query = { isActive: true, isPublic: true };

    if (upcoming === 'true') {
      query.eventDate = { $gte: new Date() };
    }

    if (city) {
      query['location.name'] = { $regex: city, $options: 'i' };
    }

    if (bikeType) {
      query.bikeType = bikeType;
    }

    if (eventType) {
      query.eventType = eventType;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.name': { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name profileImage city bikeType')
      .populate('community', 'name city bikeType')
      .populate('participants.user', 'name profileImage')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ eventDate: 1 });

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name profileImage city bikeType')
      .populate('community', 'name city bikeType')
      .populate('participants.user', 'name profileImage city bikeType');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private
router.post('/', protect, [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('description').trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be 20-1000 characters'),
  body('community').isMongoId().withMessage('Valid community ID is required'),
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  body('location.name').trim().notEmpty().withMessage('Location name is required'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      community,
      eventDate,
      startTime,
      endTime,
      location,
      maxParticipants,
      eventType,
      difficulty,
      distance,
      coverImage,
      requirements,
      tags,
      // Advanced world-class features
      routeDetails,
      costEstimate,
      bikeRequirements,
      timing
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
      return res.status(403).json({ message: 'You must be a member of the community to create events' });
    }

    // Check if event date is in the future
    if (new Date(eventDate) <= new Date()) {
      return res.status(400).json({ message: 'Event date must be in the future' });
    }

    const event = new Event({
      title,
      description,
      organizer: req.user._id,
      community,
      eventDate,
      startTime,
      endTime,
      location,
      maxParticipants: maxParticipants || 50,
      eventType: eventType || 'Ride',
      difficulty: difficulty || 'Easy',
      distance,
      coverImage,
      requirements: requirements || [],
      tags: tags || [],
      // Advanced world-class features
      routeDetails,
      costEstimate,
      bikeRequirements,
      timing
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name profileImage city bikeType')
      .populate('community', 'name city bikeType');

    res.status(201).json({
      message: 'Event created successfully',
      event: populatedEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isActive) {
      return res.status(400).json({ message: 'Event is not active' });
    }

    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if already registered
    const userId = req.user.id || req.user._id;
    const isRegistered = event.participants.some(
      participant => participant.user.toString() === userId.toString() && participant.status === 'registered'
    );

    if (isRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Add user to participants
    event.participants.push({
      user: userId,
      registeredAt: new Date(),
      status: 'registered'
    });

    await event.save();

    // Add event to user's registered events
    await User.findByIdAndUpdate(userId, {
      $addToSet: { registeredEvents: event._id }
    });

    res.json({ message: 'Successfully registered for the event' });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/unregister
// @desc    Unregister from an event
// @access  Private
router.post('/:id/unregister', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove user from participants
    event.participants = event.participants.filter(
      participant => participant.user.toString() !== req.user._id.toString()
    );

    await event.save();

    // Remove event from user's registered events
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { registeredEvents: event._id }
    });

    res.json({ message: 'Successfully unregistered from the event' });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event (organizer only)
// @access  Private
router.put('/:id', protect, [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('description').optional().trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be 20-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can update this event' });
    }

    const {
      title,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      maxParticipants,
      eventType,
      difficulty,
      distance,
      coverImage,
      requirements,
      tags
    } = req.body;

    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (eventDate) updateData.eventDate = eventDate;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (location) updateData.location = location;
    if (maxParticipants) updateData.maxParticipants = maxParticipants;
    if (eventType) updateData.eventType = eventType;
    if (difficulty) updateData.difficulty = difficulty;
    if (distance !== undefined) updateData.distance = distance;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (requirements) updateData.requirements = requirements;
    if (tags) updateData.tags = tags;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('organizer', 'name profileImage city bikeType')
     .populate('community', 'name city bikeType')
     .populate('participants.user', 'name profileImage city bikeType');

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event (organizer only)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can delete this event' });
    }

    // Remove event from all users' registered events
    await User.updateMany(
      { registeredEvents: event._id },
      { $pull: { registeredEvents: event._id } }
    );

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

