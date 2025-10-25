import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';
import Community from './server/models/Community.js';

dotenv.config();

async function fixMemberships() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🚀 Connected to MongoDB\n');

    // Get all users and communities
    const users = await User.find();
    const communities = await Community.find();

    console.log(`Found ${users.length} users and ${communities.length} communities\n`);

    let fixed = 0;

    // For each community, ensure members array matches reality
    for (const community of communities) {
      console.log(`\n🏘️ Checking community: ${community.name}`);
      console.log(`   Current members in array: ${community.members.length}`);
      
      // Get all users who have this community in their joinedCommunities
      const usersInCommunity = await User.find({ 
        joinedCommunities: community._id 
      });
      
      console.log(`   Users with community in joinedCommunities: ${usersInCommunity.length}`);
      
      // Rebuild members array
      const memberIds = community.members.map(m => m.user.toString());
      const userIds = usersInCommunity.map(u => u._id.toString());
      
      // Find mismatches
      const missingInMembers = userIds.filter(id => !memberIds.includes(id));
      const missingInUsers = memberIds.filter(id => !userIds.includes(id));
      
      if (missingInMembers.length > 0 || missingInUsers.length > 0) {
        console.log(`   ⚠️ MISMATCH FOUND!`);
        console.log(`      Missing in members array: ${missingInMembers.length}`);
        console.log(`      Missing in user joinedCommunities: ${missingInUsers.length}`);
        
        // Fix: Rebuild members array from users' joinedCommunities
        community.members = usersInCommunity.map(user => ({
          user: user._id,
          joinedAt: new Date()
        }));
        
        await community.save();
        console.log(`   ✅ Fixed! Now has ${community.members.length} members`);
        fixed++;
      } else {
        console.log(`   ✅ Already in sync`);
      }
    }

    console.log(`\n\n🎉 SYNC COMPLETE!`);
    console.log(`   Fixed ${fixed} communities`);
    
    // Show final status
    console.log(`\n📊 FINAL STATUS:`);
    for (const community of communities) {
      const refreshed = await Community.findById(community._id);
      console.log(`   ${refreshed.name}: ${refreshed.members.length} members`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixMemberships();

