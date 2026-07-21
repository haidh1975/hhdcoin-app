import { useState, useEffect, useRef, useCallback } from 'react';

export interface BitcoinPriceData {
  price: number;
  change24h: number;
  timestamp: string;
  source: string;
}

interface UseBitcoinPriceResult {
  data: BitcoinPriceData | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const RECONNECT_DELAY_MS = 5_000;
const MAX_RECONNECT_ATTEMPTS = 10;

function getWsUrl(): string {
  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (apiBase) {
    return apiBase.replace(/^http/, 'ws') + '/ws/bitcoin-price';
  }
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/ws/bitcoin-price`;
}

export function useBitcoinPrice(): UseBitcoinPriceResult {
  const [data, setData] = useState<BitcoinPriceData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const attemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    try {
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        attemptsRef.current = 0;
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(event.data as string);
          if (msg.type === 'price_update') {
            setData(msg.data as BitcoinPriceData);
            setLastUpdated(new Date());
            setIsLoading(false);
          }
          // pong — no action needed on client side
        } catch {
          // ignore malformed frames
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setIsConnected(false);
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setIsConnected(false);

        if (attemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          attemptsRef.current++;
          reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        } else {
          setError('Không thể kết nối real-time. Vui lòng tải lại trang.');
          setIsLoading(false);
        }
      };
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { data, isConnected, isLoading, error, lastUpdated };
}
