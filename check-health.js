import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';
import Community from './server/models/Community.js';
import Event from './server/models/Event.js';
import Post from './server/models/Post.js';
import Route from './server/models/Route.js';
import BlogPost from './server/models/BlogPost.js';
import SuccessStory from './server/models/SuccessStory.js';
import ContactMessage from './server/models/ContactMessage.js';

dotenv.config();

async function checkHealth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count documents
    const [users, communities, events, posts, routes, blogs, stories, contacts] = await Promise.all([
      User.countDocuments(),
      Community.countDocuments(),
      Event.countDocuments(),
      Post.countDocuments(),
      Route.countDocuments(),
      BlogPost.countDocuments(),
      SuccessStory.countDocuments(),
      ContactMessage.countDocuments()
    ]);

    console.log('📊 DATABASE STATUS:\n');
    console.log('  Users:', users);
    console.log('  Communities:', communities);
    console.log('  Events:', events);
    console.log('  Posts:', posts);
    console.log('  Routes:', routes);
    console.log('  Blog Posts:', blogs);
    console.log('  Success Stories:', stories);
    console.log('  Contact Messages:', contacts);
    console.log('\n  Total Documents:', users + communities + events + posts + routes + blogs + stories + contacts);

    // Check sample user
    const sampleUser = await User.findOne().select('name email joinedCommunities');
    console.log('\n👤 SAMPLE USER CHECK:');
    console.log('  Name:', sampleUser.name);
    console.log('  Email:', sampleUser.email);
    console.log('  Joined Communities:', sampleUser.joinedCommunities?.length || 0);

    // Check sample community
    const sampleCommunity = await Community.findOne().select('name members');
    console.log('\n🏘️ SAMPLE COMMUNITY CHECK:');
    console.log('  Name:', sampleCommunity.name);
    console.log('  Members:', sampleCommunity.members?.length || 0);

    // Check membership sync
    console.log('\n🔄 MEMBERSHIP SYNC CHECK:');
    const userWithCommunities = await User.findOne({ joinedCommunities: { $exists: true, $ne: [] } });
    if (userWithCommunities) {
      console.log('  ✅ Users have communities in joinedCommunities');
      const communityId = userWithCommunities.joinedCommunities[0];
      const community = await Community.findById(communityId);
      const isMember = community.members.some(m => m.user.toString() === userWithCommunities._id.toString());
      console.log('  ✅ Community has user in members:', isMember);
    } else {
      console.log('  ⚠️ No users with communities found');
    }

    // Check indexes
    console.log('\n📇 INDEXES CHECK:');
    const userIndexes = await User.collection.getIndexes();
    const communityIndexes = await Community.collection.getIndexes();
    console.log('  User indexes:', Object.keys(userIndexes).length);
    console.log('  Community indexes:', Object.keys(communityIndexes).length);

    console.log('\n✅ Database is healthy!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkHealth();

