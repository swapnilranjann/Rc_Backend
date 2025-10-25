import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';
import Message from './server/models/Message.js';
import Notification from './server/models/Notification.js';
import Event from './server/models/Event.js';
import Community from './server/models/Community.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bike-community';

async function seedMessagesAndNotifications() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get existing users
    const users = await User.find().limit(5);
    if (users.length < 2) {
      console.error('❌ Not enough users in database. Run seed-enhanced.js first!');
      process.exit(1);
    }

    console.log(`Found ${users.length} users`);

    // Clear existing messages and notifications
    console.log('🗑️  Clearing existing messages and notifications...');
    await Message.deleteMany({});
    await Notification.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create sample messages - North India themed
    console.log('💬 Creating messages...');
    const messages = [
      {
        sender: users[1]._id,
        recipient: users[0]._id,
        content: 'Hey! Are you joining the Manali ride next week?',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        sender: users[0]._id,
        recipient: users[1]._id,
        content: 'Yes! Already packed. Can\'t wait for Rohtang Pass! 🏔️',
        read: true,
        readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000)
      },
      {
        sender: users[1]._id,
        recipient: users[0]._id,
        content: 'Perfect! Let\'s meet at India Gate at 5 AM sharp.',
        read: true,
        readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        sender: users[2]._id,
        recipient: users[0]._id,
        content: 'Bro, do you have contact for good panniers? Planning Leh trip.',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        sender: users[3]._id,
        recipient: users[0]._id,
        content: 'Interested in Jaipur heritage ride this weekend?',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        sender: users[0]._id,
        recipient: users[2]._id,
        content: 'Check out Desi Rides store in Lajpat Nagar. Great panniers!',
        read: true,
        readAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        sender: users[2]._id,
        recipient: users[0]._id,
        content: 'Thanks man! Will check it out tomorrow.',
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 mins ago
      }
    ];

    const createdMessages = await Message.insertMany(messages);
    console.log(`✅ Created ${createdMessages.length} messages`);

    // Get some events and communities for notifications
    const events = await Event.find().limit(3);
    const communities = await Community.find().limit(3);

    // Create sample notifications - North India themed
    console.log('🔔 Creating notifications...');
    const notifications = [
      {
        recipient: users[0]._id,
        sender: users[1]._id,
        type: 'follow',
        title: 'New Follower',
        message: 'Naina Kapoor started following you',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        recipient: users[0]._id,
        sender: users[2]._id,
        type: 'comment',
        title: 'New Comment',
        message: 'Rohit Chauhan commented on your Manali ride post',
        link: '/posts/123',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        recipient: users[0]._id,
        sender: users[3]._id,
        type: 'like',
        title: 'Post Liked',
        message: 'Simran Kaur liked your post about Rohtang Pass',
        link: '/posts/123',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        recipient: users[0]._id,
        type: 'event',
        title: 'Event Reminder',
        message: 'Delhi to Manali Weekend Expedition starts in 7 days!',
        link: '/events',
        relatedEvent: events[0]?._id,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        recipient: users[0]._id,
        sender: users[1]._id,
        type: 'community',
        title: 'Community Invite',
        message: 'You were added to Himalayan Riders Club',
        link: '/communities',
        relatedCommunity: communities[1]?._id,
        read: true,
        readAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        recipient: users[0]._id,
        type: 'system',
        title: 'Profile Views',
        message: 'Your profile was viewed 15 times this week! 🔥',
        link: '/profile',
        read: true,
        readAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        recipient: users[0]._id,
        sender: users[4]._id,
        type: 'event',
        title: 'Event Joined',
        message: 'Vikram Rathore joined your Chandigarh to Kasauli ride',
        link: '/events',
        relatedEvent: events[1]?._id,
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 mins ago
      }
    ];

    const createdNotifications = await Notification.insertMany(notifications);
    console.log(`✅ Created ${createdNotifications.length} notifications`);

    console.log('\n🎉 Messages and Notifications seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Messages: ${createdMessages.length}`);
    console.log(`   Notifications: ${createdNotifications.length}`);
    console.log(`   Unread Messages: ${messages.filter(m => !m.read).length}`);
    console.log(`   Unread Notifications: ${notifications.filter(n => !n.read).length}`);

    console.log('\n👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedMessagesAndNotifications();

