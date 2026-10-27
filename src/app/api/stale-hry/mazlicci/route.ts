import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { itemPrice, normalizeState as normalizeFarm, takeItem } from "@/lib/idle/farm";
import {
  adopt,
  buyUpgrade,
  currentIncomePerHour,
  emptyState,
  feed,
  feedWithFarm,
  learningBonusFromXp,
  levelInfo,
  normalizeState,
  offlineCapHours,
  play,
  rename,
  setAccessory,
  settle,
  treat,
  type ActionResult,
  type PetGameState,
} from "@/lib/idle/pets";

const GAME = "mazlicci";
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

function payload(state: PetGameState, points: number, learningBonus: number, now: number, accessories: string[], farmStock: Record<string, number> = {}) {
  const active = state.active ? state.pets[state.active] : undefined;
  return {
    state,
    points,
    accessories,
    farmStock,
    learningBonus,
    now,
    incomePerHour: currentIncomePerHour(state, learningBonus),
    offlineCapHours: offlineCapHours(state),
    level: active ? levelInfo(active.growth) : null,
  };
}

// Úroda ve sýpce farmy (jen položky, kterých je aspoň kus), ať jde mazlíčka krmit.
function stockOf(raw: unknown, now: number): Record<string, number> {
  if (!raw) return {};
  const stock = normalizeFarm(raw, now).stock as Record<string, number | undefined>;
  return Object.fromEntries(Object.entries(stock).filter(([, q]) => typeof q === "number" && q > 0)) as Record<string, number>;
}

function applyAction(
  state: PetGameState,
  body: { action?: unknown; species?: unknown; upgrade?: unknown; name?: unknown; accessory?: unknown; item?: unknown },
  points: number,
  now: number,
  accessories: string[],
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
    case "accessory":
      return setAccessory(state, body.accessory ?? null, accessories);
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
    const [row, user, bonus, unlocks, farmRow] = await Promise.all([
      prisma.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } }),
      prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
      learningBonusFor(userId, now),
      prisma.unlock.findMany({ where: { userId, key: { startsWith: "pet:" } }, select: { key: true } }),
      prisma.idleState.findUnique({ where: { userId_game: { userId, game: "farma" } }, select: { data: true } }),
    ]);
    const settled = settle(row ? normalizeState(row.data, now) : emptyState(now), now, bonus);
    if (row) {
      await prisma.idleState.update({
        where: { id: row.id },
        data: { data: settled as unknown as Prisma.InputJsonValue },
      });
    }
    return NextResponse.json(payload(settled, user?.points ?? 0, bonus, now, unlocks.map((u) => u.key.slice(4)), stockOf(farmRow?.data, now)));
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
      const owned = (await tx.unlock.findMany({ where: { userId, key: { startsWith: "pet:" } }, select: { key: true } })).map((u) => u.key.slice(4));

      const settled = settle(row ? normalizeState(row.data, now) : emptyState(now), now, bonus);

      // Krmení úrodou z farmy sahá do dvou her naráz, proto běží ve stejné transakci s oběma zámky.
      const farmRow = await tx.idleState.findUnique({ where: { userId_game: { userId, game: "farma" } } });
      let farmUpdate: { id: string; updatedAt: Date; data: Prisma.InputJsonValue } | null = null;
      let outcome: ActionResult;
      if (body.action === "feedFarm") {
        const took = farmRow ? takeItem(normalizeFarm(farmRow.data, now), body.item) : null;
        if (!farmRow || !took || !took.ok) return { outcome: { ok: false, error: "no-item" } as ActionResult, points, owned, farmData: farmRow?.data };
        outcome = feedWithFarm(settled, itemPrice(body.item as Parameters<typeof itemPrice>[0]));
        if (outcome.ok) farmUpdate = { id: farmRow.id, updatedAt: farmRow.updatedAt, data: took.state as unknown as Prisma.InputJsonValue };
      } else {
        outcome = applyAction(settled, body, points, now, owned);
      }
      if (!outcome.ok) return { outcome, points, owned, farmData: farmRow?.data };

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
      let farmData: unknown = farmRow?.data;
      if (farmUpdate) {
        const moved = await tx.idleState.updateMany({ where: { id: farmUpdate.id, updatedAt: farmUpdate.updatedAt }, data: { data: farmUpdate.data } });
        if (moved.count === 0) throw new Conflict();
        farmData = farmUpdate.data;
      }
      return { outcome, points: points - cost, owned, farmData };
    }, { maxWait: 10_000, timeout: 20_000 });

    if (!result.outcome.ok) {
      return NextResponse.json({ error: result.outcome.error }, { status: 400 });
    }
    return NextResponse.json(payload(result.outcome.state, result.points, bonus, now, result.owned, stockOf(result.farmData, now)));
  } catch (error) {
    if (error instanceof NotEnoughPoints) {
      return NextResponse.json({ error: "not-enough-points" }, { status: 400 });
    }
    if (error instanceof Conflict || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      return NextResponse.json({ error: "conflict" }, { status: 409 });
    }
    console.error("mazlicci POST failed", error);
    return NextResponse.json({ error: "unavailable", detail: errorCode(error) }, { status: 503 });
  }
}
