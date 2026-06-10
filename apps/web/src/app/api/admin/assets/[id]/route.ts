import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

/** PATCH /api/admin/assets/[id] — bật/tắt tài sản (chỉ ADMIN) */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  try {
    const body: { enabled?: boolean } = await req.json();
    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json({ error: 'Thiếu trường enabled.' }, { status: 400 });
    }

    const asset = await prisma.asset.update({
      where: { id: params.id },
      data: { enabled: body.enabled },
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error('Admin asset PATCH error:', error);
    return NextResponse.json({ error: 'Không thể cập nhật tài sản.' }, { status: 500 });
  }
}
