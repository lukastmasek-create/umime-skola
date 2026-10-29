import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/shop";
import { NPC_KEYS } from "@/lib/town-npc";
import { CHAPTERS, chapterDone, progressOf, type StoryFacts } from "@/lib/town-story";

// Příběh městečka: server zná postup (claimed = počet dokončených kapitol) a cíle ověřuje podle přátelství a minihry.
const GAME = "mestecko-story";

async function facts(userId: string): Promise<StoryFacts> {
  const rows = await prisma.idleState.findMany({ where: { userId, game: { in: ["mestecko-npc", "mestecko-mini"] } }, select: { game: true, data: true } });
  const out: StoryFacts = { fp: {}, miniBest: {} };
  for (const r of rows) {
    const d = (r.data && typeof r.data === "object" ? r.data : {}) as Record<string, Record<string, { fp?: number; best?: number }>>;
    if (r.game === "mestecko-npc" && d.npc) for (const k of NPC_KEYS) if (typeof d.npc[k]?.fp === "number") out.fp[k] = d.npc[k].fp;
    if (r.game === "mestecko-mini" && d.mini) for (const [k, v] of Object.entries(d.mini)) if (typeof v?.best === "number") out.miniBest[k] = v.best;
  }
  return out;
}

async function claimedOf(userId: string) {
  const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } });
  const n = Math.floor(Number((row?.data as { claimed?: unknown } | null)?.claimed));
  return { row, claimed: Number.isFinite(n) ? Math.max(0, Math.min(CHAPTERS.length, n)) : 0 };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false, claimed: 0, progress: progressOf(0, { fp: {}, miniBest: {} }), total: CHAPTERS.length });
  try {
    const [{ claimed }, f] = await Promise.all([claimedOf(userId), facts(userId)]);
    return NextResponse.json({ loggedIn: true, claimed, total: CHAPTERS.length, progress: progressOf(claimed, f), ready: claimed < CHAPTERS.length && chapterDone(claimed, f) });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

// POST: dokončí aktuální kapitolu, pokud je cíl splněn, a vyplatí odměnu.
export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login" }, { status: 401 });
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`select pg_advisory_xact_lock(hashtext(${userId}))`;
      const row = await tx.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } });
      const n = Math.floor(Number((row?.data as { claimed?: unknown } | null)?.claimed));
      const claimed = Number.isFinite(n) ? Math.max(0, Math.min(CHAPTERS.length, n)) : 0;
      if (claimed >= CHAPTERS.length) return { error: "finished" };
      const f = await facts(userId);
      if (!chapterDone(claimed, f)) return { error: "not-ready" };
      const data = { claimed: claimed + 1 } as unknown as Prisma.InputJsonValue;
      if (row) {
        const updated = await tx.idleState.updateMany({ where: { id: row.id, updatedAt: row.updatedAt }, data: { data } });
        if (updated.count === 0) return { error: "conflict" };
      } else await tx.idleState.create({ data: { userId, game: GAME, data } });
      const reward = CHAPTERS[claimed].reward;
      await tx.pointTransaction.create({ data: { userId, amount: reward, reason: `Městečko: příběh kapitola ${claimed + 1} ${dayKey()}` } });
      const user = await tx.user.update({ where: { id: userId }, data: { points: { increment: reward } }, select: { points: true } });
      return { ok: true, reward, claimed: claimed + 1, total: CHAPTERS.length, progress: progressOf(claimed + 1, f), ready: claimed + 1 < CHAPTERS.length && chapterDone(claimed + 1, f), balance: user.points };
    });
    if ("error" in result) return NextResponse.json(result, { status: result.error === "conflict" ? 409 : 400 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
