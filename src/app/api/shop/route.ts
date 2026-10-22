import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STYLE_GAME, normalizeStyle } from "@/lib/cosmetics";
import { SHOP_ITEMS, getShopItem, unlockKey } from "@/lib/shop";

class AlreadyOwned extends Error {}
class NotEnoughPoints extends Error {}

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

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { action?: unknown; id?: unknown };
  const item = body.action === "buy" && typeof body.id === "string" ? getShopItem(body.id) : undefined;
  if (!item) return NextResponse.json({ error: "unknown-item" }, { status: 400 });
  const key = unlockKey(item);

  try {
    await prisma.$transaction(
      async (tx) => {
        const existing = await tx.unlock.findUnique({ where: { userId_key: { userId, key } } });
        if (existing) throw new AlreadyOwned();
        // Body se strhnou jen když je hráč má, takže se nikdy nepůjde do mínusu.
        const paid = await tx.user.updateMany({
          where: { id: userId, points: { gte: item.price } },
          data: { points: { decrement: item.price } },
        });
        if (paid.count === 0) throw new NotEnoughPoints();
        await tx.unlock.create({ data: { userId, key } });
      },
      { maxWait: 10_000, timeout: 20_000 },
    );
    return NextResponse.json(await snapshot(userId));
  } catch (error) {
    if (error instanceof AlreadyOwned) return NextResponse.json({ error: "owned" }, { status: 400 });
    if (error instanceof NotEnoughPoints) return NextResponse.json({ error: "not-enough-points" }, { status: 400 });
    // Dvojklik nebo dvě záložky: druhý nákup narazí na unikátní klíč.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "owned" }, { status: 400 });
    }
    console.error("shop POST failed", error);
    return NextResponse.json({ error: "unavailable", detail: errorCode(error) }, { status: 503 });
  }
}
