/**
 * Hằng số & cấu hình HHD Coin (BEP-20 trên BNB Smart Chain).
 * Số liệu lấy từ whitepaper chính thức của dự án HHD Coin.
 */
import type { StakeTier, StakeTierConfig, TokenAllocation } from '@hhd-i/types';

export const HHD = {
  name: 'HHD Coin',
  symbol: 'HHD',
  chain: 'BNB Smart Chain',
  standard: 'BEP-20',
  maxSupply: 1_000_000_000,
  postBurnSupply: 800_000_000,
  launchFdvUsd: 20_000_000,
  hardCapUsd: 25_000_000,
  presalePriceUsd: 0.01, // vòng đang mở (Private B)
  website: 'https://hhdcoin.net',
  telegram: 'https://t.me/HHDCoin',
  contact: 'haidh1975@gmail.com',
};

/** Cấu hình staking — phải khớp validation phía API. */
export const STAKE_TIERS: Record<StakeTier, StakeTierConfig> = {
  BRONZE: {
    tier: 'BRONZE',
    label: 'Bronze',
    lockDays: 30,
    apy: 8,
    minStake: 500,
    benefits: 'Giảm 5% phí nền tảng, xem DAO (chỉ đọc)',
  },
  SILVER: {
    tier: 'SILVER',
    label: 'Silver',
    lockDays: 90,
    apy: 15,
    minStake: 5_000,
    benefits: 'Giảm 10% phí + tính năng sớm, xem đề xuất',
  },
  GOLD: {
    tier: 'GOLD',
    label: 'Gold',
    lockDays: 180,
    apy: 25,
    minStake: 25_000,
    benefits: 'Giảm 15% phí + Launchpad Tier 1, bỏ phiếu & đề xuất',
  },
  PLATINUM: {
    tier: 'PLATINUM',
    label: 'Platinum',
    lockDays: 365,
    apy: 40,
    minStake: 100_000,
    benefits: 'Tất cả ưu đãi + ưu tiên Launchpad, bỏ phiếu & đề xuất',
  },
  DIAMOND: {
    tier: 'DIAMOND',
    label: 'Diamond',
    lockDays: 365,
    apy: 55,
    minStake: 500_000,
    benefits: 'Toàn bộ quyền lợi + ghế Hội đồng Cố vấn',
  },
};

export const STAKE_TIER_ORDER: StakeTier[] = [
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
];

export const STAKING_CONFIG = {
  rewardsPool: 150_000_000,
  earlyExitPenaltyPct: 10, // gửi vào burn
  epochDays: 7,
  maxConcurrentStakes: 10,
};

/** Phân bổ token — 11 hạng mục (tổng 100%, 1 tỷ HHD). */
export const TOKEN_ALLOCATION: TokenAllocation[] = [
  {
    category: 'Cộng đồng & Hệ sinh thái',
    pct: 30,
    amount: 300_000_000,
    tgeUnlock: '5% TGE',
    vesting: 'Tuyến tính 48 tháng',
    purpose: 'Phần thưởng, grant, khuyến khích dApp',
    color: '#F0B90B',
  },
  {
    category: 'Phần thưởng Staking',
    pct: 15,
    amount: 150_000_000,
    tgeUnlock: '0%',
    vesting: 'Phát hành theo epoch',
    purpose: 'Liquidity mining, APY staking',
    color: '#3B82F6',
  },
  {
    category: 'Kho bạc (Treasury)',
    pct: 15,
    amount: 150_000_000,
    tgeUnlock: '0%',
    vesting: 'Khóa 6 tháng, tuyến tính 4 năm',
    purpose: 'Vận hành, grant, dự phòng',
    color: '#10B981',
  },
  {
    category: 'Đội ngũ & Sáng lập',
    pct: 12,
    amount: 120_000_000,
    tgeUnlock: '0%',
    vesting: 'Cliff 12 tháng, tuyến tính 36 tháng',
    purpose: 'Đội ngũ phát triển cốt lõi',
    color: '#8B5CF6',
  },
  {
    category: 'Public Sale (IEO)',
    pct: 10,
    amount: 100_000_000,
    tgeUnlock: '20%',
    vesting: 'Tuyến tính 6 tháng',
    purpose: 'Gọi vốn công khai',
    color: '#F59E0B',
  },
  {
    category: 'Private Sale',
    pct: 8,
    amount: 80_000_000,
    tgeUnlock: '10%',
    vesting: 'Cliff 3 tháng, tuyến tính 9 tháng',
    purpose: 'Nhà đầu tư chiến lược',
    color: '#EC4899',
  },
  {
    category: 'Seed Round',
    pct: 5,
    amount: 50_000_000,
    tgeUnlock: '5%',
    vesting: 'Cliff 6 tháng, tuyến tính 18 tháng',
    purpose: 'Nhà đầu tư đầu tiên',
    color: '#14B8A6',
  },
  {
    category: 'Marketing & Tăng trưởng',
    pct: 5,
    amount: 50_000_000,
    tgeUnlock: '10%',
    vesting: 'Tuyến tính 24 tháng',
    purpose: 'Marketing sàn, PR',
    color: '#EF4444',
  },
  {
    category: 'Cố vấn (Advisors)',
    pct: 3,
    amount: 30_000_000,
    tgeUnlock: '0%',
    vesting: 'Cliff 6 tháng, tuyến tính 24 tháng',
    purpose: 'Cố vấn chiến lược',
    color: '#6366F1',
  },
  {
    category: 'Cung cấp Thanh khoản',
    pct: 4,
    amount: 40_000_000,
    tgeUnlock: '100%',
    vesting: 'Khóa trong LP 12 tháng',
    purpose: 'Thanh khoản ban đầu DEX/CEX',
    color: '#22C55E',
  },
  {
    category: 'Airdrop & Bounty',
    pct: 3,
    amount: 30_000_000,
    tgeUnlock: '20%',
    vesting: 'Tuyến tính 12 tháng',
    purpose: 'Xây dựng cộng đồng',
    color: '#A855F7',
  },
];

