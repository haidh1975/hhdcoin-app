import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { assertServerEnv } from '@/config/env';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Đăng nhập',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        assertServerEnv();
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Vui lòng nhập email và mật khẩu');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) {
          throw new Error('Email hoặc mật khẩu không đúng');
        }

        if (user.status === 'SUSPENDED') {
          throw new Error('Tài khoản đã bị tạm khóa. Vui lòng liên hệ hỗ trợ.');
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          throw new Error('Email hoặc mật khẩu không đúng');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Kiểm tra env lười (không ở top-level) để `next build` không cần .env;
      // production boot với secret thiếu/yếu sẽ fail ngay ở lần dùng auth đầu tiên.
      assertServerEnv();
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: 'USER' | 'ADMIN' }).role ?? 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'USER' | 'ADMIN';
      }
      return session;
    },
  },
};

/** Lấy session phía server (route handlers / server components). */
export function auth() {
  return getServerSession(authOptions);
}

/** Trả về session nếu đã đăng nhập, ngược lại null. Dùng trong API routes. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
}

/** Trả về session nếu là ADMIN, ngược lại null. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') return null;
  return session;
}
