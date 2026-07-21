/**
 * Chạy 1 lần sau khi deploy để tạo tài khoản admin đầu tiên.
 * Usage: npx tsx scripts/setup-admin.ts
 */
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcryptjs';
import * as schema from '../shared/schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL chưa được đặt');
  process.exit(1);
}

// node-postgres: nội bộ Railway/localhost không cần SSL; host công khai bật SSL.
const needsSsl = !/railway\.internal|localhost|127\.0\.0\.1/.test(DATABASE_URL);
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
});
const db = drizzle(pool, { schema });

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@HHD2025!';
  const adminEmail    = process.env.ADMIN_EMAIL    ?? 'admin@hhdcoin.com';
  const adminName     = process.env.ADMIN_NAME     ?? 'Quản trị viên';

  // Kiểm tra đã tồn tại chưa
  const existing = await db.select()
    .from(schema.authUsers)
    .limit(1);

  if (existing.length > 0) {
    console.log('ℹ️  Đã có dữ liệu trong auth_users. Bỏ qua setup.');
    process.exit(0);
  }

  const hashed = await bcrypt.hash(adminPassword, 12);

  await db.insert(schema.authUsers).values({
    username: adminUsername,
    password: hashed,
    role: 'admin',
    fullName: adminName,
    email: adminEmail,
    status: 'active',
  });

  console.log('✅ Tạo admin thành công!');
  console.log(`   Username : ${adminUsername}`);
  console.log(`   Password : ${adminPassword}`);
  console.log(`   Email    : ${adminEmail}`);
  console.log('\n⚠️  Hãy đổi mật khẩu ngay sau lần đăng nhập đầu tiên!');

  await pool.end();
}

main().catch((err) => {
  console.error('Lỗi setup:', err);
  process.exit(1);
});
