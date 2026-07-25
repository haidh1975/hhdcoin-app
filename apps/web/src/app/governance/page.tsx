'use client';

import { useState } from 'react';
import { Landmark, ThumbsUp, ThumbsDown, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { ProposalInfo } from '@hhd-i/types';
import { Card } from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Spinner } from '@/shared/components/ui/Spinner';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { PROPOSAL_STATUS_META } from '@/shared/constants/status';
import { useResource } from '@/shared/hooks/useResource';
import { formatDate, formatNumber, formatPercent } from '@/shared/utils/format';

interface GovernanceData {
  proposals: ProposalInfo[];
  votingPower: number;
}

function timeRemaining(endsAt: string): string {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return 'Đã kết thúc';
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days > 0) return `Còn ${days} ngày`;
  return `Còn ${hours} giờ`;
}

export default function GovernancePage() {
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const {
    data: { proposals, votingPower },
    loading,
    refresh: load,
  } = useResource<GovernanceData>(
    async () => {
      const res = await fetch('/api/governance');
      if (!res.ok) throw new Error('Không thể tải danh sách đề xuất');
      const data = await res.json();
      return { proposals: data.proposals ?? [], votingPower: data.votingPower ?? 0 };
    },
    { initialData: { proposals: [], votingPower: 0 } }
  );

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
        <Card padded>
          <p className="text-xs text-dark-400 mb-1">Tổng đề xuất</p>
          <p className="text-2xl font-bold text-white">{proposals.length}</p>
        </Card>
        <Card padded>
          <p className="text-xs text-dark-400 mb-1">Đang bỏ phiếu</p>
          <p className="text-2xl font-bold text-brand">{activeCount}</p>
        </Card>
        <Card padded>
          <p className="text-xs text-dark-400 mb-1">Quyền biểu quyết của bạn</p>
          <p className="text-2xl font-bold text-white">{formatNumber(votingPower, 0)} phiếu</p>
        </Card>
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
        <Card>
          <EmptyState>Đang tải đề xuất...</EmptyState>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => {
            const total = p.votesFor + p.votesAgainst;
            const forPct = total > 0 ? (p.votesFor / total) * 100 : 0;
            const againstPct = total > 0 ? (p.votesAgainst / total) * 100 : 0;
            const badge = PROPOSAL_STATUS_META[p.status];
            const canVote = p.status === 'ACTIVE' && !p.userVoted && votingPower > 0;
            return (
              <Card key={p.id} className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-base font-semibold text-white">{p.title}</h3>
                  <StatusBadge
                    label={badge.label}
                    tone={badge.tone}
                    variant="tagStrong"
                    className="flex-shrink-0"
                  />
                </div>
                <p className="text-sm text-dark-400 mb-4 leading-relaxed">{p.description}</p>

                {/* Vote bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> Đồng ý {formatNumber(p.votesFor, 0)} ({formatPercent(forPct, 0)})
                    </span>
                    <span className="text-red-400 flex items-center gap-1">
                      Phản đối {formatNumber(p.votesAgainst, 0)} ({formatPercent(againstPct, 0)}) <ThumbsDown className="w-3 h-3" />
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
                        {formatDate(p.endsAt)}
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-400" /> Kết thúc{' '}
                        {formatDate(p.endsAt)}
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
                        {voting === p.id ? <Spinner className="w-3.5 h-3.5" /> : <ThumbsUp className="w-3.5 h-3.5" />}
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
