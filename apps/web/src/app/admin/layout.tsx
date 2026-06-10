import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { auth } from '@/lib/auth';
import { AdminNav } from '@/components/admin/AdminNav';

export const metadata = {
  title: 'Quản trị | HHD-I',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Kiểm tra quyền phía server (ngoài middleware)
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-brand" /> Quản trị hệ thống
          </h1>
          <p className="text-dark-400 mt-1 text-sm">
            Quản lý người dùng, giao dịch và tài sản của nền tảng HHD-I
          </p>
        </div>
      </div>

      <AdminNav />

      {children}
    </div>
  );
}