/** 10 vector tiện ích của token. */
export const TOKEN_UTILITY = [
  { icon: 'CreditCard', title: 'Thanh toán nền tảng', desc: 'Thanh toán dịch vụ trong hệ sinh thái HHD' },
  { icon: 'Coins', title: 'Phần thưởng Staking', desc: 'APY 8–55% theo tier khóa' },
  { icon: 'Vote', title: 'Bỏ phiếu quản trị', desc: '1 HHD = 1 phiếu trong DAO' },
  { icon: 'FlaskConical', title: 'Grant nghiên cứu', desc: 'Tài trợ dự án nghiên cứu AI/khoa học' },
  { icon: 'Award', title: 'NFT chứng chỉ', desc: 'Đúc NFT chứng chỉ học thuật' },
  { icon: 'Droplets', title: 'Thanh khoản DEX', desc: 'Cung cấp thanh khoản trên PancakeSwap' },
  { icon: 'Users', title: 'Thành viên DAO', desc: 'Quyền thành viên cộng đồng quản trị' },
  { icon: 'Bot', title: 'Truy cập AI', desc: 'Sử dụng dịch vụ HHDAI 2.0' },
  { icon: 'Rocket', title: 'Tham gia Launchpad', desc: 'Suất ưu tiên trong IDO' },
  { icon: 'Gift', title: 'Thưởng giới thiệu', desc: 'Phần thưởng referral cộng đồng' },
];

/** Bộ hợp đồng thông minh. */
export const SMART_CONTRACTS = [
  { name: 'HHDToken', standard: 'BEP-20', purpose: 'Lõi token: anti-whale (max tx 0.5%, max ví 1%), burn, pause, blacklist', audit: 'CertiK' },
  { name: 'HHDStaking', standard: 'BEP-20', purpose: 'Staking 5 tier, epoch 7 ngày, auto-compound', audit: 'CertiK' },
  { name: 'HHDGovernance', standard: 'OZ Governor', purpose: 'Quản trị DAO + Timelock 48h', audit: 'PeckShield' },
  { name: 'HHDVesting', standard: 'BEP-20', purpose: 'Vesting & cliff cho các vòng phân bổ', audit: 'CertiK' },
  { name: 'HHDCredential', standard: 'ERC-721', purpose: 'NFT chứng chỉ học thuật', audit: 'PeckShield' },
  { name: 'HHDBridge', standard: 'LayerZero', purpose: 'Cầu nối BSC ↔ ETH ↔ Solana', audit: 'CertiK' },
  { name: 'HHDLaunchpad', standard: 'BEP-20', purpose: 'Nền tảng IDO', audit: 'PeckShield' },
  { name: 'HHDTreasury', standard: 'Gnosis 5/9', purpose: 'Kho bạc đa chữ ký', audit: 'CertiK' },
  { name: 'HHDRewardsDAO', standard: 'BEP-20', purpose: 'Grant nghiên cứu khoa học', audit: 'PeckShield' },
];

/** Lộ trình 2026–2030. */
export const ROADMAP: { year: string; items: { quarter: string; title: string; targets: string }[] }[] = [
  {
    year: '2026',
    items: [
      { quarter: 'Q1 2026', title: 'Phát triển smart contract + kiểm toán CertiK, ra mắt whitepaper/website/social', targets: 'Hoàn thiện nền móng' },
      { quarter: 'Q2 2026', title: 'Testnet + HHDAI 2.0 beta, đóng vòng Private sale', targets: '10K cộng đồng' },
      { quarter: 'Q3 2026', title: 'Mainnet (BSC) + Staking v1, niêm yết PancakeSwap + MEXC', targets: '50K cộng đồng' },
      { quarter: 'Q4 2026', title: 'HHD dApp v1.0 + Credential NFT beta, niêm yết Gate.io/BitMart', targets: '100K cộng đồng' },
    ],
  },
  {
    year: '2027',
    items: [
      { quarter: 'Q1 2027', title: 'Research DAO v1.0, chuẩn bị KuCoin', targets: '250K cộng đồng' },
      { quarter: 'Q2 2027', title: 'HHD Launchpad beta + cross-chain bridge', targets: '500K cộng đồng' },
      { quarter: 'Q3 2027', title: 'NFT Marketplace cho chứng chỉ, niêm yết KuCoin', targets: 'Mở rộng tiện ích' },
      { quarter: 'Q4 2027', title: 'DAO v2.0, niêm yết Bybit', targets: 'Vốn hóa $30M+' },
    ],
  },
  {
    year: '2028',
    items: [
      { quarter: 'H1 2028', title: 'Niêm yết OKX', targets: 'Mở rộng Tier-2' },
      { quarter: 'Q3 2028', title: 'Niêm yết BINANCE (mục tiêu Tier-1)', targets: 'Vốn hóa $100M+' },
      { quarter: 'Q4 2028', title: 'Niêm yết Coinbase', targets: 'Phủ sóng toàn cầu' },
    ],
  },
  {
    year: '2029–2030',
    items: [
      { quarter: '2029–2030', title: '20M+ ví, 50+ trường đại học đối tác (Vision 2030)', targets: 'Vốn hóa $1B+' },
    ],
  },
];
