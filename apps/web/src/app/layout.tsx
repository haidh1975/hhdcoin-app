import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'HHD-I | AI Crypto Platform',
  description: 'Nền tảng đầu tư crypto thông minh với AI - Phân tích rủi ro, DCA tự động, và hỗ trợ 24/7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="bg-dark-900 text-white antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-dark-900">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
