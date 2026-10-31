import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventBonusFor } from "@/lib/idle/events";
import { challengeBoost } from "@/lib/idle/challenge-server";
import { roomEndless } from "@/lib/room-server";
import { getXp } from "@/lib/xp";
import { levelFromXp } from "@/lib/progression";
import {
  OFFLINE_CAP_HOURS,
  answerDebrief,
  buildMany,
  buildShip,
  cityBonusFromBuildings,
  collectMissions,
  computeBase,
  demolishAt,
  launchMission,
  learningBonusFromXp,
  normalizeBase,
  petBonusFromLevel,
  researchDest,
  settleBase,
  startState,
  type BaseError,
  type BaseState,
  type Bonus,
} from "@/lib/idle/base";
import { levelFromGrowth, normalizeState as normalizePets } from "@/lib/idle/pets";
import { normalizeCity } from "@/lib/idle/city";

const GAME = "zakladna";
const DAY_MS = 24 * 60 * 60 * 1000;

function errorCode(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) return error.code;
  if (error instanceof Error) return error.name;
  return "unknown";
}

class Conflict extends Error {}
class NotEnoughPoints extends Error {}

type Db = Pick<typeof prisma, "xpEvent" | "idleState">;

// Bonusy z učení a z ostatních Stálých her. Všechny mají strop v lib/idle/base.ts.
async function bonuses(db: Db, userId: string, now: number): Promise<{ bonus: Bonus; level: number }> {
  const [sum, xp, pets, city, boost, room] = await Promise.all([
    db.xpEvent.aggregate({ where: { userId, createdAt: { gte: new Date(now - DAY_MS) } }, _sum: { amount: true } }),
    getXp(userId),
    db.idleState.findUnique({ where: { userId_game: { userId, game: "mazlicci" } }, select: { data: true } }),
    db.idleState.findUnique({ where: { userId_game: { userId, game: "mesto" } }, select: { data: true } }),
    challengeBoost(db, userId, "base", now),
    roomEndless(db, userId),
  ]);
  let petLevel: number | null = null;
  if (pets) {
    const state = normalizePets(pets.data, now);
    const active = state.active ? state.pets[state.active] : undefined;
    petLevel = active ? levelFromGrowth(active.growth) : null;
  }
  const buildings = city ? normalizeCity(city.data, now).items.length : 0;
  return {
    bonus: {
      learning: learningBonusFromXp(sum._sum.amount ?? 0),
      pet: petBonusFromLevel(petLevel),
      city: cityBonusFromBuildings(buildings),
      event: eventBonusFor("base", now).total + boost + room,
    },
    level: levelFromXp(xp),
  };
}

function payload(state: BaseState, points: number, level: number, bonus: Bonus, now: number) {
  const stats = computeBase(state, bonus);
  return {
    state,
    points,
    level,
    bonus,
    event: eventBonusFor("base", now),
    now,
    offlineCapHours: OFFLINE_CAP_HOURS,
    stats: {
      energyProduced: stats.energyProduced,
      energyUsed: stats.energyUsed,
      powerFactor: stats.powerFactor,
      housing: stats.housing,
      crewNeeded: stats.crewNeeded,
      crewFactor: stats.crewFactor,
      lifeCapacity: stats.lifeCapacity,
      lifeFactor: stats.lifeFactor,
      efficiency: stats.efficiency,
      creditsPerHour: stats.creditsPerHour,
      sciencePerHour: stats.sciencePerHour,
      slots: stats.slots,
      shipyards: stats.shipyards,
      missionBonus: stats.missionBonus,
      modules: stats.modules,
    },
    // Indexy modulů, které nejsou spojené s velitelským modulem.
    idle: stats.connected.flatMap((ok, i) => (ok ? [] : [i])),
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
      bonuses(prisma, userId, now),
    ]);
    const settled = settleBase(row ? normalizeBase(row.data, now) : startState(now), now, learn.bonus);
    if (row) {
      await prisma.idleState.update({ where: { id: row.id }, data: { data: settled as unknown as Prisma.InputJsonValue } });
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
  ship?: unknown;
  type?: unknown;
  dest?: unknown;
  choice?: unknown;
};

function asList<T>(value: unknown, guard: (v: unknown) => v is T): T[] {
  return Array.isArray(value) ? value.filter(guard) : [];
}

