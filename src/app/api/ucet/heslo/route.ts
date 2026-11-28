import { sameOriginMutation } from "@/lib/request-origin";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { validNewPassword } from "@/lib/credentials";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withinRateLimit } from "@/lib/rate-limit";

// Změna hesla: s původním heslem; účet bez hesla (přihlášení přes Google apod.) si heslo nastaví poprvé.
export async function POST(request: Request) {
  if (!sameOriginMutation(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login" }, { status: 401 });
  if (!(await withinRateLimit(`heslo:${userId}`, 10, 900))) return NextResponse.json({ error: "rate" }, { status: 429 });
  const body = (await request.json().catch(() => ({}))) as { current?: unknown; next?: unknown };
  const next = typeof body.next === "string" ? body.next : "";
  if (!validNewPassword(next)) return NextResponse.json({ error: "weak" }, { status: 400 });
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
    if (user?.password) {
      const current = typeof body.current === "string" ? body.current : "";
      if (!(await bcrypt.compare(current, user.password))) return NextResponse.json({ error: "wrong" }, { status: 400 });
    }
    if (!user) return NextResponse.json({ error: "login" }, { status: 401 });
    const changed = await prisma.user.updateMany({
      where: { id: userId, password: user.password },
      data: { password: await bcrypt.hash(next, 10) },
    });
    if (changed.count === 0) return NextResponse.json({ error: "wrong" }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
