import OpenAI from "openai";
import { env } from "./config/env";
import { log } from "./vite";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null as unknown as OpenAI;
const INSTANCE_ID = `pid:${process.pid}`;

export interface MarketAnalysisAI {
  trend: 'bullish' | 'bearish' | 'neutral';
  sentiment: string;
  recommendation: string;
  confidenceScore: number;
  keyFactors: string[];
  riskLevel: 'low' | 'medium' | 'high';
  priceTarget: {
    short_term: number;
    medium_term: number;
  };
}

export interface TradingRecommendation {
  action: 'buy' | 'sell' | 'hold';
  reasoning: string;
  confidence: number;
  timeframe: string;
  riskAssessment: string;
}

/**
 * Phân tích thị trường Bitcoin sử dụng AI GPT-5
 */
export async function analyzeMarketWithAI(bitcoinData: any): Promise<MarketAnalysisAI> {
  try {
    // Check if OpenAI API key is available
    if (!env.OPENAI_API_KEY) {
      log(`[AI][${INSTANCE_ID}] OpenAI API key not available, using fallback analysis`);
      throw new Error("OpenAI API key not configured");
    }

    log(`[AI][${INSTANCE_ID}] Starting AI market analysis with GPT-5`);
    log(`[AI][${INSTANCE_ID}] Bitcoin price: $${bitcoinData.price}, Change 24h: ${bitcoinData.change24h}%`);

    const prompt = `Bạn là chuyên gia phân tích thị trường Bitcoin hàng đầu. Phân tích dữ liệu sau và đưa ra nhận định chuyên sâu:

Dữ liệu Bitcoin hiện tại:
- Giá hiện tại: $${bitcoinData.price}
- Thay đổi 24h: ${bitcoinData.change24h}%
- Giá cao nhất 24h: $${bitcoinData.high24h || 'N/A'}
- Giá thấp nhất 24h: $${bitcoinData.low24h || 'N/A'}
- Khối lượng giao dịch 24h: $${bitcoinData.volume24h || 'N/A'}
- Vốn hóa thị trường: $${bitcoinData.marketCap || 'N/A'}

Hãy phân tích và trả về JSON với format chính xác:
{
  "trend": "bullish|bearish|neutral",
  "sentiment": "Tâm lý thị trường (tiếng Việt)",
  "recommendation": "Khuyến nghị đầu tư chi tiết (tiếng Việt)",
  "confidenceScore": 0.85,
  "keyFactors": ["Yếu tố 1", "Yếu tố 2", "Yếu tố 3"],
  "riskLevel": "low|medium|high",
  "priceTarget": {
    "short_term": 115000,
    "medium_term": 120000
  }
}

Lưu ý: Trả lời bằng tiếng Việt, đưa ra phân tích thực tế dựa trên dữ liệu số.`;

    const response = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages: [
          {
            role: "system",
            content: "Bạn là chuyên gia phân tích thị trường tiền điện tử với 10+ năm kinh nghiệm. Luôn đưa ra phân tích dựa trên dữ liệu và xu hướng thị trường."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('AI request timeout')), 30000) // 30 second timeout
      )
    ]);

    const aiAnalysis = JSON.parse((response as any).choices[0].message.content || '{}');
    
    log(`[AI][${INSTANCE_ID}] AI analysis completed successfully`);
    log(`[AI][${INSTANCE_ID}] Trend: ${aiAnalysis.trend}, Confidence: ${aiAnalysis.confidenceScore}`);

    return {
      trend: aiAnalysis.trend || 'neutral',
      sentiment: aiAnalysis.sentiment || 'Trung tính',
      recommendation: aiAnalysis.recommendation || 'Theo dõi thêm để đưa ra quyết định phù hợp.',
      confidenceScore: aiAnalysis.confidenceScore || 0.5,
      keyFactors: aiAnalysis.keyFactors || ['Dữ liệu không đầy đủ'],
      riskLevel: aiAnalysis.riskLevel || 'medium',
      priceTarget: {
        short_term: aiAnalysis.priceTarget?.short_term || bitcoinData.price * 1.02,
        medium_term: aiAnalysis.priceTarget?.medium_term || bitcoinData.price * 1.05
      }
    };

  } catch (error) {
    log(`[AI][${INSTANCE_ID}] AI analysis error: ${error}`);
    
    // Fallback analysis if AI fails
    const trend = bitcoinData.change24h > 2 ? 'bullish' : 
                  bitcoinData.change24h < -2 ? 'bearish' : 'neutral';
    
    return {
      trend,
      sentiment: bitcoinData.change24h > 0 ? 'Tích cực' : 'Tiêu cực',
      recommendation: 'Không thể phân tích AI. Hãy theo dõi thị trường và cân nhắc kỹ trước khi đầu tư.',
      confidenceScore: 0.3,
      keyFactors: ['Lỗi hệ thống AI', 'Sử dụng dữ liệu cơ bản'],
      riskLevel: 'high',
      priceTarget: {
        short_term: bitcoinData.price * 1.01,
        medium_term: bitcoinData.price * 1.03
      }
    };
  }
}

