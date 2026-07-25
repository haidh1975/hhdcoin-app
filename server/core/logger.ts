import { isDev } from "../config/env";

/**
 * Logger tập trung — thay thế console.log rải rác.
 * Giữ NGUYÊN định dạng log cũ của vite.ts (`h:mm:ss AM [source] message`)
 * để không đổi hành vi; bổ sung cấp độ warn/error/debug.
 */
function timestamp(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

/** Tương thích ngược với `log()` cũ trong vite.ts — mọi import hiện có giữ nguyên. */
export function log(message: string, source = "express"): void {
  console.log(`${timestamp()} [${source}] ${message}`);
}

export const logger = {
  info(message: string, source = "express"): void {
    log(message, source);
  },
  warn(message: string, source = "warn"): void {
    console.warn(`${timestamp()} [${source}] ⚠ ${message}`);
  },
  error(message: string, err?: unknown, source = "error"): void {
    const detail = err instanceof Error ? ` :: ${err.message}` : err ? ` :: ${String(err)}` : "";
    console.error(`${timestamp()} [${source}] ✖ ${message}${detail}`);
  },
  /** Chỉ in ở development — tránh nhiễu log production. */
  debug(message: string, source = "debug"): void {
    if (isDev) console.log(`${timestamp()} [${source}] ${message}`);
  },
};
