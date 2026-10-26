import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfUtcWeek } from "@/lib/gamify";
import {
  LEAGUE_DEMOTE,
  LEAGUE_PROMOTE,
  activityXp,
  cohortOf,
  nextTier,
  previousWeekKey,
  rankCohort,
  weekKeyOf,
} from "@/lib/social";

// Řádek hráče pro tento týden: tier se odvodí z výsledku minulého týdne
// v jeho tehdejší lize (řádky minulých týdnů se nemění).
async function ensureEntry(userId: string, now: number) {
  const weekKey = weekKeyOf(now);
  const existing = await prisma.leagueEntry.findUnique({ where: { userId_weekKey: { userId, weekKey } } });
  if (existing) return { entry: existing, movement: 0 };

  const prevKey = previousWeekKey(now);
  const prev = await prisma.leagueEntry.findUnique({ where: { userId_weekKey: { userId, weekKey: prevKey } } });
  let tier = 0;
  if (prev) {
    const peers = await prisma.leagueEntry.findMany({ where: { weekKey: prevKey, tier: prev.tier }, select: { userId: true } });
    const cohort = cohortOf(userId, peers.map((p) => p.userId), prevKey);
    const from = new Date(startOfUtcWeek(now).getTime() - 7 * 24 * 60 * 60 * 1000);
    const xp = await activityXp(cohort, from, startOfUtcWeek(now));
    const ranked = rankCohort(cohort, xp);
    const rank = ranked.findIndex((r) => r.userId === userId);
    tier = nextTier(prev.tier, rank, ranked.length, ranked[rank]?.xp ?? 0);
  }
  try {
    const entry = await prisma.leagueEntry.create({ data: { userId, weekKey, tier } });
    return { entry, movement: prev ? tier - prev.tier : 0 };
  } catch {
    // Dvě záložky najednou: druhá najde už vytvořený řádek.
    const entry = await prisma.leagueEntry.findUniqueOrThrow({ where: { userId_weekKey: { userId, weekKey } } });
    return { entry, movement: 0 };
  }
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false });
  try {
    const now = Date.now();
    const { entry, movement } = await ensureEntry(userId, now);
    const peers = await prisma.leagueEntry.findMany({
      where: { weekKey: entry.weekKey, tier: entry.tier },
      select: { userId: true },
    });
    const cohort = cohortOf(userId, peers.map((p) => p.userId), entry.weekKey);
    const xp = await activityXp(cohort, startOfUtcWeek(now));
    const ranked = rankCohort(cohort, xp);
    const users = await prisma.user.findMany({
      where: { id: { in: cohort } },
      select: { id: true, name: true, avatar: true },
    });
    const byId = new Map(users.map((u) => [u.id, u]));
    const rank = ranked.findIndex((r) => r.userId === userId);
    return NextResponse.json({
      loggedIn: true,
      tier: entry.tier,
      movement,
      rank: rank + 1,
      size: ranked.length,
      promote: ranked.length >= 10 ? LEAGUE_PROMOTE : 0,
      demote: ranked.length >= 10 && entry.tier > 0 ? LEAGUE_DEMOTE : 0,
      endsAt: new Date(startOfUtcWeek(now).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      rows: ranked.map((r) => ({
        id: r.userId,
        me: r.userId === userId,
        xp: r.xp,
        name: byId.get(r.userId)?.name ?? null,
        avatar: byId.get(r.userId)?.avatar ?? null,
      })),
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
