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
import Stripe from "stripe";
import { insertPaymentTransactionSchema } from "@shared/schema";
import { log } from "./vite";
import { analyzeMarketWithAI, generateTradingRecommendation, analyzeSentiment } from "./ai-services";
import rateLimit from "express-rate-limit";

// Initialize Stripe with conditional validation (no crash if missing)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const INSTANCE_ID = `pid:${process.pid}`;
const stripeAvailable = !!stripeSecretKey && /^sk_(test|live)_/.test(stripeSecretKey);

log('=== STRIPE INITIALIZATION ===');
log(`STRIPE_SECRET_KEY available: ${!!stripeSecretKey}`);
log(`STRIPE_SECRET_KEY starts with: ${stripeSecretKey?.substring(0, 7)}`);
log(`STRIPE_SECRET_KEY length: ${stripeSecretKey?.length}`);
log(`Stripe service available: ${stripeAvailable}`);
log(`Instance ID: ${INSTANCE_ID}`);
log('=== END STRIPE INIT ===');

const stripe = stripeAvailable ? new Stripe(stripeSecretKey!, {
  apiVersion: "2025-08-27.basil", // Use latest API version
}) : null;

if (!stripeAvailable) {
  log('[WARNING] Stripe not configured - payment features will be disabled');
}

// Rate limiting configuration
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes per IP
  message: { error: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: 20, // 20 payment attempts per 15 minutes per IP
  message: { error: "Too many payment attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Idempotency storage for payment intents
const paymentIdempotencyCache = new Map<string, { 
  clientSecret: string; 
  transactionId: string; 
  createdAt: Date;
  amount: number;
  currency: string;
  packageName: string;
}>();

// Clean up old idempotency entries every hour
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [key, value] of paymentIdempotencyCache.entries()) {
    if (value.createdAt.getTime() < oneHourAgo) {
      paymentIdempotencyCache.delete(key);
    }
  }
}, 60 * 60 * 1000);

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes with rate limiting
  app.post("/api/auth/login", authRateLimit, async (req, res) => {
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

  // Rate limiting for AI endpoints
  const aiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: { error: "Too many AI requests from this IP, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // AI-Powered Market Analysis endpoint
  app.get("/api/market-analysis", aiRateLimit, async (req, res) => {
    try {
      log(`[AI][${INSTANCE_ID}] Market analysis request received`);
      
      // Get current Bitcoin data for AI analysis
      const bitcoinResponse = await fetch(`${req.protocol}://${req.get('host')}/api/bitcoin-real-data`);
      
      if (!bitcoinResponse.ok) {
        return res.status(503).json({ 
          error: "Market analysis unavailable due to data source issues" 
        });
      }
      
      const bitcoinData = await bitcoinResponse.json();
      log(`[AI][${INSTANCE_ID}] Bitcoin data retrieved for analysis`);
      
      // Use AI for market analysis
      const aiAnalysis = await analyzeMarketWithAI(bitcoinData);
      
      // Calculate technical indicators for additional context
      const support = bitcoinData.price * 0.95;
      const resistance = bitcoinData.price * 1.05;
      const rsi = Math.max(30, Math.min(70, 50 + (bitcoinData.change24h * 2)));
      
      const analysis = {
        // AI-powered insights
        trend: aiAnalysis.trend,
        sentiment: aiAnalysis.sentiment,
        recommendation: aiAnalysis.recommendation,
        confidenceScore: aiAnalysis.confidenceScore,
        keyFactors: aiAnalysis.keyFactors,
        riskLevel: aiAnalysis.riskLevel,
        priceTarget: aiAnalysis.priceTarget,
        
        // Technical indicators
        support,
        resistance,
        rsi,
        
        // Metadata
        analysisType: 'ai-powered',
        timestamp: new Date().toISOString()
      };
      
      log(`[AI][${INSTANCE_ID}] Market analysis completed: ${aiAnalysis.trend} trend with ${aiAnalysis.confidenceScore} confidence`);
      res.json(analysis);
      
    } catch (error) {
      log(`[AI][${INSTANCE_ID}] Market analysis error: ${error}`);
      
      // Fallback to basic analysis if AI fails
      try {
        const bitcoinResponse = await fetch(`${req.protocol}://${req.get('host')}/api/bitcoin-real-data`);
        const bitcoinData = await bitcoinResponse.json();
        
        const trend = bitcoinData.change24h > 2 ? 'bullish' : 
                      bitcoinData.change24h < -2 ? 'bearish' : 'neutral';
        
        const fallbackAnalysis = {
          trend,
          sentiment: bitcoinData.change24h > 0 ? 'Tích cực' : 'Tiêu cực',
          recommendation: 'Phân tích AI tạm thời không khả dụng. Vui lòng theo dõi thị trường và cân nhắc kỹ trước khi đầu tư.',
          confidenceScore: 0.3,
          keyFactors: ['Hệ thống AI tạm thời gián đoạn'],
          riskLevel: 'high',
          support: bitcoinData.price * 0.95,
          resistance: bitcoinData.price * 1.05,
          rsi: 50,
          analysisType: 'fallback',
          timestamp: new Date().toISOString()
        };
        
        res.json(fallbackAnalysis);
      } catch (fallbackError) {
        res.status(500).json({ error: "Failed to generate market analysis" });
      }
    }
  });

  // AI Trading Recommendations endpoint
  app.get("/api/trading-recommendations", aiRateLimit, authenticateToken, async (req: AuthRequest, res) => {
    try {
      log(`[AI][${INSTANCE_ID}] Trading recommendations request from user: ${req.user?.username}`);
      
      // Get current Bitcoin data
      const bitcoinResponse = await fetch(`${req.protocol}://${req.get('host')}/api/bitcoin-real-data`);
      
      if (!bitcoinResponse.ok) {
        return res.status(503).json({ 
          error: "Trading recommendations unavailable due to data source issues" 
        });
      }
      
      const bitcoinData = await bitcoinResponse.json();
      
      // Get user risk profile from query params (default: moderate)
      const riskProfile = (req.query.risk as string) || 'moderate';
      
      // Validate risk profile
      if (!['conservative', 'moderate', 'aggressive'].includes(riskProfile)) {
        return res.status(400).json({ error: "Invalid risk profile. Must be: conservative, moderate, or aggressive" });
      }
      
      // Generate AI trading recommendation
      const recommendation = await generateTradingRecommendation(bitcoinData, riskProfile as any);
      
      const response = {
        ...recommendation,
        bitcoinPrice: bitcoinData.price,
        change24h: bitcoinData.change24h,
        riskProfile,
        timestamp: new Date().toISOString()
      };
      
      log(`[AI][${INSTANCE_ID}] Trading recommendation: ${recommendation.action} with confidence ${recommendation.confidence}`);
      res.json(response);
      
    } catch (error) {
      log(`[AI][${INSTANCE_ID}] Trading recommendations error: ${error}`);
      res.status(500).json({ error: "Failed to generate trading recommendations" });
    }
  });

  // AI Sentiment Analysis endpoint
  app.post("/api/sentiment-analysis", aiRateLimit, authenticateToken, async (req: AuthRequest, res) => {
    try {
      log(`[AI][${INSTANCE_ID}] Sentiment analysis request from user: ${req.user?.username}`);
      
      // Validate request body with Zod
      const sentimentSchema = z.object({
        text: z.string().min(1, "Text cannot be empty").max(2000, "Text too long (max 2000 characters)")
      });
      
      const validatedData = sentimentSchema.parse(req.body);
      const { text } = validatedData;
      
      const sentimentResult = await analyzeSentiment(text);
      
      log(`[AI][${INSTANCE_ID}] Sentiment analysis completed: ${sentimentResult.rating}/5 stars`);
      res.json({
        ...sentimentResult,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      log(`[AI][${INSTANCE_ID}] Sentiment analysis error: ${error}`);
      res.status(500).json({ error: "Failed to analyze sentiment" });
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

  // Simple rate limiting for payment intents (basic abuse protection)
  const paymentAttempts = new Map<string, { count: number, resetTime: number }>();
  const PAYMENT_RATE_LIMIT = 10; // 10 attempts per minute
  const RATE_WINDOW = 60 * 1000; // 1 minute

  // Stripe Payment Routes with rate limiting and idempotency
  app.post("/api/create-payment-intent", paymentRateLimit, authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Check if Stripe is available
      if (!stripe) {
        log(`[PAYMENT][${INSTANCE_ID}] Stripe not available, checking environment...`);
        log(`[PAYMENT][${INSTANCE_ID}] NODE_ENV: ${process.env.NODE_ENV}`);
        log(`[PAYMENT][${INSTANCE_ID}] STRIPE_SECRET_KEY available: ${!!process.env.STRIPE_SECRET_KEY}`);
        log(`[PAYMENT][${INSTANCE_ID}] Stripe variable initialized: ${!!stripe}`);
        return res.status(503).json({ error: "Payment service temporarily unavailable - Stripe not configured" });
      }

      // Add instance tracking header
      res.setHeader('X-Instance-ID', INSTANCE_ID);
      log(`[PAYMENT][${INSTANCE_ID}] POST /api/create-payment-intent - Request received`);
      
      // Basic rate limiting by IP
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();
      const attempts = paymentAttempts.get(clientIp) || { count: 0, resetTime: now + RATE_WINDOW };
      
      if (now > attempts.resetTime) {
        attempts.count = 0;
        attempts.resetTime = now + RATE_WINDOW;
      }
      
      if (attempts.count >= PAYMENT_RATE_LIMIT) {
        log(`[PAYMENT][${INSTANCE_ID}] Rate limit exceeded for IP: ${clientIp}`);
        return res.status(429).json({ error: "Too many payment attempts. Please wait a minute." });
      }
      
      attempts.count++;
      paymentAttempts.set(clientIp, attempts);
      log(`[PAYMENT][${INSTANCE_ID}] Starting payment intent creation`);
      log(`[PAYMENT][${INSTANCE_ID}] Auth header: ${req.headers.authorization ? 'Present' : 'Missing'}`);
      log(`[PAYMENT][${INSTANCE_ID}] Body: ${JSON.stringify(req.body, null, 2)}`);
      
      // User is already authenticated by middleware
      if (!req.user?.id) {
        return res.status(401).json({ error: "Authentication required for payment creation" });
      }
      
      log(`[PAYMENT][${INSTANCE_ID}] Authenticated user: ${req.user.username}`);

      // Check for idempotency key in headers  
      const idempotencyKey = req.headers['idempotency-key'] as string;
      if (idempotencyKey) {
        const existing = paymentIdempotencyCache.get(idempotencyKey);
        if (existing) {
          log(`[PAYMENT][${INSTANCE_ID}] Returning cached payment intent for idempotency key: ${idempotencyKey}`);
          return res.json({
            clientSecret: existing.clientSecret,
            transactionId: existing.transactionId,
            amount: existing.amount,
            currency: existing.currency,
            packageName: existing.packageName,
            cached: true
          });
        }
      }

      // Validate request body with Zod
      const paymentSchema = z.object({
        packageId: z.string().min(1, "Package ID is required"),
        amount: z.number().min(1, "Amount must be greater than 0"),
        currency: z.string().optional().default("vnd")
      });
      
      let validatedData;
      try {
        validatedData = paymentSchema.parse(req.body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ 
            message: "Invalid request data", 
            errors: error.errors 
          });
        }
        throw error;
      }
      
      const { packageId, amount, currency } = validatedData;

      // Get investment package details
      const packages = await storage.getInvestmentPackages();
      const selectedPackage = packages.find(p => p.id === packageId);
      
      if (!selectedPackage) {
        return res.status(404).json({ message: "Investment package not found" });
      }
      
      // Validate minimum investment amount
      const minInvestment = parseFloat(selectedPackage.minInvestment);
      if (amount < minInvestment) {
        return res.status(400).json({ 
          message: `Minimum investment for ${selectedPackage.name} is ${minInvestment.toLocaleString()} VND`,
          minInvestment: minInvestment
        });
      }

      // Create Stripe customer if needed
      let customerId = null;
      try {
        const customers = await stripe.customers.list({
          email: req.user?.email || undefined,
          limit: 1
        });
        
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        } else {
          const customer = await stripe.customers.create({
            email: req.user.email || undefined,
            name: req.user.fullName || 'User',
            metadata: {
              userId: req.user.id,
              username: req.user.username
            }
          });
          customerId = customer.id;
        }
      } catch (stripeError) {
        console.error("Stripe customer error:", stripeError);
      }

      // Handle zero-decimal currencies properly
      const zeroDecimalCurrencies = new Set(["bif","clp","djf","gnf","jpy","kmf","krw","mga","pyg","rwf","ugx","vnd","vuv","xaf","xof","xpf"]);
      const isZeroDecimal = zeroDecimalCurrencies.has(currency.toLowerCase());
      const amountForStripe = isZeroDecimal ? Math.round(amount) : Math.round(amount * 100);
      
      // Create payment intent
      log(`[PAYMENT][${INSTANCE_ID}] Creating Stripe payment intent...`);
      log(`[PAYMENT][${INSTANCE_ID}] Amount (${currency.toUpperCase()} ${isZeroDecimal ? 'units' : 'cents'}): ${amountForStripe}`);
      log(`[PAYMENT][${INSTANCE_ID}] Currency: ${currency.toLowerCase()}`);
      log(`[PAYMENT][${INSTANCE_ID}] Zero-decimal currency: ${isZeroDecimal}`);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountForStripe,
        currency: currency.toLowerCase(),
        customer: customerId || undefined,
        metadata: {
          userId: req.user.id,
          packageId: packageId,
          packageName: selectedPackage.name
        },
        description: `HHDcoin Investment - ${selectedPackage.name}`,
      });
      
      log(`[PAYMENT][${INSTANCE_ID}] Payment intent created successfully: ${paymentIntent.id}`);

      // Create payment transaction record
      const transaction = await storage.createPaymentTransaction({
        userId: req.user.id,
        packageId: packageId,
        amount: amount.toString(),
        currency: currency.toUpperCase(),
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: customerId,
        status: "pending",
        paymentMethod: "stripe",
        metadata: JSON.stringify({
          packageName: selectedPackage.name,
          customerEmail: req.user.email || "user@hhdcoin.net"
        })
      });

      // Cache for idempotency if key provided
      if (idempotencyKey) {
        paymentIdempotencyCache.set(idempotencyKey, {
          clientSecret: paymentIntent.client_secret!,
          transactionId: transaction.id,
          createdAt: new Date(),
          amount: amount,
          currency: currency,
          packageName: selectedPackage.name
        });
      }

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        transactionId: transaction.id,
        amount: amount,
        currency: currency,
        packageName: selectedPackage.name
      });
    } catch (error: any) {
      console.error("[PAYMENT] Payment intent creation error:", error);
      console.error("[PAYMENT] Error details:", JSON.stringify(error, null, 2));
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Enhanced Stripe webhook with signature verification
  app.post("/api/stripe-webhook", async (req, res) => {
    try {
      // Check if Stripe is available
      if (!stripe) {
        log(`[WEBHOOK][${INSTANCE_ID}] Stripe not configured - webhook disabled`);
        return res.status(503).json({ error: "Webhook service unavailable - Stripe not configured" });
      }

      const sig = req.headers['stripe-signature'] as string;
      let event;

      try {
        // Verify webhook signature for security
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (endpointSecret && sig) {
          event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
          log(`[WEBHOOK][${INSTANCE_ID}] Verified webhook signature`);
        } else {
          // For development, accept unverified webhooks but log warning
          log(`[WEBHOOK][${INSTANCE_ID}] WARNING: Webhook signature not verified (dev mode)`);
          event = req.body;
        }
      } catch (err: any) {
        log(`[WEBHOOK][${INSTANCE_ID}] Signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
      }

      log(`[WEBHOOK][${INSTANCE_ID}] Processing event: ${event.type} (${event.id})`);

      // Handle the event with idempotency
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          log(`[WEBHOOK][${INSTANCE_ID}] Payment succeeded: ${paymentIntent.id}`);
          
          // Find the transaction with idempotency check
          const transactions = await storage.getPaymentTransactions();
          const transaction = transactions.find(t => t.stripePaymentIntentId === paymentIntent.id);
          
          if (!transaction) {
            log(`[WEBHOOK][${INSTANCE_ID}] Transaction not found for payment intent: ${paymentIntent.id}`);
            return res.json({ received: true, error: "Transaction not found" });
          }

          // Check if already processed (idempotency)
          if (transaction.status === "completed") {
            log(`[WEBHOOK][${INSTANCE_ID}] Payment already processed: ${paymentIntent.id}`);
            return res.json({ received: true, message: "Already processed" });
          }
          
          // Update transaction to completed
          await storage.updatePaymentTransaction(transaction.id, {
            status: "completed",
            metadata: JSON.stringify({
              ...JSON.parse(transaction.metadata || "{}"),
              webhookProcessedAt: new Date().toISOString(),
              eventId: event.id
            })
          });
          
          // Create user investment record
          const packages = await storage.getInvestmentPackages();
          const selectedPackage = packages.find(p => p.id === transaction.packageId);
          
          if (selectedPackage) {
            // Check if user investment already exists (idempotency)
            const existingInvestments = await storage.getUserInvestmentsByUserId(transaction.userId);
            const existingInvestment = existingInvestments.find(inv => inv.transactionId === transaction.id);
            
            if (!existingInvestment) {
              const investment = await storage.createUserInvestment({
                userId: transaction.userId,
                packageId: transaction.packageId,
                transactionId: transaction.id,
                investmentAmount: transaction.amount,
                bitcoinCode: `BTC${Date.now()}-${transaction.userId.substring(0, 8)}`,
                status: "active",
                metadata: JSON.stringify({
                  createdFromWebhook: true,
                  eventId: event.id,
                  packageName: selectedPackage.name
                })
              });
              
              log(`[WEBHOOK][${INSTANCE_ID}] Created user investment ${investment.id} for user: ${transaction.userId}`);
            } else {
              log(`[WEBHOOK][${INSTANCE_ID}] User investment already exists for transaction: ${transaction.id}`);
            }
          } else {
            log(`[WEBHOOK][${INSTANCE_ID}] Package not found: ${transaction.packageId}`);
          }
          break;
        
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          log(`[WEBHOOK][${INSTANCE_ID}] Payment failed: ${failedPayment.id}`);
          
          const failedTransactions = await storage.getPaymentTransactions();
          const failedTransaction = failedTransactions.find(t => t.stripePaymentIntentId === failedPayment.id);
          
          if (failedTransaction && failedTransaction.status !== "failed") {
            await storage.updatePaymentTransaction(failedTransaction.id, {
              status: "failed",
              metadata: JSON.stringify({
                ...JSON.parse(failedTransaction.metadata || "{}"),
                webhookProcessedAt: new Date().toISOString(),
                eventId: event.id,
                failureReason: failedPayment.last_payment_error?.message || "Unknown error"
              })
            });
          }
          break;

        default:
          log(`[WEBHOOK][${INSTANCE_ID}] Unhandled event type: ${event.type}`);
      }

      // Always return success to Stripe
      res.json({ received: true, eventId: event.id });
      
    } catch (error: any) {
      log(`[WEBHOOK][${INSTANCE_ID}] Webhook processing error: ${error.message}`);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Get user's payment transactions
  app.get("/api/payment-transactions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (!req.user?.id) {
        return res.status(401).json({ error: "Authentication required to view transactions" });
      }
      
      const transactions = await storage.getPaymentTransactionsByUserId(req.user.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment transactions" });
    }
  });

  // Get all payment transactions (admin only)
  app.get("/api/admin/payment-transactions", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const transactions = await storage.getPaymentTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment transactions" });
    }
  });

  // User Investment endpoints
  
  // Get user's investments
  app.get("/api/user-investments", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Authentication required to view investments" });
      }
      
      const investments = await storage.getUserInvestmentsByUserId(req.user.id);
      
      // Enrich investments with package details
      const packages = await storage.getInvestmentPackages();
      const enrichedInvestments = investments.map(investment => {
        const packageInfo = packages.find(p => p.id === investment.packageId);
        return {
          ...investment,
          package: packageInfo
        };
      });
      
      res.json(enrichedInvestments);
    } catch (error) {
      log(`[API][${INSTANCE_ID}] Error fetching user investments: ${error}`);
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  // Get specific user investment
  app.get("/api/user-investments/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const investment = await storage.getUserInvestment(req.params.id);
      
      if (!investment) {
        return res.status(404).json({ error: "Investment not found" });
      }
      
      // Check if investment belongs to the user
      if (investment.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Enrich with package details
      const packages = await storage.getInvestmentPackages();
      const packageInfo = packages.find(p => p.id === investment.packageId);
      
      res.json({
        ...investment,
        package: packageInfo
      });
    } catch (error) {
      log(`[API][${INSTANCE_ID}] Error fetching user investment: ${error}`);
      res.status(500).json({ message: "Failed to fetch investment" });
    }
  });

  // Update user investment (for profit/loss calculation)
  app.patch("/api/user-investments/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const investment = await storage.getUserInvestment(req.params.id);
      
      if (!investment) {
        return res.status(404).json({ error: "Investment not found" });
      }
      
      // Check if investment belongs to the user or user is admin
      if (investment.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const { currentValue, profitLoss, profitLossPercentage, status } = req.body;
      
      const updatedInvestment = await storage.updateUserInvestment(req.params.id, {
        currentValue,
        profitLoss,
        profitLossPercentage,
        status
      });
      
      if (!updatedInvestment) {
        return res.status(404).json({ error: "Failed to update investment" });
      }
      
      res.json(updatedInvestment);
    } catch (error) {
      log(`[API][${INSTANCE_ID}] Error updating user investment: ${error}`);
      res.status(500).json({ message: "Failed to update investment" });
    }
  });

  // Get all user investments (admin only)
  app.get("/api/admin/user-investments", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const investments = await storage.getUserInvestments();
      
      // Enrich investments with user and package details
      const authUsers = await storage.getAuthUsers();
      const packages = await storage.getInvestmentPackages();
      
      const enrichedInvestments = investments.map(investment => {
        const user = authUsers.find(u => u.id === investment.userId);
        const packageInfo = packages.find(p => p.id === investment.packageId);
        return {
          ...investment,
          user: user ? { id: user.id, username: user.username, fullName: user.fullName, email: user.email } : null,
          package: packageInfo
        };
      });
      
      res.json(enrichedInvestments);
    } catch (error) {
      log(`[API][${INSTANCE_ID}] Error fetching all user investments: ${error}`);
      res.status(500).json({ message: "Failed to fetch user investments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
