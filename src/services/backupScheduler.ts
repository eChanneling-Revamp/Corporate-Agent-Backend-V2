/**
 * Backup Scheduler Service
 * Automatically creates database and Prisma schema backups on a schedule
 * Uploads backups to Google Drive
 */

import cron from 'node-cron';
import { createBackup } from '../../scripts/backup-database-nodejs';
import { backupPrismaSchema } from '../../scripts/backup-prisma-schema';
import { googleDriveService } from './googleDriveService';
import { logger } from '../utils/logger';

class BackupScheduler {
  private cronJob: cron.ScheduledTask | null = null;
  private readonly CRON_SCHEDULE = '0 0 * * *'; // Daily at 12:00 AM (midnight)

  /**
   * Start the backup scheduler
   * Runs daily at 12:00 AM
   */
  start() {
    if (this.cronJob) {
      logger.warn('Backup scheduler is already running');
      return;
    }

    logger.info('Starting backup scheduler (Daily at 12:00 AM)');

    // Run initial backup after 1 minute (for testing)
    setTimeout(() => {
      this.runBackup();
    }, 60000);

    // Schedule daily backups at 12:00 AM
    this.cronJob = cron.schedule(this.CRON_SCHEDULE, () => {
      this.runBackup();
    }, {
      timezone: process.env.TIMEZONE || 'UTC',
    });

    logger.info('✓ Backup scheduler started successfully - Daily at 12:00 AM');
  }

  /**
   * Stop the backup scheduler
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      logger.info('✓ Backup scheduler stopped');
    }
  }

  /**
   * Run a complete backup (database + schema) and upload to Google Drive
   */
  async runBackup() {
    try {
      logger.info('========================================');
      logger.info('Starting scheduled backup process...');
      logger.info('========================================');

      const uploadFiles: string[] = [];
      const results: any = {
        database: null,
        schema: null,
        googleDrive: null,
      };

      // 1. Backup Database
      logger.info('\n📊 Step 1: Backing up database...');
      const dbResult = await createBackup();
      results.database = dbResult;

      if (dbResult.success) {
        logger.info('✓ Database backup completed', {
          fileName: dbResult.fileName,
          size: `${(dbResult.size / (1024 * 1024)).toFixed(2)} MB`,
        });
        uploadFiles.push(dbResult.filePath);
      } else {
        logger.error('✗ Database backup failed', { error: dbResult.error });
      }

      // 2. Backup Prisma Schema (with db pull)
      logger.info('\n📝 Step 2: Backing up Prisma schema...');
      const schemaResult = await backupPrismaSchema();
      results.schema = schemaResult;

      if (schemaResult.success) {
        logger.info('✓ Prisma schema backup completed', {
          fileName: schemaResult.fileName,
          size: `${(schemaResult.size / 1024).toFixed(2)} KB`,
        });
        uploadFiles.push(schemaResult.filePath);
      } else {
        logger.error('✗ Prisma schema backup failed', { error: schemaResult.error });
      }

      // 3. Upload to Google Drive
      if (uploadFiles.length > 0) {
        logger.info('\n☁️  Step 3: Uploading backups to Google Drive...');
        
        const uploadResult = await googleDriveService.uploadFiles(uploadFiles);
        results.googleDrive = uploadResult;

        if (uploadResult.success) {
          logger.info('✓ Files uploaded to Google Drive successfully', {
            uploadedCount: uploadResult.uploadedCount,
            totalFiles: uploadFiles.length,
          });

          // Clean up old backups from Google Drive
          await googleDriveService.cleanupOldBackups(10);
        } else {
          logger.error('✗ Google Drive upload failed', { errors: uploadResult.errors });
        }
      }

      // Summary
      logger.info('\n========================================');
      logger.info('Backup Process Summary:');
      logger.info(`  Database: ${results.database?.success ? '✓' : '✗'}`);
      logger.info(`  Schema: ${results.schema?.success ? '✓' : '✗'}`);
      logger.info(`  Google Drive: ${results.googleDrive?.success ? '✓' : '✗'}`);
      logger.info('========================================\n');

    } catch (error: any) {
      logger.error('Error running scheduled backup', { error: error.message });
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      running: this.cronJob !== null,
      schedule: this.CRON_SCHEDULE,
      scheduleDescription: 'Daily at 12:00 AM',
      timezone: process.env.TIMEZONE || 'UTC',
    };
  }
}

// Export singleton instance
export const backupScheduler = new BackupScheduler();
