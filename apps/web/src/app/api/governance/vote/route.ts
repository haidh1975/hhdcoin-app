import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface VoteBody {
  proposalId?: string;
  support?: boolean;
}

/**
 * POST /api/governance/vote — bỏ phiếu cho một đề xuất.
 * Quyền biểu quyết = tổng số HHD đang stake (status ACTIVE). 1 HHD = 1 phiếu.
 */
export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body: VoteBody = await req.json();
    const proposalId = body.proposalId;
    const support = body.support;

    if (!proposalId || typeof support !== 'boolean') {
      return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 });
    }

    const userId = session.user.id;

    const proposal = await prisma.proposal.findUnique({ where: { id: proposalId } });
    if (!proposal) {
      return NextResponse.json({ error: 'Không tìm thấy đề xuất.' }, { status: 404 });
    }
    if (proposal.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Đề xuất không còn mở để bỏ phiếu.' }, { status: 400 });
    }

    const activeStakes = await prisma.stake.findMany({
      where: { userId, status: 'ACTIVE' },
    });
    const weight = activeStakes.reduce((sum, s) => sum + s.amount, 0);
    if (weight <= 0) {
      return NextResponse.json(
        { error: 'Bạn cần có ít nhất một khoản stake đang hoạt động để bỏ phiếu.' },
        { status: 403 }
      );
    }

    const existing = await prisma.vote.findUnique({
      where: { proposalId_userId: { proposalId, userId } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Bạn đã bỏ phiếu cho đề xuất này.' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.vote.create({
        data: { proposalId, userId, support, weight },
      }),
      prisma.proposal.update({
        where: { id: proposalId },
        data: support
          ? { votesFor: { increment: weight } }
          : { votesAgainst: { increment: weight } },
      }),
    ]);

    return NextResponse.json({ ok: true, weight, support }, { status: 201 });
  } catch (error) {
    console.error('Governance vote error:', error);
    return NextResponse.json({ error: 'Không thể bỏ phiếu.' }, { status: 500 });
  }
}
