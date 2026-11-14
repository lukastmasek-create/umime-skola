import { auth } from "@/lib/auth";
import { generateText } from "@/lib/ai";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { cleanTurns } from "@/lib/teams/assistant-logic";
import { cleanContext, codeAssistPrompt } from "@/lib/code-assist";

export const dynamic = "force-dynamic";

// AI pomocník s kódem. Dostupný i hostům (limit podle IP), přihlášení mají vyšší limit.
export async function POST(request: Request) {
  return handle(async () => {
    const session = await auth().catch(() => null);
    const userId = session?.user?.id ?? null;
    const ok = userId
      ? await withinRateLimit(`code-ai:u:${userId}`, 40, 600)
      : await withinRateLimit(`code-ai:ip:${clientIp(request)}`, 12, 600);
    if (!ok) throw new LiveError("rate-limited", 429);

    const body = await readJson(request);
    const turns = cleanTurns(body.messages);
    if (turns.length === 0) throw new LiveError("invalid-message");
    const ctx = body.useCode === false ? null : cleanContext(body.context);

    let reply = "";
    try {
      reply = await generateText({ system: codeAssistPrompt(ctx), turns, maxTokens: 600 });
    } catch (e) {
      if (e instanceof LiveError) throw e;
      console.error("code-asistent: generování selhalo", e);
    }
    if (!reply) throw new LiveError("ai-unavailable", 503);
    return { reply };
  });
}
