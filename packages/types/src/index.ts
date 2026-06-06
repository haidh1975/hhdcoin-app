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
