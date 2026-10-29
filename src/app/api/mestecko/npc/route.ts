import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/shop";
import { DAILY_ACTIVITY_XP_CAP } from "@/lib/progression";
import { ASKS_PER_DAY, GIFTS, NPC_DEF, NPC_KEYS, REWARD, heartsFor, isGiftId, isNpcKey, type NpcKey, type NpcSnapshot, type NpcState } from "@/lib/town-npc";

const GAME = "mestecko-npc";
type Store = Partial<Record<NpcKey, NpcState>>;
type Tx = Prisma.TransactionClient;

function parse(data: unknown): Store {
  const raw = (data && typeof data === "object" ? (data as { npc?: unknown }).npc : null) as Record<string, NpcState> | null;
  const out: Store = {};
  if (raw && typeof raw === "object") for (const k of NPC_KEYS) if (raw[k] && typeof raw[k].fp === "number") out[k] = raw[k];
  return out;
}

function snapshot(store: Store, day: string): NpcSnapshot {
  const out = {} as NpcSnapshot;
  for (const k of NPC_KEYS) {
    const s = store[k];
    out[k] = { fp: s?.fp ?? 0, hearts: heartsFor(s?.fp ?? 0), talked: s?.talked === day, gifted: s?.gifted === day, asksLeft: s?.day === day ? Math.max(0, ASKS_PER_DAY - (s.asks ?? 0)) : ASKS_PER_DAY };
  }
  return out;
}

async function awardXp(tx: Tx, userId: string, amount: number): Promise<number> {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const used = await tx.xpEvent.aggregate({ where: { userId, source: { in: ["game", "test"] }, createdAt: { gte: start } }, _sum: { amount: true } });
  const gained = Math.min(amount, Math.max(0, DAILY_ACTIVITY_XP_CAP - (used._sum.amount ?? 0)));
  if (gained > 0) await tx.xpEvent.create({ data: { userId, amount: gained, source: "game" } });
  return gained;
}

async function load(db: Pick<typeof prisma, "idleState">, userId: string) {
  const row = await db.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } });
  return { row, store: parse(row?.data) };
}

export async function GET() {
  const session = await auth();
  const day = dayKey();
  if (!session?.user?.id) return NextResponse.json({ loggedIn: false, day, npc: snapshot({}, day) });
  try {
    const [{ store }, user] = await Promise.all([load(prisma, session.user.id), prisma.user.findUnique({ where: { id: session.user.id }, select: { points: true } })]);
    return NextResponse.json({ loggedIn: true, day, npc: snapshot(store, day), points: user?.points ?? 0 });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

function shuffled<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

// POST { action: "talk" | "ask" | "answer" | "gift", npc, choice?, gift? }
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const npc = body.npc;
  const action = body.action;
  if (!isNpcKey(npc) || !["talk", "ask", "answer", "gift"].includes(action)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const day = dayKey();
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`select pg_advisory_xact_lock(hashtext(${userId}))`;
      const { row, store } = await load(tx, userId);
      const cur: NpcState = store[npc] ?? { fp: 0 };
      const hearts0 = heartsFor(cur.fp);
      let points = 0;
      let xp = 0;
      let extra: Record<string, unknown> = {};
      let reason = "";
      const fail = (error: string) => ({ error });

      if (action === "talk") {
        if (cur.talked === day) return fail("done");
        cur.talked = day;
        cur.fp += REWARD.talk.fp;
        points += REWARD.talk.points;
        reason = `Městečko: ${npc} popovídání ${day}`;
      } else if (action === "ask") {
        const def = NPC_DEF[npc];
        if (!def.asks) return fail("no-questions");
        if (cur.day !== day) {
          cur.day = day;
          cur.asks = 0;
        }
        if ((cur.asks ?? 0) >= ASKS_PER_DAY) return fail("limit");
        const where: Prisma.QuestionWhereInput = { difficulty: { lte: 2 }, course: { published: true, ...(def.subjects.length ? { subject: { in: def.subjects as never[] } } : {}) } };
        const count = await tx.question.count({ where });
        if (count === 0) return fail("empty");
        const q = await tx.question.findFirst({ where, skip: Math.floor(Math.random() * count), select: { id: true, prompt: true, options: true, correctIndex: true } });
        if (!q || q.options.length < 2) return fail("empty");
        const order = shuffled(q.options.map((_, i) => i));
        const options = order.map((i) => q.options[i]);
        cur.pending = { id: q.id, prompt: q.prompt, options, correct: order.indexOf(q.correctIndex) };
        cur.asks = (cur.asks ?? 0) + 1;
        extra = { question: { prompt: q.prompt, options } };
      } else if (action === "answer") {
        const p = cur.pending;
        if (!p) return fail("no-question");
        const choice = Number(body.choice);
        const ok = choice === p.correct;
        const exp = await tx.question.findUnique({ where: { id: p.id }, select: { explanation: true } });
        cur.pending = null;
        if (ok) {
          cur.fp += REWARD.answer.fp;
          points += REWARD.answer.points;
          xp = await awardXp(tx, userId, REWARD.answer.xp);
          reason = `Městečko: ${npc} otázka ${day}`;
        }
        extra = { correct: ok, correctIndex: p.correct, explanation: exp?.explanation ?? "" };
      } else {
        const gift: unknown = body.gift;
        if (!isGiftId(gift)) return fail("invalid");
        if (cur.gifted === day) return fail("done");
        const g = GIFTS[gift];
        const user = await tx.user.findUnique({ where: { id: userId }, select: { points: true } });
        if ((user?.points ?? 0) < g.cost) return fail("not-enough");
        const liked = NPC_DEF[npc].likes === gift;
        cur.gifted = day;
        cur.fp += liked ? REWARD.giftLiked.fp : REWARD.giftOther.fp;
        points -= g.cost;
        reason = `Městečko: ${npc} dárek ${gift} ${day}`;
        extra = { liked };
      }

      const hearts1 = heartsFor(cur.fp);
      let bonus = 0;
      if (hearts1 > hearts0) bonus = REWARD.levelUp(hearts1);
      store[npc] = cur;
      const data = { npc: store } as unknown as Prisma.InputJsonValue;
      if (row) {
        const updated = await tx.idleState.updateMany({ where: { id: row.id, updatedAt: row.updatedAt }, data: { data } });
        if (updated.count === 0) return fail("conflict");
      } else {
        await tx.idleState.create({ data: { userId, game: GAME, data } });
      }
      const delta = points + bonus;
      if (delta !== 0 && reason) {
        await tx.pointTransaction.create({ data: { userId, amount: delta, reason } });
        await tx.user.update({ where: { id: userId }, data: { points: { increment: delta } } });
      } else if (bonus) {
        await tx.pointTransaction.create({ data: { userId, amount: bonus, reason: `Městečko: ${npc} srdíčka ${day}` } });
        await tx.user.update({ where: { id: userId }, data: { points: { increment: bonus } } });
      }
      const user = await tx.user.findUnique({ where: { id: userId }, select: { points: true } });
      return { ok: true, gained: delta, xp, hearts: hearts1, levelUp: hearts1 > hearts0, fp: cur.fp, npc: snapshot(store, day), points: user?.points ?? 0, ...extra };
    });
    if ("error" in result) return NextResponse.json(result, { status: result.error === "conflict" ? 409 : 400 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
