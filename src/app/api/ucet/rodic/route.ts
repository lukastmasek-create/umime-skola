import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PARENTAL_GAME, normalizeParental, readParental, type Parental } from "@/lib/parental";

// Rodičovská kontrola. GET: nastavení bez PINu. POST { action: "set" | "verify" | "disable", pin, newPin?, minutes, blockShop, blockTogether }.
const PIN = /^\d{4,8}$/;
// Po 5 chybných PINech se ověřování na 15 minut zamkne (PIN má jen 4–8 číslic, bez limitu by šel uhodnout).
const LOCK_AFTER = 5;
const LOCK_MS = 15 * 60 * 1000;
const view = (p: Parental) => ({ enabled: !!p.pin, minutes: p.minutes, blockShop: p.blockShop, blockTogether: p.blockTogether });

async function save(userId: string, next: Parental) {
  const data = next as unknown as Prisma.InputJsonValue;
  await prisma.idleState.upsert({ where: { userId_game: { userId, game: PARENTAL_GAME } }, create: { userId, game: PARENTAL_GAME, data }, update: { data } });
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false, enabled: false, minutes: 0, blockShop: false, blockTogether: false });
  try {
    return NextResponse.json({ loggedIn: true, ...view(await readParental(userId)) });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const pin = typeof body.pin === "string" ? body.pin : "";
  try {
    const cur = await readParental(userId);
    const now = Date.now();
    if (cur.pin && cur.lockedUntil > now) {
      return NextResponse.json({ error: "locked", until: cur.lockedUntil }, { status: 429 });
    }

    const pinOk = cur.pin ? await bcrypt.compare(pin, cur.pin) : true;
    if (!pinOk) {
      const fails = cur.fails + 1;
      const locked = fails >= LOCK_AFTER;
      await save(userId, { ...cur, fails: locked ? 0 : fails, lockedUntil: locked ? now + LOCK_MS : 0 });
      return locked
        ? NextResponse.json({ error: "locked", until: now + LOCK_MS }, { status: 429 })
        : NextResponse.json({ error: "wrong-pin" }, { status: 400 });
    }

    if (body.action === "verify") {
      if (!cur.pin) return NextResponse.json({ error: "wrong-pin" }, { status: 400 });
      if (cur.fails || cur.lockedUntil) await save(userId, { ...cur, fails: 0, lockedUntil: 0 });
      return NextResponse.json({ ok: true });
    }

    // Správný PIN resetuje počítadlo chyb; klientská data o zámku se nepřebírají.
    let next: Parental;
    if (body.action === "disable") next = { pin: null, minutes: 0, blockShop: false, blockTogether: false, fails: 0, lockedUntil: 0 };
    else if (body.action === "set") {
      const newPin = typeof body.newPin === "string" && body.newPin ? body.newPin : null;
      if (!cur.pin && !newPin) return NextResponse.json({ error: "need-pin" }, { status: 400 });
      if (newPin && !PIN.test(newPin)) return NextResponse.json({ error: "bad-pin" }, { status: 400 });
      next = normalizeParental({ ...body, pin: newPin ? await bcrypt.hash(newPin, 10) : cur.pin, fails: 0, lockedUntil: 0 });
    } else return NextResponse.json({ error: "invalid" }, { status: 400 });
    await save(userId, next);
    return NextResponse.json({ ok: true, ...view(next) });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
