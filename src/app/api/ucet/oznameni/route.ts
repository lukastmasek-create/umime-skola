import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseNotifyPrefs } from "@/lib/reminders";
import { NOTIFY_GAME } from "@/lib/reminders-server";

// GET: nastavení e-mailových oznámení a zda má účet e-mail. POST { deadline: boolean }: uložení.
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false });
  try {
    const [row, user] = await Promise.all([
      prisma.idleState.findUnique({ where: { userId_game: { userId, game: NOTIFY_GAME } } }),
      prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
    ]);
    return NextResponse.json({ loggedIn: true, ...parseNotifyPrefs(row?.data), hasEmail: !!user?.email });
  } catch {
    return NextResponse.json({ loggedIn: true, error: "x" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { deadline?: unknown };
  if (typeof body.deadline !== "boolean") return NextResponse.json({ error: "bad" }, { status: 400 });
  try {
    const data = { deadline: body.deadline };
    await prisma.idleState.upsert({
      where: { userId_game: { userId, game: NOTIFY_GAME } },
      create: { userId, game: NOTIFY_GAME, data },
      update: { data },
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "x" }, { status: 500 });
  }
}
