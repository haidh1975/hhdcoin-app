'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MarketPrice } from '@hhd-i/types';

const POLL_INTERVAL_MS = 10_000;

interface UseMarketPricesResult {
  prices: MarketPrice[];
  /** 'live' nếu ít nhất một giá là dữ liệu thật từ sàn */
  source: 'live' | 'mock';
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook lấy giá thị trường, tự động poll mỗi 10 giây.
 */
export function useMarketPrices(symbols: string[]): UseMarketPricesResult {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const key = symbols.join(',');
  const keyRef = useRef(key);
  keyRef.current = key;

  const fetchPrices = useCallback(async () => {
    if (!keyRef.current) {
      setPrices([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/market/prices?symbols=${encodeURIComponent(keyRef.current)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { prices: MarketPrice[] } = await res.json();
      setPrices(data.prices ?? []);
      setError(null);
    } catch {
      setError('Không thể tải dữ liệu thị trường');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPrices();
    const interval = setInterval(fetchPrices, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchPrices, key]);

  const source: 'live' | 'mock' = prices.some((p) => p.source === 'live') ? 'live' : 'mock';

  return { prices, source, loading, error, refresh: fetchPrices };
}
