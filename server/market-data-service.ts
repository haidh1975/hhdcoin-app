/**
 * Market Data Service — giá đa tài sản thời gian thực.
 *
 * - Crypto: CoinGecko batch call (1 request cho tất cả coins) → fallback Binance (BTC/ETH)
 * - Cổ phiếu VN: giá manual qua bảng assets (admin cập nhật) hoặc feed bổ sung sau
 * - Cache 60s, chống concurrent refresh, mock fallback cuối cùng
 */
import { log } from "./vite";

export interface AssetPrice {
  symbol: string;
  name: string;
  type: "crypto" | "stock" | "index" | "commodity";
  price: number;
  change24h: number;
  timestamp: Date;
  source: string;
}

// Danh mục crypto theo dõi mặc định — mở rộng bằng bảng `assets` trong DB
const DEFAULT_CRYPTO: Array<{ symbol: string; name: string; coingeckoId: string }> = [
  { symbol: "BTC", name: "Bitcoin", coingeckoId: "bitcoin" },
  { symbol: "ETH", name: "Ethereum", coingeckoId: "ethereum" },
  { symbol: "BNB", name: "BNB", coingeckoId: "binancecoin" },
  { symbol: "SOL", name: "Solana", coingeckoId: "solana" },
  { symbol: "XRP", name: "XRP", coingeckoId: "ripple" },
  { symbol: "USDT", name: "Tether", coingeckoId: "tether" },
];

interface MarketCache {
  prices: Map<string, AssetPrice>;
  lastUpdated: number;
  isUpdating: boolean;
}

class MarketDataService {
  private cache: MarketCache = { prices: new Map(), lastUpdated: 0, isUpdating: false };
  private readonly CACHE_DURATION = 60 * 1000;
  private readonly API_TIMEOUT = 10_000;

  /** Lấy giá tất cả crypto trong 1 request CoinGecko */
  private async fetchCryptoBatch(): Promise<AssetPrice[]> {
    const ids = DEFAULT_CRYPTO.map(c => c.coingeckoId).join(",");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        {
          signal: controller.signal,
          headers: { "User-Agent": "HHDcoin-Investment-Platform/1.0" },
        }
      );
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

      const data = await res.json();
      const now = new Date();
      const out: AssetPrice[] = [];

      for (const coin of DEFAULT_CRYPTO) {
        const entry = data[coin.coingeckoId];
        if (entry && typeof entry.usd === "number") {
          out.push({
            symbol: coin.symbol,
            name: coin.name,
            type: "crypto",
            price: Math.round(entry.usd * 10000) / 10000,
            change24h: Math.round((entry.usd_24h_change ?? 0) * 100) / 100,
            timestamp: now,
            source: "coingecko",
          });
        }
      }
      if (out.length === 0) throw new Error("Empty CoinGecko response");
      return out;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /** Fallback: Binance — chỉ BTC + ETH */
  private async fetchBinanceFallback(): Promise<AssetPrice[]> {
    const symbols = [
      { pair: "BTCUSDT", symbol: "BTC", name: "Bitcoin" },
      { pair: "ETHUSDT", symbol: "ETH", name: "Ethereum" },
    ];
    const now = new Date();
    const out: AssetPrice[] = [];

    for (const s of symbols) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${s.pair}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!res.ok) continue;
        const data = await res.json();
        const price = parseFloat(data.lastPrice);
        const change = parseFloat(data.priceChangePercent);
        if (!isNaN(price)) {
          out.push({
            symbol: s.symbol, name: s.name, type: "crypto",
            price, change24h: isNaN(change) ? 0 : change,
            timestamp: now, source: "binance",
          });
        }
      } catch {
        clearTimeout(timeoutId);
      }
    }
    if (out.length === 0) throw new Error("Binance fallback failed");
    return out;
  }

  private getMockPrices(): AssetPrice[] {
    const now = new Date();
    const base: Record<string, number> = { BTC: 45000, ETH: 2500, BNB: 320, SOL: 110, XRP: 0.55, USDT: 1 };
    return DEFAULT_CRYPTO.map(c => ({
      symbol: c.symbol,
      name: c.name,
      type: "crypto" as const,
      price: (base[c.symbol] ?? 100) * (1 + (Math.random() - 0.5) * 0.04),
      change24h: (Math.random() - 0.5) * 8,
      timestamp: now,
      source: "mock",
    }));
  }

  /** Lấy toàn bộ giá thị trường (cache 60s) */
  async getAllPrices(forceFresh = false): Promise<AssetPrice[]> {
    const now = Date.now();
    if (!forceFresh && this.cache.prices.size > 0 && now - this.cache.lastUpdated < this.CACHE_DURATION) {
      return Array.from(this.cache.prices.values());
    }

    if (this.cache.isUpdating) {
      let attempts = 0;
      while (this.cache.isUpdating && attempts < 20) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }
      if (this.cache.prices.size > 0) return Array.from(this.cache.prices.values());
    }

    this.cache.isUpdating = true;
    try {
      let prices: AssetPrice[];
      try {
        prices = await this.fetchCryptoBatch();
        log(`[MarketData] CoinGecko batch: ${prices.length} assets`);
      } catch (e1: any) {
        log(`[MarketData] CoinGecko failed: ${e1.message}`);
        try {
          prices = await this.fetchBinanceFallback();
          log(`[MarketData] Binance fallback: ${prices.length} assets`);
        } catch {
          prices = this.cache.prices.size > 0
            ? Array.from(this.cache.prices.values()) // stale better than mock
            : this.getMockPrices();
          log(`[MarketData] Using ${prices[0]?.source ?? "mock"} data`);
        }
      }

      this.cache.prices = new Map(prices.map(p => [p.symbol, p]));
      this.cache.lastUpdated = now;
      return prices;
    } finally {
      this.cache.isUpdating = false;
    }
  }

  /** Lấy giá 1 tài sản theo symbol */
  async getPrice(symbol: string): Promise<AssetPrice | undefined> {
    const all = await this.getAllPrices();
    return all.find(p => p.symbol === symbol.toUpperCase());
  }
}

export const marketDataService = new MarketDataService();
