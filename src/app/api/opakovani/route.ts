import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  REVIEW_BATCH,
  REVIEW_GAME,
  applyResults,
  dueIds,
  normalizeReview,
  recordCourse,
  type ReviewResult,
} from "@/lib/review";
import { CATEGORIES } from "@/lib/taxonomy";

async function load(userId: string) {
  const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: REVIEW_GAME } } });
  return normalizeReview(row?.data);
}

async function save(userId: string, state: unknown) {
  const json = state as Prisma.InputJsonValue;
  await prisma.idleState.upsert({
    where: { userId_game: { userId, game: REVIEW_GAME } },
    create: { userId, game: REVIEW_GAME, data: json },
    update: { data: json },
  });
}

// GET: otázky k opakování dnes (nebo, s ?map=1, postup v kurzech pro mapu).
export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false });

  try {
    const state = await load(userId);
    const now = Date.now();
    const due = dueIds(state, now);
    if (new URL(request.url).searchParams.get("map")) {
      return NextResponse.json({ loggedIn: true, due: due.length, courses: state.courses });
    }
    const rows = await prisma.question.findMany({
      where: { id: { in: due.slice(0, REVIEW_BATCH * 2) } },
      select: {
        id: true,
        prompt: true,
        answers: true,
        options: true,
        correctIndex: true,
        explanation: true,
        course: { select: { id: true, title: true, slug: true, category: true } },
      },
    });
    const byId = new Map(rows.map((q) => [q.id, q]));
    const questions = due
      .map((id) => byId.get(id))
      .filter((q): q is NonNullable<typeof q> => !!q)
      .slice(0, REVIEW_BATCH)
      .map((q) => ({
        id: q.id,
        prompt: q.prompt,
        answers: q.answers,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        courseId: q.course.id,
        courseTitle: q.course.title,
        courseHref: `${CATEGORIES.find((c) => c.value === q.course.category)?.slug ?? "zakladni"}/${q.course.slug}`,
      }));
    return NextResponse.json({ loggedIn: true, due: due.length, questions });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

// POST: zapíše výsledky odpovědí a případně výsledek testu kurzu.
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    results?: unknown;
    course?: { id?: unknown; percent?: unknown };
  };
  const results: ReviewResult[] = Array.isArray(body.results)
    ? body.results
        .filter((r): r is { id: string; correct: boolean } => !!r && typeof r.id === "string" && typeof r.correct === "boolean")
        .slice(0, 60)
        .map((r) => ({ id: r.id, correct: r.correct }))
    : [];

  try {
    // Sleduj jen otázky, které opravdu existují (id z klienta se nedá věřit).
    const known = results.length
      ? await prisma.question.findMany({ where: { id: { in: results.map((r) => r.id) } }, select: { id: true, courseId: true } })
      : [];
    const courseOf = new Map(known.map((q) => [q.id, q.courseId]));
    const valid = results.filter((r) => courseOf.has(r.id)).map((r) => ({ ...r, course: courseOf.get(r.id) }));

    const now = Date.now();
    let state = applyResults(await load(userId), valid, now);
    const courseId = typeof body.course?.id === "string" ? body.course.id : null;
    const percent = Number(body.course?.percent);
    if (courseId && Number.isFinite(percent) && (await prisma.course.count({ where: { id: courseId } })) > 0) {
      state = recordCourse(state, courseId, percent, now);
    }
    await save(userId, state);
    return NextResponse.json({ ok: true, due: dueIds(state, now).length });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
