import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, hasAnthropicKey, MODEL_ID, SYSTEM_PROMPTS } from '@/lib/anthropic';
import { mockRiskScore } from '@/lib/mockData';
import type { Portfolio, RiskScore } from '@hhd-i/types';

export const runtime = 'nodejs';

interface RiskRequest {
  portfolio: Portfolio;
}

export async function POST(req: NextRequest) {
  try {
    const body: RiskRequest = await req.json();
    const { portfolio } = body;

    if (!hasAnthropicKey()) {
      // Return mock data with slight randomization when no API key
      const mockResponse: RiskScore = {
        ...mockRiskScore,
        score: Math.floor(Math.random() * 20) + 35,
        analyzedAt: new Date().toISOString(),
        breakdown: {
          concentration: Math.floor(Math.random() * 20) + 55,
          volatility: Math.floor(Math.random() * 20) + 40,
          marketRisk: Math.floor(Math.random() * 20) + 25,
          liquidityRisk: Math.floor(Math.random() * 10) + 15,
        },
      };
      const s = mockResponse.score;
      mockResponse.level = s < 30 ? 'low' : s < 60 ? 'medium' : s < 80 ? 'high' : 'extreme';
      return NextResponse.json(mockResponse);
    }

    const client = getAnthropicClient();

    const prompt = `Phân tích rủi ro cho danh mục đầu tư sau và trả về JSON:

${JSON.stringify(portfolio, null, 2)}

Trả về JSON với cấu trúc chính xác sau (không có text thêm, chỉ JSON thuần):
{
  "score": <số từ 0-100>,
  "level": <"low"|"medium"|"high"|"extreme">,
  "breakdown": {
    "concentration": <số từ 0-100>,
    "volatility": <số từ 0-100>,
    "marketRisk": <số từ 0-100>,
    "liquidityRisk": <số từ 0-100>
  },
  "recommendations": [
    "<khuyến nghị 1>",
    "<khuyến nghị 2>",
    "<khuyến nghị 3>"
  ],
  "analyzedAt": "<ISO date string>"
}`;

    const message = await client.messages.create({
      model: MODEL_ID,
      max_tokens: 1024,
      system: SYSTEM_PROMPTS.risk,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const riskScore: RiskScore = JSON.parse(jsonMatch[0]);
    riskScore.analyzedAt = new Date().toISOString();

    return NextResponse.json(riskScore);
  } catch (error) {
    console.error('Risk API error:', error);
    // Return mock data on error
    return NextResponse.json({
      ...mockRiskScore,
      analyzedAt: new Date().toISOString(),
    });
  }
}
