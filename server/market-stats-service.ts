import { logger } from "./core/logger";
import { fetchJson } from "./core/http-client";
import { TtlCache } from "./core/cache";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Mover { symbol: string; name: string; price: number; change24h: number; image?: string }
export interface MarketStats {
  fearGreed: { value: number; label: string };
  btcDominance: number;
  ethDominance: number;
  totalMarketCap: number;
  marketCapChange24h: number;
  topGainers: Mover[];
  topLosers: Mover[];
  aiSignal: { action: string; confidence: number; reason: string };
  updatedAt: string;
  source: "live" | "cache" | "mock";
}

const cache = new TtlCache<MarketStats>(90_000); // 90s

const FG_LABEL_VI: Record<string, string> = {
  "Extreme Fear": "Sợ hãi tột độ",
  "Fear": "Sợ hãi",
  "Neutral": "Trung lập",
  "Greed": "Tham lam",
  "Extreme Greed": "Tham lam tột độ",
};

// Tín hiệu AI dựa trên quy tắc (Fear&Greed + xu hướng) — không cần credit AI
function computeSignal(fg: number, mcapChange: number): { action: string; confidence: number; reason: string } {
  if (fg <= 25) return { action: "MUA TÍCH LŨY", confidence: 78, reason: "Thị trường sợ hãi tột độ — cơ hội tích lũy dài hạn (ngược đám đông)." };
  if (fg <= 45) return { action: "TÍCH LŨY", confidence: 65, reason: "Tâm lý thận trọng, định giá hấp dẫn — cân nhắc giải ngân từng phần (DCA)." };
  if (fg < 55) return { action: "GIỮ / TRUNG LẬP", confidence: 60, reason: "Thị trường cân bằng — giữ danh mục, theo dõi tín hiệu xu hướng." };
  if (fg < 75) return { action: "THẬN TRỌNG", confidence: 64, reason: "Tâm lý tham lam tăng — cân nhắc chốt lời từng phần, quản trị rủi ro." };
  return { action: "CHỐT LỜI / THẬN TRỌNG", confidence: 72, reason: "Tham lam tột độ — rủi ro điều chỉnh cao, ưu tiên bảo toàn lợi nhuận." };
}

function mock(): MarketStats {
  return {
    fearGreed: { value: 54, label: "Trung lập" },
    btcDominance: 58.2, ethDominance: 12.4, totalMarketCap: 2.35e12, marketCapChange24h: -0.8,
    topGainers: [
      { symbol: "SOL", name: "Solana", price: 168.2, change24h: 7.4 },
      { symbol: "AVAX", name: "Avalanche", price: 38.1, change24h: 5.9 },
      { symbol: "LINK", name: "Chainlink", price: 18.7, change24h: 4.2 },
    ],
    topLosers: [
      { symbol: "DOGE", name: "Dogecoin", price: 0.14, change24h: -5.1 },
      { symbol: "SHIB", name: "Shiba Inu", price: 0.000023, change24h: -4.3 },
      { symbol: "XRP", name: "XRP", price: 0.58, change24h: -3.2 },
    ],
    aiSignal: computeSignal(54, -0.8),
    updatedAt: new Date().toISOString(), source: "mock",
  };
}

export async function getMarketStats(): Promise<MarketStats> {
  const cached = cache.fresh;
  if (cached) return { ...cached, source: "cache" };
  try {
    const [fg, global, markets] = await Promise.all([
      fetchJson<any>("https://api.alternative.me/fng/?limit=1").catch(() => null),
      fetchJson<any>("https://api.coingecko.com/api/v3/global").catch(() => null),
      fetchJson<any>("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&price_change_percentage=24h").catch(() => null),
    ]);

    const fgVal = fg?.data?.[0] ? parseInt(fg.data[0].value, 10) : 50;
    const fgLabelEn = fg?.data?.[0]?.value_classification ?? "Neutral";
    const btcDom = global?.data?.market_cap_percentage?.btc ?? 58;
    const ethDom = global?.data?.market_cap_percentage?.eth ?? 12;
    const totalCap = global?.data?.total_market_cap?.usd ?? 2.3e12;
    const mcapChange = global?.data?.market_cap_change_percentage_24h_usd ?? 0;

    let topGainers: Mover[] = []; let topLosers: Mover[] = [];
    if (Array.isArray(markets)) {
      const valid = markets.filter((c: any) => typeof c.price_change_percentage_24h === "number");
      const sorted = [...valid].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
      const toMover = (c: any): Mover => ({ symbol: (c.symbol || "").toUpperCase(), name: c.name, price: c.current_price, change24h: +c.price_change_percentage_24h.toFixed(2), image: c.image });
      topGainers = sorted.slice(0, 5).map(toMover);
      topLosers = sorted.slice(-5).reverse().map(toMover);
    }
    if (topGainers.length === 0) { const m = mock(); topGainers = m.topGainers; topLosers = m.topLosers; }

    const stats: MarketStats = {
      fearGreed: { value: fgVal, label: FG_LABEL_VI[fgLabelEn] ?? fgLabelEn },
      btcDominance: +btcDom.toFixed(1), ethDominance: +ethDom.toFixed(1),
      totalMarketCap: totalCap, marketCapChange24h: +mcapChange.toFixed(2),
      topGainers, topLosers,
      aiSignal: computeSignal(fgVal, mcapChange),
      updatedAt: new Date().toISOString(), source: "live",
    };
    cache.set(stats);
    return stats;
  } catch (err: any) {
    logger.error("MarketStats", err, "market");
    const stale = cache.any;
    return stale ? { ...stale, source: "cache" } : mock();
  }
}
