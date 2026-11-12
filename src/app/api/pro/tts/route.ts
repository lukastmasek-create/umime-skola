import { generateSpeech } from "@/lib/ai";
import { LiveError } from "@/lib/live/service";
import { readJson } from "@/lib/live/http";
import { requireProUserId } from "@/lib/pro-server";
import { withinRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Hlas zkoušejícího v angličtině (Deepgram Aura-2). Mužský hlas ověř poslechem, pohlaví model neuvádí.
const SPEAKER = "orion";
const MAX_CHARS = 500;

function errorResponse(code: string, status: number): Response {
  return Response.json({ error: code }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const userId = await requireProUserId();
    if (!(await withinRateLimit(`pro-tts:${userId}`, 60, 600))) throw new LiveError("rate-limited", 429);
    const body = await readJson(request);
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text || text.length > MAX_CHARS) throw new LiveError("invalid-message");
    const audio = await generateSpeech(text, SPEAKER);
    if (!audio) throw new LiveError("ai-unavailable", 503);
    return new Response(audio, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof LiveError) return errorResponse(e.code, e.status);
    console.error("tts: generování řeči selhalo", e);
    return errorResponse("unavailable", 503);
  }
}
