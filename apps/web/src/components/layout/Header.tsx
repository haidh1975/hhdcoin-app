'use client';

import { Bell, Search, Wallet } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-dark-800/80 backdrop-blur-md border-b border-dark-600 px-6 py-3">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-base font-semibold text-white flex-shrink-0">{title}</h1>
        )}

        {/* Search */}
        <div className="flex-1 max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-400" />
          <input
            type="text"
            placeholder="Tìm kiếm coin..."
            className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-dark-500 focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Notification Bell */}
          <button className="relative p-2 rounded-lg hover:bg-dark-700 transition-colors">
            <Bell className="w-4 h-4 text-dark-400 hover:text-white transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand rounded-full" />
          </button>

          {/* Wallet Balance */}
          <div className="flex items-center gap-2 bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5">
            <Wallet className="w-3.5 h-3.5 text-brand" />
            <span className="text-sm font-semibold text-white">$198,542</span>
          </div>
        </div>
      </div>
    </header>
  );
}
