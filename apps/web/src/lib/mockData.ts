import type { Portfolio, RiskScore, SentimentData, Coin, DCASchedule, MarketOverview } from '@hhd-i/types';

export const mockMarketData: Coin[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67420.50,
    change24h: 2.34,
    marketCap: 1327000000000,
    volume: 28500000000,
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3542.80,
    change24h: 1.87,
    marketCap: 425000000000,
    volume: 14200000000,
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    price: 598.40,
    change24h: -0.52,
    marketCap: 89000000000,
    volume: 1850000000,
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 172.30,
    change24h: 4.21,
    marketCap: 80500000000,
    volume: 3200000000,
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    price: 0.5842,
    change24h: -1.23,
    marketCap: 32000000000,
    volume: 1450000000,
  },
];

export const mockPortfolio: Portfolio = {
  totalValue: 198542.30,
  pnl: 23418.50,
  pnlPercent: 13.37,
  coins: [
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 67420.50,
      change24h: 2.34,
      marketCap: 1327000000000,
      volume: 28500000000,
      amount: 2.5,
      avgBuyPrice: 52000,
      allocation: 84.9,
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      price: 3542.80,
      change24h: 1.87,
      marketCap: 425000000000,
      volume: 14200000000,
      amount: 10,
      avgBuyPrice: 2800,
      allocation: 17.8,
    },
    {
      id: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      price: 172.30,
      change24h: 4.21,
      marketCap: 80500000000,
      volume: 3200000000,
      amount: 50,
      avgBuyPrice: 120,
      allocation: 4.3,
    },
    {
      id: 'binancecoin',
      symbol: 'BNB',
      name: 'BNB',
      price: 598.40,
      change24h: -0.52,
      marketCap: 89000000000,
      volume: 1850000000,
      amount: 5,
      avgBuyPrice: 480,
      allocation: 1.5,
    },
  ],
};

export const mockRiskScore: RiskScore = {
  score: 42,
  level: 'medium',
  breakdown: {
    concentration: 65,
    volatility: 48,
    marketRisk: 35,
    liquidityRisk: 20,
  },
  recommendations: [
    'Danh mục của bạn đang tập trung quá nhiều vào BTC (84.9%). Hãy cân nhắc đa dạng hóa sang các tài sản khác.',
    'Biến động 30 ngày của danh mục ở mức trung bình. Xem xét thêm stablecoin để giảm rủi ro.',
    'Thanh khoản danh mục tốt. Tất cả các coin đều có volume giao dịch cao.',
  ],
  analyzedAt: new Date().toISOString(),
};

export const mockSentimentData: SentimentData[] = [
  {
    coin: 'Bitcoin',
    symbol: 'BTC',
    fearGreedIndex: 72,
    label: 'Tham lam',
    signals: [
      {
        type: 'bullish',
        source: 'On-chain Analysis',
        summary: 'Whale accumulation tăng 15% trong 7 ngày qua',
        confidence: 78,
      },
      {
        type: 'bullish',
        source: 'Technical Analysis',
        summary: 'RSI ở 65, MACD cho tín hiệu mua trên khung H4',
        confidence: 72,
      },
      {
        type: 'neutral',
        source: 'News Sentiment',
        summary: 'Tin tức ETF Bitcoin tích cực, nhưng lo ngại lãi suất Fed',
        confidence: 60,
      },
    ],
    newsSummary: 'Bitcoin duy trì đà tăng với sự ủng hộ từ các tổ chức lớn. ETF spot Bitcoin tiếp tục ghi nhận dòng tiền vào ổn định.',
    updatedAt: new Date().toISOString(),
  },
  {
    coin: 'Ethereum',
    symbol: 'ETH',
    fearGreedIndex: 58,
    label: 'Tham lam',
    signals: [
      {
        type: 'bullish',
        source: 'DeFi Activity',
        summary: 'TVL DeFi trên Ethereum tăng 8% tuần qua',
        confidence: 70,
      },
      {
        type: 'bearish',
        source: 'Fee Analysis',
        summary: 'Gas fee thấp cho thấy hoạt động mạng giảm',
        confidence: 55,
      },
    ],
    newsSummary: 'Ethereum tiếp tục phát triển hệ sinh thái Layer 2. EIP mới đang được cộng đồng xem xét.',
    updatedAt: new Date().toISOString(),
  },
  {
    coin: 'Solana',
    symbol: 'SOL',
    fearGreedIndex: 81,
    label: 'Tham lam cực độ',
    signals: [
      {
        type: 'bullish',
        source: 'NFT Volume',
        summary: 'Volume NFT trên Solana đạt mức cao kỷ lục tháng này',
        confidence: 82,
      },
      {
        type: 'bullish',
        source: 'Developer Activity',
        summary: 'Số lượng dApp mới trên Solana tăng 22% quý này',
        confidence: 75,
      },
    ],
    newsSummary: 'Solana tiếp tục thu hút developers với hiệu suất cao và phí thấp. Meme coin ecosystem bùng nổ.',
    updatedAt: new Date().toISOString(),
  },
  {
    coin: 'BNB',
    symbol: 'BNB',
    fearGreedIndex: 45,
    label: 'Trung lập',
    signals: [
      {
        type: 'neutral',
        source: 'Exchange Data',
        summary: 'Volume giao dịch BNB Chain ổn định trong 2 tuần',
        confidence: 65,
      },
      {
        type: 'bearish',
        source: 'Regulatory News',
        summary: 'Một số lo ngại về quy định tại thị trường mới nổi',
        confidence: 50,
      },
    ],
    newsSummary: 'BNB Chain duy trì vị thế ổn định trong thị trường. Binance tiếp tục mở rộng dịch vụ toàn cầu.',
    updatedAt: new Date().toISOString(),
  },
];

export const mockDCASchedules: DCASchedule[] = [
  {
    id: '1',
    coin: 'Bitcoin',
    symbol: 'BTC',
    amount: 500,
    frequency: 'weekly',
    nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    totalInvested: 6500,
    createdAt: new Date(Date.now() - 13 * 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    coin: 'Ethereum',
    symbol: 'ETH',
    amount: 200,
    frequency: 'monthly',
    nextRun: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    totalInvested: 1200,
    createdAt: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockMarketOverview: MarketOverview = {
  totalMarketCap: 2420000000000,
  totalVolume24h: 98500000000,
  btcDominance: 54.8,
  fearGreedIndex: 68,
  fearGreedLabel: 'Tham lam',
};
