import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DAY_MS, startOfUtcWeek } from "@/lib/gamify";
import { DAILY_ACTIVITY_XP_CAP } from "@/lib/progression";
import { applyResults, dueIds, normalizeReview, REVIEW_GAME } from "@/lib/review";
import { getItem as getCityItem, normalizeCity } from "@/lib/idle/city";
import { normalizeBase } from "@/lib/idle/base";
import { levelInfo } from "@/lib/idle/farm";
import {
  BOSS_LIVES,
  CHALLENGE_GAME,
  CHAPTERS,
  CH_GAMES,
  GIFTS_PER_DAY,
  GIFT_AMOUNTS,
  MAX_INBOX,
  PARTY_ORDER_POINTS,
  WEAK_CHANCE,
  WEEK_TIERS,
  accuracy,
  applyAnswer,
  applyHint,
  boostBonus,
  chapterRequirement,
  isChGame,
  normalizeChallenge,
  partyOrderTarget,
  rankInParty,
  rollChallenge,
  targetDifficulty,
  weekKeyAt,
  weekReward,
  weekTier,
  type ChGame,
  type ChallengeState,
  type PartyRow,
  type Pending,
  type QuestionView,
  type Reward,
} from "@/lib/idle/challenge";

const GAME_KEY: Record<ChGame, string> = { farm: "farma", city: "mesto", base: "zakladna" };
const COIN_FIELD: Record<ChGame, string> = { farm: "coins", city: "coins", base: "credits" };
const QUESTION_LIMIT_MS = 30_000;

class Conflict extends Error {}
class Fail extends Error {
  constructor(public code: string) {
    super(code);
  }
}

type Tx = Prisma.TransactionClient;
type Db = Pick<typeof prisma, "idleState" | "user" | "groupMember" | "question" | "xpEvent">;

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

function gameProgress(game: ChGame, data: unknown, now: number): number {
  if (game === "farm") return levelInfo(num(obj(data).xp)).level;
  if (game === "city") return normalizeCity(data, now).items.filter((it) => getCityItem(it[0])?.cat !== "road").length;
  return normalizeBase(data, now).items.length;
}

async function loadGame(db: Pick<Tx, "idleState">, userId: string, game: ChGame) {
  return db.idleState.findUnique({ where: { userId_game: { userId, game: GAME_KEY[game] } } });
}

async function loadChallenge(db: Pick<Tx, "idleState">, userId: string, now: number) {
  const row = await db.idleState.findUnique({ where: { userId_game: { userId, game: CHALLENGE_GAME } } });
  return { row, state: rollChallenge(normalizeChallenge(row?.data, now), now) };
}

async function saveChallenge(tx: Tx, userId: string, row: { id: string; updatedAt: Date } | null, state: ChallengeState) {
  const data = state as unknown as Prisma.InputJsonValue;
  if (row) {
    const updated = await tx.idleState.updateMany({ where: { id: row.id, updatedAt: row.updatedAt }, data: { data } });
    if (updated.count === 0) throw new Conflict();
  } else {
    await tx.idleState.create({ data: { userId, game: CHALLENGE_GAME, data } });
  }
}

/** Přičte (nebo odečte) herní měnu přímo ve stavu hry; výdělek se započítá do žebříčku jen u odměn. */
async function changeCoins(tx: Tx, userId: string, game: ChGame, delta: number, earned: boolean) {
  const row = await loadGame(tx, userId, game);
  if (!row) throw new Fail("no-game");
  const d = obj(row.data);
  const field = COIN_FIELD[game];
  const current = num(d[field]);
  if (current + delta < 0) throw new Fail("not-enough-coins");
  const data = { ...d, [field]: current + delta, ...(earned && delta > 0 ? { totalEarned: num(d.totalEarned) + delta } : {}) };
  const updated = await tx.idleState.updateMany({ where: { id: row.id, updatedAt: row.updatedAt }, data: { data: data as Prisma.InputJsonValue } });
  if (updated.count === 0) throw new Conflict();
}

/** XP z her platí pod stejným denním stropem jako všude jinde. */
async function awardXp(tx: Tx, userId: string, amount: number, now: number): Promise<number> {
  if (amount <= 0) return 0;
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const used = await tx.xpEvent.aggregate({
    where: { userId, source: { in: ["game", "test"] }, createdAt: { gte: startOfDay } },
    _sum: { amount: true },
  });
  const gained = Math.min(amount, Math.max(0, DAILY_ACTIVITY_XP_CAP - (used._sum.amount ?? 0)));
  if (gained > 0) await tx.xpEvent.create({ data: { userId, amount: gained, source: "game" } });
  return gained;
}

