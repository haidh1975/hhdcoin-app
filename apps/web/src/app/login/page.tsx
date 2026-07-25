'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Spinner } from '@/shared/components/ui/Spinner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error === 'CredentialsSignin' ? 'Email hoặc mật khẩu không đúng' : result.error);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center">
          <Zap className="w-6 h-6 text-black" fill="black" />
        </div>
        <div>
          <span className="text-2xl font-bold text-white tracking-tight">HHD-I</span>
          <p className="text-xs text-dark-400 -mt-0.5">Nền tảng đầu tư thông minh</p>
        </div>
      </div>

      <Card className="p-6">
        <h1 className="text-xl font-bold text-white mb-1">Đăng nhập</h1>
        <p className="text-sm text-dark-400 mb-6">
          Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-dark-400 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-dark-400 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-black font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Spinner />}
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-sm text-dark-400 mt-5 text-center">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-brand hover:text-brand-light font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </Card>

      {/* Demo accounts */}
      <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 mt-4">
        <p className="text-xs text-dark-400 font-medium mb-2">Tài khoản demo:</p>
        <div className="space-y-1 text-xs text-dark-500">
          <p>
            <span className="text-dark-400">Quản trị:</span>{' '}
            <span className="text-brand">admin@hhd-i.vn</span> / Admin@123
          </p>
          <p>
            <span className="text-dark-400">Người dùng:</span>{' '}
            <span className="text-brand">haidh1975@gmail.com</span> / User@123
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
