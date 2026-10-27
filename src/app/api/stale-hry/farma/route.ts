import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ANIMAL_BATCH_CAP,
  buyAnimal,
  buyPlot,
  collect,
  collectAll,
  deliver,
  emptyState,
  fertilize,
  fillOrders,
  harvest,
  harvestAll,
  learningBonusFromXp,
  levelInfo,
  normalizeState,
  plant,
  plantAll,
  sell,
  siloCapacity,
  stockTotal,
  upgradeSilo,
  type ActionResult,
  type FarmState,
} from "@/lib/idle/farm";

const GAME = "farma";
const DAY_MS = 24 * 60 * 60 * 1000;

function errorCode(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) return error.code;
  if (error instanceof Error) return error.name;
  return "unknown";
}

class Conflict extends Error {}
class NotEnoughPoints extends Error {}

async function learningBonusFor(userId: string, now: number) {
  const sum = await prisma.xpEvent.aggregate({
    where: { userId, createdAt: { gte: new Date(now - DAY_MS) } },
    _sum: { amount: true },
  });
  return learningBonusFromXp(sum._sum.amount ?? 0);
}

function payload(state: FarmState, points: number, learningBonus: number, now: number) {
  return {
    state,
    points,
    learningBonus,
    now,
    level: levelInfo(state.xp),
    silo: { used: stockTotal(state), capacity: siloCapacity(state) },
    batchCap: ANIMAL_BATCH_CAP,
  };
}

type Body = { action?: unknown; plot?: unknown; crop?: unknown; animal?: unknown; item?: unknown; order?: unknown };

function applyAction(state: FarmState, body: Body, now: number, bonus: number): ActionResult {
  switch (body.action) {
    case "plant":
      return plant(state, body.plot, body.crop, now);
    case "plantAll":
      return plantAll(state, body.crop, now);
    case "harvest":
      return harvest(state, body.plot, now, bonus);
    case "harvestAll":
      return harvestAll(state, now, bonus);
    case "fertilize":
      return fertilize(state, body.plot, now, bonus);
    case "buyPlot":
      return buyPlot(state);
    case "buyAnimal":
      return buyAnimal(state, body.animal, now);
    case "collect":
      return collect(state, body.animal, now, bonus);
    case "collectAll":
      return collectAll(state, now, bonus);
    case "sell":
      return sell(state, body.item);
    case "deliver":
      return deliver(state, body.order);
    case "upgradeSilo":
      return upgradeSilo(state);
    default:
      return { ok: false, error: "bad-request" };
  }
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  try {
    const now = Date.now();
    const [row, user, bonus] = await Promise.all([
      prisma.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } }),
      prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
      learningBonusFor(userId, now),
    ]);
    const loaded = row ? normalizeState(row.data, now) : emptyState(now);
    const state = fillOrders({ ...loaded, lastSeen: now });
    // Zakázky se losují náhodně, proto je ukládáme hned, ať je akce později najdou.
    if (!row || state.orders.length !== loaded.orders.length) {
      const data = state as unknown as Prisma.InputJsonValue;
      await prisma.idleState.upsert({
        where: { userId_game: { userId, game: GAME } },
        create: { userId, game: GAME, data },
        update: { data },
      });
    }
    return NextResponse.json(payload(state, user?.points ?? 0, bonus, now));
  } catch (error) {
    console.error("farma GET failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Body;

  try {
    const now = Date.now();
    const bonus = await learningBonusFor(userId, now);

    const result = await prisma.$transaction(
      async (tx) => {
        const row = await tx.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } });
        const user = await tx.user.findUnique({ where: { id: userId }, select: { points: true } });
        const points = user?.points ?? 0;

        const current = fillOrders(row ? normalizeState(row.data, now) : emptyState(now));
        const outcome = applyAction(current, body, now, bonus);
        if (!outcome.ok) return { outcome, points };

        const cost = outcome.pointsSpent ?? 0;
        if (cost > 0) {
          const spent = await tx.user.updateMany({
            where: { id: userId, points: { gte: cost } },
            data: { points: { decrement: cost } },
          });
          if (spent.count === 0) throw new NotEnoughPoints();
        }

        const data = { ...outcome.state, lastSeen: now } as unknown as Prisma.InputJsonValue;
        if (row) {
          // Optimistic lock: když mezitím stav změnila jiná záložka, akci zahodíme.
          const updated = await tx.idleState.updateMany({ where: { id: row.id, updatedAt: row.updatedAt }, data: { data } });
          if (updated.count === 0) throw new Conflict();
        } else {
          await tx.idleState.create({ data: { userId, game: GAME, data } });
        }
        return { outcome, points: points - cost };
      },
      { maxWait: 10_000, timeout: 20_000 },
    );

    if (!result.outcome.ok) {
      return NextResponse.json({ error: result.outcome.error }, { status: 400 });
    }
    return NextResponse.json({ ...payload(result.outcome.state, result.points, bonus, now), gained: result.outcome.gained ?? null });
  } catch (error) {
    if (error instanceof NotEnoughPoints) {
      return NextResponse.json({ error: "not-enough-points" }, { status: 400 });
    }
    if (error instanceof Conflict || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      return NextResponse.json({ error: "conflict" }, { status: 409 });
    }
    console.error("farma POST failed", error);
    return NextResponse.json({ error: "unavailable", detail: errorCode(error) }, { status: 503 });
  }
}
