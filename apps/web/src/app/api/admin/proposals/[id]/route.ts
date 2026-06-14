import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_STATUS = ['ACTIVE', 'PASSED', 'REJECTED', 'EXECUTED'] as const;
type ProposalStatus = (typeof VALID_STATUS)[number];

interface PatchBody {
  status?: string;
  title?: string;
  description?: string;
  endsAt?: string;
}

/** PATCH /api/admin/proposals/[id] — cập nhật đề xuất (chỉ ADMIN) */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  try {
    const body: PatchBody = await req.json();

    const proposal = await prisma.proposal.findUnique({ where: { id: params.id } });
    if (!proposal) {
      return NextResponse.json({ error: 'Không tìm thấy đề xuất.' }, { status: 404 });
    }

    const data: {
      status?: ProposalStatus;
      title?: string;
      description?: string;
      endsAt?: Date;
    } = {};

    if (body.status !== undefined) {
      if (!(VALID_STATUS as readonly string[]).includes(body.status)) {
        return NextResponse.json({ error: 'Trạng thái không hợp lệ.' }, { status: 400 });
      }
      data.status = body.status as ProposalStatus;
    }

    if (body.title !== undefined) {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json({ error: 'Tiêu đề không được để trống.' }, { status: 400 });
      }
      data.title = title;
    }

    if (body.description !== undefined) {
      const description = body.description.trim();
      if (!description) {
        return NextResponse.json({ error: 'Mô tả không được để trống.' }, { status: 400 });
      }
      data.description = description;
    }

    if (body.endsAt !== undefined) {
      const endsAt = new Date(body.endsAt);
      if (Number.isNaN(endsAt.getTime())) {
        return NextResponse.json({ error: 'Thời gian kết thúc không hợp lệ.' }, { status: 400 });
      }
      data.endsAt = endsAt;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Không có dữ liệu để cập nhật.' }, { status: 400 });
    }

    const updated = await prisma.proposal.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ proposal: updated });
  } catch (error) {
    console.error('Admin proposals PATCH error:', error);
    return NextResponse.json({ error: 'Không thể cập nhật đề xuất.' }, { status: 500 });
  }
}

/** DELETE /api/admin/proposals/[id] — xóa đề xuất và phiếu bầu liên quan (chỉ ADMIN) */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  try {
    const proposal = await prisma.proposal.findUnique({ where: { id: params.id } });
    if (!proposal) {
      return NextResponse.json({ error: 'Không tìm thấy đề xuất.' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.vote.deleteMany({ where: { proposalId: params.id } }),
      prisma.proposal.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin proposals DELETE error:', error);
    return NextResponse.json({ error: 'Không thể xóa đề xuất.' }, { status: 500 });
  }
}
