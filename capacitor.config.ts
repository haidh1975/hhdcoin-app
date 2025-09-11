import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hhdcoin.app',
  appName: 'HHDcoin',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'https://api.coingecko.com',
      'https://api.binance.com',
      'https://*.stripe.com',
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#f59e0b",
      showSpinner: true,
      spinnerColor: "#ffffff"
    },
    StatusBar: {
      backgroundColor: "#f59e0b",
      style: "light"
    }
  }
};

export default config;
