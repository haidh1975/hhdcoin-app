import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import type { ProposalInfo, ProposalStatus } from '@hhd-i/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/governance — danh sách đề xuất + quyền biểu quyết của người dùng */
export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const [proposals, votes, activeStakes] = await Promise.all([
      prisma.proposal.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.vote.findMany({ where: { userId } }),
      prisma.stake.findMany({ where: { userId, status: 'ACTIVE' } }),
    ]);

    const voteMap = new Map(votes.map((v) => [v.proposalId, v.support]));
    const votingPower = activeStakes.reduce((sum, s) => sum + s.amount, 0);

    const result: ProposalInfo[] = proposals.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status as ProposalStatus,
      votesFor: p.votesFor,
      votesAgainst: p.votesAgainst,
      createdAt: p.createdAt.toISOString(),
      endsAt: p.endsAt.toISOString(),
      creatorId: p.creatorId,
      userVoted: voteMap.has(p.id),
      userSupport: voteMap.has(p.id) ? voteMap.get(p.id) : null,
    }));

    return NextResponse.json({ proposals: result, votingPower });
  } catch (error) {
    console.error('Governance GET error:', error);
    return NextResponse.json({ error: 'Không thể tải danh sách đề xuất.' }, { status: 500 });
  }
}
