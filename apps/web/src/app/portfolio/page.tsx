'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  History,
  Plus,
  X,
  Loader2,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { SourceBadge } from '@/components/dashboard/SourceBadge';
import type { PortfolioSummary, TransactionRecord } from '@hhd-i/types';

const TRADABLE_SYMBOLS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'VNM', 'FPT', 'VIC', 'HPG'];

function formatUsd(value: number, digits = 2): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

function formatPrice(price: number): string {
  if (price >= 1000) return formatUsd(price);
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US', { maximumFractionDigits: 6 });
}

const TX_LABELS: Record<string, string> = {
  BUY: 'Mua',
  SELL: 'Bán',
  DEPOSIT: 'Nạp tiền',
  WITHDRAW: 'Rút tiền',
};

const TX_STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  COMPLETED: { label: 'Hoàn tất', cls: 'text-green-400 bg-green-500/10' },
  PENDING: { label: 'Đang xử lý', cls: 'text-yellow-400 bg-yellow-500/10' },
  FAILED: { label: 'Thất bại', cls: 'text-red-400 bg-red-500/10' },
};

function TradeModal({
  onClose,
  onSuccess,
  defaultSymbol,
}: {
  onClose: () => void;
  onSuccess: () => void;
  defaultSymbol?: string;
}) {
  const [symbol, setSymbol] = useState(defaultSymbol ?? 'BTC');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, type, amount: parseFloat(amount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Không thể tạo giao dịch.');
        setLoading(false);
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Mua / Bán tài sản</h3>
          <button onClick={onClose} className="p-1 text-dark-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('BUY')}
              className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                type === 'BUY'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'bg-dark-700 text-dark-400 border border-dark-600 hover:text-white'
              }`}
            >
              Mua
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                type === 'SELL'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-dark-700 text-dark-400 border border-dark-600 hover:text-white'
              }`}
            >
              Bán
            </button>
          </div>

          <div>
            <label className="block text-sm text-dark-400 mb-1.5">Tài sản</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
            >
              {TRADABLE_SYMBOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-dark-400 mb-1.5">Số lượng</label>
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
            <p className="text-xs text-dark-500 mt-1.5">
              Lệnh khớp theo giá thị trường hiện tại.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-black font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Đang xử lý...' : type === 'BUY' ? 'Đặt lệnh mua' : 'Đặt lệnh bán'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        fetch('/api/portfolio'),
        fetch('/api/transactions?pageSize=15'),
      ]);
      if (pRes.ok) setPortfolio(await pRes.json());
      if (tRes.ok) {
        const tData = await tRes.json();
        setTransactions(tData.transactions ?? []);
      }
    } catch {
      // giữ dữ liệu cũ
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15_000);
    return () => clearInterval(interval);
  }, [loadData]);

  const source: 'live' | 'mock' = portfolio?.holdings.some((h) => h.priceSource === 'live')
    ? 'live'
    : 'mock';
  const pnlPositive = (portfolio?.pnl ?? 0) >= 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-brand" /> Danh mục đầu tư
            <SourceBadge source={source} />
          </h1>
          <p className="text-dark-400 mt-1 text-sm">
            Tài sản của bạn được định giá theo thời gian thực
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-black font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Mua / Bán
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <p className="text-xs text-dark-400 mb-1">Tổng giá trị</p>
          <p className="text-2xl font-bold text-white">
            {portfolio ? formatUsd(portfolio.totalValue) : '...'}
          </p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <p className="text-xs text-dark-400 mb-1">Tổng vốn đầu tư</p>
          <p className="text-2xl font-bold text-white">
            {portfolio ? formatUsd(portfolio.totalCost) : '...'}
          </p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <p className="text-xs text-dark-400 mb-1">Lãi / Lỗ</p>
          <p className={`text-2xl font-bold ${pnlPositive ? 'text-green-400' : 'text-red-400'}`}>
            {portfolio
              ? `${pnlPositive ? '+' : '-'}${formatUsd(Math.abs(portfolio.pnl))} (${pnlPositive ? '+' : ''}${portfolio.pnlPercent.toFixed(2)}%)`
              : '...'}
          </p>
        </div>
      </div>

      {/* Holdings table */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-dark-600">
          <PieChart className="w-4 h-4 text-brand" />
          <h2 className="text-base font-semibold text-white">Tài sản nắm giữ</h2>
        </div>
        {loading && !portfolio ? (
          <div className="px-5 py-10 text-center text-sm text-dark-400">Đang tải danh mục...</div>
        ) : !portfolio || portfolio.holdings.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-dark-400">
            Bạn chưa nắm giữ tài sản nào. Nhấn &quot;Mua / Bán&quot; để bắt đầu đầu tư.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left text-xs text-dark-400 font-medium px-5 py-3">Tài sản</th>
                  <th className="text-right text-xs text-dark-400 font-medium px-3 py-3">Số lượng</th>
                  <th className="text-right text-xs text-dark-400 font-medium px-3 py-3 hidden md:table-cell">
                    Giá mua TB
                  </th>
                  <th className="text-right text-xs text-dark-400 font-medium px-3 py-3">Giá hiện tại</th>
                  <th className="text-right text-xs text-dark-400 font-medium px-3 py-3">Giá trị</th>
                  <th className="text-right text-xs text-dark-400 font-medium px-3 py-3">Lãi/Lỗ</th>
                  <th className="text-right text-xs text-dark-400 font-medium px-5 py-3 hidden lg:table-cell">
                    Tỷ trọng
                  </th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((h) => {
                  const positive = h.pnl >= 0;
                  return (
                    <tr
                      key={h.assetId}
                      className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-brand">{h.symbol[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{h.name}</p>
                            <p className="text-xs text-dark-400">
                              {h.symbol} · {h.type === 'CRYPTO' ? 'Crypto' : 'Cổ phiếu'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-right text-sm text-white">{formatAmount(h.amount)}</td>
                      <td className="px-3 py-3.5 text-right text-sm text-dark-400 hidden md:table-cell">
                        {formatPrice(h.avgBuyPrice)}
                      </td>
                      <td className="px-3 py-3.5 text-right text-sm text-white">{formatPrice(h.currentPrice)}</td>
                      <td className="px-3 py-3.5 text-right text-sm font-semibold text-white">
                        {formatUsd(h.value)}
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <div
                          className={`inline-flex items-center gap-1 text-sm font-medium ${
                            positive ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {positive ? '+' : '-'}
                          {formatUsd(Math.abs(h.pnl))} ({positive ? '+' : ''}
                          {h.pnlPercent.toFixed(1)}%)
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-dark-600 overflow-hidden">
                            <div
                              className="h-full bg-brand rounded-full"
                              style={{ width: `${Math.min(100, h.allocation)}%` }}
                            />
                          </div>
                          <span className="text-sm text-dark-400 w-12 text-right">
                            {h.allocation.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-dark-600">
          <History className="w-4 h-4 text-brand" />
          <h2 className="text-base font-semibold text-white">Lịch sử giao dịch</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-dark-400">Chưa có giao dịch nào.</div>
        ) : (
          <div className="divide-y divide-dark-600">
            {transactions.map((tx) => {
              const isIn = tx.type === 'BUY' || tx.type === 'DEPOSIT';
              const status = TX_STATUS_LABELS[tx.status] ?? TX_STATUS_LABELS.COMPLETED;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-dark-700/50 transition-colors">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isIn ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    {isIn ? (
                      <ArrowDownLeft className="w-4 h-4 text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {TX_LABELS[tx.type] ?? tx.type}
                      {tx.assetSymbol ? ` ${tx.assetSymbol}` : ''}
                    </p>
                    <p className="text-xs text-dark-500">
                      {new Date(tx.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      {tx.assetSymbol
                        ? `${formatAmount(tx.amount)} ${tx.assetSymbol} @ ${formatPrice(tx.price)}`
                        : formatUsd(tx.totalValue)}
                    </p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${status.cls}`}>{status.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <TradeModal onClose={() => setShowModal(false)} onSuccess={loadData} />
      )}
    </div>
  );
}
