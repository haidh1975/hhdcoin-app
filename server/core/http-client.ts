/**
 * HTTP client dùng chung — thay 8 bản copy AbortController rải rác các service.
 * Mặc định timeout 8s (API ngoài: CoinGecko, World Bank, ORCID...);
 * AI providers truyền timeout dài hơn.
 */

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    url: string,
  ) {
    super(`HTTP ${status} — ${url}`);
    this.name = "HttpError";
  }
}

export interface HttpOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown; // object sẽ được JSON.stringify
  timeoutMs?: number;
}

/** fetch có timeout — trả Response thô (caller tự xử lý status). */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8000,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** GET/POST JSON có timeout — ném HttpError khi !ok, parse sẵn JSON. */
export async function fetchJson<T = unknown>(url: string, opts: HttpOptions = {}): Promise<T> {
  const { method = "GET", headers = {}, body, timeoutMs = 8000 } = opts;
  const init: RequestInit = {
    method,
    headers: { accept: "application/json", ...headers },
  };
  if (body !== undefined) {
    init.headers = { "content-type": "application/json", ...init.headers };
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  const res = await fetchWithTimeout(url, init, timeoutMs);
  if (!res.ok) {
    throw new HttpError(res.status, (await res.text()).slice(0, 500), url);
  }
  return (await res.json()) as T;
}
