import { getCloudflareContext } from "@opennextjs/cloudflare";
import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { withinRateLimit } from "@/lib/rate-limit";
import { dueState, isAssignedTo } from "@/lib/teams/logic";
import { requireUserId } from "@/lib/teams/server";
import { buildContext, cleanTurns, systemPrompt, type AssistantTeam, type ChatTurn } from "@/lib/teams/assistant-logic";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

// Výchozí je Cloudflare Workers AI (binding AI ve wrangler.jsonc, bez klíče, 10 000 neuronů denně zdarma).
// Když binding chybí a je nastavený ANTHROPIC_API_KEY, použije se placené Anthropic API (volitelně ANTHROPIC_MODEL).
const WORKERS_AI_MODEL = "@cf/google/gemma-4-26b-a4b-it";
const ANTHROPIC_MODEL = "claude-haiku-5-5";

type AiBinding = { run(model: string, input: Record<string, unknown>): Promise<unknown> };

function aiBinding(): AiBinding | null {
  try {
    const env = getCloudflareContext({ async: false }).env as { AI?: AiBinding; WORKERS_AI_MODEL?: string };
    return env.AI ?? null;
  } catch {
    return null; // mimo Workers kontext (lokální vývoj bez wrangleru)
  }
}

/** Text odpovědi z Workers AI: modely vrací buď { response } nebo formát chat completions. */
function workersAiText(out: unknown): string {
  const o = out as { response?: unknown; choices?: { message?: { content?: unknown } }[] } | null;
  const t = o?.response ?? o?.choices?.[0]?.message?.content;
  return typeof t === "string" ? t.trim() : "";
}

async function generate(system: string, turns: ChatTurn[]): Promise<string> {
  const ai = aiBinding();
  if (ai) {
    const model = (getCloudflareContext({ async: false }).env as { WORKERS_AI_MODEL?: string }).WORKERS_AI_MODEL || WORKERS_AI_MODEL;
    const out = await ai.run(model, {
      messages: [{ role: "system", content: system }, ...turns],
      max_tokens: 300,
      chat_template_kwargs: { enable_thinking: false },
    });
    return workersAiText(out);
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new LiveError("ai-unavailable", 503);
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || ANTHROPIC_MODEL, max_tokens: 400, system, messages: turns }),
    signal: AbortSignal.timeout(20000),
  }).catch(() => null);
  if (!res || !res.ok) {
    console.error("asistent: Anthropic API selhalo", res?.status);
    return "";
  }
  const data = (await res.json().catch(() => ({}))) as { content?: { type: string; text?: string }[] };
  return (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("").trim();
}

async function loadTeams(userId: string): Promise<AssistantTeam[]> {
  const rows = await prisma.teamMember.findMany({ where: { userId, status: "ACTIVE" }, include: { team: { select: { name: true } } } });
  const teamIds = rows.map((m) => m.teamId);
  const [assignments, attempts] = await Promise.all([
    prisma.assignment.findMany({
      where: { teamId: { in: teamIds } },
      orderBy: { dueAt: "asc" },
      select: { id: true, teamId: true, title: true, passPercent: true, dueAt: true, targets: { select: { groupId: true, userId: true } } },
    }),
    prisma.assignmentAttempt.findMany({ where: { userId, assignment: { teamId: { in: teamIds } } }, select: { assignmentId: true, percent: true } }),
  ]);
  const now = new Date();
  return rows.map((m) => ({
    name: m.team.name,
    role: m.role === "TEACHER" ? "TEACHER" : "STUDENT",
    assignments: assignments
      .filter((a) => a.teamId === m.teamId && (m.role === "TEACHER" || isAssignedTo(a.targets, m)))
      .map((a) => ({
        title: a.title,
        dueAt: a.dueAt,
        state: dueState(a.dueAt, now),
        done: attempts.some((x) => x.assignmentId === a.id && x.percent >= a.passPercent),
      })),
  }));
}

export async function POST(request: Request) {
  return handle(async () => {
    const userId = await requireUserId();
    const body = await readJson(request);
    const turns = cleanTurns(body.messages);
    if (turns.length === 0) throw new LiveError("invalid-message");
    if (!(await withinRateLimit(`teams-ai:${userId}`, 20, 600))) throw new LiveError("rate-limited", 429);

    const locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "cs";
    const context = buildContext(await loadTeams(userId), new Date());
    let reply = "";
    try {
      reply = await generate(systemPrompt(locale, context), turns);
    } catch (e) {
      if (e instanceof LiveError) throw e;
      console.error("asistent: generování selhalo", e);
    }
    if (!reply) throw new LiveError("ai-unavailable", 503);
    return { reply };
  });
}
