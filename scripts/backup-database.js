/**
 * Database Backup Script for NeonDB
 * 
 * This script creates backups of the PostgreSQL database using pg_dump.
 * Backups are stored locally and can be optionally uploaded to cloud storage.
 * 
 * Usage:
 *   node scripts/backup-database.js
 *   node scripts/backup-database.js --auto (for automated backups)
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const googleDriveService = require('../services/googleDriveService');

const execPromise = util.promisify(exec);

// Configuration
const BACKUP_DIR = path.join(__dirname, '../backups');
const MAX_BACKUPS = 10; // Keep last 10 backups
const DATABASE_URL = process.env.DATABASE_URL;

/**
 * Parse DATABASE_URL to extract connection details
 */
function parseDatabaseUrl(url) {
  try {
    const urlObj = new URL(url);
    return {
      user: urlObj.username,
      password: urlObj.password,
      host: urlObj.hostname,
      port: urlObj.port || '5432',
      database: urlObj.pathname.slice(1).split('?')[0],
    };
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error.message);
    throw new Error('Invalid DATABASE_URL format');
  }
}

/**
 * Ensure backup directory exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✓ Created backup directory: ${BACKUP_DIR}`);
  }
}

/**
 * Clean up old backups
 */
function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.sql') || file.endsWith('.sql.gz'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > MAX_BACKUPS) {
      const filesToDelete = files.slice(MAX_BACKUPS);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`✓ Deleted old backup: ${file.name}`);
      });
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error.message);
  }
}

/**
 * Create database backup using pg_dump
 */
async function createBackup() {
  try {
    console.log('Starting database backup...');
    
    // Load environment variables
    require('dotenv').config({ path: path.join(__dirname, '../.env') });

    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Parse database connection details
    const dbConfig = parseDatabaseUrl(DATABASE_URL);
    
    // Create backup directory
    ensureBackupDir();

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFileName = `backup_${dbConfig.database}_${timestamp}.sql`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    console.log(`Database: ${dbConfig.database}`);
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Backup file: ${backupFileName}`);

    // Set PGPASSWORD environment variable for pg_dump
    const env = { ...process.env, PGPASSWORD: dbConfig.password };

    // Construct pg_dump command
    const pgDumpCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F p -f "${backupFilePath}"`;

    // Execute backup
    console.log('\nCreating backup...');
    const { stdout, stderr } = await execPromise(pgDumpCommand, { env, maxBuffer: 50 * 1024 * 1024 }); // 50MB buffer

    if (stderr && !stderr.includes('NOTICE')) {
      console.warn('Warning during backup:', stderr);
    }

    // Check if backup file was created
    if (fs.existsSync(backupFilePath)) {
      const stats = fs.statSync(backupFilePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(`\n✓ Backup created successfully!`);
      console.log(`  File: ${backupFilePath}`);
      console.log(`  Size: ${fileSizeMB} MB`);
      console.log(`  Created: ${new Date().toLocaleString()}`);

      // Clean up old backups
      cleanupOldBackups();

      // Upload to Google Drive if enabled
      let driveUpload = null;
      if (process.env.ENABLE_GOOGLE_DRIVE_BACKUP === 'true') {
        console.log('\n☁️  Uploading to Google Drive...');
        driveUpload = await googleDriveService.uploadFile(backupFilePath, backupFileName);
        
        if (driveUpload.success) {
          console.log('✓ Successfully uploaded to Google Drive');
          // Clean up old Google Drive backups
          await googleDriveService.cleanupOldBackups(MAX_BACKUPS);
        } else {
          console.warn('⚠ Google Drive upload failed:', driveUpload.error);
          console.warn('  Backup is still available locally');
        }
      }

      return {
        success: true,
        fileName: backupFileName,
        filePath: backupFilePath,
        size: stats.size,
        timestamp: new Date().toISOString(),
        googleDrive: driveUpload
      };
    } else {
      throw new Error('Backup file was not created');
    }

  } catch (error) {
    console.error('\n✗ Backup failed:', error.message);
    
    if (error.message.includes('pg_dump')) {
      console.error('\nMake sure PostgreSQL client tools (pg_dump) are installed:');
      console.error('  Windows: Download from https://www.postgresql.org/download/windows/');
      console.error('  Mac: brew install postgresql');
      console.error('  Linux: sudo apt-get install postgresql-client');
    }

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main execution
 */
async function main() {
  const isAutoBackup = process.argv.includes('--auto');
  
  if (isAutoBackup) {
    console.log('=== Automated Database Backup ===\n');
  } else {
    console.log('=== Manual Database Backup ===\n');
  }

  const result = await createBackup();

  if (result.success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = { createBackup, BACKUP_DIR };
