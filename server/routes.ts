import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactMessageSchema, 
  insertInvestorSchema, 
  insertCommunityMemberSchema,
  insertAuthUserSchema
} from "@shared/schema";
import { z } from "zod";
import { 
  authenticateToken, 
  requireAdmin, 
  generateToken, 
  verifyPassword, 
  type AuthRequest 
} from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          message: "Username và password là bắt buộc", 
          code: "MISSING_CREDENTIALS" 
        });
      }

      const user = await storage.getAuthUserByUsername(username);
      if (!user) {
        return res.status(401).json({ 
          message: "Tài khoản không tồn tại", 
          code: "USER_NOT_FOUND" 
        });
      }

      if (user.status !== 'active') {
        return res.status(401).json({ 
          message: "Tài khoản đã bị vô hiệu hóa", 
          code: "ACCOUNT_INACTIVE" 
        });
      }

      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: "Mật khẩu không chính xác", 
          code: "INVALID_PASSWORD" 
        });
      }

      // Update last login
      await storage.updateAuthUser(user.id, { lastLogin: new Date() });

      const token = generateToken(user);
      const { password: _, ...safeUser } = user;

      res.json({
        success: true,
        message: "Đăng nhập thành công!",
        token,
        user: safeUser
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        message: "Có lỗi xảy ra khi đăng nhập", 
        code: "LOGIN_ERROR" 
      });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertAuthUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getAuthUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ 
          message: "Tài khoản đã tồn tại", 
          code: "USER_EXISTS" 
        });
      }

      const user = await storage.createAuthUser(validatedData);
      const token = generateToken(user);
      const { password: _, ...safeUser } = user;

      res.json({
        success: true,
        message: "Đăng ký thành công!",
        token,
        user: safeUser
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Dữ liệu không hợp lệ", 
          code: "VALIDATION_ERROR",
          errors: error.errors 
        });
      } else {
        console.error("Register error:", error);
        res.status(500).json({ 
          message: "Có lỗi xảy ra khi đăng ký", 
          code: "REGISTER_ERROR" 
        });
      }
    }
  });

  app.get("/api/auth/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { password: _, ...safeUser } = req.user;
      res.json({ user: safeUser });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/auth/logout", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // In a real app, you might want to blacklist the token
      res.json({ success: true, message: "Đăng xuất thành công!" });
    } catch (error) {
      res.status(500).json({ message: "Logout error" });
    }
  });

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

  // Community Members API Routes
  app.get("/api/community-members", async (req, res) => {
    try {
      const members = await storage.getCommunityMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community members" });
    }
  });

  app.post("/api/community-members", async (req, res) => {
    try {
      const validatedData = insertCommunityMemberSchema.parse(req.body);
      const member = await storage.createCommunityMember(validatedData);
      res.json({ success: true, member });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      } else {
        res.status(500).json({ message: "Có lỗi xảy ra khi tạo thành viên mới" });
      }
    }
  });

  app.put("/api/community-members/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const member = await storage.updateCommunityMember(id, updates);
      
      if (!member) {
        return res.status(404).json({ message: "Không tìm thấy thành viên" });
      }
      
      res.json({ success: true, member });
    } catch (error) {
      res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật thành viên" });
    }
  });

  app.delete("/api/community-members/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCommunityMember(id);
      
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy thành viên" });
      }
      
      res.json({ success: true, message: "Thành viên đã được xóa thành công" });
    } catch (error) {
      res.status(500).json({ message: "Có lỗi xảy ra khi xóa thành viên" });
    }
  });

  // Auth Users Management Routes
  app.get("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAuthUsers();
      // Don't send passwords in the response
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertAuthUserSchema.parse(req.body);
      const user = await storage.createAuthUser(validatedData);
      const { password, ...safeUser } = user;
      res.json({ success: true, user: safeUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      } else {
        res.status(500).json({ message: "Có lỗi xảy ra khi tạo tài khoản" });
      }
    }
  });

  app.patch("/api/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const updates = req.body;
      
      // Remove empty password field to avoid updating with empty string
      if (updates.password === "") {
        delete updates.password;
      }
      
      const updatedUser = await storage.updateAuthUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "Không tìm thấy tài khoản" });
      }
      
      const { password, ...safeUser } = updatedUser;
      res.json({ success: true, user: safeUser });
    } catch (error) {
      res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật tài khoản" });
    }
  });

  app.delete("/api/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const success = await storage.deleteAuthUser(userId);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy tài khoản" });
      }
      res.json({ success: true, message: "Tài khoản đã được xóa" });
    } catch (error) {
      res.status(500).json({ message: "Có lỗi xảy ra khi xóa tài khoản" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
