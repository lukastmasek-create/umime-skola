import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  arbitrage,
  arbitrageLimit,
  arbitrageSpread,
  assetPrice,
  buyAsset,
  buyCompany,
  cashOutHustle,
  collectHustle,
  createCharacter,
  currentEvent,
  eduCost,
  emptyState,
  fundResponse,
  hireStaff,
  investEdu,
  learningBonusFromXp,
  netWorth,
  normalizeState,
  quitJob,
  rates,
  restart,
  runCampaign,
  sellAsset,
  setCompanySetting,
  settle,
  startHustle,
  takeJob,
  topUpHustle,
  upgradeCompany,
  ASSETS,
  type ActionResult,
  type EconomyState,
} from "@/lib/idle/economy";

const GAME = "ekonomika";
const DAY_MS = 24 * 60 * 60 * 1000;

class Conflict extends Error {}
class NotEnoughPoints extends Error {}

async function learningFor(userId: string, now: number): Promise<number> {
  const sum = await prisma.xpEvent.aggregate({ where: { userId, createdAt: { gte: new Date(now - DAY_MS) } }, _sum: { amount: true } });
  return learningBonusFromXp(sum._sum.amount ?? 0);
}

function payload(state: EconomyState, points: number, learning: number, now: number) {
  const rate = rates(state, now, learning);
  const event = currentEvent(now);
  return {
    state,
    points,
    now,
    learning,
    rates: rate,
    netWorth: netWorth(state, now),
    prices: Object.fromEntries(ASSETS.map((a) => [a.id, assetPrice(a.id, now)])),
    arbitrage: { spread: arbitrageSpread(now), limit: arbitrageLimit(state) },
    eduCost: eduCost(state.edu),
    event: event ? { id: event.def.id, window: event.window, endsAt: event.endsAt } : null,
  };
}

type Body = {
  action?: unknown;
  id?: unknown;
  amount?: unknown;
  share?: unknown;
  country?: unknown;
  name?: unknown;
  city?: unknown;
  era?: unknown;
  family?: unknown;
  stake?: unknown;
  risk?: unknown;
  field?: unknown;
  value?: unknown;
  delta?: unknown;
};

function applyAction(state: EconomyState, body: Body, now: number): ActionResult {
  switch (body.action) {
    case "create":
      return createCharacter(state, body, now);
    case "restart":
      return restart(state, now);
    case "takeJob":
      return takeJob(state, body.id, now);
    case "quitJob":
      return quitJob(state, now);
    case "buyCompany":
      return buyCompany(state, body.id, now);
    case "upgradeCompany":
      return upgradeCompany(state, body.id, now);
    case "hireStaff":
      return hireStaff(state, body.id, body.delta, now);
    case "setCompanySetting":
      return setCompanySetting(state, body.id, body.field, body.value, now);
    case "runCampaign":
      return runCampaign(state, body.id, now);
    case "fundResponse":
      return fundResponse(state, body.id, now);
    case "buyAsset":
      return buyAsset(state, body.id, body.amount, now);
    case "sellAsset":
      return sellAsset(state, body.id, body.share, now);
    case "arbitrage":
      return arbitrage(state, body.amount, now);
    case "startHustle":
      return startHustle(state, body.id, now, Math.random, { stake: body.stake, risk: body.risk });
    case "topUpHustle":
      return topUpHustle(state, body.id, now, body.stake);
    case "collectHustle":
      return collectHustle(state, body.id, now);
    case "cashOutHustle":
      return cashOutHustle(state, body.id, now);
    case "investEdu":
      return investEdu(state, now);
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
    const [row, user, learning] = await Promise.all([
      prisma.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } }),
      prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
      learningFor(userId, now),
    ]);
    const state = settle(row ? normalizeState(row.data, now) : emptyState(now), now, learning);
    // Uložíme i při pouhém otevření, ať je žebříček aktuální. Při souběhu s akcí se zápis tiše zahodí.
    if (row && state.character) {
      const data = state as unknown as Prisma.InputJsonValue;
      await prisma.idleState.updateMany({ where: { id: row.id, updatedAt: row.updatedAt }, data: { data } }).catch(() => null);
    }
    return NextResponse.json(payload(state, user?.points ?? 0, learning, now));
  } catch (error) {
    console.error("ekonomika GET failed", error);
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
    const learning = await learningFor(userId, now);

    const result = await prisma.$transaction(
      async (tx) => {
        const row = await tx.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } });
        const user = await tx.user.findUnique({ where: { id: userId }, select: { points: true } });
        const points = user?.points ?? 0;

        const current = settle(row ? normalizeState(row.data, now) : emptyState(now), now, learning);
        const outcome = applyAction(current, body, now);
        if (!outcome.ok) return { outcome, points };

        const cost = outcome.pointsSpent ?? 0;
        if (cost > 0) {
          const spent = await tx.user.updateMany({ where: { id: userId, points: { gte: cost } }, data: { points: { decrement: cost } } });
          if (spent.count === 0) throw new NotEnoughPoints();
        }

        const data = { ...outcome.state, lastSeen: now } as unknown as Prisma.InputJsonValue;
        if (row) {
          const updated = await tx.idleState.updateMany({ where: { id: row.id, updatedAt: row.updatedAt }, data: { data } });
          if (updated.count === 0) throw new Conflict();
        } else {
          await tx.idleState.create({ data: { userId, game: GAME, data } });
        }
        return { outcome, points: points - cost };
      },
      { maxWait: 10_000, timeout: 20_000 },
    );

    if (!result.outcome.ok) return NextResponse.json({ error: result.outcome.error }, { status: 400 });
    return NextResponse.json({ ...payload(result.outcome.state, result.points, learning, now), gained: result.outcome.gained ?? null });
  } catch (error) {
    if (error instanceof NotEnoughPoints) return NextResponse.json({ error: "not-enough-points" }, { status: 400 });
    if (error instanceof Conflict || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      return NextResponse.json({ error: "conflict" }, { status: 409 });
    }
    console.error("ekonomika POST failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
