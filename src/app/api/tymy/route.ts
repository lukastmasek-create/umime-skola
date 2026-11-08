import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { randomCode } from "@/lib/social";
import { withinRateLimit } from "@/lib/rate-limit";
import { dueState, isAssignedTo, joinOutcome, MAX_TEAM_NAME, SOON_HOURS } from "@/lib/teams/logic";
import { requireUserId } from "@/lib/teams/server";

export const dynamic = "force-dynamic";
const MAX_TEAMS_PER_USER = 20;

export async function GET() {
  return handle(async () => {
    const userId = await requireUserId();
    const rows = await prisma.teamMember.findMany({
      where: { userId },
      orderBy: { joinedAt: "asc" },
      include: { team: { select: { id: true, name: true, code: true } } },
    });
    const activeRows = rows.filter((m) => m.status === "ACTIVE");
    const teamIds = activeRows.map((m) => m.teamId);
    const [counts, assignments, attempts] = await Promise.all([
      prisma.teamMember.groupBy({ by: ["teamId"], where: { teamId: { in: teamIds }, status: "ACTIVE" }, _count: { _all: true } }),
      prisma.assignment.findMany({
        where: { teamId: { in: teamIds } },
        select: { id: true, teamId: true, title: true, passPercent: true, dueAt: true, targets: { select: { groupId: true, userId: true } } },
      }),
      prisma.assignmentAttempt.findMany({ where: { userId, assignment: { teamId: { in: teamIds } } }, select: { assignmentId: true, percent: true } }),
    ]);

    const now = new Date();
    const urgent: { teamId: string; teamName: string; assignmentId: string; title: string; dueAt: Date; overdue: boolean }[] = [];
    const teams = activeRows.map((m) => {
      const mine = assignments.filter((a) => a.teamId === m.teamId && (m.role === "TEACHER" || isAssignedTo(a.targets, m)));
      let open = 0;
      let soon = 0;
      let overdue = 0;
      if (m.role === "STUDENT") {
        for (const a of mine) {
          if (attempts.some((x) => x.assignmentId === a.id && x.percent >= a.passPercent)) continue;
          open++;
          const state = dueState(a.dueAt, now);
          if (state === "soon") soon++;
          if (state === "overdue") overdue++;
          if (a.dueAt && (state === "soon" || state === "overdue")) urgent.push({ teamId: m.teamId, teamName: m.team.name, assignmentId: a.id, title: a.title, dueAt: a.dueAt, overdue: state === "overdue" });
        }
      }
      return {
        id: m.teamId,
        name: m.team.name,
        role: m.role,
        code: m.role === "TEACHER" ? m.team.code : null,
        members: counts.find((c) => c.teamId === m.teamId)?._count._all ?? 0,
        assignments: mine.length,
        open,
        soon,
        overdue,
      };
    });
    urgent.sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
    const pending = rows.filter((m) => m.status === "PENDING").map((m) => ({ id: m.teamId, name: m.team.name }));
    return { teams, pending, urgent: urgent.slice(0, 8), soonHours: SOON_HOURS };
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const userId = await requireUserId();
    const body = await readJson(request);
    if (!(await withinRateLimit(`teams:${userId}`, 30, 600))) throw new LiveError("rate-limited", 429);
    if (body.action === "create") {
      const name = typeof body.name === "string" ? body.name.replace(/\s+/g, " ").trim().slice(0, MAX_TEAM_NAME) : "";
      if (name.length < 2) throw new LiveError("invalid-name");
      if ((await prisma.teamMember.count({ where: { userId } })) >= MAX_TEAMS_PER_USER) throw new LiveError("too-many-teams");
      const role = body.asTeacher === true ? "TEACHER" : "STUDENT";
      for (let i = 0; i < 5; i++) {
        try {
          const team = await prisma.team.create({ data: { name, code: randomCode(), members: { create: { userId, role } } } });
          return { id: team.id };
        } catch (e) {
          if ((e as { code?: string }).code !== "P2002") throw e;
        }
      }
      throw new LiveError("unavailable", 503);
    }
    if (body.action === "join") {
      const code = typeof body.code === "string" ? body.code.trim().toUpperCase().slice(0, 12) : "";
      const team = await prisma.team.findUnique({ where: { code } });
      if (!team) throw new LiveError("unknown-code", 404);
      const existing = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId: team.id, userId } } });
      if (existing?.status === "ACTIVE") return { id: team.id };
      if (existing) return { id: team.id, pending: true };
      const outcome = joinOutcome(team.joinMode);
      if (outcome === "closed") throw new LiveError("join-closed", 403);
      if ((await prisma.teamMember.count({ where: { userId } })) >= MAX_TEAMS_PER_USER) throw new LiveError("too-many-teams");
      await prisma.teamMember.create({ data: { teamId: team.id, userId, role: "STUDENT", status: outcome === "pending" ? "PENDING" : "ACTIVE" } });
      return outcome === "pending" ? { id: team.id, pending: true } : { id: team.id };
    }
    if (body.action === "cancelRequest") {
      await prisma.teamMember.deleteMany({ where: { teamId: String(body.teamId ?? ""), userId, status: "PENDING" } });
      return { ok: true };
    }
    throw new LiveError("bad-action");
  });
}
