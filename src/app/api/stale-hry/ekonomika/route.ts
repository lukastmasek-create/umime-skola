import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { prisma } from "@/lib/prisma";
import { ECONOMY_GAME, learningFor } from "@/lib/idle/economy-server";
import {
  arbitrage,
  arbitrageLimit,
  cancelOrder,
  currentAssetEvent,
  placeOrder,
  arbitrageSpread,
  assetPrice,
  buyAsset,
  buyCompany,
  chooseShift,
  decideHustle,
  createCharacter,
  currentEvent,
  eduCost,
  emptyState,
  fundResponse,
  gameNow,
  exchangePoints,
  hireStaff,
  investEdu,
  netWorth,
  normalizeState,
  quitJob,
  rates,
  researchCompany,
  restart,
  negotiateRaise,
  requestPromotion,
  rest,
  runCampaign,
  sellAsset,
  sellCompany,
  setCompanySetting,
  setLead,
  setSpeed,
  settle,
  signContract,
  startHustle,
  startShift,
  startVacation,
  takeJob,
  topUpHustle,
  upgradeCompany,
  upgradePhase,
  unionDeal,
  buyStock,
  ASSETS,
  type ActionResult,
  type EconomyState,
} from "@/lib/idle/economy";

const GAME = ECONOMY_GAME;

// Na Workers jde práce po odeslání odpovědi dokončit přes waitUntil; jinde stačí nechat promise běžet.
function runInBackground(work: Promise<unknown>) {
  try {
    const { ctx } = getCloudflareContext({ async: false });
    ctx.waitUntil(work);
  } catch {
    void work;
  }
}

class Conflict extends Error {}
class NotEnoughPoints extends Error {}

function payload(state: EconomyState, points: number, learning: number, now: number) {
  const rate = rates(state, now, learning);
  const event = currentEvent(now);
  const assetEvent = currentAssetEvent(now);
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
    assetEvent: assetEvent ? { id: assetEvent.def.id, endsAt: assetEvent.endsAt } : null,
  };
}

type Body = {
  action?: unknown;
  direction?: unknown;
  id?: unknown;
  amount?: unknown;
  share?: unknown;
  country?: unknown;
  name?: unknown;
  city?: unknown;
  era?: unknown;
  family?: unknown;
  stake?: unknown;
  option?: unknown;
  field?: unknown;
  value?: unknown;
  delta?: unknown;
  role?: unknown;
  index?: unknown;
  on?: unknown;
  side?: unknown;
  when?: unknown;
  price?: unknown;
};

