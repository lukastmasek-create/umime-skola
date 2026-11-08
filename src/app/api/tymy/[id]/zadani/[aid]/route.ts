import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { withinRateLimit } from "@/lib/rate-limit";
import { attemptsLeft, cleanSnapshot, completedLate, gradeAttempt, isAssignedTo, questionStats, studentStatus, toPublic, wrongIndexes, type AnswerInput } from "@/lib/teams/logic";
import { DAILY_ACTIVITY_XP_CAP, MAX_XP_PER_CLAIM } from "@/lib/progression";
import { ACTIVITY_SOURCES } from "@/lib/gamify";
import { loadAssignment, requireAssigned, requireMember, requireUserId } from "@/lib/teams/server";

export const dynamic = "force-dynamic";
type Ctx = RouteContext<"/api/tymy/[id]/zadani/[aid]">;

export async function GET(_req: Request, ctx: Ctx) {
  const { id, aid } = await ctx.params;
  return handle(async () => {
    const userId = await requireUserId();
    const me = await requireMember(id, userId);
    const a = await loadAssignment(id, aid);
    const meta = { id: a.id, title: a.title, description: a.description, maxAttempts: a.maxAttempts, passPercent: a.passPercent, dueAt: a.dueAt };
    const snap = cleanSnapshot(a.questions);

    if (me.role === "TEACHER") {
      const [members, targets, groups] = await Promise.all([
        prisma.teamMember.findMany({ where: { teamId: id, role: "STUDENT", status: "ACTIVE" }, include: { user: { select: { name: true, email: true } } }, orderBy: { joinedAt: "asc" } }),
        prisma.assignmentTarget.findMany({ where: { assignmentId: aid }, select: { groupId: true, userId: true } }),
        prisma.teamGroup.findMany({ where: { teamId: id }, select: { id: true, name: true } }),
      ]);
      const students = members.filter((s) => isAssignedTo(targets, s));
      const [attempts, views] = await Promise.all([
        prisma.assignmentAttempt.findMany({ where: { assignmentId: aid }, orderBy: { createdAt: "asc" }, select: { userId: true, percent: true, createdAt: true, wrong: true } }),
        prisma.assignmentView.findMany({ where: { assignmentId: aid }, select: { userId: true, viewedAt: true } }),
      ]);
      const feedback = await prisma.assignmentFeedback.findMany({ where: { assignmentId: aid }, select: { userId: true, text: true } }).catch(() => []);
      const stats = questionStats(snap.length, attempts.filter((x) => students.some((s) => s.userId === x.userId)));
      return {
        role: "TEACHER",
        assignment: { ...meta, groupIds: targets.flatMap((t) => (t.groupId ? [t.groupId] : [])), userIds: targets.flatMap((t) => (t.userId ? [t.userId] : [])) },
        groups,
        everyone: targets.length === 0,
        questions: snap.map((q, i) => ({ prompt: q.prompt, answer: q.answers.length ? q.answers.join(" / ") : q.options[q.correctIndex], attempts: stats[i].attempts, wrong: stats[i].wrong })),
        rows: students.map((s) => {
          const at = attempts.filter((x) => x.userId === s.userId);
          const best = at.reduce((m, x) => Math.max(m, x.percent), 0);
          const view = views.find((v) => v.userId === s.userId);
          return {
            userId: s.userId,
            comment: feedback.find((f) => f.userId === s.userId)?.text ?? "",
            name: s.user.name || s.user.email || null,
            groupId: s.groupId,
            viewedAt: view?.viewedAt ?? null,
            attempts: at.length,
            best,
            last: at.length ? at[at.length - 1].percent : null,
            lastAt: at.length ? at[at.length - 1].createdAt : null,
            late: completedLate(at, a.passPercent, a.dueAt),
            status: studentStatus({ viewed: !!view, attempts: at.length, best, passPercent: a.passPercent }),
          };
        }),
      };
    }

    await requireAssigned(aid, me);
    await prisma.assignmentView.upsert({ where: { assignmentId_userId: { assignmentId: aid, userId } }, create: { assignmentId: aid, userId }, update: {} });
    const mine = await prisma.assignmentAttempt.findMany({ where: { assignmentId: aid, userId }, orderBy: { createdAt: "asc" }, select: { percent: true, createdAt: true } });
    const feedback = await prisma.assignmentFeedback.findUnique({ where: { assignmentId_userId: { assignmentId: aid, userId } }, select: { text: true } }).catch(() => null);
    return {
      role: "STUDENT",
      feedback: feedback?.text ?? "",
      assignment: meta,
      questions: toPublic(snap),
      attempts: mine,
      left: attemptsLeft(a.maxAttempts, mine.length),
      best: mine.reduce((m, x) => Math.max(m, x.percent), 0),
    };
  });
}