/**
 * Tạo khuyến nghị giao dịch cá nhân hóa
 */
export async function generateTradingRecommendation(
  bitcoinData: any, 
  userRiskProfile: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
): Promise<TradingRecommendation> {
  try {
    log(`[AI][${INSTANCE_ID}] Generating trading recommendation for ${userRiskProfile} investor`);

    const prompt = `Bạn là cố vấn đầu tư Bitcoin chuyên nghiệp. Dựa vào dữ liệu thị trường và hồ sơ rủi ro của nhà đầu tư, đưa ra khuyến nghị giao dịch cụ thể:

Dữ liệu Bitcoin:
- Giá: $${bitcoinData.price}
- Thay đổi 24h: ${bitcoinData.change24h}%
- Khối lượng: $${bitcoinData.volume24h || 'N/A'}

Hồ sơ nhà đầu tư: ${userRiskProfile}
- Conservative: Ưu tiên bảo toàn vốn, chấp nhận lợi nhuận thấp
- Moderate: Cân bằng rủi ro và lợi nhuận  
- Aggressive: Chấp nhận rủi ro cao để có lợi nhuận cao

Trả về JSON format:
{
  "action": "buy|sell|hold",
  "reasoning": "Lý do chi tiết (tiếng Việt)",
  "confidence": 0.8,
  "timeframe": "Khung thời gian khuyến nghị",
  "riskAssessment": "Đánh giá rủi ro cụ thể"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
      messages: [
        {
          role: "system", 
          content: "Bạn là cố vấn tài chính được cấp phép, chuyên về đầu tư Bitcoin. Luôn đưa ra lời khuyên thận trọng và có trách nhiệm."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 800
    });

    const recommendation = JSON.parse(response.choices[0].message.content || '{}');
    
    log(`[AI][${INSTANCE_ID}] Trading recommendation: ${recommendation.action} with confidence ${recommendation.confidence}`);

    return {
      action: recommendation.action || 'hold',
      reasoning: recommendation.reasoning || 'Không có đủ thông tin để đưa ra khuyến nghị.',
      confidence: recommendation.confidence || 0.5,
      timeframe: recommendation.timeframe || 'Ngắn hạn (1-7 ngày)',
      riskAssessment: recommendation.riskAssessment || 'Rủi ro trung bình'
    };

  } catch (error) {
    log(`[AI][${INSTANCE_ID}] Trading recommendation error: ${error}`);
    
    return {
      action: 'hold',
      reasoning: 'Lỗi hệ thống AI. Khuyến nghị giữ vị thế hiện tại và theo dõi thêm.',
      confidence: 0.3,
      timeframe: 'Chờ hệ thống ổn định',
      riskAssessment: 'Rủi ro cao do lỗi hệ thống'
    };
  }
}

/**
 * Phân tích cảm xúc thị trường từ tin tức
 */
export async function analyzeSentiment(newsText: string): Promise<{
  rating: number;
  confidence: number;
  summary: string;
}> {
  try {
    log(`[AI][${INSTANCE_ID}] Analyzing market sentiment from news`);

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
      messages: [
        {
          role: "system",
          content: "Bạn là chuyên gia phân tích cảm xúc thị trường. Phân tích văn bản tin tức và đánh giá cảm xúc từ 1-5 sao (1=rất tiêu cực, 5=rất tích cực). Trả lời bằng JSON."
        },
        {
          role: "user",
          content: `Phân tích cảm xúc của đoạn tin tức này về Bitcoin: "${newsText}". 
          
          Trả về JSON: 
          {
            "rating": số từ 1-5,
            "confidence": số từ 0-1,
            "summary": "Tóm tắt cảm xúc (tiếng Việt)"
          }`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      summary: result.summary || 'Không thể phân tích cảm xúc'
    };

  } catch (error) {
    log(`[AI][${INSTANCE_ID}] Sentiment analysis error: ${error}`);
    throw new Error("Failed to analyze sentiment: " + (error as Error).message);
  }
}