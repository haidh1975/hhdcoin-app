'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, ChevronDown, X } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Spinner } from '@/shared/components/ui/Spinner';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { SALE_ROUND_STATUS_META } from '@/shared/constants/status';
import { formatUsd } from '@/shared/utils/format';

export interface AdminSaleRound {
  id: string;
  name: string;
  priceUsd: number;
  allocation: number;
  hardCapUsd: number;
  raisedUsd: number;
  tgeUnlockPct: number;
  vestingNote: string;
  status: 'UPCOMING' | 'ACTIVE' | 'CLOSED';
  order: number;
  buyerCount: number;
  purchasedUsd: number;
}

const STATUS_OPTIONS: { value: AdminSaleRound['status']; label: string }[] = (
  ['UPCOMING', 'ACTIVE', 'CLOSED'] as const
).map((value) => ({ value, label: SALE_ROUND_STATUS_META[value].label }));

/** Vòng bán hiển thị số tiền không ép phần thập phân tối thiểu. */
const ROUND_USD = { minFrac: 0, maxFrac: 2 } as const;

interface RoundForm {
  name: string;
  priceUsd: string;
  allocation: string;
  hardCapUsd: string;
  tgeUnlockPct: string;
  vestingNote: string;
  status: AdminSaleRound['status'];
  order: string;
}

const EMPTY_FORM: RoundForm = {
  name: '',
  priceUsd: '',
  allocation: '',
  hardCapUsd: '',
  tgeUnlockPct: '',
  vestingNote: '',
  status: 'UPCOMING',
  order: '0',
};

const inputCls =
  'w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-dark-500 focus:outline-none focus:border-brand/50';

