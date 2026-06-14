/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hhd-i/types'],
  webpack: (config) => {
    // wagmi/walletconnect tham chiếu các module Node tùy chọn không cần ở client.
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    // Các connector tùy chọn không cài đặt (chỉ dùng injected + walletConnect).
    // Đặt alias = false để webpack bỏ qua, tránh lỗi "Module not found".
    config.resolve.alias = {
      ...config.resolve.alias,
      'porto/internal': false,
      porto: false,
      '@base-org/account': false,
      '@coinbase/wallet-sdk': false,
      '@metamask/connect-evm': false,
      '@metamask/sdk': false,
      '@safe-global/safe-apps-sdk': false,
      '@safe-global/safe-apps-provider': false,
      accounts: false,
    };
    return config;
  },
}
module.exports = nextConfig
