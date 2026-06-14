/**
 * Seed dữ liệu mẫu cho HHD-I.
 * Chạy: npm run db:seed (trong apps/web)
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ASSETS = [
  { symbol: 'HHD', name: 'HHD Coin', type: 'CRYPTO' as const },
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

  // 5. HHD Coin — Sale rounds, Proposals, Votes, Stakes, SalePurchases
  // Xóa dữ liệu cũ để seed idempotent
  await prisma.salePurchase.deleteMany({});
  await prisma.saleRound.deleteMany({});
  await prisma.vote.deleteMany({});
  await prisma.proposal.deleteMany({});
  await prisma.stake.deleteMany({});

  const day = 24 * 60 * 60 * 1000;

  // 5a. Sale rounds
  const saleRounds = [
    {
      name: 'Seed Round',
      priceUsd: 0.005,
      allocation: 50_000_000,
      hardCapUsd: 250_000,
      raisedUsd: 250_000,
      tgeUnlockPct: 5,
      vestingNote: 'Cliff 6 tháng + tuyến tính 18 tháng, TGE 5%',
      status: 'CLOSED' as const,
      order: 1,
    },
    {
      name: 'Private Sale A',
      priceUsd: 0.008,
      allocation: 40_000_000,
      hardCapUsd: 320_000,
      raisedUsd: 320_000,
      tgeUnlockPct: 10,
      vestingNote: 'Cliff 3 tháng + tuyến tính 9 tháng, TGE 10%',
      status: 'CLOSED' as const,
      order: 2,
    },
    {
      name: 'Private Sale B',
      priceUsd: 0.01,
      allocation: 40_000_000,
      hardCapUsd: 400_000,
      raisedUsd: 180_000,
      tgeUnlockPct: 10,
      vestingNote: 'Cliff 3 tháng + tuyến tính 9 tháng, TGE 10%',
      status: 'ACTIVE' as const,
      order: 3,
    },
    {
      name: 'Public Sale (IEO)',
      priceUsd: 0.02,
      allocation: 100_000_000,
      hardCapUsd: 2_000_000,
      raisedUsd: 0,
      tgeUnlockPct: 20,
      vestingNote: 'Tuyến tính 6 tháng, TGE 20%',
      status: 'UPCOMING' as const,
      order: 4,
    },
  ];

  const roundMap: Record<string, string> = {};
  for (const r of saleRounds) {
    const round = await prisma.saleRound.create({ data: r });
    roundMap[r.name] = round.id;
  }
  console.log(`✓ ${saleRounds.length} vòng bán token (Sale rounds)`);

  // 5b. Governance proposals
  const proposals = [
    {
      title: 'Tăng phần thưởng staking Q3 2026',
      description:
        'Đề xuất tăng APY staking thêm 5% cho các tier Gold trở lên trong Q3 2026 nhằm khuyến khích khóa dài hạn và giảm áp lực bán sau khi mainnet ra mắt.',
      status: 'ACTIVE' as const,
      votesFor: 12_500_000,
      votesAgainst: 3_200_000,
      endsAt: new Date(Date.now() + 5 * day),
    },
    {
      title: 'Phê duyệt grant nghiên cứu cho 5 dự án AI',
      description:
        'Cấp tổng cộng 2.000.000 HHD từ quỹ Cộng đồng & Hệ sinh thái cho 5 dự án nghiên cứu AI ứng dụng chỉ số HHD-index và HHDAI 2.0.',
      status: 'PASSED' as const,
      votesFor: 21_800_000,
      votesAgainst: 4_100_000,
      endsAt: new Date(Date.now() - 3 * day),
    },
    {
      title: 'Niêm yết HHD trên KuCoin',
      description:
        'Phân bổ ngân sách marketing và thanh khoản để hoàn tất quá trình niêm yết HHD trên sàn KuCoin trong Q1 2027.',
      status: 'ACTIVE' as const,
      votesFor: 9_400_000,
      votesAgainst: 1_900_000,
      endsAt: new Date(Date.now() + 8 * day),
    },
    {
      title: 'Đốt 10 triệu HHD từ treasury',
      description:
        'Đề xuất mua lại và đốt 10.000.000 HHD từ doanh thu kho bạc quý này nhằm tăng tính giảm phát của token.',
      status: 'REJECTED' as const,
      votesFor: 5_600_000,
      votesAgainst: 14_300_000,
      endsAt: new Date(Date.now() - 10 * day),
    },
  ];

  for (const p of proposals) {
    await prisma.proposal.create({
      data: { ...p, creatorId: admin.id },
    });
  }
  console.log(`✓ ${proposals.length} đề xuất quản trị (Proposals)`);

  // 5c. Stakes mẫu cho demo users
  const sampleStakes: { tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'; amount: number; apy: number; lockDays: number; autoCompound: boolean }[][] = [
    [
      { tier: 'GOLD', amount: 30_000, apy: 25, lockDays: 180, autoCompound: true },
      { tier: 'SILVER', amount: 8_000, apy: 15, lockDays: 90, autoCompound: false },
    ],
    [
      { tier: 'BRONZE', amount: 1_500, apy: 8, lockDays: 30, autoCompound: false },
    ],
    [
      { tier: 'PLATINUM', amount: 120_000, apy: 40, lockDays: 365, autoCompound: true },
    ],
  ];

  let stakeCount = 0;
  for (let i = 0; i < users.length; i++) {
    const stakes = sampleStakes[i] ?? [];
    for (const s of stakes) {
      const startAt = new Date(Date.now() - 20 * day);
      await prisma.stake.create({
        data: {
          userId: users[i].id,
          tier: s.tier,
          amount: s.amount,
          apy: s.apy,
          lockDays: s.lockDays,
          startAt,
          unlockAt: new Date(startAt.getTime() + s.lockDays * day),
          autoCompound: s.autoCompound,
          status: 'ACTIVE',
        },
      });
      stakeCount++;
    }
  }
  console.log(`✓ ${stakeCount} khoản stake mẫu`);

  // 5d. Sale purchases mẫu
  let purchaseCount = 0;
  const samplePurchases = [
    { userIdx: 0, round: 'Seed Round', amountUsd: 5_000 },
    { userIdx: 0, round: 'Private Sale B', amountUsd: 2_000 },
    { userIdx: 1, round: 'Private Sale A', amountUsd: 1_500 },
    { userIdx: 2, round: 'Private Sale B', amountUsd: 3_000 },
  ];
  const priceByRound: Record<string, number> = {
    'Seed Round': 0.005,
    'Private Sale A': 0.008,
    'Private Sale B': 0.01,
    'Public Sale (IEO)': 0.02,
  };
  for (const sp of samplePurchases) {
    await prisma.salePurchase.create({
      data: {
        userId: users[sp.userIdx].id,
        roundId: roundMap[sp.round],
        amountUsd: sp.amountUsd,
        tokens: sp.amountUsd / priceByRound[sp.round],
        createdAt: new Date(Date.now() - 15 * day),
      },
    });
    purchaseCount++;
  }
  console.log(`✓ ${purchaseCount} lượt mua token mẫu (SalePurchases)`);

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
