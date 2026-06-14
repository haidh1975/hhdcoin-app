export interface Coin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume: number;
  image?: string;
}

export interface PortfolioCoin extends Coin {
  amount: number;
  avgBuyPrice: number;
  allocation: number; // percentage 0-100
}

export interface Portfolio {
  totalValue: number;
  coins: PortfolioCoin[];
  pnl: number;
  pnlPercent: number;
}

export interface RiskBreakdown {
  concentration: number; // 0-100
  volatility: number; // 0-100
  marketRisk: number; // 0-100
  liquidityRisk: number; // 0-100
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';

export interface RiskScore {
  score: number; // 0-100
  level: RiskLevel;
  breakdown: RiskBreakdown;
  recommendations?: string[];
  analyzedAt?: string;
}

export type SignalType = 'bullish' | 'bearish' | 'neutral';

export interface Signal {
  type: SignalType;
  source: string;
  summary: string;
  confidence: number; // 0-100
}

export type SentimentLabel =
  | 'Tham lam cực độ'
  | 'Tham lam'
  | 'Trung lập'
  | 'Sợ hãi'
  | 'Sợ hãi cực độ';

export interface SentimentData {
  coin: string;
  symbol: string;
  fearGreedIndex: number; // 0-100
  label: SentimentLabel;
  signals: Signal[];
  newsSummary?: string;
  updatedAt?: string;
}

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export type DCAFrequency = 'daily' | 'weekly' | 'monthly';

export interface DCASchedule {
  id: string;
  coin: string;
  symbol: string;
  amount: number; // USD
  frequency: DCAFrequency;
  nextRun: string; // ISO date string
  isActive: boolean;
  totalInvested?: number;
  createdAt?: string;
}

export interface MarketOverview {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  fearGreedIndex: number;
  fearGreedLabel: SentimentLabel;
}

// ---------------------------------------------------------------------------
// Các type mới cho nền tảng production (DB + auth + market data + admin)
// ---------------------------------------------------------------------------

export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string; // ISO
}

export type AssetType = 'CRYPTO' | 'STOCK';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  enabled: boolean;
}

export interface Holding {
  id: string;
  userId: string;
  assetId: string;
  amount: number;
  avgBuyPrice: number;
}

export type TransactionType = 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAW';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface TransactionRecord {
  id: string;
  userId: string;
  assetId?: string | null;
  assetSymbol?: string | null;
  assetName?: string | null;
  type: TransactionType;
  amount: number;
  price: number;
  totalValue: number;
  status: TransactionStatus;
  createdAt: string; // ISO
}

export type PriceSource = 'live' | 'mock';

export interface MarketPrice {
  symbol: string;
  name: string;
  type: AssetType;
  price: number; // USD
  priceVnd?: number; // chỉ với cổ phiếu VN
  change24h: number; // %
  volume24h: number;
  source: PriceSource;
  updatedAt: string; // ISO
}

export interface PortfolioHolding {
  assetId: string;
  symbol: string;
  name: string;
  type: AssetType;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  allocation: number; // % 0-100
  change24h: number;
  priceSource: PriceSource;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  pnl: number;
  pnlPercent: number;
  holdings: PortfolioHolding[];
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalVolume: number;
  aiRequests: number; // placeholder — chưa có tracking thật
}

export interface AlertItem {
  id: string;
  userId: string;
  type: string;
  message: string;
  severity: string;
  read: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// HHD Coin — DeFi / Web3 (staking, governance, token sale, tokenomics)
// ---------------------------------------------------------------------------

export type StakeTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
export type StakeStatus = 'ACTIVE' | 'UNSTAKED';
export type ProposalStatus = 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED';
export type SaleRoundStatus = 'UPCOMING' | 'ACTIVE' | 'CLOSED';

export interface StakeInfo {
  id: string;
  userId: string;
  tier: StakeTier;
  amount: number;
  apy: number;
  lockDays: number;
  startAt: string; // ISO
  unlockAt: string; // ISO
  autoCompound: boolean;
  status: StakeStatus;
  rewardClaimed: number;
}

export interface StakeTierConfig {
  tier: StakeTier;
  label: string;
  lockDays: number;
  apy: number; // %
  minStake: number; // HHD
  benefits: string;
}

export interface ProposalInfo {
  id: string;
  title: string;
  description: string;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  createdAt: string; // ISO
  endsAt: string; // ISO
  creatorId: string;
  userVoted: boolean;
  userSupport?: boolean | null;
}

export interface SaleRoundInfo {
  id: string;
  name: string;
  priceUsd: number;
  allocation: number; // HHD
  hardCapUsd: number;
  raisedUsd: number;
  tgeUnlockPct: number;
  vestingNote: string;
  status: SaleRoundStatus;
  order: number;
}

export interface SalePurchaseInfo {
  id: string;
  userId: string;
  roundId: string;
  roundName?: string;
  amountUsd: number;
  tokens: number;
  createdAt: string; // ISO
}

export interface TokenAllocation {
  category: string;
  pct: number; // %
  amount: number; // HHD
  tgeUnlock: string;
  vesting: string;
  purpose: string;
  color: string;
}
