'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Ban, CheckCircle2, ShieldCheck, ShieldOff } from 'lucide-react';
import type { AppUser } from '@hhd-i/types';
import { Spinner } from '@/shared/components/ui/Spinner';

export function UsersTable({ users }: { users: AppUser[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function patchUser(id: string, body: { status?: string; role?: string }) {
    setBusyId(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Không thể cập nhật người dùng.');
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
              <th className="text-left text-xs text-dark-400 font-medium px-5 py-3">Người dùng</th>
              <th className="text-left text-xs text-dark-400 font-medium px-3 py-3">Vai trò</th>
              <th className="text-left text-xs text-dark-400 font-medium px-3 py-3">Trạng thái</th>
              <th className="text-left text-xs text-dark-400 font-medium px-3 py-3 hidden md:table-cell">
                Ngày tạo
              </th>
              <th className="text-right text-xs text-dark-400 font-medium px-5 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = session?.user?.id === u.id;
              const busy = busyId === u.id;
              return (
                <tr key={u.id} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-white">{u.name}</p>
                    <p className="text-xs text-dark-500">{u.email}</p>
                  </td>
                  <td className="px-3 py-3.5">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        u.role === 'ADMIN'
                          ? 'bg-brand/10 text-brand'
                          : 'bg-dark-700 text-dark-400'
                      }`}
                    >
                      {u.role === 'ADMIN' ? 'Quản trị' : 'Người dùng'}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        u.status === 'ACTIVE'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-xs text-dark-400 hidden md:table-cell">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {busy ? (
                        <Spinner className="w-4 h-4 text-dark-400" />
                      ) : isSelf ? (
                        <span className="text-xs text-dark-500">Tài khoản của bạn</span>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              patchUser(u.id, {
                                status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                              })
                            }
                            title={u.status === 'ACTIVE' ? 'Tạm khóa tài khoản' : 'Kích hoạt lại'}
                            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                              u.status === 'ACTIVE'
                                ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                                : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? (
                              <>
                                <Ban className="w-3.5 h-3.5" /> Khóa
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Kích hoạt
                              </>
                            )}
                          </button>
                          <button
                            onClick={() =>
                              patchUser(u.id, { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' })
                            }
                            title={u.role === 'ADMIN' ? 'Hạ quyền xuống Người dùng' : 'Nâng quyền lên Quản trị'}
                            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-dark-600 text-dark-400 hover:text-brand hover:border-brand/40 transition-colors"
                          >
                            {u.role === 'ADMIN' ? (
                              <>
                                <ShieldOff className="w-3.5 h-3.5" /> Hạ quyền
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5" /> Nâng quyền
                              </>
                            )}
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
    </div>
  );
}