async function awardPoints(tx: Tx, userId: string, amount: number, reason: string) {
  if (amount <= 0) return;
  await tx.user.update({ where: { id: userId }, data: { points: { increment: amount } } });
  await tx.pointTransaction.create({ data: { userId, amount, reason } });
}

async function grant(tx: Tx, userId: string, game: ChGame | null, reward: Reward, reason: string, now: number) {
  if (game && reward.coins > 0) await changeCoins(tx, userId, game, reward.coins, true);
  await awardPoints(tx, userId, reward.points, reason);
  const xp = await awardXp(tx, userId, reward.xp, now);
  return { ...reward, xp };
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type QuestionRow = { id: string; prompt: string; options: string[]; correctIndex: number; explanation: string; course: { title: string } };

function toView(q: QuestionRow, weak: boolean): QuestionView {
  const order = shuffle(q.options.map((_, i) => i));
  return {
    id: q.id,
    prompt: q.prompt,
    options: order.map((i) => q.options[i]),
    correctIndex: order.indexOf(q.correctIndex),
    explanation: q.explanation,
    course: q.course.title,
    weak,
  };
}

const questionSelect = { id: true, prompt: true, options: true, correctIndex: true, explanation: true, course: { select: { title: true } } } as const;

/** Adaptivní výběr: občas slabina z opakování, jinak otázka s obtížností podle poslední úspěšnosti. */
async function pickQuestion(db: Db, userId: string, state: ChallengeState, chapter: number | null, avoid: string[], now: number): Promise<QuestionView | null> {
  const exclude = [...new Set([...state.seen, ...avoid])];
  const usable = (q: QuestionRow) => q.options.length >= 4 && q.correctIndex >= 0 && q.correctIndex < q.options.length;

  const review = await db.idleState.findUnique({ where: { userId_game: { userId, game: REVIEW_GAME } }, select: { data: true } });
  const weakIds = dueIds(normalizeReview(review?.data), now).filter((id) => !exclude.includes(id));
  if (weakIds.length > 0 && Math.random() < WEAK_CHANCE) {
    const rows = await db.question.findMany({ where: { id: { in: shuffle(weakIds).slice(0, 8) } }, select: questionSelect });
    const ok = rows.filter(usable);
    if (ok.length > 0) return toView(ok[Math.floor(Math.random() * ok.length)], true);
  }

  const d = targetDifficulty(state.recent, chapter);
  for (const range of [{ gte: Math.max(1, d - 1), lte: Math.min(5, d + 1) }, undefined]) {
    const where: Prisma.QuestionWhereInput = {
      id: { notIn: exclude },
      course: { published: true },
      ...(range ? { difficulty: range } : {}),
    };
    const count = await db.question.count({ where });
    if (count === 0) continue;
    const rows = await db.question.findMany({ where, select: questionSelect, skip: Math.floor(Math.random() * Math.max(1, count - 8)), take: 8 });
    const ok = rows.filter(usable);
    if (ok.length > 0) return toView(ok[Math.floor(Math.random() * ok.length)], false);
  }
  return null;
}

function publicPending(p: Pending | null) {
  if (!p) return null;
  return {
    game: p.game,
    kind: p.boss ? "boss" : "quick",
    issuedAt: p.issuedAt,
    limitMs: QUESTION_LIMIT_MS,
    q: { prompt: p.q.prompt, options: p.q.options, course: p.q.course, weak: p.q.weak },
    hidden: p.hidden,
    boss: p.boss ? { ...p.boss, total: 5, maxLives: BOSS_LIVES } : null,
  };
}

async function partyInfo(db: Db, userId: string, state: ChallengeState, now: number) {
  const memberships = await db.groupMember.findMany({
    where: { userId },
    include: { group: { include: { members: { include: { user: { select: { id: true, name: true } } } } } } },
    orderBy: { joinedAt: "asc" },
  });
  const ids = [...new Set(memberships.flatMap((m) => m.group.members.map((x) => x.userId)))].slice(0, 200);
  const rows = await db.idleState.findMany({ where: { game: CHALLENGE_GAME, userId: { in: ids } }, select: { userId: true, data: true } });
  const week = weekKeyAt(now);
  const scores = new Map<string, { thisWeek: number; lastWeek: number }>();
  for (const r of rows) {
    const s = rollChallenge(normalizeChallenge(r.data, now), now);
    scores.set(r.userId, { thisWeek: s.week.key === week ? s.week.score : 0, lastWeek: s.lastWeek && s.lastWeek.key === state.lastWeek?.key ? s.lastWeek.score : 0 });
  }
  const names = new Map<string, string>();
  for (const m of memberships) for (const x of m.group.members) names.set(x.userId, x.user.name ?? "?");
  const friends = ids.filter((id) => id !== userId).map((id) => ({ userId: id, name: names.get(id) ?? "?" }));
  const board = (key: "thisWeek" | "lastWeek"): PartyRow[] =>
    ids.map((id) => ({ userId: id, name: names.get(id) ?? "?", score: id === userId ? (key === "thisWeek" ? state.week.score : (state.lastWeek?.score ?? 0)) : (scores.get(id)?.[key] ?? 0) }));
  const groups = memberships.map((m) => {
    const members = m.group.members.map((x) => x.userId);
    const score = members.reduce((sum, id) => sum + (id === userId ? state.week.score : (scores.get(id)?.thisWeek ?? 0)), 0);
    return { id: m.group.id, name: m.group.name, members: members.length, score, target: partyOrderTarget(members.length), claimed: state.week.party.includes(m.group.id) };
  });
  return { ids, friends, thisWeek: board("thisWeek"), lastWeek: board("lastWeek"), groups };
}

async function snapshot(db: Db, userId: string, now: number) {
  const { state } = await loadChallenge(db, userId, now);
  const party = await partyInfo(db, userId, state, now);
  const games = {} as Record<ChGame, unknown>;
  for (const game of CH_GAMES) {
    const row = await loadGame(db, userId, game);
    const meta = state.games[game];
    const progress = row ? gameProgress(game, row.data, now) : 0;
    const next = meta.chapter + 1;
    games[game] = {
      started: !!row,
      earned: row ? num(obj(row.data).totalEarned) : 0,
      progress,
      meta,
      boost: boostBonus(meta, now),
      boostLeftMs: Math.max(0, meta.boostUntil - now),
      nextChapter: next <= CHAPTERS ? next : null,
      requirement: next <= CHAPTERS ? chapterRequirement(game, next) : null,
      requirements: [0, 1, 2, 3, 4].map((i) => chapterRequirement(game, i + 1)),
    };
  }
  const rank = rankInParty(party.thisWeek, userId);
  const lastRank = state.lastWeek ? rankInParty(party.lastWeek, userId) : 0;
  return {
    loggedIn: true as const,
    now,
    games,
    pending: publicPending(state.pending),
    accuracy: accuracy(state.recent),
    week: {
      key: state.week.key,
      score: state.week.score,
      tier: weekTier(state.week.score),
      tiers: WEEK_TIERS,
      rank,
      endsAt: startOfUtcWeek(now).getTime() + 7 * DAY_MS,
    },
    lastWeek: state.lastWeek
      ? { key: state.lastWeek.key, score: state.lastWeek.score, tier: weekTier(state.lastWeek.score), claimed: state.lastWeek.claimed, rank: lastRank, reward: weekReward(state.lastWeek.score, lastRank) }
      : null,
    party: {
      ranking: [...party.thisWeek].filter((r) => r.score > 0 || r.userId === userId).sort((a, b) => b.score - a.score).slice(0, 10),
      groups: party.groups,
      friends: party.friends,
      orderPoints: PARTY_ORDER_POINTS,
    },
    inbox: state.inbox,
    gifts: { left: Math.max(0, GIFTS_PER_DAY - state.sent.count), amounts: GIFT_AMOUNTS, gifted: state.gifted },
  };
}

async function leaderboard(userId: string, game: ChGame) {
  type Row = { id: string; name: string | null; avatar: string | null; earned: number };
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT u."id", u."name", u."avatar",
      CASE WHEN jsonb_typeof(i."data"->'totalEarned') = 'number' THEN (i."data"->>'totalEarned')::float8 ELSE 0 END AS earned
    FROM "IdleState" i JOIN "User" u ON u."id" = i."userId"
    WHERE i."game" = ${GAME_KEY[game]}
    ORDER BY earned DESC
    LIMIT 10`;
  const mine = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: GAME_KEY[game] } }, select: { data: true } });
  const mineEarned = mine ? num(obj(mine.data).totalEarned) : null;
  let rank: number | null = null;
  if (mineEarned !== null) {
    const better = await prisma.$queryRaw<{ n: bigint }[]>`
      SELECT COUNT(*) AS n FROM "IdleState" i
      WHERE i."game" = ${GAME_KEY[game]}
        AND jsonb_typeof(i."data"->'totalEarned') = 'number'
        AND (i."data"->>'totalEarned')::float8 > ${mineEarned}`;
    rank = Number(better[0]?.n ?? 0) + 1;
  }
  return { game, rows: rows.map((r) => ({ id: r.id, name: r.name ?? "?", avatar: r.avatar, earned: Math.round(Number(r.earned)), me: r.id === userId })), rank, mine: mineEarned };
}

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false });
  try {
    const board = new URL(request.url).searchParams.get("board");
    if (board) {
      if (!isChGame(board)) return NextResponse.json({ error: "bad-request" }, { status: 400 });
      return NextResponse.json(await leaderboard(userId, board));
    }
    return NextResponse.json(await snapshot(prisma, userId, Date.now()));
  } catch (error) {
    console.error("vyzvy GET failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

type Body = Record<string, unknown>;

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Body;
  const now = Date.now();
  const game = isChGame(body.game) ? body.game : null;

  try {
    // Otázky se losují mimo transakci (je to jen čtení); ve transakci se jen uloží.
    const first = await loadChallenge(prisma, userId, now);
    let drawn: QuestionView | null = null;
    let bossStart: { chapter: number } | null = null;
    if (body.action === "ask" || body.action === "boss") {
      if (!game) throw new Fail("bad-request");
      if (first.state.pending) throw new Fail("pending");
      const row = await loadGame(prisma, userId, game);
      if (!row) throw new Fail("no-game");
      if (body.action === "boss") {
        const chapter = first.state.games[game].chapter + 1;
        if (chapter > CHAPTERS) throw new Fail("all-done");
        if (gameProgress(game, row.data, now) < chapterRequirement(game, chapter)) throw new Fail("locked");
        bossStart = { chapter };
      }
      drawn = await pickQuestion(prisma, userId, first.state, bossStart?.chapter ?? null, [], now);
      if (!drawn) throw new Fail("no-question");
    }
    let nextDrawn: QuestionView | null = null;
    if (body.action === "answer" && first.state.pending?.boss) {
      nextDrawn = await pickQuestion(prisma, userId, first.state, first.state.pending.boss.chapter, [first.state.pending.q.id], now);
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const { row, state } = await loadChallenge(tx, userId, now);
        const fail = (code: string): never => {
          throw new Fail(code);
        };

        switch (body.action) {
          case "ask":
          case "boss": {
            if (!game || !drawn) return fail("bad-request");
            if (state.pending) return fail("pending");
            const boss = bossStart ? { chapter: bossStart.chapter, idx: 0, right: 0, lives: BOSS_LIVES } : null;
            const next: ChallengeState = { ...state, pending: { game, issuedAt: now, q: drawn, hidden: [], boss } };
            await saveChallenge(tx, userId, row, next);
            return { state: next, extra: {} };
          }

          case "hint": {
            const next = applyHint(state);
            if (!next) return fail("no-hint");
            await saveChallenge(tx, userId, row, next);
            return { state: next, extra: {} };
          }

          case "abort": {
            if (!state.pending) return fail("no-pending");
            const g = state.pending.game;
            const next: ChallengeState = {
              ...state,
              pending: null,
              games: { ...state.games, [g]: { ...state.games[g], streak: state.pending.boss ? 0 : state.games[g].streak } },
            };
            await saveChallenge(tx, userId, row, next);
            return { state: next, extra: {} };
          }

          case "answer": {
            const p = state.pending;
            const choice = Math.floor(Number(body.choice));
            if (!p) return fail("no-pending");
            if (!Number.isFinite(choice) || choice < 0 || choice >= p.q.options.length || p.hidden.includes(choice)) return fail("bad-request");
            const gameRow = await loadGame(tx, userId, p.game);
            const earned = gameRow ? num(obj(gameRow.data).totalEarned) : 0;
            const out = applyAnswer(state, choice, earned, now);
            if (!out) return fail("no-pending");
            let next = out.state;
            if (next.pending && next.pending.boss) {
              if (!nextDrawn) {
                // Nezbyla žádná další otázka: boss se uzavře jako vyhraný, ať hráč nezůstane viset.
                next = { ...next, pending: null };
              } else {
                next = { ...next, pending: { ...next.pending, issuedAt: now, q: nextDrawn, hidden: [] } };
              }
            }
            const paid = await grant(tx, userId, p.game, out.reward, p.boss ? `vyzvy:boss:${p.game}:${p.boss.chapter}` : `vyzvy:${p.game}`, now);
            await saveChallenge(tx, userId, row, next);

            // Chyby se vrací do opakování, správné odpovědi posouvají to, co už se opakuje.
            const review = await tx.idleState.findUnique({ where: { userId_game: { userId, game: REVIEW_GAME } } });
            const reviewData = applyResults(normalizeReview(review?.data), [{ id: p.q.id, correct: out.correct }], now) as unknown as Prisma.InputJsonValue;
            await tx.idleState.upsert({
              where: { userId_game: { userId, game: REVIEW_GAME } },
              create: { userId, game: REVIEW_GAME, data: reviewData },
              update: { data: reviewData },
            });
            return {
              state: next,
              extra: {
                result: {
                  correct: out.correct,
                  fast: out.fast,
                  shielded: out.shielded,
                  streak: out.streak,
                  correctIndex: out.correctIndex,
                  explanation: out.explanation,
                  reward: paid,
                  gained: out.gained,
                  boss: out.boss,
                  weak: p.q.weak,
                  game: p.game,
                },
              },
            };
          }

          case "claimWeek": {
            const last = state.lastWeek;
            if (!last || last.claimed) return fail("claimed");
            const party = await partyInfo(tx as unknown as Db, userId, state, now);
            const rank = rankInParty(party.lastWeek, userId);
            const reward = weekReward(last.score, rank);
            if (reward.points === 0 && reward.xp === 0) return fail("nothing");
            const paid = await grant(tx, userId, null, reward, `vyzvy:tyden:${last.key}`, now);
            const next: ChallengeState = { ...state, lastWeek: { ...last, claimed: true } };
            await saveChallenge(tx, userId, row, next);
            return { state: next, extra: { claimed: { ...paid, rank } } };
          }

          case "claimParty": {
            const groupId = typeof body.group === "string" ? body.group : "";
            const party = await partyInfo(tx as unknown as Db, userId, state, now);
            const g = party.groups.find((x) => x.id === groupId);
            if (!g) return fail("not-in-party");
            if (g.claimed) return fail("claimed");
            if (g.score < g.target) return fail("not-done");
            const paid = await grant(tx, userId, null, { coins: 0, xp: 10, points: PARTY_ORDER_POINTS }, `vyzvy:parta:${groupId}`, now);
            const next: ChallengeState = { ...state, week: { ...state.week, party: [...state.week.party, groupId].slice(-10) } };
            await saveChallenge(tx, userId, row, next);
            return { state: next, extra: { claimed: paid } };
          }

          case "gift": {
            const to = typeof body.to === "string" ? body.to : "";
            const amount = GIFT_AMOUNTS[Math.floor(Number(body.tier))];
            if (!game || !amount || !to || to === userId) return fail("bad-request");
            if (state.sent.count >= GIFTS_PER_DAY) return fail("limit");
            const shared = await tx.groupMember.findFirst({
              where: { userId: to, group: { members: { some: { userId } } } },
              select: { user: { select: { name: true } } },
            });
            if (!shared) return fail("not-in-party");
            const me = await tx.user.findUnique({ where: { id: userId }, select: { name: true } });
            const target = await loadChallenge(tx, to, now);
            if (target.state.inbox.length >= MAX_INBOX) return fail("inbox-full");
            await changeCoins(tx, userId, game, -amount, false);
            const gift = { id: `${now.toString(36)}${Math.random().toString(36).slice(2, 7)}`, from: userId, fromName: me?.name ?? "?", game, amount, at: now };
            await saveChallenge(tx, to, target.row, { ...target.state, inbox: [...target.state.inbox, gift] });
            const next: ChallengeState = {
              ...state,
              sent: { ...state.sent, count: state.sent.count + 1 },
              gifted: state.gifted + 1,
              week: { ...state.week, score: state.week.score + 2 },
            };
            await saveChallenge(tx, userId, row, next);
            return { state: next, extra: {} };
          }

          case "claimGift": {
            const id = typeof body.id === "string" ? body.id : "";
            const gift = state.inbox.find((x) => x.id === id);
            if (!gift) return fail("nothing");
            await changeCoins(tx, userId, gift.game, gift.amount, false);
            const next: ChallengeState = { ...state, inbox: state.inbox.filter((x) => x.id !== id) };
            await saveChallenge(tx, userId, row, next);
            return { state: next, extra: { received: { game: gift.game, amount: gift.amount } } };
          }

          default:
            return fail("bad-request");
        }
      },
      { maxWait: 10_000, timeout: 20_000 },
    );

    return NextResponse.json({ ...(await snapshot(prisma, userId, now)), ...result.extra });
  } catch (error) {
    if (error instanceof Fail) return NextResponse.json({ error: error.code }, { status: 400 });
    if (error instanceof Conflict || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      return NextResponse.json({ error: "conflict" }, { status: 409 });
    }
    console.error("vyzvy POST failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
