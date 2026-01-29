/**
 * Backup Controller
 * Handles database backup operations
 */

import { Request, Response } from 'express';
import { createBackup, BACKUP_DIR } from '../../../scripts/backup-database-nodejs';
import fs from 'fs';
import path from 'path';

/**
 * Create a database backup
 */
export const createDatabaseBackup = async (req: Request, res: Response) => {
  try {
    console.log('Backup request received from user:', (req as any).user?.email);

    const result = await createBackup();

    if (result.success) {
      res.json({
        success: true,
        message: 'Database backup created successfully',
        data: {
          fileName: result.fileName,
          size: result.size,
          timestamp: result.timestamp,
          location: BACKUP_DIR
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Backup failed',
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create backup',
      error: error.message
    });
  }
};

/**
 * List all available backups
 */
export const listBackups = async (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json({
        success: true,
        data: {
          backups: [],
          count: 0
        }
      });
    }

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.sql') || file.endsWith('.sql.gz') || file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          fileName: file,
          size: stats.size,
          sizeFormatted: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
          createdAt: stats.mtime,
          path: filePath
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({
      success: true,
      data: {
        backups: files,
        count: files.length,
        location: BACKUP_DIR
      }
    });
  } catch (error: any) {
    console.error('Error listing backups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list backups',
      error: error.message
    });
  }
};

/**
 * Download a specific backup file
 */
export const downloadBackup = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;

    // Validate filename to prevent directory traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filePath = path.join(BACKUP_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    res.download(filePath, fileName);
  } catch (error: any) {
    console.error('Error downloading backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download backup',
      error: error.message
    });
  }
};

/**
 * Delete a specific backup file
 */
export const deleteBackup = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;

    // Validate filename
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filePath = path.join(BACKUP_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete backup',
      error: error.message
    });
  }
};
