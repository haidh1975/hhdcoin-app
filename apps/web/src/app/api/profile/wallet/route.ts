import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Kiểm tra cơ bản định dạng địa chỉ EVM (0x + 40 ký tự hex). */
function isValidAddress(value: unknown): value is string {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value);
}

/** GET /api/profile/wallet — trả về địa chỉ ví đã liên kết của người dùng. */
export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletAddress: true },
    });
    return NextResponse.json({ walletAddress: user?.walletAddress ?? null });
  } catch (error) {
    console.error('Wallet GET error:', error);
    return NextResponse.json({ error: 'Không thể tải địa chỉ ví.' }, { status: 500 });
  }
}

interface WalletBody {
  address?: string;
}

/** POST /api/profile/wallet — liên kết địa chỉ ví với tài khoản (lưu chữ thường). */
export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body: WalletBody = await req.json();
    if (!isValidAddress(body.address)) {
      return NextResponse.json({ error: 'Địa chỉ ví không hợp lệ.' }, { status: 400 });
    }

    const walletAddress = body.address.toLowerCase();
    await prisma.user.update({
      where: { id: session.user.id },
      data: { walletAddress },
    });

    return NextResponse.json({ walletAddress });
  } catch (error) {
    console.error('Wallet POST error:', error);
    return NextResponse.json({ error: 'Không thể liên kết ví.' }, { status: 500 });
  }
}

/** DELETE /api/profile/wallet — gỡ liên kết ví khỏi tài khoản. */
export async function DELETE() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { walletAddress: null },
    });
    return NextResponse.json({ walletAddress: null });
  } catch (error) {
    console.error('Wallet DELETE error:', error);
    return NextResponse.json({ error: 'Không thể gỡ liên kết ví.' }, { status: 500 });
  }
}
