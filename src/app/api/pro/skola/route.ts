import { prisma } from "@/lib/prisma";
import type { Subject } from "@prisma/client";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { requireTierUserId } from "@/lib/pro-server";
import { withinRateLimit } from "@/lib/rate-limit";
import { cleanSnapshot, isAssignedTo, questionStats, shuffle, studentStatus, MAX_GROUPS, MAX_QUESTIONS, type SnapQuestion } from "@/lib/teams/logic";
import {
  activeStudents, choiceOnly, courseQuestionsBySlug, createAssignment, questionSelect, randomQuestions, requireSchoolTeacher, requireSchoolTeacherAny, reviewStates,
} from "@/lib/pro-tools/school-server";
import { PACE_GROUP_NAMES, buildLesson, GRADE_SCALE, isStuck, paceScore, splitByPace, understoodPercent, variantFor } from "@/lib/pro-tools/school";
import { courseHref } from "@/lib/pro-tools/server";
import { extractJson, generateText } from "@/lib/ai";
import { contentPrompt } from "@/lib/pro-tools/ai-prompts";
import { cleanSetQuestions } from "@/lib/live/logic";
import { SUBJECTS } from "@/lib/taxonomy";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

const str = (v: unknown) => (typeof v === "string" ? v : "");
const LESSON_SIZE = 12;
const MAX_VARIANT_STUDENTS = 60;
const IMAGE_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

/** Otázky lekce pro třídu: nejdřív ty, které činí potíže nejvíc žákům, doplněné náhodnými z kurzu. */
async function lessonQuestions(teamId: string, courseId: string): Promise<{ title: string; slug: string; questions: SnapQuestion[]; weakStudents: number }> {
  const course = await prisma.course.findFirst({ where: { id: courseId, published: true }, select: { title: true, slug: true } });
  if (!course) throw new LiveError("course-not-found", 404);
  const students = await activeStudents(teamId);
  const states = await reviewStates(students.map((s) => s.id));
  const hits = new Map<string, number>();
  const weakIds = new Set<string>();
  for (const [uid, st] of states) {
    for (const [qid, item] of Object.entries(st.items)) {
      if (item.course !== courseId || item.box > 1) continue;
      hits.set(qid, (hits.get(qid) ?? 0) + 1);
      weakIds.add(uid);
    }
  }
  const topIds = [...hits.entries()].sort((a, b) => b[1] - a[1]).slice(0, LESSON_SIZE).map(([id]) => id);
  const missed = topIds.length ? await prisma.question.findMany({ where: { id: { in: topIds } }, select: { id: true, ...questionSelect } }) : [];
  const byId = new Map(missed.map((q) => [q.id, q]));
  const ordered = choiceOnly(topIds.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : [])));
  if (ordered.length < LESSON_SIZE) {
    const seen = new Set(ordered.map((q) => q.prompt));
    const rest = await prisma.question.findMany({ where: { courseId, options: { isEmpty: false } }, select: questionSelect, take: 300 });
    for (const q of shuffle(choiceOnly(rest))) {
      if (ordered.length >= LESSON_SIZE) break;
      if (!seen.has(q.prompt)) ordered.push(q);
    }
  }
  return { title: course.title, slug: course.slug, questions: ordered, weakStudents: weakIds.size };
}

