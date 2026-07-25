import { prisma } from '@/lib/db';
import { UsersTable } from '@/components/admin/UsersTable';
import type { AppUser } from '@hhd-i/types';
import { Card } from '@/shared/components/ui/Card';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
  });

  const rows: AppUser[] = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-4 border-b border-dark-600">
        <h2 className="text-base font-semibold text-white">
          Người dùng ({rows.length})
        </h2>
      </div>
      <UsersTable users={rows} />
    </Card>
  );
}
