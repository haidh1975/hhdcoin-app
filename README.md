# HHD-I — Nền tảng đầu tư thông minh (Bitcoin, Crypto, Cổ phiếu VN)

Monorepo cho nền tảng đầu tư HHD-I: dữ liệu nhà đầu tư thật (Prisma + SQLite/Postgres), giá thị trường thời gian thực (Binance), xác thực NextAuth, panel quản trị, và bộ tính năng AI tiếng Việt (trợ lý giao dịch, quản lý rủi ro, phân tích tâm lý, hỗ trợ 24/7).

## Kiến trúc

```
hhdcoin-app/  (npm workspaces + Turborepo)
│
├── apps/web — Next.js 14 App Router + TypeScript + Tailwind
│   │
│   │   ┌─────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   │   │  Browser     │───▶│ Next.js App      │───▶│ Prisma ORM       │
│   │   │  (React UI)  │    │  - Pages (RSC)   │    │  SQLite dev.db   │
│   │   └─────────────┘    │  - API routes    │    │  (→ Postgres)    │
│   │         │             │  - middleware    │    └──────────────────┘
│   │         │             └──────┬───────────┘
│   │         │                    │
│   │         │      ┌─────────────┼─────────────────┐
│   │         │      ▼             ▼                 ▼
│   │         │  NextAuth      Binance REST      Anthropic API
│   │         │  (JWT +        (giá crypto       (Claude — trợ lý AI,
│   │         │   bcrypt)       live, không       fallback mock khi
│   │         │                 cần API key)      chưa có key)
│   │         │
│   │         └── Polling 10s (useMarketPrices) → badge "● Live / ● Demo"
│   │
├── apps/mobile — Expo (React Native), hiện vẫn dùng mock data
└── packages/types — type TypeScript dùng chung (@hhd-i/types)
```

**Luồng dữ liệu chính:**

1. `middleware.ts` chặn mọi request chưa đăng nhập → `/login`; `/admin/*` yêu cầu role `ADMIN`.
2. UI gọi `/api/portfolio`, `/api/transactions`, `/api/market/prices` — server join dữ liệu DB với giá live từ `src/lib/marketData.ts` (cache 10 giây trong bộ nhớ).
3. Lệnh Mua/Bán (`POST /api/transactions`) cập nhật `Holding` nguyên tử trong một Prisma transaction (giá mua trung bình theo trọng số).

## Tech stack

| Lớp | Công nghệ |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS (dark theme, gold `#F0B90B`), lucide-react, recharts |
| Auth | NextAuth v4 (credentials), bcryptjs, JWT session chứa `role` |
| Database | Prisma ORM + SQLite (dev) → PostgreSQL (production) |
| Market data | Binance public REST (crypto, live) + `StockProvider` interface (cổ phiếu VN, mock) |
| AI | Anthropic SDK (Claude) với mock fallback khi chưa có API key |
| Monorepo | npm workspaces + Turborepo |

## Mô hình dữ liệu

| Model | Mô tả |
|---|---|
| `User` | email (unique), passwordHash (bcrypt), name, role `USER\|ADMIN`, status `ACTIVE\|SUSPENDED` |
| `Asset` | symbol (unique), name, type `CRYPTO\|STOCK`, enabled |
| `Holding` | userId + assetId (unique), amount, avgBuyPrice |
| `Transaction` | type `BUY\|SELL\|DEPOSIT\|WITHDRAW`, amount, price, totalValue, status `PENDING\|COMPLETED\|FAILED` |
| `DCASchedule` | amountUsd, frequency `DAILY\|WEEKLY\|MONTHLY`, nextRun, active |
| `Alert` | type, message, severity, read |

Schema: `apps/web/prisma/schema.prisma`. Seed: `apps/web/prisma/seed.ts`.

## Chạy dự án

```bash
# 1. Cài dependencies (từ thư mục gốc)
npm install

# 2. Cấu hình môi trường
#    apps/web/.env đã được tạo sẵn cho dev; tham khảo .env.example
#    Tối thiểu cần: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# 3. Tạo database + seed dữ liệu demo
cd apps/web
npm run db:push    # prisma db push (tạo dev.db)
npm run db:seed    # tạo admin, 3 user demo, tài sản, giao dịch mẫu

# 4. Chạy dev server
npm run dev        # http://localhost:3000
# (hoặc từ gốc: npm run dev — chạy qua Turborepo)

# Build production
npm run build
```

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị | `admin@hhd-i.vn` | `Admin@123` |
| Người dùng | `haidh1975@gmail.com` | `User@123` |
| Người dùng | `lan.nguyen@example.com` | `User@123` |
| Người dùng | `minh.tran@example.com` | `User@123` |

## Chuyển SQLite → PostgreSQL

1. Trong `apps/web/prisma/schema.prisma`, đổi datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Đổi `DATABASE_URL` trong `apps/web/.env`:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/hhdi?schema=public"
   ```
3. Chạy `npm run db:push && npm run db:seed`. Schema không dùng tính năng riêng của SQLite nên không cần sửa model.

## Tích hợp dữ liệu thật

- **Giá crypto**: đã live qua Binance public REST (`/api/v3/ticker/24hr`, không cần API key). Khi không có mạng, hệ thống tự fallback sang giá demo và UI hiển thị badge "● Demo".
- **Giá cổ phiếu VN**: implement interface `StockProvider` trong `apps/web/src/lib/marketData.ts` (đã có hướng dẫn trong comment) với SSI FastConnect, DNSE, hoặc proxy [vnstock](https://github.com/thinh-vu/vnstock), rồi thay `stockProvider = new SSIStockProvider()`.
- **AI (Claude)**: đặt `ANTHROPIC_API_KEY` vào `apps/web/.env.local` (hoặc `.env`). Không có key, 4 endpoint `/api/ai/*` trả lời bằng dữ liệu mock — app vẫn dùng được đầy đủ.

## Cấu trúc tính năng (apps/web)

| Trang | Mô tả |
|---|---|
| `/login`, `/register` | Đăng nhập / đăng ký (NextAuth credentials) |
| `/` | Dashboard: giá thị trường live (poll 10s), tổng quan danh mục thật |
| `/portfolio` | Danh mục: holdings + PnL theo giá live, lịch sử giao dịch, modal Mua/Bán |
| `/assistant`, `/risk`, `/sentiment`, `/support` | Bộ tính năng AI (Claude, yêu cầu đăng nhập) |
| `/dao-tao`, `/tin-tuc`, `/sach`, `/lien-he` | Nội dung học tập & thông tin |
| `/admin`, `/admin/users`, `/admin/transactions`, `/admin/assets` | Panel quản trị (chỉ role ADMIN) |

## API chính

- `GET /api/market/prices?symbols=BTC,ETH` — giá live (cache 10s, badge live/mock)
- `GET /api/portfolio` — danh mục của user hiện tại + PnL + tỷ trọng
- `GET/POST /api/transactions` — lịch sử (phân trang) / tạo lệnh BUY-SELL
- `PATCH /api/admin/users/[id]`, `PATCH /api/admin/assets/[id]` — quản trị (kiểm tra role server-side)
- `POST /api/ai/{assistant,chat,risk,sentiment}` — tính năng AI (401 nếu chưa đăng nhập)
