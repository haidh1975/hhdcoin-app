'use client';

import { BarChart2, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SentimentData, SignalType } from '@hhd-i/types';
import { mockSentimentData, mockMarketOverview } from '@/lib/mockData';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { useResource } from '@/shared/hooks/useResource';
import { getFearGreedColor, getFearGreedBgClass } from '@/shared/utils/colors';
import { formatTime } from '@/shared/utils/format';

function SignalBadge({ type }: { type: SignalType }) {
  if (type === 'bullish') {
    return (
      <Badge tone="success" intensity="medium">
        <TrendingUp className="w-3 h-3" /> Tăng
      </Badge>
    );
  }
  if (type === 'bearish') {
    return (
      <Badge tone="danger" intensity="medium">
        <TrendingDown className="w-3 h-3" /> Giảm
      </Badge>
    );
  }
  return (
    <Badge tone="neutral" intensity="medium">
      <Minus className="w-3 h-3" /> Trung lập
    </Badge>
  );
}

export default function SentimentPage() {
  const overview = mockMarketOverview;

  const {
    data: sentimentData,
    refreshing: isUpdating,
    refresh: handleUpdate,
  } = useResource<SentimentData[]>(
    async (previous) => {
      const res = await fetch('/api/ai/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: ['BTC', 'ETH', 'SOL', 'BNB'] }),
      });
      if (!res.ok) return previous;
      const data = await res.json();
      return Array.isArray(data) ? (data as SentimentData[]) : previous;
    },
    { initialData: mockSentimentData, immediate: false }
  );

  const trendingBullish = sentimentData
    .flatMap((s) => s.signals.filter((sig) => sig.type === 'bullish').map((sig) => ({ ...sig, coin: s.symbol })))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-5 h-5 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Phân tích Tâm lý thị trường</h1>
            <p className="text-sm text-dark-400">Chỉ số Fear &amp; Greed và phân tích sentiment theo coin</p>
          </div>
        </div>
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
          {isUpdating ? 'Đang cập nhật...' : 'Cập nhật phân tích'}
        </button>
      </div>

      {/* Overall Fear & Greed Index */}
      <div className={`${getFearGreedBgClass(overview.fearGreedIndex)} border border-dark-600 rounded-xl p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-dark-400 mb-1">Chỉ số Fear &amp; Greed thị trường tổng thể</p>
            <div className="flex items-baseline gap-3">
              <span
                className="text-6xl font-bold"
                style={{ color: getFearGreedColor(overview.fearGreedIndex) }}
              >
                {overview.fearGreedIndex}
              </span>
              <span
                className="text-xl font-semibold"
                style={{ color: getFearGreedColor(overview.fearGreedIndex) }}
              >
                {overview.fearGreedLabel}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-dark-400 mb-2">Thang đo</p>
            <div className="flex flex-col gap-1 text-xs">
              <span className="text-emerald-400">81-100: Tham lam cực độ</span>
              <span className="text-green-400">61-80: Tham lam</span>
              <span className="text-yellow-400">41-60: Trung lập</span>
              <span className="text-red-400">21-40: Sợ hãi</span>
              <span style={{ color: '#8B0000' }}>0-20: Sợ hãi cực độ</span>
            </div>
          </div>
        </div>

        {/* Fear & Greed Progress Bar */}
        <div className="mt-4">
          <div className="relative h-3 rounded-full overflow-hidden"
            style={{
              background: 'linear-gradient(to right, #8B0000, #F6465D, #F0B90B, #10B981, #0ECB81)',
            }}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-white"
              style={{ left: `calc(${overview.fearGreedIndex}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between text-xs text-dark-500 mt-1">
            <span>Sợ hãi</span>
            <span>Trung lập</span>
            <span>Tham lam</span>
          </div>
        </div>
      </div>

      {/* Coin Sentiment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sentimentData.map((data) => (
          <Card key={data.symbol} padded>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{data.symbol}</span>
                  <span className="text-sm text-dark-400">{data.coin}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: getFearGreedColor(data.fearGreedIndex) }}
                  >
                    {data.fearGreedIndex}
                  </span>
                  <span
                    className="text-sm font-medium px-2 py-0.5 rounded-full"
                    style={{
                      color: getFearGreedColor(data.fearGreedIndex),
                      backgroundColor: `${getFearGreedColor(data.fearGreedIndex)}20`,
                    }}
                  >
                    {data.label}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(${getFearGreedColor(data.fearGreedIndex)} ${data.fearGreedIndex * 3.6}deg, #1E2329 0deg)`,
                }}
              >
                <div className="w-9 h-9 rounded-full bg-dark-800 flex items-center justify-center">
                  <span className="text-xs font-bold" style={{ color: getFearGreedColor(data.fearGreedIndex) }}>
                    {data.fearGreedIndex}
                  </span>
                </div>
              </div>
            </div>

            {/* Signals */}
            <div className="space-y-2 mb-3">
              {data.signals.map((signal, i) => (
                <div key={i} className="flex items-start gap-2 bg-dark-700 rounded-lg p-2.5">
                  <SignalBadge type={signal.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium">{signal.source}</p>
                    <p className="text-xs text-dark-400 mt-0.5 leading-relaxed">{signal.summary}</p>
                  </div>
                  <span className="text-xs text-dark-400 flex-shrink-0 font-medium">
                    {signal.confidence}%
                  </span>
                </div>
              ))}
            </div>

            {/* News Summary */}
            {data.newsSummary && (
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-xs text-dark-400 mb-1 font-medium">Tóm tắt tin tức</p>
                <p className="text-xs text-dark-400 leading-relaxed">{data.newsSummary}</p>
              </div>
            )}

            {data.updatedAt && (
              <p className="text-xs text-dark-500 mt-2">
                Cập nhật: {formatTime(data.updatedAt)}
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* Trending Bullish Signals */}
      {trendingBullish.length > 0 && (
        <Card padded>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Tín hiệu tăng nổi bật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {trendingBullish.map((signal, i) => (
              <div key={i} className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-brand">{signal.coin}</span>
                  <span className="text-xs text-green-400">{signal.confidence}% tin cậy</span>
                </div>
                <p className="text-xs text-dark-400 font-medium mb-0.5">{signal.source}</p>
                <p className="text-xs text-dark-400 leading-relaxed">{signal.summary}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
