import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { getMarketPrices } from '@/lib/marketData';
import type { TransactionRecord } from '@hhd-i/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/transactions?page=1&pageSize=20 — lịch sử giao dịch của chính mình */
export async function GET(req: NextRequest) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(req.nextUrl.searchParams.get('pageSize') ?? '20', 10) || 20)
    );

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: session.user.id },
        include: { asset: { select: { symbol: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaction.count({ where: { userId: session.user.id } }),
    ]);

    const transactions: TransactionRecord[] = items.map((t) => ({
      id: t.id,
      userId: t.userId,
      assetId: t.assetId,
      assetSymbol: t.asset?.symbol ?? null,
      assetName: t.asset?.name ?? null,
      type: t.type,
      amount: t.amount,
      price: t.price,
      totalValue: t.totalValue,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json({
      transactions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Transactions GET error:', error);
    return NextResponse.json({ error: 'Không thể tải lịch sử giao dịch.' }, { status: 500 });
  }
}

interface CreateTransactionBody {
  symbol?: string;
  type?: 'BUY' | 'SELL';
  amount?: number;
}

/**
 * POST /api/transactions — tạo lệnh MUA/BÁN theo giá thị trường hiện tại,
 * cập nhật Holding một cách nguyên tử (Prisma transaction).
 */
export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body: CreateTransactionBody = await req.json();
    const symbol = body.symbol?.toUpperCase().trim();
    const type = body.type;
    const amount = Number(body.amount);

    if (!symbol || !type || !['BUY', 'SELL'].includes(type)) {
      return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Số lượng phải lớn hơn 0.' }, { status: 400 });
    }

    const asset = await prisma.asset.findUnique({ where: { symbol } });
    if (!asset || !asset.enabled) {
      return NextResponse.json(
        { error: 'Tài sản không tồn tại hoặc đang bị vô hiệu hóa.' },
        { status: 400 }
      );
    }

    const [marketPrice] = await getMarketPrices([symbol]);
    const price = marketPrice?.price;
    if (!price || price <= 0) {
      return NextResponse.json({ error: 'Không lấy được giá thị trường.' }, { status: 502 });
    }

    const totalValue = amount * price;
    const userId = session.user.id;

    const result = await prisma.$transaction(async (tx) => {
      const holding = await tx.holding.findUnique({
        where: { userId_assetId: { userId, assetId: asset.id } },
      });

      if (type === 'BUY') {
        if (holding) {
          // Cập nhật giá mua trung bình theo trọng số
          const newAmount = holding.amount + amount;
          const newAvg =
            (holding.amount * holding.avgBuyPrice + amount * price) / newAmount;
          await tx.holding.update({
            where: { id: holding.id },
            data: { amount: newAmount, avgBuyPrice: newAvg },
          });
        } else {
          await tx.holding.create({
            data: { userId, assetId: asset.id, amount, avgBuyPrice: price },
          });
        }
      } else {
        // SELL
        if (!holding || holding.amount < amount) {
          throw new Error('INSUFFICIENT');
        }
        const remaining = holding.amount - amount;
        if (remaining <= 1e-9) {
          await tx.holding.delete({ where: { id: holding.id } });
        } else {
          await tx.holding.update({
            where: { id: holding.id },
            data: { amount: remaining },
          });
        }
      }

      return tx.transaction.create({
        data: {
          userId,
          assetId: asset.id,
          type,
          amount,
          price,
          totalValue,
          status: 'COMPLETED',
        },
      });
    });

    return NextResponse.json(
      {
        transaction: {
          id: result.id,
          userId: result.userId,
          assetId: result.assetId,
          assetSymbol: asset.symbol,
          assetName: asset.name,
          type: result.type,
          amount: result.amount,
          price: result.price,
          totalValue: result.totalValue,
          status: result.status,
          createdAt: result.createdAt.toISOString(),
        } satisfies TransactionRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'INSUFFICIENT') {
      return NextResponse.json(
        { error: 'Số dư không đủ để thực hiện lệnh bán.' },
        { status: 400 }
      );
    }
    console.error('Transactions POST error:', error);
    return NextResponse.json({ error: 'Không thể tạo giao dịch.' }, { status: 500 });
  }
}
