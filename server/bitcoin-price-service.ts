// Bitcoin Price Provider Service with caching and fallback
import { log } from "./vite";

interface BitcoinPriceData {
  price: number;
  change24h: number;
  timestamp: Date;
  source: string;
}

interface PriceCache {
  data: BitcoinPriceData | null;
  lastUpdated: number;
  isUpdating: boolean;
}

class BitcoinPriceService {
  private cache: PriceCache = {
    data: null,
    lastUpdated: 0,
    isUpdating: false
  };
  
  private readonly CACHE_DURATION = 60 * 1000; // 60 seconds
  private readonly API_TIMEOUT = 10000; // 10 seconds

  // CoinGecko API (free tier: 10-30 calls/minute)
  private async fetchFromCoinGecko(): Promise<BitcoinPriceData> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
        { 
          signal: controller.signal,
          headers: {
            'User-Agent': 'HHDcoin-Investment-Platform/1.0'
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const bitcoin = data.bitcoin;
      
      if (!bitcoin || typeof bitcoin.usd !== 'number') {
        throw new Error('Invalid CoinGecko response format');
      }

      return {
        price: Math.round(bitcoin.usd * 100) / 100, // Round to 2 decimal places
        change24h: Math.round((bitcoin.usd_24h_change || 0) * 100) / 100,
        timestamp: new Date(),
        source: 'coingecko'
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`CoinGecko API timeout after ${this.API_TIMEOUT}ms`);
      }
      throw error;
    }
  }

  // Binance API (backup provider)
  private async fetchFromBinance(): Promise<BitcoinPriceData> {
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const timeoutId1 = setTimeout(() => controller1.abort(), this.API_TIMEOUT);
    const timeoutId2 = setTimeout(() => controller2.abort(), this.API_TIMEOUT);

    try {
      const [tickerResponse, priceResponse] = await Promise.all([
        fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT', { 
          signal: controller1.signal 
        }),
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', { 
          signal: controller2.signal 
        })
      ]);

      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);

      if (!tickerResponse.ok || !priceResponse.ok) {
        throw new Error(`Binance API error: ${tickerResponse.status} / ${priceResponse.status}`);
      }

      const [tickerData, priceData] = await Promise.all([
        tickerResponse.json(),
        priceResponse.json()
      ]);

      const price = parseFloat(priceData.price);
      const change24h = parseFloat(tickerData.priceChangePercent);

      if (isNaN(price) || isNaN(change24h)) {
        throw new Error('Invalid Binance response format');
      }

      return {
        price: Math.round(price * 100) / 100,
        change24h: Math.round(change24h * 100) / 100,
        timestamp: new Date(),
        source: 'binance'
      };
    } catch (error) {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Binance API timeout after ${this.API_TIMEOUT}ms`);
      }
      throw error;
    }
  }

  // Mock fallback for development/testing
  private getMockPrice(): BitcoinPriceData {
    // Generate realistic mock data with slight variations
    const basePrice = 45000;
    const variation = (Math.random() - 0.5) * 2000; // ±$1000 variation
    const price = basePrice + variation;
    const change24h = (Math.random() - 0.5) * 10; // ±5% change

    return {
      price: Math.round(price * 100) / 100,
      change24h: Math.round(change24h * 100) / 100,
      timestamp: new Date(),
      source: 'mock'
    };
  }

  // Get current Bitcoin price with caching
  async getCurrentPrice(forceFresh: boolean = false): Promise<BitcoinPriceData> {
    const now = Date.now();
    
    // Return cached data if valid and not forcing fresh
    if (!forceFresh && 
        this.cache.data && 
        (now - this.cache.lastUpdated) < this.CACHE_DURATION) {
      log(`[BitcoinPriceService] Returning cached price: $${this.cache.data.price}`);
      return this.cache.data;
    }

    // Prevent concurrent updates
    if (this.cache.isUpdating) {
      // Wait for ongoing update or return stale data
      let attempts = 0;
      while (this.cache.isUpdating && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (this.cache.data) {
        return this.cache.data;
      }
    }

    this.cache.isUpdating = true;
    
    try {
      let priceData: BitcoinPriceData;
      
      // Try primary provider (CoinGecko) first
      try {
        priceData = await this.fetchFromCoinGecko();
        log(`[BitcoinPriceService] Fetched from CoinGecko: $${priceData.price}`);
      } catch (error: any) {
        log(`[BitcoinPriceService] CoinGecko failed: ${error.message}`);
        
        // Fallback to Binance
        try {
          priceData = await this.fetchFromBinance();
          log(`[BitcoinPriceService] Fetched from Binance: $${priceData.price}`);
        } catch (binanceError: any) {
          log(`[BitcoinPriceService] Binance failed: ${binanceError.message}`);
          
          // Use mock data as last resort
          priceData = this.getMockPrice();
          log(`[BitcoinPriceService] Using mock data: $${priceData.price}`);
        }
      }

      // Update cache
      this.cache = {
        data: priceData,
        lastUpdated: now,
        isUpdating: false
      };

      return priceData;
      
    } catch (error: any) {
      this.cache.isUpdating = false;
      
      // Return stale data if available, otherwise mock
      if (this.cache.data) {
        log(`[BitcoinPriceService] Error fetching price, returning stale data: ${error.message}`);
        return this.cache.data;
      }
      
      log(`[BitcoinPriceService] All sources failed, using mock data: ${error.message}`);
      return this.getMockPrice();
    }
  }

  // Get price history for charts (simplified implementation)
  async getPriceHistory(hours: number = 24): Promise<Array<{time: Date, price: number}>> {
    // For now, generate mock historical data
    // In production, you'd store/fetch real historical data
    const data: Array<{time: Date, price: number}> = [];
    const currentPrice = await this.getCurrentPrice();
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
      const variance = (Math.random() - 0.5) * 0.05; // ±2.5% variance
      const price = currentPrice.price * (1 + variance);
      
      data.push({
        time,
        price: Math.round(price * 100) / 100
      });
    }
    
    return data;
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.cache = {
      data: null,
      lastUpdated: 0,
      isUpdating: false
    };
  }
}

// Singleton instance
export const bitcoinPriceService = new BitcoinPriceService();