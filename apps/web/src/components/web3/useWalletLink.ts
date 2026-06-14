'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Hook quản lý liên kết địa chỉ ví on-chain với tài khoản đã đăng nhập.
 * Không chặn UI: chỉ tải địa chỉ đã lưu và cung cấp hành động liên kết tùy chọn.
 */
export function useWalletLink(connectedAddress?: string) {
  const { status } = useSession();
  const [linkedAddress, setLinkedAddress] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  // Tải địa chỉ đã liên kết khi đăng nhập.
  useEffect(() => {
    if (status !== 'authenticated') {
      setLinkedAddress(null);
      return;
    }
    let active = true;
    fetch('/api/profile/wallet')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data) setLinkedAddress(data.walletAddress ?? null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [status]);

  const link = useCallback(async () => {
    if (!connectedAddress) return;
    setLinking(true);
    try {
      const res = await fetch('/api/profile/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: connectedAddress }),
      });
      if (res.ok) {
        const data = await res.json();
        setLinkedAddress(data.walletAddress ?? null);
      }
    } finally {
      setLinking(false);
    }
  }, [connectedAddress]);

  const isLoggedIn = status === 'authenticated';
  const normalizedConnected = connectedAddress?.toLowerCase();
  // Hiển thị nút liên kết khi đã đăng nhập, có ví kết nối, và địa chỉ chưa khớp.
  const canLink =
    isLoggedIn &&
    !!normalizedConnected &&
    !linking &&
    linkedAddress !== normalizedConnected;

  return { linkedAddress, linking, link, canLink, isLoggedIn };
}
