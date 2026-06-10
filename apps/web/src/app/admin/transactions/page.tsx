import { prisma } from '@/lib/db';
import { TransactionFilter } from '@/components/admin/TransactionFilter';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

const TX_LABELS: Record<string, string> = {
  BUY: 'Mua',
  SELL: 'Bán',
  DEPOSIT: 'Nạp tiền',
  WITHDRAW: 'Rút tiền',
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  COMPLETED: { label: 'Hoàn tất', cls: 'bg-green-500/10 text-green-400' },
  PENDING: { label: 'Đang xử lý', cls: 'bg-yellow-500/10 text-yellow-400' },
  FAILED: { label: 'Thất bại', cls: 'bg-red-500/10 text-red-400' },
};

const VALID_TYPES = ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAW'] as const;
const VALID_STATUSES = ['PENDING', 'COMPLETED', 'FAILED'] as const;

function formatUsd(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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
    <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-dark-600">
        <h2 className="text-base font-semibold text-white">
          Tất cả giao dịch ({transactions.length})
        </h2>
        <TransactionFilter />
      </div>

      {transactions.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-dark-400">
          Không có giao dịch nào phù hợp bộ lọc.
        </div>
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
                const status = STATUS_LABELS[tx.status] ?? STATUS_LABELS.COMPLETED;
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
                        {TX_LABELS[tx.type] ?? tx.type}
                        {tx.asset ? ` ${tx.asset.symbol}` : ''}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right text-sm text-dark-400 hidden md:table-cell">
                      {tx.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })}
                    </td>
                    <td className="px-3 py-3.5 text-right text-sm text-dark-400 hidden md:table-cell">
                      {formatUsd(tx.price)}
                    </td>
                    <td className="px-3 py-3.5 text-right text-sm font-semibold text-white">
                      {formatUsd(tx.totalValue)}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-dark-400 hidden lg:table-cell">
                      {tx.createdAt.toLocaleString('vi-VN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
