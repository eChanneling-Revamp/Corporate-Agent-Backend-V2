/**
 * Check Backup System Status
 * Quick diagnostic tool to verify backup configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BACKUP_DIR = path.join(__dirname, '../backups');
const SCHEMA_BACKUP_DIR = path.join(__dirname, '../backups/schemas');
const ENV_PATH = path.join(__dirname, '../.env');

console.log('========================================');
console.log('🔍 BACKUP SYSTEM STATUS CHECK');
console.log('========================================\n');

// Check 1: Backup directories
console.log('📂 Backup Directories:');
if (fs.existsSync(BACKUP_DIR)) {
  console.log('  ✅ Database backup folder exists:', BACKUP_DIR);
} else {
  console.log('  ❌ Database backup folder NOT found:', BACKUP_DIR);
}

if (fs.existsSync(SCHEMA_BACKUP_DIR)) {
  console.log('  ✅ Schema backup folder exists:', SCHEMA_BACKUP_DIR);
} else {
  console.log('  ❌ Schema backup folder NOT found:', SCHEMA_BACKUP_DIR);
}

// Check 2: Recent backups
console.log('\n📊 Recent Database Backups:');
if (fs.existsSync(BACKUP_DIR)) {
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      stats: fs.statSync(path.join(BACKUP_DIR, file))
    }))
    .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime())
    .slice(0, 5);

  if (backups.length === 0) {
    console.log('  ⚠️  No database backups found');
  } else {
    backups.forEach((backup, index) => {
      const sizeMB = (backup.stats.size / (1024 * 1024)).toFixed(2);
      const timeDiff = Date.now() - backup.stats.mtime.getTime();
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      
      console.log(`  ${index + 1}. ${backup.name}`);
      console.log(`     Size: ${sizeMB} MB | Created: ${backup.stats.mtime.toLocaleString()} (${hoursAgo}h ago)`);
    });
  }
}

console.log('\n📝 Recent Schema Backups:');
if (fs.existsSync(SCHEMA_BACKUP_DIR)) {
  const schemas = fs.readdirSync(SCHEMA_BACKUP_DIR)
    .filter(file => file.endsWith('.prisma'))
    .map(file => ({
      name: file,
      path: path.join(SCHEMA_BACKUP_DIR, file),
      stats: fs.statSync(path.join(SCHEMA_BACKUP_DIR, file))
    }))
    .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime())
    .slice(0, 3);

  if (schemas.length === 0) {
    console.log('  ⚠️  No schema backups found');
  } else {
    schemas.forEach((schema, index) => {
      const sizeKB = (schema.stats.size / 1024).toFixed(2);
      const timeDiff = Date.now() - schema.stats.mtime.getTime();
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      
      console.log(`  ${index + 1}. ${schema.name}`);
      console.log(`     Size: ${sizeKB} KB | Created: ${schema.stats.mtime.toLocaleString()} (${hoursAgo}h ago)`);
    });
  }
}

// Check 3: Configuration
console.log('\n⚙️  Configuration:');
if (fs.existsSync(ENV_PATH)) {
  const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  const autoBackupEnabled = /ENABLE_AUTO_BACKUP\s*=\s*true/i.test(envContent);
  const timezone = envContent.match(/TIMEZONE\s*=\s*(.+)/)?.[1] || 'Not set (defaults to UTC)';
  const nodeEnv = envContent.match(/NODE_ENV\s*=\s*(.+)/)?.[1] || 'Not set';

  console.log(`  NODE_ENV: ${nodeEnv}`);
  console.log(`  ENABLE_AUTO_BACKUP: ${autoBackupEnabled ? '✅ true' : '❌ false'}`);
  console.log(`  TIMEZONE: ${timezone}`);
} else {
  console.log('  ❌ .env file not found');
}

// Check 4: Google Drive setup
console.log('\n☁️  Google Drive Integration:');
const googleCredsPath = path.join(__dirname, '../google-oauth-credentials.json');
const googleTokenPath = path.join(__dirname, '../google-drive-token.json');

if (fs.existsSync(googleCredsPath)) {
  console.log('  ✅ OAuth credentials found');
} else {
  console.log('  ⚠️  OAuth credentials NOT found');
  console.log('     Run: npm run gdrive:setup (Optional)');
}

if (fs.existsSync(googleTokenPath)) {
  console.log('  ✅ Drive token found');
} else {
  console.log('  ⚠️  Drive token NOT found');
  console.log('     Run: npm run gdrive:setup (Optional)');
}

// Check 5: Server process
console.log('\n🖥️  Server Status:');
try {
  // Check if Node.js processes are running (cross-platform)
  let nodeProcesses = [];
  
  try {
    if (process.platform === 'win32') {
      const output = execSync('tasklist /FI "IMAGENAME eq node.exe"', { encoding: 'utf-8' });
      nodeProcesses = output.split('\n').filter(line => line.includes('node.exe'));
    } else {
      const output = execSync('ps aux | grep node', { encoding: 'utf-8' });
      nodeProcesses = output.split('\n').filter(line => 
        line.includes('node') && !line.includes('grep')
      );
    }
  } catch (error) {
    // Process check failed
  }

  if (nodeProcesses.length > 0) {
    console.log(`  ✅ Found ${nodeProcesses.length} Node.js process(es) running`);
    console.log('  ℹ️  Automatic backups will run if server is active at midnight');
  } else {
    console.log('  ⚠️  No Node.js processes found');
    console.log('  ❌ Server is NOT running - automatic backups will NOT work!');
    console.log('  💡 Start server with: npm start');
  }
} catch (error) {
  console.log('  ⚠️  Could not check server status');
}

// Summary
console.log('\n========================================');
console.log('📋 SUMMARY');
console.log('========================================');

const now = new Date();
const midnight = new Date(now);
midnight.setHours(24, 0, 0, 0); // Next midnight

const hoursUntilMidnight = Math.floor((midnight - now) / (1000 * 60 * 60));
const minutesUntilMidnight = Math.floor(((midnight - now) % (1000 * 60 * 60)) / (1000 * 60));

console.log(`\n⏰ Current Time: ${now.toLocaleString()}`);
console.log(`⏰ Next Scheduled Backup: Midnight (in ${hoursUntilMidnight}h ${minutesUntilMidnight}m)`);

console.log('\n📌 Action Required:');

if (fs.existsSync(ENV_PATH)) {
  const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  const autoBackupEnabled = /ENABLE_AUTO_BACKUP\s*=\s*true/i.test(envContent);
  
  if (!autoBackupEnabled) {
    console.log('  ⚠️  Set ENABLE_AUTO_BACKUP=true in .env file');
  }
}

try {
  let hasNodeProcess = false;
  
  try {
    if (process.platform === 'win32') {
      const output = execSync('tasklist /FI "IMAGENAME eq node.exe"', { encoding: 'utf-8' });
      hasNodeProcess = output.includes('node.exe');
    } else {
      const output = execSync('ps aux | grep node', { encoding: 'utf-8' });
      hasNodeProcess = output.split('\n').some(line => 
        line.includes('node') && !line.includes('grep')
      );
    }
  } catch (error) {
    // Assume no process
  }

  if (!hasNodeProcess) {
    console.log('  ❌ START THE SERVER: npm start');
    console.log('     (Server must be running at midnight for auto-backup)');
  } else {
    console.log('  ✅ Server is running - automatic backups are enabled!');
  }
} catch (error) {
  console.log('  ℹ️  Ensure server is running at midnight');
}

console.log('\n💡 Quick Commands:');
console.log('  - Create backup now:     npm run db:backup');
console.log('  - Start server:          npm start');
console.log('  - Setup Google Drive:    npm run gdrive:setup');
console.log('  - Check this status:     node scripts/check-backup-status.js');

console.log('\n========================================\n');
