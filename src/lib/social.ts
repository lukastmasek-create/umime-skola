import { prisma } from "@/lib/prisma";
import { ACTIVITY_SOURCES, DAY_MS, dayKey, startOfUtcWeek } from "@/lib/gamify";

export const GROUP_WEEKLY_XP_PER_MEMBER = 100;
export const MAX_GROUP_MEMBERS = 40;
export const MAX_GROUPS_PER_USER = 5;
export const DUEL_DAYS = 7;
export const DUEL_REWARD_XP = 50;
export const LEAGUE_SIZE = 30;
export const LEAGUE_PROMOTE = 5;
export const LEAGUE_DEMOTE = 5;
export const LEAGUE_TIERS = 5;

// XP za učení a hraní (bez odměn za výzvy) v časovém okně pro dané hráče.
export async function activityXp(userIds: string[], from: Date, to?: Date): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();
  const rows = await prisma.xpEvent.groupBy({
    by: ["userId"],
    where: {
      userId: { in: userIds },
      source: { in: [...ACTIVITY_SOURCES] },
      createdAt: to ? { gte: from, lt: to } : { gte: from },
    },
    _sum: { amount: true },
  });
  return new Map(rows.map((r) => [r.userId, r._sum.amount ?? 0]));
}

export const weekKeyOf = (now: number) => dayKey(startOfUtcWeek(now));
export const previousWeekKey = (now: number) => dayKey(new Date(startOfUtcWeek(now).getTime() - 7 * DAY_MS));

// Stabilní hash řetězce (FNV-1a), podle něj se hráči rozdělují do skupin ligy.
export function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Rozdělí hráče do skupin po LEAGUE_SIZE; poslední skupina se přidá k předchozí,
// pokud by byla příliš malá (aby nikdo nebyl v lize skoro sám).
export function cohortOf(userId: string, members: string[], weekKey: string): string[] {
  const sorted = [...members].sort((a, b) => hash(a + weekKey) - hash(b + weekKey) || a.localeCompare(b));
  let groups = Math.max(1, Math.floor(sorted.length / LEAGUE_SIZE));
  if (sorted.length % LEAGUE_SIZE >= LEAGUE_SIZE / 2) groups = Math.ceil(sorted.length / LEAGUE_SIZE);
  const index = sorted.indexOf(userId);
  const size = sorted.length / groups;
  const g = Math.min(groups - 1, Math.floor(index / size));
  return sorted.slice(Math.round(g * size), Math.round((g + 1) * size));
}

export type LeagueRow = { userId: string; xp: number };

export function rankCohort(cohort: string[], xp: Map<string, number>): LeagueRow[] {
  return cohort
    .map((userId) => ({ userId, xp: xp.get(userId) ?? 0 }))
    .sort((a, b) => b.xp - a.xp || a.userId.localeCompare(b.userId));
}

// Nový tier po skončení týdne: nahoru první z žebříčku s aktivitou, dolů poslední.
export function nextTier(tier: number, rank: number, cohortSize: number, xp: number): number {
  if (cohortSize < 10) return tier;
  if (rank < LEAGUE_PROMOTE && xp > 0) return Math.min(LEAGUE_TIERS - 1, tier + 1);
  if (rank >= cohortSize - LEAGUE_DEMOTE) return Math.max(0, tier - 1);
  return tier;
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function randomCode(): string {
  let out = "";
  for (let i = 0; i < 6; i++) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return out;
}
