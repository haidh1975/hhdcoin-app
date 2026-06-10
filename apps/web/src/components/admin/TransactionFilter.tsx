'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const TYPE_OPTIONS = [
  { value: '', label: 'Tất cả loại' },
  { value: 'BUY', label: 'Mua' },
  { value: 'SELL', label: 'Bán' },
  { value: 'DEPOSIT', label: 'Nạp tiền' },
  { value: 'WITHDRAW', label: 'Rút tiền' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'COMPLETED', label: 'Hoàn tất' },
  { value: 'PENDING', label: 'Đang xử lý' },
  { value: 'FAILED', label: 'Thất bại' },
];

export function TransactionFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/transactions?${params.toString()}`);
  }

  const selectCls =
    'bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand transition-colors';

  return (
    <div className="flex items-center gap-2">
      <select
        value={searchParams.get('type') ?? ''}
        onChange={(e) => updateParam('type', e.target.value)}
        className={selectCls}
      >
        {TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        value={searchParams.get('status') ?? ''}
        onChange={(e) => updateParam('status', e.target.value)}
        className={selectCls}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
