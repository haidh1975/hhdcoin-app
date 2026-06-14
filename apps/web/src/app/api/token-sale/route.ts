import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import type { SaleRoundInfo, SalePurchaseInfo, SaleRoundStatus } from '@hhd-i/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/token-sale — các vòng bán + lịch sử mua của người dùng */
export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const [rounds, purchases] = await Promise.all([
      prisma.saleRound.findMany({ orderBy: { order: 'asc' } }),
      prisma.salePurchase.findMany({
        where: { userId: session.user.id },
        include: { round: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const roundInfos: SaleRoundInfo[] = rounds.map((r) => ({
      id: r.id,
      name: r.name,
      priceUsd: r.priceUsd,
      allocation: r.allocation,
      hardCapUsd: r.hardCapUsd,
      raisedUsd: r.raisedUsd,
      tgeUnlockPct: r.tgeUnlockPct,
      vestingNote: r.vestingNote,
      status: r.status as SaleRoundStatus,
      order: r.order,
    }));

    const purchaseInfos: SalePurchaseInfo[] = purchases.map((p) => ({
      id: p.id,
      userId: p.userId,
      roundId: p.roundId,
      roundName: p.round.name,
      amountUsd: p.amountUsd,
      tokens: p.tokens,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ rounds: roundInfos, purchases: purchaseInfos });
  } catch (error) {
    console.error('Token-sale GET error:', error);
    return NextResponse.json({ error: 'Không thể tải dữ liệu bán token.' }, { status: 500 });
  }
}
