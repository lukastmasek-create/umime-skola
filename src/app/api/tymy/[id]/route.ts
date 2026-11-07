import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { cleanMaxAttempts, cleanSnapshot, MAX_QUESTIONS, shuffle, type SnapQuestion } from "@/lib/teams/logic";
import { requireMember, requireUserId } from "@/lib/teams/server";
import { cleanSetQuestions } from "@/lib/live/logic";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: RouteContext<"/api/tymy/[id]">) {
  const { id } = await ctx.params;
  return handle(async () => {
    const userId = await requireUserId();
    const me = await requireMember(id, userId);
    const team = await prisma.team.findUniqueOrThrow({ where: { id } });
    const isTeacher = me.role === "TEACHER";
    const members = await prisma.teamMember.findMany({
      where: { teamId: id },
      include: { user: { select: { id: true, name: true, email: isTeacher } } },
      orderBy: { joinedAt: "asc" },
    });
    const assignments = await prisma.assignment.findMany({
      where: { teamId: id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, description: true, maxAttempts: true, passPercent: true, dueAt: true, createdAt: true, questions: true },
    });
    const ids = assignments.map((a) => a.id);
    const students = members.filter((m) => m.role === "STUDENT").map((m) => m.userId);
    const [attempts, views] = await Promise.all([
      ids.length ? prisma.assignmentAttempt.findMany({ where: { assignmentId: { in: ids }, ...(isTeacher ? {} : { userId }) }, select: { assignmentId: true, userId: true, percent: true } }) : [],
      ids.length ? prisma.assignmentView.findMany({ where: { assignmentId: { in: ids }, ...(isTeacher ? {} : { userId }) }, select: { assignmentId: true, userId: true } }) : [],
    ]);
    return {
      id: team.id,
      name: team.name,
      role: me.role,
      userId,
      code: isTeacher ? team.code : null,
      members: members.map((m) => ({ id: m.userId, name: m.user.name, email: isTeacher ? m.user.email : null, role: m.role })),
      assignments: assignments.map((a) => {
        const mine = attempts.filter((x) => x.userId === userId && x.assignmentId === a.id);
        const base = {
          id: a.id,
          title: a.title,
          description: a.description,
          maxAttempts: a.maxAttempts,
          passPercent: a.passPercent,
          dueAt: a.dueAt,
          createdAt: a.createdAt,
          questions: Array.isArray(a.questions) ? a.questions.length : 0,
        };
        if (isTeacher) {
          const at = attempts.filter((x) => x.assignmentId === a.id);
          const done = students.filter((s) => at.some((x) => x.userId === s && x.percent >= a.passPercent)).length;
          const viewed = students.filter((s) => views.some((v) => v.userId === s && v.assignmentId === a.id)).length;
          return { ...base, students: students.length, done, viewed };
        }
        return {
          ...base,
          used: mine.length,
          best: mine.reduce((m, x) => Math.max(m, x.percent), 0),
          viewed: views.some((v) => v.assignmentId === a.id),
        };
      }),
    };
  });
}

