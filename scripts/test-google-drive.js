/**
 * Test Google Drive Connection
 * Run this to verify Google Drive setup is working
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '../google-credentials.json');

async function testGoogleDrive() {
  console.log('🔍 Testing Google Drive Connection...\n');

  try {
    // 1. Check credentials file exists
    console.log('Step 1: Checking credentials file...');
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error('google-credentials.json not found!');
    }
    console.log('✓ Credentials file found\n');

    // 2. Load and validate credentials
    console.log('Step 2: Loading credentials...');
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    console.log('✓ Credentials loaded');
    console.log(`  Service Account: ${credentials.client_email}`);
    console.log(`  Project ID: ${credentials.project_id}\n`);

    // 3. Initialize Google Drive API
    console.log('Step 3: Initializing Google Drive API...');
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });
    console.log('✓ Google Drive API initialized\n');

    // 4. Test connection by listing files
    console.log('Step 4: Testing connection (listing files)...');
    const response = await drive.files.list({
      pageSize: 5,
      fields: 'files(id, name, createdTime)',
    });
    console.log('✓ Successfully connected to Google Drive');
    console.log(`  Found ${response.data.files?.length || 0} accessible files\n`);

    // 5. Check/Create backup folder
    console.log('Step 5: Checking backup folder...');
    const folderName = process.env.GOOGLE_DRIVE_BACKUP_FOLDER || 'Database_Backups';
    
    const folderSearch = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name, webViewLink)',
    });

    if (folderSearch.data.files && folderSearch.data.files.length > 0) {
      const folder = folderSearch.data.files[0];
      console.log('✓ Backup folder already exists!');
      console.log(`  Folder Name: ${folder.name}`);
      console.log(`  Folder ID: ${folder.id}`);
      console.log(`  View in Google Drive: ${folder.webViewLink}\n`);
    } else {
      console.log('⚠ Backup folder does not exist yet');
      console.log('  It will be created automatically on first backup\n');
    }

    // 6. Test file upload (create a small test file)
    console.log('Step 6: Testing file upload...');
    const testFilePath = path.join(__dirname, '../backups/test_google_drive.txt');
    const testContent = `Google Drive Test\nTimestamp: ${new Date().toISOString()}\nTest successful!`;
    fs.writeFileSync(testFilePath, testContent);

    let folderId = null;
    if (folderSearch.data.files && folderSearch.data.files.length > 0) {
      folderId = folderSearch.data.files[0].id;
    } else {
      // Create folder
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };
      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: 'id, name, webViewLink',
      });
      folderId = folder.data.id;
      console.log(`✓ Created backup folder: ${folderName}`);
      console.log(`  Folder ID: ${folderId}`);
      console.log(`  View in Google Drive: ${folder.data.webViewLink}\n`);
    }

    // Upload test file
    const fileMetadata = {
      name: 'test_google_drive.txt',
      parents: [folderId],
    };
    const media = {
      mimeType: 'text/plain',
      body: fs.createReadStream(testFilePath),
    };

    const uploadResponse = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    console.log('✓ Test file uploaded successfully!');
    console.log(`  File Name: ${uploadResponse.data.name}`);
    console.log(`  File ID: ${uploadResponse.data.id}`);
    console.log(`  View in Google Drive: ${uploadResponse.data.webViewLink}\n`);

    // Clean up test file
    fs.unlinkSync(testFilePath);
    await drive.files.delete({ fileId: uploadResponse.data.id });
    console.log('✓ Test file cleaned up\n');

    // Success summary
    console.log('========================================');
    console.log('✅ GOOGLE DRIVE SETUP COMPLETE!');
    console.log('========================================');
    console.log('Your automatic backup system is ready to use.');
    console.log('Backups will be uploaded to Google Drive daily at 12:00 AM.');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure google-credentials.json is in the backend root directory');
    console.error('2. Verify the service account has Google Drive API enabled');
    console.error('3. Check Google Cloud Console > APIs & Services > Enabled APIs');
    console.error('4. Make sure the service account key is valid and not expired\n');
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Run test
testGoogleDrive()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
