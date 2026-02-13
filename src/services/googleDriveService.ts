/**
 * Google Drive Service
 * Handles file uploads to Google Drive using OAuth2
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

const OAUTH_CREDENTIALS_PATH = path.join(__dirname, '../../google-oauth-credentials.json');
const TOKEN_PATH = path.join(__dirname, '../../google-drive-token.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

class GoogleDriveService {
  private drive: any;
  private folderId: string | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // Initialize on first use to avoid blocking server startup
  }

  /**
   * Initialize Google Drive API with OAuth2
   */
  private async initializeDrive() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Check if OAuth credentials exist
      if (!fs.existsSync(OAUTH_CREDENTIALS_PATH)) {
        logger.warn('Google OAuth credentials not found. Backups will be saved locally only.');
        logger.warn('Run: node scripts/setup-google-oauth.js to set up Google Drive integration');
        return;
      }

      if (!fs.existsSync(TOKEN_PATH)) {
        logger.warn('Google Drive token not found. Backups will be saved locally only.');
        logger.warn('Run: node scripts/setup-google-oauth.js to authenticate');
        return;
      }

      const credentials = JSON.parse(fs.readFileSync(OAUTH_CREDENTIALS_PATH, 'utf-8'));
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));

      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
      
      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );

      oAuth2Client.setCredentials(token);

      // Handle token refresh
      oAuth2Client.on('tokens', (tokens) => {
        if (tokens.refresh_token) {
          // Save new refresh token
          const currentToken = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
          currentToken.refresh_token = tokens.refresh_token;
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(currentToken, null, 2));
        }
      });

      this.drive = google.drive({ version: 'v3', auth: oAuth2Client });
      this.isInitialized = true;
      
      logger.info('✓ Google Drive API initialized successfully');
    } catch (error: any) {
      logger.error('Failed to initialize Google Drive API', { error: error.message });
      logger.warn('Backups will be saved locally only');
    }
  }

  /**
   * Get or create the backup folder in Google Drive
   */
  private async getOrCreateBackupFolder(): Promise<string> {
    if (this.folderId) {
      return this.folderId;
    }

    try {
      const folderName = process.env.GOOGLE_DRIVE_BACKUP_FOLDER || 'Database_Backups';

      // Search for existing folder
      const response = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (response.data.files && response.data.files.length > 0) {
        this.folderId = response.data.files[0].id;
        logger.info(`Found existing backup folder: ${folderName}`);
      } else {
        // Create new folder
        const folderMetadata = {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        };

        const folder = await this.drive.files.create({
          resource: folderMetadata,
          fields: 'id',
        });

        this.folderId = folder.data.id;
        logger.info(`Created new backup folder: ${folderName}`);
      }

      return this.folderId!;
    } catch (error: any) {
      logger.error('Error getting/creating backup folder', { error: error.message });
      throw error;
    }
  }

  /**
   * Upload a file to Google Drive
   */
  async uploadFile(filePath: string, fileName?: string): Promise<{ success: boolean; fileId?: string; error?: string }> {
    try {
      // Initialize if not already done
      await this.initializeDrive();

      // If Drive is not initialized, skip upload (save locally only)
      if (!this.isInitialized || !this.drive) {
        logger.warn('Google Drive not initialized. File saved locally only.');
        return {
          success: false,
          error: 'Google Drive not configured',
        };
      }

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const folderId = await this.getOrCreateBackupFolder();
      const uploadFileName = fileName || path.basename(filePath);

      const fileMetadata = {
        name: uploadFileName,
        parents: [folderId],
      };

      const media = {
        mimeType: this.getMimeType(filePath),
        body: fs.createReadStream(filePath),
      };

      logger.info(`Uploading file to Google Drive: ${uploadFileName}`);

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, size, createdTime',
      });

      const fileSize = fs.statSync(filePath).size;
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

      logger.info(`✓ File uploaded to Google Drive successfully`, {
        fileName: uploadFileName,
        fileId: response.data.id,
        size: `${fileSizeMB} MB`,
      });

      return {
        success: true,
        fileId: response.data.id,
      };
    } catch (error: any) {
      logger.error('Failed to upload file to Google Drive', { 
        filePath, 
        error: error.message 
      });
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload multiple files to Google Drive
   */
  async uploadFiles(filePaths: string[]): Promise<{ success: boolean; uploadedCount: number; errors: string[] }> {
    const errors: string[] = [];
    let uploadedCount = 0;

    for (const filePath of filePaths) {
      const result = await this.uploadFile(filePath);
      if (result.success) {
        uploadedCount++;
      } else {
        errors.push(`${path.basename(filePath)}: ${result.error}`);
      }
    }

    return {
      success: uploadedCount > 0,
      uploadedCount,
      errors,
    };
  }

  /**
   * Delete old backups from Google Drive (keep only last N backups)
   */
  async cleanupOldBackups(maxBackups: number = 10): Promise<void> {
    try {
      if (!this.isInitialized || !this.drive) {
        return;
      }

      const folderId = await this.getOrCreateBackupFolder();

      // List all backup files in the folder
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, createdTime)',
        orderBy: 'createdTime desc',
        spaces: 'drive',
      });

      const files = response.data.files || [];

      if (files.length > maxBackups) {
        const filesToDelete = files.slice(maxBackups);

        logger.info(`Cleaning up ${filesToDelete.length} old backups from Google Drive`);

        for (const file of filesToDelete) {
          await this.drive.files.delete({ fileId: file.id });
          logger.info(`Deleted old backup: ${file.name}`);
        }
      }
    } catch (error: any) {
      logger.error('Error cleaning up old backups', { error: error.message });
    }
  }

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.json': 'application/json',
      '.sql': 'application/sql',
      '.gz': 'application/gzip',
      '.prisma': 'text/plain',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();
