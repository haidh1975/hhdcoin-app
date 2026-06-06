'use client';

import { MessageCircle } from 'lucide-react';
import { ChatInterface } from '@/components/assistant/ChatInterface';

const FAQ_QUESTIONS = [
  'Cách rút tiền?',
  'Phí giao dịch là bao nhiêu?',
  'Bảo mật tài khoản như thế nào?',
  'DCA là gì và cách hoạt động?',
  'Làm sao để kết nối ví?',
  'Hỗ trợ những đồng coin nào?',
];

export default function SupportPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="px-6 py-4 border-b border-dark-600 bg-dark-800 flex items-center gap-3">
        <MessageCircle className="w-5 h-5 text-green-400" />
        <div>
          <h1 className="text-base font-semibold text-white">Hỗ trợ AI 24/7</h1>
          <p className="text-xs text-dark-400">Trợ lý AI sẵn sàng giải đáp mọi thắc mắc bằng tiếng Việt</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400">Trực tuyến</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* FAQ Sidebar */}
        <div className="w-56 flex-shrink-0 border-r border-dark-600 bg-dark-800 p-4">
          <p className="text-xs text-dark-400 font-medium uppercase tracking-wider mb-3">
            Câu hỏi thường gặp
          </p>
          <div className="space-y-2">
            {FAQ_QUESTIONS.map((q) => (
              <button
                key={q}
                className="w-full text-left text-xs text-dark-400 hover:text-white bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-brand/30 rounded-lg px-3 py-2.5 transition-all duration-150"
                onClick={() => {
                  // This button text will be used by ChatInterface via a custom event
                  const event = new CustomEvent('faq-click', { detail: q });
                  window.dispatchEvent(event);
                }}
              >
                {q}
              </button>
            ))}
          </div>

          <div className="mt-6 bg-dark-700 border border-dark-600 rounded-lg p-3">
            <p className="text-xs text-dark-400 font-medium mb-1">Liên hệ trực tiếp</p>
            <p className="text-xs text-dark-500 leading-relaxed">
              Email:{' '}
              <a href="mailto:support@hhd-i.com" className="text-brand hover:underline">
                support@hhd-i.com
              </a>
            </p>
            <p className="text-xs text-dark-500 mt-1">Phản hồi trong 24 giờ</p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            apiEndpoint="/api/ai/chat"
            placeholder="Nhập câu hỏi của bạn..."
            initialMessage="Xin chào! Tôi là trợ lý hỗ trợ của HHD-I. Tôi có thể giúp bạn về tài khoản, giao dịch, bảo mật và các tính năng của nền tảng. Bạn cần hỗ trợ gì hôm nay?"
            enableFaqListener
          />
        </div>
      </div>
    </div>
  );
}
