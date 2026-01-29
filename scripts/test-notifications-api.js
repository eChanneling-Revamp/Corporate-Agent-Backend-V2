// Test the notifications API endpoint
const http = require('http');

const BASE_URL = 'http://localhost:4012/api';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testNotifications() {
  try {
    console.log('=== Testing Notifications API ===\n');

    // Step 1: Login to get access token
    console.log('1. Logging in...');
    const loginResult = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'corporateagent@slt.lk',
        password: 'ABcd123#'
      })
    });

    const loginData = loginResult.data;
    
    if (!loginData.success) {
      console.error('Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.tokens.accessToken;
    console.log('✓ Login successful');
    console.log('  Token:', token.substring(0, 20) + '...\n');

    // Step 2: Fetch notifications
    console.log('2. Fetching notifications...');
    const notifResult = await makeRequest(`${BASE_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const notifData = notifResult.data;
    
    console.log('  Status:', notifResult.status);
    console.log('  Response:', JSON.stringify(notifData, null, 2));
    
    if (notifData.success) {
      console.log('\n✓ Notifications fetched successfully');
      console.log('  Total notifications:', notifData.data.length);
      console.log('  Unread count:', notifData.unreadCount);
      
      if (notifData.data.length > 0) {
        console.log('\n  Latest notification:');
        const latest = notifData.data[0];
        console.log('    Title:', latest.title);
        console.log('    Type:', latest.type);
        console.log('    Message:', latest.message);
        console.log('    Read:', latest.isRead);
        console.log('    Created:', latest.createdAt);
      }
    } else {
      console.error('\n✗ Failed to fetch notifications');
      console.error('  Message:', notifData.message);
      console.error('  Error:', notifData.error);
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  }
}

testNotifications();
