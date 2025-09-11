import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

/**
 * Secure storage utility that uses Capacitor Preferences on mobile
 * and falls back to localStorage on web
 */
class SecureStorage {
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isNative) {
        await Preferences.set({
          key,
          value,
        });
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('SecureStorage.setItem error:', error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isNative) {
        const { value } = await Preferences.get({ key });
        return value;
      } else {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.error('SecureStorage.getItem error:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.isNative) {
        await Preferences.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('SecureStorage.removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.isNative) {
        await Preferences.clear();
      } else {
        localStorage.clear();
      }
    } catch (error) {
      console.error('SecureStorage.clear error:', error);
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      if (this.isNative) {
        const { keys } = await Preferences.keys();
        return keys;
      } else {
        return Object.keys(localStorage);
      }
    } catch (error) {
      console.error('SecureStorage.keys error:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const secureStorage = new SecureStorage();

// Storage keys constants
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'hhdcoin_token',
  AUTH_USER: 'hhdcoin_user',
} as const;