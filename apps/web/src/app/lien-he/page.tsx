'use client';

import { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Copy,
  CheckCircle,
  Send,
  Landmark,
  User,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { useCopyToClipboard } from '@/shared/hooks/useCopyToClipboard';

const BANK_ACCOUNTS = [
  {
    bank: 'Vietcombank (VCB)',
    accountNumber: '9919226868',
    accountName: 'ĐỖ HỮU HẢI',
    branch: 'Chi nhánh TP.HCM',
    logo: '🏦',
    color: 'from-green-600/20 to-green-700/10',
    border: 'border-green-600/30',
    accent: 'text-green-400',
  },
  {
    bank: 'Vietcombank (VCB)',
    accountNumber: '0021000603220',
    accountName: 'ĐỖ HỮU HẢI',
    branch: 'Chi nhánh Hà Nội',
    logo: '🏦',
    color: 'from-green-600/20 to-green-700/10',
    border: 'border-green-600/30',
    accent: 'text-green-400',
  },
];

export default function LienHePage() {
  const { copiedKey: copied, copy } = useCopyToClipboard();
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Liên Hệ</h1>
        <p className="text-dark-400 mt-1">Kết nối với tác giả — Đỗ Hữu Hải</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT — Author Info + Bank */}
        <div className="space-y-6">
          {/* Author Card */}
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center flex-shrink-0 text-2xl font-bold text-black">
                H
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Đỗ Hữu Hải</h2>
                <p className="text-dark-400 text-sm mt-0.5">Nhà đầu tư & Đào tạo Crypto</p>
                <p className="text-brand text-xs mt-1 font-medium">HHD-I Founder</p>
              </div>
            </div>

            <div className="space-y-3">
              <ContactRow
                icon={Phone}
                label="Điện thoại"
                value="0888 151 975"
                copyKey="phone"
                copyValue="0888151975"
                copied={copied}
                onCopy={copy}
              />
              <ContactRow
                icon={Mail}
                label="Email"
                value="haidh1975@gmail.com"
                copyKey="email"
                copyValue="haidh1975@gmail.com"
                copied={copied}
                onCopy={copy}
              />
              <ContactRow
                icon={MapPin}
                label="Địa chỉ"
                value="Việt Nam"
                copyKey=""
                copyValue=""
                copied={copied}
                onCopy={copy}
              />
            </div>

            {/* Social / Zalo */}
            <div className="pt-4 border-t border-dark-600">
              <p className="text-xs text-dark-500 font-medium uppercase tracking-wider mb-3">Kênh liên lạc nhanh</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'Zalo', href: 'https://zalo.me/0888151975', color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' },
                  { label: 'Facebook', href: '#', color: 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' },
                  { label: 'YouTube', href: '#', color: 'bg-red-500/20 text-red-400 hover:bg-red-500/30' },
                  { label: 'Telegram', href: '#', color: 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${s.color}`}
                  >
                    {s.label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bank Accounts */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Tài khoản ngân hàng</h3>
            </div>
            {BANK_ACCOUNTS.map((acc, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${acc.color} border ${acc.border} rounded-xl p-4 space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{acc.logo}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{acc.bank}</p>
                      <p className="text-dark-400 text-xs">{acc.branch}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <BankRow
                    label="Số tài khoản"
                    value={acc.accountNumber}
                    copyKey={`acc-${idx}`}
                    copied={copied}
                    onCopy={copy}
                    accent={acc.accent}
                    large
                  />
                  <BankRow
                    label="Chủ tài khoản"
                    value={acc.accountName}
                    copyKey={`name-${idx}`}
                    copied={copied}
                    onCopy={copy}
                    accent="text-white"
                  />
                </div>
              </div>
            ))}
            <p className="text-xs text-dark-500 text-center">
              Vui lòng ghi rõ nội dung chuyển khoản: <span className="text-dark-300 font-medium">Tên + Khóa học / Mục đích</span>
            </p>
          </div>
        </div>

        {/* RIGHT — Contact Form */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand" />
            <h3 className="text-white font-bold text-lg">Gửi tin nhắn</h3>
          </div>

          {sent ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-lg">Gửi thành công!</p>
                <p className="text-dark-400 text-sm mt-1">
                  Đỗ Hữu Hải sẽ phản hồi trong vòng 24 giờ.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setFormState({ name: '', email: '', phone: '', message: '' }); }}
                className="text-brand text-sm hover:underline"
              >
                Gửi tin nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Họ và tên"
                icon={User}
                type="text"
                placeholder="Nguyễn Văn A"
                value={formState.name}
                onChange={(v) => setFormState((s) => ({ ...s, name: v }))}
                required
              />
              <FormField
                label="Email"
                icon={Mail}
                type="email"
                placeholder="email@example.com"
                value={formState.email}
                onChange={(v) => setFormState((s) => ({ ...s, email: v }))}
                required
              />
              <FormField
                label="Số điện thoại"
                icon={Phone}
                type="tel"
                placeholder="0888 xxx xxx"
                value={formState.phone}
                onChange={(v) => setFormState((s) => ({ ...s, phone: v }))}
              />

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-dark-300">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Nội dung
                </label>
                <textarea
                  rows={5}
                  placeholder="Tôi muốn hỏi về khóa học... / Tôi cần hỗ trợ về..."
                  value={formState.message}
                  onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                  required
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand/50 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-brand text-black font-semibold py-3 rounded-lg hover:bg-brand-dark transition-colors"
              >
                <Send className="w-4 h-4" />
                Gửi tin nhắn
              </button>

              <p className="text-xs text-dark-500 text-center">
                Hoặc liên hệ trực tiếp qua Zalo: <span className="text-brand">0888 151 975</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function ContactRow({
  icon: Icon, label, value, copyKey, copyValue, copied, onCopy,
}: {
  icon: React.ElementType; label: string; value: string;
  copyKey: string; copyValue: string; copied: string | null;
  onCopy: (v: string, k: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
      <Icon className="w-4 h-4 text-brand flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-dark-500">{label}</p>
        <p className="text-sm text-white font-medium truncate">{value}</p>
      </div>
      {copyKey && (
        <button
          onClick={() => onCopy(copyValue, copyKey)}
          className="flex-shrink-0 text-dark-500 hover:text-brand transition-colors"
        >
          {copied === copyKey
            ? <CheckCircle className="w-4 h-4 text-green-400" />
            : <Copy className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

function BankRow({
  label, value, copyKey, copied, onCopy, accent, large,
}: {
  label: string; value: string; copyKey: string; copied: string | null;
  onCopy: (v: string, k: string) => void; accent: string; large?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 bg-dark-900/50 rounded-lg px-3 py-2">
      <div>
        <p className="text-xs text-dark-500">{label}</p>
        <p className={`font-bold ${large ? 'text-lg tracking-widest' : 'text-sm'} ${accent}`}>{value}</p>
      </div>
      <button
        onClick={() => onCopy(value, copyKey)}
        className="flex-shrink-0 text-dark-500 hover:text-brand transition-colors"
      >
        {copied === copyKey
          ? <CheckCircle className="w-4 h-4 text-green-400" />
          : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

function FormField({
  label, icon: Icon, type, placeholder, value, onChange, required,
}: {
  label: string; icon: React.ElementType; type: string;
  placeholder: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-dark-300">
        <Icon className="w-3.5 h-3.5" />
        {label} {required && <span className="text-brand">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand/50"
      />
    </div>
  );
}
