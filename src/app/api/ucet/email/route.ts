import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET: aktuální e-mail a zda má účet heslo; POST { email, password }: změna e-mailu (s heslem, pokud ho účet má).
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, password: true } }).catch(() => null);
  return NextResponse.json({ loggedIn: true, email: user?.email ?? null, hasPassword: !!user?.password });
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { email?: unknown; password?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email) || email.length > 200) return NextResponse.json({ error: "bad-email" }, { status: 400 });
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
    if (user?.password) {
      const password = typeof body.password === "string" ? body.password : "";
      if (!(await bcrypt.compare(password, user.password))) return NextResponse.json({ error: "wrong" }, { status: 400 });
    }
    const taken = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" }, NOT: { id: userId } }, select: { id: true } });
    if (taken) return NextResponse.json({ error: "taken" }, { status: 409 });
    await prisma.user.update({ where: { id: userId }, data: { email, emailVerified: null } });
    return NextResponse.json({ ok: true, email });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
