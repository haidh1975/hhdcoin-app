'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2 } from 'lucide-react';

export interface AdminProposal {
  id: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED';
  votesFor: number;
  votesAgainst: number;
  voteCount: number;
  creatorName: string;
  createdAt: string;
  endsAt: string;
}

const STATUS_OPTIONS: { value: AdminProposal['status']; label: string }[] = [
  { value: 'ACTIVE', label: 'Đang mở' },
  { value: 'PASSED', label: 'Đã thông qua' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'EXECUTED', label: 'Đã thực thi' },
];

const STATUS_BADGE: Record<AdminProposal['status'], string> = {
  ACTIVE: 'bg-brand/10 text-brand',
  PASSED: 'bg-green-500/10 text-green-400',
  REJECTED: 'bg-red-500/10 text-red-400',
  EXECUTED: 'bg-blue-500/10 text-blue-400',
};

const STATUS_LABEL: Record<AdminProposal['status'], string> = {
  ACTIVE: 'Đang mở',
  PASSED: 'Đã thông qua',
  REJECTED: 'Bị từ chối',
  EXECUTED: 'Đã thực thi',
};

export function ProposalsAdmin({ proposals }: { proposals: AdminProposal[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Form tạo mới
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [creating, setCreating] = useState(false);

  async function createProposal(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/admin/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, durationDays }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Không thể tạo đề xuất.');
      } else {
        setTitle('');
        setDescription('');
        setDurationDays(7);
        router.refresh();
      }
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setCreating(false);
    }
  }

  async function patchProposal(id: string, body: { status?: string }) {
    setBusyId(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Không thể cập nhật đề xuất.');
      } else {
        router.refresh();
      }
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteProposal(id: string) {
    if (!confirm('Bạn có chắc muốn xóa đề xuất này? Toàn bộ phiếu bầu liên quan sẽ bị xóa.')) {
      return;
    }
    setBusyId(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/proposals/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Không thể xóa đề xuất.');
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
    <div className="space-y-6">
      {/* Form tạo đề xuất */}
      <form
        onSubmit={createProposal}
        className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-4"
      >
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand" /> Tạo đề xuất mới
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Nhập tiêu đề đề xuất"
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-dark-500 focus:outline-none focus:border-brand/50"
            />
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Mô tả chi tiết nội dung đề xuất"
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-dark-500 focus:outline-none focus:border-brand/50 resize-y"
            />
          </div>
          <div className="w-40">
            <label className="block text-xs text-dark-400 mb-1.5">Thời hạn (ngày)</label>
            <input
              type="number"
              min={1}
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand/50"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="flex items-center gap-2 bg-brand text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-60"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Tạo đề xuất
        </button>
      </form>

      {/* Bảng đề xuất */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-600">
          <h3 className="text-base font-semibold text-white">Đề xuất ({proposals.length})</h3>
        </div>
        {error && (
          <div className="px-5 py-3 border-b border-dark-600">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        {proposals.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-dark-400">Chưa có đề xuất nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left text-xs text-dark-400 font-medium px-5 py-3">Tiêu đề</th>
                  <th className="text-left text-xs text-dark-400 font-medium px-3 py-3">Trạng thái</th>
                  <th className="text-left text-xs text-dark-400 font-medium px-3 py-3 hidden md:table-cell">
                    Phiếu thuận / chống
                  </th>
                  <th className="text-left text-xs text-dark-400 font-medium px-3 py-3 hidden lg:table-cell">
                    Kết thúc
                  </th>
                  <th className="text-right text-xs text-dark-400 font-medium px-5 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => {
                  const busy = busyId === p.id;
                  const total = p.votesFor + p.votesAgainst;
                  const forPct = total > 0 ? (p.votesFor / total) * 100 : 0;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors align-top"
                    >
                      <td className="px-5 py-3.5 max-w-xs">
                        <p className="text-sm font-medium text-white">{p.title}</p>
                        <p className="text-xs text-dark-500 line-clamp-2">{p.description}</p>
                        <p className="text-xs text-dark-500 mt-1">Bởi {p.creatorName}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${STATUS_BADGE[p.status]}`}
                        >
                          {STATUS_LABEL[p.status]}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-400">{p.votesFor.toLocaleString('vi-VN')}</span>
                          <span className="text-dark-500">/</span>
                          <span className="text-red-400">
                            {p.votesAgainst.toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-32 rounded-full bg-dark-600 overflow-hidden">
                          <div
                            className="h-full bg-green-400"
                            style={{ width: `${forPct}%` }}
                          />
                        </div>
                        <p className="text-xs text-dark-500 mt-1">{p.voteCount} lượt bầu</p>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-dark-400 hidden lg:table-cell">
                        {new Date(p.endsAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {busy ? (
                            <Loader2 className="w-4 h-4 animate-spin text-dark-400" />
                          ) : (
                            <>
                              <select
                                value={p.status}
                                onChange={(e) => patchProposal(p.id, { status: e.target.value })}
                                className="bg-dark-900 border border-dark-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand/50"
                              >
                                {STATUS_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => deleteProposal(p.id)}
                                title="Xóa đề xuất"
                                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Xóa
                              </button>
                            </>
                          )}
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
    </div>
  );
}
