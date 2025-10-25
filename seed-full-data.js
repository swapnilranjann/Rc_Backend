import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';
import Community from './server/models/Community.js';
import Event from './server/models/Event.js';
import Post from './server/models/Post.js';
import Message from './server/models/Message.js';
import Notification from './server/models/Notification.js';

dotenv.config();

// Unsplash random motorcycle images
const getMotorcycleImage = (id) => `https://images.unsplash.com/photo-${id}?w=800&h=600&fit=crop`;
const getUserAvatar = (id) => `https://i.pravatar.cc/150?img=${id}`;

const users = [
  {
    name: 'Arjun Singh',
    email: 'arjun@example.com',
    googleId: 'google_arjun_singh_123',
    authProvider: 'google',
    city: 'Delhi',
    bikeType: 'Royal Enfield',
    bikeModel: 'Himalayan',
    bio: 'Long distance tourer | Himalayan explorer | Delhi NCR rides',
    profileImage: getUserAvatar(11),
    role: 'user'
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    googleId: 'google_priya_sharma_456',
    authProvider: 'google',
    city: 'Chandigarh',
    bikeType: 'KTM',
    bikeModel: 'Duke 390',
    bio: 'Weekend warrior | Track enthusiast | Punjab rides',
    profileImage: getUserAvatar(45),
    role: 'user'
  },
  {
    name: 'Vikram Rathore',
    email: 'vikram@example.com',
    googleId: 'google_vikram_rathore_789',
    authProvider: 'google',
    city: 'Jaipur',
    bikeType: 'Bajaj',
    bikeModel: 'Dominar 400',
    bio: 'Desert storm rider | Royal city explorer',
    profileImage: getUserAvatar(12),
    role: 'user'
  },
  {
    name: 'Simran Kaur',
    email: 'simran@example.com',
    googleId: 'google_simran_kaur_101',
    authProvider: 'google',
    city: 'Amritsar',
    bikeType: 'Royal Enfield',
    bikeModel: 'Classic 350',
    bio: 'Golden Temple to Leh Ladakh | Spiritual rides',
    profileImage: getUserAvatar(47),
    role: 'user'
  },
  {
    name: 'Rohit Chauhan',
    email: 'rohit@example.com',
    googleId: 'google_rohit_chauhan_202',
    authProvider: 'google',
    city: 'Lucknow',
    bikeType: 'Honda',
    bikeModel: 'CB650R',
    bio: 'Sport bike enthusiast | UP touring',
    profileImage: getUserAvatar(13),
    role: 'user'
  },
  {
    name: 'Naina Kapoor',
    email: 'naina@example.com',
    googleId: 'google_naina_kapoor_303',
    authProvider: 'google',
    city: 'Chandigarh',
    bikeType: 'KTM',
    bikeModel: 'Duke 390',
    bio: 'Passionate about hill station rides | Adventure seeker',
    profileImage: getUserAvatar(48),
    role: 'user'
  },
  {
    name: 'Karan Malhotra',
    email: 'karan@example.com',
    googleId: 'google_karan_malhotra_404',
    authProvider: 'google',
    city: 'Delhi',
    bikeType: 'Yamaha',
    bikeModel: 'R15 V4',
    bio: 'Track days | Speed lover | Delhi rides',
    profileImage: getUserAvatar(14),
    role: 'user'
  },
  {
    name: 'Anjali Verma',
    email: 'anjali@example.com',
    googleId: 'google_anjali_verma_505',
    authProvider: 'google',
    city: 'Jaipur',
    bikeType: 'TVS',
    bikeModel: 'Apache RR 310',
    bio: 'Desert adventures | Heritage city tours',
    profileImage: getUserAvatar(49),
    role: 'user'
  }
];

