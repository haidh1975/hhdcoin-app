import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, hasAnthropicKey, MODEL_ID, SYSTEM_PROMPTS } from '@/lib/anthropic';
import type { ChatMessage } from '@hhd-i/types';

export const runtime = 'nodejs';

interface ChatRequest {
  messages: ChatMessage[];
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { messages } = body;

    if (!hasAnthropicKey()) {
      const lastMessage = messages[messages.length - 1]?.content ?? '';
      let mockResponse =
        'Xin chào! Tôi là trợ lý hỗ trợ HHD-I. Hiện tại chưa có API key được cấu hình, nhưng tôi vẫn có thể cung cấp thông tin cơ bản.';

      if (lastMessage.toLowerCase().includes('rút tiền')) {
        mockResponse =
          'Để rút tiền từ tài khoản HHD-I, bạn thực hiện theo các bước:\n\n1. Vào **Ví** → **Rút tiền**\n2. Chọn đồng coin muốn rút\n3. Nhập địa chỉ ví nhận (kiểm tra kỹ!)\n4. Nhập số lượng\n5. Xác nhận bằng 2FA\n\nThời gian xử lý: 10-30 phút tùy mạng blockchain.';
      } else if (lastMessage.toLowerCase().includes('phí')) {
        mockResponse =
          'Phí giao dịch tại HHD-I:\n\n• Spot trading: 0.1% mỗi lệnh\n• Giảm 25% khi dùng HHD token\n• Rút tiền: phụ thuộc vào blockchain (BTC: 0.0005 BTC, ETH: ~$5)\n• Nạp tiền: Miễn phí\n\nPhí DCA tự động: 0.05%/giao dịch.';
      } else if (lastMessage.toLowerCase().includes('dca')) {
        mockResponse =
          'DCA (Dollar Cost Averaging) là chiến lược đầu tư định kỳ:\n\n• Bạn mua một lượng cố định ($) theo chu kỳ (hàng ngày/tuần/tháng)\n• Giảm rủi ro mua đỉnh vì mua ở nhiều mức giá khác nhau\n• Phù hợp với đầu tư dài hạn\n\nTại HHD-I, bạn có thể cài DCA tự động tại trang **Trợ lý AI**.';
      } else if (lastMessage.toLowerCase().includes('bảo mật')) {
        mockResponse =
          'HHD-I sử dụng các biện pháp bảo mật cao cấp:\n\n🔒 **Xác thực 2 lớp (2FA)**: Bắt buộc với Google Authenticator\n🛡️ **Mã hóa AES-256**: Dữ liệu ví được mã hóa\n📱 **Xác nhận thiết bị mới**: Cảnh báo qua email\n🔑 **Cold storage**: 95% tài sản lưu trong cold wallet\n\nLời khuyên: Không chia sẻ seed phrase với bất kỳ ai!';
      }

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const chars = mockResponse.split('');
          let i = 0;
          const interval = setInterval(() => {
            if (i < chars.length) {
              controller.enqueue(encoder.encode(chars[i]));
              i++;
            } else {
              clearInterval(interval);
              controller.close();
            }
          }, 15);
        },
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const client = getAnthropicClient();

    const anthropicMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const streamResponse = await client.messages.stream({
      model: MODEL_ID,
      max_tokens: 1024,
      system: SYSTEM_PROMPTS.support,
      messages: anthropicMessages,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResponse) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi, vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
