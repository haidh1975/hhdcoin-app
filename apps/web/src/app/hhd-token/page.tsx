'use client';

import Link from 'next/link';
import { Zap, Flame, Coins, ShieldCheck, ArrowRight, CreditCard, Vote, FlaskConical, Award, Droplets, Users, Bot, Rocket, Gift } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { HHD, TOKEN_ALLOCATION, TOKEN_UTILITY, SMART_CONTRACTS } from '@/lib/hhd';
import { OnChainSection } from '@/components/web3/OnChainSection';
import { Card } from '@/shared/components/ui/Card';
import { formatNumber } from '@/shared/utils/format';

const UTILITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard, Coins, Vote, FlaskConical, Award, Droplets, Users, Bot, Rocket, Gift,
};

// Giả lập dữ liệu on-chain (chưa có tracking thật)
const BURNED = 4_200_000;
const CIRCULATING = 96_000_000;

export default function HhdTokenPage() {
  const pieData = TOKEN_ALLOCATION.map((a) => ({ name: a.category, value: a.pct, color: a.color }));

  const metrics = [
    { label: 'Tổng cung tối đa', value: `${formatNumber(HHD.maxSupply)} HHD` },
    { label: 'Đã đốt (burn)', value: `${formatNumber(BURNED)} HHD` },
    { label: 'Cung lưu hành', value: `${formatNumber(CIRCULATING)} HHD` },
    { label: 'FDV khi ra mắt', value: `$${formatNumber(HHD.launchFdvUsd)}` },
    { label: 'Vốn hóa (ước tính)', value: `$${formatNumber(Math.round(CIRCULATING * HHD.presalePriceUsd))}` },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-600 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-brand flex items-center justify-center flex-shrink-0">
            <Zap className="w-11 h-11 text-black" fill="black" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              {HHD.name}
              <span className="text-base font-semibold text-brand bg-brand/10 px-2.5 py-1 rounded-lg">
                ${HHD.symbol}
              </span>
            </h1>
            <p className="text-dark-400 mt-1.5">{HHD.chain} · {HHD.standard} · Token giảm phát</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-dark-400">Giá presale hiện tại</p>
            <p className="text-3xl font-bold text-brand">${HHD.presalePriceUsd.toFixed(3)}</p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} padded>
            <p className="text-xs text-dark-400 mb-1">{m.label}</p>
            <p className="text-lg font-bold text-white">{m.value}</p>
          </Card>
        ))}
      </div>

      {/* Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Coins className="w-4 h-4 text-brand" /> Phân bổ token (1 tỷ HHD)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={2} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1E2329', border: '1px solid #2B3139', borderRadius: '8px', color: '#EAECEF', fontSize: '12px' }}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-white mb-4">Cơ chế đốt (Burn) giảm phát</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-dark-700 border border-dark-600 rounded-lg p-4">
              <Flame className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">1% mỗi giao dịch nền tảng</p>
                <p className="text-xs text-dark-400 mt-0.5">Tự động đốt 1% giá trị mỗi giao dịch trong hệ sinh thái.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-dark-700 border border-dark-600 rounded-lg p-4">
              <Flame className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">20% doanh thu kho bạc</p>
                <p className="text-xs text-dark-400 mt-0.5">Mua lại &amp; đốt 20% doanh thu treasury mỗi quý (buy-back-burn).</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-brand/5 border border-brand/30 rounded-lg p-4">
              <Coins className="w-6 h-6 text-brand flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Tổng cung sau đốt: 800 triệu HHD</p>
                <p className="text-xs text-dark-400 mt-0.5">Từ 1 tỷ giảm dần về mục tiêu 800.000.000 HHD.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Allocation table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-600">
          <h2 className="text-base font-semibold text-white">Chi tiết phân bổ</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left text-xs text-dark-400 font-medium px-5 py-3">Hạng mục</th>
                <th className="text-right text-xs text-dark-400 font-medium px-3 py-3">%</th>
                <th className="text-right text-xs text-dark-400 font-medium px-3 py-3">Số lượng</th>
                <th className="text-center text-xs text-dark-400 font-medium px-3 py-3 hidden md:table-cell">TGE</th>
                <th className="text-left text-xs text-dark-400 font-medium px-3 py-3 hidden lg:table-cell">Vesting</th>
                <th className="text-left text-xs text-dark-400 font-medium px-5 py-3 hidden xl:table-cell">Mục đích</th>
              </tr>
            </thead>
            <tbody>
              {TOKEN_ALLOCATION.map((a) => (
                <tr key={a.category} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                      <span className="text-sm font-medium text-white">{a.category}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-semibold text-brand">{a.pct}%</td>
                  <td className="px-3 py-3 text-right text-sm text-white">{formatNumber(a.amount)}</td>
                  <td className="px-3 py-3 text-center text-sm text-dark-400 hidden md:table-cell">{a.tgeUnlock}</td>
                  <td className="px-3 py-3 text-left text-xs text-dark-400 hidden lg:table-cell">{a.vesting}</td>
                  <td className="px-5 py-3 text-left text-xs text-dark-400 hidden xl:table-cell">{a.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Utility grid */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-white mb-4">Tiện ích token (10 vector)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {TOKEN_UTILITY.map((u) => {
            const Icon = UTILITY_ICONS[u.icon] ?? Coins;
            return (
              <div key={u.title} className="bg-dark-700 border border-dark-600 rounded-lg p-4">
                <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-brand" />
                </div>
                <p className="text-sm font-semibold text-white">{u.title}</p>
                <p className="text-xs text-dark-400 mt-1">{u.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* On-chain connection */}
      <OnChainSection />

      {/* Smart contracts */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand" />
          <h2 className="text-base font-semibold text-white">Bộ hợp đồng thông minh</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left text-xs text-dark-400 font-medium px-5 py-3">Hợp đồng</th>
                <th className="text-left text-xs text-dark-400 font-medium px-3 py-3 hidden sm:table-cell">Chuẩn</th>
                <th className="text-left text-xs text-dark-400 font-medium px-3 py-3">Mục đích</th>
                <th className="text-center text-xs text-dark-400 font-medium px-5 py-3">Kiểm toán</th>
              </tr>
            </thead>
            <tbody>
              {SMART_CONTRACTS.map((c) => (
                <tr key={c.name} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors">
                  <td className="px-5 py-3 text-sm font-semibold text-white">{c.name}</td>
                  <td className="px-3 py-3 text-sm text-dark-400 hidden sm:table-cell">{c.standard}</td>
                  <td className="px-3 py-3 text-xs text-dark-400">{c.purpose}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                      {c.audit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CTA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/staking', label: 'Staking HHD', desc: 'APY tới 55%' },
          { href: '/token-sale', label: 'Mua trong Token Sale', desc: 'Vòng Private B đang mở' },
          { href: '/governance', label: 'Tham gia quản trị DAO', desc: 'Bỏ phiếu cho tương lai HHD' },
        ].map((cta) => (
          <Link
            key={cta.href}
            href={cta.href}
            className="group bg-dark-800 border border-dark-600 hover:border-brand rounded-xl p-5 flex items-center justify-between transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-white">{cta.label}</p>
              <p className="text-xs text-dark-400 mt-0.5">{cta.desc}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-dark-500 group-hover:text-brand transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
