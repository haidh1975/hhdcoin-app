'use client';

import { useCallback, useEffect, useState } from 'react';
import { Rocket, Loader2, AlertCircle, History } from 'lucide-react';
import type { SaleRoundInfo, SalePurchaseInfo, SaleRoundStatus } from '@hhd-i/types';

function fmt(n: number, digits = 0): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

const STATUS_BADGE: Record<SaleRoundStatus, { label: string; cls: string }> = {
  UPCOMING: { label: 'Sắp diễn ra', cls: 'text-blue-400 bg-blue-500/10' },
  ACTIVE: { label: 'Đang mở', cls: 'text-green-400 bg-green-500/10' },
  CLOSED: { label: 'Đã đóng', cls: 'text-dark-400 bg-dark-700' },
};

export default function TokenSalePage() {
  const [rounds, setRounds] = useState<SaleRoundInfo[]>([]);
  const [purchases, setPurchases] = useState<SalePurchaseInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/token-sale');
      if (res.ok) {
        const data = await res.json();
        setRounds(data.rounds ?? []);
        setPurchases(data.purchases ?? []);
      }
    } catch {
      // giữ dữ liệu cũ
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
          <div className="col-span-full bg-dark-800 border border-dark-600 rounded-xl px-5 py-10 text-center text-sm text-dark-400">
            Đang tải...
          </div>
        ) : (
          rounds.map((r) => {
            const pct = r.hardCapUsd > 0 ? Math.min(100, (r.raisedUsd / r.hardCapUsd) * 100) : 0;
            const badge = STATUS_BADGE[r.status];
            return (
              <div
                key={r.id}
                className={`rounded-xl p-5 border ${
                  r.status === 'ACTIVE' ? 'bg-brand/5 border-brand/40' : 'bg-dark-800 border-dark-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-white">{r.name}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badge.cls}`}>{badge.label}</span>
                </div>
                <p className="text-2xl font-bold text-brand">${r.priceUsd.toFixed(3)}</p>
                <p className="text-xs text-dark-400">mỗi HHD</p>
                <div className="mt-4 space-y-1.5 text-xs text-dark-400">
                  <p>Phân bổ: <span className="text-white">{fmt(r.allocation)} HHD</span></p>
                  <p>TGE: <span className="text-white">{r.tgeUnlockPct}%</span></p>
                  <p className="text-dark-500">{r.vestingNote}</p>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-dark-400">${fmt(r.raisedUsd)}</span>
                    <span className="text-dark-500">/ ${fmt(r.hardCapUsd)}</span>
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
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
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
                  <p className="text-2xl font-bold text-brand mt-1">{fmt(tokensToReceive, 2)} HHD</p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand hover:bg-brand-dark text-black font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Đang xử lý...' : 'Mua HHD'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Purchase history */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-600 flex items-center gap-2">
            <History className="w-4 h-4 text-brand" />
            <h2 className="text-base font-semibold text-white">Lịch sử mua của bạn</h2>
          </div>
          {purchases.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-dark-400">Bạn chưa mua HHD lần nào.</div>
          ) : (
            <div className="divide-y divide-dark-600">
              {purchases.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-white">{p.roundName}</p>
                    <p className="text-xs text-dark-500">{new Date(p.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{fmt(p.tokens, 2)} HHD</p>
                    <p className="text-xs text-dark-400">${fmt(p.amountUsd, 2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vesting table */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
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
                  <td className="px-3 py-3 text-right text-sm text-dark-400 hidden sm:table-cell">{fmt(r.allocation)} HHD</td>
                  <td className="px-3 py-3 text-center text-sm text-white">{r.tgeUnlockPct}%</td>
                  <td className="px-5 py-3 text-xs text-dark-400">{r.vestingNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
