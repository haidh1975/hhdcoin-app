import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService } from "./email-service";
import { marketDataService } from "./market-data-service";
import { getMarketStats } from "./market-stats-service";
import { getVnEconomy } from "./vn-economy-service";
import { getOrcidProfile } from "./orcid-service";
import { generateOnce, aiProvidersConfigured } from "./ai-router";
import { 
  insertContactMessageSchema, 
  insertInvestorSchema, 
  insertCommunityMemberSchema,
  insertAuthUserSchema
} from "@shared/schema";
import { z } from "zod";

// Backup API validation schemas
const createBackupSchema = z.object({
  includeDatabase: z.boolean().optional().default(true),
  includeWebFiles: z.boolean().optional().default(true),
  includeUserUploads: z.boolean().optional().default(true),
  filename: z.string().regex(/^[a-zA-Z0-9_-]+$/, "Filename must contain only letters, numbers, hyphens, and underscores").optional()
});

const backupListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10)
});

const backupCleanupSchema = z.object({
  keepCount: z.coerce.number().int().min(1).max(50).optional().default(5)
});
import { 
  authenticateToken, 
  requireAdmin, 
  requireManager,
  requireInvestor,
  canAccessUserData,
  canManagerAccessInvestor,
  generateToken, 
  verifyPassword, 
  type AuthRequest 
} from "./auth";
import Stripe from "stripe";
import { insertPaymentTransactionSchema } from "@shared/schema";
import { log } from "./vite";
import { analyzeMarketWithAI, generateTradingRecommendation, analyzeSentiment } from "./ai-services";
import { chatWithAI, type ChatMessage } from "./chat-service";
import { bitcoinPriceService } from "./bitcoin-price-service";
import { googleDriveService } from "./google-drive-service";
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
  paymentIdempotencyCache.forEach((value, key) => {
    if (value.createdAt.getTime() < oneHourAgo) {
      paymentIdempotencyCache.delete(key);
    }
  });
}, 60 * 60 * 1000);

