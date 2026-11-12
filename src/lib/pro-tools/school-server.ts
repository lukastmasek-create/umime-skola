import { prisma } from "@/lib/prisma";
import { LiveError } from "@/lib/live/service";
import { requireTierUserId } from "@/lib/pro-server";
import { requireMember } from "@/lib/teams/server";
import { cleanSnapshot, shuffle, type SnapQuestion } from "@/lib/teams/logic";
import { REVIEW_GAME, normalizeReview, type ReviewState } from "@/lib/review";

/** Učitel v týmu na účtu se školním tarifem. */
export async function requireSchoolTeacher(teamId: string): Promise<string> {
  const userId = await requireTierUserId("SCHOOL");
  await requireMember(teamId, userId, true);
  return userId;
}

/** Školní tarif a aspoň jeden tým, kde je účet učitelem (pro nástroje bez konkrétního týmu). */
export async function requireSchoolTeacherAny(): Promise<string> {
  const userId = await requireTierUserId("SCHOOL");
  const n = await prisma.teamMember.count({ where: { userId, role: "TEACHER", status: "ACTIVE" } });
  if (n === 0) throw new LiveError("teacher-only", 403);
  return userId;
}

export async function activeStudents(teamId: string) {
  const rows = await prisma.teamMember.findMany({
    where: { teamId, role: "STUDENT", status: "ACTIVE" },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });
  return rows.map((m) => ({ id: m.userId, name: m.user.name || m.user.email || "", groupId: m.groupId }));
}

/** Stav opakování žáků (kurzy a chyby). Žáci bez dat tu nejsou. */
export async function reviewStates(userIds: string[]): Promise<Map<string, ReviewState>> {
  const rows = userIds.length ? await prisma.idleState.findMany({ where: { game: REVIEW_GAME, userId: { in: userIds } }, select: { userId: true, data: true } }) : [];
  return new Map(rows.map((r) => [r.userId, normalizeReview(r.data)]));
}

type QRow = { prompt: string; options: string[]; correctIndex: number; answers: string[]; explanation: string };

export const questionSelect = { prompt: true, options: true, correctIndex: true, answers: true, explanation: true } as const;

/** Otázky s možnostmi (volné odpovědi se v testech a variantách nepoužívají). */
export function choiceOnly(rows: QRow[]): SnapQuestion[] {
  return cleanSnapshot(rows.filter((r) => r.options.length >= 2));
}

export async function courseQuestionsBySlug(slug: string): Promise<{ title: string; questions: SnapQuestion[] }> {
  const course = await prisma.course.findFirst({ where: { slug, published: true }, select: { title: true, questions: { select: questionSelect } } });
  if (!course) throw new LiveError("course-not-found", 404);
  return { title: course.title, questions: choiceOnly(course.questions) };
}

export async function randomQuestions(slug: string, n: number): Promise<{ title: string; questions: SnapQuestion[] }> {
  const { title, questions } = await courseQuestionsBySlug(slug);
  return { title, questions: shuffle(questions).slice(0, n) };
}

export async function createAssignment(opts: {
  teamId: string;
  title: string;
  description?: string;
  questions: SnapQuestion[];
  passPercent?: number;
  maxAttempts?: number | null;
  dueAt?: Date | null;
  userId?: string;
}): Promise<string> {
  if (opts.questions.length === 0) throw new LiveError("no-questions");
  const a = await prisma.assignment.create({
    data: {
      teamId: opts.teamId,
      title: opts.title.slice(0, 80),
      description: (opts.description ?? "").slice(0, 1000),
      questions: opts.questions,
      passPercent: opts.passPercent ?? 50,
      maxAttempts: opts.maxAttempts ?? null,
      dueAt: opts.dueAt ?? null,
      ...(opts.userId ? { targets: { create: [{ userId: opts.userId, groupId: null }] } } : {}),
    },
    select: { id: true },
  });
  return a.id;
}
