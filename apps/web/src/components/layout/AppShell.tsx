'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';

const FULLSCREEN_ROUTES = ['/login', '/register'];

/**
 * Khung ứng dụng: hiển thị Sidebar cho các trang trong app,
 * còn /login và /register hiển thị toàn màn hình.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_ROUTES.some((r) => pathname.startsWith(r));

  if (isFullscreen) {
    return <main className="h-screen overflow-y-auto bg-dark-900">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-dark-900">{children}</main>
    </div>
  );
}
