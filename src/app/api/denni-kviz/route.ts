import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/points";
import { DAY_MS, dayKey } from "@/lib/gamify";
import { DAILY_ACTIVITY_XP_CAP } from "@/lib/progression";
import { SUBJECTS } from "@/lib/taxonomy";
import {
  FLAWLESS_BONUS_XP,
  QUIZ_SIZE as SIZE,
  TIMED_GRACE_MS,
  TIMED_SECONDS,
  clampDifficulty,
  summarize,
  xpFor,
  type QuizConfig,
} from "@/lib/daily-quiz";

// Denní kvíz: deset otázek dne podle zvoleného předmětu a obtížnosti (stejné pro všechny se stejným výběrem).
// Odpovědi se ověřují na serveru po jedné, za správné jdou XP a body, výsledek jde do žebříčku dne.
const GAME = "dailyquiz";

type Answer = { id: string; choice: number; correct: boolean };
type DayState = QuizConfig & {
  date: string;
  qIds: string[]; // prázdné = kvíz ještě nezačal
  answers: Answer[];
  startedAt: number;
  lastAt: number; // kdy byla zobrazena aktuální otázka (odpověď na předchozí / start)
  finishedAt: number | null;
  xp: number;
  gainedPoints: number;
};
type PublicQuestion = { id: string; prompt: string; options: string[] };

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = (Math.imul(h, 33) + text.charCodeAt(i)) >>> 0;
  return h;
}

const SUBJECT_VALUES = new Set<string>(SUBJECTS.map((s) => s.value));
const cache = new Map<string, string[]>();