async function buildQuestions(body: Record<string, unknown>, userId: string): Promise<{ questions: SnapQuestion[]; title: string }> {
  const count = Math.min(MAX_QUESTIONS, Math.max(1, Math.floor(Number(body.count)) || 10));
  const source = body.source;
  const pick = (rows: { prompt: string; options: string[]; correctIndex: number; answers: string[]; explanation: string }[]) =>
    cleanSnapshot(shuffle(rows)).slice(0, count);
  if (source === "set") {
    const set = await prisma.questionSet.findFirst({ where: { id: String(body.setId ?? ""), ownerId: userId } });
    if (!set) throw new LiveError("set-not-found", 404);
    const qs = cleanSetQuestions(set.questions).map((q) => ({ prompt: q.prompt, options: q.options, correctIndex: q.correctIndex, answers: [], explanation: q.explanation ?? "" }));
    return { questions: cleanSnapshot(qs), title: set.title };
  }
  if (source === "course") {
    const diff = Math.floor(Number(body.difficulty));
    const course = await prisma.course.findFirst({
      where: { slug: String(body.slug ?? ""), published: true },
      select: { title: true, questions: { where: diff >= 1 && diff <= 5 ? { difficulty: diff } : {}, select: { prompt: true, options: true, correctIndex: true, answers: true, explanation: true } } },
    });
    if (!course) throw new LiveError("course-not-found", 404);
    return { questions: pick(course.questions), title: course.title };
  }
  if (source === "subject") {
    // Denní kvíz: náhodné otázky z celého předmětu.
    const subject = String(body.subject ?? "");
    const ids = await prisma.question.findMany({ where: { course: { subject: subject as never, published: true } }, select: { id: true }, take: 4000 });
    const chosen = shuffle(ids).slice(0, count * 2).map((x) => x.id);
    const rows = await prisma.question.findMany({ where: { id: { in: chosen } }, select: { prompt: true, options: true, correctIndex: true, answers: true, explanation: true } });
    return { questions: pick(rows), title: `Kvíz: ${subject.toLowerCase()}` };
  }
  throw new LiveError("bad-source");
}

export async function POST(request: Request, ctx: RouteContext<"/api/tymy/[id]">) {
  const { id } = await ctx.params;
  return handle(async () => {
    const userId = await requireUserId();
    const body = await readJson(request);
    const action = body.action;
    if (action === "leave") {
      const me = await requireMember(id, userId);
      if (me.role === "TEACHER" && (await prisma.teamMember.count({ where: { teamId: id, role: "TEACHER" } })) <= 1) {
        await prisma.team.delete({ where: { id } }); // poslední učitel odchází: tým zaniká
      } else {
        await prisma.teamMember.delete({ where: { id: me.id } });
      }
      return { ok: true };
    }
    await requireMember(id, userId, true);
    switch (action) {
      case "addMember": {
        const email = typeof body.email === "string" ? body.email.trim() : "";
        if (!email) throw new LiveError("invalid-email");
        const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } });
        if (!user) throw new LiveError("user-not-found", 404);
        const role = body.role === "TEACHER" ? "TEACHER" : "STUDENT";
        await prisma.teamMember.upsert({ where: { teamId_userId: { teamId: id, userId: user.id } }, create: { teamId: id, userId: user.id, role }, update: {} });
        return { ok: true };
      }
      case "removeMember": {
        const target = String(body.userId ?? "");
        if (target === userId) throw new LiveError("use-leave");
        await prisma.teamMember.deleteMany({ where: { teamId: id, userId: target } });
        return { ok: true };
      }
      case "rename": {
        const name = typeof body.name === "string" ? body.name.trim().slice(0, 40) : "";
        if (name.length < 2) throw new LiveError("invalid-name");
        await prisma.team.update({ where: { id }, data: { name } });
        return { ok: true };
      }
      case "createAssignment": {
        const { questions, title: srcTitle } = await buildQuestions(body, userId);
        if (questions.length === 0) throw new LiveError("no-questions");
        const title = typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 80) : srcTitle.slice(0, 80);
        const description = typeof body.description === "string" ? body.description.trim().slice(0, 1000) : "";
        const pass = Math.min(100, Math.max(0, Math.floor(Number(body.passPercent)) || 0));
        const due = typeof body.dueAt === "string" && body.dueAt ? new Date(body.dueAt) : null;
        const a = await prisma.assignment.create({
          data: {
            teamId: id, title, description, questions, passPercent: pass,
            maxAttempts: cleanMaxAttempts(body.maxAttempts),
            dueAt: due && !Number.isNaN(due.getTime()) ? due : null,
          },
        });
        return { id: a.id };
      }
      case "deleteAssignment": {
        await prisma.assignment.deleteMany({ where: { id: String(body.assignmentId ?? ""), teamId: id } });
        return { ok: true };
      }
    }
    throw new LiveError("bad-action");
  });
}
