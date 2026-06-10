import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

interface PatchBody {
  status?: 'ACTIVE' | 'SUSPENDED';
  role?: 'USER' | 'ADMIN';
}

/** PATCH /api/admin/users/[id] — khóa/mở khóa, phân quyền (chỉ ADMIN) */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  try {
    const body: PatchBody = await req.json();
    const data: PatchBody = {};

    if (body.status) {
      if (!['ACTIVE', 'SUSPENDED'].includes(body.status)) {
        return NextResponse.json({ error: 'Trạng thái không hợp lệ.' }, { status: 400 });
      }
      data.status = body.status;
    }
    if (body.role) {
      if (!['USER', 'ADMIN'].includes(body.role)) {
        return NextResponse.json({ error: 'Vai trò không hợp lệ.' }, { status: 400 });
      }
      data.role = body.role;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Không có thay đổi nào.' }, { status: 400 });
    }

    // Không cho admin tự khóa hoặc tự hạ quyền chính mình
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Không thể thay đổi tài khoản của chính bạn.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Admin user PATCH error:', error);
    return NextResponse.json({ error: 'Không thể cập nhật người dùng.' }, { status: 500 });
  }
}
