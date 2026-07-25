import { prisma } from '@/lib/db';
import { AssetsTable } from '@/components/admin/AssetsTable';
import type { Asset } from '@hhd-i/types';
import { Card } from '@/shared/components/ui/Card';

export const dynamic = 'force-dynamic';

export default async function AdminAssetsPage() {
  const assets = await prisma.asset.findMany({
    orderBy: [{ type: 'asc' }, { symbol: 'asc' }],
  });

  const rows: Asset[] = assets.map((a) => ({
    id: a.id,
    symbol: a.symbol,
    name: a.name,
    type: a.type,
    enabled: a.enabled,
  }));

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-4 border-b border-dark-600">
        <h2 className="text-base font-semibold text-white">Tài sản ({rows.length})</h2>
        <p className="text-xs text-dark-400 mt-0.5">
          Tài sản bị tắt sẽ không thể giao dịch trên nền tảng.
        </p>
      </div>
      <AssetsTable assets={rows} />
    </Card>
  );
}
