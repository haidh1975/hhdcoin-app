'use client';

import { useState } from 'react';
import { Newspaper, TrendingUp, TrendingDown, RefreshCw, ExternalLink, Clock, Zap, Tag } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';

const NEWS_DATA = [
  {
    id: 1,
    title: 'Bitcoin vượt ngưỡng $100,000 — Kỷ lục mới trong lịch sử',
    summary: 'Bitcoin đã chính thức xác lập kỷ lục mới khi vượt qua mốc $100,000. Đây là cột mốc mang tính lịch sử, phản ánh sự chấp nhận rộng rãi của tài sản số từ tổ chức lớn và quỹ ETF.',
    sentiment: 'bullish',
    sentimentLabel: 'Tích cực',
    category: 'Bitcoin',
    time: '2 giờ trước',
    source: 'CoinDesk',
    impact: 'high',
  },
  {
    id: 2,
    title: 'Ethereum nâng cấp Pectra: Phí giao dịch giảm 80%',
    summary: 'Bản nâng cấp Pectra của Ethereum mang lại cải tiến đột phá về phí gas và tốc độ giao dịch. Người dùng DeFi và NFT hưởng lợi trực tiếp từ việc phí giảm mạnh.',
    sentiment: 'bullish',
    sentimentLabel: 'Tích cực',
    category: 'Ethereum',
    time: '4 giờ trước',
    source: 'The Block',
    impact: 'high',
  },
  {
    id: 3,
    title: 'SEC Mỹ phê duyệt thêm 3 ETF Spot Altcoin',
    summary: 'Ủy ban Chứng khoán Mỹ chính thức chấp thuận ETF Spot cho SOL, XRP và BNB. Đây là tín hiệu mạnh về sự hợp pháp hóa crypto tại thị trường lớn nhất thế giới.',
    sentiment: 'bullish',
    sentimentLabel: 'Tích cực',
    category: 'Quy định',
    time: '6 giờ trước',
    source: 'Reuters',
    impact: 'high',
  },
  {
    id: 4,
    title: 'Cảnh báo: Whale bán tháo $500M BTC trong 24 giờ',
    summary: 'Dữ liệu on-chain ghi nhận một ví cá voi lớn chuyển 5.000 BTC ra sàn giao dịch. Động thái này tạo áp lực bán và có thể gây biến động ngắn hạn.',
    sentiment: 'bearish',
    sentimentLabel: 'Tiêu cực',
    category: 'On-chain',
    time: '8 giờ trước',
    source: 'Glassnode',
    impact: 'medium',
  },
  {
    id: 5,
    title: 'Solana TVL đạt $10 tỷ — Hệ sinh thái DeFi bùng nổ',
    summary: 'Tổng giá trị khóa (TVL) trên Solana lần đầu vượt $10 tỷ, đánh dấu sự trưởng thành của hệ sinh thái. Các protocol Jupiter, Raydium và Marinade dẫn đầu tăng trưởng.',
    sentiment: 'bullish',
    sentimentLabel: 'Tích cực',
    category: 'DeFi',
    time: '10 giờ trước',
    source: 'DeFiLlama',
    impact: 'medium',
  },
  {
    id: 6,
    title: 'Trung Quốc thí điểm thanh toán e-CNY bằng blockchain',
    summary: 'Ngân hàng Nhân dân Trung Quốc mở rộng thử nghiệm đồng nhân dân tệ kỹ thuật số tại 15 thành phố. Động thái này thúc đẩy xu hướng CBDC toàn cầu.',
    sentiment: 'neutral',
    sentimentLabel: 'Trung tính',
    category: 'CBDC',
    time: '14 giờ trước',
    source: 'SCMP',
    impact: 'low',
  },
];

const CATEGORIES = ['Tất cả', 'Bitcoin', 'Ethereum', 'DeFi', 'Quy định', 'On-chain', 'CBDC'];

const SENTIMENT_STYLE: Record<string, { bg: string; text: string; icon: typeof TrendingUp }> = {
  bullish: { bg: 'bg-green-500/20', text: 'text-green-400', icon: TrendingUp },
  bearish: { bg: 'bg-red-500/20', text: 'text-red-400', icon: TrendingDown },
  neutral: { bg: 'bg-dark-600', text: 'text-dark-300', icon: Newspaper },
};

const IMPACT_BADGE: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-brand/20 text-brand',
  low: 'bg-dark-600 text-dark-400',
};

const IMPACT_LABEL: Record<string, string> = {
  high: 'Tác động cao',
  medium: 'Tác động TB',
  low: 'Tác động thấp',
};

export default function TinTucPage() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [loading, setLoading] = useState(false);

  const filtered = activeCategory === 'Tất cả'
    ? NEWS_DATA
    : NEWS_DATA.filter((n) => n.category === activeCategory);

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tin Tức Thị Trường</h1>
          <p className="text-dark-400 mt-1">Tổng hợp & phân tích AI từ các nguồn uy tín</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-dark-700 border border-dark-600 text-dark-300 hover:text-white hover:border-brand/50 px-4 py-2 rounded-lg text-sm transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand' : ''}`} />
          Cập nhật
        </button>
      </div>

      {/* AI Summary Banner */}
      <div className="bg-gradient-to-r from-brand/10 to-transparent border border-brand/20 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Zap className="w-4 h-4 text-brand" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Tóm tắt AI hôm nay</p>
          <p className="text-sm text-dark-300 mt-0.5 leading-relaxed">
            Thị trường crypto đang trong xu hướng tăng mạnh với Bitcoin phá kỷ lục $100K. ETF altcoin được SEC chấp thuận tạo dòng tiền tổ chức. Điểm cần chú ý: cá voi đang bán tháo BTC — theo dõi sát biến động ngắn hạn.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Tag className="w-4 h-4 text-dark-500" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all ${
              activeCategory === cat
                ? 'bg-brand text-black'
                : 'bg-dark-700 text-dark-400 hover:text-white border border-dark-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News List */}
      <div className="space-y-3">
        {filtered.map((news) => {
          const sentStyle = SENTIMENT_STYLE[news.sentiment];
          const SentIcon = sentStyle.icon;
          return (
            <Card
              key={news.id}
              className="p-5 hover:border-dark-500 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Meta badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${sentStyle.bg} ${sentStyle.text}`}>
                      <SentIcon className="w-3 h-3" />
                      {news.sentimentLabel}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${IMPACT_BADGE[news.impact]}`}>
                      {IMPACT_LABEL[news.impact]}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-dark-400 border border-dark-600">
                      {news.category}
                    </span>
                  </div>
                  {/* Title */}
                  <h3 className="text-white font-semibold leading-snug group-hover:text-brand transition-colors">
                    {news.title}
                  </h3>
                  {/* Summary */}
                  <p className="text-dark-300 text-sm leading-relaxed">{news.summary}</p>
                  {/* Footer */}
                  <div className="flex items-center gap-3 text-xs text-dark-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{news.time}</span>
                    <span>Nguồn: {news.source}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-dark-600 group-hover:text-brand flex-shrink-0 mt-1 transition-colors" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
