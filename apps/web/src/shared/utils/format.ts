/**
 * Bộ định dạng số / tiền tệ / ngày giờ dùng chung.
 *
 * Mỗi hàm giữ nguyên đúng hành vi của các bản sao cục bộ trước đây; khi hai nơi
 * định dạng khác nhau thì khác biệt được truyền qua tham số chứ KHÔNG hợp nhất.
 */

const USD_LOCALE = 'en-US';
const VN_LOCALE = 'vi-VN';

export interface FormatUsdOptions {
  /** Số chữ số thập phân tối thiểu (mặc định 2). */
  minFrac?: number;
  /** Số chữ số thập phân tối đa (mặc định bằng minFrac). */
  maxFrac?: number;
}

/**
 * `$1,234.56`.
 * - Mặc định 2/2 chữ số thập phân (portfolio, admin, dashboard).
 * - `{ minFrac: 0, maxFrac: 2 }` cho bảng quản trị vòng bán.
 */
export function formatUsd(value: number, opts: FormatUsdOptions = {}): string {
  const { minFrac = 2, maxFrac = minFrac } = opts;
  return `$${value.toLocaleString(USD_LOCALE, {
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
  })}`;
}

/**
 * Số theo locale en-US.
 * - `formatNumber(n)` → định dạng mặc định của locale (tối đa 3 chữ số thập phân).
 * - `formatNumber(n, d)` → cố định đúng `d` chữ số thập phân.
 */
export function formatNumber(value: number, digits?: number): string {
  if (digits === undefined) return value.toLocaleString(USD_LOCALE);
  return value.toLocaleString(USD_LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Số lượng token: tối đa 6 chữ số thập phân, không ép số thập phân tối thiểu. */
export function formatTokenAmount(value: number): string {
  return value.toLocaleString(USD_LOCALE, { maximumFractionDigits: 6 });
}

/** Giá tài sản: `$1,234.56` khi ≥ 1000, `$12.34` khi ≥ 1, ngược lại `$0.1234`. */
export function formatPrice(price: number): string {
  if (price >= 1000) return formatUsd(price);
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

/** `12.34%` (mặc định 2 chữ số thập phân). */
export function formatPercent(value: number, digits = 2): string {
  return `${value.toFixed(digits)}%`;
}

type DateInput = string | number | Date;

/** Ngày + giờ theo locale vi-VN. */
export function formatDateTime(value: DateInput): string {
  return new Date(value).toLocaleString(VN_LOCALE);
}

/** Chỉ ngày theo locale vi-VN. */
export function formatDate(value: DateInput): string {
  return new Date(value).toLocaleDateString(VN_LOCALE);
}

/** Chỉ giờ:phút theo locale vi-VN. */
export function formatTime(value: DateInput): string {
  return new Date(value).toLocaleTimeString(VN_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
