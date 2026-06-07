'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Bot,
  ShieldAlert,
  BarChart2,
  MessageCircle,
  Settings,
  Zap,
  GraduationCap,
  Newspaper,
  BookOpen,
  Phone,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Tổng quan' },
  { href: '/assistant', icon: Bot, label: 'Trợ lý AI' },
  { href: '/risk', icon: ShieldAlert, label: 'Quản lý rủi ro' },
  { href: '/sentiment', icon: BarChart2, label: 'Phân tích tâm lý' },
  { href: '/support', icon: MessageCircle, label: 'Hỗ trợ' },
];

const INFO_ITEMS = [
  { href: '/dao-tao', icon: GraduationCap, label: 'Đào tạo' },
  { href: '/tin-tuc', icon: Newspaper, label: 'Tin tức' },
  { href: '/sach', icon: BookOpen, label: 'Sách' },
  { href: '/lien-he', icon: Phone, label: 'Liên hệ' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col bg-dark-800 border-r border-dark-600 flex-shrink-0"
      style={{ width: '240px' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-dark-600">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-black" fill="black" />
        </div>
        <div>
          <span className="text-lg font-bold text-white tracking-tight">HHD-I</span>
          <p className="text-xs text-dark-400 -mt-0.5">AI Crypto Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-dark-500 font-medium uppercase tracking-wider px-3 mb-2">
          AI Platform
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group ${
                isActive
                  ? 'text-brand bg-brand/10'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-brand rounded-r-full" />
              )}
              <item.icon
                className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand' : 'text-dark-500 group-hover:text-white'}`}
              />
              <span>{item.label}</span>
              {item.href === '/assistant' && (
                <span className="ml-auto text-xs bg-brand text-black font-bold px-1.5 py-0.5 rounded-full">
                  AI
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-dark-700">
          <p className="text-xs text-dark-500 font-medium uppercase tracking-wider px-3 mb-2">
            Học tập & Thông tin
          </p>
          {INFO_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group ${
                  isActive
                    ? 'text-brand bg-brand/10'
                    : 'text-dark-400 hover:text-white hover:bg-dark-700'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-brand rounded-r-full" />
                )}
                <item.icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand' : 'text-dark-500 group-hover:text-white'}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom User Section */}
      <div className="px-3 py-4 border-t border-dark-600">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-dark-700 cursor-pointer transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-black">H</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Haidh</p>
            <p className="text-xs text-dark-500 truncate">haidh1975@gmail.com</p>
          </div>
          <Settings className="w-3.5 h-3.5 text-dark-500 group-hover:text-brand transition-colors flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
