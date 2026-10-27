import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getXp } from "@/lib/xp";
import { levelFromXp } from "@/lib/progression";
import { normalizeState as normalizePets, settle as settlePets } from "@/lib/idle/pets";
import { normalizeCity, settleCity } from "@/lib/idle/city";
import { normalizeCards, rollCard } from "@/lib/collection";
import { REVIEW_GAME, dueIds, normalizeReview } from "@/lib/review";
import {
  FREEZE_PRICE,
  MAX_FREEZES,
  applyStreakProtection,
  normalizeStreakState,
  ACHIEVEMENTS,
  WEEKLY_QUESTS,
  achievementSource,
  startOfUtcWeek,
  weeklySource,
  ACTIVITY_SOURCES,
  QUESTS,
  STREAK_MILESTONES,
  computeStreak,
  dayKey,
  milestoneSource,
  questSource,
  startOfUtcDay,
  type QuestId,
} from "@/lib/gamify";

const SOURCES = [...ACTIVITY_SOURCES];
const IDLE_GAMES = ["mazlicci", "mesto", "zakladna"];
const CARD_BOOST: Record<string, number> = { quest: 0, milestone: 0.4, weekly: 0.5, achievement: 0.7 };

async function saveIdle(userId: string, game: string, data: unknown) {
  const json = data as Prisma.InputJsonValue;
  await prisma.idleState.upsert({
    where: { userId_game: { userId, game } },
    create: { userId, game, data: json },
    update: { data: json },
  });
}

// Odměna za splněnou výzvu navíc: karta do sbírky (vzácnější za těžší výzvy).
async function grantCard(userId: string, kind: string) {
  const card = rollCard(CARD_BOOST[kind] ?? 0);
  const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: "cards" } } });
  const state = normalizeCards(row?.data);
  state.owned[card.id] = (state.owned[card.id] ?? 0) + 1;
  await saveIdle(userId, "cards", state);
  return card.id;
}

// Spočítá dnešní postup ve výzvách, sérii a úspěchy ze stávajících záznamů.
async function snapshot(userId: string) {
  const now = Date.now();
  const today = startOfUtcDay(now);
  const weekStart = startOfUtcWeek(now);
  const since = new Date(now - 400 * 24 * 60 * 60 * 1000);

  const [events, runs, idleToday, rewards, xp, idleRows] = await Promise.all([
    prisma.xpEvent.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { amount: true, source: true, createdAt: true },
    }),
    prisma.escapeRun.findMany({ where: { userId }, select: { room: true, createdAt: true } }),
    prisma.idleState.count({ where: { userId, updatedAt: { gte: today }, game: { in: IDLE_GAMES } } }),
    prisma.xpEvent.findMany({
      where: {
        userId,
        OR: [
          { source: { startsWith: "milestone:" } },
          { source: { startsWith: "achievement:" } },
          { source: { startsWith: "weekly:" }, createdAt: { gte: weekStart } },
          { source: { startsWith: "quest:" }, createdAt: { gte: today } },
        ],
      },
      select: { source: true },
    }),
    getXp(userId),
    prisma.idleState.findMany({ where: { userId, game: { in: ["streak", "mazlicci", "mesto", REVIEW_GAME] } } }),
  ]);
  const idleData = (game: string) => idleRows.find((r) => r.game === game)?.data;

  const activityDays = new Set<string>();
  let todayXp = 0;
  let todayTests = 0;
  let tests = 0;
  let games = 0;
  let weekXp = 0;
  let weekTests = 0;
  const weekDays = new Set<string>();
  for (const e of events) {
    if (!SOURCES.includes(e.source as (typeof SOURCES)[number])) continue;
    activityDays.add(dayKey(e.createdAt));
    if (e.source === "test") tests++;
    if (e.source === "game") games++;
    if (e.createdAt >= weekStart) {
      weekDays.add(dayKey(e.createdAt));
      if (e.source !== "escape") weekXp += e.amount;
      if (e.source === "test") weekTests++;
    }
    if (e.createdAt >= today) {
      if (e.source !== "escape") todayXp += e.amount;
      if (e.source === "test") todayTests++;
    }
  }
  for (const r of runs) {
    activityDays.add(dayKey(r.createdAt));
    if (r.createdAt >= weekStart) weekDays.add(dayKey(r.createdAt));
  }
  const weekEscapes = runs.filter((r) => r.createdAt >= weekStart).length;
  const todayEscapes = runs.filter((r) => r.createdAt >= today).length;

  // Zmrazení a záchrana série: kryté dny se přidají mezi dny s aktivitou.
  const protection = applyStreakProtection(activityDays, normalizeStreakState(idleData("streak")), now, todayTests > 0);
  if (protection.changed) await saveIdle(userId, "streak", protection.state);
  const streakState = protection.state;
  const streak = computeStreak([...activityDays, ...streakState.covered], now);
  const claimed = new Set(rewards.map((r) => r.source));
  const progress: Record<QuestId, number> = {
    learn: todayXp,
    test: todayTests,
    escape: todayEscapes,
    idle: idleToday,
  };

  const weekly: Record<string, number> = { xp: weekXp, days: weekDays.size, tests: weekTests, escape: weekEscapes };

  // Co čeká na návrat: hladový mazlíček a mince, které město vydělalo bez hráče.
  let pet: { name: string; species: string; hunger: number; happy: number } | null = null;
  let cityCoins = 0;
  try {
    const ps = normalizePets(idleData("mazlicci"), now);
    const settledPets = settlePets(ps, now, 0);
    const stats = settledPets.active ? settledPets.pets[settledPets.active] : undefined;
    if (settledPets.active && stats) {
      pet = { name: stats.name, species: settledPets.active, hunger: Math.round(stats.hunger), happy: Math.round(stats.happy) };
    }
  } catch {}
  try {
    const cityRow = idleData("mesto");
    if (cityRow) {
      const cs = normalizeCity(cityRow, now);
      cityCoins = Math.max(0, Math.floor(settleCity(cs, now, 0).coins - cs.coins));
    }
  } catch {}

  return {
    streak: {
      ...streak,
      freezes: streakState.freezes,
      maxFreezes: MAX_FREEZES,
      freezePrice: FREEZE_PRICE,
      atRisk: streak.current > 0 && !streak.doneToday,
      usedProtection: protection.used,
      rescuable: protection.rescuable,
    },
    pet,
    cityCoins,
    reviewDue: dueIds(normalizeReview(idleData(REVIEW_GAME)), now).length,
    weekKey: dayKey(weekStart),
    weekly: WEEKLY_QUESTS.map((q) => ({
      id: q.id,
      target: q.target,
      bonusXp: q.bonusXp,
      progress: Math.min(weekly[q.id], q.target),
      done: weekly[q.id] >= q.target,
      claimed: claimed.has(weeklySource(q.id, weekStart)),
    })),
    quests: QUESTS.map((q) => ({
      id: q.id,
      target: q.target,
      bonusXp: q.bonusXp,
      progress: Math.min(progress[q.id], q.target),
      done: progress[q.id] >= q.target,
      claimed: claimed.has(questSource(q.id)),
    })),
    milestones: STREAK_MILESTONES.map((m) => ({
      id: m.id,
      days: m.days,
      bonusXp: m.bonusXp,
      reached: streak.best >= m.days,
      claimed: claimed.has(milestoneSource(m.id)),
    })),
    achievements: ACHIEVEMENTS.map((a) => {
      const stats = {
        tests,
        games,
        escapeRooms: new Set(runs.map((r) => r.room)).size,
        bestStreak: streak.best,
        level: levelFromXp(xp),
      };
      const value = a.value(stats);
      return {
        id: a.id,
        icon: a.icon,
        target: a.target,
        bonusXp: a.bonusXp,
        value: Math.min(value, a.target),
        done: value >= a.target,
        claimed: claimed.has(achievementSource(a.id)),
      };
    }),
  };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false });
  try {
    return NextResponse.json({ loggedIn: true, ...(await snapshot(userId)) });
  } catch {
    return NextResponse.json({ error: "Databáze není dostupná." }, { status: 503 });
  }
}

