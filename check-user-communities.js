import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';
import Community from './server/models/Community.js';

dotenv.config();

async function checkUserCommunities() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find().select('name email joinedCommunities');
    console.log('👥 Users and their communities:');
    for (const user of users) {
      console.log(`\n${user.name} (${user.email}):`);
      console.log(`  joinedCommunities array: ${JSON.stringify(user.joinedCommunities)}`);
      console.log(`  Count: ${user.joinedCommunities.length}`);
    }

    console.log('\n\n🏘️ All Communities:');
    const communities = await Community.find().select('name members');
    for (const comm of communities) {
      console.log(`\n${comm.name}:`);
      console.log(`  ID: ${comm._id}`);
      console.log(`  Members count: ${comm.members.length}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUserCommunities();

