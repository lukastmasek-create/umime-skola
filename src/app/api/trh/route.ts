import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STYLE_GAME, normalizeStyle } from "@/lib/cosmetics";
import { unlockKey } from "@/lib/shop";
import { MARKET_GAME, MAX_LISTINGS, MIN_PRICE, maxPrice, normalizeListings, sellerGets, tradable, type Listing, type MarketOffer } from "@/lib/player-market";

// Trh mezi hráči: GET = všechny nabídky, POST { action: "list" | "cancel" | "buy" }.
type Tx = Prisma.TransactionClient;

async function offers(userId: string | null): Promise<MarketOffer[]> {
  const rows = await prisma.idleState.findMany({ where: { game: MARKET_GAME }, select: { userId: true, data: true, user: { select: { name: true } } } });
  return rows
    .flatMap((r) => normalizeListings(r.data).map((l) => ({ ...l, sellerId: r.userId, seller: r.user?.name || "?", mine: r.userId === userId })))
    .sort((a, b) => b.at.localeCompare(a.at));
}

async function readListings(tx: Tx, userId: string) {
  const row = await tx.idleState.findUnique({ where: { userId_game: { userId, game: MARKET_GAME } } });
  return normalizeListings(row?.data);
}
async function writeListings(tx: Tx, userId: string, listings: Listing[]) {
  const data = { listings } as unknown as Prisma.InputJsonValue;
  await tx.idleState.upsert({ where: { userId_game: { userId, game: MARKET_GAME } }, create: { userId, game: MARKET_GAME, data }, update: { data } });
}
const lock = (tx: Tx, id: string) => tx.$executeRaw`select pg_advisory_xact_lock(hashtext(${id}))`;

class Fail extends Error {
  constructor(public code: string) {
    super(code);
  }
}

export async function GET() {
  const session = await auth();
  try {
    return NextResponse.json({ offers: await offers(session?.user?.id ?? null) });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { action?: unknown; itemId?: unknown; price?: unknown; id?: unknown; seller?: unknown };
  try {
    await prisma.$transaction(
      async (tx) => {
        if (body.action === "list") {
          const item = typeof body.itemId === "string" ? tradable(body.itemId) : null;
          const price = Math.floor(Number(body.price));
          if (!item) throw new Fail("unknown-item");
          if (!Number.isFinite(price) || price < MIN_PRICE || price > maxPrice(item)) throw new Fail("bad-price");
          await lock(tx, userId);
          const listings = await readListings(tx, userId);
          if (listings.length >= MAX_LISTINGS) throw new Fail("too-many");
          const key = unlockKey(item);
          // nošenou věc nejde vystavit
          const [user, style] = await Promise.all([
            tx.user.findUnique({ where: { id: userId }, select: { avatar: true, title: true } }),
            tx.idleState.findUnique({ where: { userId_game: { userId, game: STYLE_GAME } } }),
          ]);
          const st = normalizeStyle(style?.data);
          const worn = { avatar: user?.avatar, title: user?.title, frame: st.frame, banner: st.banner }[item.kind as "avatar" | "title" | "frame" | "banner"];
          if (worn === item.ref) throw new Fail("equipped");
          const removed = await tx.unlock.deleteMany({ where: { userId, key } });
          if (removed.count === 0) throw new Fail("not-owned");
          listings.push({ id: randomUUID(), itemId: item.id, price, at: new Date().toISOString() });
          await writeListings(tx, userId, listings);
        } else if (body.action === "cancel") {
          await lock(tx, userId);
          const listings = await readListings(tx, userId);
          const l = listings.find((x) => x.id === body.id);
          if (!l) throw new Fail("gone");
          await writeListings(tx, userId, listings.filter((x) => x.id !== l.id));
          await tx.unlock.createMany({ data: [{ userId, key: unlockKey(tradable(l.itemId)!) }], skipDuplicates: true });
        } else if (body.action === "buy") {
          const sellerId = typeof body.seller === "string" ? body.seller : "";
          if (!sellerId || sellerId === userId) throw new Fail("self");
          // zámky vždy ve stejném pořadí, ať se dva nákupy nezablokují
          for (const id of [userId, sellerId].sort()) await lock(tx, id);
          const listings = await readListings(tx, sellerId);
          const l = listings.find((x) => x.id === body.id);
          if (!l) throw new Fail("gone");
          const item = tradable(l.itemId)!;
          const key = unlockKey(item);
          if (await tx.unlock.findUnique({ where: { userId_key: { userId, key } } })) throw new Fail("owned");
          const paid = await tx.user.updateMany({ where: { id: userId, points: { gte: l.price } }, data: { points: { decrement: l.price } } });
          if (paid.count === 0) throw new Fail("not-enough-points");
          const gets = sellerGets(l.price);
          await tx.user.update({ where: { id: sellerId }, data: { points: { increment: gets } } });
          await tx.pointTransaction.createMany({
            data: [
              { userId, amount: -l.price, reason: `shop:market-buy:${item.id}` },
              { userId: sellerId, amount: gets, reason: `shop:market-sell:${item.id}` },
            ],
          });
          await tx.unlock.create({ data: { userId, key } });
          await writeListings(tx, sellerId, listings.filter((x) => x.id !== l.id));
        } else throw new Fail("invalid");
      },
      { maxWait: 10_000, timeout: 20_000 },
    );
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { points: true } });
    return NextResponse.json({ ok: true, points: user?.points ?? 0, offers: await offers(userId) });
  } catch (e) {
    if (e instanceof Fail) return NextResponse.json({ error: e.code }, { status: 400 });
    console.error("market POST failed", e);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
