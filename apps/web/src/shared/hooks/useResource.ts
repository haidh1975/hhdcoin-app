'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export interface UseResourceOptions<T> {
  /** Giá trị khởi tạo trước khi tải xong. */
  initialData: T;
  /** Nếu đặt, tự động tải lại theo chu kỳ (ms). */
  pollMs?: number;
  /** Mặc định `true` — tải ngay khi mount. Đặt `false` để chỉ tải khi gọi `refresh`. */
  immediate?: boolean;
}

export interface UseResourceResult<T> {
  data: T;
  /** `true` cho tới khi lần tải ĐẦU TIÊN kết thúc. Không bật lại khi refresh. */
  loading: boolean;
  /** `true` mỗi khi có một lượt tải đang chạy (kể cả refresh thủ công). */
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setData: Dispatch<SetStateAction<T>>;
}

/**
 * Hook tải dữ liệu dùng chung: tải lần đầu, refresh thủ công, poll tùy chọn.
 *
 * Khi `fetcher` ném lỗi, dữ liệu cũ được GIỮ NGUYÊN (nhiều trang cố ý hiển thị
 * dữ liệu cũ khi mạng lỗi) và chỉ `error` được cập nhật. `fetcher` nhận giá trị
 * hiện tại nên có thể trả lại chính nó để bỏ qua một phần cập nhật.
 */
export function useResource<T>(
  fetcher: (previous: T) => Promise<T>,
  { initialData, pollMs, immediate = true }: UseResourceOptions<T>
): UseResourceResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(immediate);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const dataRef = useRef(data);
  dataRef.current = data;

  const activeRef = useRef(true);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const next = await fetcherRef.current(dataRef.current);
      if (!activeRef.current) return;
      setData(next);
      setError(null);
    } catch (err) {
      if (!activeRef.current) return;
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    } finally {
      if (activeRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    activeRef.current = true;
    if (!immediate) {
      return () => {
        activeRef.current = false;
      };
    }
    refresh();
    if (!pollMs) {
      return () => {
        activeRef.current = false;
      };
    }
    const interval = setInterval(refresh, pollMs);
    return () => {
      activeRef.current = false;
      clearInterval(interval);
    };
  }, [refresh, immediate, pollMs]);

  return { data, loading, refreshing, error, refresh, setData };
}
