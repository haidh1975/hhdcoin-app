'use client';

import { useState } from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle, TrendingDown, Droplets, BarChart2 } from 'lucide-react';
import { RiskGauge } from '@/components/risk/RiskGauge';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockRiskScore, mockPortfolio } from '@/lib/mockData';
import type { RiskScore } from '@hhd-i/types';

const COLORS = ['#F0B90B', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

const BREAKDOWN_ITEMS = [
  {
    key: 'concentration' as const,
    label: 'Rủi ro tập trung',
    icon: BarChart2,
    description: 'Mức độ tập trung vào ít loại tài sản',
  },
  {
    key: 'volatility' as const,
    label: 'Rủi ro biến động',
    icon: TrendingDown,
    description: 'Độ biến động giá theo lịch sử',
  },
  {
    key: 'marketRisk' as const,
    label: 'Rủi ro thị trường',
    icon: AlertTriangle,
    description: 'Tương quan với thị trường tổng thể',
  },
  {
    key: 'liquidityRisk' as const,
    label: 'Rủi ro thanh khoản',
    icon: Droplets,
    description: 'Khả năng bán nhanh không ảnh hưởng giá',
  },
];

function getRiskColor(score: number): string {
  if (score < 30) return '#0ECB81';
  if (score < 60) return '#F0B90B';
  if (score < 80) return '#F6465D';
  return '#8B0000';
}

function getRiskBarWidth(score: number): string {
  return `${score}%`;
}

export default function RiskPage() {
  const [riskScore, setRiskScore] = useState<RiskScore>(mockRiskScore);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const portfolioAllocation = mockPortfolio.coins.map((coin, i) => ({
    name: coin.symbol,
    value: parseFloat(coin.allocation.toFixed(1)),
    color: COLORS[i % COLORS.length],
  }));

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio: mockPortfolio }),
      });
      if (res.ok) {
        const data = await res.json();
        setRiskScore(data);
      }
    } catch (err) {
      console.error('Risk analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const riskLevelLabel =
    riskScore.level === 'low'
      ? 'Thấp'
      : riskScore.level === 'medium'
      ? 'Trung bình'
      : riskScore.level === 'high'
      ? 'Cao'
      : 'Cực cao';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Quản lý Rủi ro AI</h1>
            <p className="text-sm text-dark-400">Phân tích rủi ro thời gian thực cho danh mục đầu tư</p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Đang phân tích...' : 'Phân tích lại'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Gauge */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 flex flex-col items-center">
          <h2 className="text-sm font-semibold text-white mb-4">Điểm rủi ro tổng thể</h2>
          <RiskGauge score={riskScore.score} />
          <div className="mt-4 text-center">
            <div
              className="text-4xl font-bold"
              style={{ color: getRiskColor(riskScore.score) }}
            >
              {riskScore.score}
            </div>
            <div className="text-sm text-dark-400 mt-1">Mức {riskLevelLabel}</div>
          </div>
          {riskScore.analyzedAt && (
            <p className="text-xs text-dark-500 mt-3">
              Cập nhật:{' '}
              {new Date(riskScore.analyzedAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>

        {/* Risk Breakdown */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Phân tích chi tiết rủi ro</h2>
          {BREAKDOWN_ITEMS.map((item) => {
            const score = riskScore.breakdown[item.key];
            const color = getRiskColor(score);
            return (
              <div key={item.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5 text-dark-400" />
                    <span className="text-xs text-white font-medium">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color }}>
                    {score}/100
                  </span>
                </div>
                <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: getRiskBarWidth(score),
                      backgroundColor: color,
                    }}
                  />
                </div>
                <p className="text-xs text-dark-500 mt-0.5">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* Portfolio Allocation Pie Chart */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Phân bổ danh mục</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={portfolioAllocation}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {portfolioAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E2329',
                  border: '1px solid #2B3139',
                  borderRadius: '8px',
                  color: '#EAECEF',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value}%`, 'Tỷ trọng']}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: '#EAECEF', fontSize: '12px' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Recommendations */}
      {riskScore.recommendations && riskScore.recommendations.length > 0 && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-brand" />
            Khuyến nghị từ AI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {riskScore.recommendations.map((rec, i) => (
              <div
                key={i}
                className="bg-dark-700 border border-dark-600 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-brand">{i + 1}</span>
                  </div>
                  <p className="text-sm text-dark-400 leading-relaxed">{rec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
