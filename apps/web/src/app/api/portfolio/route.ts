import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { getMarketPrices } from '@/lib/marketData';
import type { PortfolioHolding, PortfolioSummary } from '@hhd-i/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const holdings = await prisma.holding.findMany({
      where: { userId: session.user.id },
      include: { asset: true },
    });

    const symbols = holdings.map((h) => h.asset.symbol);
    const prices = await getMarketPrices(symbols);
    const priceMap = new Map(prices.map((p) => [p.symbol, p]));

    let totalValue = 0;
    let totalCost = 0;

    const enriched: PortfolioHolding[] = holdings.map((h) => {
      const market = priceMap.get(h.asset.symbol);
      const currentPrice = market?.price ?? h.avgBuyPrice;
      const value = h.amount * currentPrice;
      const cost = h.amount * h.avgBuyPrice;
      totalValue += value;
      totalCost += cost;

      return {
        assetId: h.assetId,
        symbol: h.asset.symbol,
        name: h.asset.name,
        type: h.asset.type,
        amount: h.amount,
        avgBuyPrice: h.avgBuyPrice,
        currentPrice,
        value,
        pnl: value - cost,
        pnlPercent: cost > 0 ? ((value - cost) / cost) * 100 : 0,
        allocation: 0, // tính sau khi có totalValue
        change24h: market?.change24h ?? 0,
        priceSource: market?.source ?? 'mock',
      };
    });

    for (const h of enriched) {
      h.allocation = totalValue > 0 ? (h.value / totalValue) * 100 : 0;
    }
    enriched.sort((a, b) => b.value - a.value);

    const summary: PortfolioSummary = {
      totalValue,
      totalCost,
      pnl: totalValue - totalCost,
      pnlPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      holdings: enriched,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Portfolio API error:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh mục đầu tư.' },
      { status: 500 }
    );
  }
}
