/**
 * Lớp dữ liệu thị trường (provider adapter).
 *
 * - Crypto: lấy giá thật từ Binance public REST API (không cần API key).
 *   Nếu không kết nối được (offline), tự động fallback sang giá mock thực tế
 *   với cờ `source: 'mock'`.
 * - Cổ phiếu VN: interface `StockProvider` với implementation mock.
 *   Để dùng dữ liệu thật, viết một class implement StockProvider
 *   (vd: SSI FastConnect — https://guide.ssi.com.vn/ssi-products/,
 *   hoặc vnstock — https://github.com/thinh-vu/vnstock qua một service riêng)
 *   rồi thay `stockProvider` ở cuối file.
 */
import type { MarketPrice } from '@hhd-i/types';

const BINANCE_API = 'https://api.binance.com/api/v3/ticker/24hr';

/** Các symbol crypto được hỗ trợ → cặp USDT trên Binance */
const CRYPTO_PAIRS: Record<string, string> = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  BNB: 'BNBUSDT',
  SOL: 'SOLUSDT',
  XRP: 'XRPUSDT',
};

const CRYPTO_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  BNB: 'BNB',
  SOL: 'Solana',
  XRP: 'XRP',
};

/** Giá mock thực tế khi không có mạng */
const CRYPTO_MOCK: Record<string, { price: number; change24h: number; volume: number }> = {
  BTC: { price: 67420.5, change24h: 2.34, volume: 28500000000 },
  ETH: { price: 3542.8, change24h: 1.87, volume: 14200000000 },
  BNB: { price: 598.4, change24h: -0.52, volume: 1850000000 },
  SOL: { price: 172.3, change24h: 4.21, volume: 3200000000 },
  XRP: { price: 0.5842, change24h: -1.23, volume: 1450000000 },
};

// ---------------------------------------------------------------------------
// Crypto provider (Binance)
// ---------------------------------------------------------------------------

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

function mockCryptoPrice(symbol: string): MarketPrice {
  const base = CRYPTO_MOCK[symbol] ?? { price: 100, change24h: 0, volume: 0 };
  // Dao động nhẹ ±0.5% để demo trông "sống"
  const jitter = 1 + (Math.random() - 0.5) * 0.01;
  return {
    symbol,
    name: CRYPTO_NAMES[symbol] ?? symbol,
    type: 'CRYPTO',
    price: base.price * jitter,
    change24h: base.change24h,
    volume24h: base.volume,
    source: 'mock',
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchCryptoPrices(symbols: string[]): Promise<MarketPrice[]> {
  const supported = symbols.filter((s) => CRYPTO_PAIRS[s]);
  if (supported.length === 0) return [];

  try {
    const pairs = supported.map((s) => CRYPTO_PAIRS[s]);
    const url = `${BINANCE_API}?symbols=${encodeURIComponent(JSON.stringify(pairs))}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);

    const tickers: BinanceTicker[] = await res.json();
    const bySymbol = new Map(tickers.map((t) => [t.symbol, t]));

    return supported.map((symbol) => {
      const ticker = bySymbol.get(CRYPTO_PAIRS[symbol]);
      if (!ticker) return mockCryptoPrice(symbol);
      return {
        symbol,
        name: CRYPTO_NAMES[symbol] ?? symbol,
        type: 'CRYPTO' as const,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.quoteVolume),
        source: 'live' as const,
        updatedAt: new Date().toISOString(),
      };
    });
  } catch {
    // Offline / bị chặn → fallback mock
    return supported.map(mockCryptoPrice);
  }
}

// ---------------------------------------------------------------------------
// Stock provider (thị trường VN)
// ---------------------------------------------------------------------------

/**
 * Interface cho nhà cung cấp giá cổ phiếu.
 * ĐỂ TÍCH HỢP DỮ LIỆU THẬT: implement interface này với
 * SSI FastConnect Data API, DNSE, hoặc proxy vnstock, ví dụ:
 *
 *   class SSIStockProvider implements StockProvider {
 *     async getPrices(symbols: string[]): Promise<MarketPrice[]> {
 *       // gọi https://fc-data.ssi.com.vn/... với consumer key/secret
 *     }
 *   }
 *
 * rồi gán `export const stockProvider = new SSIStockProvider();`
 */
export interface StockProvider {
  getPrices(symbols: string[]): Promise<MarketPrice[]>;
}

/** Giá tham chiếu thực tế (USD, quy đổi từ VND ~25.450đ/USD) */
const STOCK_MOCK: Record<string, { name: string; priceVnd: number; change24h: number }> = {
  VNM: { name: 'Vinamilk', priceVnd: 68800, change24h: 0.44 },
  FPT: { name: 'FPT Corporation', priceVnd: 122500, change24h: 1.24 },
  VIC: { name: 'Vingroup', priceVnd: 44650, change24h: -0.78 },
  HPG: { name: 'Hòa Phát Group', priceVnd: 28350, change24h: 0.89 },
};

const VND_USD = 25450;

class MockStockProvider implements StockProvider {
  async getPrices(symbols: string[]): Promise<MarketPrice[]> {
    return symbols
      .filter((s) => STOCK_MOCK[s])
      .map((symbol) => {
        const base = STOCK_MOCK[symbol];
        const jitter = 1 + (Math.random() - 0.5) * 0.004;
        return {
          symbol,
          name: base.name,
          type: 'STOCK' as const,
          price: (base.priceVnd / VND_USD) * jitter,
          priceVnd: base.priceVnd * jitter,
          change24h: base.change24h,
          volume24h: 0,
          source: 'mock' as const,
          updatedAt: new Date().toISOString(),
        };
      });
  }
}

export const stockProvider: StockProvider = new MockStockProvider();

// ---------------------------------------------------------------------------
// API hợp nhất + cache trong bộ nhớ (10 giây)
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 10_000;

interface CacheEntry {
  data: MarketPrice[];
  expiresAt: number;
}

const globalForCache = globalThis as unknown as {
  __marketCache?: Map<string, CacheEntry>;
};
const cache = (globalForCache.__marketCache ??= new Map<string, CacheEntry>());

export function isCryptoSymbol(symbol: string): boolean {
  return Boolean(CRYPTO_PAIRS[symbol]);
}

export function isStockSymbol(symbol: string): boolean {
  return Boolean(STOCK_MOCK[symbol]);
}

/**
 * Lấy giá cho danh sách symbol (crypto + cổ phiếu), có cache 10s phía server.
 */
export async function getMarketPrices(symbols: string[]): Promise<MarketPrice[]> {
  const normalized = Array.from(new Set(symbols.map((s) => s.toUpperCase().trim()))).sort();
  const key = normalized.join(',');

  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const cryptoSymbols = normalized.filter(isCryptoSymbol);
  const stockSymbols = normalized.filter(isStockSymbol);

  const [crypto, stocks] = await Promise.all([
    fetchCryptoPrices(cryptoSymbols),
    stockProvider.getPrices(stockSymbols),
  ]);

  const data = [...crypto, ...stocks];
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}
