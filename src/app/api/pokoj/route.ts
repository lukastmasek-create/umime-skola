import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FURNITURE, ROOM_SLOTS, normalizeRoom } from "@/lib/room";
import { normalizeCards } from "@/lib/collection";

const GAME = "room";

async function snapshot(userId: string) {
  const [user, roomRow, cardsRow] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
    prisma.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } }),
    prisma.idleState.findUnique({ where: { userId_game: { userId, game: "cards" } } }),
  ]);
  return {
    loggedIn: true as const,
    points: user?.points ?? 0,
    room: normalizeRoom(roomRow?.data),
    cards: normalizeCards(cardsRow?.data).owned,
  };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false });
  try {
    return NextResponse.json(await snapshot(userId));
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { action?: unknown; id?: unknown; slot?: unknown };
  const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

  try {
    const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } });
    const room = normalizeRoom(row?.data);
    const save = (state: unknown) => {
      const json = state as Prisma.InputJsonValue;
      return prisma.idleState.upsert({
        where: { userId_game: { userId, game: GAME } },
        create: { userId, game: GAME, data: json },
        update: { data: json },
      });
    };

    if (body.action === "buy") {
      const item = FURNITURE.find((f) => f.id === body.id);
      if (!item) return fail("unknown-item");
      if (room.owned.includes(item.id)) return fail("owned", 409);
      const paid = await prisma.user.updateMany({
        where: { id: userId, points: { gte: item.price } },
        data: { points: { decrement: item.price } },
      });
      if (paid.count === 0) return fail("not-enough-points", 409);
      const free = room.placed.indexOf(null);
      const placed = [...room.placed];
      if (free >= 0) placed[free] = item.id;
      await save({ owned: [...room.owned, item.id], placed });
    } else if (body.action === "place") {
      const slot = Math.floor(Number(body.slot));
      if (!Number.isFinite(slot) || slot < 0 || slot >= ROOM_SLOTS) return fail("invalid-slot");
      const id = body.id === null ? null : typeof body.id === "string" ? body.id : undefined;
      if (id === undefined || (id !== null && !room.owned.includes(id))) return fail("not-owned");
      // Kus nábytku stojí jen na jednom místě, přesunutím se uvolní předchozí.
      const placed = room.placed.map((v) => (v === id ? null : v));
      placed[slot] = id;
      await save({ owned: room.owned, placed });
    } else {
      return fail("unknown-action");
    }
    return NextResponse.json(await snapshot(userId));
  } catch {
    return fail("unavailable", 503);
  }
}
