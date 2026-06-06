'use client';

import { useState } from 'react';
import { Bot, Plus, Trash2, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { ChatInterface } from '@/components/assistant/ChatInterface';
import type { DCASchedule, DCAFrequency } from '@hhd-i/types';
import { mockDCASchedules } from '@/lib/mockData';

const COINS = ['Bitcoin (BTC)', 'Ethereum (ETH)', 'Solana (SOL)', 'BNB (BNB)'];
const COIN_MAP: Record<string, { coin: string; symbol: string }> = {
  'Bitcoin (BTC)': { coin: 'Bitcoin', symbol: 'BTC' },
  'Ethereum (ETH)': { coin: 'Ethereum', symbol: 'ETH' },
  'Solana (SOL)': { coin: 'Solana', symbol: 'SOL' },
  'BNB (BNB)': { coin: 'BNB', symbol: 'BNB' },
};

const FREQUENCY_LABELS: Record<DCAFrequency, string> = {
  daily: 'Hàng ngày',
  weekly: 'Hàng tuần',
  monthly: 'Hàng tháng',
};

export default function AssistantPage() {
  const [dcaSchedules, setDcaSchedules] = useState<DCASchedule[]>(mockDCASchedules);
  const [formCoin, setFormCoin] = useState('Bitcoin (BTC)');
  const [formAmount, setFormAmount] = useState('');
  const [formFrequency, setFormFrequency] = useState<DCAFrequency>('weekly');
  const [formDate, setFormDate] = useState('');

  const handleCreateDCA = () => {
    if (!formAmount || !formDate) return;
    const { coin, symbol } = COIN_MAP[formCoin];
    const newSchedule: DCASchedule = {
      id: Date.now().toString(),
      coin,
      symbol,
      amount: parseFloat(formAmount),
      frequency: formFrequency,
      nextRun: new Date(formDate).toISOString(),
      isActive: true,
      totalInvested: 0,
      createdAt: new Date().toISOString(),
    };
    setDcaSchedules((prev) => [...prev, newSchedule]);
    setFormAmount('');
    setFormDate('');
  };

  const handleDeleteDCA = (id: string) => {
    setDcaSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleDCA = (id: string) => {
    setDcaSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="px-6 py-4 border-b border-dark-600 bg-dark-800 flex items-center gap-3">
        <Bot className="w-5 h-5 text-brand" />
        <div>
          <h1 className="text-base font-semibold text-white">Trợ lý AI Giao dịch</h1>
          <p className="text-xs text-dark-400">Phân tích thị trường, tư vấn chiến lược và quản lý DCA tự động</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            apiEndpoint="/api/ai/assistant"
            placeholder="Hỏi về thị trường, chiến lược DCA, hoặc phân tích coin..."
            initialMessage="Xin chào! Tôi là trợ lý AI giao dịch của HHD-I. Bạn có thể hỏi tôi về thị trường, chiến lược đầu tư, hoặc ra lệnh giao dịch bằng tiếng Việt."
          />
        </div>

        {/* DCA Scheduler Panel */}
        <div className="w-80 flex-shrink-0 border-l border-dark-600 bg-dark-800 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-dark-600">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand" />
              Lịch DCA Tự động
            </h2>
          </div>

          {/* DCA Form */}
          <div className="p-4 border-b border-dark-600 space-y-3">
            <div>
              <label className="text-xs text-dark-400 mb-1 block">Coin</label>
              <select
                value={formCoin}
                onChange={(e) => setFormCoin(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
              >
                {COINS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-dark-400 mb-1 block">Số tiền (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-400" />
                <input
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="100"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand placeholder:text-dark-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-dark-400 mb-1 block">Tần suất</label>
              <select
                value={formFrequency}
                onChange={(e) => setFormFrequency(e.target.value as DCAFrequency)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
              >
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-dark-400 mb-1 block">Ngày bắt đầu</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
              />
            </div>

            <button
              onClick={handleCreateDCA}
              disabled={!formAmount || !formDate}
              className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tạo lịch DCA
            </button>
          </div>

          {/* Active Schedules */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="text-xs text-dark-400 font-medium uppercase tracking-wider">
              Đang hoạt động ({dcaSchedules.filter((s) => s.isActive).length})
            </p>
            {dcaSchedules.length === 0 && (
              <p className="text-xs text-dark-500 text-center py-4">Chưa có lịch DCA nào</p>
            )}
            {dcaSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`bg-dark-700 border rounded-lg p-3 ${
                  schedule.isActive ? 'border-dark-600' : 'border-dark-700 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold text-white">{schedule.symbol}</span>
                    <span className="text-xs text-dark-400 ml-2">{schedule.coin}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleDCA(schedule.id)}
                      className="text-dark-400 hover:text-brand transition-colors"
                      title={schedule.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDCA(schedule.id)}
                      className="text-dark-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand font-medium">${schedule.amount}</span>
                  <span className="text-dark-400">{FREQUENCY_LABELS[schedule.frequency]}</span>
                </div>
                <div className="mt-1.5 text-xs text-dark-500">
                  Lần tiếp theo:{' '}
                  {new Date(schedule.nextRun).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </div>
                {schedule.totalInvested !== undefined && schedule.totalInvested > 0 && (
                  <div className="mt-1 text-xs text-dark-500">
                    Đã đầu tư: ${schedule.totalInvested.toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
