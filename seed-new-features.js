import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Route from './server/models/Route.js';
import BlogPost from './server/models/BlogPost.js';
import SuccessStory from './server/models/SuccessStory.js';
import ContactMessage from './server/models/ContactMessage.js';
import User from './server/models/User.js';

dotenv.config();

// Sample data for Popular Routes
const routesData = [
  {
    title: "Delhi to Leh Ladakh - The Ultimate Journey",
    description: "Experience the most iconic motorcycle route in India. Journey through high mountain passes, pristine lakes, and breathtaking landscapes.",
    startLocation: { name: "Delhi", coordinates: { lat: 28.6139, lng: 77.2090 } },
    endLocation: { name: "Leh", coordinates: { lat: 34.1526, lng: 77.5771 } },
    waypoints: [
      { name: "Manali", description: "Gateway to Ladakh", type: "rest" },
      { name: "Rohtang Pass", description: "High altitude pass", type: "scenic" },
      { name: "Jispa", description: "Scenic camping spot", type: "rest" },
      { name: "Sarchu", description: "Rest point", type: "rest" },
      { name: "Pang", description: "High altitude plateau", type: "rest" }
    ],
    distance: 1050,
    difficulty: "Hard",
    terrain: "mountain",
    bestSeason: ["Summer", "Autumn"],
    images: [
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
      "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800"
    ],
    isFeatured: true,
    tags: ["leh", "ladakh", "himalaya", "adventure"]
  },
  {
    title: "Chandigarh to Shimla - Weekend Escape",
    description: "Perfect weekend ride through pine forests and colonial hill towns. Enjoy winding roads and cool mountain breeze.",
    startLocation: { name: "Chandigarh", coordinates: { lat: 30.7333, lng: 76.7794 } },
    endLocation: { name: "Shimla", coordinates: { lat: 31.1048, lng: 77.1734 } },
    waypoints: [
      { name: "Pinjore", description: "Mughal Gardens", type: "scenic" },
      { name: "Kalka", description: "Railway town", type: "rest" },
      { name: "Solan", description: "Mushroom city", type: "food" }
    ],
    distance: 120,
    difficulty: "Easy",
    terrain: "mountain",
    bestSeason: ["Spring", "Summer", "Autumn"],
    images: [
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800"
    ],
    isFeatured: true,
    tags: ["shimla", "weekend", "hills", "scenic"]
  },
  {
    title: "Jaipur to Jodhpur - Desert Highway",
    description: "Cruise through Rajasthan's desert landscape, visiting majestic forts and experiencing royal heritage.",
    startLocation: { name: "Jaipur", coordinates: { lat: 26.9124, lng: 75.7873 } },
    endLocation: { name: "Jodhpur", coordinates: { lat: 26.2389, lng: 73.0243 } },
    waypoints: [
      { name: "Ajmer", description: "Sufi pilgrimage center", type: "rest" },
      { name: "Pushkar", description: "Holy lake town", type: "scenic" }
    ],
    distance: 340,
    difficulty: "Medium",
    terrain: "highway",
    bestSeason: ["Winter", "Spring"],
    images: [
      "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800"
    ],
    isFeatured: true,
    tags: ["rajasthan", "desert", "heritage", "forts"]
  }
];

// Sample Blog Posts
const blogData = [
  {
    title: "Essential Pre-Monsoon Bike Maintenance Checklist",
    slug: "pre-monsoon-bike-maintenance",
    content: "As monsoon approaches, it's crucial to prepare your bike for wet conditions. Here's a comprehensive checklist to keep your ride safe and smooth...",
    excerpt: "Get your bike monsoon-ready with these essential maintenance tips.",
    categories: ["Maintenance", "Tips"],
    tags: ["monsoon", "maintenance", "safety", "checklist"],
    coverImage: "https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800",
    featured: true
  },
  {
    title: "Top 10 Hidden Motorcycle Routes in Himachal Pradesh",
    slug: "hidden-routes-himachal",
    content: "Discover lesser-known routes in Himachal that offer stunning views without the tourist crowds. These hidden gems are perfect for adventure seekers...",
    excerpt: "Explore Himachal's secret routes that most tourists miss.",
    categories: ["Routes", "Travel"],
    tags: ["himachal", "hidden gems", "adventure", "offbeat"],
    coverImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    featured: true
  },
  {
    title: "Choosing the Right Riding Gear for Indian Climate",
    slug: "riding-gear-indian-climate",
    content: "India's diverse climate zones require different riding gear. Learn how to choose the perfect gear for each season and region...",
    excerpt: "Complete guide to selecting riding gear suited for India's weather.",
    categories: ["Gear", "Tips"],
    tags: ["gear", "safety", "riding gear", "climate"],
    coverImage: "https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800",
    featured: false
  }
];

