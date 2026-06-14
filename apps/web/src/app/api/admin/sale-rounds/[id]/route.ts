import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_STATUS = ['UPCOMING', 'ACTIVE', 'CLOSED'] as const;
type SaleRoundStatus = (typeof VALID_STATUS)[number];

interface PatchBody {
  name?: string;
  priceUsd?: number;
  allocation?: number;
  hardCapUsd?: number;
  tgeUnlockPct?: number;
  vestingNote?: string;
  status?: string;
  order?: number;
}

/** PATCH /api/admin/sale-rounds/[id] — cập nhật vòng bán (chỉ ADMIN). Tương thích ngược với body chỉ có status. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  try {
    const body: PatchBody = await req.json();

    const round = await prisma.saleRound.findUnique({ where: { id: params.id } });
    if (!round) {
      return NextResponse.json({ error: 'Không tìm thấy vòng bán.' }, { status: 404 });
    }

    const data: {
      name?: string;
      priceUsd?: number;
      allocation?: number;
      hardCapUsd?: number;
      tgeUnlockPct?: number;
      vestingNote?: string;
      status?: SaleRoundStatus;
      order?: number;
    } = {};

    if (body.status !== undefined) {
      if (!(VALID_STATUS as readonly string[]).includes(body.status)) {
        return NextResponse.json({ error: 'Trạng thái không hợp lệ.' }, { status: 400 });
      }
      data.status = body.status as SaleRoundStatus;
    }

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: 'Tên vòng bán không được để trống.' }, { status: 400 });
      }
      data.name = name;
    }

    if (body.vestingNote !== undefined) {
      data.vestingNote = body.vestingNote.trim();
    }

    if (body.priceUsd !== undefined) {
      const priceUsd = Number(body.priceUsd);
      if (!(priceUsd > 0)) {
        return NextResponse.json({ error: 'Giá phải lớn hơn 0.' }, { status: 400 });
      }
      data.priceUsd = priceUsd;
    }

    if (body.allocation !== undefined) {
      const allocation = Number(body.allocation);
      if (!(allocation > 0)) {
        return NextResponse.json({ error: 'Phân bổ phải lớn hơn 0.' }, { status: 400 });
      }
      data.allocation = allocation;
    }

    if (body.hardCapUsd !== undefined) {
      const hardCapUsd = Number(body.hardCapUsd);
      if (!(hardCapUsd > 0)) {
        return NextResponse.json({ error: 'Hard cap phải lớn hơn 0.' }, { status: 400 });
      }
      data.hardCapUsd = hardCapUsd;
    }

    if (body.tgeUnlockPct !== undefined) {
      const tgeUnlockPct = Number(body.tgeUnlockPct);
      if (Number.isNaN(tgeUnlockPct) || tgeUnlockPct < 0) {
        return NextResponse.json({ error: 'Tỷ lệ mở khóa TGE không hợp lệ.' }, { status: 400 });
      }
      data.tgeUnlockPct = tgeUnlockPct;
    }

    if (body.order !== undefined) {
      const order = Number(body.order);
      if (Number.isNaN(order)) {
        return NextResponse.json({ error: 'Thứ tự không hợp lệ.' }, { status: 400 });
      }
      data.order = order;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Không có dữ liệu để cập nhật.' }, { status: 400 });
    }

    const updated = await prisma.saleRound.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ round: updated });
  } catch (error) {
    console.error('Admin sale-rounds PATCH error:', error);
    return NextResponse.json({ error: 'Không thể cập nhật vòng bán.' }, { status: 500 });
  }
}

/** DELETE /api/admin/sale-rounds/[id] — xóa vòng bán (chỉ ADMIN). Chặn nếu đã có lượt mua. */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  try {
    const round = await prisma.saleRound.findUnique({ where: { id: params.id } });
    if (!round) {
      return NextResponse.json({ error: 'Không tìm thấy vòng bán.' }, { status: 404 });
    }

    const purchaseCount = await prisma.salePurchase.count({ where: { roundId: params.id } });
    if (purchaseCount > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa vòng bán đã có lượt mua.' },
        { status: 400 }
      );
    }

    await prisma.saleRound.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin sale-rounds DELETE error:', error);
    return NextResponse.json({ error: 'Không thể xóa vòng bán.' }, { status: 500 });
  }
}
