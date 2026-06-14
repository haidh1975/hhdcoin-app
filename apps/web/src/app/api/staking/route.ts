import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { STAKE_TIERS, STAKING_CONFIG } from '@/lib/hhd';
import type { StakeInfo, StakeTier } from '@hhd-i/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toInfo(s: {
  id: string;
  userId: string;
  tier: string;
  amount: number;
  apy: number;
  lockDays: number;
  startAt: Date;
  unlockAt: Date;
  autoCompound: boolean;
  status: string;
  rewardClaimed: number;
}): StakeInfo {
  return {
    id: s.id,
    userId: s.userId,
    tier: s.tier as StakeTier,
    amount: s.amount,
    apy: s.apy,
    lockDays: s.lockDays,
    startAt: s.startAt.toISOString(),
    unlockAt: s.unlockAt.toISOString(),
    autoCompound: s.autoCompound,
    status: s.status as StakeInfo['status'],
    rewardClaimed: s.rewardClaimed,
  };
}

/** GET /api/staking — các khoản stake của người dùng hiện tại */
export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const stakes = await prisma.stake.findMany({
      where: { userId: session.user.id },
      orderBy: { startAt: 'desc' },
    });
    return NextResponse.json({ stakes: stakes.map(toInfo) });
  } catch (error) {
    console.error('Staking GET error:', error);
    return NextResponse.json({ error: 'Không thể tải các khoản stake.' }, { status: 500 });
  }
}

interface CreateStakeBody {
  tier?: StakeTier;
  amount?: number;
  autoCompound?: boolean;
}

/** POST /api/staking — tạo khoản stake mới */
export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body: CreateStakeBody = await req.json();
    const tier = body.tier;
    const amount = Number(body.amount);
    const autoCompound = Boolean(body.autoCompound);

    if (!tier || !STAKE_TIERS[tier]) {
      return NextResponse.json({ error: 'Tier không hợp lệ.' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Số lượng phải lớn hơn 0.' }, { status: 400 });
    }

    const config = STAKE_TIERS[tier];
    if (amount < config.minStake) {
      return NextResponse.json(
        { error: `Tier ${config.label} yêu cầu tối thiểu ${config.minStake.toLocaleString('en-US')} HHD.` },
        { status: 400 }
      );
    }

    const activeCount = await prisma.stake.count({
      where: { userId: session.user.id, status: 'ACTIVE' },
    });
    if (activeCount >= STAKING_CONFIG.maxConcurrentStakes) {
      return NextResponse.json(
        { error: `Tối đa ${STAKING_CONFIG.maxConcurrentStakes} khoản stake đang hoạt động mỗi ví.` },
        { status: 400 }
      );
    }

    const startAt = new Date();
    const unlockAt = new Date(startAt.getTime() + config.lockDays * 24 * 60 * 60 * 1000);

    const stake = await prisma.stake.create({
      data: {
        userId: session.user.id,
        tier,
        amount,
        apy: config.apy,
        lockDays: config.lockDays,
        startAt,
        unlockAt,
        autoCompound,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ stake: toInfo(stake) }, { status: 201 });
  } catch (error) {
    console.error('Staking POST error:', error);
    return NextResponse.json({ error: 'Không thể tạo khoản stake.' }, { status: 500 });
  }
}