const communitiesData = [
  {
    name: 'Delhi NCR Riders',
    description: 'Largest riding community in Delhi NCR. Weekly rides, track days, and social meetups.',
    city: 'Delhi',
    bikeType: 'All Types',
    coverImage: getMotorcycleImage('1558618666-39ebaa4f628d'),
    rules: ['Safety first', 'Respect traffic rules', 'Help fellow riders'],
    isPublic: true,
    tags: ['city-rides', 'weekend', 'track-days']
  },
  {
    name: 'Himalayan Riders Club',
    description: 'For riders who love the mountains. Leh Ladakh, Spiti, Manali - we do it all!',
    city: 'Chandigarh',
    bikeType: 'Royal Enfield',
    coverImage: getMotorcycleImage('1558615445-f2f8bc700a6a'),
    rules: ['Experienced riders only', 'Proper gear mandatory', 'Environmental responsibility'],
    isPublic: true,
    tags: ['adventure', 'mountains', 'long-distance']
  },
  {
    name: 'Punjab Riders Association',
    description: 'Connecting riders across Punjab. Food, culture, and epic rides!',
    city: 'Amritsar',
    bikeType: 'All Types',
    coverImage: getMotorcycleImage('1525421894-a8db8a9b4d20'),
    rules: ['Ride together, stay together', 'Promote local tourism', 'Safety gear required'],
    isPublic: true,
    tags: ['regional', 'food', 'culture']
  },
  {
    name: 'Rajasthan Desert Riders',
    description: 'Desert storms and heritage rides. Experience the royal way of riding.',
    city: 'Jaipur',
    bikeType: 'All Types',
    coverImage: getMotorcycleImage('1558618563-2f51207f6c06'),
    rules: ['Desert riding experience needed', 'Carry extra water', 'Navigate sandstorms safely'],
    isPublic: true,
    tags: ['desert', 'heritage', 'adventure']
  },
  {
    name: 'Royal Enfield Club Delhi',
    description: 'Exclusively for Royal Enfield owners. Classic rides, vintage meets, and more.',
    city: 'Delhi',
    bikeType: 'Royal Enfield',
    coverImage: getMotorcycleImage('1558615578-d7a5d8c46f4e'),
    rules: ['RE bikes only', 'Maintain your classic', 'Respect the heritage'],
    isPublic: true,
    tags: ['royal-enfield', 'vintage', 'classics']
  },
  {
    name: 'KTM Warriors North India',
    description: 'For KTM enthusiasts. Track days, performance rides, and technical workshops.',
    city: 'Chandigarh',
    bikeType: 'KTM',
    coverImage: getMotorcycleImage('1558617372-13e94f16df09'),
    rules: ['KTM bikes preferred', 'Track safety gear required', 'Performance riding skills'],
    isPublic: true,
    tags: ['ktm', 'track', 'performance']
  }
];

const eventsData = [
  {
    title: 'Delhi to Manali Highway Ride',
    description: 'Epic highway ride to the mountains. Stop at Murthal for breakfast, reach Manali by evening.',
    eventType: 'Ride',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    startTime: '05:00 AM',
    endTime: '08:00 PM',
    location: { name: 'India Gate', address: 'Rajpath, India Gate, New Delhi, Delhi 110001', coordinates: { lat: 28.6129, lng: 77.2295 } },
    difficulty: 'Medium',
    distance: 550,
    maxParticipants: 25,
    coverImage: getMotorcycleImage('1558619786-78c69a6fce2e'),
    requirements: ['Valid license', 'Helmet', 'Bike in good condition', 'Fuel for 600km']
  },
  {
    title: 'Leh Ladakh Expedition 2025',
    description: '15-day expedition to the land of high passes. Khardung La, Pangong Lake, Nubra Valley.',
    eventType: 'Tour',
    eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    startTime: '06:00 AM',
    endTime: '06:00 PM',
    location: { name: 'Manali', address: 'Mall Road, Manali, Himachal Pradesh 175131', coordinates: { lat: 32.2432, lng: 77.1892 } },
    difficulty: 'Hard',
    distance: 3500,
    maxParticipants: 15,
    coverImage: getMotorcycleImage('1558621845-37e6ed0b97f3'),
    requirements: ['Experienced rider', 'Royal Enfield or similar', 'Camping gear', 'Medical clearance']
  },
  {
    title: 'Amritsar Heritage Ride',
    description: 'Cultural ride through Punjab. Golden Temple, Wagah Border, and local food stops.',
    eventType: 'Meetup',
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    startTime: '08:00 AM',
    endTime: '06:00 PM',
    location: { name: 'Golden Temple', address: 'Golden Temple Rd, Atta Mandi, Katra Ahluwalia, Amritsar, Punjab 143006', coordinates: { lat: 31.6200, lng: 74.8765 } },
    difficulty: 'Easy',
    distance: 120,
    maxParticipants: 40,
    coverImage: getMotorcycleImage('1558619655-ca88a9fb2155'),
    requirements: ['All bikes welcome', 'Helmet mandatory', 'Respect local culture']
  },
  {
    title: 'Jaipur Night Ride',
    description: 'Experience the Pink City under the stars. City Palace, Hawa Mahal, Jal Mahal illuminated.',
    eventType: 'Ride',
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    startTime: '07:00 PM',
    endTime: '11:00 PM',
    location: { name: 'Hawa Mahal', address: 'Hawa Mahal Rd, Badi Choupad, J.D.A. Market, Pink City, Jaipur, Rajasthan 302002', coordinates: { lat: 26.9239, lng: 75.8267 } },
    difficulty: 'Easy',
    distance: 50,
    maxParticipants: 30,
    coverImage: getMotorcycleImage('1558621018-df4e3a4d5c04'),
    requirements: ['Night riding experience', 'Working headlights', 'Reflective gear']
  },
  {
    title: 'Spiti Valley Adventure',
    description: 'Remote mountain valleys, ancient monasteries, and challenging terrain. 10-day journey.',
    eventType: 'Tour',
    eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    startTime: '06:00 AM',
    endTime: '07:00 PM',
    location: { name: 'Shimla', address: 'Mall Road, Shimla, Himachal Pradesh 171001', coordinates: { lat: 31.1048, lng: 77.1734 } },
    difficulty: 'Hard',
    distance: 2800,
    maxParticipants: 12,
    coverImage: getMotorcycleImage('1558620811-c08a84bcb16f'),
    requirements: ['Off-road experience', 'Adventure bike', 'Survival gear', 'Medical kit']
  },
  {
    title: 'Chandigarh Breakfast Ride',
    description: 'Early morning ride to Kasauli. Breakfast at a hilltop cafe, back by noon.',
    eventType: 'Meetup',
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    startTime: '05:30 AM',
    endTime: '12:00 PM',
    location: { name: 'Rock Garden', address: 'Uttar Marg, Sector 1, Chandigarh, 160001', coordinates: { lat: 30.7517, lng: 76.8070 } },
    difficulty: 'Easy',
    distance: 140,
    maxParticipants: 20,
    coverImage: getMotorcycleImage('1558622151-5e9b8e5c9c37'),
    requirements: ['All riders welcome', 'Helmet', 'Breakfast money']
  }
];

