'use client';

import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Bot,
  ShieldAlert,
  BarChart2,
  MessageCircle,
  Wallet,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { MarketTable } from '@/components/dashboard/MarketTable';
import { mockPortfolio, mockMarketData, mockRiskScore, mockMarketOverview } from '@/lib/mockData';

const featureCards = [
  {
    href: '/assistant',
    icon: Bot,
    title: 'Trợ lý AI Giao dịch',
    description: 'Đặt lịch DCA tự động, nhận gợi ý mua/bán, phân tích thị trường bằng tiếng Việt 24/7.',
    color: 'from-yellow-500/20 to-yellow-600/5',
    iconColor: 'text-brand',
  },
  {
    href: '/risk',
    icon: ShieldAlert,
    title: 'Quản lý Rủi ro',
    description: 'Chấm điểm rủi ro danh mục theo thời gian thực với cảnh báo thông minh và đề xuất tối ưu.',
    color: 'from-red-500/20 to-red-600/5',
    iconColor: 'text-red-400',
  },
  {
    href: '/sentiment',
    icon: BarChart2,
    title: 'Phân tích Tâm lý',
    description: 'Chỉ số Fear & Greed, phân tích sentiment theo từng coin với tín hiệu tăng/giảm.',
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
  },
  {
    href: '/support',
    icon: MessageCircle,
    title: 'Hỗ trợ AI 24/7',
    description: 'Chatbot thông minh hỗ trợ tiếng Việt — giải đáp mọi thắc mắc về giao dịch và tài khoản.',
    color: 'from-green-500/20 to-green-600/5',
    iconColor: 'text-green-400',
  },
];

export default function DashboardPage() {
  const portfolio = mockPortfolio;
  const riskScore = mockRiskScore;
  const overview = mockMarketOverview;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Chào mừng đến <span className="text-brand">HHD-I</span>
          </h1>
          <p className="text-dark-400 mt-1 text-sm">
            Nền tảng đầu tư crypto thông minh — Phân tích AI, DCA tự động, quản lý rủi ro
          </p>
        </div>
        <div className="flex items-center gap-2 bg-dark-700 border border-dark-600 rounded-lg px-4 py-2">
          <Activity className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400 font-medium">Thị trường đang mở</span>
        </div>
      </div>

      {/* Market Overview Banner */}
      <div className="grid grid-cols-3 gap-3 bg-dark-800 border border-dark-600 rounded-xl p-4">
        <div className="text-center">
          <p className="text-xs text-dark-400 mb-1">Vốn hóa thị trường</p>
          <p className="text-sm font-bold text-white">
            ${(overview.totalMarketCap / 1e12).toFixed(2)}T
          </p>
        </div>
        <div className="text-center border-x border-dark-600">
          <p className="text-xs text-dark-400 mb-1">Thống trị BTC</p>
          <p className="text-sm font-bold text-brand">{overview.btcDominance}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-dark-400 mb-1">Fear &amp; Greed</p>
          <p className="text-sm font-bold text-yellow-400">
            {overview.fearGreedIndex} — {overview.fearGreedLabel}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Tổng giá trị danh mục"
          value={`$${portfolio.totalValue.toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`}
          change={portfolio.pnlPercent}
          changeLabel={`+$${portfolio.pnl.toLocaleString('vi-VN', { minimumFractionDigits: 2 })}`}
        />
        <StatCard
          icon={portfolio.coins[0].change24h >= 0 ? TrendingUp : TrendingDown}
          label="Thay đổi 24h"
          value={`${portfolio.coins[0].change24h >= 0 ? '+' : ''}${portfolio.coins[0].change24h.toFixed(2)}%`}
          change={portfolio.coins[0].change24h}
          changeLabel="So với hôm qua"
          valueColor={portfolio.coins[0].change24h >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          icon={ShieldAlert}
          label="Điểm rủi ro"
          value={`${riskScore.score}/100`}
          changeLabel={`Mức ${riskScore.level === 'low' ? 'Thấp' : riskScore.level === 'medium' ? 'Trung bình' : riskScore.level === 'high' ? 'Cao' : 'Cực cao'}`}
          valueColor={
            riskScore.score < 30
              ? 'text-green-400'
              : riskScore.score < 60
              ? 'text-yellow-400'
              : riskScore.score < 80
              ? 'text-red-400'
              : 'text-red-600'
          }
        />
        <StatCard
          icon={Activity}
          label="Kế hoạch DCA đang chạy"
          value="2"
          changeLabel="Tự động mỗi tuần/tháng"
          valueColor="text-brand"
        />
      </div>

      {/* Market Table */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
          <h2 className="text-base font-semibold text-white">Thị trường hàng đầu</h2>
          <Link
            href="/sentiment"
            className="text-xs text-brand hover:text-brand-dark transition-colors flex items-center gap-1"
          >
            Xem phân tích tâm lý <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <MarketTable coins={mockMarketData} />
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Tính năng AI</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {featureCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative bg-dark-800 border border-dark-600 rounded-xl p-5 hover:border-brand/50 transition-all duration-200 hover:shadow-lg hover:shadow-brand/5"
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                  <ArrowUpRight className="w-4 h-4 text-dark-500 group-hover:text-brand transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-xs text-dark-400 leading-relaxed">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
