import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  BUY_PER_DAY,
  RECIPES,
  activate,
  activeTotal,
  buy,
  craft,
  recipeDef,
  refine,
  setFocus,
  unlockKey,
  type CraftState,
} from "@/lib/craft";
import { CraftConflict, loadCraft, saveCraft } from "@/lib/craft-server";
import { CHALLENGE_GAME, CH_GAMES, MAX_SHIELDS, normalizeChallenge } from "@/lib/idle/challenge";
import { WHEEL_SPIN_COOLDOWN_MS } from "@/lib/wheel";

// Craftování: GET vrátí stav (a připíše materiály za učení a úkoly od minula), POST provede akci:
// craft (vyrobit), use (použít bonus), refine (zušlechtit), buy (koupit za body), focus (svět pro sběr).

const CRAFT_KEYS = RECIPES.map(unlockKey).filter((k): k is string => !!k);

class ActionError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

async function context(userId: string) {
  const [user, unlocks] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { points: true, lastWheelSpinAt: true } }),
    prisma.unlock.findMany({ where: { userId, key: { in: CRAFT_KEYS } }, select: { key: true } }),
  ]);
  return { points: user?.points ?? 0, lastWheelSpinAt: user?.lastWheelSpinAt ?? null, owned: unlocks.map((u) => u.key) };
}

function view(state: CraftState, points: number, owned: string[], now: number, gained: Record<string, number>) {
  return {
    loggedIn: true,
    now,
    points,
    focus: state.focus,
    mats: state.mats,
    inv: state.inv,
    boosts: state.boosts.filter((b) => b.until > now),
    xpTotal: activeTotal(state, "xp", now),
    endlessTotal: activeTotal(state, "endless", now),
    buyLeft: Math.max(0, BUY_PER_DAY - state.bought.count),
    owned,
    gained,
  };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false }, { status: 401 });
  try {
    const now = Date.now();
    let loaded = await loadCraft(userId, now);
    // Souběžné otevření ve dvou oknech: jednou zkusíme znovu, jinak se materiály připíšou při dalším načtení.
    for (let attempt = 0; loaded.dirty; attempt++) {
      try {
        await prisma.$transaction((tx) => saveCraft(tx, userId, loaded.version, loaded.state));
        break;
      } catch (e) {
        if (!(e instanceof CraftConflict) || attempt >= 1) throw e;
        loaded = await loadCraft(userId, now);
      }
    }
    const ctx = await context(userId);
    return NextResponse.json(view(loaded.state, ctx.points, ctx.owned, now, loaded.gained));
  } catch (error) {
    if (error instanceof CraftConflict) return NextResponse.json({ error: "conflict" }, { status: 409 });
    console.error("craft GET failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = body.action;
  const id = typeof body.id === "string" ? body.id : "";

  try {
    const now = Date.now();
    const loaded = await loadCraft(userId, now);
    const ctx = await context(userId);
    let state = loaded.state;
    let points = ctx.points;
    const owned = [...ctx.owned];
    let done: Record<string, unknown> = {};

    const result = await prisma.$transaction(async (tx) => {
      if (action === "craft") {
        const r = craft(state, id, owned);
        if (!r.ok) throw new ActionError(r.error);
        state = r.state;
        if (r.unlock) {
          await tx.unlock.upsert({ where: { userId_key: { userId, key: r.unlock } }, create: { userId, key: r.unlock }, update: {} });
          owned.push(r.unlock);
        }
        done = { kind: r.recipe.output === "bonus" ? "crafted" : "unlocked", recipe: r.recipe.id };
      } else if (action === "use") {
        const recipe = recipeDef(id);
        // Žeton na kolo a štít mají smysl jen tehdy, když něco opravdu udělají.
        if (recipe?.effect?.kind === "wheel") {
          const ready = !ctx.lastWheelSpinAt || ctx.lastWheelSpinAt.getTime() + WHEEL_SPIN_COOLDOWN_MS <= now;
          if (ready) throw new ActionError("wheel-ready");
        }
        let challenge: ReturnType<typeof normalizeChallenge> | null = null;
        if (recipe?.effect?.kind === "shield") {
          const row = await tx.idleState.findUnique({ where: { userId_game: { userId, game: CHALLENGE_GAME } }, select: { data: true } });
          challenge = normalizeChallenge(row?.data ?? null, now);
          if (CH_GAMES.every((g) => challenge!.games[g].shield >= MAX_SHIELDS)) throw new ActionError("shield-full");
        }
        const r = activate(state, id, now);
        if (!r.ok) throw new ActionError(r.error);
        state = r.state;
        const effect = r.effect;
        if (effect.kind === "points") {
          await tx.pointTransaction.create({ data: { userId, amount: effect.amount, reason: "Craftování: měšec bodů" } });
          points = (await tx.user.update({ where: { id: userId }, data: { points: { increment: effect.amount } }, select: { points: true } })).points;
          done = { kind: "points", n: effect.amount };
        } else if (effect.kind === "wheel") {
          await tx.user.update({ where: { id: userId }, data: { lastWheelSpinAt: null } });
          done = { kind: "wheel" };
        } else if (effect.kind === "shield" && challenge) {
          const games = { ...challenge.games };
          for (const g of CH_GAMES) games[g] = { ...games[g], shield: Math.min(MAX_SHIELDS, games[g].shield + 1) };
          const data = { ...challenge, games } as unknown as Prisma.InputJsonValue;
          await tx.idleState.upsert({ where: { userId_game: { userId, game: CHALLENGE_GAME } }, create: { userId, game: CHALLENGE_GAME, data }, update: { data } });
          done = { kind: "shield" };
        } else if (effect.kind === "xp") {
          done = { kind: "xp", n: activeTotal(state, "xp", now) };
        } else if (effect.kind === "endless") {
          done = { kind: "endless", n: Math.round(activeTotal(state, "endless", now) * 100) };
        }
      } else if (action === "refine") {
        const r = refine(state, id);
        if (!r.ok) throw new ActionError(r.error);
        state = r.state;
        done = { kind: "refined", material: r.made };
      } else if (action === "buy") {
        const r = buy(state, id, typeof body.count === "number" ? body.count : 1, points, now);
        if (!r.ok) throw new ActionError(r.error);
        state = r.state;
        // Body se odečtou jen tehdy, když na ně hráč pořád má (souběžné nákupy v jiném okně).
        const res = await tx.user.updateMany({ where: { id: userId, points: { gte: r.price } }, data: { points: { decrement: r.price } } });
        if (res.count === 0) throw new ActionError("points");
        await tx.pointTransaction.create({ data: { userId, amount: -r.price, reason: "Craftování: nákup materiálu" } });
        points -= r.price;
        done = { kind: "bought" };
      } else if (action === "focus") {
        const r = setFocus(state, body.world);
        if (!r.ok) throw new ActionError(r.error);
        state = r.state;
        done = { kind: "focus", world: state.focus };
      } else {
        throw new ActionError("unknown");
      }
      await saveCraft(tx, userId, loaded.version, state);
      return done;
    });

    return NextResponse.json({ ...view(state, points, owned, now, loaded.gained), done: result });
  } catch (error) {
    if (error instanceof ActionError) return NextResponse.json({ error: error.code }, { status: error.code === "unknown" ? 400 : 409 });
    if (error instanceof CraftConflict) return NextResponse.json({ error: "conflict" }, { status: 409 });
    console.error("craft POST failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