// Vyzvednutí odměny za splněnou denní výzvu nebo milník série (každá jen jednou).
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Nejsi přihlášený/á." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const id = typeof body?.id === "string" ? body.id : "";
  const weekStart = startOfUtcWeek(Date.now());

  try {
    if (body?.action === "buy-freeze") {
      const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: "streak" } } });
      const state = normalizeStreakState(row?.data);
      if (state.freezes >= MAX_FREEZES) return NextResponse.json({ error: "max-freezes" }, { status: 409 });
      const paid = await prisma.user.updateMany({
        where: { id: userId, points: { gte: FREEZE_PRICE } },
        data: { points: { decrement: FREEZE_PRICE } },
      });
      if (paid.count === 0) return NextResponse.json({ error: "not-enough-points" }, { status: 409 });
      await saveIdle(userId, "streak", { ...state, freezes: state.freezes + 1 });
      return NextResponse.json({ gained: 0, ...(await snapshot(userId)) });
    }

    const snap = await snapshot(userId);
    const quest = snap.quests.find((q) => `quest:${q.id}` === id);
    const milestone = snap.milestones.find((m) => milestoneSource(m.id) === id);
    const achievement = snap.achievements.find((a) => achievementSource(a.id) === id);
    const weeklyQuest = snap.weekly.find((w) => weeklySource(w.id, weekStart) === id);
    const target = quest
      ? { ok: quest.done && !quest.claimed, amount: quest.bonusXp }
      : milestone
        ? { ok: milestone.reached && !milestone.claimed, amount: milestone.bonusXp }
        : achievement
          ? { ok: achievement.done && !achievement.claimed, amount: achievement.bonusXp }
          : weeklyQuest
            ? { ok: weeklyQuest.done && !weeklyQuest.claimed, amount: weeklyQuest.bonusXp }
            : null;
    if (!target) return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
    if (!target.ok) return NextResponse.json({ error: "Odměna není k vyzvednutí." }, { status: 409 });

    await prisma.xpEvent.create({ data: { userId, amount: target.amount, source: id } });
    const card = await grantCard(userId, id.split(":")[0]).catch(() => null);
    return NextResponse.json({ gained: target.amount, card, ...(await snapshot(userId)) });
  } catch {
    return NextResponse.json({ error: "Databáze není dostupná." }, { status: 503 });
  }
}