// Sample Success Stories
const storiesData = [
  {
    title: "From Office Worker to Adventure Rider: My Leh Journey",
    story: "I never thought I'd ride to Leh. As a 9-to-5 desk worker, the idea seemed impossible. But after joining RiderConnect and meeting fellow riders, everything changed. We planned for 6 months, trained together, and finally made the journey. The Rohtang Pass was challenging, but the support from my riding group kept me going. Standing at Khardung La, I realized that with the right community, anything is possible!",
    rideDetails: {
      from: "Delhi",
      to: "Leh",
      distance: 1050,
      duration: "12 days",
      bike: "Royal Enfield Himalayan"
    },
    category: "Long Distance",
    images: [
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
      "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800"
    ],
    isApproved: true,
    isFeatured: true,
    tags: ["leh", "ladakh", "first-time", "adventure"]
  },
  {
    title: "Meeting My Best Friend Through a Community Ride",
    story: "It was just another weekend ride organized by the Delhi Riders community. Little did I know, I'd meet someone who would become my riding partner for life. We bonded over our love for Royal Enfields and have now completed 15 rides together across North India. RiderConnect didn't just give me rides, it gave me lifelong friendships!",
    rideDetails: {
      from: "Delhi",
      to: "Agra",
      distance: 230,
      duration: "2 days",
      bike: "Royal Enfield Classic 350"
    },
    category: "Group Ride",
    images: [
      "https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800"
    ],
    isApproved: true,
    tags: ["friendship", "community", "group-ride"]
  },
  {
    title: "First Solo Ride at 45: Breaking Stereotypes",
    story: "Age is just a number. At 45, I decided to get my bike license and go on my first solo trip. Thanks to the supportive RiderConnect community, I conquered my fears and rode solo from Chandigarh to Spiti Valley. The encouragement from fellow riders, especially the 'Women Riders' community, was incredible. Now I inspire others that it's never too late to start!",
    rideDetails: {
      from: "Chandigarh",
      to: "Spiti Valley",
      distance: 420,
      duration: "7 days",
      bike: "Honda CB350"
    },
    category: "Solo Ride",
    images: [
      "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800"
    ],
    isApproved: true,
    isFeatured: true,
    tags: ["solo-ride", "inspiration", "women-riders", "age-no-bar"]
  }
];

// Sample Contact Messages (for demo)
const contactData = [
  {
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "+91 98765 43210",
    subject: "Partnership Opportunity",
    message: "I represent a motorcycle gear company and would like to explore partnership opportunities with RiderConnect. We offer premium riding gear and are interested in collaborating.",
    type: "Partnership",
    status: "New"
  },
  {
    name: "Priya Singh",
    email: "priya@example.com",
    phone: "+91 87654 32109",
    subject: "Great Platform!",
    message: "Just wanted to say thank you for creating such an amazing platform. I've met wonderful riders through RiderConnect! The community is supportive and the events are well-organized.",
    type: "Feedback",
    status: "New"
  },
  {
    name: "Amit Sharma",
    email: "amit@example.com",
    subject: "Bug Report",
    message: "I noticed a minor issue on the events page. When filtering by date, sometimes the results don't update properly. Otherwise, great app!",
    type: "Bug Report",
    status: "New"
  }
];

async function seedNewFeatures() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🚀 Connected to MongoDB');

    // Get a sample user for creator/author fields
    const sampleUser = await User.findOne();
    if (!sampleUser) {
      console.log('❌ No users found. Please run the main seed script first!');
      process.exit(1);
    }

    console.log('\n📊 Seeding new features data...\n');

    // 1. Seed Popular Routes
    console.log('🛣️  Seeding Popular Routes...');
    await Route.deleteMany({});
    const routes = await Route.insertMany(
      routesData.map(route => ({
        ...route,
        creator: sampleUser._id
      }))
    );
    console.log(`✅ Created ${routes.length} routes`);

    // 2. Seed Blog Posts
    console.log('\n📝 Seeding Blog Posts...');
    await BlogPost.deleteMany({});
    const blogs = await BlogPost.insertMany(
      blogData.map(blog => ({
        ...blog,
        author: sampleUser._id,
        publishedAt: new Date()
      }))
    );
    console.log(`✅ Created ${blogs.length} blog posts`);

    // 3. Seed Success Stories
    console.log('\n🌟 Seeding Success Stories...');
    await SuccessStory.deleteMany({});
    const stories = await SuccessStory.insertMany(
      storiesData.map(story => ({
        ...story,
        user: sampleUser._id
      }))
    );
    console.log(`✅ Created ${stories.length} success stories`);

    // 4. Seed Contact Messages
    console.log('\n📧 Seeding Contact Messages...');
    await ContactMessage.deleteMany({});
    const contacts = await ContactMessage.insertMany(contactData);
    console.log(`✅ Created ${contacts.length} contact messages`);

    console.log('\n🎉 NEW FEATURES DATA SEEDED SUCCESSFULLY!\n');
    console.log('📊 Summary:');
    console.log(`   Routes: ${routes.length}`);
    console.log(`   Blog Posts: ${blogs.length}`);
    console.log(`   Success Stories: ${stories.length}`);
    console.log(`   Contact Messages: ${contacts.length}`);
    console.log('\n✨ All backend-connected pages now have data!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedNewFeatures();

