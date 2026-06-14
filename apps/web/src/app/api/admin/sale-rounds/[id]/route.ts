import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_STATUS = ['UPCOMING', 'ACTIVE', 'CLOSED'];

interface PatchBody {
  status?: string;
}

/** PATCH /api/admin/sale-rounds/[id] — đổi trạng thái vòng bán (chỉ ADMIN) */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  try {
    const body: PatchBody = await req.json();
    const status = body.status;
    if (!status || !VALID_STATUS.includes(status)) {
      return NextResponse.json({ error: 'Trạng thái không hợp lệ.' }, { status: 400 });
    }

    const round = await prisma.saleRound.findUnique({ where: { id: params.id } });
    if (!round) {
      return NextResponse.json({ error: 'Không tìm thấy vòng bán.' }, { status: 404 });
    }

    const updated = await prisma.saleRound.update({
      where: { id: params.id },
      data: { status: status as 'UPCOMING' | 'ACTIVE' | 'CLOSED' },
    });

    return NextResponse.json({ round: updated });
  } catch (error) {
    console.error('Admin sale-rounds PATCH error:', error);
    return NextResponse.json({ error: 'Không thể cập nhật vòng bán.' }, { status: 500 });
  }
}
