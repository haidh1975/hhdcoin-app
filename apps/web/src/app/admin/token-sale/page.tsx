import { prisma } from '@/lib/db';
import { SaleRoundsAdmin, type AdminSaleRound } from '@/components/admin/SaleRoundsAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminTokenSalePage() {
  const rounds = await prisma.saleRound.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { purchases: true } },
      purchases: { select: { amountUsd: true } },
    },
  });

  const rows: AdminSaleRound[] = rounds.map((r) => ({
    id: r.id,
    name: r.name,
    priceUsd: r.priceUsd,
    allocation: r.allocation,
    hardCapUsd: r.hardCapUsd,
    raisedUsd: r.raisedUsd,
    tgeUnlockPct: r.tgeUnlockPct,
    vestingNote: r.vestingNote,
    status: r.status,
    order: r.order,
    buyerCount: r._count.purchases,
    purchasedUsd: r.purchases.reduce((sum, p) => sum + p.amountUsd, 0),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Vòng bán Token</h2>
        <p className="text-sm text-dark-400 mt-0.5">
          Tạo, chỉnh sửa và quản lý các vòng bán token HHD.
        </p>
      </div>
      <SaleRoundsAdmin rounds={rows} />
    </div>
  );
}
