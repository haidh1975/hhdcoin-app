import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CreateProposalBody {
  title?: string;
  description?: string;
  durationDays?: number;
}

/** POST /api/admin/proposals — tạo đề xuất quản trị (chỉ ADMIN) */
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  try {
    const body: CreateProposalBody = await req.json();
    const title = body.title?.trim();
    const description = body.description?.trim();
    const durationDays = Number(body.durationDays) || 7;

    if (!title || !description) {
      return NextResponse.json({ error: 'Thiếu tiêu đề hoặc mô tả.' }, { status: 400 });
    }

    const proposal = await prisma.proposal.create({
      data: {
        title,
        description,
        status: 'ACTIVE',
        creatorId: session.user.id,
        endsAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    console.error('Admin proposals POST error:', error);
    return NextResponse.json({ error: 'Không thể tạo đề xuất.' }, { status: 500 });
  }
}
