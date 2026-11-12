import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { requireProUserId } from "@/lib/pro-server";
import { withinRateLimit } from "@/lib/rate-limit";
import { cleanTurns } from "@/lib/teams/assistant-logic";
import { extractJson, generateText, type ChatTurn } from "@/lib/ai";
import { notesPrompt, oralFinishPrompt, oralPrompt, photoPrompt, tutorPrompt } from "@/lib/pro-tools/ai-prompts";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

// AI funkce UčímePRO přes Cloudflare Workers AI: doučovač, fotka úlohy, ústní zkoušení a kartičky z poznámek.
const MAX_IMAGE_CHARS = 1_500_000; // data URL, zhruba 1,1 MB obrázku
const MAX_NOTES_CHARS = 4000;
const IMAGE_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

function parseImage(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw) return undefined;
  if (raw.length > MAX_IMAGE_CHARS || !IMAGE_RE.test(raw)) throw new LiveError("invalid-image");
  return raw;
}

async function run(opts: Parameters<typeof generateText>[0]): Promise<string> {
  let out = "";
  try {
    out = await generateText(opts);
  } catch (e) {
    if (e instanceof LiveError) throw e;
    console.error("pro-ai: generování selhalo", e);
  }
  if (!out) throw new LiveError("ai-unavailable", 503);
  return out;
}

const strList = (a: unknown) =>
  Array.isArray(a) ? a.filter((x): x is string => typeof x === "string").slice(0, 6).map((x) => x.slice(0, 200)) : [];

export async function POST(request: Request) {
  return handle(async () => {
    const userId = await requireProUserId();
    if (!(await withinRateLimit(`pro-ai:${userId}`, 40, 600))) throw new LiveError("rate-limited", 429);
    const body = await readJson(request);
    const locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "cs";
    const mode = body.mode;

    if (mode === "tutor") {
      const turns = cleanTurns(body.messages);
      if (turns.length === 0) throw new LiveError("invalid-message");
      // Fotka se připojuje jen k poslední zprávě žáka.
      const image = parseImage(body.image);
      return { reply: await run({ system: tutorPrompt(locale), turns, image, maxTokens: 500 }) };
    }

    if (mode === "photo") {
      const image = parseImage(body.image);
      if (!image) throw new LiveError("invalid-image");
      const turns: ChatTurn[] = [{ role: "user", content: "Vytvoř podobné příklady k úloze na fotce." }];
      const text = await run({ system: photoPrompt(locale), turns, image, maxTokens: 900 });
      const data = extractJson<{ task?: string; method?: string; examples?: { question?: string; answer?: string }[] }>(text);
      const examples = (data?.examples ?? [])
        .filter((e) => typeof e?.question === "string" && e.question.trim())
        .slice(0, 5)
        .map((e) => ({ question: String(e.question).slice(0, 400), answer: String(e.answer ?? "").slice(0, 200) }));
      return { task: String(data?.task ?? "").slice(0, 300), method: String(data?.method ?? "").slice(0, 400), examples };
    }

    if (mode === "oral") {
      const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 120) : "";
      if (!topic) throw new LiveError("invalid-topic");
      const raw = cleanTurns(body.messages);
      if (body.finish === true) {
        if (raw.length === 0) throw new LiveError("invalid-message");
        const text = await run({
          system: oralFinishPrompt(locale, topic),
          turns: [{ role: "user", content: "Konverzace zkoušení:\n" + raw.map((t) => `${t.role === "user" ? "Žák" : "Zkoušející"}: ${t.content}`).join("\n") }],
          maxTokens: 500,
        });
        const d = extractJson<{ score?: number; right?: unknown; missing?: unknown; advice?: string }>(text);
        return {
          score: Math.min(10, Math.max(0, Math.round(Number(d?.score) || 0))),
          right: strList(d?.right),
          missing: strList(d?.missing),
          advice: String(d?.advice ?? "").slice(0, 300),
        };
      }
      // První otázku položí zkoušející sám, proto se konverzace může začít prázdnou zprávou.
      const turns: ChatTurn[] = raw.length ? raw : [{ role: "user", content: "Jsem připravený/á, začni zkoušet." }];
      return { reply: await run({ system: oralPrompt(locale, topic), turns, maxTokens: 300 }) };
    }

    if (mode === "notes") {
      const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_NOTES_CHARS) : "";
      const image = parseImage(body.image);
      if (!text && !image) throw new LiveError("invalid-message");
      const out = await run({
        system: notesPrompt(locale),
        turns: [{ role: "user", content: text ? `Moje poznámky:\n${text}` : "Udělej kartičky z poznámek na fotce." }],
        image,
        maxTokens: 1200,
      });
      const d = extractJson<{ title?: string; cards?: { front?: string; back?: string }[] }>(out);
      const cards = (d?.cards ?? [])
        .filter((c) => typeof c?.front === "string" && typeof c?.back === "string" && c.front.trim() && c.back.trim())
        .slice(0, 12)
        .map((c) => ({ front: String(c.front).slice(0, 200), back: String(c.back).slice(0, 300) }));
      return { title: String(d?.title ?? "").slice(0, 80), cards };
    }

    throw new LiveError("invalid-mode");
  });
}
