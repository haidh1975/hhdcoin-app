import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface BuyBody {
  roundId?: string;
  amountUsd?: number;
}

/**
 * POST /api/token-sale/buy — mua HHD trong vòng đang mở (ACTIVE).
 * Ghi nhận SalePurchase và tăng raisedUsd, không vượt hardCap.
 */
export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body: BuyBody = await req.json();
    const roundId = body.roundId;
    const amountUsd = Number(body.amountUsd);

    if (!roundId) {
      return NextResponse.json({ error: 'Thiếu thông tin vòng bán.' }, { status: 400 });
    }
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      return NextResponse.json({ error: 'Số tiền phải lớn hơn 0.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const round = await tx.saleRound.findUnique({ where: { id: roundId } });
      if (!round) {
        throw new Error('NOT_FOUND');
      }
      if (round.status !== 'ACTIVE') {
        throw new Error('NOT_ACTIVE');
      }
      const remaining = round.hardCapUsd - round.raisedUsd;
      if (amountUsd > remaining + 1e-6) {
        throw new Error(`OVER_CAP:${remaining}`);
      }

      const tokens = amountUsd / round.priceUsd;

      const purchase = await tx.salePurchase.create({
        data: {
          userId: session.user.id,
          roundId: round.id,
          amountUsd,
          tokens,
        },
      });

      await tx.saleRound.update({
        where: { id: round.id },
        data: { raisedUsd: { increment: amountUsd } },
      });

      return { purchase, tokens };
    });

    return NextResponse.json(
      {
        purchase: {
          id: result.purchase.id,
          amountUsd: result.purchase.amountUsd,
          tokens: result.purchase.tokens,
          roundId: result.purchase.roundId,
          createdAt: result.purchase.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Không tìm thấy vòng bán.' }, { status: 404 });
      }
      if (error.message === 'NOT_ACTIVE') {
        return NextResponse.json({ error: 'Vòng bán này hiện không mở.' }, { status: 400 });
      }
      if (error.message.startsWith('OVER_CAP:')) {
        const remaining = Number(error.message.split(':')[1]);
        return NextResponse.json(
          { error: `Vượt quá hạn mức còn lại của vòng bán ($${remaining.toLocaleString('en-US')}).` },
          { status: 400 }
        );
      }
    }
    console.error('Token-sale buy error:', error);
    return NextResponse.json({ error: 'Không thể thực hiện giao dịch mua.' }, { status: 500 });
  }
}
