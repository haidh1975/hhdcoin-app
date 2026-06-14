'use client';

import { useCallback, useEffect, useState } from 'react';
import { Landmark, Loader2, ThumbsUp, ThumbsDown, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { ProposalInfo, ProposalStatus } from '@hhd-i/types';

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

const STATUS_BADGE: Record<ProposalStatus, { label: string; cls: string }> = {
  ACTIVE: { label: 'Đang bỏ phiếu', cls: 'text-brand bg-brand/10' },
  PASSED: { label: 'Đã thông qua', cls: 'text-green-400 bg-green-500/10' },
  REJECTED: { label: 'Bị từ chối', cls: 'text-red-400 bg-red-500/10' },
  EXECUTED: { label: 'Đã thực thi', cls: 'text-blue-400 bg-blue-500/10' },
};

function timeRemaining(endsAt: string): string {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return 'Đã kết thúc';
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days > 0) return `Còn ${days} ngày`;
  return `Còn ${hours} giờ`;
}

export default function GovernancePage() {
  const [proposals, setProposals] = useState<ProposalInfo[]>([]);
  const [votingPower, setVotingPower] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/governance');
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals ?? []);
        setVotingPower(data.votingPower ?? 0);
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

  async function handleVote(proposalId: string, support: boolean) {
    setError('');
    setVoting(proposalId);
    try {
      const res = await fetch('/api/governance/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, support }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Không thể bỏ phiếu.');
      } else {
        await load();
      }
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setVoting(null);
    }
  }

  const activeCount = proposals.filter((p) => p.status === 'ACTIVE').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Landmark className="w-6 h-6 text-brand" /> Quản trị DAO
        </h1>
        <p className="text-dark-400 mt-1 text-sm">
          1 HHD đang stake = 1 phiếu. Tier Gold trở lên có thể tạo đề xuất.
        </p>
      </div>

      {/* DAO stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <p className="text-xs text-dark-400 mb-1">Tổng đề xuất</p>
          <p className="text-2xl font-bold text-white">{proposals.length}</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <p className="text-xs text-dark-400 mb-1">Đang bỏ phiếu</p>
          <p className="text-2xl font-bold text-brand">{activeCount}</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <p className="text-xs text-dark-400 mb-1">Quyền biểu quyết của bạn</p>
          <p className="text-2xl font-bold text-white">{fmt(votingPower)} phiếu</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {votingPower === 0 && (
        <div className="bg-dark-800 border border-brand/30 rounded-xl px-4 py-3">
          <p className="text-sm text-dark-400">
            Bạn cần có khoản stake đang hoạt động để có quyền biểu quyết.{' '}
            <a href="/staking" className="text-brand hover:underline">Stake HHD ngay</a>.
          </p>
        </div>
      )}

      {/* Proposals */}
      {loading ? (
        <div className="bg-dark-800 border border-dark-600 rounded-xl px-5 py-10 text-center text-sm text-dark-400">
          Đang tải đề xuất...
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => {
            const total = p.votesFor + p.votesAgainst;
            const forPct = total > 0 ? (p.votesFor / total) * 100 : 0;
            const againstPct = total > 0 ? (p.votesAgainst / total) * 100 : 0;
            const badge = STATUS_BADGE[p.status];
            const canVote = p.status === 'ACTIVE' && !p.userVoted && votingPower > 0;
            return (
              <div key={p.id} className="bg-dark-800 border border-dark-600 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-base font-semibold text-white">{p.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded flex-shrink-0 ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-sm text-dark-400 mb-4 leading-relaxed">{p.description}</p>

                {/* Vote bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> Đồng ý {fmt(p.votesFor)} ({forPct.toFixed(0)}%)
                    </span>
                    <span className="text-red-400 flex items-center gap-1">
                      Phản đối {fmt(p.votesAgainst)} ({againstPct.toFixed(0)}%) <ThumbsDown className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-dark-700 overflow-hidden flex">
                    <div className="h-full bg-green-500" style={{ width: `${forPct}%` }} />
                    <div className="h-full bg-red-500" style={{ width: `${againstPct}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <p className="text-xs text-dark-500 flex items-center gap-1.5">
                    {p.status === 'ACTIVE' ? (
                      <>
                        <Clock className="w-3.5 h-3.5" /> {timeRemaining(p.endsAt)}
                      </>
                    ) : p.status === 'PASSED' || p.status === 'EXECUTED' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Kết thúc{' '}
                        {new Date(p.endsAt).toLocaleDateString('vi-VN')}
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-400" /> Kết thúc{' '}
                        {new Date(p.endsAt).toLocaleDateString('vi-VN')}
                      </>
                    )}
                  </p>

                  {p.userVoted ? (
                    <span className="text-xs text-dark-400">
                      Bạn đã bỏ phiếu: {p.userSupport ? 'Đồng ý' : 'Phản đối'}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={!canVote || voting === p.id}
                        onClick={() => handleVote(p.id, true)}
                        className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {voting === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                        Đồng ý
                      </button>
                      <button
                        disabled={!canVote || voting === p.id}
                        onClick={() => handleVote(p.id, false)}
                        className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" /> Phản đối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
