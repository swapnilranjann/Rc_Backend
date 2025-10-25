import express from 'express';
import { body, validationResult } from 'express-validator';
import ContactMessage from '../models/ContactMessage.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit a contact message
// @access  Public
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be 5-200 characters'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be 10-1000 characters'),
  body('type').optional().isIn(['General', 'Support', 'Partnership', 'Feedback', 'Bug Report', 'Other']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const contactMessage = new ContactMessage(req.body);
    await contactMessage.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent. We\'ll get back to you soon!'
    });
  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send message. Please try again.' 
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (admin only for now)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      status, 
      type,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query = {};

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    const messages = await ContactMessage.find(query)
      .populate('respondedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await ContactMessage.countDocuments(query);

    res.json({
      success: true,
      messages,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch contact messages' 
    });
  }
});

// @route   PATCH /api/contact/:id/status
// @desc    Update contact message status (admin only)
// @access  Private
router.patch('/:id/status', protect, [
  body('status').isIn(['New', 'In Progress', 'Resolved', 'Closed']).withMessage('Invalid status'),
  body('response').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { status, response } = req.body;
    const userId = req.user.id || req.user._id;

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      {
        status,
        response,
        respondedBy: userId,
        respondedAt: new Date()
      },
      { new: true }
    ).populate('respondedBy', 'name email');

    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: 'Contact message not found' 
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Update contact message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update contact message' 
    });
  }
});

export default router;

