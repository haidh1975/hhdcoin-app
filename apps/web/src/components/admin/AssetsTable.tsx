'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { Asset } from '@hhd-i/types';

export function AssetsTable({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function toggleAsset(asset: Asset) {
    setBusyId(asset.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/assets/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !asset.enabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Không thể cập nhật tài sản.');
      } else {
        router.refresh();
      }
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {error && (
        <div className="px-5 py-3 border-b border-dark-600">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-600">
              <th className="text-left text-xs text-dark-400 font-medium px-5 py-3">Tài sản</th>
              <th className="text-left text-xs text-dark-400 font-medium px-3 py-3">Loại</th>
              <th className="text-left text-xs text-dark-400 font-medium px-3 py-3">Trạng thái</th>
              <th className="text-right text-xs text-dark-400 font-medium px-5 py-3">Bật / Tắt</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-brand">{a.symbol[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{a.name}</p>
                      <p className="text-xs text-dark-400">{a.symbol}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      a.type === 'CRYPTO'
                        ? 'bg-brand/10 text-brand'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    {a.type === 'CRYPTO' ? 'Crypto' : 'Cổ phiếu VN'}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      a.enabled
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {a.enabled ? 'Đang giao dịch' : 'Đã tắt'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end">
                    {busyId === a.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-dark-400" />
                    ) : (
                      <button
                        onClick={() => toggleAsset(a)}
                        role="switch"
                        aria-checked={a.enabled}
                        title={a.enabled ? 'Tắt giao dịch' : 'Bật giao dịch'}
                        className={`relative w-10 h-5.5 rounded-full transition-colors ${
                          a.enabled ? 'bg-brand' : 'bg-dark-600'
                        }`}
                        style={{ height: '22px' }}
                      >
                        <span
                          className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white transition-all ${
                            a.enabled ? 'left-[20px]' : 'left-0.5'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
