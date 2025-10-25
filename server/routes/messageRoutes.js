import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all conversations for current user
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
      .populate('sender', 'name avatar email city')
      .populate('recipient', 'name avatar email city')
      .sort({ createdAt: -1 });

    // Group messages by conversation partner
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const partnerId = msg.sender._id.toString() === userId.toString() 
        ? msg.recipient._id.toString() 
        : msg.sender._id.toString();

      if (!conversationsMap.has(partnerId)) {
        const partner = msg.sender._id.toString() === userId.toString() 
          ? msg.recipient 
          : msg.sender;
        
        conversationsMap.set(partnerId, {
          user: partner,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unread: msg.recipient._id.toString() === userId.toString() && !msg.read ? 1 : 0
        });
      } else if (msg.recipient._id.toString() === userId.toString() && !msg.read) {
        const conv = conversationsMap.get(partnerId);
        conv.unread += 1;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
});

// Get messages with specific user
router.get('/with/:userId', protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ]
    })
      .populate('sender', 'name avatar email')
      .populate('recipient', 'name avatar email')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { sender: otherUserId, recipient: currentUserId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Send a new message
router.post('/send', protect, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Recipient and content are required'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content: content.trim()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar email')
      .populate('recipient', 'name avatar email');

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Mark message as read
router.patch('/:messageId/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only recipient can mark as read
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    message.read = true;
    message.readAt = new Date();
    await message.save();

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
});

// Get unread message count
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
});

export default router;
