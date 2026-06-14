import { prisma } from '@/lib/db';
import { ProposalsAdmin, type AdminProposal } from '@/components/admin/ProposalsAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminGovernancePage() {
  const proposals = await prisma.proposal.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      creator: { select: { name: true, email: true } },
      _count: { select: { votes: true } },
    },
  });

  const rows: AdminProposal[] = proposals.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    status: p.status,
    votesFor: p.votesFor,
    votesAgainst: p.votesAgainst,
    voteCount: p._count.votes,
    creatorName: p.creator.name,
    createdAt: p.createdAt.toISOString(),
    endsAt: p.endsAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Quản trị DAO</h2>
        <p className="text-sm text-dark-400 mt-0.5">
          Tạo, cập nhật trạng thái và xóa các đề xuất quản trị cộng đồng.
        </p>
      </div>
      <ProposalsAdmin proposals={rows} />
    </div>
  );
}
