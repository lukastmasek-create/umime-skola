import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Změna hesla: s původním heslem; účet bez hesla (přihlášení přes Google apod.) si heslo nastaví poprvé.
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { current?: unknown; next?: unknown };
  const next = typeof body.next === "string" ? body.next : "";
  if (next.length < 8 || next.length > 200) return NextResponse.json({ error: "weak" }, { status: 400 });
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
    if (user?.password) {
      const current = typeof body.current === "string" ? body.current : "";
      if (!(await bcrypt.compare(current, user.password))) return NextResponse.json({ error: "wrong" }, { status: 400 });
    }
    await prisma.user.update({ where: { id: userId }, data: { password: await bcrypt.hash(next, 10) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
