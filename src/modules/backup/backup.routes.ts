/**
 * Backup Routes
 * API endpoints for database backup operations
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  createDatabaseBackup,
  listBackups,
  downloadBackup,
  deleteBackup
} from './backup.controller';

const router = Router();

/**
 * @route   POST /api/backup/create
 * @desc    Create a new database backup
 * @access  Private (Admin only)
 */
router.post('/create', authenticate, createDatabaseBackup);

/**
 * @route   GET /api/backup/list
 * @desc    List all available backups
 * @access  Private (Admin only)
 */
router.get('/list', authenticate, listBackups);

/**
 * @route   GET /api/backup/download/:fileName
 * @desc    Download a specific backup file
 * @access  Private (Admin only)
 */
router.get('/download/:fileName', authenticate, downloadBackup);

/**
 * @route   DELETE /api/backup/:fileName
 * @desc    Delete a specific backup file
 * @access  Private (Admin only)
 */
router.delete('/:fileName', authenticate, deleteBackup);

export default router;