const postsData = [
  {
    content: 'Just completed an epic ride to Manali! 🏔️ Crossed Rohtang Pass, weather was perfect. The Himalayas never disappoint! Sharing some amazing pics from the journey. #HimalayanRide #RohtangPass',
    images: [
      getMotorcycleImage('1558618666-39ebaa4f628d'),
      getMotorcycleImage('1558618563-2f51207f6c06')
    ]
  },
  {
    content: 'Looking for riding buddies for Leh Ladakh trip in June! 🏍️ Planning a 10-day expedition. Anyone interested? Let\'s make this happen! DM me for details. #LehLadakh #RidingBuddies',
    images: [getMotorcycleImage('1558621845-37e6ed0b97f3')]
  },
  {
    content: 'Desert camping ride to Jaisalmer planned for next month! 🏜️ Sand dunes, starry nights, and endless roads. Join us! 25+ riders already confirmed. #DesertRide #Jaisalmer',
    images: [
      getMotorcycleImage('1558617372-13e94f16df09'),
      getMotorcycleImage('1558615578-d7a5d8c46f4e')
    ]
  },
  {
    content: 'Just upgraded my bike for long distance touring! 💪 Added panniers, crash guards, and auxiliary lights. Ready for the Golden Temple to Leh ride! What modifications do you suggest? #BikeUpgrade',
    images: [getMotorcycleImage('1558619786-78c69a6fce2e')]
  },
  {
    content: 'Best chai stop on Delhi-Chandigarh highway! ☕ This place near Karnal serves amazing pakoras too. Must stop for all riders heading north. Drop location in comments! #RiderPitStop',
    images: [getMotorcycleImage('1558620811-c08a84bcb16f')]
  },
  {
    content: 'Morning ride to Kasauli was beautiful! 🌄 The winding roads, misty mountains, and cool breeze. This is why we ride! Back home before lunch. Perfect Sunday! #MorningRide #Kasauli',
    images: [
      getMotorcycleImage('1558619655-ca88a9fb2155'),
      getMotorcycleImage('1558621018-df4e3a4d5c04')
    ]
  },
  {
    content: 'Conducted a free bike maintenance workshop today! 🔧 40+ riders learned basic maintenance, chain cleaning, and safety checks. Knowledge sharing is caring! #BikeWorkshop #MaintenanceTips',
    images: [getMotorcycleImage('1558622151-5e9b8e5c9c37')]
  },
  {
    content: 'Night ride through Jaipur was magical! ✨ The illuminated palaces, empty roads, and cool desert air. Pink City is even more beautiful at night! Who\'s joining next week? #NightRide #Jaipur',
    images: [getMotorcycleImage('1558615445-f2f8bc700a6a')]
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding with full data...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bike-community');
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Community.deleteMany({});
    await Event.deleteMany({});
    await Post.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create users
    const createdUsers = await User.insertMany(users);
    console.log(`✓ Created ${createdUsers.length} users`);

    // Create communities
    const communities = communitiesData.map((community, index) => ({
      ...community,
      admin: createdUsers[index % createdUsers.length]._id,
      members: [
        { user: createdUsers[index % createdUsers.length]._id, joinedAt: new Date() },
        { user: createdUsers[(index + 1) % createdUsers.length]._id, joinedAt: new Date() },
        { user: createdUsers[(index + 2) % createdUsers.length]._id, joinedAt: new Date() }
      ]
    }));
    const createdCommunities = await Community.insertMany(communities);
    console.log(`✓ Created ${createdCommunities.length} communities`);

    // ⚠️ CRITICAL FIX: Update users' joinedCommunities field
    console.log('🔄 Syncing user memberships...');
    for (let i = 0; i < createdCommunities.length; i++) {
      const community = createdCommunities[i];
      const memberUserIds = community.members.map(m => m.user);
      
      // Add this community to each member's joinedCommunities
      await User.updateMany(
        { _id: { $in: memberUserIds } },
        { $addToSet: { joinedCommunities: community._id } }
      );
    }
    console.log(`✓ Synced memberships for all users`);

    // Create events
    const events = eventsData.map((event, index) => ({
      ...event,
      community: createdCommunities[index % createdCommunities.length]._id,
      organizer: createdUsers[index % createdUsers.length]._id,
      participants: [
        { user: createdUsers[index % createdUsers.length]._id, registeredAt: new Date(), status: 'registered' },
        { user: createdUsers[(index + 1) % createdUsers.length]._id, registeredAt: new Date(), status: 'registered' },
        { user: createdUsers[(index + 2) % createdUsers.length]._id, registeredAt: new Date(), status: 'registered' }
      ]
    }));
    const createdEvents = await Event.insertMany(events);
    console.log(`✓ Created ${createdEvents.length} events`);

    // Create posts
    const posts = postsData.map((post, index) => ({
      ...post,
      author: createdUsers[index % createdUsers.length]._id,
      community: createdCommunities[index % createdCommunities.length]._id,
      likes: [
        { user: createdUsers[(index + 1) % createdUsers.length]._id, likedAt: new Date() },
        { user: createdUsers[(index + 2) % createdUsers.length]._id, likedAt: new Date() }
      ],
      comments: [
        {
          author: createdUsers[(index + 1) % createdUsers.length]._id,
          content: 'Amazing ride! Wish I could join! 🔥',
          createdAt: new Date()
        }
      ]
    }));
    const createdPosts = await Post.insertMany(posts);
    console.log(`✓ Created ${createdPosts.length} posts`);

    // Create messages
    const messages = [
      {
        sender: createdUsers[0]._id,
        recipient: createdUsers[1]._id,
        content: 'Hey! Are you joining the Manali ride next week?'
      },
      {
        sender: createdUsers[1]._id,
        recipient: createdUsers[0]._id,
        content: 'Yes! Already booked leave. Super excited! 🏍️'
      },
      {
        sender: createdUsers[2]._id,
        recipient: createdUsers[3]._id,
        content: 'Can you share the route map for Ladakh trip?'
      }
    ];
    await Message.insertMany(messages);
    console.log(`✓ Created ${messages.length} messages`);

    // Create notifications
    const notifications = [
      {
        recipient: createdUsers[5]._id,
        sender: createdUsers[0]._id,
        type: 'event_invite',
        content: 'invited you to join "Delhi to Manali Highway Ride"',
        link: `/events/${createdEvents[0]._id}`
      },
      {
        recipient: createdUsers[5]._id,
        sender: createdUsers[1]._id,
        type: 'like',
        content: 'liked your post',
        link: `/posts/${createdPosts[0]._id}`
      },
      {
        recipient: createdUsers[5]._id,
        sender: createdUsers[2]._id,
        type: 'comment',
        content: 'commented on your post',
        link: `/posts/${createdPosts[1]._id}`
      }
    ];
    await Notification.insertMany(notifications);
    console.log(`✓ Created ${notifications.length} notifications`);

    // Update user references
    await Promise.all(createdUsers.map(async (user, index) => {
      await User.findByIdAndUpdate(user._id, {
        joinedCommunities: [createdCommunities[index % createdCommunities.length]._id],
        registeredEvents: [createdEvents[index % createdEvents.length]._id]
      });
    }));
    console.log('✓ Updated user references');

    console.log('\n🎉 Database seeded successfully with full data!\n');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${createdUsers.length}`);
    console.log(`   🏘️  Communities: ${createdCommunities.length}`);
    console.log(`   📅 Events: ${createdEvents.length}`);
    console.log(`   📝 Posts: ${createdPosts.length} (with images)`);
    console.log(`   💬 Messages: ${messages.length}`);
    console.log(`   🔔 Notifications: ${notifications.length}`);
    console.log('\n✅ All pages now have data with photos!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);
  }
}

seedDatabase();

