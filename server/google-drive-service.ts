// Google Drive Backup Service
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { exec } from 'child_process';
import { promisify } from 'util';
import { log } from './vite';

const execAsync = promisify(exec);

interface BackupOptions {
  includeDatabase?: boolean;
  includeWebFiles?: boolean;
  includeUserUploads?: boolean;
  filename?: string;
}

interface GoogleDriveConfig {
  clientEmail: string;
  privateKey: string;
  folderId: string;
}

class GoogleDriveBackupService {
  private drive: any;
  private config: GoogleDriveConfig | null = null;
  private isAvailable = false;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      // Check for Google Drive credentials in environment
      const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

      if (!clientEmail || !privateKey || !folderId) {
        log('[GoogleDrive] Missing credentials - backup service disabled');
        log('[GoogleDrive] Required: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_DRIVE_FOLDER_ID');
        return;
      }

      this.config = {
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'), // Fix escaped newlines
        folderId
      };

      // Initialize Google Drive API
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: this.config.clientEmail,
          private_key: this.config.privateKey
        },
        scopes: ['https://www.googleapis.com/auth/drive.file']
      });

      this.drive = google.drive({ version: 'v3', auth });
      this.isAvailable = true;

      log('[GoogleDrive] Service initialized successfully');
      log(`[GoogleDrive] Backup folder ID: ${this.config.folderId}`);
      
      // Test connection
      await this.testConnection();
    } catch (error: any) {
      log(`[GoogleDrive] Failed to initialize: ${error.message}`);
      this.isAvailable = false;
    }
  }

  private async testConnection(): Promise<boolean> {
    try {
      if (!this.isAvailable || !this.drive) return false;

      // Test by getting folder info
      await this.drive.files.get({
        fileId: this.config!.folderId,
        fields: 'id,name'
      });

      log('[GoogleDrive] Connection test successful');
      return true;
    } catch (error: any) {
      log(`[GoogleDrive] Connection test failed: ${error.message}`);
      this.isAvailable = false;
      return false;
    }
  }

  // Upload file to Google Drive
  private async uploadFile(filePath: string, fileName: string): Promise<string | null> {
    try {
      if (!this.isAvailable || !this.drive) {
        throw new Error('Google Drive service not available');
      }

      const response = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: [this.config!.folderId]
        },
        media: {
          mimeType: 'application/octet-stream',
          body: fs.createReadStream(filePath)
        }
      });

      log(`[GoogleDrive] File uploaded: ${fileName} (${response.data.id})`);
      return response.data.id;
    } catch (error: any) {
      log(`[GoogleDrive] Upload failed: ${error.message}`);
      return null;
    }
  }

  // Create database backup
  private async createDatabaseBackup(backupDir: string): Promise<string | null> {
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        log('[GoogleDrive] DATABASE_URL not found, skipping database backup');
        return null;
      }

      const backupFile = path.join(backupDir, 'database_backup.sql');
      
      // Use pg_dump for PostgreSQL backup
      const command = `pg_dump "${dbUrl}" > "${backupFile}"`;
      await execAsync(command);

      if (fs.existsSync(backupFile) && fs.statSync(backupFile).size > 0) {
        log('[GoogleDrive] Database backup created successfully');
        return backupFile;
      } else {
        log('[GoogleDrive] Database backup failed - empty or missing file');
        return null;
      }
    } catch (error: any) {
      log(`[GoogleDrive] Database backup failed: ${error.message}`);
      return null;
    }
  }

  // Create web files backup
  private async createWebBackup(backupDir: string): Promise<string | null> {
    try {
      const webBackupFile = path.join(backupDir, 'web_backup.zip');
      
      const archive = archiver('zip', { zlib: { level: 9 } });
      const output = fs.createWriteStream(webBackupFile);

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          log(`[GoogleDrive] Web backup created: ${archive.pointer()} bytes`);
          resolve(webBackupFile);
        });

        archive.on('error', (err: Error) => {
          log(`[GoogleDrive] Web backup failed: ${err.message}`);
          reject(err);
        });

        archive.pipe(output);

        // Add important web files
        if (fs.existsSync('client/dist')) {
          archive.directory('client/dist/', 'dist/');
        }
        if (fs.existsSync('client/src')) {
          archive.directory('client/src/', 'src/');
        }
        if (fs.existsSync('server')) {
          archive.directory('server/', 'server/');
        }
        if (fs.existsSync('shared')) {
          archive.directory('shared/', 'shared/');
        }

        // Add configuration files
        const configFiles = [
          'package.json',
          'vite.config.ts',
          'tailwind.config.ts',
          'tsconfig.json',
          'replit.md'
        ];

        configFiles.forEach(file => {
          if (fs.existsSync(file)) {
            archive.file(file, { name: file });
          }
        });

        archive.finalize();
      });
    } catch (error: any) {
      log(`[GoogleDrive] Web backup failed: ${error.message}`);
      return null;
    }
  }

  // Create app data backup (user uploads, temp files, etc.)
  private async createAppDataBackup(backupDir: string): Promise<string | null> {
    try {
      const appDataFile = path.join(backupDir, 'app_data.zip');
      
      const archive = archiver('zip', { zlib: { level: 9 } });
      const output = fs.createWriteStream(appDataFile);

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          if (archive.pointer() > 0) {
            log(`[GoogleDrive] App data backup created: ${archive.pointer()} bytes`);
            resolve(appDataFile);
          } else {
            log('[GoogleDrive] No app data to backup');
            resolve(null);
          }
        });

        archive.on('error', (err: Error) => {
          log(`[GoogleDrive] App data backup failed: ${err.message}`);
          reject(err);
        });

        archive.pipe(output);

        // Add any user data directories if they exist
        const dataDirs = ['uploads', 'temp', 'logs', 'data'];
        let hasData = false;

        dataDirs.forEach(dir => {
          if (fs.existsSync(dir)) {
            archive.directory(dir, `${dir}/`);
            hasData = true;
          }
        });

        if (hasData) {
          archive.finalize();
        } else {
          resolve(null);
        }
      });
    } catch (error: any) {
      log(`[GoogleDrive] App data backup failed: ${error.message}`);
      return null;
    }
  }

  // Main backup method
  async createBackup(options: BackupOptions = {}): Promise<{
    success: boolean;
    fileIds: string[];
    errors: string[];
    timestamp: Date;
  }> {
    const result = {
      success: false,
      fileIds: [] as string[],
      errors: [] as string[],
      timestamp: new Date()
    };

    if (!this.isAvailable) {
      result.errors.push('Google Drive service not available');
      return result;
    }

    // Create temporary backup directory
    const backupDir = path.join(process.cwd(), 'temp_backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPrefix = options.filename || `hhdcoin_backup_${timestamp}`;

      log(`[GoogleDrive] Starting backup: ${backupPrefix}`);

      // Database backup
      if (options.includeDatabase !== false) {
        try {
          const dbBackupFile = await this.createDatabaseBackup(backupDir);
          if (dbBackupFile) {
            const fileId = await this.uploadFile(dbBackupFile, `${backupPrefix}_database.sql`);
            if (fileId) {
              result.fileIds.push(fileId);
            } else {
              result.errors.push('Database backup upload failed');
            }
          }
        } catch (error: any) {
          result.errors.push(`Database backup error: ${error.message}`);
        }
      }

      // Web files backup
      if (options.includeWebFiles !== false) {
        try {
          const webBackupFile = await this.createWebBackup(backupDir);
          if (webBackupFile) {
            const fileId = await this.uploadFile(webBackupFile, `${backupPrefix}_web.zip`);
            if (fileId) {
              result.fileIds.push(fileId);
            } else {
              result.errors.push('Web backup upload failed');
            }
          }
        } catch (error: any) {
          result.errors.push(`Web backup error: ${error.message}`);
        }
      }

      // App data backup
      if (options.includeUserUploads !== false) {
        try {
          const appDataFile = await this.createAppDataBackup(backupDir);
          if (appDataFile) {
            const fileId = await this.uploadFile(appDataFile, `${backupPrefix}_appdata.zip`);
            if (fileId) {
              result.fileIds.push(fileId);
            } else {
              result.errors.push('App data backup upload failed');
            }
          }
        } catch (error: any) {
          result.errors.push(`App data backup error: ${error.message}`);
        }
      }

      result.success = result.fileIds.length > 0;
      
      if (result.success) {
        log(`[GoogleDrive] Backup completed: ${result.fileIds.length} files uploaded`);
      } else {
        log('[GoogleDrive] Backup failed: no files uploaded');
      }

    } catch (error: any) {
      result.errors.push(`Backup error: ${error.message}`);
      log(`[GoogleDrive] Backup error: ${error.message}`);
    } finally {
      // Cleanup temporary files
      try {
        if (fs.existsSync(backupDir)) {
          fs.rmSync(backupDir, { recursive: true, force: true });
        }
      } catch (cleanupError: any) {
        log(`[GoogleDrive] Cleanup error: ${cleanupError.message}`);
      }
    }

    return result;
  }

  // List recent backups
  async listBackups(limit: number = 10): Promise<Array<{
    id: string;
    name: string;
    size: number;
    createdTime: string;
  }>> {
    try {
      if (!this.isAvailable || !this.drive) {
        return [];
      }

      const response = await this.drive.files.list({
        q: `"${this.config!.folderId}" in parents and (name contains "hhdcoin_backup" or name contains "scheduled_backup" or name contains "manual_backup" or name contains "test_backup")`,
        fields: 'files(id,name,size,createdTime)',
        orderBy: 'createdTime desc',
        pageSize: limit
      });

      return response.data.files || [];
    } catch (error: any) {
      log(`[GoogleDrive] List backups failed: ${error.message}`);
      return [];
    }
  }

  // Delete old backups (keep last N backups)
  async cleanupOldBackups(keepCount: number = 5): Promise<number> {
    try {
      if (!this.isAvailable || !this.drive) {
        return 0;
      }

      const backups = await this.listBackups(50); // Get more than we need
      if (backups.length <= keepCount) {
        return 0; // Nothing to delete
      }

      const toDelete = backups.slice(keepCount);
      let deletedCount = 0;

      for (const backup of toDelete) {
        try {
          await this.drive.files.delete({
            fileId: backup.id
          });
          deletedCount++;
          log(`[GoogleDrive] Deleted old backup: ${backup.name}`);
        } catch (deleteError: any) {
          log(`[GoogleDrive] Failed to delete ${backup.name}: ${deleteError.message}`);
        }
      }

      log(`[GoogleDrive] Cleanup completed: ${deletedCount} old backups deleted`);
      return deletedCount;
    } catch (error: any) {
      log(`[GoogleDrive] Cleanup failed: ${error.message}`);
      return 0;
    }
  }

  // Get service status
  getStatus(): {
    available: boolean;
    configured: boolean;
    lastError?: string;
  } {
    return {
      available: this.isAvailable,
      configured: this.config !== null,
      lastError: this.isAvailable ? undefined : 'Service not properly configured'
    };
  }
}

// Singleton instance
export const googleDriveService = new GoogleDriveBackupService();