import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getXp } from "@/lib/xp";
import { levelFromXp } from "@/lib/progression";
import {
  OFFLINE_CAP_HOURS,
  buildMany,
  computeCity,
  demolishAt,
  learningBonusFromXp,
  normalizeCity,
  settleCity,
  startState,
  type CityError,
  type CityState,
} from "@/lib/idle/city";

const GAME = "mesto";
const DAY_MS = 24 * 60 * 60 * 1000;

class Conflict extends Error {}
class NotEnoughPoints extends Error {}

async function learning(userId: string, now: number) {
  const [sum, xp] = await Promise.all([
    prisma.xpEvent.aggregate({
      where: { userId, createdAt: { gte: new Date(now - DAY_MS) } },
      _sum: { amount: true },
    }),
    getXp(userId),
  ]);
  return { bonus: learningBonusFromXp(sum._sum.amount ?? 0), level: levelFromXp(xp) };
}

function payload(state: CityState, points: number, level: number, bonus: number, now: number) {
  const stats = computeCity(state, bonus);
  return {
    state,
    points,
    level,
    learningBonus: bonus,
    now,
    offlineCapHours: OFFLINE_CAP_HOURS,
    stats: {
      capacity: stats.capacity,
      population: stats.population,
      jobs: stats.jobs,
      employed: stats.employed,
      unemployed: stats.unemployed,
      happiness: stats.happiness,
      incomePerHour: stats.incomePerHour,
      eduCoverage: stats.eduCoverage,
      stations: stats.stations,
      buildings: stats.buildings,
    },
    // Indexy budov, které nejsou napojené na silnici nebo koleje.
    idle: stats.working.flatMap((ok, i) => (ok ? [] : [i])),
  };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  try {
    const now = Date.now();
    const [row, user, learn] = await Promise.all([
      prisma.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } }),
      prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
      learning(userId, now),
    ]);
    const settled = settleCity(row ? normalizeCity(row.data, now) : startState(now), now, learn.bonus);
    if (row) {
      await prisma.idleState.update({
        where: { id: row.id },
        data: { data: settled as unknown as Prisma.InputJsonValue },
      });
    }
    return NextResponse.json(payload(settled, user?.points ?? 0, learn.level, learn.bonus, now));
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

type Body = {
  action?: unknown;
  items?: unknown;
  tiles?: unknown;
};

function asList<T>(value: unknown, guard: (v: unknown) => v is T): T[] {
  return Array.isArray(value) ? value.filter(guard) : [];
}

const isBuild = (v: unknown): v is { id: string; x: number; y: number; rot?: 0 | 1 } =>
  !!v && typeof v === "object" && typeof (v as { id?: unknown }).id === "string" &&
  typeof (v as { x?: unknown }).x === "number" && typeof (v as { y?: unknown }).y === "number";
const isTile = (v: unknown): v is { x: number; y: number } =>
  !!v && typeof v === "object" && typeof (v as { x?: unknown }).x === "number" && typeof (v as { y?: unknown }).y === "number";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Body;
  if (body.action !== "build" && body.action !== "demolish") {
    return NextResponse.json({ error: "unknown-action" }, { status: 400 });
  }

  try {
    const now = Date.now();
    const learn = await learning(userId, now);

    const result = await prisma.$transaction(async (tx) => {
      const row = await tx.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } });
      const user = await tx.user.findUnique({ where: { id: userId }, select: { points: true } });
      const points = user?.points ?? 0;
      const settled = settleCity(row ? normalizeCity(row.data, now) : startState(now), now, learn.bonus);

      let nextState: CityState;
      let spent = 0;
      let info: { placed?: number; failed?: number; removed?: number; refund?: number } = {};

      if (body.action === "build") {
        const out = buildMany(settled, asList(body.items, isBuild), { level: learn.level, points });
        if (!out.ok) return { error: out.error as CityError };
        nextState = out.state;
        spent = out.pointsSpent;
        info = { placed: out.placed, failed: out.failed };
      } else {
        const out = demolishAt(settled, asList(body.tiles, isTile));
        if (!out.ok) return { error: out.error as CityError };
        nextState = out.state;
        info = { removed: out.removed, refund: out.refund };
      }

      if (spent > 0) {
        const paid = await tx.user.updateMany({
          where: { id: userId, points: { gte: spent } },
          data: { points: { decrement: spent } },
        });
        if (paid.count === 0) throw new NotEnoughPoints();
      }

      const data = nextState as unknown as Prisma.InputJsonValue;
      if (row) {
        // Optimistic lock: když mezitím město změnila jiná záložka, akci zahodíme.
        const updated = await tx.idleState.updateMany({ where: { id: row.id, updatedAt: row.updatedAt }, data });
        if (updated.count === 0) throw new Conflict();
      } else {
        await tx.idleState.create({ data: { userId, game: GAME, data } });
      }
      return { state: nextState, points: points - spent, info };
    });

    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ...payload(result.state, result.points, learn.level, learn.bonus, now), info: result.info });
  } catch (error) {
    if (error instanceof NotEnoughPoints) return NextResponse.json({ error: "not-enough-points" }, { status: 400 });
    if (error instanceof Conflict || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      return NextResponse.json({ error: "conflict" }, { status: 409 });
    }
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
