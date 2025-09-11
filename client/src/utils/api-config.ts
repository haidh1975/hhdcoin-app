import { Capacitor } from '@capacitor/core';

/**
 * API Configuration for different environments
 * 
 * Web: Uses relative URLs (/api/...) - proxied by Vite dev server
 * Mobile: Uses absolute URLs to remote backend
 */

export const API_CONFIG = {
  // Base URL for API requests
  getBaseUrl(): string {
    // Check if running in Capacitor (mobile native environment)
    if (Capacitor.isNativePlatform()) {
      // Production mobile app - use deployed API server
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      
      if (!apiBaseUrl) {
        throw new Error(
          'VITE_API_BASE_URL environment variable is required for mobile builds. ' +
          'Please set it to your deployed backend URL (e.g., https://api.hhdcoin.com)'
        );
      }
      
      return apiBaseUrl;
    }
    
    // Web environment - use relative URLs (proxied by Vite)
    return '';
  },

  // Build full API URL
  buildUrl(path: string): string {
    const baseUrl = this.getBaseUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    return baseUrl + normalizedPath;
  },

  // Check if we're in mobile environment
  isMobile(): boolean {
    return Capacitor.isNativePlatform();
  },

  // Get platform info for debugging
  getPlatform(): string {
    return Capacitor.getPlatform();
  }
};

// Helper function to build API URLs
export function apiUrl(path: string): string {
  return API_CONFIG.buildUrl(path);
}

// Environment info for debugging
export const ENV_INFO = {
  platform: API_CONFIG.getPlatform(),
  isMobile: API_CONFIG.isMobile(),
  baseUrl: API_CONFIG.getBaseUrl(),
  apiBaseEnv: import.meta.env.VITE_API_BASE_URL
};