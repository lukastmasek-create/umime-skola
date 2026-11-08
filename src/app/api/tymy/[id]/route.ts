import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import {
  cleanJoinMode, cleanMaxAttempts, cleanSnapshot, dueState, isAssignedTo, MAX_GROUPS, MAX_QUESTIONS, MAX_TEAM_NAME, parseEmails, shuffle, splitRandomly,
  type SnapQuestion, type Target,
} from "@/lib/teams/logic";
import { requireMember, requireUserId } from "@/lib/teams/server";
import { randomCode } from "@/lib/social";
import { cleanSetQuestions } from "@/lib/live/logic";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: RouteContext<"/api/tymy/[id]">) {
  const { id } = await ctx.params;
  return handle(async () => {
    const userId = await requireUserId();
    const me = await requireMember(id, userId);
    const team = await prisma.team.findUniqueOrThrow({ where: { id } });
    const isTeacher = me.role === "TEACHER";
    const [rows, groups] = await Promise.all([
      prisma.teamMember.findMany({
        where: { teamId: id },
        include: { user: { select: { id: true, name: true, email: isTeacher } } },
        orderBy: { joinedAt: "asc" },
      }),
      prisma.teamGroup.findMany({ where: { teamId: id }, orderBy: { createdAt: "asc" } }),
    ]);
    const members = rows.filter((m) => m.status === "ACTIVE");
    const assignmentsAll = await prisma.assignment.findMany({
      where: { teamId: id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, description: true, maxAttempts: true, passPercent: true, dueAt: true, createdAt: true, questions: true, targets: { select: { groupId: true, userId: true } } },
    });
    // Archiv je v samostatné tabulce; chybí-li (starší databáze), nic není archivované.
    const archived = new Set((await prisma.assignmentArchive.findMany({ select: { assignmentId: true }, where: { assignmentId: { in: assignmentsAll.map((a) => a.id) } } }).catch(() => [])).map((x) => x.assignmentId));
    const assignments = (isTeacher ? assignmentsAll : assignmentsAll.filter((a) => isAssignedTo(a.targets, me) && !archived.has(a.id)));
    const ids = assignments.map((a) => a.id);
    const students = members.filter((m) => m.role === "STUDENT");
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
      joinMode: team.joinMode,
      members: members.map((m) => ({ id: m.userId, name: m.user.name, email: isTeacher ? m.user.email : null, role: m.role, groupId: m.groupId })),
      pending: isTeacher ? rows.filter((m) => m.status === "PENDING").map((m) => ({ id: m.userId, name: m.user.name, email: m.user.email, requestedAt: m.joinedAt })) : [],
      groups: groups.map((g) => ({ id: g.id, name: g.name, members: members.filter((m) => m.groupId === g.id).length })),
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
          due: dueState(a.dueAt),
          archived: archived.has(a.id),
        };
        if (isTeacher) {
          const mineStudents = students.filter((s) => isAssignedTo(a.targets, s)).map((s) => s.userId);
          const at = attempts.filter((x) => x.assignmentId === a.id);
          const done = mineStudents.filter((s) => at.some((x) => x.userId === s && x.percent >= a.passPercent)).length;
          const viewed = mineStudents.filter((s) => views.some((v) => v.userId === s && v.assignmentId === a.id)).length;
          return {
            ...base, students: mineStudents.length, done, viewed,
            groupIds: a.targets.flatMap((t) => (t.groupId ? [t.groupId] : [])),
            userIds: a.targets.flatMap((t) => (t.userId ? [t.userId] : [])),
          };
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

const MAX_IDS = 200;
const idList = (raw: unknown): string[] => (Array.isArray(raw) ? [...new Set(raw.filter((x): x is string => typeof x === "string"))].slice(0, MAX_IDS) : []);

/** Publikum zadání: prázdné = celá třída. Neplatné cíle zadání nezúží potichu na všechny, ale odmítnou. */
async function resolveAudience(teamId: string, raw: unknown): Promise<Target[]> {
  const a = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const groupIds = idList(a.groupIds);
  const userIds = idList(a.userIds);
  if (!groupIds.length && !userIds.length) return [];
  const [groups, users] = await Promise.all([
    groupIds.length ? prisma.teamGroup.findMany({ where: { teamId, id: { in: groupIds } }, select: { id: true } }) : [],
    userIds.length ? prisma.teamMember.findMany({ where: { teamId, status: "ACTIVE", role: "STUDENT", userId: { in: userIds } }, select: { userId: true } }) : [],
  ]);
  if (groups.length !== groupIds.length || users.length !== userIds.length) throw new LiveError("bad-target");
  return [...groups.map((g) => ({ groupId: g.id, userId: null })), ...users.map((u) => ({ groupId: null, userId: u.userId }))];
}

const cleanDue = (raw: unknown): Date | null => {
  const d = typeof raw === "string" && raw ? new Date(raw) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

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
      case "addMembers": {
        const { valid, invalid } = parseEmails(body.emails);
        if (!valid.length && !invalid.length) throw new LiveError("invalid-email");
        const role = body.role === "TEACHER" ? "TEACHER" : "STUDENT";
        const users = valid.length ? await prisma.user.findMany({ where: { OR: valid.map((email) => ({ email: { equals: email, mode: "insensitive" as const } })) }, select: { id: true, email: true } }) : [];
        const found = new Set(users.map((u) => u.email?.toLowerCase()));
        const notFound = [...valid.filter((e) => !found.has(e.toLowerCase())), ...invalid];
        for (const u of users) {
          // Kdo čekal na schválení, je přidáním učitelem rovnou členem.
          await prisma.teamMember.upsert({ where: { teamId_userId: { teamId: id, userId: u.id } }, create: { teamId: id, userId: u.id, role }, update: { status: "ACTIVE" } });
        }
        return { added: users.length, notFound };
      }
      case "removeMember": {
        const target = String(body.userId ?? "");
        if (target === userId) throw new LiveError("use-leave");
        await prisma.teamMember.deleteMany({ where: { teamId: id, userId: target } });
        return { ok: true };
      }
      case "setRole": {
        const target = String(body.userId ?? "");
        if (target === userId) throw new LiveError("use-leave");
        const role = body.role === "TEACHER" ? "TEACHER" : "STUDENT";
        const r = await prisma.teamMember.updateMany({ where: { teamId: id, userId: target, status: "ACTIVE" }, data: { role, ...(role === "TEACHER" ? { groupId: null } : {}) } });
        if (!r.count) throw new LiveError("user-not-found", 404);
        return { ok: true };
      }
      case "approve": {
        const target = body.all === true ? undefined : String(body.userId ?? "");
        await prisma.teamMember.updateMany({ where: { teamId: id, status: "PENDING", ...(target ? { userId: target } : {}) }, data: { status: "ACTIVE" } });
        return { ok: true };
      }
      case "reject": {
        await prisma.teamMember.deleteMany({ where: { teamId: id, status: "PENDING", userId: String(body.userId ?? "") } });
        return { ok: true };
      }
      case "setJoinMode": {
        const joinMode = cleanJoinMode(body.joinMode);
        if (!joinMode) throw new LiveError("bad-action");
        await prisma.team.update({ where: { id }, data: { joinMode } });
        return { ok: true };
      }
      case "regenCode": {
        for (let i = 0; i < 5; i++) {
          try {
            const t = await prisma.team.update({ where: { id }, data: { code: randomCode() }, select: { code: true } });
            return { code: t.code };
          } catch (e) {
            if ((e as { code?: string }).code !== "P2002") throw e;
          }
        }
        throw new LiveError("unavailable", 503);
      }
      case "rename": {
        const name = typeof body.name === "string" ? body.name.replace(/\s+/g, " ").trim().slice(0, MAX_TEAM_NAME) : "";
        if (name.length < 2) throw new LiveError("invalid-name");
        await prisma.team.update({ where: { id }, data: { name } });
        return { ok: true };
      }
      case "createGroup": {
        const name = typeof body.name === "string" ? body.name.replace(/\s+/g, " ").trim().slice(0, 40) : "";
        if (name.length < 1) throw new LiveError("invalid-name");
        if ((await prisma.teamGroup.count({ where: { teamId: id } })) >= MAX_GROUPS) throw new LiveError("too-many-groups");
        const g = await prisma.teamGroup.create({ data: { teamId: id, name } });
        return { id: g.id };
      }
      case "renameGroup": {
        const name = typeof body.name === "string" ? body.name.replace(/\s+/g, " ").trim().slice(0, 40) : "";
        if (name.length < 1) throw new LiveError("invalid-name");
        await prisma.teamGroup.updateMany({ where: { id: String(body.groupId ?? ""), teamId: id }, data: { name } });
        return { ok: true };
      }
      case "deleteGroup": {
        const groupId = String(body.groupId ?? "");
        const own = await prisma.assignmentTarget.findMany({ where: { groupId, assignment: { teamId: id } }, select: { assignmentId: true } });
        if (own.length) {
          // Zadání určené jen téhle skupině by smazáním cíle potichu platilo pro celou třídu.
          const others = await prisma.assignmentTarget.findMany({ where: { assignmentId: { in: own.map((o) => o.assignmentId) }, NOT: { groupId } }, select: { assignmentId: true } });
          if (own.some((o) => !others.some((x) => x.assignmentId === o.assignmentId))) throw new LiveError("group-in-use", 409);
        }
        await prisma.teamGroup.deleteMany({ where: { id: groupId, teamId: id } });
        return { ok: true };
      }
      case "setGroup": {
        const groupId = body.groupId ? String(body.groupId) : null;
        if (groupId && !(await prisma.teamGroup.findFirst({ where: { id: groupId, teamId: id }, select: { id: true } }))) throw new LiveError("bad-target");
        const r = await prisma.teamMember.updateMany({ where: { teamId: id, userId: String(body.userId ?? ""), status: "ACTIVE", role: "STUDENT" }, data: { groupId } });
        if (!r.count) throw new LiveError("user-not-found", 404);
        return { ok: true };
      }
      case "bulkSetGroup": {
        const groupId = body.groupId ? String(body.groupId) : null;
        if (groupId && !(await prisma.teamGroup.findFirst({ where: { id: groupId, teamId: id }, select: { id: true } }))) throw new LiveError("bad-target");
        await prisma.teamMember.updateMany({ where: { teamId: id, userId: { in: idList(body.userIds) }, status: "ACTIVE", role: "STUDENT" }, data: { groupId } });
        return { ok: true };
      }
      case "bulkRemove": {
        const ids = idList(body.userIds).filter((u) => u !== userId);
        await prisma.teamMember.deleteMany({ where: { teamId: id, userId: { in: ids } } });
        return { ok: true };
      }
      case "archiveAssignment": {
        const assignmentId = String(body.assignmentId ?? "");
        if (!(await prisma.assignment.findFirst({ where: { id: assignmentId, teamId: id }, select: { id: true } }))) throw new LiveError("assignment-not-found", 404);
        if (body.archived) await prisma.assignmentArchive.upsert({ where: { assignmentId }, create: { assignmentId }, update: {} });
        else await prisma.assignmentArchive.deleteMany({ where: { assignmentId } });
        return { ok: true };
      }
      case "randomGroups": {
        const count = Math.min(MAX_GROUPS, Math.max(2, Math.floor(Number(body.count)) || 2));
        const prefix = typeof body.prefix === "string" && body.prefix.trim() ? body.prefix.trim().slice(0, 30) : "Group";
        const existing = await prisma.teamGroup.findMany({ where: { teamId: id }, orderBy: { createdAt: "asc" }, take: count });
        const groups = [...existing];
        // Použije stávající skupiny a chybějící založí, aby se nerozbila zadání určená skupinám.
        for (let i = existing.length; i < count; i++) groups.push(await prisma.teamGroup.create({ data: { teamId: id, name: `${prefix} ${i + 1}` } }));
        const students = await prisma.teamMember.findMany({ where: { teamId: id, status: "ACTIVE", role: "STUDENT" }, select: { userId: true } });
        const parts = splitRandomly(students.map((s) => s.userId), count);
        await prisma.$transaction(parts.map((ids, i) => prisma.teamMember.updateMany({ where: { teamId: id, userId: { in: ids } }, data: { groupId: groups[i].id } })));
        return { ok: true };
      }
      case "createAssignment": {
        const targets = await resolveAudience(id, body.audience);
        const { questions, title: srcTitle } = await buildQuestions(body, userId);
        if (questions.length === 0) throw new LiveError("no-questions");
        const title = typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 80) : srcTitle.slice(0, 80);
        const description = typeof body.description === "string" ? body.description.trim().slice(0, 1000) : "";
        const pass = Math.min(100, Math.max(0, Math.floor(Number(body.passPercent)) || 0));
        const a = await prisma.assignment.create({
          data: {
            teamId: id, title, description, questions, passPercent: pass,
            maxAttempts: cleanMaxAttempts(body.maxAttempts),
            dueAt: cleanDue(body.dueAt),
            targets: { create: targets },
          },
        });
        return { id: a.id };
      }
      case "updateAssignment": {
        const assignmentId = String(body.assignmentId ?? "");
        const a = await prisma.assignment.findFirst({ where: { id: assignmentId, teamId: id }, select: { id: true } });
        if (!a) throw new LiveError("assignment-not-found", 404);
        const data: Record<string, unknown> = {};
        if (typeof body.title === "string") {
          const title = body.title.trim().slice(0, 80);
          if (!title) throw new LiveError("invalid-name");
          data.title = title;
        }
        if (typeof body.description === "string") data.description = body.description.trim().slice(0, 1000);
        if ("passPercent" in body) data.passPercent = Math.min(100, Math.max(0, Math.floor(Number(body.passPercent)) || 0));
        if ("maxAttempts" in body) data.maxAttempts = cleanMaxAttempts(body.maxAttempts);
        if ("dueAt" in body) data.dueAt = cleanDue(body.dueAt);
        const targets = "audience" in body ? await resolveAudience(id, body.audience) : null;
        await prisma.$transaction([
          prisma.assignment.update({ where: { id: assignmentId }, data }),
          ...(targets ? [prisma.assignmentTarget.deleteMany({ where: { assignmentId } }), prisma.assignmentTarget.createMany({ data: targets.map((t) => ({ ...t, assignmentId })) })] : []),
        ]);
        return { ok: true };
      }
      case "copyAssignment": {
        const a = await prisma.assignment.findFirst({ where: { id: String(body.assignmentId ?? ""), teamId: id } });
        if (!a) throw new LiveError("assignment-not-found", 404);
        const targetTeamId = String(body.targetTeamId ?? "");
        if (targetTeamId !== id) await requireMember(targetTeamId, userId, true);
        const copy = await prisma.assignment.create({
          data: { teamId: targetTeamId, title: a.title, description: a.description, questions: cleanSnapshot(a.questions), passPercent: a.passPercent, maxAttempts: a.maxAttempts, dueAt: a.dueAt },
        });
        return { id: copy.id, teamId: targetTeamId };
      }
      case "deleteAssignment": {
        await prisma.assignment.deleteMany({ where: { id: String(body.assignmentId ?? ""), teamId: id } });
        return { ok: true };
      }
    }
    throw new LiveError("bad-action");
  });
}