export async function GET(request: Request) {
  return handle(async () => {
    const params = new URL(request.url).searchParams;
    const view = params.get("view");

    if (view === "teams") {
      const userId = await requireTierUserId("SCHOOL");
      const rows = await prisma.teamMember.findMany({
        where: { userId, role: "TEACHER", status: "ACTIVE" },
        include: { team: { select: { id: true, name: true, _count: { select: { members: true } } } } },
      });
      return { teams: rows.map((m) => ({ id: m.team.id, name: m.team.name, members: m.team._count.members })) };
    }

    const teamId = params.get("teamId") ?? "";
    await requireSchoolTeacher(teamId);
    const students = await activeStudents(teamId);

    if (view === "assignments") {
      const rows = await prisma.assignment.findMany({ where: { teamId }, orderBy: { createdAt: "desc" }, take: 30, select: { id: true, title: true, createdAt: true } });
      return { assignments: rows };
    }

    // Mapa mezer třídy: v kterých kurzech má potíže nejvíc žáků.
    if (view === "gaps") {
      const states = await reviewStates(students.map((s) => s.id));
      const perCourse = new Map<string, { students: Set<string>; items: number }>();
      for (const [uid, st] of states) {
        for (const item of Object.values(st.items)) {
          if (!item.course || item.box > 1) continue;
          const c = perCourse.get(item.course) ?? { students: new Set<string>(), items: 0 };
          c.students.add(uid);
          c.items++;
          perCourse.set(item.course, c);
        }
      }
      const top = [...perCourse.entries()].sort((a, b) => b[1].students.size - a[1].students.size || b[1].items - a[1].items).slice(0, 10);
      const info = top.length ? await prisma.course.findMany({ where: { id: { in: top.map(([id]) => id) } }, select: { id: true, title: true, slug: true, category: true } }) : [];
      const byId = new Map(info.map((c) => [c.id, c]));
      return {
        students: students.length,
        withData: states.size,
        courses: top.flatMap(([id, c]) => {
          const course = byId.get(id);
          return course ? [{ courseId: id, title: course.title, href: courseHref(course.category, course.slug), students: c.students.size, items: c.items }] : [];
        }),
      };
    }

    // Souběžná hodina: kdo je kde u zadání, kdo se zasekl a jak si vedou skupiny.
    if (view === "live") {
      const a = await prisma.assignment.findFirst({
        where: { id: params.get("assignmentId") ?? "", teamId },
        select: { id: true, title: true, passPercent: true, dueAt: true, questions: true, targets: { select: { groupId: true, userId: true } } },
      });
      if (!a) throw new LiveError("assignment-not-found", 404);
      const [attempts, views, groups] = await Promise.all([
        prisma.assignmentAttempt.findMany({ where: { assignmentId: a.id }, select: { userId: true, percent: true } }),
        prisma.assignmentView.findMany({ where: { assignmentId: a.id }, select: { userId: true } }),
        prisma.teamGroup.findMany({ where: { teamId }, select: { id: true, name: true } }),
      ]);
      const rows = students
        .filter((s) => isAssignedTo(a.targets, { userId: s.id, groupId: s.groupId }))
        .map((s) => {
          const at = attempts.filter((x) => x.userId === s.id);
          const best = at.reduce((m, x) => Math.max(m, x.percent), 0);
          const status = studentStatus({ viewed: views.some((v) => v.userId === s.id), attempts: at.length, best, passPercent: a.passPercent });
          return { id: s.id, name: s.name, groupId: s.groupId, status, attempts: at.length, best, stuck: isStuck(at.length, best, a.passPercent) };
        });
      const groupStats = groups
        .map((g) => {
          const m = rows.filter((r) => r.groupId === g.id);
          return { id: g.id, name: g.name, members: m.length, done: m.filter((r) => r.status === "done").length, avg: m.length ? Math.round(m.reduce((s, r) => s + r.best, 0) / m.length) : 0 };
        })
        .filter((g) => g.members > 0);
      return { title: a.title, passPercent: a.passPercent, total: Array.isArray(a.questions) ? a.questions.length : 0, rows, groups: groupStats };
    }

    // Exit ticket: kolik procent třídy látku pochopilo a které otázky se nepovedly.
    if (view === "exit") {
      const a = await prisma.assignment.findFirst({
        where: { id: params.get("assignmentId") ?? "", teamId },
        select: { id: true, title: true, passPercent: true, questions: true, targets: { select: { groupId: true, userId: true } } },
      });
      if (!a) throw new LiveError("assignment-not-found", 404);
      const attempts = await prisma.assignmentAttempt.findMany({ where: { assignmentId: a.id }, select: { userId: true, percent: true, wrong: true } });
      const assigned = students.filter((s) => isAssignedTo(a.targets, { userId: s.id, groupId: s.groupId }));
      const done = assigned.filter((s) => attempts.some((x) => x.userId === s.id && x.percent >= a.passPercent)).length;
      const answered = assigned.filter((s) => attempts.some((x) => x.userId === s.id)).length;
      const qs = cleanSnapshot(a.questions);
      const stats = questionStats(qs.length, attempts);
      return {
        title: a.title,
        assigned: assigned.length,
        answered,
        understood: understoodPercent(done, assigned.length),
        questions: qs.map((q, i) => ({ prompt: q.prompt, attempts: stats[i].attempts, wrong: stats[i].wrong })),
      };
    }

    // Průvodce rodičovskými schůzkami: jedna stránka o každém žákovi.
    if (view === "meeting") {
      const [assignments, attempts, states] = await Promise.all([
        prisma.assignment.findMany({ where: { teamId }, select: { id: true, passPercent: true, dueAt: true, targets: { select: { groupId: true, userId: true } } } }),
        prisma.assignmentAttempt.findMany({ where: { assignment: { teamId } }, select: { assignmentId: true, userId: true, percent: true } }),
        reviewStates(students.map((s) => s.id)),
      ]);
      const weakCourseIds = new Set<string>();
      const perStudent = students.map((s) => {
        const mine = assignments.filter((a) => isAssignedTo(a.targets, { userId: s.id, groupId: s.groupId }));
        const bests = mine.flatMap((a) => {
          const at = attempts.filter((x) => x.assignmentId === a.id && x.userId === s.id);
          return at.length ? [{ best: at.reduce((m, x) => Math.max(m, x.percent), 0), pass: a.passPercent }] : [];
        });
        const st = states.get(s.id);
        const weak = new Map<string, number>();
        for (const item of Object.values(st?.items ?? {})) if (item.course && item.box <= 1) weak.set(item.course, (weak.get(item.course) ?? 0) + 1);
        const weakTop = [...weak.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id);
        weakTop.forEach((id) => weakCourseIds.add(id));
        return {
          id: s.id,
          name: s.name,
          assigned: mine.length,
          attempted: bests.length,
          passed: bests.filter((b) => b.best >= b.pass).length,
          avg: bests.length ? Math.round(bests.reduce((a, b) => a + b.best, 0) / bests.length) : null,
          doneCourses: st ? Object.values(st.courses).filter((c) => c.best >= 85).length : 0,
          weakTop,
        };
      });
      const titles = weakCourseIds.size ? await prisma.course.findMany({ where: { id: { in: [...weakCourseIds] } }, select: { id: true, title: true } }) : [];
      const title = new Map(titles.map((c) => [c.id, c.title]));
      return { students: perStudent.map((p) => ({ ...p, weak: p.weakTop.map((id) => title.get(id) ?? "").filter(Boolean) })) };
    }

    // Tempo: návrh rozdělení na tři skupiny podle výsledků (neutrální názvy, bez nálepek).
    if (view === "pace") {
      const [assignments, attempts] = await Promise.all([
        prisma.assignment.findMany({ where: { teamId }, select: { id: true, targets: { select: { groupId: true, userId: true } } } }),
        prisma.assignmentAttempt.findMany({ where: { assignment: { teamId } }, select: { assignmentId: true, userId: true, percent: true } }),
      ]);
      const scored = students.map((s) => {
        const mine = assignments.filter((a) => isAssignedTo(a.targets, { userId: s.id, groupId: s.groupId }));
        const bests = mine.flatMap((a) => {
          const at = attempts.filter((x) => x.assignmentId === a.id && x.userId === s.id);
          return at.length ? [at.reduce((m, x) => Math.max(m, x.percent), 0)] : [];
        });
        return { id: s.id, name: s.name, score: paceScore(bests, mine.length) };
      });
      const split = splitByPace(scored.map((s) => ({ id: s.id, score: s.score })));
      const name = new Map(scored.map((s) => [s.id, s.name]));
      const pack = (ids: string[]) => ids.map((id) => ({ id, name: name.get(id) ?? "" }));
      return {
        enough: scored.filter((s) => s.score !== null).length >= 3,
        groups: [
          { key: "slower", label: PACE_GROUP_NAMES.slower, students: pack(split.slower) },
          { key: "middle", label: PACE_GROUP_NAMES.middle, students: pack(split.middle) },
          { key: "faster", label: PACE_GROUP_NAMES.faster, students: pack(split.faster) },
        ],
      };
    }

    throw new LiveError("bad-view");
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const body = await readJson(request);
    const action = body.action;

    // Nástroje bez konkrétního týmu: nepsaný test a vlastní obsah školy.
    if (action === "test") {
      const userId = await requireSchoolTeacherAny();
      if (!(await withinRateLimit(`pro-school-test:${userId}`, 30, 3600))) throw new LiveError("rate-limited", 429);
      const subject = SUBJECTS.find((s) => s.value === body.subject)?.value as Subject | undefined;
      if (!subject) throw new LiveError("bad-subject");
      const grade = Math.floor(Number(body.grade));
      const n = Math.min(MAX_QUESTIONS, Math.max(5, Math.floor(Number(body.count)) || 15));
      const where = { options: { isEmpty: false }, course: { published: true, subject, ...(grade >= 1 && grade <= 9 ? { grade } : {}) } };
      const ids = await prisma.question.findMany({ where, select: { id: true }, take: 4000 });
      if (ids.length < 5) throw new LiveError("not-enough-questions", 404);
      const rows = await prisma.question.findMany({ where: { id: { in: shuffle(ids).slice(0, n * 2).map((x) => x.id) } }, select: questionSelect });
      const seen = new Set<string>();
      const questions = choiceOnly(rows).filter((q) => !seen.has(q.prompt) && !!seen.add(q.prompt)).slice(0, n);
      return { questions, scale: GRADE_SCALE.map((g) => ({ ...g, points: Math.ceil((g.min / 100) * questions.length) })), subject, grade: grade >= 1 && grade <= 9 ? grade : null };
    }

    if (action === "content") {
      const userId = await requireSchoolTeacherAny();
      if (!(await withinRateLimit(`pro-school-content:${userId}`, 20, 3600))) throw new LiveError("rate-limited", 429);
      const text = str(body.text).trim().slice(0, 6000);
      const image = str(body.image);
      if (!text && !image) throw new LiveError("invalid-message");
      if (image && (image.length > 1_500_000 || !IMAGE_RE.test(image))) throw new LiveError("invalid-image");
      const locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "cs";
      let out = "";
      try {
        out = await generateText({
          system: contentPrompt(locale),
          turns: [{ role: "user", content: text ? `Text:\n${text}` : "Vytvoř otázky z textu na fotce." }],
          image: image || undefined,
          maxTokens: 2000,
        });
      } catch (e) {
        if (e instanceof LiveError) throw e;
      }
      const d = extractJson<{ title?: string; questions?: { prompt?: unknown; options?: unknown; correctIndex?: unknown; explanation?: unknown }[] }>(out);
      const items = cleanSetQuestions(
        (d?.questions ?? []).filter((q) => Array.isArray(q.options) && q.options.length === 4).map((q) => ({ prompt: q.prompt, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation })),
      );
      if (items.length === 0) throw new LiveError("ai-unavailable", 503);
      const title = (str(body.title).trim() || str(d?.title).trim() || "Obsah školy").slice(0, 80);
      const set = await prisma.questionSet.create({ data: { ownerId: userId, title, questions: items as object[] }, select: { id: true } });
      let assignmentId: string | null = null;
      const teamId = str(body.teamId);
      if (teamId && body.assign === true) {
        await requireSchoolTeacher(teamId);
        const snap = cleanSnapshot(items.filter((i) => !("kind" in i)).map((q) => ({ ...(q as object), answers: [] })));
        assignmentId = await createAssignment({ teamId, title, description: "Vlastní obsah školy", questions: snap });
      }
      return { setId: set.id, title, count: items.length, assignmentId, questions: items };
    }

    const teamId = str(body.teamId);
    const userId = await requireSchoolTeacher(teamId);
    if (!(await withinRateLimit(`pro-school:${userId}`, 60, 3600))) throw new LiveError("rate-limited", 429);

    switch (action) {
      // Lekce pro třídu z mapy mezer: náhled i zadání žákům.
      case "lesson": {
        const l = await lessonQuestions(teamId, str(body.courseId));
        if (l.questions.length < 3) throw new LiveError("not-enough-questions", 404);
        const lesson = buildLesson(l.questions);
        if (body.assign === true) {
          const id = await createAssignment({ teamId, title: `Lekce: ${l.title}`, description: "Procvičení slabých míst třídy.", questions: l.questions, passPercent: 60 });
          return { assignmentId: id, title: l.title, lesson };
        }
        return { title: l.title, weakStudents: l.weakStudents, lesson };
      }
      // Každý má jiné zadání: pro každého žáka samostatné zadání s jiným výběrem otázek.
      case "variants": {
        const { title: courseTitle, questions } = await courseQuestionsBySlug(str(body.slug));
        const count = Math.min(MAX_QUESTIONS, Math.max(3, Math.floor(Number(body.count)) || 8));
        if (questions.length < count) throw new LiveError("not-enough-questions", 404);
        const students = (await activeStudents(teamId)).slice(0, MAX_VARIANT_STUDENTS);
        if (students.length === 0) throw new LiveError("no-students", 404);
        const title = str(body.title).trim() || courseTitle;
        const due = str(body.dueAt) ? new Date(str(body.dueAt)) : null;
        let created = 0;
        for (const [i, s] of students.entries()) {
          await createAssignment({
            teamId, title, description: "Každý žák má jinou variantu zadání.", questions: variantFor(questions, count, i),
            passPercent: 50, dueAt: due && !Number.isNaN(due.getTime()) ? due : null, userId: s.id,
          });
          created++;
        }
        return { created };
      }
      // Exit ticket: tři rychlé otázky na konci hodiny.
      case "exit": {
        const { title, questions } = await randomQuestions(str(body.slug), 3);
        if (questions.length < 2) throw new LiveError("not-enough-questions", 404);
        const id = await createAssignment({
          teamId, title: `Exit ticket: ${title}`, description: "Tři rychlé otázky na konci hodiny.", questions, passPercent: 67, maxAttempts: 1,
          dueAt: new Date(Date.now() + 24 * 3600 * 1000),
        });
        return { assignmentId: id };
      }
      // Kamarád pro suplování: hotová hodina jedním kliknutím a papír pro suplujícího.
      case "cover": {
        const { title, questions } = await randomQuestions(str(body.slug), 12);
        if (questions.length < 4) throw new LiveError("not-enough-questions", 404);
        const note = str(body.note).trim().slice(0, 300);
        const id = await createAssignment({
          teamId, title: `Suplování: ${title}`, description: note || "Samostatné procvičování během suplované hodiny.", questions, passPercent: 50,
        });
        const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId }, select: { name: true, code: true } });
        return { assignmentId: id, team: team.name, code: team.code, title, questions: questions.length };
      }
      // Tempo: založí skupiny s neutrálními názvy a rozdělí do nich žáky.
      case "applyPace": {
        const raw = body.groups && typeof body.groups === "object" ? (body.groups as Record<string, unknown>) : {};
        const keys = ["slower", "middle", "faster"] as const;
        const students = new Set((await activeStudents(teamId)).map((s) => s.id));
        const existing = await prisma.teamGroup.findMany({ where: { teamId }, select: { id: true, name: true } });
        if (existing.length + 3 > MAX_GROUPS + 3) throw new LiveError("too-many-groups");
        for (const key of keys) {
          const ids = (Array.isArray(raw[key]) ? (raw[key] as unknown[]) : []).filter((x): x is string => typeof x === "string" && students.has(x));
          if (ids.length === 0) continue;
          const name = PACE_GROUP_NAMES[key];
          const group = existing.find((g) => g.name === name) ?? (await prisma.teamGroup.create({ data: { teamId, name }, select: { id: true, name: true } }));
          await prisma.teamMember.updateMany({ where: { teamId, userId: { in: ids }, status: "ACTIVE", role: "STUDENT" }, data: { groupId: group.id } });
        }
        return { ok: true };
      }
      default:
        throw new LiveError("bad-action");
    }
  });
}