// Vybere ID otázek dne: nejdřív přesná obtížnost, když jich je málo, dobírá se z nejbližších obtížností.
async function pickIds(date: string, subject: string | null, difficulty: number): Promise<string[]> {
  const key = `${date}:${subject ?? "*"}:${difficulty}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rows = await prisma.question.findMany({
    where: subject ? { course: { subject: subject as never } } : undefined,
    select: { id: true, difficulty: true },
    orderBy: { id: "asc" },
    take: 20000,
  });
  if (rows.length < SIZE) return [];
  const rnd = mulberry32(hash(key));
  const shuffle = <T,>(arr: T[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const picked: string[] = [];
  for (let dist = 0; dist <= 4 && picked.length < SIZE; dist++) {
    const tier = shuffle(rows.filter((r) => Math.abs(r.difficulty - difficulty) === dist));
    for (const r of tier) {
      if (picked.length >= SIZE) break;
      picked.push(r.id);
    }
  }
  if (picked.length === SIZE) {
    if (cache.size > 40) cache.clear();
    cache.set(key, picked);
  }
  return picked;
}

async function questionsByIds(ids: string[]): Promise<PublicQuestion[]> {
  const rows = await prisma.question.findMany({ where: { id: { in: ids } }, select: { id: true, prompt: true, options: true } });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.flatMap((id) => {
    const q = byId.get(id);
    return q ? [{ id: q.id, prompt: q.prompt, options: q.options }] : [];
  });
}

function emptyState(date: string): DayState {
  return { date, qIds: [], answers: [], startedAt: 0, lastAt: 0, finishedAt: null, subject: null, difficulty: 3, timed: false, xp: 0, gainedPoints: 0 };
}

function normalize(raw: unknown, date: string): DayState {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  if (r.date !== date || !Array.isArray(r.answers)) return emptyState(date);
  const answers = (r.answers as unknown[])
    .filter((a): a is Answer => !!a && typeof (a as Answer).id === "string" && typeof (a as Answer).choice === "number" && typeof (a as Answer).correct === "boolean")
    .slice(0, SIZE);
  const qIds = Array.isArray(r.qIds) ? (r.qIds as unknown[]).filter((x): x is string => typeof x === "string").slice(0, SIZE) : [];
  const finishedAt = typeof r.finishedAt === "number" ? r.finishedAt : null;
  // Rozehraný kvíz ze starého formátu (bez seznamu otázek) nejde dohrát; dohraný se ponechá.
  if (qIds.length === 0 && !finishedAt) return emptyState(date);
  return {
    date,
    qIds,
    answers,
    startedAt: Number(r.startedAt) || 0,
    lastAt: Number(r.lastAt) || Number(r.startedAt) || 0,
    finishedAt,
    subject: typeof r.subject === "string" && SUBJECT_VALUES.has(r.subject) ? r.subject : null,
    difficulty: clampDifficulty(r.difficulty),
    timed: r.timed === true,
    xp: Number(r.xp) || 0,
    gainedPoints: Number(r.gainedPoints) || 0,
  };
}

const configOf = (s: DayState): QuizConfig => ({ subject: s.subject, difficulty: s.difficulty, timed: s.timed });
const secondsOf = (s: DayState) => (s.finishedAt && s.startedAt ? Math.max(1, Math.round((s.finishedAt - s.startedAt) / 1000)) : 0);
// Starý (dohraný) kvíz bez bodů se v žebříčku počítá jako počet správných.
const pointsOf = (s: DayState) => (s.gainedPoints > 0 ? s.gainedPoints : summarize(s.answers, configOf(s)).score);

async function board(date: string, userId: string | null) {
  const rows = await prisma.idleState.findMany({
    where: { game: GAME, data: { path: ["date"], equals: date } },
    select: { userId: true, data: true, user: { select: { name: true } } },
    take: 400,
  });
  const entries = rows
    .map((r) => ({ userId: r.userId, name: r.user.name ?? "?", state: normalize(r.data, date) }))
    .filter((e) => e.state.finishedAt)
    .map((e) => ({
      userId: e.userId,
      name: e.name,
      score: summarize(e.state.answers, configOf(e.state)).score,
      points: pointsOf(e.state),
      difficulty: e.state.difficulty,
      seconds: secondsOf(e.state),
    }))
    .sort((a, b) => b.points - a.points || b.score - a.score || a.seconds - b.seconds);
  const rank = userId ? entries.findIndex((e) => e.userId === userId) + 1 : 0;
  return {
    top: entries.slice(0, 10).map((e) => ({ name: e.name, score: e.score, points: e.points, difficulty: e.difficulty, seconds: e.seconds, you: e.userId === userId })),
    rank: rank || null,
    players: entries.length,
  };
}

async function load(userId: string, date: string) {
  const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } });
  return normalize(row?.data, date);
}

async function save(userId: string, state: DayState) {
  const json = state as unknown as Prisma.InputJsonValue;
  await prisma.idleState.upsert({ where: { userId_game: { userId, game: GAME } }, create: { userId, game: GAME, data: json }, update: { data: json } });
}

const msLeftFor = (s: DayState, now: number) => (s.timed && s.lastAt ? Math.max(0, TIMED_SECONDS * 1000 - (now - s.lastAt)) : null);

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const now = Date.now();
  const date = dayKey(new Date(now));
  try {
    const state = userId ? await load(userId, date) : null;
    const started = !!state && state.qIds.length > 0;
    const summary = state ? summarize(state.answers, configOf(state)) : null;
    return NextResponse.json({
      loggedIn: !!userId,
      date,
      started,
      questions: started ? await questionsByIds(state!.qIds) : [],
      answers: state?.answers ?? [],
      finished: !!state?.finishedAt,
      score: summary?.score ?? 0,
      points: state ? pointsOf(state) : 0,
      streak: summary?.streak ?? 0,
      bestStreak: summary?.best ?? 0,
      xp: state?.xp ?? 0,
      config: state && started ? configOf(state) : null,
      timedSeconds: TIMED_SECONDS,
      msLeft: state && started && !state.finishedAt ? msLeftFor(state, now) : null,
      seconds: state ? secondsOf(state) : 0,
      msToNext: Date.parse(date) + DAY_MS - now,
      ...(await board(date, userId)),
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

// POST { action: "start", subject, difficulty, timed }: zahájí dnešní kvíz s vybraným nastavením.
// POST { id, choice }: odpověď na další nezodpovězenou otázku dne (choice -1 = vypršel čas).
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { action?: unknown; id?: unknown; choice?: unknown; subject?: unknown; difficulty?: unknown; timed?: unknown };
  const now = Date.now();
  const date = dayKey(new Date(now));

  if (body.action === "start") {
    const subject = typeof body.subject === "string" && SUBJECT_VALUES.has(body.subject) ? body.subject : null;
    const config: QuizConfig = { subject, difficulty: clampDifficulty(body.difficulty), timed: body.timed === true };
    try {
      const current = await load(userId, date);
      if (current.qIds.length > 0 || current.finishedAt) return NextResponse.json({ error: "already-started" }, { status: 409 });
      const ids = await pickIds(date, config.subject, config.difficulty);
      if (ids.length < SIZE) return NextResponse.json({ error: "not-enough" }, { status: 422 });
      const questions = await questionsByIds(ids);
      if (questions.length < SIZE) return NextResponse.json({ error: "unavailable" }, { status: 503 });
      await save(userId, { ...emptyState(date), ...config, qIds: ids, startedAt: now, lastAt: now });
      return NextResponse.json({ questions, config, timedSeconds: TIMED_SECONDS, msLeft: config.timed ? TIMED_SECONDS * 1000 : null });
    } catch {
      return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
  }

  const choice = Math.floor(Number(body.choice));
  if (typeof body.id !== "string" || !Number.isFinite(choice) || choice < -1 || choice > 3) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  try {
    // Stav a otázka se načtou paralelně (oba čtení jsou nezávislá).
    const [state, q] = await Promise.all([
      load(userId, date),
      prisma.question.findUnique({ where: { id: body.id }, select: { correctIndex: true, explanation: true } }),
    ]);
    const index = state.answers.length;
    if (state.qIds.length === 0 || state.finishedAt || index >= SIZE || state.qIds[index] !== body.id) return NextResponse.json({ error: "out-of-order" }, { status: 409 });
    if (!q) return NextResponse.json({ error: "unavailable" }, { status: 503 });

    const late = state.timed && now - state.lastAt > TIMED_SECONDS * 1000 + TIMED_GRACE_MS;
    const correct = choice >= 0 && !late && choice === q.correctIndex;
    const answers = [...state.answers, { id: body.id, choice, correct }];
    const before = summarize(state.answers, configOf(state));
    const after = summarize(answers, configOf(state));
    const next: DayState = { ...state, answers, lastAt: now };

    // Body za tuto odpověď včetně případného bonusu za bezchybné kolo; XP stejně.
    const gainedPoints = after.points - before.points;
    let gainedXp = correct ? xpFor(state.difficulty) : 0;
    const finished = answers.length >= SIZE;
    if (finished) {
      next.finishedAt = now;
      if (after.flawless) gainedXp += FLAWLESS_BONUS_XP;
    }

    if (gainedXp > 0) {
      const startOfDay = new Date(now);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const used = await prisma.xpEvent.aggregate({ where: { userId, source: { in: ["game", "test"] }, createdAt: { gte: startOfDay } }, _sum: { amount: true } });
      gainedXp = Math.max(0, Math.min(gainedXp, DAILY_ACTIVITY_XP_CAP - (used._sum.amount ?? 0)));
      if (gainedXp > 0) await prisma.xpEvent.create({ data: { userId, amount: gainedXp, source: "game" } });
    }
    if (gainedPoints > 0) await awardPoints(userId, gainedPoints, "Denní kvíz");
    next.xp = state.xp + gainedXp;
    next.gainedPoints = state.gainedPoints + gainedPoints;
    await save(userId, next);

    return NextResponse.json({
      correct,
      timedOut: choice === -1 || late,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      finished,
      score: after.score,
      streak: after.streak,
      bestStreak: after.best,
      flawless: finished && after.flawless,
      gainedXp,
      gainedPoints,
      totalXp: next.xp,
      totalPoints: next.gainedPoints,
      seconds: secondsOf(next),
      msLeft: finished || !state.timed ? null : TIMED_SECONDS * 1000,
      ...(finished ? await board(date, userId) : {}),
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
