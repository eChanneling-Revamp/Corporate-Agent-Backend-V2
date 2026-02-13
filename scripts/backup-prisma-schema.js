/**
 * Prisma Schema Backup Script
 * Pulls latest schema from database and saves it with timestamp
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

const SCHEMA_BACKUP_DIR = path.join(__dirname, '../backups/schemas');
const SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');
const MAX_SCHEMA_BACKUPS = 10;

/**
 * Ensure schema backup directory exists
 */
function ensureSchemaBackupDir() {
  if (!fs.existsSync(SCHEMA_BACKUP_DIR)) {
    fs.mkdirSync(SCHEMA_BACKUP_DIR, { recursive: true });
    console.log(`✓ Created schema backup directory: ${SCHEMA_BACKUP_DIR}`);
  }
}

/**
 * Clean up old schema backups
 */
function cleanupOldSchemaBackups() {
  try {
    const files = fs.readdirSync(SCHEMA_BACKUP_DIR)
      .filter(file => file.endsWith('.prisma'))
      .map(file => ({
        name: file,
        path: path.join(SCHEMA_BACKUP_DIR, file),
        time: fs.statSync(path.join(SCHEMA_BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > MAX_SCHEMA_BACKUPS) {
      const filesToDelete = files.slice(MAX_SCHEMA_BACKUPS);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`✓ Deleted old schema backup: ${file.name}`);
      });
    }
  } catch (error) {
    console.error('Error cleaning up old schema backups:', error.message);
  }
}

/**
 * Run npx prisma db pull to update schema
 */
async function pullPrismaSchema() {
  try {
    console.log('\n📥 Running npx prisma db pull...');
    
    // Load environment variables
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
    
    const { stdout, stderr } = await execPromise('npx prisma db pull', {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env },
    });

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    console.log('✓ Prisma schema pulled from database successfully');
    return true;
  } catch (error) {
    console.error('✗ Failed to pull Prisma schema:', error.message);
    throw error;
  }
}

/**
 * Backup Prisma schema file
 */
async function backupPrismaSchema() {
  try {
    console.log('\n🔄 Starting Prisma schema backup...');

    // Ensure backup directory exists
    ensureSchemaBackupDir();

    // Pull latest schema from database
    await pullPrismaSchema();

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFileName = `schema_backup_${timestamp}.prisma`;
    const backupFilePath = path.join(SCHEMA_BACKUP_DIR, backupFileName);

    // Check if schema file exists
    if (!fs.existsSync(SCHEMA_PATH)) {
      throw new Error(`Schema file not found: ${SCHEMA_PATH}`);
    }

    // Copy schema file to backup location
    fs.copyFileSync(SCHEMA_PATH, backupFilePath);

    // Get file stats
    const stats = fs.statSync(backupFilePath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log('\n✓ Prisma schema backup created successfully!');
    console.log(`  File: ${backupFilePath}`);
    console.log(`  Size: ${fileSizeKB} KB`);
    console.log(`  Timestamp: ${new Date().toISOString()}`);
    console.log(`\\n💾 LOCAL SCHEMA BACKUP SAVED!`);
    console.log(`   Location: backend/backups/schemas/${backupFileName}`);
    console.log(`   Max schema backups: ${MAX_SCHEMA_BACKUPS}\\n`);

    // Clean up old backups
    cleanupOldSchemaBackups();

    return {
      success: true,
      fileName: backupFileName,
      filePath: backupFilePath,
      size: stats.size,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('\n✗ Prisma schema backup failed:', error.message);
    
    return {
      success: false,
      error: error.message,
    };
  }
}

// Export for use in other modules
module.exports = {
  backupPrismaSchema,
  pullPrismaSchema,
  SCHEMA_BACKUP_DIR,
};

// Run if called directly
if (require.main === module) {
  backupPrismaSchema()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
