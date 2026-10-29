import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DAY_MS, dayKey } from "@/lib/gamify";
import { DAILY_ACTIVITY_XP_CAP } from "@/lib/progression";

// Denní kvíz: deset otázek stejných pro všechny (výběr podle data), odpovědi se ověřují na serveru po jedné, výsledek jde do žebříčku dne.
const GAME = "dailyquiz";
const SIZE = 10;

type Answer = { id: string; choice: number; correct: boolean };
type DayState = { date: string; answers: Answer[]; startedAt: number; finishedAt: number | null };
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

const cache = new Map<string, PublicQuestion[]>();

async function questionsFor(date: string): Promise<PublicQuestion[]> {
  const hit = cache.get(date);
  if (hit) return hit;
  const total = await prisma.question.count();
  if (total < SIZE) return [];
  const rnd = mulberry32(Number(date.replace(/-/g, "")));
  const picked = new Set<number>();
  while (picked.size < SIZE) picked.add(Math.floor(rnd() * total));
  const rows: PublicQuestion[] = [];
  for (const skip of picked) {
    const [q] = await prisma.question.findMany({ orderBy: { id: "asc" }, skip, take: 1, select: { id: true, prompt: true, options: true } });
    if (q) rows.push({ id: q.id, prompt: q.prompt, options: q.options });
  }
  if (rows.length === SIZE) {
    if (cache.size > 5) cache.clear();
    cache.set(date, rows);
  }
  return rows;
}

function normalize(raw: unknown, date: string): DayState {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  if (r.date !== date || !Array.isArray(r.answers)) return { date, answers: [], startedAt: 0, finishedAt: null };
  const answers = (r.answers as unknown[])
    .filter((a): a is Answer => !!a && typeof (a as Answer).id === "string" && typeof (a as Answer).choice === "number" && typeof (a as Answer).correct === "boolean")
    .slice(0, SIZE);
  return { date, answers, startedAt: Number(r.startedAt) || 0, finishedAt: typeof r.finishedAt === "number" ? r.finishedAt : null };
}

const scoreOf = (s: DayState) => s.answers.filter((a) => a.correct).length;
const secondsOf = (s: DayState) => (s.finishedAt && s.startedAt ? Math.max(1, Math.round((s.finishedAt - s.startedAt) / 1000)) : 0);

async function board(date: string, userId: string | null) {
  const rows = await prisma.idleState.findMany({
    where: { game: GAME, data: { path: ["date"], equals: date } },
    select: { userId: true, data: true, user: { select: { name: true } } },
    take: 400,
  });
  const entries = rows
    .map((r) => ({ userId: r.userId, name: r.user.name ?? "?", state: normalize(r.data, date) }))
    .filter((e) => e.state.finishedAt)
    .map((e) => ({ userId: e.userId, name: e.name, score: scoreOf(e.state), seconds: secondsOf(e.state) }))
    .sort((a, b) => b.score - a.score || a.seconds - b.seconds);
  const rank = userId ? entries.findIndex((e) => e.userId === userId) + 1 : 0;
  return { top: entries.slice(0, 10).map((e) => ({ name: e.name, score: e.score, seconds: e.seconds, you: e.userId === userId })), rank: rank || null, players: entries.length };
}

async function load(userId: string, date: string) {
  const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } });
  return normalize(row?.data, date);
}

async function save(userId: string, state: DayState) {
  const json = state as unknown as Prisma.InputJsonValue;
  await prisma.idleState.upsert({ where: { userId_game: { userId, game: GAME } }, create: { userId, game: GAME, data: json }, update: { data: json } });
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const date = dayKey(new Date());
  try {
    const questions = await questionsFor(date);
    if (questions.length < SIZE) return NextResponse.json({ error: "unavailable" }, { status: 503 });
    const state = userId ? await load(userId, date) : null;
    return NextResponse.json({
      loggedIn: !!userId,
      date,
      questions,
      answers: state?.answers ?? [],
      finished: !!state?.finishedAt,
      score: state ? scoreOf(state) : 0,
      seconds: state ? secondsOf(state) : 0,
      msToNext: Date.parse(date) + DAY_MS - Date.now(),
      ...(await board(date, userId)),
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

// POST { id, choice }: odpověď na další nezodpovězenou otázku dne.
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { id?: unknown; choice?: unknown };
  const choice = Math.floor(Number(body.choice));
  if (typeof body.id !== "string" || !Number.isFinite(choice) || choice < 0 || choice > 3) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  const now = Date.now();
  const date = dayKey(new Date(now));
  try {
    const questions = await questionsFor(date);
    const state = await load(userId, date);
    const index = state.answers.length;
    if (state.finishedAt || index >= SIZE || questions[index]?.id !== body.id) return NextResponse.json({ error: "out-of-order" }, { status: 409 });
    const q = await prisma.question.findUnique({ where: { id: body.id }, select: { correctIndex: true, explanation: true } });
    if (!q) return NextResponse.json({ error: "unavailable" }, { status: 503 });
    const correct = choice === q.correctIndex;
    const next: DayState = { ...state, startedAt: state.startedAt || now, answers: [...state.answers, { id: body.id, choice, correct }] };
    let gained = 0;
    if (next.answers.length >= SIZE) {
      next.finishedAt = now;
      const wanted = Math.min(30, 4 + scoreOf(next) * 2);
      const startOfDay = new Date(now);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const used = await prisma.xpEvent.aggregate({ where: { userId, source: { in: ["game", "test"] }, createdAt: { gte: startOfDay } }, _sum: { amount: true } });
      gained = Math.max(0, Math.min(wanted, DAILY_ACTIVITY_XP_CAP - (used._sum.amount ?? 0)));
      if (gained > 0) await prisma.xpEvent.create({ data: { userId, amount: gained, source: "game" } });
    }
    await save(userId, next);
    return NextResponse.json({
      correct,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      finished: !!next.finishedAt,
      score: scoreOf(next),
      seconds: secondsOf(next),
      gained,
      ...(next.finishedAt ? await board(date, userId) : {}),
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