export async function POST(request: Request, ctx: Ctx) {
  const { id, aid } = await ctx.params;
  return handle(async () => {
    const userId = await requireUserId();
    const me = await requireMember(id, userId);
    if (me.role === "TEACHER") {
      // Učitel nepíše pokusy, ale může žákovi zanechat komentář k zadání.
      const body = await readJson(request);
      if (body.action !== "feedback") throw new LiveError("teacher-cannot-submit", 403);
      await loadAssignment(id, aid);
      const target = String(body.userId ?? "");
      const student = await prisma.teamMember.findFirst({ where: { teamId: id, userId: target, role: "STUDENT", status: "ACTIVE" }, select: { userId: true } });
      if (!student) throw new LiveError("user-not-found", 404);
      const text = typeof body.text === "string" ? body.text.trim().slice(0, 1000) : "";
      if (!text) await prisma.assignmentFeedback.deleteMany({ where: { assignmentId: aid, userId: target } });
      else await prisma.assignmentFeedback.upsert({ where: { assignmentId_userId: { assignmentId: aid, userId: target } }, create: { assignmentId: aid, userId: target, text }, update: { text, updatedAt: new Date() } });
      return { ok: true };
    }
    if (!(await withinRateLimit(`team-attempt:${userId}`, 60, 600))) throw new LiveError("rate-limited", 429);
    await requireAssigned(aid, me);
    const a = await loadAssignment(id, aid);
    const body = await readJson(request);
    const answers = (body.answers && typeof body.answers === "object" ? body.answers : {}) as Record<string, AnswerInput>;
    const snap = cleanSnapshot(a.questions);
    const result = gradeAttempt(snap, answers);

    // Pokus se zapisuje transakčně s kontrolou limitu (dvě rychlá odeslání nepřekročí limit).
    const saved = await prisma.$transaction(async (tx) => {
      const prev = await tx.assignmentAttempt.findMany({ where: { assignmentId: aid, userId }, select: { correct: true } });
      if (a.maxAttempts != null && prev.length >= a.maxAttempts) return null;
      await tx.assignmentAttempt.create({ data: { assignmentId: aid, userId, percent: result.percent, correct: result.correct, total: result.total, wrong: wrongIndexes(result.review) } });
      return { used: prev.length + 1, bestBefore: prev.reduce((m, x) => Math.max(m, x.correct), 0) };
    });
    if (saved == null) throw new LiveError("no-attempts-left", 409);

    // XP jako u testů (5 za správnou odpověď), ale jen za zlepšení oproti dřívějším pokusům,
    // takže opakováním stejného zadání se XP farmit nedá. Platí společný denní strop.
    let gainedXp = 0;
    const wanted = Math.max(0, result.correct - saved.bestBefore) * 5;
    if (wanted > 0) {
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);
      const usedToday = await prisma.xpEvent.aggregate({ where: { userId, source: { in: [...ACTIVITY_SOURCES] }, createdAt: { gte: startOfDay } }, _sum: { amount: true } });
      gainedXp = Math.min(wanted, MAX_XP_PER_CLAIM, Math.max(0, DAILY_ACTIVITY_XP_CAP - (usedToday._sum.amount ?? 0)));
      if (gainedXp > 0) await prisma.xpEvent.create({ data: { userId, amount: gainedXp, source: "test" } });
    }
    return { ...result, gainedXp, passed: result.percent >= a.passPercent, left: attemptsLeft(a.maxAttempts, saved.used) };
  });
}
