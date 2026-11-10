import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { withinRateLimit } from "@/lib/rate-limit";
import { dueState, isAssignedTo } from "@/lib/teams/logic";
import { requireUserId } from "@/lib/teams/server";
import { buildContext, cleanTurns, systemPrompt, type AssistantTeam } from "@/lib/teams/assistant-logic";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

// Model a klíč jsou v prostředí: ANTHROPIC_API_KEY (na Cloudflare jako secret) a volitelně ANTHROPIC_MODEL.
const DEFAULT_MODEL = "claude-haiku-5-5";

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
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new LiveError("ai-unavailable", 503);
    if (!(await withinRateLimit(`teams-ai:${userId}`, 20, 600))) throw new LiveError("rate-limited", 429);

    const locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "cs";
    const context = buildContext(await loadTeams(userId), new Date());
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL, max_tokens: 400, system: systemPrompt(locale, context), messages: turns }),
      signal: AbortSignal.timeout(20000),
    }).catch(() => null);
    if (!res || !res.ok) {
      console.error("asistent: Anthropic API selhalo", res?.status);
      throw new LiveError("ai-unavailable", 503);
    }
    const data = (await res.json().catch(() => ({}))) as { content?: { type: string; text?: string }[] };
    const reply = (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("").trim();
    if (!reply) throw new LiveError("ai-unavailable", 503);
    return { reply };
  });
}
