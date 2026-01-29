/**
 * Node.js-only Database Backup (No pg_dump required)
 * Uses Prisma to export database schema and data
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const googleDriveService = require('../services/googleDriveService');

const prisma = new PrismaClient();
const BACKUP_DIR = path.join(__dirname, '../backups');
const MAX_BACKUPS = 10;

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
      .filter(file => file.endsWith('.json'))
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
 * Export all data from database using Prisma
 */
async function exportDatabase() {
  const data = {};

  try {
    // Get all model names from Prisma
    const modelNames = Object.keys(prisma).filter(
      key => !key.startsWith('_') && !key.startsWith('$') && typeof prisma[key] === 'object'
    );

    console.log(`📊 Exporting ${modelNames.length} tables...`);

    for (const modelName of modelNames) {
      try {
        const records = await prisma[modelName].findMany();
        data[modelName] = records;
        console.log(`  ✓ ${modelName}: ${records.length} records`);
      } catch (error) {
        console.warn(`  ⚠ Skipping ${modelName}: ${error.message}`);
      }
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to export database: ${error.message}`);
  }
}

/**
 * Create database backup
 */
async function createBackup() {
  try {
    console.log('Starting database backup (Node.js mode)...');

    // Load environment variables
    require('dotenv').config({ path: path.join(__dirname, '../.env') });

    // Create backup directory
    ensureBackupDir();

    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFileName = `backup_prisma_${timestamp}.json`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    console.log(`Backup file: ${backupFileName}`);

    // Export all data
    console.log('\n📤 Exporting database...');
    const dbData = await exportDatabase();

    // Add metadata
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        database: 'neondb',
        exportMethod: 'prisma-nodejs',
        tables: Object.keys(dbData).length,
        totalRecords: Object.values(dbData).reduce((sum, records) => sum + records.length, 0)
      },
      data: dbData
    };

    // Save to file
    fs.writeFileSync(backupFilePath, JSON.stringify(backup, null, 2));

    const stats = fs.statSync(backupFilePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`\n✓ Backup created successfully!`);
    console.log(`  File: ${backupFilePath}`);
    console.log(`  Size: ${fileSizeMB} MB`);
    console.log(`  Tables: ${backup.metadata.tables}`);
    console.log(`  Records: ${backup.metadata.totalRecords}`);

    // Clean up old backups
    cleanupOldBackups();

    // Upload to Google Drive if enabled
    let driveUpload = null;
    if (process.env.ENABLE_GOOGLE_DRIVE_BACKUP === 'true') {
      console.log('\n☁️  Uploading to Google Drive...');
      driveUpload = await googleDriveService.uploadFile(backupFilePath, backupFileName);

      if (driveUpload.success) {
        console.log('✓ Successfully uploaded to Google Drive');
        console.log(`  Link: ${driveUpload.webViewLink}`);
        await googleDriveService.cleanupOldBackups(MAX_BACKUPS);
      } else {
        console.warn('⚠ Google Drive upload failed:', driveUpload.error);
        console.warn('  Backup is still available locally');
      }
    }

    await prisma.$disconnect();

    return {
      success: true,
      fileName: backupFileName,
      filePath: backupFilePath,
      size: stats.size,
      timestamp: new Date().toISOString(),
      metadata: backup.metadata,
      googleDrive: driveUpload
    };

  } catch (error) {
    console.error('\n✗ Backup failed:', error.message);
    await prisma.$disconnect();

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
    console.log('=== Automated Database Backup (Node.js) ===\n');
  } else {
    console.log('=== Manual Database Backup (Node.js) ===\n');
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
