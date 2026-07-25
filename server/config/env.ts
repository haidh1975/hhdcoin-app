import { z } from "zod";

/**
 * Cấu hình môi trường TẬP TRUNG — validate bằng Zod, fail-fast lúc boot.
 * QUY TẮC: mọi truy cập process.env trong server/ phải đi qua module này.
 * Default phản chiếu ĐÚNG hành vi hiện có (không đổi chức năng).
 */
const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive().default(5000),

    // Database — placeholder detection nằm ở db.ts (giữ nguyên hành vi PGlite dev)
    DATABASE_URL: z.string().optional(),

    // Auth
    JWT_SECRET: z.string().min(16).optional(),

    // CORS (danh sách origin, phân tách bằng dấu phẩy)
    CORS_ORIGINS: z.string().optional(),

    // Stripe
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // AI providers (router thứ tự: gemini → claude → openai)
    AI_PROVIDER_ORDER: z.string().default("gemini,claude,openai"),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default("gemini-flash-latest"),
    ANTHROPIC_API_KEY: z.string().optional(),
    ANTHROPIC_CHAT_MODEL: z.string().default("claude-haiku-4-5-20251001"),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_CHAT_MODEL: z.string().default("gpt-4o-mini"),

    // Email — ưu tiên Resend (HTTP, Railway chặn SMTP outbound), SMTP là fallback
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().default("587"),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    APP_URL: z.string().optional(),

    // Google Drive backup
    GOOGLE_CLIENT_EMAIL: z.string().optional(),
    GOOGLE_PRIVATE_KEY: z.string().optional(),
    GOOGLE_DRIVE_FOLDER_ID: z.string().optional(),
    BACKUP_SCHEDULER_ENABLED: z.string().optional(),
    BACKUP_SCHEDULE: z.string().optional(),
    BACKUP_KEEP_COUNT: z.string().optional(),

    // Học thuật
    ORCID_ID: z.string().default("0000-0001-5811-7154"),
  })
  .superRefine((cfg, ctx) => {
    // Production bắt buộc có JWT_SECRET — thiếu là lỗ hổng auth, fail ngay lúc boot
    if (cfg.NODE_ENV === "production" && !cfg.JWT_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message: "JWT_SECRET là bắt buộc khi NODE_ENV=production",
      });
    }
  });

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Cấu hình môi trường không hợp lệ:");
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
