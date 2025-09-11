import { ENV_INFO } from './api-config';

/**
 * Mobile debugging utilities
 * Helps diagnose API connectivity issues on mobile devices
 */

export function debugMobileEnvironment() {
  console.log('🔍 HHDcoin Mobile Environment Debug:', {
    platform: ENV_INFO.platform,
    isMobile: ENV_INFO.isMobile,
    baseUrl: ENV_INFO.baseUrl,
    apiBaseEnv: ENV_INFO.apiBaseEnv,
    userAgent: navigator.userAgent,
    location: {
      origin: window.location.origin,
      href: window.location.href,
      protocol: window.location.protocol
    }
  });
}

// Auto-debug on mobile platforms
if (ENV_INFO.isMobile) {
  debugMobileEnvironment();
}

export function testApiConnectivity() {
  console.log('🧪 Testing API connectivity...');
  
  // Test basic fetch to API
  fetch('/api/bitcoin-real-data')
    .then(response => {
      console.log('✅ API connectivity test successful:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('📊 Bitcoin data received:', data);
    })
    .catch(error => {
      console.error('❌ API connectivity test failed:', error);
      console.log('🔧 Check VITE_API_BASE_URL environment variable for mobile builds');
    });
}