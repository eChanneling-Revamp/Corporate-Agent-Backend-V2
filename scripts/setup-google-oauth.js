/**
 * Google Drive OAuth2 Setup Helper
 * Run this once to generate OAuth2 tokens for Google Drive access
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CREDENTIALS_PATH = path.join(__dirname, '../google-credentials.json');
const TOKEN_PATH = path.join(__dirname, '../google-drive-token.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function getOAuthClient() {
  // For OAuth2, we need client credentials (not service account)
  // Since you have a service account, we'll create a simple OAuth flow
  
  console.log('\n📋 GOOGLE DRIVE SETUP - OAUTH2\n');
  console.log('Service accounts cannot store files in Google Drive.');
  console.log('We need to use OAuth2 with your personal Google account.\n');
  
  console.log('Please follow these steps:\n');
  console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
  console.log('2. Select project: echanelling-revamp');
  console.log('3. Click "Create Credentials" > "OAuth client ID"');
  console.log('4. Application type: Desktop app');
  console.log('5. Name: "Backup System"');
  console.log('6. Download the credentials JSON file');
  console.log('7. Save it as "google-oauth-credentials.json" in the backend folder');
  console.log('8. Run this script again\n');
  
  const oauthPath = path.join(__dirname, '../google-oauth-credentials.json');
  
  if (!fs.existsSync(oauthPath)) {
    console.log('❌ google-oauth-credentials.json not found');
    console.log('Please create OAuth2 credentials first.\n');
    return;
  }

  const credentials = JSON.parse(fs.readFileSync(oauthPath, 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we already have a token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oAuth2Client.setCredentials(token);
    console.log('✅ OAuth2 token already exists!\n');
    return oAuth2Client;
  }

  // Generate new token
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('🔐 Authorize this app by visiting this URL:\n');
  console.log(authUrl);
  console.log('\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          console.error('❌ Error retrieving access token:', err);
          reject(err);
          return;
        }
        
        oAuth2Client.setCredentials(token);
        
        // Save token for future use
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
        console.log('\n✅ Token saved to:', TOKEN_PATH);
        console.log('✅ OAuth2 setup complete!\n');
        
        resolve(oAuth2Client);
      });
    });
  });
}

// Run setup
getOAuthClient()
  .then(() => {
    console.log('✅ Google Drive OAuth2 setup is complete!');
    console.log('You can now run: node scripts/test-google-drive.js\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  });
