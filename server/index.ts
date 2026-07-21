import express, { type Request, Response, NextFunction } from "express";
import { initDb } from "./db";
import { storage } from "./storage";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { pnlScheduler } from "./pnl-scheduler";
import { backupScheduler } from "./backup-scheduler";
import { bitcoinWsService } from "./websocket-service";

const app = express();

// Chạy sau reverse proxy (Railway / cPanel) — tin X-Forwarded-* để rate-limit & req.ip đúng.
app.set("trust proxy", 1);

// Production server không được crash vì 1 lỗi async lạc — log & tiếp tục phục vụ.
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});

// CORS — the static frontend (hhdcoin.net) calls this API cross-origin (API on Railway).
// Allow-list origins; echo the specific origin because requests use credentials.
const allowedOrigins = (
  process.env.CORS_ORIGINS ??
  "https://hhdcoin.net,https://www.hhdcoin.net,http://localhost:5000,http://localhost:5173"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// IMPORTANT: Configure raw body parsing for Stripe webhooks BEFORE JSON parsing
app.use("/api/stripe-webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // List of sensitive routes that should not log response bodies
  const sensitiveRoutes = [
    "/api/auth",           // All auth endpoints (login, register) contain JWT tokens
    "/api/create-payment-intent", 
    "/api/stripe-webhook",
    "/api/ai/"             // AI endpoints may contain sensitive user queries
  ];

  const isSensitiveRoute = sensitiveRoutes.some(route => path.startsWith(route));

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    if (!isSensitiveRoute) {
      capturedJsonResponse = bodyJson;
    }
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      } else if (isSensitiveRoute) {
        logLine += " :: [sensitive data hidden]";
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Khởi tạo DB trước (đặt trong async IIFE — KHÔNG top-level await để esbuild bundle ESM hợp lệ)
  await initDb();
  // Seed dữ liệu mặc định (gói đầu tư, ...) — sau khi db đã sẵn sàng
  await storage.initData();

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    // KHÔNG `throw err` ở đây — handler chạy async, throw → unhandledRejection → Node crash process.
    console.error("[error-handler]", err?.message ?? err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  // Gắn WebSocket service vào HTTP server
  bitcoinWsService.attach(server);

  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);

    setTimeout(() => {
      pnlScheduler.start();
      log('[P&L Scheduler] Automatic P&L calculation service started');

      backupScheduler.start();
      log('[Backup Scheduler] Automatic backup service started');
    }, 2000);
  });
})();
