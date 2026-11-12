import { generateText } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { withinRateLimit } from "@/lib/rate-limit";
import { dueState, isAssignedTo } from "@/lib/teams/logic";
import { requireUserId } from "@/lib/teams/server";
import { buildContext, cleanTurns, systemPrompt, type AssistantTeam, type ChatTurn } from "@/lib/teams/assistant-logic";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

async function generate(system: string, turns: ChatTurn[]): Promise<string> {
  return generateText({ system, turns, maxTokens: 400 });
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
