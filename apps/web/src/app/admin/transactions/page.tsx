import { prisma } from '@/lib/db';
import { TransactionFilter } from '@/components/admin/TransactionFilter';
import type { Prisma } from '@prisma/client';
import { Card } from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { TX_STATUS_META, TX_TYPE_LABELS } from '@/shared/constants/status';
import { formatDateTime, formatTokenAmount, formatUsd } from '@/shared/utils/format';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAW'] as const;
const VALID_STATUSES = ['PENDING', 'COMPLETED', 'FAILED'] as const;

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: { type?: string; status?: string };
}) {
  const where: Prisma.TransactionWhereInput = {};
  if (searchParams.type && (VALID_TYPES as readonly string[]).includes(searchParams.type)) {
    where.type = searchParams.type as (typeof VALID_TYPES)[number];
  }
  if (searchParams.status && (VALID_STATUSES as readonly string[]).includes(searchParams.status)) {
    where.status = searchParams.status as (typeof VALID_STATUSES)[number];
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      asset: { select: { symbol: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-dark-600">
        <h2 className="text-base font-semibold text-white">
          Tất cả giao dịch ({transactions.length})
        </h2>
        <TransactionFilter />
      </div>

      {transactions.length === 0 ? (
        <EmptyState>Không có giao dịch nào phù hợp bộ lọc.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left text-xs text-dark-400 font-medium px-5 py-3">Người dùng</th>
                <th className="text-left text-xs text-dark-400 font-medium px-3 py-3">Loại</th>
                <th className="text-right text-xs text-dark-400 font-medium px-3 py-3 hidden md:table-cell">
                  Số lượng
                </th>
                <th className="text-right text-xs text-dark-400 font-medium px-3 py-3 hidden md:table-cell">
                  Giá
                </th>
                <th className="text-right text-xs text-dark-400 font-medium px-3 py-3">Giá trị</th>
                <th className="text-left text-xs text-dark-400 font-medium px-3 py-3">Trạng thái</th>
                <th className="text-right text-xs text-dark-400 font-medium px-5 py-3 hidden lg:table-cell">
                  Thời gian
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const status = TX_STATUS_META[tx.status] ?? TX_STATUS_META.COMPLETED;
                return (
                  <tr key={tx.id} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-white">{tx.user.name}</p>
                      <p className="text-xs text-dark-500">{tx.user.email}</p>
                    </td>
                    <td className="px-3 py-3.5">
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
                    <td className="px-3 py-3.5 text-right text-sm text-dark-400 hidden md:table-cell">
                      {formatTokenAmount(tx.amount)}
                    </td>
                    <td className="px-3 py-3.5 text-right text-sm text-dark-400 hidden md:table-cell">
                      {formatUsd(tx.price)}
                    </td>
                    <td className="px-3 py-3.5 text-right text-sm font-semibold text-white">
                      {formatUsd(tx.totalValue)}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge label={status.label} tone={status.tone} />
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-dark-400 hidden lg:table-cell">
                      {formatDateTime(tx.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