function applyAction(state: EconomyState, body: Body, now: number, learning: number, points: number): ActionResult {
  switch (body.action) {
    case "exchange":
      return exchangePoints(state, body.direction, body.amount, points, now);
    case "startShift":
      return startShift(state, now);
    case "chooseShift":
      return chooseShift(state, body.index, now, learning);
    case "rest":
      return rest(state, now);
    case "requestPromotion":
      return requestPromotion(state, now);
    case "negotiateRaise":
      return negotiateRaise(state, now);
    case "setLead":
      return setLead(state, body.on, now);
    case "startVacation":
      return startVacation(state, now);
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
      return hireStaff(state, body.id, body.delta, now, body.role);
    case "setCompanySetting":
      return setCompanySetting(state, body.id, body.field, body.value, now);
    case "runCampaign":
      return runCampaign(state, body.id, now);
    case "fundResponse":
      return fundResponse(state, body.id, now);
    case "sellCompany":
      return sellCompany(state, body.id, now);
    case "signContract":
      return signContract(state, body.id, now);
    case "researchCompany":
      return researchCompany(state, body.id, now);
    case "upgradePhase":
      return upgradePhase(state, now);
    case "unionDeal":
      return unionDeal(state, body.id, now);
    case "buyStock":
      return buyStock(state, body.id, body.amount, now);
    case "buyAsset":
      return buyAsset(state, body.id, body.amount, now);
    case "sellAsset":
      return sellAsset(state, body.id, body.share, now);
    case "arbitrage":
      return arbitrage(state, body.amount, now);
    case "startHustle":
      return startHustle(state, body.id, now, Math.random, { stake: body.stake });
    case "topUpHustle":
      return topUpHustle(state, body.id, now, body.stake);
    case "placeOrder":
      return placeOrder(state, { asset: body.id, side: body.side, when: body.when, price: body.price, amount: body.amount, share: body.share }, now);
    case "cancelOrder":
      return cancelOrder(state, body.id, now);
    case "decideHustle":
      return decideHustle(state, body.id, now, body.option);
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
    const real = Date.now();
    const [row, user, learning] = await Promise.all([
      prisma.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } }),
      prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
      learningFor(prisma, userId, real),
    ]);
    const base = row ? normalizeState(row.data, real) : emptyState(real);
    // Herní čas podle rychlosti hráče; reálný čas jen pro kotvu a pro XP za den.
    const now = gameNow(base, real);
    const state = settle(base, now, learning);
    // Uložíme i při pouhém otevření, ať je žebříček aktuální. Při souběhu s akcí se zápis tiše zahodí.
    // Zápis běží na pozadí, odpověď na načtení stránky na něj nečeká.
    if (row && state.character) {
      const data = state as unknown as Prisma.InputJsonValue;
      runInBackground(prisma.idleState.updateMany({ where: { id: row.id, updatedAt: row.updatedAt }, data: { data } }).catch(() => null));
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
    const real = Date.now();
    // Čtení jdou paralelně mimo transakci (jedna síťová odezva místo pěti sekvenčních).
    // Souběh hlídají stejně jako dřív: stav přes updatedAt a body přes podmíněné updateMany.
    const [learning, row, user] = await Promise.all([
      learningFor(prisma, userId, real),
      prisma.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } }),
      prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
    ]);

    const result = await prisma.$transaction(
      async (tx) => {
        const points = user?.points ?? 0;

        const base = row ? normalizeState(row.data, real) : emptyState(real);
        const now = gameNow(base, real);
        const current = settle(base, now, learning);
        const outcome = body.action === "setSpeed" ? setSpeed(current, body.value, real) : applyAction(current, body, now, learning, points);
        if (!outcome.ok) return { outcome, points, now };

        const cost = outcome.pointsSpent ?? 0;
        if (cost > 0) {
          const spent = await tx.user.updateMany({ where: { id: userId, points: { gte: cost } }, data: { points: { decrement: cost } } });
          if (spent.count === 0) throw new NotEnoughPoints();
        }

        // Směna bodů: odečtení jen když hráč pořád má dost (souběžné okno), přičtení se zapíše do historie bodů.
        const change = outcome.pointsChange;
        if (change) {
          if (change.amount < 0) {
            const spent = await tx.user.updateMany({ where: { id: userId, points: { gte: -change.amount } }, data: { points: { decrement: -change.amount } } });
            if (spent.count === 0) throw new NotEnoughPoints();
          } else {
            await tx.user.update({ where: { id: userId }, data: { points: { increment: change.amount } } });
          }
          await tx.pointTransaction.create({ data: { userId, amount: change.amount, reason: change.reason } });
        }

        const data = { ...outcome.state, lastSeen: now } as unknown as Prisma.InputJsonValue;
        if (row) {
          const updated = await tx.idleState.updateMany({ where: { id: row.id, updatedAt: row.updatedAt }, data: { data } });
          if (updated.count === 0) throw new Conflict();
        } else {
          await tx.idleState.create({ data: { userId, game: GAME, data } });
        }
        return { outcome, points: points - cost + (change?.amount ?? 0), now };
      },
      { maxWait: 10_000, timeout: 20_000 },
    );

    if (!result.outcome.ok) return NextResponse.json({ error: result.outcome.error }, { status: 400 });
    return NextResponse.json({
      ...payload(result.outcome.state, result.points, learning, result.now),
      gained: result.outcome.gained ?? null,
      event: result.outcome.event ?? null,
      hustle: result.outcome.hustle ?? null,
    });
  } catch (error) {
    if (error instanceof NotEnoughPoints) return NextResponse.json({ error: "not-enough-points" }, { status: 400 });
    if (error instanceof Conflict || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      return NextResponse.json({ error: "conflict" }, { status: 409 });
    }
    console.error("ekonomika POST failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
