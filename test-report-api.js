const https = require('https');
const http = require('http');

// You need to get the JWT token from localStorage or login first
// For now, let's test if we can at least call the endpoint

const data = JSON.stringify({
  reportType: 'appointments',
  dateFrom: '2025-11-01',
  dateTo: '2025-11-30',
  filters: {}
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/reports/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
