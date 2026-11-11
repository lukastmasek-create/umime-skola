import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/live/http";
import { completedLate, dueState, isAssignedTo, studentStatus } from "@/lib/teams/logic";
import { requireMember, requireUserId } from "@/lib/teams/server";

export const dynamic = "force-dynamic";

// Matice třída × zadání pro učitele: řádky žáci, sloupce zadání, v buňce stav, nejlepší výsledek a pozdní splnění.
export async function GET(_req: Request, ctx: RouteContext<"/api/tymy/[id]/prehled">) {
  const { id } = await ctx.params;
  return handle(async () => {
    const userId = await requireUserId();
    await requireMember(id, userId, true);
    const [members, groups, assignments] = await Promise.all([
      prisma.teamMember.findMany({ where: { teamId: id, role: "STUDENT", status: "ACTIVE" }, include: { user: { select: { name: true, email: true, points: true } } }, orderBy: { joinedAt: "asc" } }),
      prisma.teamGroup.findMany({ where: { teamId: id }, orderBy: { createdAt: "asc" }, select: { id: true, name: true } }),
      prisma.assignment.findMany({
        where: { teamId: id },
        orderBy: { createdAt: "asc" },
        select: { id: true, title: true, passPercent: true, dueAt: true, targets: { select: { groupId: true, userId: true } } },
      }),
    ]);
    const ids = assignments.map((a) => a.id);
    const [attempts, views] = ids.length
      ? await Promise.all([
          prisma.assignmentAttempt.findMany({ where: { assignmentId: { in: ids } }, orderBy: { createdAt: "asc" }, select: { assignmentId: true, userId: true, percent: true, createdAt: true } }),
          prisma.assignmentView.findMany({ where: { assignmentId: { in: ids } }, select: { assignmentId: true, userId: true } }),
        ])
      : [[], []];

    const cells: Record<string, Record<string, { status: string; best: number; attempts: number; late: boolean; overdue: boolean }>> = {};
    for (const a of assignments) {
      const row: (typeof cells)[string] = {};
      const overdue = dueState(a.dueAt) === "overdue";
      for (const s of members) {
        if (!isAssignedTo(a.targets, s)) continue;
        const at = attempts.filter((x) => x.assignmentId === a.id && x.userId === s.userId);
        const best = at.reduce((m, x) => Math.max(m, x.percent), 0);
        const status = studentStatus({ viewed: views.some((v) => v.assignmentId === a.id && v.userId === s.userId), attempts: at.length, best, passPercent: a.passPercent });
        row[s.userId] = { status, best, attempts: at.length, late: completedLate(at, a.passPercent, a.dueAt), overdue: overdue && status !== "done" };
      }
      cells[a.id] = row;
    }
    return {
      students: members.map((s) => ({ id: s.userId, name: s.user.name || s.user.email || null, groupId: s.groupId, points: s.user.points })),
      groups,
      assignments: assignments.map((a) => ({ id: a.id, title: a.title, passPercent: a.passPercent, dueAt: a.dueAt })),
      cells,
    };
  });
}
