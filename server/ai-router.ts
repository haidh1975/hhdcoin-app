import { env } from "./config/env";
import { logger } from "./core/logger";
import { fetchWithTimeout } from "./core/http-client";

// Router AI đa nhà cung cấp: thử Gemini → Claude → OpenAI theo AI_PROVIDER_ORDER,
// dùng nhà cung cấp đầu tiên trả lời được. Gemini ưu tiên (free tier — AI chính).

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}
export interface AiResult {
  text: string;
  provider: string;
}

const AI_TIMEOUT_MS = 25_000;
const PROVIDER_ORDER = env.AI_PROVIDER_ORDER.split(",").map((s) => s.trim().toLowerCase());

async function tryGemini(system: string, messages: AiMessage[], maxTokens: number): Promise<AiResult | null> {
  if (!env.GEMINI_API_KEY) return null;
  try {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const res = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        // Key trong header — không nằm trong URL để tránh lộ qua log/proxy
        headers: { "x-goog-api-key": env.GEMINI_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.6 },
        }),
      },
      AI_TIMEOUT_MS,
    );
    if (!res.ok) {
      logger.warn(`Gemini ${res.status}: ${(await res.text()).slice(0, 140)}`, "ai");
      return null;
    }
    const data: any = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("").trim();
    return text ? { text, provider: "gemini" } : null;
  } catch (e: any) {
    logger.warn(`Gemini error: ${e.message}`, "ai");
    return null;
  }
}

async function tryClaude(system: string, messages: AiMessage[], maxTokens: number): Promise<AiResult | null> {
  if (!env.ANTHROPIC_API_KEY) return null;
  try {
    const res = await fetchWithTimeout(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({ model: env.ANTHROPIC_CHAT_MODEL, max_tokens: maxTokens, system, messages }),
      },
      AI_TIMEOUT_MS,
    );
    if (!res.ok) {
      logger.warn(`Claude ${res.status}: ${(await res.text()).slice(0, 140)}`, "ai");
      return null;
    }
    const data: any = await res.json();
    const text = data?.content?.[0]?.text?.trim();
    return text ? { text, provider: "claude" } : null;
  } catch (e: any) {
    logger.warn(`Claude error: ${e.message}`, "ai");
    return null;
  }
}

async function tryOpenAI(system: string, messages: AiMessage[], maxTokens: number): Promise<AiResult | null> {
  if (!env.OPENAI_API_KEY) return null;
  try {
    const res = await fetchWithTimeout(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({
          model: env.OPENAI_CHAT_MODEL,
          max_tokens: maxTokens,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      },
      AI_TIMEOUT_MS,
    );
    if (!res.ok) {
      logger.warn(`OpenAI ${res.status}: ${(await res.text()).slice(0, 140)}`, "ai");
      return null;
    }
    const data: any = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text ? { text, provider: "openai" } : null;
  } catch (e: any) {
    logger.warn(`OpenAI error: ${e.message}`, "ai");
    return null;
  }
}

const PROVIDERS: Record<string, (s: string, m: AiMessage[], t: number) => Promise<AiResult | null>> = {
  gemini: tryGemini,
  claude: tryClaude,
  openai: tryOpenAI,
};

/** Thử lần lượt các nhà cung cấp; trả kết quả đầu tiên thành công, null nếu tất cả thất bại. */
export async function generateChat(system: string, messages: AiMessage[], maxTokens = 600): Promise<AiResult | null> {
  for (const name of PROVIDER_ORDER) {
    const fn = PROVIDERS[name];
    if (!fn) continue;
    const result = await fn(system, messages, maxTokens);
    if (result) {
      logger.info(`dùng nhà cung cấp: ${result.provider}`, "ai");
      return result;
    }
  }
  return null;
}

/** Sinh 1 lượt (prompt đơn) — cho Research Assistant & phân tích. */
export async function generateOnce(system: string, prompt: string, maxTokens = 800): Promise<AiResult | null> {
  return generateChat(system, [{ role: "user", content: prompt }], maxTokens);
}

/** Danh sách nhà cung cấp đã cấu hình key (theo thứ tự ưu tiên). */
export function aiProvidersConfigured(): string[] {
  return PROVIDER_ORDER.filter(
    (n) =>
      (n === "gemini" && env.GEMINI_API_KEY) ||
      (n === "claude" && env.ANTHROPIC_API_KEY) ||
      (n === "openai" && env.OPENAI_API_KEY),
  );
}
