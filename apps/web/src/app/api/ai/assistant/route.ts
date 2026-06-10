import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getAnthropicClient, hasAnthropicKey, MODEL_ID, SYSTEM_PROMPTS } from '@/lib/anthropic';
import type { ChatMessage, Portfolio } from '@hhd-i/types';

export const runtime = 'nodejs';

interface AssistantRequest {
  messages: ChatMessage[];
  portfolio?: Portfolio;
}

export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body: AssistantRequest = await req.json();
    const { messages, portfolio } = body;

    if (!hasAnthropicKey()) {
      // Mock streaming response when no API key
      const mockResponse =
        'Xin chào! Đây là phản hồi mẫu từ trợ lý AI HHD-I. Để sử dụng đầy đủ tính năng AI, vui lòng cấu hình ANTHROPIC_API_KEY trong file .env.local.\n\nTôi có thể hỗ trợ bạn:\n• Phân tích thị trường crypto\n• Lập kế hoạch DCA\n• Quản lý rủi ro danh mục\n• Giải thích các chiến lược đầu tư';

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const words = mockResponse.split(' ');
          let i = 0;
          const interval = setInterval(() => {
            if (i < words.length) {
              controller.enqueue(encoder.encode(words[i] + (i < words.length - 1 ? ' ' : '')));
              i++;
            } else {
              clearInterval(interval);
              controller.close();
            }
          }, 50);
        },
      });
      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const client = getAnthropicClient();

    // Build system prompt with portfolio context if available
    let systemPrompt = SYSTEM_PROMPTS.assistant;
    if (portfolio) {
      systemPrompt += `\n\nDanh mục hiện tại của người dùng:\n${JSON.stringify(portfolio, null, 2)}`;
    }

    // Convert ChatMessage[] to Anthropic message format
    const anthropicMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const streamResponse = await client.messages.stream({
      model: MODEL_ID,
      max_tokens: 1024,
      system: systemPrompt,
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
    console.error('Assistant API error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn.' },
      { status: 500 }
    );
  }
}
