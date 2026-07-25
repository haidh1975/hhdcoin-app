import { Users, UserCheck, ArrowLeftRight, DollarSign, Bot, Landmark, Rocket } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Card } from '@/shared/components/ui/Card';
import { TX_TYPE_LABELS } from '@/shared/constants/status';
import { formatDate, formatDateTime, formatUsd } from '@/shared/utils/format';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    activeUsers,
    totalTransactions,
    volumeAgg,
    recentTx,
    recentUsers,
    activeProposals,
    raisedAgg,
  ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        _sum: { totalValue: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.transaction.findMany({
        include: {
          user: { select: { name: true, email: true } },
          asset: { select: { symbol: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, createdAt: true, role: true },
      }),
      prisma.proposal.count({ where: { status: 'ACTIVE' } }),
      prisma.saleRound.aggregate({ _sum: { raisedUsd: true } }),
    ]);

  const stats = [
    { icon: Users, label: 'Tổng người dùng', value: totalUsers.toLocaleString('vi-VN'), color: 'text-brand' },
    { icon: UserCheck, label: 'Đang hoạt động', value: activeUsers.toLocaleString('vi-VN'), color: 'text-green-400' },
    { icon: ArrowLeftRight, label: 'Tổng giao dịch', value: totalTransactions.toLocaleString('vi-VN'), color: 'text-blue-400' },
    { icon: DollarSign, label: 'Tổng khối lượng', value: formatUsd(volumeAgg._sum.totalValue ?? 0), color: 'text-white' },
    { icon: Landmark, label: 'Đề xuất đang mở', value: activeProposals.toLocaleString('vi-VN'), color: 'text-brand' },
    { icon: Rocket, label: 'Tổng vốn đã gọi', value: formatUsd(raisedAgg._sum.raisedUsd ?? 0), color: 'text-green-400' },
    { icon: Bot, label: 'Yêu cầu AI', value: '—', color: 'text-dark-400', note: 'Sắp có tracking' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Card key={s.label} padded>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-dark-700">
                <s.icon className="w-4 h-4 text-brand" />
              </div>
            </div>
            <p className="text-xs text-dark-400 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            {s.note && <p className="text-xs text-dark-500 mt-1">{s.note}</p>}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent transactions */}
        <Card className="xl:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-600">
            <h2 className="text-base font-semibold text-white">Giao dịch gần đây</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left text-xs text-dark-400 font-medium px-5 py-3">Người dùng</th>
                  <th className="text-left text-xs text-dark-400 font-medium px-3 py-3">Loại</th>
                  <th className="text-right text-xs text-dark-400 font-medium px-3 py-3">Giá trị</th>
                  <th className="text-right text-xs text-dark-400 font-medium px-5 py-3 hidden md:table-cell">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map((tx) => (
                  <tr key={tx.id} className="border-b border-dark-600 last:border-0">
                    <td className="px-5 py-3">
                      <p className="text-sm text-white font-medium">{tx.user.name}</p>
                      <p className="text-xs text-dark-500">{tx.user.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          tx.type === 'BUY' || tx.type === 'DEPOSIT'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {TX_TYPE_LABELS[tx.type] ?? tx.type}
                        {tx.asset ? ` ${tx.asset.symbol}` : ''}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-white font-medium">
                      {formatUsd(tx.totalValue)}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-dark-400 hidden md:table-cell">
                      {formatDateTime(tx.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent signups */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-600">
            <h2 className="text-base font-semibold text-white">Đăng ký mới</h2>
          </div>
          <div className="divide-y divide-dark-600">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-black">
                    {u.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.name}</p>
                  <p className="text-xs text-dark-500 truncate">{u.email}</p>
                </div>
                <p className="text-xs text-dark-400 flex-shrink-0">
                  {formatDate(u.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
