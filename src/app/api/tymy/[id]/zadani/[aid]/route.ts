import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { withinRateLimit } from "@/lib/rate-limit";
import { attemptsLeft, cleanSnapshot, gradeAttempt, studentStatus, toPublic, type AnswerInput } from "@/lib/teams/logic";
import { DAILY_ACTIVITY_XP_CAP, MAX_XP_PER_CLAIM } from "@/lib/progression";
import { ACTIVITY_SOURCES } from "@/lib/gamify";
import { loadAssignment, requireMember, requireUserId } from "@/lib/teams/server";

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
      const students = await prisma.teamMember.findMany({ where: { teamId: id, role: "STUDENT" }, include: { user: { select: { name: true, email: true } } }, orderBy: { joinedAt: "asc" } });
      const [attempts, views] = await Promise.all([
        prisma.assignmentAttempt.findMany({ where: { assignmentId: aid }, orderBy: { createdAt: "asc" }, select: { userId: true, percent: true, createdAt: true } }),
        prisma.assignmentView.findMany({ where: { assignmentId: aid }, select: { userId: true, viewedAt: true } }),
      ]);
      return {
        role: "TEACHER",
        assignment: meta,
        questions: snap.map((q) => ({ prompt: q.prompt, answer: q.answers.length ? q.answers.join(" / ") : q.options[q.correctIndex] })),
        rows: students.map((s) => {
          const at = attempts.filter((x) => x.userId === s.userId);
          const best = at.reduce((m, x) => Math.max(m, x.percent), 0);
          const view = views.find((v) => v.userId === s.userId);
          return {
            userId: s.userId,
            name: s.user.name || s.user.email || null,
            viewedAt: view?.viewedAt ?? null,
            attempts: at.length,
            best,
            last: at.length ? at[at.length - 1].percent : null,
            lastAt: at.length ? at[at.length - 1].createdAt : null,
            status: studentStatus({ viewed: !!view, attempts: at.length, best, passPercent: a.passPercent }),
          };
        }),
      };
    }

    await prisma.assignmentView.upsert({ where: { assignmentId_userId: { assignmentId: aid, userId } }, create: { assignmentId: aid, userId }, update: {} });
    const mine = await prisma.assignmentAttempt.findMany({ where: { assignmentId: aid, userId }, orderBy: { createdAt: "asc" }, select: { percent: true, createdAt: true } });
    return {
      role: "STUDENT",
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
    if (me.role === "TEACHER") throw new LiveError("teacher-cannot-submit", 403);
    if (!(await withinRateLimit(`team-attempt:${userId}`, 60, 600))) throw new LiveError("rate-limited", 429);
    const a = await loadAssignment(id, aid);
    const body = await readJson(request);
    const answers = (body.answers && typeof body.answers === "object" ? body.answers : {}) as Record<string, AnswerInput>;
    const snap = cleanSnapshot(a.questions);
    const result = gradeAttempt(snap, answers);

    // Pokus se zapisuje transakčně s kontrolou limitu (dvě rychlá odeslání nepřekročí limit).
    const saved = await prisma.$transaction(async (tx) => {
      const prev = await tx.assignmentAttempt.findMany({ where: { assignmentId: aid, userId }, select: { correct: true } });
      if (a.maxAttempts != null && prev.length >= a.maxAttempts) return null;
      await tx.assignmentAttempt.create({ data: { assignmentId: aid, userId, percent: result.percent, correct: result.correct, total: result.total } });
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
