import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STYLE_GAME, normalizeStyle } from "@/lib/cosmetics";
import { SHOP_ITEMS, bundlePrice, dayKey, getBundle, getShopItem, nextDealReset, salePrice, unlockKey } from "@/lib/shop";

class AlreadyOwned extends Error {}
class NotEnoughPoints extends Error {}
class RecipientUnavailable extends Error {}
class SelfGift extends Error {}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errorCode(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) return error.code;
  if (error instanceof Error) return error.name;
  return "unknown";
}

// Které věci z katalogu hráč vlastní (podle odemčení v tabulce Unlock).
function ownedItems(keys: string[]): string[] {
  const set = new Set(keys);
  return SHOP_ITEMS.filter((item) => set.has(unlockKey(item))).map((item) => item.id);
}

async function snapshot(userId: string) {
  const [user, unlocks, styleRow] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { points: true, avatar: true, title: true } }),
    prisma.unlock.findMany({ where: { userId }, select: { key: true } }),
    prisma.idleState.findUnique({ where: { userId_game: { userId, game: STYLE_GAME } } }),
  ]);
  const style = normalizeStyle(styleRow?.data);
  return {
    loggedIn: true as const,
    points: user?.points ?? 0,
    owned: ownedItems(unlocks.map((u) => u.key)),
    day: dayKey(),
    resetAt: nextDealReset().toISOString(),
    equipped: { avatar: user?.avatar ?? null, title: user?.title ?? null, frame: style.frame, banner: style.banner },
  };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false });

  try {
    return NextResponse.json(await snapshot(userId));
  } catch (error) {
    console.error("shop GET failed", error);
    return NextResponse.json({ error: "unavailable", detail: errorCode(error) }, { status: 503 });
  }
}

// Strhne body jen tehdy, když je hráč má, takže se nikdy nepůjde do mínusu.
async function pay(tx: Prisma.TransactionClient, userId: string, price: number) {
  const paid = await tx.user.updateMany({ where: { id: userId, points: { gte: price } }, data: { points: { decrement: price } } });
  if (paid.count === 0) throw new NotEnoughPoints();
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { action?: unknown; id?: unknown; email?: unknown };
  const id = typeof body.id === "string" ? body.id : "";
  const day = dayKey();
  const tx = { maxWait: 10_000, timeout: 20_000 };

  try {
    if (body.action === "buy") {
      const item = getShopItem(id);
      if (!item) return NextResponse.json({ error: "unknown-item" }, { status: 400 });
      const key = unlockKey(item);
      await prisma.$transaction(async (t) => {
        if (await t.unlock.findUnique({ where: { userId_key: { userId, key } } })) throw new AlreadyOwned();
        await pay(t, userId, salePrice(item, day));
        await t.unlock.create({ data: { userId, key } });
      }, tx);
    } else if (body.action === "buyBundle") {
      const bundle = getBundle(id);
      if (!bundle) return NextResponse.json({ error: "unknown-item" }, { status: 400 });
      await prisma.$transaction(async (t) => {
        const unlocks = await t.unlock.findMany({ where: { userId }, select: { key: true } });
        const have = new Set(ownedItems(unlocks.map((u) => u.key)));
        const { price, missing } = bundlePrice(bundle, have);
        if (missing.length === 0) throw new AlreadyOwned();
        await pay(t, userId, price);
        const keys = missing.map((m) => unlockKey(getShopItem(m)!));
        await t.unlock.createMany({ data: keys.map((key) => ({ userId, key })), skipDuplicates: true });
      }, tx);
    } else if (body.action === "gift") {
      const item = getShopItem(id);
      if (!item) return NextResponse.json({ error: "unknown-item" }, { status: 400 });
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!EMAIL.test(email) || email.length > 200) return NextResponse.json({ error: "bad-email" }, { status: 400 });
      const key = unlockKey(item);
      await prisma.$transaction(async (t) => {
        const to = await t.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } });
        if (!to) throw new RecipientUnavailable();
        if (to.id === userId) throw new SelfGift();
        if (await t.unlock.findUnique({ where: { userId_key: { userId: to.id, key } } })) throw new RecipientUnavailable();
        await pay(t, userId, salePrice(item, day));
        await t.unlock.create({ data: { userId: to.id, key } });
      }, tx);
    } else {
      return NextResponse.json({ error: "unknown-item" }, { status: 400 });
    }
    return NextResponse.json(await snapshot(userId));
  } catch (error) {
    if (error instanceof AlreadyOwned) return NextResponse.json({ error: "owned" }, { status: 400 });
    if (error instanceof NotEnoughPoints) return NextResponse.json({ error: "not-enough-points" }, { status: 400 });
    if (error instanceof RecipientUnavailable) return NextResponse.json({ error: "recipient-unavailable" }, { status: 400 });
    if (error instanceof SelfGift) return NextResponse.json({ error: "self-gift" }, { status: 400 });
    // Dvojklik nebo dvě záložky: druhý nákup narazí na unikátní klíč.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "owned" }, { status: 400 });
    }
    console.error("shop POST failed", error);
    return NextResponse.json({ error: "unavailable", detail: errorCode(error) }, { status: 503 });
  }
}
