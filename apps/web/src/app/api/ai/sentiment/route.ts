import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getAnthropicClient, hasAnthropicKey, MODEL_ID, SYSTEM_PROMPTS } from '@/lib/anthropic';
import { mockSentimentData } from '@/lib/mockData';
import type { SentimentData } from '@hhd-i/types';

export const runtime = 'nodejs';

interface SentimentRequest {
  coins: string[];
}

export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body: SentimentRequest = await req.json();
    const { coins } = body;

    if (!hasAnthropicKey()) {
      // Filter mock data for requested coins, return with fresh timestamps
      const filtered = mockSentimentData
        .filter((d) => coins.includes(d.symbol))
        .map((d) => ({ ...d, updatedAt: new Date().toISOString() }));
      return NextResponse.json(filtered.length > 0 ? filtered : mockSentimentData);
    }

    const client = getAnthropicClient();

    const prompt = `Phân tích tâm lý thị trường cho các coin sau: ${coins.join(', ')}

Trả về JSON array với cấu trúc sau (không có text thêm):
[
  {
    "coin": "<tên đầy đủ>",
    "symbol": "<ký hiệu>",
    "fearGreedIndex": <số từ 0-100>,
    "label": <"Tham lam cực độ"|"Tham lam"|"Trung lập"|"Sợ hãi"|"Sợ hãi cực độ">,
    "signals": [
      {
        "type": <"bullish"|"bearish"|"neutral">,
        "source": "<nguồn phân tích>",
        "summary": "<tóm tắt tín hiệu bằng tiếng Việt>",
        "confidence": <số từ 0-100>
      }
    ],
    "newsSummary": "<tóm tắt tin tức ngắn bằng tiếng Việt>",
    "updatedAt": "<ISO date string>"
  }
]

Cung cấp 2-3 signals cho mỗi coin. Dựa trên điều kiện thị trường hiện tại hợp lý.`;

    const message = await client.messages.create({
      model: MODEL_ID,
      max_tokens: 2048,
      system: SYSTEM_PROMPTS.sentiment,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const sentimentData: SentimentData[] = JSON.parse(jsonMatch[0]);
    // Ensure all have updatedAt
    const result = sentimentData.map((d) => ({
      ...d,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Sentiment API error:', error);
    return NextResponse.json(mockSentimentData);
  }
}
