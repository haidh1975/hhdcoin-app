'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ArrowLeftRight, Coins, Landmark, Rocket } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';

const ADMIN_NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Tổng quan' },
  { href: '/admin/users', icon: Users, label: 'Người dùng' },
  { href: '/admin/transactions', icon: ArrowLeftRight, label: 'Giao dịch' },
  { href: '/admin/assets', icon: Coins, label: 'Tài sản' },
  { href: '/admin/governance', icon: Landmark, label: 'Quản trị DAO' },
  { href: '/admin/token-sale', icon: Rocket, label: 'Vòng bán' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <Card className="flex items-center gap-1 p-1.5 w-fit">
      {ADMIN_NAV.map((item) => {
        const isActive =
          item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand/10 text-brand'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </Card>
  );
}
