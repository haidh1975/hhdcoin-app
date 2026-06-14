import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_STATUS = ['UPCOMING', 'ACTIVE', 'CLOSED'] as const;
type SaleRoundStatus = (typeof VALID_STATUS)[number];

interface CreateBody {
  name?: string;
  priceUsd?: number;
  allocation?: number;
  hardCapUsd?: number;
  tgeUnlockPct?: number;
  vestingNote?: string;
  status?: string;
  order?: number;
}

/** POST /api/admin/sale-rounds — tạo vòng bán mới (chỉ ADMIN) */
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  try {
    const body: CreateBody = await req.json();
    const name = body.name?.trim();
    const vestingNote = body.vestingNote?.trim() ?? '';
    const priceUsd = Number(body.priceUsd);
    const allocation = Number(body.allocation);
    const hardCapUsd = Number(body.hardCapUsd);
    const tgeUnlockPct = Number(body.tgeUnlockPct);
    const order = Number(body.order);
    const status = body.status;

    if (!name) {
      return NextResponse.json({ error: 'Vui lòng nhập tên vòng bán.' }, { status: 400 });
    }
    if (!status || !(VALID_STATUS as readonly string[]).includes(status)) {
      return NextResponse.json({ error: 'Trạng thái không hợp lệ.' }, { status: 400 });
    }
    if (!(priceUsd > 0) || !(allocation > 0) || !(hardCapUsd > 0)) {
      return NextResponse.json(
        { error: 'Giá, phân bổ và hard cap phải lớn hơn 0.' },
        { status: 400 }
      );
    }
    if (Number.isNaN(tgeUnlockPct) || tgeUnlockPct < 0) {
      return NextResponse.json({ error: 'Tỷ lệ mở khóa TGE không hợp lệ.' }, { status: 400 });
    }
    if (Number.isNaN(order)) {
      return NextResponse.json({ error: 'Thứ tự không hợp lệ.' }, { status: 400 });
    }

    const round = await prisma.saleRound.create({
      data: {
        name,
        priceUsd,
        allocation,
        hardCapUsd,
        tgeUnlockPct,
        vestingNote,
        status: status as SaleRoundStatus,
        order,
      },
    });

    return NextResponse.json({ round }, { status: 201 });
  } catch (error) {
    console.error('Admin sale-rounds POST error:', error);
    return NextResponse.json({ error: 'Không thể tạo vòng bán.' }, { status: 500 });
  }
}
