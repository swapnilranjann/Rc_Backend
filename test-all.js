const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = null;
let testUserId = null;
let testCommunityId = null;
let testEventId = null;
let testPostId = null;

// Colors for output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// Test functions
async function testHealthCheck() {
    try {
        const response = await axios.get(`${API_BASE}/health`);
        if (response.status === 200 && response.data.status === 'OK') {
            logSuccess('Health check passed');
            return true;
        }
    } catch (error) {
        logError(`Health check failed: ${error.message}`);
        return false;
    }
}

async function testUserRegistration() {
    try {
        const userData = {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            city: 'Mumbai',
            bikeType: 'Royal Enfield'
        };
        
        const response = await axios.post(`${API_BASE}/auth/register`, userData);
        
        if (response.status === 201 && response.data.token) {
            authToken = response.data.token;
            testUserId = response.data.user.id;
            logSuccess(`User registration successful - ${response.data.user.name}`);
            return true;
        }
    } catch (error) {
        logError(`User registration failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testUserLogin() {
    try {
        const loginData = {
            email: 'rajesh@example.com',
            password: 'password123'
        };
        
        const response = await axios.post(`${API_BASE}/auth/login`, loginData);
        
        if (response.status === 200 && response.data.token) {
            logSuccess(`User login successful - ${response.data.user.name}`);
            return true;
        }
    } catch (error) {
        logError(`User login failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testGetCurrentUser() {
    try {
        const response = await axios.get(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.status === 200 && response.data.user) {
            logSuccess(`Get current user successful - ${response.data.user.name}`);
            return true;
        }
    } catch (error) {
        logError(`Get current user failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testGetCommunities() {
    try {
        const response = await axios.get(`${API_BASE}/communities`);
        
        if (response.status === 200) {
            const count = response.data.communities?.length || response.data.length || 0;
            logSuccess(`Get communities successful - Found ${count} communities`);
            return true;
        }
    } catch (error) {
        logError(`Get communities failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testCreateCommunity() {
    try {
        const communityData = {
            name: 'Test Riders Club',
            description: 'A test community for bike enthusiasts',
            city: 'Mumbai',
            bikeType: 'All Types'
        };
        
        const response = await axios.post(`${API_BASE}/communities`, communityData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.status === 201 && response.data.community) {
            testCommunityId = response.data.community._id;
            logSuccess(`Create community successful - ${response.data.community.name}`);
            return true;
        }
    } catch (error) {
        logError(`Create community failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testJoinCommunity() {
    if (!testCommunityId) {
        logInfo('Skipping join community test - no community ID');
        return false;
    }
    
    try {
        const response = await axios.post(
            `${API_BASE}/communities/${testCommunityId}/join`,
            {},
            { headers: { Authorization: `Bearer ${authToken}` } }
        );
        
        if (response.status === 200) {
            logSuccess('Join community successful');
            return true;
        }
    } catch (error) {
        // Already a member is OK
        if (error.response?.data?.message?.includes('Already a member')) {
            logSuccess('Join community - already a member');
            return true;
        }
        logError(`Join community failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testGetEvents() {
    try {
        const response = await axios.get(`${API_BASE}/events`);
        
        if (response.status === 200) {
            const count = response.data.events?.length || response.data.length || 0;
            logSuccess(`Get events successful - Found ${count} events`);
            return true;
        }
    } catch (error) {
        logError(`Get events failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testCreateEvent() {
    if (!testCommunityId) {
        logInfo('Skipping create event test - no community ID');
        return false;
    }
    
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const eventData = {
            title: 'Test Ride Event',
            description: 'A test ride event for the community',
            community: testCommunityId,
            eventDate: tomorrow.toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '17:00',
            location: {
                name: 'Test Location',
                address: 'Mumbai, Maharashtra'
            },
            eventType: 'Ride',
            difficulty: 'Easy',
            maxParticipants: 20
        };
        
        const response = await axios.post(`${API_BASE}/events`, eventData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.status === 201 && response.data.event) {
            testEventId = response.data.event._id;
            logSuccess(`Create event successful - ${response.data.event.title}`);
            return true;
        }
    } catch (error) {
        logError(`Create event failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testRegisterForEvent() {
    if (!testEventId) {
        logInfo('Skipping register for event test - no event ID');
        return false;
    }
    
    try {
        const response = await axios.post(
            `${API_BASE}/events/${testEventId}/register`,
            {},
            { headers: { Authorization: `Bearer ${authToken}` } }
        );
        
        if (response.status === 200) {
            logSuccess('Register for event successful');
            return true;
        }
    } catch (error) {
        // Already registered is OK
        if (error.response?.data?.message?.includes('Already registered')) {
            logSuccess('Register for event - already registered');
            return true;
        }
        logError(`Register for event failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testGetPosts() {
    try {
        const response = await axios.get(`${API_BASE}/posts`);
        
        if (response.status === 200) {
            const count = response.data.posts?.length || response.data.length || 0;
            logSuccess(`Get posts successful - Found ${count} posts`);
            return true;
        }
    } catch (error) {
        logError(`Get posts failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testCreatePost() {
    if (!testCommunityId) {
        logInfo('Skipping create post test - no community ID');
        return false;
    }
    
    try {
        const postData = {
            community: testCommunityId,
            content: 'This is a test post for the bike community!',
            postType: 'text'
        };
        
        const response = await axios.post(`${API_BASE}/posts`, postData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.status === 201 && response.data.post) {
            testPostId = response.data.post._id;
            logSuccess('Create post successful');
            return true;
        }
    } catch (error) {
        logError(`Create post failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testLikePost() {
    if (!testPostId) {
        logInfo('Skipping like post test - no post ID');
        return false;
    }
    
    try {
        const response = await axios.post(
            `${API_BASE}/posts/${testPostId}/like`,
            {},
            { headers: { Authorization: `Bearer ${authToken}` } }
        );
        
        if (response.status === 200) {
            logSuccess('Like post successful');
            return true;
        }
    } catch (error) {
        logError(`Like post failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testAddComment() {
    if (!testPostId) {
        logInfo('Skipping add comment test - no post ID');
        return false;
    }
    
    try {
        const response = await axios.post(
            `${API_BASE}/posts/${testPostId}/comment`,
            { content: 'Great post!' },
            { headers: { Authorization: `Bearer ${authToken}` } }
        );
        
        if (response.status === 200) {
            logSuccess('Add comment successful');
            return true;
        }
    } catch (error) {
        logError(`Add comment failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('\n');
    log('═══════════════════════════════════════════════════════', 'blue');
    log('  🏍️  BIKE COMMUNITY PLATFORM - COMPLETE TEST SUITE', 'blue');
    log('═══════════════════════════════════════════════════════\n', 'blue');
    
    const tests = [
        { name: '1. Health Check', fn: testHealthCheck },
        { name: '2. User Registration', fn: testUserRegistration },
        { name: '3. User Login', fn: testUserLogin },
        { name: '4. Get Current User', fn: testGetCurrentUser },
        { name: '5. Get Communities', fn: testGetCommunities },
        { name: '6. Create Community', fn: testCreateCommunity },
        { name: '7. Join Community', fn: testJoinCommunity },
        { name: '8. Get Events', fn: testGetEvents },
        { name: '9. Create Event', fn: testCreateEvent },
        { name: '10. Register for Event', fn: testRegisterForEvent },
        { name: '11. Get Posts', fn: testGetPosts },
        { name: '12. Create Post', fn: testCreatePost },
        { name: '13. Like Post', fn: testLikePost },
        { name: '14. Add Comment', fn: testAddComment }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        logInfo(`\nRunning: ${test.name}...`);
        const result = await test.fn();
        if (result) {
            passed++;
        } else {
            failed++;
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
    
    console.log('\n');
    log('═══════════════════════════════════════════════════════', 'blue');
    log('  📊 TEST RESULTS', 'blue');
    log('═══════════════════════════════════════════════════════', 'blue');
    logSuccess(`Passed: ${passed}/${tests.length}`);
    if (failed > 0) {
        logError(`Failed: ${failed}/${tests.length}`);
    }
    log('═══════════════════════════════════════════════════════\n', 'blue');
    
    if (passed === tests.length) {
        log('🎉 ALL TESTS PASSED! Your platform is 100% functional! 🎉', 'green');
    } else {
        log(`⚠️  ${failed} test(s) failed. Check the errors above.`, 'yellow');
    }
    
    console.log('\n');
    process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
    logError(`Test runner error: ${error.message}`);
    process.exit(1);
});