export async function registerRoutes(app: Express): Promise<Server> {
  // Raw body parsing for webhooks already configured in server/index.ts
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

      // Gửi email chào mừng (non-blocking)
      if (user.email) {
        emailService.sendWelcomeEmail({
          to: user.email,
          fullName: user.fullName,
          username: user.username,
        }).catch(() => {}); // không để lỗi email ảnh hưởng response
      }

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

      // Email xác nhận cho người gửi (non-blocking)
      if (validatedData.email) {
        emailService.sendContactConfirmationEmail({
          to: validatedData.email,
          name: validatedData.name,
          subject: validatedData.subject,
          message: validatedData.message,
        }).catch(() => {});
      }

      res.json({ success: true, message: "Tin nhắn đã được gửi thành công!" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      } else {
        res.status(500).json({ message: "Có lỗi xảy ra khi gửi tin nhắn" });
      }
    }
  });

  // Get investors - SECURED: Only admin/manager can access
  app.get("/api/investors", authenticateToken, requireManager, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      let investors;
      if (req.user.role === 'admin') {
        // Admin can see all investors
        investors = await storage.getInvestors();
      } else if (req.user.role === 'manager') {
        // Manager can only see their assigned investors  
        investors = await storage.getInvestorsByManagerId(req.user.id);
      } else {
        return res.status(403).json({ message: "Insufficient permissions to view investors" });
      }

      res.json(investors);
    } catch (error) {
      console.error("Error fetching investors:", error);
      res.status(500).json({ message: "Failed to fetch investors" });
    }
  });

  // Create new investor - SECURED: Only admin/manager can create
  app.post("/api/investors", authenticateToken, requireManager, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const validatedData = insertInvestorSchema.parse(req.body);
      const investor = await storage.createInvestor(validatedData);
      
      res.json({ 
        success: true, 
        investor,
        message: "Thông tin nhà đầu tư đã được tạo thành công"
      });
    } catch (error) {
      console.error("Error creating investor:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      } else {
        res.status(500).json({ message: "Có lỗi xảy ra khi tạo thông tin nhà đầu tư" });
      }
    }
  });

  // Update investor - SECURITY FIXED: Proper manager-investor assignment validation
  app.put("/api/investors/:id", authenticateToken, requireManager, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const investorId = req.params.id;
      const updates = req.body;
      
      // SECURITY CRITICAL: Validate manager-investor assignment before allowing update
      if (req.user.role === 'manager') {
        const hasAccess = await canManagerAccessInvestor(req.user.id, investorId);
        if (!hasAccess) {
          console.error(`[SECURITY] Manager ${req.user.id} attempted unauthorized access to investor ${investorId}`);
          return res.status(403).json({ 
            message: "Bạn không có quyền truy cập thông tin nhà đầu tư này",
            code: "UNAUTHORIZED_INVESTOR_ACCESS"
          });
        }
      }
      
      // Validate updates with partial schema
      const updatedInvestor = await storage.updateInvestor(investorId, updates);
      
      if (!updatedInvestor) {
        return res.status(404).json({ message: "Không tìm thấy nhà đầu tư" });
      }
      
      res.json({ 
        success: true, 
        investor: updatedInvestor,
        message: "Thông tin nhà đầu tư đã được cập nhật"
      });
    } catch (error) {
      console.error("Error updating investor:", error);
      res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật thông tin nhà đầu tư" });
    }
  });

  // Get single investor - SECURITY FIXED: Proper manager-investor assignment validation  
  app.get("/api/investors/:id", authenticateToken, requireManager, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const investorId = req.params.id;

      // SECURITY CRITICAL: Validate manager-investor assignment before allowing access
      if (req.user.role === 'manager') {
        const hasAccess = await canManagerAccessInvestor(req.user.id, investorId);
        if (!hasAccess) {
          console.error(`[SECURITY] Manager ${req.user.id} attempted unauthorized access to investor ${investorId}`);
          return res.status(403).json({ 
            message: "Bạn không có quyền truy cập thông tin nhà đầu tư này",
            code: "UNAUTHORIZED_INVESTOR_ACCESS"
          });
        }
      }

      // For admin users, allow access to all investors
      const investors = await storage.getInvestors();
      const investor = investors.find(inv => inv.id === investorId);
      
      if (!investor) {
        return res.status(404).json({ message: "Không tìm thấy nhà đầu tư" });
      }
      
      res.json(investor);
    } catch (error) {
      console.error("Error fetching investor:", error);
      res.status(500).json({ message: "Có lỗi xảy ra khi tìm thông tin nhà đầu tư" });
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
      const forceFresh = req.query.force === 'true';
      const priceData = await bitcoinPriceService.getCurrentPrice(forceFresh);
      
      // Transform to existing API format
      const bitcoinData = {
        price: priceData.price,
        change24h: priceData.change24h,
        high24h: priceData.price * 1.02, // Estimate ±2%
        low24h: priceData.price * 0.98,  // Estimate ±2%
        volume24h: 0, // Not available in simplified service
        marketCap: 0, // Not available in simplified service
        priceHistory: await bitcoinPriceService.getPriceHistory(24),
        timestamp: priceData.timestamp,
        source: priceData.source
      };
      
      res.json(bitcoinData);
    } catch (error: any) {
      log(`[API][${INSTANCE_ID}] Error fetching Bitcoin data: ${error.message}`);
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

  // HHD AI Assistant — chatbot công khai (rate-limited)
  app.post("/api/chat", aiRateLimit, async (req, res) => {
    try {
      const raw = Array.isArray(req.body?.messages) ? req.body.messages : [];
      // Lọc & giới hạn: chỉ role user/assistant, tối đa 12 lượt gần nhất, mỗi tin ≤ 2000 ký tự
      const messages: ChatMessage[] = raw
        .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
        .slice(-12)
        .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

      if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
        return res.status(400).json({ error: "Cần ít nhất một tin nhắn từ người dùng." });
      }

      let liveBtc: string | undefined;
      try {
        const p = await bitcoinPriceService.getCurrentPrice(false);
        liveBtc = `$${p.price.toLocaleString("en-US")} (${p.change24h >= 0 ? "+" : ""}${p.change24h.toFixed(2)}% 24h)`;
      } catch { /* bỏ qua nếu lỗi giá */ }

      const result = await chatWithAI(messages, liveBtc);
      res.json({ reply: result.reply });
    } catch (err: any) {
      log(`[Chat] route error: ${err.message}`);
      res.status(500).json({ error: "Lỗi trợ lý AI" });
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

  app.post("/api/users", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertAuthUserSchema.parse(req.body);
      const user = await storage.createAuthUser(validatedData);
      const { password, ...safeUser } = user;

      await storage.createAuditLog({
        actorId: req.user!.id,
        actorUsername: req.user!.username,
        actorRole: req.user!.role,
        action: 'user.create',
        entityType: 'user',
        entityId: user.id,
        details: JSON.stringify({ username: user.username, role: user.role }),
        ipAddress: req.ip,
      });

      res.json({ success: true, user: safeUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      } else {
        res.status(500).json({ message: "Có lỗi xảy ra khi tạo tài khoản" });
      }
    }
  });

  app.patch("/api/users/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
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

      await storage.createAuditLog({
        actorId: req.user!.id,
        actorUsername: req.user!.username,
        actorRole: req.user!.role,
        action: 'user.update',
        entityType: 'user',
        entityId: userId,
        details: JSON.stringify({
          fields: Object.keys(updates).filter(k => k !== 'password'),
          passwordChanged: 'password' in updates,
        }),
        ipAddress: req.ip,
      });

      const { password, ...safeUser } = updatedUser;
      res.json({ success: true, user: safeUser });
    } catch (error) {
      res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật tài khoản" });
    }
  });

  app.delete("/api/users/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.params.id;
      const targetUser = await storage.getAuthUser(userId);
      const success = await storage.deleteAuthUser(userId);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy tài khoản" });
      }

      await storage.createAuditLog({
        actorId: req.user!.id,
        actorUsername: req.user!.username,
        actorRole: req.user!.role,
        action: 'user.delete',
        entityType: 'user',
        entityId: userId,
        details: JSON.stringify({ deletedUsername: targetUser?.username, deletedRole: targetUser?.role }),
        ipAddress: req.ip,
      });

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
        const isProduction = process.env.NODE_ENV === 'production';
        
        if (endpointSecret && sig) {
          event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
          log(`[WEBHOOK][${INSTANCE_ID}] Verified webhook signature`);
        } else if (isProduction) {
          // CRITICAL: In production, REQUIRE signature verification
          log(`[WEBHOOK][${INSTANCE_ID}] REJECTED: Webhook signature verification required in production`);
          return res.status(400).send("Webhook signature verification required in production");
        } else {
          // For development only, accept unverified webhooks but log warning
          log(`[WEBHOOK][${INSTANCE_ID}] WARNING: Webhook signature not verified (dev mode only)`);
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
          
          // Indexed lookup — không quét cả bảng (quan trọng khi data lớn)
          const transaction = await storage.getPaymentTransactionByIntentId(paymentIntent.id);
          
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
              // Get current Bitcoin price for entry price tracking
              const currentPriceData = await bitcoinPriceService.getCurrentPrice(false);
              const entryPrice = currentPriceData.price;
              
              const investment = await storage.createUserInvestment({
                userId: transaction.userId,
                packageId: transaction.packageId,
                transactionId: transaction.id,
                investmentAmount: transaction.amount,
                entryPrice: entryPrice.toFixed(2),
                bitcoinCode: `BTC${Date.now()}-${transaction.userId.substring(0, 8)}`,
                status: "active",
                metadata: JSON.stringify({
                  createdFromWebhook: true,
                  eventId: event.id,
                  packageName: selectedPackage.name,
                  entryBitcoinPrice: entryPrice
                })
              });
              
              log(`[WEBHOOK][${INSTANCE_ID}] Created user investment ${investment.id} for user: ${transaction.userId}`);

              // Email xác nhận thanh toán (non-blocking)
              const txUser = await storage.getAuthUser(transaction.userId);
              if (txUser?.email) {
                emailService.sendPaymentConfirmationEmail({
                  to: txUser.email,
                  fullName: txUser.fullName,
                  packageName: selectedPackage.name,
                  amount: parseFloat(transaction.amount),
                  currency: transaction.currency,
                  transactionId: transaction.id,
                  paymentDate: new Date(),
                }).catch(() => {});
              }
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
          
          const failedTransaction = await storage.getPaymentTransactionByIntentId(failedPayment.id);
          
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

  // ===== P&L CALCULATION & INVESTOR MANAGEMENT ENDPOINTS =====
  
  // Profit/Loss calculation function
  const calculateProfitLoss = (investmentAmount: number, initialBitcoinPrice: number, currentBitcoinPrice: number) => {
    const bitcoinHoldings = investmentAmount / initialBitcoinPrice;
    const currentValue = bitcoinHoldings * currentBitcoinPrice;
    const profitLoss = currentValue - investmentAmount;
    const profitLossPercentage = (profitLoss / investmentAmount) * 100;
    
    return {
      currentValue: Math.round(currentValue * 100) / 100,
      profitLoss: Math.round(profitLoss * 100) / 100,
      profitLossPercentage: Math.round(profitLossPercentage * 100) / 100,
      bitcoinHoldings: Math.round(bitcoinHoldings * 100000000) / 100000000 // 8 decimal places
    };
  };

  // Get all investors (Admin only)
  app.get("/api/admin/investors", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const investors = await storage.getAllInvestorsForAdmin();
      res.json(investors);
    } catch (error: any) {
      log(`[API][${INSTANCE_ID}] Error fetching investors: ${error.message}`);
      res.status(500).json({ message: "Error fetching investors: " + error.message });
    }
  });

  // Get investors by manager (Manager role)
  app.get("/api/manager/investors", authenticateToken, requireManager, async (req: AuthRequest, res) => {
    try {
      const investors = await storage.getInvestorsByManagerId(req.user!.id);
      res.json(investors);
    } catch (error: any) {
      log(`[API][${INSTANCE_ID}] Error fetching managed investors: ${error.message}`);
      res.status(500).json({ message: "Error fetching managed investors: " + error.message });
    }
  });

  // Get investor performance report
  app.get("/api/investor/:userId/performance", authenticateToken, requireInvestor, async (req: AuthRequest, res) => {
    try {
      const { userId } = req.params;
      
      // Check if user can access this data
      if (!canAccessUserData(req.user!, userId)) {
        return res.status(403).json({ message: "Access denied to this user's data" });
      }

      const report = await storage.getInvestorPerformanceReport(userId);
      res.json(report);
    } catch (error: any) {
      log(`[API][${INSTANCE_ID}] Error generating performance report: ${error.message}`);
      res.status(500).json({ message: "Error generating performance report: " + error.message });
    }
  });

  // Update investment profit/loss (System/Admin use)
  app.post("/api/admin/update-profit-loss", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { currentBitcoinPrice } = req.body;
      
      if (!currentBitcoinPrice || currentBitcoinPrice <= 0) {
        return res.status(400).json({ message: "Valid Bitcoin price required" });
      }

      // Get all active user investments
      const investments = await storage.getUserInvestments();
      const activeInvestments = investments.filter(inv => inv.status === 'active');

      let updatedCount = 0;
      
      for (const investment of activeInvestments) {
        // Get initial Bitcoin price when investment was made
        const initialBitcoinCode = parseFloat(investment.bitcoinCode);
        if (!initialBitcoinCode) continue;

        const investmentAmount = parseFloat(investment.investmentAmount.toString());
        
        // Calculate new profit/loss using helper function
        const calculations = calculateProfitLoss(investmentAmount, initialBitcoinCode, currentBitcoinPrice);

        // Update investment
        await storage.updateUserInvestment(investment.id, {
          currentValue: calculations.currentValue.toString(),
          profitLoss: calculations.profitLoss.toString(),
          profitLossPercentage: calculations.profitLossPercentage.toString(),
          lastUpdated: new Date()
        });

        // Create history record
        await storage.createInvestmentHistory({
          userInvestmentId: investment.id,
          bitcoinPrice: currentBitcoinPrice.toString(),
          currentValue: calculations.currentValue.toString(),
          profitLoss: calculations.profitLoss.toString(),
          profitLossPercentage: calculations.profitLossPercentage.toString(),
          metadata: JSON.stringify({ 
            updateSource: 'admin', 
            updatedBy: req.user!.id,
            bitcoinHoldings: calculations.bitcoinHoldings
          })
        });

        updatedCount++;
      }

      res.json({ 
        message: `Updated profit/loss for ${updatedCount} investments`,
        bitcoinPrice: currentBitcoinPrice,
        updatedInvestments: updatedCount
      });
    } catch (error: any) {
      log(`[API][${INSTANCE_ID}] Error updating profit/loss: ${error.message}`);
      res.status(500).json({ message: "Error updating profit/loss: " + error.message });
    }
  });

  // Auto update P&L with current Bitcoin price (Scheduled endpoint)
  app.post("/api/system/auto-update-profit-loss", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      // Get current Bitcoin price
      const priceData = await bitcoinPriceService.getCurrentPrice();
      const currentBitcoinPrice = priceData.price;

      // Get all active user investments
      const investments = await storage.getUserInvestments();
      const activeInvestments = investments.filter(inv => inv.status === 'active');

      let updatedCount = 0;
      const errors: string[] = [];
      
      for (const investment of activeInvestments) {
        try {
          const initialBitcoinCode = parseFloat(investment.bitcoinCode);
          if (!initialBitcoinCode) {
            errors.push(`Investment ${investment.id}: Invalid initial Bitcoin price`);
            continue;
          }

          const investmentAmount = parseFloat(investment.investmentAmount.toString());
          const calculations = calculateProfitLoss(investmentAmount, initialBitcoinCode, currentBitcoinPrice);

          // Update investment
          await storage.updateUserInvestment(investment.id, {
            currentValue: calculations.currentValue.toString(),
            profitLoss: calculations.profitLoss.toString(),
            profitLossPercentage: calculations.profitLossPercentage.toString(),
            lastUpdated: new Date()
          });

          // Create history record
          await storage.createInvestmentHistory({
            userInvestmentId: investment.id,
            bitcoinPrice: currentBitcoinPrice.toString(),
            currentValue: calculations.currentValue.toString(),
            profitLoss: calculations.profitLoss.toString(),
            profitLossPercentage: calculations.profitLossPercentage.toString(),
            metadata: JSON.stringify({ 
              updateSource: 'system_auto',
              priceSource: priceData.source,
              bitcoinHoldings: calculations.bitcoinHoldings
            })
          });

          updatedCount++;
        } catch (investmentError: any) {
          errors.push(`Investment ${investment.id}: ${investmentError.message}`);
        }
      }

      // Update investment summaries for affected users
      const userIds = Array.from(new Set(activeInvestments.map(inv => inv.userId)));
      for (const userId of userIds) {
        try {
          const userInvestments = await storage.getUserInvestmentsByUserId(userId);
          const totalInvested = userInvestments.reduce((acc, inv) => acc + parseFloat(inv.investmentAmount.toString()), 0);
          const currentValue = userInvestments.reduce((acc, inv) => acc + parseFloat(inv.currentValue?.toString() || '0'), 0);
          const totalProfitLoss = currentValue - totalInvested;

          await storage.updateInvestmentSummary(userId, {
            totalInvested: totalInvested.toString(),
            currentValue: currentValue.toString(),
            totalProfitLoss: totalProfitLoss.toString(),
            totalProfitLossPercentage: totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100).toString() : '0',
            activeInvestments: userInvestments.filter(inv => inv.status === 'active').length,
            lastCalculated: new Date()
          });
        } catch (summaryError: any) {
          errors.push(`Summary for user ${userId}: ${summaryError.message}`);
        }
      }

      res.json({ 
        message: `Auto-updated profit/loss for ${updatedCount} investments`,
        bitcoinPrice: currentBitcoinPrice,
        priceSource: priceData.source,
        updatedInvestments: updatedCount,
        affectedUsers: userIds.length,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date()
      });
    } catch (error: any) {
      log(`[API][${INSTANCE_ID}] Error in auto-update profit/loss: ${error.message}`);
      res.status(500).json({ message: "Error in auto-update: " + error.message });
    }
  });

  // Get investment summary for user
  app.get("/api/user/investment-summary", authenticateToken, requireInvestor, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      
      let summary = await storage.getInvestmentSummary(userId);
      
      if (!summary) {
        // Create initial summary
        const investments = await storage.getUserInvestmentsByUserId(userId);
        const totalInvested = investments.reduce((acc, inv) => acc + parseFloat(inv.investmentAmount.toString()), 0);
        const currentValue = investments.reduce((acc, inv) => acc + parseFloat(inv.currentValue?.toString() || '0'), 0);
        const totalProfitLoss = currentValue - totalInvested;

        summary = await storage.createInvestmentSummary({
          userId,
          totalInvested: totalInvested.toString(),
          currentValue: currentValue.toString(),
          totalProfitLoss: totalProfitLoss.toString(),
          totalProfitLossPercentage: totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100).toString() : '0',
          totalTransactions: investments.length,
          activeInvestments: investments.filter(inv => inv.status === 'active').length
        });
      }

      res.json(summary);
    } catch (error: any) {
      log(`[API][${INSTANCE_ID}] Error fetching investment summary: ${error.message}`);
      res.status(500).json({ message: "Error fetching investment summary: " + error.message });
    }
  });

  // Get investment history for user
  app.get("/api/user/investment-history", authenticateToken, requireInvestor, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const { limit = 50, offset = 0 } = req.query;
      
      // Get user's investments first
      const investments = await storage.getUserInvestmentsByUserId(userId);
      const investmentIds = investments.map(inv => inv.id);
      
      if (investmentIds.length === 0) {
        return res.json([]);
      }
      
      // Fetch history for each investment and merge
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      const allHistory = (await Promise.all(
        investmentIds.map(id => storage.getInvestmentHistory(id))
      )).flat();
      const history = allHistory
        .sort((a, b) => new Date(b.recordedAt ?? 0).getTime() - new Date(a.recordedAt ?? 0).getTime())
        .slice(offsetNum, offsetNum + limitNum);
      
      res.json(history);
    } catch (error: any) {
      log(`[API][${INSTANCE_ID}] Error fetching investment history: ${error.message}`);
      res.status(500).json({ message: "Error fetching investment history: " + error.message });
    }
  });

  // ===== GOOGLE DRIVE BACKUP ENDPOINTS =====
  
  // ===== MULTI-ASSET MARKET DATA =====

  // Giá tất cả tài sản (crypto batch + stocks) — public, cache 60s
  app.get("/api/assets", async (_req, res) => {
    try {
      const prices = await marketDataService.getAllPrices();
      res.json({ assets: prices, timestamp: new Date() });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching market data: " + error.message });
    }
  });

  // Dashboard nâng cao: Fear&Greed, BTC Dominance, Top Gainers/Losers, AI Signal
  app.get("/api/market-stats", async (_req, res) => {
    try {
      res.json(await getMarketStats());
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching market stats: " + error.message });
    }
  });

  // Kinh tế Việt Nam (World Bank)
  app.get("/api/vn-economy", async (_req, res) => {
    try {
      res.json(await getVnEconomy());
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching VN economy: " + error.message });
    }
  });

  // Hồ sơ khoa học (ORCID) tích hợp trực tiếp
  app.get("/api/orcid-works", async (_req, res) => {
    try {
      res.json(await getOrcidProfile());
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching ORCID: " + error.message });
    }
  });

  // HHD AI Research Assistant — hỏi đáp học thuật/kinh tế qua AI Router
  app.post("/api/research-assist", aiRateLimit, async (req, res) => {
    try {
      const question = String(req.body?.question ?? "").slice(0, 1500).trim();
      if (!question) return res.status(400).json({ error: "Cần nhập câu hỏi nghiên cứu." });
      const system =
        "Bạn là HHD AI Research Assistant — trợ lý nghiên cứu học thuật của HHD Foundation, chuyên kinh tế, tài chính, blockchain, AI và chuyển đổi số. " +
        "Trả lời chính xác, súc tích, có cấu trúc (gạch đầu dòng khi cần), giọng học thuật nhưng dễ hiểu, bằng tiếng Việt. " +
        "Khi phù hợp, gợi ý hướng nghiên cứu, phương pháp hoặc nguồn tham khảo. Nếu không chắc chắn, nói rõ giới hạn.";
      const result = await generateOnce(system, question, 900);
      if (result?.text) return res.json({ answer: result.text, provider: result.provider });
      return res.json({
        answer: "Trợ lý nghiên cứu AI hiện chưa sẵn sàng (chưa cấu hình nhà cung cấp AI). Vui lòng thử lại sau khi quản trị viên kích hoạt Gemini/Claude/OpenAI.",
        provider: "none",
      });
    } catch (err: any) {
      res.status(500).json({ error: "Lỗi trợ lý nghiên cứu" });
    }
  });

  // Trạng thái nhà cung cấp AI đã cấu hình
  app.get("/api/ai-status", (_req, res) => {
    res.json({ providers: aiProvidersConfigured() });
  });

  // Giá 1 tài sản theo symbol
  app.get("/api/assets/:symbol", async (req, res) => {
    try {
      const price = await marketDataService.getPrice(req.params.symbol);
      if (!price) {
        return res.status(404).json({ message: `Asset ${req.params.symbol} not found` });
      }
      res.json(price);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching asset price: " + error.message });
    }
  });

  // ===== ADMIN OPERATIONS (vận hành 1000+ users) =====

  // Dashboard thống kê tổng hợp — aggregate trong SQL
  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json({ ...stats, timestamp: new Date() });
    } catch (error: any) {
      log(`[API][${INSTANCE_ID}] Error fetching admin stats: ${error.message}`);
      res.status(500).json({ message: "Error fetching admin stats: " + error.message });
    }
  });

  // Danh sách users phân trang (thay /api/users khi data lớn)
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const limit = parseInt((req.query.limit as string) ?? '50');
      const offset = parseInt((req.query.offset as string) ?? '0');
      const { users: userList, total } = await storage.getAuthUsersPaginated({ limit, offset });
      const safeUsers = userList.map(({ password: _p, ...u }) => u);
      res.json({ users: safeUsers, total, limit, offset });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching users: " + error.message });
    }
  });

  // Audit logs — truy vết thao tác quản trị
  app.get("/api/admin/audit-logs", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const logs = await storage.getAuditLogs({
        limit: parseInt((req.query.limit as string) ?? '50'),
        offset: parseInt((req.query.offset as string) ?? '0'),
        action: req.query.action as string | undefined,
      });
      res.json({ logs });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching audit logs: " + error.message });
    }
  });

  // Dọn dữ liệu history cũ (Admin chạy thủ công hoặc qua cron)
  app.post("/api/admin/prune-history", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const keepDays = Math.max(parseInt(req.body?.keepDays ?? '90'), 7);
      const deleted = await storage.pruneInvestmentHistory(keepDays);
      await storage.createAuditLog({
        actorId: req.user!.id,
        actorUsername: req.user!.username,
        actorRole: req.user!.role,
        action: 'history.prune',
        entityType: 'investment_history',
        details: JSON.stringify({ keepDays, deleted }),
        ipAddress: req.ip,
      });
      res.json({ success: true, deleted, keepDays });
    } catch (error: any) {
      res.status(500).json({ message: "Error pruning history: " + error.message });
    }
  });

  // Email service health check (Admin only)
  app.get("/api/admin/email/status", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    const ok = await emailService.verifyEmailConnection();
    res.json({
      configured: !!process.env.RESEND_API_KEY || !!process.env.SMTP_HOST,
      connected: ok,
      provider: process.env.RESEND_API_KEY ? "resend" : (process.env.SMTP_HOST ? "smtp" : null),
      from: process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? null,
    });
  });

  // Get backup service status (Admin only)
  app.get("/api/admin/backup/status", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const status = googleDriveService.getStatus();
      const recentBackups = await googleDriveService.listBackups(5);
      
      res.json({
        service: status,
        recentBackups: recentBackups.map(backup => ({
          id: backup.id,
          name: backup.name,
          size: backup.size ?? 0,
          createdTime: backup.createdTime
        })),
        timestamp: new Date()
      });
    } catch (error: any) {
      log(`[API][${INSTANCE_ID}] Error getting backup status: ${error.message}`);
      res.status(500).json({ message: "Error getting backup status: " + error.message });
    }
  });

  // Create manual backup (Admin only)
  app.post("/api/admin/backup/create", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = createBackupSchema.parse(req.body);
      const { 
        includeDatabase, 
        includeWebFiles, 
        includeUserUploads,
        filename 
      } = validatedData;
      
      log(`[API][${INSTANCE_ID}] Starting manual backup by admin: ${req.user!.username}`);
      
      const result = await googleDriveService.createBackup({
        includeDatabase,
        includeWebFiles,
        includeUserUploads,
        filename
      });
      
      if (result.success) {
        res.json({
          success: true,
          message: `Backup completed successfully - ${result.fileIds.length} files uploaded`,
          fileIds: result.fileIds,
          errors: result.errors.length > 0 ? result.errors : undefined,
          timestamp: result.timestamp
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Backup failed",
          errors: result.errors,
          timestamp: result.timestamp
        });
      }
    } catch (error: any) {
      log(`[API][${INSTANCE_ID}] Error creating backup: ${error.message}`);
      res.status(500).json({ message: "Error creating backup: " + error.message });
    }
  });

  // List all backups (Admin only)  
  app.get("/api/admin/backup/list", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedQuery = backupListQuerySchema.parse(req.query);
      const { limit } = validatedQuery;
      const backups = await googleDriveService.listBackups(limit);
      
      res.json({
        backups: backups.map(backup => ({
          id: backup.id,
          name: backup.name,
          size: backup.size ?? 0,
          sizeFormatted: backup.size ? `${Math.round(backup.size / 1024 / 1024 * 100) / 100} MB` : 'Unknown',
          createdTime: backup.createdTime,
          type: backup.name.includes('database') ? 'database' : 
                backup.name.includes('web') ? 'web' : 
                backup.name.includes('appdata') ? 'appdata' : 'full'
        })),
        total: backups.length,
        timestamp: new Date()
      });
    } catch (error: any) {
      log(`[API][${INSTANCE_ID}] Error listing backups: ${error.message}`);
      res.status(500).json({ message: "Error listing backups: " + error.message });
    }
  });

  // Cleanup old backups (Admin only)
  app.post("/api/admin/backup/cleanup", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = backupCleanupSchema.parse(req.body);
      const { keepCount } = validatedData;
      
      log(`[API][${INSTANCE_ID}] Starting backup cleanup, keeping ${keepCount} recent backups`);
      
      const deletedCount = await googleDriveService.cleanupOldBackups(keepCount);
      
      res.json({
        success: true,
        message: `Cleanup completed - ${deletedCount} old backups deleted`,
        deletedCount,
        timestamp: new Date()
      });
    } catch (error: any) {
      log(`[API][${INSTANCE_ID}] Error during backup cleanup: ${error.message}`);
      res.status(500).json({ message: "Error during cleanup: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
