// Automated API End-to-End Verification Test Script
const http = require('http');

const PORT = 5000;
const HOST = '127.0.0.1';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {};
    if (data) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        host: HOST,
        port: PORT,
        path,
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: rawData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting automated REST API verification tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name} — ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'online', 'Health Check endpoint');

    // 2. Authentication Login
    const loginRes = await request('POST', '/api/auth/login', {
      loginIdentifier: 'elena.rostova@unfold.io',
      password: 'password123',
    });
    assert(loginRes.status === 200 && !!loginRes.body.token, 'Auth: Login existing user');
    const tokenElena = loginRes.body.token;

    // 3. Auth GetMe
    const meRes = await request('GET', '/api/auth/me', null, tokenElena);
    assert(meRes.status === 200 && meRes.body.user.username === 'elena_rostova', 'Auth: /api/auth/me');

    // 4. Register New User
    const testUsername = `user_${Date.now()}`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Test Explorer',
      email: `${testUsername}@unfold.io`,
      username: testUsername,
      password: 'password123',
    });
    assert(regRes.status === 201 && !!regRes.body.token, 'Auth: Register new user');
    const tokenNewUser = regRes.body.token;
    const newUserId = regRes.body.user.id;

    // 5. Posts Feed
    const feedRes = await request('GET', '/api/posts?feed=for-you');
    assert(feedRes.status === 200 && feedRes.body.posts.length > 0, 'Posts: Fetch global feed');
    const firstPost = feedRes.body.posts[0];

    // 6. Create Post
    const createPostRes = await request('POST', '/api/posts', {
      content: 'Testing automated perspective unfolding on UNFOLD platform.',
      category: 'Thought',
    }, tokenNewUser);
    assert(createPostRes.status === 201 && !!createPostRes.body.post.id, 'Posts: Create new post');
    const createdPostId = createPostRes.body.post.id;

    // 7. Like Post
    const likeRes = await request('POST', `/api/posts/${createdPostId}/like`, null, tokenElena);
    assert(likeRes.status === 200 && likeRes.body.isLiked === true, 'Likes: Like a post');

    // 8. Bookmark Post
    const bmRes = await request('POST', `/api/posts/${createdPostId}/bookmark`, null, tokenElena);
    assert(bmRes.status === 200 && bmRes.body.isBookmarked === true, 'Bookmarks: Bookmark a post');

    // 9. Add Comment
    const commentRes = await request('POST', `/api/comments/post/${createdPostId}`, {
      content: 'A thoughtful contribution to this test stream.',
    }, tokenElena);
    assert(commentRes.status === 201 && !!commentRes.body.comment.id, 'Comments: Add comment to post');
    const commentId = commentRes.body.comment.id;

    // 10. Fetch Comments
    const getCommentsRes = await request('GET', `/api/comments/post/${createdPostId}`);
    assert(getCommentsRes.status === 200 && getCommentsRes.body.comments.length >= 1, 'Comments: Fetch post comments');

    // 11. Follow User
    const followRes = await request('POST', `/api/users/${newUserId}/follow`, null, tokenElena);
    assert(followRes.status === 200 && followRes.body.isFollowing === true, 'Follow: Follow user');

    // 12. User Profile
    const profileRes = await request('GET', `/api/users/profile/${testUsername}`, null, tokenElena);
    assert(profileRes.status === 200 && profileRes.body.user.isFollowing === true, 'Users: Fetch profile with follow state');

    // 13. Explore Search
    const searchRes = await request('GET', '/api/explore?q=architecture');
    assert(searchRes.status === 200 && searchRes.body.isSearch === true, 'Explore: Search query for thoughts/users');

    // 14. Notifications for New User
    const notifsRes = await request('GET', '/api/notifications', null, tokenNewUser);
    assert(notifsRes.status === 200 && notifsRes.body.notifications.length > 0, 'Notifications: Check notifications triggered');

    // 15. Delete Comment
    const delCommentRes = await request('DELETE', `/api/comments/${commentId}`, null, tokenElena);
    assert(delCommentRes.status === 200, 'Comments: Delete own comment');

    // 16. Delete Post
    const delPostRes = await request('DELETE', `/api/posts/${createdPostId}`, null, tokenNewUser);
    assert(delPostRes.status === 200, 'Posts: Delete own post');

    console.log(`\n📊 API Test Results: ${passed} passed, ${failed} failed.`);
    if (failed === 0) {
      console.log('🎉 ALL REST API ENDPOINTS VERIFIED & WORKING PERFECTLY!\n');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test execution error:', error);
    process.exit(1);
  }
}

// Run tests against the active running server (or start if not listening)
http.get(`http://${HOST}:${PORT}/api/health`, (res) => {
  // Server already running
  runTests();
}).on('error', () => {
  // Start server in-process if not already running
  require('./src/server');
  setTimeout(() => {
    runTests();
  }, 1000);
});
