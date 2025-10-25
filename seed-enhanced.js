import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';
import Community from './server/models/Community.js';
import Event from './server/models/Event.js';
import Post from './server/models/Post.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bike-community';

// Sample data - Using Google OAuth users (no password needed)
const users = [
  {
    googleId: 'google_' + Date.now() + '_1',
    name: 'Arjun Singh',
    email: 'arjun@example.com',
    city: 'Delhi',
    bikeType: 'Royal Enfield',
    bikeModel: 'Himalayan',
    bio: 'Love exploring Himalayan routes and mountain passes!',
    avatar: 'https://i.pravatar.cc/150?img=12',
    authProvider: 'google',
    isVerified: true
  },
  {
    googleId: 'google_' + Date.now() + '_2',
    name: 'Naina Kapoor',
    email: 'naina@example.com',
    city: 'Chandigarh',
    bikeType: 'KTM',
    bikeModel: 'Duke 390',
    bio: 'Passionate about hill station rides and adventure tours',
    avatar: 'https://i.pravatar.cc/150?img=45',
    authProvider: 'google',
    isVerified: true
  },
  {
    googleId: 'google_' + Date.now() + '_3',
    name: 'Rohit Chauhan',
    email: 'rohit@example.com',
    city: 'Jaipur',
    bikeType: 'Bajaj',
    bikeModel: 'Dominar 400',
    bio: 'Desert rides and heritage exploration enthusiast',
    avatar: 'https://i.pravatar.cc/150?img=33',
    authProvider: 'google',
    isVerified: true
  },
  {
    googleId: 'google_' + Date.now() + '_4',
    name: 'Simran Kaur',
    email: 'simran@example.com',
    city: 'Amritsar',
    bikeType: 'Honda',
    bikeModel: 'CB350',
    bio: 'Love long highway rides and exploring new places',
    avatar: 'https://i.pravatar.cc/150?img=27',
    authProvider: 'google',
    isVerified: true
  },
  {
    googleId: 'google_' + Date.now() + '_5',
    name: 'Vikram Rathore',
    email: 'vikram@example.com',
    city: 'Lucknow',
    bikeType: 'Yamaha',
    bikeModel: 'FZ-S',
    bio: 'Speed lover and weekend rider',
    avatar: 'https://i.pravatar.cc/150?img=51',
    authProvider: 'google',
    isVerified: true
  }
];

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Community.deleteMany({});
    await Event.deleteMany({});
    await Post.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create communities - North India Focus
    console.log('🏘️  Creating communities...');
    const communities = [
      {
        name: 'Delhi NCR Riders',
        description: 'The largest riding community in Delhi NCR. Join us for highway rides and Himalayan tours!',
        city: 'Delhi',
        bikeType: 'All Types',
        admin: createdUsers[0]._id,
        members: [
          { user: createdUsers[0]._id, joinedAt: new Date() },
          { user: createdUsers[1]._id, joinedAt: new Date() },
          { user: createdUsers[2]._id, joinedAt: new Date() }
        ],
        isPublic: true,
        tags: ['highway rides', 'leh ladakh', 'manali'],
        rules: ['Respect all members', 'Safety first', 'Be punctual for group rides']
      },
      {
        name: 'Himalayan Riders Club',
        description: 'For mountain pass enthusiasts. Explore Rohtang, Khardung La, and more!',
        city: 'Chandigarh',
        bikeType: 'Royal Enfield',
        admin: createdUsers[1]._id,
        members: [
          { user: createdUsers[1]._id, joinedAt: new Date() },
          { user: createdUsers[0]._id, joinedAt: new Date() }
        ],
        isPublic: true,
        tags: ['himalayan', 'mountain passes', 'adventure'],
        rules: ['Mountain riding experience required', 'Winter gear mandatory', 'Help fellow riders']
      },
      {
        name: 'Rajasthan Desert Riders',
        description: 'Explore the golden deserts and majestic forts of Rajasthan on two wheels.',
        city: 'Jaipur',
        bikeType: 'All Types',
        admin: createdUsers[2]._id,
        members: [
          { user: createdUsers[2]._id, joinedAt: new Date() },
          { user: createdUsers[3]._id, joinedAt: new Date() },
          { user: createdUsers[4]._id, joinedAt: new Date() }
        ],
        isPublic: true,
        tags: ['desert rides', 'heritage tours', 'weekend getaways'],
        rules: ['Respect heritage sites', 'Carry water', 'Stay hydrated']
      },
      {
        name: 'Punjab Riders Association',
        description: 'Connect with riders from Punjab. Highway cruises and long distance touring.',
        city: 'Amritsar',
        bikeType: 'All Types',
        admin: createdUsers[3]._id,
        members: [
          { user: createdUsers[3]._id, joinedAt: new Date() },
          { user: createdUsers[1]._id, joinedAt: new Date() }
        ],
        isPublic: true,
        tags: ['highway cruising', 'golden temple', 'long distance'],
        rules: ['Safety gear mandatory', 'Respect traffic laws', 'Help each other']
      }
    ];

    const createdCommunities = await Community.insertMany(communities);
    console.log(`✅ Created ${createdCommunities.length} communities`);

    // Update users with joined communities
    await User.findByIdAndUpdate(createdUsers[0]._id, {
      joinedCommunities: [createdCommunities[0]._id, createdCommunities[1]._id]
    });
    await User.findByIdAndUpdate(createdUsers[1]._id, {
      joinedCommunities: [createdCommunities[0]._id, createdCommunities[1]._id, createdCommunities[3]._id]
    });
    await User.findByIdAndUpdate(createdUsers[2]._id, {
      joinedCommunities: [createdCommunities[0]._id, createdCommunities[2]._id]
    });
    await User.findByIdAndUpdate(createdUsers[3]._id, {
      joinedCommunities: [createdCommunities[2]._id]
    });
    await User.findByIdAndUpdate(createdUsers[4]._id, {
      joinedCommunities: [createdCommunities[2]._id, createdCommunities[3]._id]
    });

    // Create events - North India Focus
    console.log('📅 Creating events...');
    const events = [
      {
        title: 'Delhi to Manali Weekend Expedition',
        description: 'Epic 2-day ride to Manali through scenic mountain roads. Experience the beauty of Himachal!',
        organizer: createdUsers[0]._id,
        community: createdCommunities[0]._id,
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        startTime: '05:00',
        endTime: '20:00',
        location: {
          name: 'India Gate',
          address: 'Rajpath, India Gate, New Delhi'
        },
        maxParticipants: 30,
        participants: [
          { user: createdUsers[0]._id, registeredAt: new Date(), status: 'registered' },
          { user: createdUsers[1]._id, registeredAt: new Date(), status: 'registered' },
          { user: createdUsers[2]._id, registeredAt: new Date(), status: 'registered' }
        ],
        eventType: 'Tour',
        difficulty: 'Hard',
        distance: 540,
        isPublic: true,
        isActive: true,
        tags: ['manali', 'himalayan ride', 'weekend tour'],
        requirements: ['Valid license', 'Well-maintained bike', 'Warm clothing', 'Emergency kit']
      },
      {
        title: 'Chandigarh to Kasauli Sunrise Ride',
        description: 'Beautiful hill station ride to Kasauli. Enjoy the sunrise at Mall Road!',
        organizer: createdUsers[1]._id,
        community: createdCommunities[1]._id,
        eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        startTime: '04:30',
        endTime: '11:00',
        location: {
          name: 'Sukhna Lake',
          address: 'Sector 1, Chandigarh'
        },
        maxParticipants: 25,
        participants: [
          { user: createdUsers[1]._id, registeredAt: new Date(), status: 'registered' },
          { user: createdUsers[0]._id, registeredAt: new Date(), status: 'registered' }
        ],
        eventType: 'Ride',
        difficulty: 'Medium',
        distance: 75,
        isPublic: true,
        isActive: true,
        tags: ['sunrise', 'kasauli', 'hill station'],
        requirements: ['Warm clothing', 'Bike lights working', 'Full tank']
      },
      {
        title: 'Jaipur Heritage Ride',
        description: 'Explore the Pink City and nearby forts. Amber Fort, Jal Mahal, and more!',
        organizer: createdUsers[2]._id,
        community: createdCommunities[2]._id,
        eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        startTime: '07:00',
        endTime: '17:00',
        location: {
          name: 'Hawa Mahal',
          address: 'Hawa Mahal Road, Badi Choupad, Jaipur'
        },
        maxParticipants: 35,
        participants: [
          { user: createdUsers[2]._id, registeredAt: new Date(), status: 'registered' },
          { user: createdUsers[3]._id, registeredAt: new Date(), status: 'registered' },
          { user: createdUsers[4]._id, registeredAt: new Date(), status: 'registered' }
        ],
        eventType: 'Ride',
        difficulty: 'Easy',
        distance: 120,
        isPublic: true,
        isActive: true,
        tags: ['heritage', 'jaipur', 'forts'],
        requirements: ['Valid license', 'Camera for photos', 'Water bottle']
      },
      {
        title: 'Royal Enfield Maintenance Workshop',
        description: 'Learn Royal Enfield maintenance from experts. Perfect for Himalayan riders!',
        organizer: createdUsers[1]._id,
        community: createdCommunities[1]._id,
        eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        startTime: '10:00',
        endTime: '14:00',
        location: {
          name: 'RE Service Center',
          address: 'Sector 17, Chandigarh'
        },
        maxParticipants: 20,
        participants: [
          { user: createdUsers[1]._id, registeredAt: new Date(), status: 'registered' },
          { user: createdUsers[0]._id, registeredAt: new Date(), status: 'registered' }
        ],
        eventType: 'Meetup',
        difficulty: 'Easy',
        isPublic: true,
        isActive: true,
        tags: ['maintenance', 'workshop', 'royal enfield'],
        requirements: ['Basic tools', 'Notepad', 'Your bike']
      }
    ];

    const createdEvents = await Event.insertMany(events);
    console.log(`✅ Created ${createdEvents.length} events`);

    // Update users with registered events
    await User.findByIdAndUpdate(createdUsers[0]._id, {
      registeredEvents: [createdEvents[0]._id, createdEvents[2]._id]
    });
    await User.findByIdAndUpdate(createdUsers[1]._id, {
      registeredEvents: [createdEvents[0]._id, createdEvents[2]._id]
    });
    await User.findByIdAndUpdate(createdUsers[2]._id, {
      registeredEvents: [createdEvents[0]._id, createdEvents[1]._id]
    });
    await User.findByIdAndUpdate(createdUsers[3]._id, {
      registeredEvents: [createdEvents[1]._id]
    });

    // Create posts - North India Focus
    console.log('📝 Creating posts...');
    const posts = [
      {
        author: createdUsers[0]._id,
        community: createdCommunities[0]._id,
        content: 'Just completed an epic ride to Manali! Crossed Rohtang Pass, weather was perfect. The Himalayas never disappoint! 🏔️',
        postType: 'ride_experience',
        likes: [
          { user: createdUsers[1]._id, likedAt: new Date() },
          { user: createdUsers[2]._id, likedAt: new Date() }
        ],
        comments: [
          {
            author: createdUsers[1]._id,
            content: 'Wow! How was the road condition after Manali? Planning to go next week.',
            createdAt: new Date()
          }
        ],
        tags: ['manali', 'rohtang pass', 'himalayan ride'],
        rideDetails: {
          distance: 540,
          duration: 12,
          route: 'Delhi -> Chandigarh -> Manali -> Rohtang',
          difficulty: 'Hard',
          weather: 'Cold and clear',
          bikeModel: 'Himalayan'
        }
      },
      {
        author: createdUsers[1]._id,
        community: createdCommunities[1]._id,
        content: 'Looking for riding buddies for Leh Ladakh trip in June! Planning a 10-day expedition. Anyone interested?',
        postType: 'general',
        likes: [
          { user: createdUsers[0]._id, likedAt: new Date() },
          { user: createdUsers[3]._id, likedAt: new Date() }
        ],
        comments: [
          {
            author: createdUsers[0]._id,
            content: 'Count me in! I\'ve been planning Leh for years. Let\'s do this!',
            createdAt: new Date()
          },
          {
            author: createdUsers[3]._id,
            content: 'Interested! What\'s the tentative route?',
            createdAt: new Date()
          }
        ],
        tags: ['leh ladakh', 'expedition', 'himalayan']
      },
      {
        author: createdUsers[2]._id,
        community: createdCommunities[2]._id,
        content: 'Desert camping ride to Jaisalmer planned for next month! Sand dunes, starry nights, and endless roads. Join us! 🏜️',
        postType: 'event_update',
        likes: [
          { user: createdUsers[3]._id, likedAt: new Date() },
          { user: createdUsers[4]._id, likedAt: new Date() }
        ],
        comments: [
          {
            author: createdUsers[4]._id,
            content: 'This sounds incredible! What dates are you planning?',
            createdAt: new Date()
          }
        ],
        tags: ['jaisalmer', 'desert ride', 'camping']
      },
      {
        author: createdUsers[3]._id,
        community: createdCommunities[3]._id,
        content: 'Just upgraded my bike for long distance touring. Added panniers and crash guards. Ready for the Golden Temple to Leh ride! 🙏',
        postType: 'general',
        likes: [
          { user: createdUsers[0]._id, likedAt: new Date() },
          { user: createdUsers[1]._id, likedAt: new Date() }
        ],
        comments: [
          {
            author: createdUsers[1]._id,
            content: 'Which panniers did you get? Looking for recommendations.',
            createdAt: new Date()
          }
        ],
        tags: ['bike modification', 'touring', 'gear']
      }
    ];

    const createdPosts = await Post.insertMany(posts);
    console.log(`✅ Created ${createdPosts.length} posts`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Communities: ${createdCommunities.length}`);
    console.log(`   Events: ${createdEvents.length}`);
    console.log(`   Posts: ${createdPosts.length}`);
    console.log('\n✅ You can now use these credentials to test:');
    console.log('   Email: raj@example.com (or any other user email)');
    console.log('   Note: These are sample users for testing purposes');

    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

