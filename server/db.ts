import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { env } from "./config/env";
import * as schema from "@shared/schema";

const dbUrl = env.DATABASE_URL;
const isPlaceholder = !dbUrl || dbUrl.includes("ep-xxx-yyy") || dbUrl.includes("user:password@ep-xxx");
// Neon dùng serverless WebSocket driver; Postgres chuẩn (Railway, local) dùng node-postgres.
const isNeon = !!dbUrl && /\.neon\.tech/.test(dbUrl);

// ── In-memory fallback for local dev ─────────────────────────────────────────
async function buildMemDb() {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");

  const client = new PGlite();

  // Chạy TẤT CẢ migration files theo thứ tự — luôn khớp schema mới nhất
  const __dir = dirname(fileURLToPath(import.meta.url));
  const migrationsDir = join(__dir, "..", "migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    const statements = sql.split("--> statement-breakpoint");
    for (const stmt of statements) {
      const trimmed = stmt.trim();
      if (trimmed) {
        try { await client.exec(trimmed); } catch (_) { /* skip unsupported stmts */ }
      }
    }
  }

  const memDb = drizzle(client, { schema });

  console.log("⚡ [DEV] Dùng PGlite (in-memory) — dữ liệu sẽ mất khi tắt server.");
  console.log("   Để dùng DB thật, thay DATABASE_URL trong .env và chạy lại.\n");

  // pool shim so code that imports `pool` doesn't crash
  const memPool = { end: async () => {} } as any;
  return { pool: memPool, db: memDb as any };
}

// ── Neon serverless (WebSocket) ──────────────────────────────────────────────
async function buildNeonDb() {
  const { Pool, neonConfig } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-serverless");
  const ws = (await import("ws")).default;
  neonConfig.webSocketConstructor = ws as any;
  const neonPool = new Pool({ connectionString: dbUrl! });
  const neonDb = drizzle({ client: neonPool, schema });
  return { pool: neonPool, db: neonDb };
}

// ── Standard Postgres via node-postgres (Railway, local, generic) ────────────
async function buildPgDb() {
  const { Pool } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  // Kết nối nội bộ Railway / localhost không cần SSL; host công khai bật SSL.
  const needsSsl = !/railway\.internal|localhost|127\.0\.0\.1/.test(dbUrl!);
  const pgPool = new Pool({
    connectionString: dbUrl!,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  });
  const pgDb = drizzle(pgPool, { schema });
  console.log("🐘 Dùng node-postgres (Postgres chuẩn).");
  return { pool: pgPool, db: pgDb };
}

// Live bindings — gán lại trong initDb(). KHÔNG dùng top-level await ở đây vì
// esbuild bundle ESM sẽ sinh `await` trong hàm init không-async → SyntaxError.
let pool: any;
let db: any;
let initialized = false;

export async function initDb(): Promise<void> {
  if (initialized) return;
  if (isPlaceholder) {
    const mem = await buildMemDb();
    pool = mem.pool;
    db = mem.db;
  } else if (isNeon) {
    const neon = await buildNeonDb();
    pool = neon.pool;
    db = neon.db;
  } else {
    const pg = await buildPgDb();
    pool = pg.pool;
    db = pg.db;
  }
  initialized = true;
}

export { pool, db };
