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
    const params = new URL(request.url).searchParams;
    if (params.get("map")) {
      return NextResponse.json({ loggedIn: true, due: due.length, courses: state.courses });
    }
    // Slabá místa: v kterých kurzech hráč nejvíc chybuje (podle sledovaných chybných otázek).
    if (params.get("weak")) {
      const dueSet = new Set(due);
      const stat = new Map<string, { count: number; due: number; low: number }>();
      for (const [id, item] of Object.entries(state.items)) {
        if (!item.course) continue;
        const s = stat.get(item.course) ?? { count: 0, due: 0, low: 0 };
        s.count++;
        if (dueSet.has(id)) s.due++;
        if (item.box <= 1) s.low++;
        stat.set(item.course, s);
      }
      const top = [...stat.entries()].sort((a, b) => b[1].low - a[1].low || b[1].count - a[1].count).slice(0, 6);
      const courses = top.length
        ? await prisma.course.findMany({ where: { id: { in: top.map(([id]) => id) } }, select: { id: true, title: true, slug: true, category: true } })
        : [];
      const info = new Map(courses.map((c) => [c.id, c]));
      const weak = top
        .filter(([id]) => info.has(id))
        .map(([id, s]) => {
          const c = info.get(id)!;
          return {
            courseId: id,
            title: c.title,
            href: `${CATEGORIES.find((x) => x.value === c.category)?.slug ?? "zakladni"}/${c.slug}`,
            count: s.count,
            due: s.due,
            low: s.low,
            best: state.courses[id]?.best ?? null,
          };
        });
      return NextResponse.json({ loggedIn: true, tracked: Object.keys(state.items).length, due: due.length, weak });
    }
    // Procvičení jednoho kurzu: všechny sledované otázky z něj, nejslabší první (bez ohledu na termín).
    const only = params.get("course");
    const pool = only
      ? Object.entries(state.items)
          .filter(([, item]) => item.course === only)
          .sort((a, b) => a[1].box - b[1].box || a[1].due.localeCompare(b[1].due))
          .map(([id]) => id)
      : due;
    const rows = await prisma.question.findMany({
      where: { id: { in: pool.slice(0, REVIEW_BATCH * 2) } },
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
    const questions = pool
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
    return NextResponse.json({ loggedIn: true, due: only ? pool.length : due.length, questions });
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
