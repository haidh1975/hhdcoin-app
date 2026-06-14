'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Home,
  Bot,
  ShieldAlert,
  BarChart2,
  MessageCircle,
  Zap,
  GraduationCap,
  Newspaper,
  BookOpen,
  Phone,
  Wallet,
  ShieldCheck,
  Coins,
  Lock,
  Landmark,
  Rocket,
  Map as MapIcon,
  FileText,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Tổng quan' },
  { href: '/portfolio', icon: Wallet, label: 'Danh mục' },
  { href: '/assistant', icon: Bot, label: 'Trợ lý AI' },
  { href: '/risk', icon: ShieldAlert, label: 'Quản lý rủi ro' },
  { href: '/sentiment', icon: BarChart2, label: 'Phân tích tâm lý' },
  { href: '/support', icon: MessageCircle, label: 'Hỗ trợ' },
];

const HHD_ITEMS = [
  { href: '/hhd-token', icon: Coins, label: 'HHD Coin' },
  { href: '/staking', icon: Lock, label: 'Staking' },
  { href: '/governance', icon: Landmark, label: 'Quản trị DAO' },
  { href: '/token-sale', icon: Rocket, label: 'Token Sale' },
  { href: '/roadmap', icon: MapIcon, label: 'Lộ trình' },
  { href: '/whitepaper', icon: FileText, label: 'Whitepaper' },
];

const INFO_ITEMS = [
  { href: '/dao-tao', icon: GraduationCap, label: 'Đào tạo' },
  { href: '/tin-tuc', icon: Newspaper, label: 'Tin tức' },
  { href: '/sach', icon: BookOpen, label: 'Sách' },
  { href: '/lien-he', icon: Phone, label: 'Liên hệ' },
];

function NavLink({
  href,
  icon: Icon,
  label,
  isActive,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group ${
        isActive
          ? 'text-brand bg-brand/10'
          : 'text-dark-400 hover:text-white hover:bg-dark-700'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-brand rounded-r-full" />
      )}
      <Icon
        className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand' : 'text-dark-500 group-hover:text-white'}`}
      />
      <span>{label}</span>
      {badge && (
        <span className="ml-auto text-xs bg-brand text-black font-bold px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name ?? 'Khách';
  const userEmail = session?.user?.email ?? '';
  const isAdmin = session?.user?.role === 'ADMIN';
  const initial = userName.charAt(0).toUpperCase() || 'H';

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
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isActive}
              badge={item.href === '/assistant' ? 'AI' : undefined}
            />
          );
        })}

        <div className="pt-3 mt-3 border-t border-dark-700">
          <p className="text-xs text-dark-500 font-medium uppercase tracking-wider px-3 mb-2">
            HHD Coin
          </p>
          {HHD_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname.startsWith(item.href)}
            />
          ))}
        </div>

        <div className="pt-3 mt-3 border-t border-dark-700">
          <p className="text-xs text-dark-500 font-medium uppercase tracking-wider px-3 mb-2">
            Học tập &amp; Thông tin
          </p>
          {INFO_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname.startsWith(item.href)}
            />
          ))}
        </div>

        {isAdmin && (
          <div className="pt-3 mt-3 border-t border-dark-700">
            <p className="text-xs text-dark-500 font-medium uppercase tracking-wider px-3 mb-2">
              Quản trị hệ thống
            </p>
            <NavLink
              href="/admin"
              icon={ShieldCheck}
              label="Quản trị"
              isActive={pathname.startsWith('/admin')}
            />
          </div>
        )}
      </nav>

      {/* Bottom User Section */}
      <div className="px-3 py-4 border-t border-dark-600">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-dark-700 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-black">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-dark-500 truncate">{userEmail}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Đăng xuất"
            className="p-1.5 rounded-md text-dark-500 hover:text-red-400 hover:bg-dark-600 transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
