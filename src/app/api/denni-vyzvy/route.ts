import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getXp } from "@/lib/xp";
import { STYLE_GAME } from "@/lib/cosmetics";
import { levelFromXp } from "@/lib/progression";
import {
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

// Spočítá dnešní postup ve výzvách, sérii a úspěchy ze stávajících záznamů.
async function snapshot(userId: string) {
  const now = Date.now();
  const today = startOfUtcDay(now);
  const weekStart = startOfUtcWeek(now);
  const since = new Date(now - 400 * 24 * 60 * 60 * 1000);

  const [events, runs, idleToday, rewards, xp] = await Promise.all([
    prisma.xpEvent.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { amount: true, source: true, createdAt: true },
    }),
    prisma.escapeRun.findMany({ where: { userId }, select: { room: true, createdAt: true } }),
    prisma.idleState.count({ where: { userId, updatedAt: { gte: today }, game: { not: STYLE_GAME } } }),
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
  ]);

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

  const streak = computeStreak(activityDays, now);
  const claimed = new Set(rewards.map((r) => r.source));
  const progress: Record<QuestId, number> = {
    learn: todayXp,
    test: todayTests,
    escape: todayEscapes,
    idle: idleToday,
  };

  const weekly: Record<string, number> = { xp: weekXp, days: weekDays.size, tests: weekTests, escape: weekEscapes };

  return {
    streak,
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
    return NextResponse.json({ gained: target.amount, ...(await snapshot(userId)) });
  } catch {
    return NextResponse.json({ error: "Databáze není dostupná." }, { status: 503 });
  }
}
