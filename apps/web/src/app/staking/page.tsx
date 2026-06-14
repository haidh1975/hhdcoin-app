'use client';

import { useCallback, useEffect, useState } from 'react';
import { Lock, Loader2, AlertCircle, Calculator, Flame, Coins, TrendingUp } from 'lucide-react';
import { STAKE_TIERS, STAKE_TIER_ORDER, STAKING_CONFIG } from '@/lib/hhd';
import type { StakeInfo, StakeTier } from '@hhd-i/types';

function fmt(n: number, digits = 0): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

const TIER_BADGE: Record<StakeTier, string> = {
  BRONZE: 'text-orange-300 bg-orange-500/10',
  SILVER: 'text-gray-300 bg-gray-500/10',
  GOLD: 'text-brand bg-brand/10',
  PLATINUM: 'text-cyan-300 bg-cyan-500/10',
  DIAMOND: 'text-purple-300 bg-purple-500/10',
};

function estReward(amount: number, apy: number, lockDays: number): number {
  return amount * (apy / 100) * (lockDays / 365);
}

function accruedReward(stake: StakeInfo): number {
  const start = new Date(stake.startAt).getTime();
  const msStaked = Math.max(0, Date.now() - start);
  const years = msStaked / (365 * 24 * 60 * 60 * 1000);
  return stake.amount * (stake.apy / 100) * years;
}