const isBuild = (v: unknown): v is { id: string; x: number; y: number; rot?: 0 | 1 } =>
  !!v && typeof v === "object" && typeof (v as { id?: unknown }).id === "string" &&
  typeof (v as { x?: unknown }).x === "number" && typeof (v as { y?: unknown }).y === "number";
const isTile = (v: unknown): v is { x: number; y: number } =>
  !!v && typeof v === "object" && typeof (v as { x?: unknown }).x === "number" && typeof (v as { y?: unknown }).y === "number";

const ACTIONS = ["build", "demolish", "buildShip", "research", "launch", "collect", "answer"];

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Body;
  if (typeof body.action !== "string" || !ACTIONS.includes(body.action)) {
    return NextResponse.json({ error: "unknown-action" }, { status: 400 });
  }

  try {
    const now = Date.now();
    const learn = await bonuses(prisma, userId, now);

    const result = await prisma.$transaction(async (tx) => {
      const row = await tx.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } });
      const user = await tx.user.findUnique({ where: { id: userId }, select: { points: true } });
      const points = user?.points ?? 0;
      const settled = settleBase(row ? normalizeBase(row.data, now) : startState(now), now, learn.bonus);
      const ctx = { level: learn.level, points };

      let nextState: BaseState;
      let spent = 0;
      let info: Record<string, unknown> = {};
      let fail: BaseError | null = null;

      switch (body.action) {
        case "build": {
          const out = buildMany(settled, asList(body.items, isBuild), ctx);
          if (!out.ok) fail = out.error;
          else {
            nextState = out.state;
            spent = out.pointsSpent;
            info = { placed: out.placed, failed: out.failed };
          }
          break;
        }
        case "demolish": {
          const out = demolishAt(settled, asList(body.tiles, isTile));
          if (!out.ok) fail = out.error;
          else {
            nextState = out.state;
            info = { removed: out.removed, refund: out.refund };
          }
          break;
        }
        case "buildShip": {
          const out = buildShip(settled, body.type, ctx, now, learn.bonus);
          if (!out.ok) fail = out.error;
          else {
            nextState = out.state;
            spent = out.pointsSpent;
          }
          break;
        }
        case "research": {
          const out = researchDest(settled, body.dest);
          if (!out.ok) fail = out.error;
          else nextState = out.state;
          break;
        }
        case "launch": {
          const out = launchMission(settled, body.ship, body.dest, now, learn.bonus);
          if (!out.ok) fail = out.error;
          else nextState = out.state;
          break;
        }
        case "collect": {
          const out = collectMissions(settled, now);
          if (!out.ok) fail = out.error;
          else {
            nextState = out.state;
            info = { collected: out.collected };
          }
          break;
        }
        default: {
          const out = answerDebrief(settled, body.choice);
          if (!out.ok) fail = out.error;
          else {
            nextState = out.state;
            info = { correct: out.correct, correctIndex: out.correctIndex, dest: out.dest, science: out.science };
          }
        }
      }
      if (fail) return { error: fail };
      // TypeScript neví, že po úspěchu je nextState vždy nastavený.
      const finalState = nextState!;

      if (spent > 0) {
        const paid = await tx.user.updateMany({
          where: { id: userId, points: { gte: spent } },
          data: { points: { decrement: spent } },
        });
        if (paid.count === 0) throw new NotEnoughPoints();
      }

      const data = finalState as unknown as Prisma.InputJsonValue;
      if (row) {
        // Optimistic lock: když mezitím základnu změnila jiná záložka, akci zahodíme.
        const updated = await tx.idleState.updateMany({ where: { id: row.id, updatedAt: row.updatedAt }, data: { data } });
        if (updated.count === 0) throw new Conflict();
      } else {
        await tx.idleState.create({ data: { userId, game: GAME, data } });
      }
      return { state: finalState, points: points - spent, info };
    }, { maxWait: 10_000, timeout: 20_000 });

    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ...payload(result.state, result.points, learn.level, learn.bonus, now), info: result.info });
  } catch (error) {
    if (error instanceof NotEnoughPoints) return NextResponse.json({ error: "not-enough-points" }, { status: 400 });
    if (error instanceof Conflict || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      return NextResponse.json({ error: "conflict" }, { status: 409 });
    }
    console.error("zakladna POST failed", error);
    return NextResponse.json({ error: "unavailable", detail: errorCode(error) }, { status: 503 });
  }
}
