import { useState, useEffect, useRef } from 'react';

export interface MarketAsset {
  symbol: string;
  name: string;
  type: 'crypto' | 'stock' | 'index' | 'commodity';
  price: number;
  change24h: number;
  source: string;
}

interface UseMarketDataResult {
  assets: MarketAsset[];
  isLoading: boolean;
  lastUpdated: Date | null;
}

function getWsUrl(): string {
  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (apiBase) return apiBase.replace(/^http/, 'ws') + '/ws/bitcoin-price';
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/ws/bitcoin-price`;
}

/**
 * Giá đa tài sản real-time: REST lần đầu (hiển thị ngay), WebSocket cập nhật sau.
 */
export function useMarketData(): UseMarketDataResult {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let mounted = true;

    // 1. REST — dữ liệu hiển thị ngay
    fetch('/api/assets')
      .then(r => r.json())
      .then(data => {
        if (mounted && Array.isArray(data.assets)) {
          setAssets(data.assets);
          setLastUpdated(new Date());
          setIsLoading(false);
        }
      })
      .catch(() => { if (mounted) setIsLoading(false); });

    // 2. WebSocket — cập nhật real-time
    try {
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;
      ws.onmessage = (event) => {
        if (!mounted) return;
        try {
          const msg = JSON.parse(event.data as string);
          if (msg.type === 'market_update' && Array.isArray(msg.data)) {
            setAssets(msg.data);
            setLastUpdated(new Date());
            setIsLoading(false);
          }
        } catch { /* ignore */ }
      };
    } catch { /* WS optional — REST đã có dữ liệu */ }

    return () => {
      mounted = false;
      wsRef.current?.close();
    };
  }, []);

  return { assets, isLoading, lastUpdated };
}
