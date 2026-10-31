import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PARENTAL_GAME, normalizeParental, readParental, type Parental } from "@/lib/parental";

// Rodičovská kontrola. GET: nastavení bez PINu. POST { action: "set" | "verify" | "disable", pin, newPin?, minutes, blockShop, blockTogether }.
const PIN = /^\d{4,8}$/;
const view = (p: Parental) => ({ enabled: !!p.pin, minutes: p.minutes, blockShop: p.blockShop, blockTogether: p.blockTogether });

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
    const pinOk = cur.pin ? await bcrypt.compare(pin, cur.pin) : true;
    if (body.action === "verify") return pinOk && cur.pin ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "wrong-pin" }, { status: 400 });
    if (!pinOk) return NextResponse.json({ error: "wrong-pin" }, { status: 400 });
    let next: Parental;
    if (body.action === "disable") next = { pin: null, minutes: 0, blockShop: false, blockTogether: false };
    else if (body.action === "set") {
      const newPin = typeof body.newPin === "string" && body.newPin ? body.newPin : null;
      if (!cur.pin && !newPin) return NextResponse.json({ error: "need-pin" }, { status: 400 });
      if (newPin && !PIN.test(newPin)) return NextResponse.json({ error: "bad-pin" }, { status: 400 });
      next = normalizeParental({ ...body, pin: newPin ? await bcrypt.hash(newPin, 10) : cur.pin });
    } else return NextResponse.json({ error: "invalid" }, { status: 400 });
    const data = next as unknown as Prisma.InputJsonValue;
    await prisma.idleState.upsert({ where: { userId_game: { userId, game: PARENTAL_GAME } }, create: { userId, game: PARENTAL_GAME, data }, update: { data } });
    return NextResponse.json({ ok: true, ...view(next) });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