export function SaleRoundsAdmin({ rounds }: { rounds: AdminSaleRound[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<RoundForm>(EMPTY_FORM);

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<RoundForm>(EMPTY_FORM);

  function toForm(r: AdminSaleRound): RoundForm {
    return {
      name: r.name,
      priceUsd: String(r.priceUsd),
      allocation: String(r.allocation),
      hardCapUsd: String(r.hardCapUsd),
      tgeUnlockPct: String(r.tgeUnlockPct),
      vestingNote: r.vestingNote,
      status: r.status,
      order: String(r.order),
    };
  }

  function formToBody(f: RoundForm) {
    return {
      name: f.name,
      priceUsd: Number(f.priceUsd),
      allocation: Number(f.allocation),
      hardCapUsd: Number(f.hardCapUsd),
      tgeUnlockPct: Number(f.tgeUnlockPct),
      vestingNote: f.vestingNote,
      status: f.status,
      order: Number(f.order),
    };
  }

  async function createRound(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/admin/sale-rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formToBody(createForm)),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Không thể tạo vòng bán.');
      } else {
        setCreateForm(EMPTY_FORM);
        setShowCreate(false);
        router.refresh();
      }
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setCreating(false);
    }
  }

  async function patchRound(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/sale-rounds/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Không thể cập nhật vòng bán.');
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    const ok = await patchRound(editId, formToBody(editForm));
    if (ok) setEditId(null);
  }

  async function deleteRound(r: AdminSaleRound) {
    if (r.buyerCount > 0) return;
    if (!confirm(`Bạn có chắc muốn xóa vòng bán "${r.name}"?`)) return;
    setBusyId(r.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/sale-rounds/${r.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Không thể xóa vòng bán.');
      } else {
        router.refresh();
      }
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setBusyId(null);
    }
  }

  function renderFormFields(form: RoundForm, set: (f: RoundForm) => void) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs text-dark-400 mb-1.5">Tên vòng bán</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set({ ...form, name: e.target.value })}
            required
            placeholder="VD: Seed Round"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1.5">Giá (USD)</label>
          <input
            type="number"
            step="any"
            min="0"
            value={form.priceUsd}
            onChange={(e) => set({ ...form, priceUsd: e.target.value })}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1.5">Phân bổ (token)</label>
          <input
            type="number"
            step="any"
            min="0"
            value={form.allocation}
            onChange={(e) => set({ ...form, allocation: e.target.value })}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1.5">Hard cap (USD)</label>
          <input
            type="number"
            step="any"
            min="0"
            value={form.hardCapUsd}
            onChange={(e) => set({ ...form, hardCapUsd: e.target.value })}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1.5">Mở khóa TGE (%)</label>
          <input
            type="number"
            step="any"
            min="0"
            value={form.tgeUnlockPct}
            onChange={(e) => set({ ...form, tgeUnlockPct: e.target.value })}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1.5">Trạng thái</label>
          <select
            value={form.status}
            onChange={(e) => set({ ...form, status: e.target.value as AdminSaleRound['status'] })}
            className={inputCls}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1.5">Thứ tự</label>
          <input
            type="number"
            value={form.order}
            onChange={(e) => set({ ...form, order: e.target.value })}
            required
            className={inputCls}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-dark-400 mb-1.5">Ghi chú vesting</label>
          <input
            type="text"
            value={form.vestingNote}
            onChange={(e) => set({ ...form, vestingNote: e.target.value })}
            placeholder="VD: Khóa 12 tháng, mở dần theo quý"
            className={inputCls}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form tạo vòng bán (thu gọn) */}
      <Card className="overflow-hidden">
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand" /> Tạo vòng bán mới
          </h3>
          <ChevronDown
            className={`w-4 h-4 text-dark-400 transition-transform ${showCreate ? 'rotate-180' : ''}`}
          />
        </button>
        {showCreate && (
          <form onSubmit={createRound} className="px-5 pb-5 space-y-4 border-t border-dark-600 pt-4">
            {renderFormFields(createForm, setCreateForm)}
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 bg-brand text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-60"
            >
              {creating ? <Spinner /> : <Plus className="w-4 h-4" />}
              Tạo vòng bán
            </button>
          </form>
        )}
      </Card>

      {error && (
        <div className="bg-dark-800 border border-red-500/30 rounded-xl px-5 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Danh sách vòng bán */}
      <div className="space-y-4">
        {rounds.length === 0 ? (
          <Card>
            <EmptyState>Chưa có vòng bán nào.</EmptyState>
          </Card>
        ) : (
          rounds.map((r) => {
            const busy = busyId === r.id;
            const isEditing = editId === r.id;
            const pct = r.hardCapUsd > 0 ? Math.min((r.raisedUsd / r.hardCapUsd) * 100, 100) : 0;
            return (
              <Card
                key={r.id}
                className="p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white">{r.name}</h3>
                      <StatusBadge
                        label={SALE_ROUND_STATUS_META[r.status].label}
                        tone={SALE_ROUND_STATUS_META[r.status].tone}
                      />
                    </div>
                    <p className="text-xs text-dark-500 mt-0.5">Thứ tự #{r.order}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {busy ? (
                      <Spinner className="w-4 h-4 text-dark-400" />
                    ) : (
                      <>
                        <select
                          value={r.status}
                          onChange={(e) => patchRound(r.id, { status: e.target.value })}
                          className="bg-dark-900 border border-dark-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand/50"
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditId(null);
                            } else {
                              setEditId(r.id);
                              setEditForm(toForm(r));
                            }
                          }}
                          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-dark-600 text-dark-400 hover:text-brand hover:border-brand/40 transition-colors"
                        >
                          {isEditing ? (
                            <>
                              <X className="w-3.5 h-3.5" /> Hủy
                            </>
                          ) : (
                            <>
                              <Pencil className="w-3.5 h-3.5" /> Sửa
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => deleteRound(r)}
                          disabled={r.buyerCount > 0}
                          title={
                            r.buyerCount > 0
                              ? 'Không thể xóa vòng bán đã có lượt mua'
                              : 'Xóa vòng bán'
                          }
                          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xóa
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-dark-400">Giá</p>
                    <p className="text-sm font-semibold text-white">{formatUsd(r.priceUsd, ROUND_USD)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Phân bổ</p>
                    <p className="text-sm font-semibold text-white">
                      {r.allocation.toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">TGE mở khóa</p>
                    <p className="text-sm font-semibold text-white">{r.tgeUnlockPct}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Số người mua</p>
                    <p className="text-sm font-semibold text-white">{r.buyerCount}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-dark-400">Đã gọi vốn</span>
                    <span className="text-white font-medium">
                      {formatUsd(r.raisedUsd, ROUND_USD)} / {formatUsd(r.hardCapUsd, ROUND_USD)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-dark-600 overflow-hidden">
                    <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {r.vestingNote && (
                  <p className="text-xs text-dark-500">Vesting: {r.vestingNote}</p>
                )}

                {isEditing && (
                  <form
                    onSubmit={saveEdit}
                    className="space-y-4 border-t border-dark-600 pt-4"
                  >
                    {renderFormFields(editForm, setEditForm)}
                    <button
                      type="submit"
                      disabled={busy}
                      className="flex items-center gap-2 bg-brand text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-60"
                    >
                      {busy ? <Spinner /> : <Pencil className="w-4 h-4" />}
                      Lưu thay đổi
                    </button>
                  </form>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
