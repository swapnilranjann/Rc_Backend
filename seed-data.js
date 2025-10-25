const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./server/models/User');
const Community = require('./server/models/Community');
const Event = require('./server/models/Event');
const Post = require('./server/models/Post');

async function seedData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Community.deleteMany({});
        await Event.deleteMany({});
        await Post.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create sample users
        const user1 = await User.create({
            name: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            password: 'password123',
            city: 'Mumbai',
            bikeType: 'Royal Enfield',
            bikeModel: 'Classic 350',
            bio: 'Love weekend rides along the coast!'
        });

        const user2 = await User.create({
            name: 'Priya Sharma',
            email: 'priya@example.com',
            password: 'password123',
            city: 'Bangalore',
            bikeType: 'KTM',
            bikeModel: 'Duke 390',
            bio: 'Adventure seeker and long-distance rider'
        });

        const user3 = await User.create({
            name: 'Amit Patel',
            email: 'amit@example.com',
            password: 'password123',
            city: 'Delhi',
            bikeType: 'Honda',
            bikeModel: 'CB350',
            bio: 'Bike enthusiast and weekend warrior'
        });

        console.log('✅ Created sample users');

        // Create communities
        const community1 = await Community.create({
            name: 'Mumbai Riders Club',
            description: 'Join us for exciting weekend rides across Mumbai and surrounding areas. All bike types welcome!',
            city: 'Mumbai',
            bikeType: 'All Types',
            admin: user1._id,
            members: [
                { user: user1._id, joinedAt: new Date() },
                { user: user2._id, joinedAt: new Date() }
            ]
        });

        const community2 = await Community.create({
            name: 'Royal Enfield Bangalore',
            description: 'A community for Royal Enfield enthusiasts in Bangalore. We organize regular rides and events.',
            city: 'Bangalore',
            bikeType: 'Royal Enfield',
            admin: user2._id,
            members: [
                { user: user2._id, joinedAt: new Date() },
                { user: user1._id, joinedAt: new Date() }
            ]
        });

        const community3 = await Community.create({
            name: 'Delhi Adventure Riders',
            description: 'For adventure bike enthusiasts. We explore off-road trails and long-distance rides.',
            city: 'Delhi',
            bikeType: 'All Types',
            admin: user3._id,
            members: [
                { user: user3._id, joinedAt: new Date() }
            ]
        });

        console.log('✅ Created communities');

        // Update users with joined communities
        await User.findByIdAndUpdate(user1._id, {
            $push: { joinedCommunities: { $each: [community1._id, community2._id] } }
        });
        await User.findByIdAndUpdate(user2._id, {
            $push: { joinedCommunities: { $each: [community1._id, community2._id] } }
        });
        await User.findByIdAndUpdate(user3._id, {
            $push: { joinedCommunities: community3._id }
        });

        // Create events
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7);

        const event1 = await Event.create({
            title: 'Mumbai to Lonavala Scenic Ride',
            description: 'A beautiful ride through the Western Ghats with stops at scenic viewpoints. Perfect for all skill levels!',
            organizer: user1._id,
            community: community1._id,
            eventDate: tomorrow,
            startTime: '06:00',
            endTime: '18:00',
            location: {
                name: 'Gateway of India',
                address: 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001'
            },
            maxParticipants: 30,
            eventType: 'Ride',
            difficulty: 'Medium',
            distance: 160,
            participants: [
                { user: user1._id, registeredAt: new Date(), status: 'registered' },
                { user: user2._id, registeredAt: new Date(), status: 'registered' }
            ]
        });

        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 14);

        const event2 = await Event.create({
            title: 'Bangalore Coffee Day Meetup',
            description: 'Monthly meetup at Cafe Coffee Day. Meet fellow riders, share stories, and plan future rides!',
            organizer: user2._id,
            community: community2._id,
            eventDate: nextWeek,
            startTime: '10:00',
            endTime: '12:00',
            location: {
                name: 'Cafe Coffee Day, Koramangala',
                address: '5th Block, Koramangala, Bangalore, Karnataka 560095'
            },
            maxParticipants: 50,
            eventType: 'Meetup',
            difficulty: 'Easy',
            participants: [
                { user: user2._id, registeredAt: new Date(), status: 'registered' }
            ]
        });

        console.log('✅ Created events');

        // Update users with registered events
        await User.findByIdAndUpdate(user1._id, {
            $push: { registeredEvents: event1._id }
        });
        await User.findByIdAndUpdate(user2._id, {
            $push: { registeredEvents: { $each: [event1._id, event2._id] } }
        });

        // Create posts
        const post1 = await Post.create({
            author: user1._id,
            community: community1._id,
            content: 'Just completed an amazing ride to Lonavala! The weather was perfect and the roads were smooth. Highly recommend this route for weekend rides!',
            postType: 'ride_experience',
            likes: [
                { user: user2._id, likedAt: new Date() }
            ],
            comments: [
                {
                    author: user2._id,
                    content: 'Sounds amazing! Count me in for the next ride!',
                    createdAt: new Date()
                }
            ],
            rideDetails: {
                distance: 160,
                duration: 10,
                route: 'Mumbai -> Lonavala via Old Mumbai-Pune Highway',
                difficulty: 'Medium',
                weather: 'Pleasant, cloudy'
            }
        });

        const post2 = await Post.create({
            author: user2._id,
            community: community2._id,
            content: 'Planning a Royal Enfield service meet this weekend. If anyone needs help with maintenance or wants to learn more about bike care, join us!',
            postType: 'general',
            likes: [
                { user: user1._id, likedAt: new Date() }
            ]
        });

        const post3 = await Post.create({
            author: user3._id,
            community: community3._id,
            content: 'New member here! Excited to join the Delhi Adventure Riders community. Looking forward to exploring some amazing trails with you all!',
            postType: 'text'
        });

        console.log('✅ Created posts');

        console.log('\n🎉 Sample data seeded successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - Users: 3`);
        console.log(`   - Communities: 3`);
        console.log(`   - Events: 2`);
        console.log(`   - Posts: 3`);
        console.log('\n💡 You can now login with:');
        console.log('   Email: rajesh@example.com');
        console.log('   Password: password123');
        console.log('\n   Email: priya@example.com');
        console.log('   Password: password123');
        console.log('\n   Email: amit@example.com');
        console.log('   Password: password123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

seedData();

