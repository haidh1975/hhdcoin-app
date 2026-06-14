import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { STAKING_CONFIG } from '@/lib/hhd';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PATCH /api/staking/[id] — unstake một khoản stake.
 * Nếu unstake trước unlockAt → áp dụng phạt rút sớm 10% (gửi vào burn).
 */
export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const stake = await prisma.stake.findUnique({ where: { id: params.id } });
    if (!stake || stake.userId !== session.user.id) {
      return NextResponse.json({ error: 'Không tìm thấy khoản stake.' }, { status: 404 });
    }
    if (stake.status === 'UNSTAKED') {
      return NextResponse.json({ error: 'Khoản stake đã được rút.' }, { status: 400 });
    }

    const now = Date.now();
    const earlyExit = now < stake.unlockAt.getTime();
    const msStaked = Math.max(0, now - stake.startAt.getTime());
    const yearsStaked = msStaked / (365 * 24 * 60 * 60 * 1000);
    const grossReward = stake.amount * (stake.apy / 100) * yearsStaked;

    let penalty = 0;
    if (earlyExit) {
      penalty = stake.amount * (STAKING_CONFIG.earlyExitPenaltyPct / 100);
    }

    const returned = stake.amount - penalty + grossReward;

    const updated = await prisma.stake.update({
      where: { id: stake.id },
      data: { status: 'UNSTAKED', rewardClaimed: grossReward },
    });

    return NextResponse.json({
      stake: {
        id: updated.id,
        status: updated.status,
        rewardClaimed: updated.rewardClaimed,
      },
      earlyExit,
      penalty,
      reward: grossReward,
      returned,
    });
  } catch (error) {
    console.error('Staking PATCH error:', error);
    return NextResponse.json({ error: 'Không thể rút khoản stake.' }, { status: 500 });
  }
}