export default function StakingPage() {
  const [stakes, setStakes] = useState<StakeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // form
  const [formTier, setFormTier] = useState<StakeTier>('BRONZE');
  const [formAmount, setFormAmount] = useState('');
  const [autoCompound, setAutoCompound] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // calculator
  const [calcTier, setCalcTier] = useState<StakeTier>('GOLD');
  const [calcAmount, setCalcAmount] = useState('25000');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/staking');
      if (res.ok) {
        const data = await res.json();
        setStakes(data.stakes ?? []);
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

  async function handleStake(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/staking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: formTier, amount: parseFloat(formAmount), autoCompound }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Không thể tạo khoản stake.');
        setSubmitting(false);
        return;
      }
      setFormAmount('');
      setAutoCompound(false);
      await load();
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnstake(stake: StakeInfo) {
    const early = Date.now() < new Date(stake.unlockAt).getTime();
    const msg = early
      ? `Rút sớm sẽ chịu phạt ${STAKING_CONFIG.earlyExitPenaltyPct}% (gửi vào burn). Tiếp tục?`
      : 'Rút khoản stake và nhận phần thưởng?';
    if (!confirm(msg)) return;
    try {
      const res = await fetch(`/api/staking/${stake.id}`, { method: 'PATCH' });
      if (res.ok) await load();
    } catch {
      // bỏ qua
    }
  }

  const activeStakes = stakes.filter((s) => s.status === 'ACTIVE');
  const totalStaked = activeStakes.reduce((sum, s) => sum + s.amount, 0);
  const totalReward = activeStakes.reduce((sum, s) => sum + accruedReward(s), 0);

  const calcConfig = STAKE_TIERS[calcTier];
  const calcResult = estReward(parseFloat(calcAmount) || 0, calcConfig.apy, calcConfig.lockDays);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Lock className="w-6 h-6 text-brand" /> Staking HHD
        </h1>
        <p className="text-dark-400 mt-1 text-sm">
          Khóa HHD để nhận APY 8–55% và quyền lợi theo tier. Quỹ phần thưởng {fmt(STAKING_CONFIG.rewardsPool)} HHD.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <p className="text-xs text-dark-400 mb-1">Tổng đang stake</p>
          <p className="text-2xl font-bold text-white">{fmt(totalStaked)} HHD</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <p className="text-xs text-dark-400 mb-1">Phần thưởng tích lũy (ước tính)</p>
          <p className="text-2xl font-bold text-green-400">+{fmt(totalReward, 2)} HHD</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <p className="text-xs text-dark-400 mb-1">Khoản stake đang hoạt động</p>
          <p className="text-2xl font-bold text-white">{activeStakes.length} / {STAKING_CONFIG.maxConcurrentStakes}</p>
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STAKE_TIER_ORDER.map((tier) => {
          const c = STAKE_TIERS[tier];
          const highlight = tier === 'PLATINUM' || tier === 'DIAMOND';
          return (
            <div
              key={tier}
              className={`rounded-xl p-5 border ${
                highlight ? 'bg-brand/5 border-brand/40' : 'bg-dark-800 border-dark-600'
              }`}
            >
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${TIER_BADGE[tier]}`}>{c.label}</span>
              <p className="text-3xl font-bold text-brand mt-3">{c.apy}%</p>
              <p className="text-xs text-dark-400">APY</p>
              <div className="mt-4 space-y-1.5 text-xs text-dark-400">
                <p>Khóa: <span className="text-white">{c.lockDays} ngày</span></p>
                <p>Tối thiểu: <span className="text-white">{fmt(c.minStake)} HHD</span></p>
                <p className="pt-1 border-t border-dark-700 mt-2">{c.benefits}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-brand" /> Máy tính phần thưởng
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-dark-400 mb-1.5">Số lượng HHD</label>
              <input
                type="number"
                min="0"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1.5">Tier</label>
              <select
                value={calcTier}
                onChange={(e) => setCalcTier(e.target.value as StakeTier)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              >
                {STAKE_TIER_ORDER.map((t) => (
                  <option key={t} value={t}>
                    {STAKE_TIERS[t].label} — {STAKE_TIERS[t].apy}% / {STAKE_TIERS[t].lockDays} ngày
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-dark-700 border border-dark-600 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-dark-400">Phần thưởng ước tính sau {calcConfig.lockDays} ngày</p>
                <p className="text-2xl font-bold text-green-400 mt-1">+{fmt(calcResult, 2)} HHD</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400/40" />
            </div>
          </div>
        </div>

        {/* Stake form */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Coins className="w-4 h-4 text-brand" /> Stake HHD
          </h2>
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          <form onSubmit={handleStake} className="space-y-4">
            <div>
              <label className="block text-sm text-dark-400 mb-1.5">Tier</label>
              <select
                value={formTier}
                onChange={(e) => setFormTier(e.target.value as StakeTier)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              >
                {STAKE_TIER_ORDER.map((t) => (
                  <option key={t} value={t}>
                    {STAKE_TIERS[t].label} — tối thiểu {fmt(STAKE_TIERS[t].minStake)} HHD
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1.5">Số lượng HHD</label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder={`Tối thiểu ${fmt(STAKE_TIERS[formTier].minStake)}`}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand transition-colors"
              />
              <p className="text-xs text-dark-500 mt-1.5">
                Thời gian khóa: {STAKE_TIERS[formTier].lockDays} ngày · APY {STAKE_TIERS[formTier].apy}%
              </p>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCompound}
                onChange={(e) => setAutoCompound(e.target.checked)}
                className="w-4 h-4 accent-brand"
              />
              <span className="text-sm text-dark-400">Tự động tái đầu tư phần thưởng (auto-compound)</span>
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand hover:bg-brand-dark text-black font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Đang xử lý...' : 'Stake HHD'}
            </button>
          </form>
        </div>
      </div>

      {/* User stakes */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-600 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Các khoản stake của bạn</h2>
          <p className="text-xs text-dark-500 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-red-400" /> Rút sớm phạt {STAKING_CONFIG.earlyExitPenaltyPct}%
          </p>
        </div>
        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-dark-400">Đang tải...</div>
        ) : stakes.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-dark-400">Bạn chưa có khoản stake nào.</div>
        ) : (
          <div className="divide-y divide-dark-600">
            {stakes.map((s) => {
              const now = Date.now();
              const start = new Date(s.startAt).getTime();
              const unlock = new Date(s.unlockAt).getTime();
              const progress = Math.min(100, Math.max(0, ((now - start) / (unlock - start)) * 100));
              const unlocked = now >= unlock;
              const reward = s.status === 'ACTIVE' ? accruedReward(s) : s.rewardClaimed;
              return (
                <div key={s.id} className="px-5 py-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${TIER_BADGE[s.tier]}`}>
                        {STAKE_TIERS[s.tier].label}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{fmt(s.amount)} HHD · {s.apy}% APY</p>
                        <p className="text-xs text-dark-500">
                          Mở khóa: {new Date(s.unlockAt).toLocaleDateString('vi-VN')}
                          {s.autoCompound ? ' · Auto-compound' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-dark-400">{s.status === 'ACTIVE' ? 'Thưởng tích lũy' : 'Đã nhận'}</p>
                        <p className="text-sm font-semibold text-green-400">+{fmt(reward, 2)} HHD</p>
                      </div>
                      {s.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleUnstake(s)}
                          className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            unlocked
                              ? 'bg-brand hover:bg-brand-dark text-black'
                              : 'bg-dark-700 hover:bg-dark-600 border border-dark-600 text-white'
                          }`}
                        >
                          {unlocked ? 'Claim & Unstake' : 'Rút sớm'}
                        </button>
                      ) : (
                        <span className="text-xs text-dark-500 px-3 py-1.5">Đã rút</span>
                      )}
                    </div>
                  </div>
                  {s.status === 'ACTIVE' && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-dark-700 overflow-hidden">
                        <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-dark-400 w-12 text-right">{progress.toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
