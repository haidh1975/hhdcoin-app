'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCopyToClipboardResult {
  /** Khóa của mục vừa được sao chép, `null` nếu chưa/hết hạn. */
  copiedKey: string | null;
  /** Sao chép `text`; `key` dùng để phân biệt nhiều nút sao chép (mặc định là chính `text`). */
  copy: (text: string, key?: string) => Promise<void>;
  isCopied: (key: string) => boolean;
}

/**
 * Sao chép vào clipboard kèm trạng thái "đã sao chép" tự reset.
 */
export function useCopyToClipboard(resetMs = 2000): UseCopyToClipboardResult {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  const copy = useCallback(
    async (text: string, key?: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        return;
      }
      setCopiedKey(key ?? text);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopiedKey(null), resetMs);
    },
    [resetMs]
  );

  const isCopied = useCallback((key: string) => copiedKey === key, [copiedKey]);

  return { copiedKey, copy, isCopied };
}
