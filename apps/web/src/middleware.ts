import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    // Middleware chạy trên edge runtime nên đọc process.env trực tiếp;
    // việc kiểm tra NEXTAUTH_SECRET (assertServerEnv) đã được làm trong src/lib/auth.ts.
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Đã đăng nhập mà vào /login hoặc /register → về trang chủ
  if (isPublic) {
    if (token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // Chưa đăng nhập → chuyển đến /login
  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /admin/* và /api/admin/* yêu cầu role ADMIN
  if (
    (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) &&
    token.role !== 'ADMIN'
  ) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Bỏ qua: /api/auth/* (NextAuth + đăng ký), file tĩnh, ảnh, favicon
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
