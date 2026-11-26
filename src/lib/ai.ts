import { getCloudflareContext } from "@opennextjs/cloudflare";
import { LiveError } from "@/lib/live/service";
import { cleanReply } from "@/lib/ai-clean";

export { cleanReply };

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
  /** Kreativita: nízká pro JSON a fakta, vyšší pro rozhovor. */
  temperature?: number;
};

async function viaWorkersAi(ai: AiBinding, env: AiEnv, { system, turns, maxTokens = 400, image, temperature = 0.5 }: GenerateOptions): Promise<string> {
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
  const out = await ai.run(model, { messages, max_tokens: maxTokens, temperature, chat_template_kwargs: { enable_thinking: false } });
  return cleanReply(workersAiText(out));
}

async function viaAnthropic(apiKey: string, { system, turns, maxTokens = 400, image, temperature = 0.5 }: GenerateOptions): Promise<string> {
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
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || ANTHROPIC_MODEL, max_tokens: maxTokens, temperature, system, messages }),
    signal: AbortSignal.timeout(30000),
  }).catch(() => null);
  if (!res || !res.ok) {
    console.error("ai: Anthropic API selhalo", res?.status);
    return "";
  }
  const data = (await res.json().catch(() => ({}))) as { content?: { type: string; text?: string }[] };
  return cleanReply((data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join(""));
}

/**
 * Vygeneruje odpověď. Pořadí: Workers AI (při chybě nebo prázdné odpovědi ještě jeden pokus),
 * pak Anthropic API, pokud je nastavený klíč. Prázdný řetězec znamená, že nic neodpovědělo.
 */
export async function generateText(opts: GenerateOptions): Promise<string> {
  const env = aiEnv();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!env.AI && !apiKey) throw new LiveError("ai-unavailable", 503);
  if (env.AI) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const out = await viaWorkersAi(env.AI, env, attempt === 0 ? opts : { ...opts, temperature: Math.min(0.9, (opts.temperature ?? 0.5) + 0.2) });
        if (out) return out;
      } catch (e) {
        console.error("ai: Workers AI selhalo", attempt, e);
      }
    }
  }
  return apiKey ? viaAnthropic(apiKey, opts) : "";
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
