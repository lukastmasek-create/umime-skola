import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SET_REWARD, isTreasureSet, setComplete } from "@/lib/town-progress";
import { readTreasures, writeTreasures } from "@/lib/town-progress-server";

// Album pokladů z městečka: kousky se najdou při denním sběru, za celou sadu je odměna.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ loggedIn: false, pieces: {}, claimed: [] });
  try {
    return NextResponse.json({ loggedIn: true, ...(await readTreasures(session.user.id)) });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

// POST { claim: set }: vyplatí odměnu za kompletní sadu (jednou).
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const set: unknown = body.claim;
  if (!isTreasureSet(set)) return NextResponse.json({ error: "unknown" }, { status: 400 });
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`select pg_advisory_xact_lock(hashtext(${userId}))`;
      const store = await readTreasures(userId, tx);
      if (store.claimed.includes(set)) return { error: "claimed" as const };
      if (!setComplete(store, set)) return { error: "incomplete" as const };
      store.claimed.push(set);
      await writeTreasures(userId, store, tx);
      await tx.pointTransaction.create({ data: { userId, amount: SET_REWARD, reason: `Městečko: sada pokladů ${set}` } });
      await tx.user.update({ where: { id: userId }, data: { points: { increment: SET_REWARD } } });
      return { ok: true as const, gained: SET_REWARD, ...store };
    });
    if ("error" in result) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
