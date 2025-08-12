import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema, insertInvestorSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get investment packages
  app.get("/api/investment-packages", async (req, res) => {
    try {
      const packages = await storage.getInvestmentPackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investment packages" });
    }
  });

  // Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.json({ success: true, message: "Tin nhắn đã được gửi thành công!" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      } else {
        res.status(500).json({ message: "Có lỗi xảy ra khi gửi tin nhắn" });
      }
    }
  });

  // Get investors
  app.get("/api/investors", async (req, res) => {
    try {
      const investors = await storage.getInvestors();
      res.json(investors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investors" });
    }
  });

  // Create new investor
  app.post("/api/investors", async (req, res) => {
    try {
      const validatedData = insertInvestorSchema.parse(req.body);
      const investor = await storage.createInvestor(validatedData);
      res.json({ success: true, investor });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      } else {
        res.status(500).json({ message: "Có lỗi xảy ra khi tạo thông tin nhà đầu tư" });
      }
    }
  });

  // Get Bitcoin price (mock data for now)
  app.get("/api/bitcoin-price", async (req, res) => {
    try {
      // Mock Bitcoin price data
      const mockData = {
        price: 43250.67,
        change24h: 2.45,
        high24h: 44120,
        low24h: 42890,
        volume: "28.5B",
        marketCap: "847B",
        aiPrediction: {
          price: 46800,
          confidence: 87,
          timeframe: "7 ngày"
        }
      };
      res.json(mockData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Bitcoin price" });
    }
  });

  // Real Bitcoin data from public APIs
  app.get("/api/bitcoin-real-data", async (req, res) => {
    try {
      // Try multiple public APIs for redundancy
      let bitcoinData = null;
      
      // Try CoinGecko first (free API, no key required)
      try {
        const coinGeckoResponse = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true'
        );
        if (coinGeckoResponse.ok) {
          const data = await coinGeckoResponse.json();
          const btc = data.bitcoin;
          
          bitcoinData = {
            price: btc.usd,
            change24h: btc.usd_24h_change || 0,
            high24h: btc.usd + (Math.abs(btc.usd_24h_change || 0) * btc.usd / 100),
            low24h: btc.usd - (Math.abs(btc.usd_24h_change || 0) * btc.usd / 100),
            volume24h: btc.usd_24h_vol || 0,
            marketCap: btc.usd_market_cap || 0,
            priceHistory: [] // Will be populated with historical data if needed
          };
        }
      } catch (error) {
        console.log("CoinGecko API failed, trying alternative:", (error as Error).message);
      }

      // Fallback to CoinCap API if CoinGecko fails
      if (!bitcoinData) {
        try {
          const coinCapResponse = await fetch('https://api.coincap.io/v2/assets/bitcoin');
          if (coinCapResponse.ok) {
            const data = await coinCapResponse.json();
            const btc = data.data;
            
            bitcoinData = {
              price: parseFloat(btc.priceUsd),
              change24h: parseFloat(btc.changePercent24Hr || 0),
              high24h: parseFloat(btc.priceUsd) * 1.02, // Estimate
              low24h: parseFloat(btc.priceUsd) * 0.98, // Estimate
              volume24h: parseFloat(btc.volumeUsd24Hr || 0),
              marketCap: parseFloat(btc.marketCapUsd || 0),
              priceHistory: []
            };
          }
        } catch (error) {
          console.log("CoinCap API failed:", (error as Error).message);
        }
      }

      // If all APIs fail, return an error message
      if (!bitcoinData) {
        return res.status(503).json({ 
          error: "Bitcoin data temporarily unavailable. Please check your internet connection or try again later." 
        });
      }
      
      res.json(bitcoinData);
    } catch (error) {
      console.error("Error fetching real Bitcoin data:", error);
      res.status(500).json({ error: "Failed to fetch Bitcoin data" });
    }
  });

  // Market Analysis endpoint
  app.get("/api/market-analysis", async (req, res) => {
    try {
      // This would normally use sophisticated analysis from financial APIs
      // For now, we'll provide basic analysis based on price movements
      
      // Get current Bitcoin data for analysis
      const bitcoinResponse = await fetch(`${req.protocol}://${req.get('host')}/api/bitcoin-real-data`);
      
      if (!bitcoinResponse.ok) {
        return res.status(503).json({ 
          error: "Market analysis unavailable due to data source issues" 
        });
      }
      
      const bitcoinData = await bitcoinResponse.json();
      
      // Simple analysis logic
      const trend = bitcoinData.change24h > 2 ? 'bullish' : 
                    bitcoinData.change24h < -2 ? 'bearish' : 'neutral';
      
      const support = bitcoinData.price * 0.95; // 5% below current price
      const resistance = bitcoinData.price * 1.05; // 5% above current price
      
      // Simulate RSI (would normally be calculated from historical data)
      const rsi = Math.max(30, Math.min(70, 50 + (bitcoinData.change24h * 2)));
      
      const sentiment = bitcoinData.change24h > 0 ? 'Tích cực' : 
                        bitcoinData.change24h < 0 ? 'Tiêu cực' : 'Trung tính';
      
      let recommendation = '';
      if (trend === 'bullish') {
        recommendation = 'Thị trường đang có xu hướng tích cực. Đây có thể là thời điểm tốt để xem xét đầu tư dài hạn.';
      } else if (trend === 'bearish') {
        recommendation = 'Thị trường đang điều chỉnh. Hãy thận trọng và đợi tín hiệu phục hồi rõ ràng hơn.';
      } else {
        recommendation = 'Thị trường đang trong giai đoạn ổn định. Hãy theo dõi thêm để xác định xu hướng tiếp theo.';
      }
      
      const analysis = {
        trend,
        support,
        resistance,
        recommendation,
        rsi,
        sentiment
      };
      
      res.json(analysis);
    } catch (error) {
      console.error("Error generating market analysis:", error);
      res.status(500).json({ error: "Failed to generate market analysis" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
