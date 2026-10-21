import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  adopt,
  buyUpgrade,
  currentIncomePerHour,
  emptyState,
  feed,
  learningBonusFromXp,
  levelInfo,
  normalizeState,
  offlineCapHours,
  play,
  rename,
  settle,
  treat,
  type ActionResult,
  type PetGameState,
} from "@/lib/idle/pets";

const GAME = "mazlicci";
const DAY_MS = 24 * 60 * 60 * 1000;

class Conflict extends Error {}
class NotEnoughPoints extends Error {}

async function learningBonusFor(userId: string, now: number) {
  const sum = await prisma.xpEvent.aggregate({
    where: { userId, createdAt: { gte: new Date(now - DAY_MS) } },
    _sum: { amount: true },
  });
  return learningBonusFromXp(sum._sum.amount ?? 0);
}

function payload(state: PetGameState, points: number, learningBonus: number, now: number) {
  const active = state.active ? state.pets[state.active] : undefined;
  return {
    state,
    points,
    learningBonus,
    now,
    incomePerHour: currentIncomePerHour(state, learningBonus),
    offlineCapHours: offlineCapHours(state),
    level: active ? levelInfo(active.growth) : null,
  };
}

function applyAction(
  state: PetGameState,
  body: { action?: unknown; species?: unknown; upgrade?: unknown; name?: unknown },
  points: number,
  now: number,
): ActionResult {
  switch (body.action) {
    case "adopt":
      return adopt(state, body.species, points);
    case "feed":
      return feed(state);
    case "play":
      return play(state, now);
    case "treat": {
      const r = treat(state);
      return r.ok && points < (r.pointsSpent ?? 0) ? { ok: false, error: "not-enough-points" } : r;
    }
    case "upgrade":
      return buyUpgrade(state, body.upgrade);
    case "rename":
      return rename(state, body.name);
    default:
      return { ok: true, state };
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
    const settled = settle(row ? normalizeState(row.data, now) : emptyState(now), now, bonus);
    if (row) {
      await prisma.idleState.update({
        where: { id: row.id },
        data: { data: settled as unknown as Prisma.InputJsonValue },
      });
    }
    return NextResponse.json(payload(settled, user?.points ?? 0, bonus, now));
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  try {
    const now = Date.now();
    const bonus = await learningBonusFor(userId, now);

    const result = await prisma.$transaction(async (tx) => {
      const row = await tx.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } });
      const user = await tx.user.findUnique({ where: { id: userId }, select: { points: true } });
      const points = user?.points ?? 0;

      const settled = settle(row ? normalizeState(row.data, now) : emptyState(now), now, bonus);
      const outcome = applyAction(settled, body, points, now);
      if (!outcome.ok) return { outcome, points };

      const cost = outcome.pointsSpent ?? 0;
      if (cost > 0) {
        const spent = await tx.user.updateMany({
          where: { id: userId, points: { gte: cost } },
          data: { points: { decrement: cost } },
        });
        if (spent.count === 0) throw new NotEnoughPoints();
      }

      const data = outcome.state as unknown as Prisma.InputJsonValue;
      if (row) {
        // Optimistic lock: když mezitím stav změnila jiná záložka, akci zahodíme.
        const updated = await tx.idleState.updateMany({
          where: { id: row.id, updatedAt: row.updatedAt },
          data: { data },
        });
        if (updated.count === 0) throw new Conflict();
      } else {
        await tx.idleState.create({ data: { userId, game: GAME, data } });
      }
      return { outcome, points: points - cost };
    });

    if (!result.outcome.ok) {
      return NextResponse.json({ error: result.outcome.error }, { status: 400 });
    }
    return NextResponse.json(payload(result.outcome.state, result.points, bonus, now));
  } catch (error) {
    if (error instanceof NotEnoughPoints) {
      return NextResponse.json({ error: "not-enough-points" }, { status: 400 });
    }
    if (error instanceof Conflict || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      return NextResponse.json({ error: "conflict" }, { status: 409 });
    }
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
