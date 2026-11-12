import { getCloudflareContext } from "@opennextjs/cloudflare";
import { LiveError } from "@/lib/live/service";

// Sdílené generování textu: výchozí je Cloudflare Workers AI (binding AI ve wrangler.jsonc, bez klíče,
// 10 000 neuronů denně zdarma). Když binding chybí a je nastavený ANTHROPIC_API_KEY, použije se placené Anthropic API.
// Modely jdou přepsat proměnnými WORKERS_AI_MODEL a WORKERS_AI_VISION_MODEL.
const WORKERS_AI_MODEL = "@cf/google/gemma-4-26b-a4b-it";
const ANTHROPIC_MODEL = "claude-haiku-5-5";

export type ChatTurn = { role: "user" | "assistant"; content: string };
type AiBinding = { run(model: string, input: Record<string, unknown>): Promise<unknown> };
type AiEnv = { AI?: AiBinding; WORKERS_AI_MODEL?: string; WORKERS_AI_VISION_MODEL?: string };

function aiEnv(): AiEnv {
  try {
    return getCloudflareContext({ async: false }).env as AiEnv;
  } catch {
    return {}; // mimo Workers kontext (lokální vývoj bez wrangleru)
  }
}

/** Text odpovědi z Workers AI: modely vrací buď { response } nebo formát chat completions. */
export function workersAiText(out: unknown): string {
  const o = out as { response?: unknown; choices?: { message?: { content?: unknown } }[] } | null;
  const t = o?.response ?? o?.choices?.[0]?.message?.content;
  return typeof t === "string" ? t.trim() : "";
}

export type GenerateOptions = {
  system: string;
  turns: ChatTurn[];
  maxTokens?: number;
  /** Obrázek jako data URL (data:image/jpeg;base64,...). Připojí se k poslední zprávě uživatele. */
  image?: string;
};

export async function generateText({ system, turns, maxTokens = 400, image }: GenerateOptions): Promise<string> {
  const env = aiEnv();
  if (env.AI) {
    const model = (image ? env.WORKERS_AI_VISION_MODEL : undefined) || env.WORKERS_AI_MODEL || WORKERS_AI_MODEL;
    const messages: Record<string, unknown>[] = [{ role: "system", content: system }, ...turns];
    if (image) {
      const last = messages[messages.length - 1];
      messages[messages.length - 1] = {
        role: "user",
        content: [
          { type: "text", text: String(last.content) },
          { type: "image_url", image_url: { url: image } },
        ],
      };
    }
    const out = await env.AI.run(model, { messages, max_tokens: maxTokens, chat_template_kwargs: { enable_thinking: false } });
    return workersAiText(out);
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new LiveError("ai-unavailable", 503);
  const messages = turns.map((t, i) => {
    if (image && i === turns.length - 1 && t.role === "user") {
      const m = /^data:(image\/[a-z+]+);base64,(.+)$/.exec(image);
      if (m) {
        return {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: m[1], data: m[2] } },
            { type: "text", text: t.content },
          ],
        };
      }
    }
    return t;
  });
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || ANTHROPIC_MODEL, max_tokens: maxTokens, system, messages }),
    signal: AbortSignal.timeout(25000),
  }).catch(() => null);
  if (!res || !res.ok) {
    console.error("ai: Anthropic API selhalo", res?.status);
    return "";
  }
  const data = (await res.json().catch(() => ({}))) as { content?: { type: string; text?: string }[] };
  return (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("").trim();
}

/** Vytáhne první JSON objekt nebo pole z odpovědi modelu (modely ho rády obalí textem nebo ```). */
export function extractJson<T = unknown>(text: string): T | null {
  const cleaned = text.replace(/```(?:json)?/gi, "");
  const start = cleaned.search(/[\[{]/);
  if (start < 0) return null;
  const open = cleaned[start];
  const close = open === "{" ? "}" : "]";
  const end = cleaned.lastIndexOf(close);
  if (end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
