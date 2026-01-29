/**
 * Backup Scheduler Service
 * Automatically creates database backups on a schedule
 */

import { createBackup } from '../../scripts/backup-database-nodejs';
import { logger } from '../utils/logger';

class BackupScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  /**
   * Start the backup scheduler
   * @param intervalMs - Interval in milliseconds (default: 1 week)
   */
  start(intervalMs: number = this.WEEK_IN_MS) {
    if (this.intervalId) {
      logger.warn('Backup scheduler is already running');
      return;
    }

    logger.info(`Starting backup scheduler (interval: ${this.formatDuration(intervalMs)})`);

    // Run initial backup after 1 minute
    setTimeout(() => {
      this.runBackup();
    }, 60000);

    // Schedule recurring backups
    this.intervalId = setInterval(() => {
      this.runBackup();
    }, intervalMs);

    logger.info('✓ Backup scheduler started successfully');
  }

  /**
   * Stop the backup scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('✓ Backup scheduler stopped');
    }
  }

  /**
   * Run a backup immediately
   */
  async runBackup() {
    try {
      logger.info('Starting scheduled database backup...');
      const result = await createBackup();

      if (result.success) {
        logger.info('✓ Scheduled backup completed successfully', {
          fileName: result.fileName,
          size: `${(result.size / (1024 * 1024)).toFixed(2)} MB`,
          timestamp: result.timestamp
        });
      } else {
        logger.error('✗ Scheduled backup failed', { error: result.error });
      }
    } catch (error: any) {
      logger.error('Error running scheduled backup', { error: error.message });
    }
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ') || '0m';
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      running: this.intervalId !== null,
      interval: this.WEEK_IN_MS,
      intervalFormatted: this.formatDuration(this.WEEK_IN_MS)
    };
  }
}

// Export singleton instance
export const backupScheduler = new BackupScheduler();
