// Automated Backup Scheduler for Google Drive
import cron, { ScheduledTask } from 'node-cron';
import { env } from './config/env';
import { googleDriveService } from './google-drive-service';
import { log } from './vite';

interface BackupScheduleConfig {
  enabled: boolean;
  schedule: string; // Cron expression
  includeDatabase: boolean;
  includeWebFiles: boolean;
  includeUserUploads: boolean;
  keepBackups: number;
  autoCleanup: boolean;
}

class BackupScheduler {
  private scheduledTask: ScheduledTask | null = null;
  private config: BackupScheduleConfig;
  private isRunning = false;

  constructor() {
    // Default configuration
    this.config = {
      enabled: env.BACKUP_SCHEDULER_ENABLED === 'true',
      schedule: env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
      includeDatabase: true,
      includeWebFiles: true,
      includeUserUploads: true,
      keepBackups: parseInt(env.BACKUP_KEEP_COUNT || '7'),
      autoCleanup: true
    };

    log(`[BackupScheduler] Initialized with config: ${JSON.stringify(this.config)}`);
  }

  // Start the backup scheduler
  start(): void {
    if (!this.config.enabled) {
      log('[BackupScheduler] Scheduler disabled - set BACKUP_SCHEDULER_ENABLED=true to enable');
      return;
    }

    if (this.scheduledTask) {
      log('[BackupScheduler] Already running');
      return;
    }

    try {
      this.scheduledTask = cron.schedule(this.config.schedule, async () => {
        await this.runScheduledBackup();
      }, {
        timezone: 'UTC'
      });

      this.scheduledTask.start();
      
      log(`[BackupScheduler] Started with schedule: ${this.config.schedule}`);
      log(`[BackupScheduler] Next backup: ${this.getNextScheduledTime()}`);
    } catch (error: any) {
      log(`[BackupScheduler] Failed to start: ${error.message}`);
    }
  }

  // Stop the scheduler
  stop(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      log('[BackupScheduler] Stopped');
    }
  }

  // Get next scheduled backup time
  getNextScheduledTime(): string | null {
    if (!this.scheduledTask) return null;
    
    try {
      const task = this.scheduledTask as any;
      return task.nextDate().format();
    } catch {
      return null;
    }
  }

  // Run scheduled backup
  private async runScheduledBackup(): Promise<void> {
    if (this.isRunning) {
      log('[BackupScheduler] Backup already in progress, skipping');
      return;
    }

    this.isRunning = true;
    log('[BackupScheduler] Starting scheduled backup...');

    try {
      const startTime = new Date();
      
      // Create backup with timestamp
      const timestamp = startTime.toISOString().replace(/[:.]/g, '-');
      const result = await googleDriveService.createBackup({
        includeDatabase: this.config.includeDatabase,
        includeWebFiles: this.config.includeWebFiles,
        includeUserUploads: this.config.includeUserUploads,
        filename: `scheduled_backup_${timestamp}`
      });

      const duration = (new Date().getTime() - startTime.getTime()) / 1000;

      if (result.success) {
        log(`[BackupScheduler] Backup completed in ${duration}s - ${result.fileIds.length} files uploaded`);
        
        if (result.errors.length > 0) {
          log(`[BackupScheduler] Backup had errors: ${result.errors.join(', ')}`);
        }

        // Run cleanup if enabled
        if (this.config.autoCleanup) {
          try {
            const deletedCount = await googleDriveService.cleanupOldBackups(this.config.keepBackups);
            if (deletedCount > 0) {
              log(`[BackupScheduler] Cleaned up ${deletedCount} old backups`);
            }
          } catch (cleanupError: any) {
            log(`[BackupScheduler] Cleanup failed: ${cleanupError.message}`);
          }
        }
      } else {
        log(`[BackupScheduler] Backup failed after ${duration}s: ${result.errors.join(', ')}`);
      }

    } catch (error: any) {
      log(`[BackupScheduler] Backup error: ${error.message}`);
    } finally {
      this.isRunning = false;
      log(`[BackupScheduler] Next backup: ${this.getNextScheduledTime()}`);
    }
  }

  // Run backup manually (for testing/admin trigger)
  async runManualBackup(): Promise<{
    success: boolean;
    fileIds: string[];
    errors: string[];
    duration: number;
  }> {
    if (this.isRunning) {
      throw new Error('Backup already in progress');
    }

    this.isRunning = true;
    const startTime = new Date();
    
    try {
      const timestamp = startTime.toISOString().replace(/[:.]/g, '-');
      const result = await googleDriveService.createBackup({
        includeDatabase: this.config.includeDatabase,
        includeWebFiles: this.config.includeWebFiles,
        includeUserUploads: this.config.includeUserUploads,
        filename: `manual_backup_${timestamp}`
      });

      const duration = (new Date().getTime() - startTime.getTime()) / 1000;
      
      return {
        success: result.success,
        fileIds: result.fileIds,
        errors: result.errors,
        duration
      };
    } finally {
      this.isRunning = false;
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<BackupScheduleConfig>): void {
    const wasEnabled = this.config.enabled;
    const oldSchedule = this.config.schedule;
    
    this.config = { ...this.config, ...newConfig };
    
    // Restart if schedule changed or enabled/disabled
    if (wasEnabled !== this.config.enabled || oldSchedule !== this.config.schedule) {
      this.stop();
      if (this.config.enabled) {
        this.start();
      }
    }
    
    log(`[BackupScheduler] Configuration updated: ${JSON.stringify(this.config)}`);
  }

  // Get current status
  getStatus(): {
    enabled: boolean;
    running: boolean;
    nextBackup: string | null;
    config: BackupScheduleConfig;
    backupInProgress: boolean;
  } {
    return {
      enabled: this.config.enabled,
      running: this.scheduledTask !== null,
      nextBackup: this.getNextScheduledTime(),
      config: this.config,
      backupInProgress: this.isRunning
    };
  }

  // Test backup (create small test backup)
  async testBackup(): Promise<boolean> {
    try {
      log('[BackupScheduler] Running test backup...');
      
      const result = await googleDriveService.createBackup({
        includeDatabase: false, // Skip DB for test
        includeWebFiles: true,  // Just web files
        includeUserUploads: false, // Skip uploads
        filename: `test_backup_${Date.now()}`
      });

      const success = result.success && result.fileIds.length > 0;
      log(`[BackupScheduler] Test backup ${success ? 'succeeded' : 'failed'}`);
      
      return success;
    } catch (error: any) {
      log(`[BackupScheduler] Test backup failed: ${error.message}`);
      return false;
    }
  }

  // Graceful shutdown
  shutdown(): void {
    log('[BackupScheduler] Shutting down...');
    
    if (this.isRunning) {
      log('[BackupScheduler] Waiting for current backup to complete...');
      // Note: In production, you might want to implement a timeout here
    }
    
    this.stop();
    log('[BackupScheduler] Shutdown complete');
  }
}

// Singleton instance
export const backupScheduler = new BackupScheduler();