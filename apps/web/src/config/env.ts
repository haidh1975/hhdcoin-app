/**
 * Truy cập biến môi trường phía server có kiểm tra (không dùng zod — chưa phải dependency).
 *
 * Lưu ý: KHÔNG gọi assertServerEnv() ở top-level module — `next build` sẽ import
 * các module này khi chưa có .env và sẽ làm build thất bại. Hãy gọi lười (lazy)
 * tại thời điểm auth thực sự được sử dụng (xem src/lib/auth.ts).
 */

/** Các secret mặc định/yếu đã biết — tuyệt đối không dùng trong production. */
const KNOWN_WEAK_SECRETS = [
  'hhd-i-dev-secret-change-in-production',
  'change-me-to-a-random-string',
];

const MIN_SECRET_LENGTH = 32;

/** `next build` đặt NEXT_PHASE=phase-production-build — khi đó không kiểm tra env. */
function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

/**
 * Ném lỗi (thông báo tiếng Việt) nếu NEXTAUTH_SECRET thiếu, hoặc — khi
 * NODE_ENV=production — nếu secret là giá trị mặc định yếu hoặc ngắn hơn 32 ký tự.
 * Không làm gì trong giai đoạn `next build` (build không cần .env).
 */
export function assertServerEnv(): void {
  if (isBuildPhase()) return;

  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error(
      'Thiếu biến môi trường NEXTAUTH_SECRET. Bắt buộc: chuỗi ngẫu nhiên >= 32 ký tự ' +
        '(tạo bằng: openssl rand -base64 32).'
    );
  }

  if (process.env.NODE_ENV === 'production') {
    if (KNOWN_WEAK_SECRETS.includes(secret) || secret.length < MIN_SECRET_LENGTH) {
      throw new Error(
        'NEXTAUTH_SECRET không an toàn cho production: không được dùng giá trị mặc định ' +
          `và phải dài >= ${MIN_SECRET_LENGTH} ký tự (tạo bằng: openssl rand -base64 32).`
      );
    }
  }
}

/** Biến môi trường phía server, đọc lười qua getter để không "đóng băng" giá trị lúc import. */
export const serverEnv = {
  /** Bắt buộc — được kiểm tra đầy đủ bởi assertServerEnv(). */
  get nextAuthSecret(): string {
    assertServerEnv();
    return process.env.NEXTAUTH_SECRET as string;
  },

  /** Bắt buộc cho Prisma. */
  get databaseUrl(): string {
    const value = process.env.DATABASE_URL;
    if (!value && !isBuildPhase()) {
      throw new Error(
        'Thiếu biến môi trường DATABASE_URL (ví dụ: "file:./dev.db" hoặc chuỗi kết nối Postgres).'
      );
    }
    return value ?? '';
  },

  /** Tùy chọn — không có key thì các tính năng AI dùng mock. */
  get anthropicApiKey(): string | undefined {
    return process.env.ANTHROPIC_API_KEY || undefined;
  },

  /** Tùy chọn — WalletConnect project ID cho kết nối ví. */
  get walletConnectProjectId(): string | undefined {
    return process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || undefined;
  },

  /** Tùy chọn — địa chỉ contract HHD trên BSC (trống cho tới khi token triển khai). */
  get hhdTokenAddress(): string | undefined {
    return process.env.NEXT_PUBLIC_HHD_TOKEN_ADDRESS || undefined;
  },
};
