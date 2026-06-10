/**
 * Seed dữ liệu mẫu cho HHD-I.
 * Chạy: npm run db:seed (trong apps/web)
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO' as const },
  { symbol: 'ETH', name: 'Ethereum', type: 'CRYPTO' as const },
  { symbol: 'BNB', name: 'BNB', type: 'CRYPTO' as const },
  { symbol: 'SOL', name: 'Solana', type: 'CRYPTO' as const },
  { symbol: 'XRP', name: 'XRP', type: 'CRYPTO' as const },
  { symbol: 'VNM', name: 'Vinamilk', type: 'STOCK' as const },
  { symbol: 'FPT', name: 'FPT Corporation', type: 'STOCK' as const },
  { symbol: 'VIC', name: 'Vingroup', type: 'STOCK' as const },
  { symbol: 'HPG', name: 'Hòa Phát Group', type: 'STOCK' as const },
];

async function main() {
  console.log('Bắt đầu seed dữ liệu...');

  // 1. Assets
  const assetMap: Record<string, string> = {};
  for (const a of ASSETS) {
    const asset = await prisma.asset.upsert({
      where: { symbol: a.symbol },
      update: { name: a.name, type: a.type },
      create: a,
    });
    assetMap[a.symbol] = asset.id;
  }
  console.log(`✓ ${ASSETS.length} tài sản`);

  // 2. Admin
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hhd-i.vn' },
    update: { passwordHash: adminHash, role: 'ADMIN' },
    create: {
      email: 'admin@hhd-i.vn',
      passwordHash: adminHash,
      name: 'Quản trị viên HHD-I',
      role: 'ADMIN',
    },
  });
  console.log(`✓ Admin: ${admin.email} / Admin@123`);

  // 3. Demo users
  const userHash = await bcrypt.hash('User@123', 10);
  const demoUsers = [
    { email: 'haidh1975@gmail.com', name: 'Hải Đặng' },
    { email: 'lan.nguyen@example.com', name: 'Nguyễn Thị Lan' },
    { email: 'minh.tran@example.com', name: 'Trần Văn Minh' },
  ];

  const users = [];
  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash: userHash, role: 'USER' },
    });
    users.push(user);
  }
  console.log(`✓ ${users.length} người dùng demo (mật khẩu: User@123)`);

  // 4. Holdings + Transactions + Alerts cho từng user
  const sampleHoldings: Record<string, { symbol: string; amount: number; avgBuyPrice: number }[]> = {
    [users[0].id]: [
      { symbol: 'BTC', amount: 0.85, avgBuyPrice: 52000 },
      { symbol: 'ETH', amount: 6.2, avgBuyPrice: 2800 },
      { symbol: 'SOL', amount: 40, avgBuyPrice: 120 },
      { symbol: 'FPT', amount: 500, avgBuyPrice: 4.8 },
    ],
    [users[1].id]: [
      { symbol: 'BTC', amount: 0.12, avgBuyPrice: 61000 },
      { symbol: 'BNB', amount: 8, avgBuyPrice: 480 },
      { symbol: 'VNM', amount: 1000, avgBuyPrice: 2.7 },
    ],
    [users[2].id]: [
      { symbol: 'ETH', amount: 2.4, avgBuyPrice: 3100 },
      { symbol: 'XRP', amount: 5000, avgBuyPrice: 0.48 },
      { symbol: 'HPG', amount: 2000, avgBuyPrice: 1.1 },
      { symbol: 'VIC', amount: 300, avgBuyPrice: 1.75 },
    ],
  };

  // Xóa dữ liệu giao dịch cũ để seed idempotent
  await prisma.transaction.deleteMany({});
  await prisma.holding.deleteMany({});
  await prisma.alert.deleteMany({});
  await prisma.dCASchedule.deleteMany({});

  let txCount = 0;
  for (const user of users) {
    const holdings = sampleHoldings[user.id] ?? [];
    for (const h of holdings) {
      await prisma.holding.create({
        data: {
          userId: user.id,
          assetId: assetMap[h.symbol],
          amount: h.amount,
          avgBuyPrice: h.avgBuyPrice,
        },
      });

      // Tạo 2 giao dịch mua lịch sử cho mỗi holding
      const half = h.amount / 2;
      for (let i = 0; i < 2; i++) {
        const price = h.avgBuyPrice * (i === 0 ? 0.95 : 1.05);
        await prisma.transaction.create({
          data: {
            userId: user.id,
            assetId: assetMap[h.symbol],
            type: 'BUY',
            amount: half,
            price,
            totalValue: half * price,
            status: 'COMPLETED',
            createdAt: new Date(Date.now() - (30 - i * 12) * 24 * 60 * 60 * 1000),
          },
        });
        txCount++;
      }
    }

    // Nạp tiền ban đầu
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'DEPOSIT',
        amount: 50000,
        price: 1,
        totalValue: 50000,
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
    });
    txCount++;

    // Alerts
    await prisma.alert.createMany({
      data: [
        {
          userId: user.id,
          type: 'RISK',
          message: 'Danh mục của bạn đang tập trung cao vào một tài sản. Cân nhắc đa dạng hóa.',
          severity: 'warning',
        },
        {
          userId: user.id,
          type: 'MARKET',
          message: 'BTC biến động mạnh trong 24h qua (+2.3%).',
          severity: 'info',
        },
      ],
    });

    // DCA mẫu
    await prisma.dCASchedule.create({
      data: {
        userId: user.id,
        assetId: assetMap['BTC'],
        amountUsd: 200,
        frequency: 'WEEKLY',
        nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        active: true,
      },
    });
  }

  console.log(`✓ Holdings, ${txCount} giao dịch, alerts, DCA schedules`);
  console.log('Seed hoàn tất!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
