'use client';

import { useState } from 'react';
import { Rocket, AlertCircle, History } from 'lucide-react';
import type { SaleRoundInfo, SalePurchaseInfo } from '@hhd-i/types';
import { Card } from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Spinner } from '@/shared/components/ui/Spinner';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { SALE_ROUND_STATUS_META } from '@/shared/constants/status';
import { useResource } from '@/shared/hooks/useResource';
import { formatDateTime, formatNumber } from '@/shared/utils/format';

interface TokenSaleData {
  rounds: SaleRoundInfo[];
  purchases: SalePurchaseInfo[];
}

export default function TokenSalePage() {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    data: { rounds, purchases },
    loading,
    refresh: load,
  } = useResource<TokenSaleData>(
    async () => {
      const res = await fetch('/api/token-sale');
      if (!res.ok) throw new Error('Không thể tải dữ liệu token sale');
      const data = await res.json();
      return { rounds: data.rounds ?? [], purchases: data.purchases ?? [] };
    },
    { initialData: { rounds: [], purchases: [] } }
  );

  const activeRound = rounds.find((r) => r.status === 'ACTIVE');
  const tokensToReceive = activeRound ? (parseFloat(amount) || 0) / activeRound.priceUsd : 0;

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    if (!activeRound) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/token-sale/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId: activeRound.id, amountUsd: parseFloat(amount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Không thể thực hiện giao dịch.');
        setSubmitting(false);
        return;
      }
      setAmount('');
      await load();
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Rocket className="w-6 h-6 text-brand" /> Token Sale
        </h1>
        <p className="text-dark-400 mt-1 text-sm">
          Các vòng bán HHD: Seed → Private → Public (IEO). Hard cap tổng $25M, FDV ra mắt $20M.
        </p>
      </div>

      {/* Round cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && rounds.length === 0 ? (
          <Card className="col-span-full">
            <EmptyState>Đang tải...</EmptyState>
          </Card>
        ) : (
          rounds.map((r) => {
            const pct = r.hardCapUsd > 0 ? Math.min(100, (r.raisedUsd / r.hardCapUsd) * 100) : 0;
            const badge = SALE_ROUND_STATUS_META[r.status];
            return (
              <div
                key={r.id}
                className={`rounded-xl p-5 border ${
                  r.status === 'ACTIVE' ? 'bg-brand/5 border-brand/40' : 'bg-dark-800 border-dark-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-white">{r.name}</p>
                  <StatusBadge label={badge.label} tone={badge.tone} variant="chip" />
                </div>
                <p className="text-2xl font-bold text-brand">${r.priceUsd.toFixed(3)}</p>
                <p className="text-xs text-dark-400">mỗi HHD</p>
                <div className="mt-4 space-y-1.5 text-xs text-dark-400">
                  <p>Phân bổ: <span className="text-white">{formatNumber(r.allocation, 0)} HHD</span></p>
                  <p>TGE: <span className="text-white">{r.tgeUnlockPct}%</span></p>
                  <p className="text-dark-500">{r.vestingNote}</p>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-dark-400">${formatNumber(r.raisedUsd, 0)}</span>
                    <span className="text-dark-500">/ ${formatNumber(r.hardCapUsd, 0)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-dark-700 overflow-hidden">
                    <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buy form */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white mb-4">Mua HHD</h2>
          {!activeRound ? (
            <p className="text-sm text-dark-400">Hiện không có vòng bán nào đang mở.</p>
          ) : (
            <>
              <p className="text-sm text-dark-400 mb-4">
                Vòng đang mở: <span className="text-white font-medium">{activeRound.name}</span> · Giá ${activeRound.priceUsd.toFixed(3)}/HHD
              </p>
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
              <form onSubmit={handleBuy} className="space-y-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1.5">Số tiền (USD)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
                  <p className="text-xs text-dark-400">Bạn sẽ nhận</p>
                  <p className="text-2xl font-bold text-brand mt-1">{formatNumber(tokensToReceive, 2)} HHD</p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand hover:bg-brand-dark text-black font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting && <Spinner />}
                  {submitting ? 'Đang xử lý...' : 'Mua HHD'}
                </button>
              </form>
            </>
          )}
        </Card>

        {/* Purchase history */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-600 flex items-center gap-2">
            <History className="w-4 h-4 text-brand" />
            <h2 className="text-base font-semibold text-white">Lịch sử mua của bạn</h2>
          </div>
          {purchases.length === 0 ? (
            <EmptyState>Bạn chưa mua HHD lần nào.</EmptyState>
          ) : (
            <div className="divide-y divide-dark-600">
              {purchases.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-white">{p.roundName}</p>
                    <p className="text-xs text-dark-500">{formatDateTime(p.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{formatNumber(p.tokens, 2)} HHD</p>
                    <p className="text-xs text-dark-400">${formatNumber(p.amountUsd, 2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Vesting table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-600">
          <h2 className="text-base font-semibold text-white">Lịch vesting các vòng bán</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left text-xs text-dark-400 font-medium px-5 py-3">Vòng</th>
                <th className="text-right text-xs text-dark-400 font-medium px-3 py-3">Giá</th>
                <th className="text-right text-xs text-dark-400 font-medium px-3 py-3 hidden sm:table-cell">Phân bổ</th>
                <th className="text-center text-xs text-dark-400 font-medium px-3 py-3">TGE</th>
                <th className="text-left text-xs text-dark-400 font-medium px-5 py-3">Vesting</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((r) => (
                <tr key={r.id} className="border-b border-dark-600 last:border-0">
                  <td className="px-5 py-3 text-sm font-medium text-white">{r.name}</td>
                  <td className="px-3 py-3 text-right text-sm text-brand">${r.priceUsd.toFixed(3)}</td>
                  <td className="px-3 py-3 text-right text-sm text-dark-400 hidden sm:table-cell">{formatNumber(r.allocation, 0)} HHD</td>
                  <td className="px-3 py-3 text-center text-sm text-white">{r.tgeUnlockPct}%</td>
                  <td className="px-5 py-3 text-xs text-dark-400">{r.vestingNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
