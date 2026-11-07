import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { randomCode } from "@/lib/social";
import { withinRateLimit } from "@/lib/rate-limit";
import { MAX_TEAM_NAME } from "@/lib/teams/logic";
import { requireUserId } from "@/lib/teams/server";

export const dynamic = "force-dynamic";
const MAX_TEAMS_PER_USER = 20;

export async function GET() {
  return handle(async () => {
    const userId = await requireUserId();
    const rows = await prisma.teamMember.findMany({
      where: { userId },
      orderBy: { joinedAt: "asc" },
      include: { team: { include: { _count: { select: { members: true, assignments: true } } } } },
    });
    const teams = await Promise.all(
      rows.map(async (m) => {
        // Žákovi: kolik zadání ještě nesplnil (žádný pokus).
        let open = 0;
        if (m.role === "STUDENT") {
          const a = await prisma.assignment.findMany({ where: { teamId: m.teamId }, select: { id: true, passPercent: true } });
          const done = a.length
            ? await prisma.assignmentAttempt.findMany({ where: { userId, assignmentId: { in: a.map((x) => x.id) } }, select: { assignmentId: true, percent: true } })
            : [];
          open = a.filter((x) => !done.some((d) => d.assignmentId === x.id && d.percent >= x.passPercent)).length;
        }
        return {
          id: m.teamId,
          name: m.team.name,
          role: m.role,
          code: m.role === "TEACHER" ? m.team.code : null,
          members: m.team._count.members,
          assignments: m.team._count.assignments,
          open,
        };
      }),
    );
    return { teams };
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
      if ((await prisma.teamMember.count({ where: { userId } })) >= MAX_TEAMS_PER_USER) throw new LiveError("too-many-teams");
      await prisma.teamMember.upsert({
        where: { teamId_userId: { teamId: team.id, userId } },
        create: { teamId: team.id, userId, role: "STUDENT" },
        update: {},
      });
      return { id: team.id };
    }
    throw new LiveError("bad-action");
  });
}
