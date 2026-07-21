import { log } from "./vite";

// Router AI đa nhà cung cấp: thử Gemini → Claude → OpenAI theo thứ tự, dùng cái nào chạy được.
// Gemini ưu tiên vì free tier hào phóng (dự phòng chính khi OpenAI/Anthropic hết credit).

export interface AiMessage { role: "user" | "assistant"; content: string }
export interface AiResult { text: string; provider: string }

const PROVIDER_ORDER = (process.env.AI_PROVIDER_ORDER ?? "gemini,claude,openai")
  .split(",").map((s) => s.trim().toLowerCase());

async function tryGemini(system: string, messages: AiMessage[], maxTokens: number): Promise<AiResult | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  try {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.6 },
        }),
      },
    );
    if (!res.ok) { log(`[AI:gemini] ${res.status}: ${(await res.text()).slice(0, 140)}`); return null; }
    const data: any = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("").trim();
    return text ? { text, provider: "gemini" } : null;
  } catch (e: any) { log(`[AI:gemini] err ${e.message}`); return null; }
}

async function tryClaude(system: string, messages: AiMessage[], maxTokens: number): Promise<AiResult | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const model = process.env.ANTHROPIC_CHAT_MODEL ?? "claude-haiku-4-5-20251001";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: maxTokens, system, messages }),
    });
    if (!res.ok) { log(`[AI:claude] ${res.status}: ${(await res.text()).slice(0, 140)}`); return null; }
    const data: any = await res.json();
    const text = data?.content?.[0]?.text?.trim();
    return text ? { text, provider: "claude" } : null;
  } catch (e: any) { log(`[AI:claude] err ${e.message}`); return null; }
}

async function tryOpenAI(system: string, messages: AiMessage[], maxTokens: number): Promise<AiResult | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!res.ok) { log(`[AI:openai] ${res.status}: ${(await res.text()).slice(0, 140)}`); return null; }
    const data: any = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text ? { text, provider: "openai" } : null;
  } catch (e: any) { log(`[AI:openai] err ${e.message}`); return null; }
}

const PROVIDERS: Record<string, (s: string, m: AiMessage[], t: number) => Promise<AiResult | null>> = {
  gemini: tryGemini, claude: tryClaude, openai: tryOpenAI,
};

/** Thử lần lượt các nhà cung cấp; trả về kết quả đầu tiên thành công, hoặc null nếu tất cả thất bại. */
export async function generateChat(system: string, messages: AiMessage[], maxTokens = 600): Promise<AiResult | null> {
  for (const name of PROVIDER_ORDER) {
    const fn = PROVIDERS[name];
    if (!fn) continue;
    const r = await fn(system, messages, maxTokens);
    if (r) { log(`[AI] dùng nhà cung cấp: ${r.provider}`); return r; }
  }
  return null;
}

/** Trợ giúp 1 lượt (prompt đơn) — cho Research Assistant & phân tích. */
export async function generateOnce(system: string, prompt: string, maxTokens = 800): Promise<AiResult | null> {
  return generateChat(system, [{ role: "user", content: prompt }], maxTokens);
}

export function aiProvidersConfigured(): string[] {
  return PROVIDER_ORDER.filter((n) =>
    (n === "gemini" && process.env.GEMINI_API_KEY) ||
    (n === "claude" && process.env.ANTHROPIC_API_KEY) ||
    (n === "openai" && process.env.OPENAI_API_KEY));
}
