import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getXp } from "@/lib/xp";
import { levelProgress } from "@/lib/progression";
import { AVATARS, DEFAULT_AVATAR, isAvatarUnlocked } from "@/lib/avatars";
import { TITLES, isTitleUnlocked } from "@/lib/titles";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        avatar: true,
        title: true,
        points: true,
        school: { select: { name: true, city: true } },
        unlocks: { select: { key: true } },
      },
    });
    const xp = await getXp(userId);
    return NextResponse.json({
      loggedIn: true,
      name: user?.name ?? session.user.name ?? null,
      avatar: user?.avatar ?? DEFAULT_AVATAR,
      title: user?.title ?? null,
      points: user?.points ?? 0,
      school: user?.school ?? null,
      unlocks: user?.unlocks.map((u) => u.key) ?? [],
      ...levelProgress(xp),
    });
  } catch {
    // Databáze je chvíli nedostupná: přihlášení platí, jen nemáme data profilu.
    return NextResponse.json({
      loggedIn: true,
      degraded: true,
      name: session.user.name ?? null,
      avatar: DEFAULT_AVATAR,
      title: null,
      points: 0,
      school: null,
      unlocks: [],
      ...levelProgress(0),
    });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Nejsi přihlášený/á." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  try {
    const level = levelProgress(await getXp(userId)).level;
    const unlocks = (
      await prisma.unlock.findMany({ where: { userId }, select: { key: true } })
    ).map((u) => u.key);

    if (typeof body?.avatar === "string") {
      const avatar = AVATARS.find((a) => a.id === body.avatar);
      if (!avatar) return NextResponse.json({ error: "Neznámý avatar." }, { status: 400 });
      if (!isAvatarUnlocked(avatar, level, unlocks)) {
        return NextResponse.json({ error: "Tenhle avatar ještě není odemčený." }, { status: 403 });
      }
      await prisma.user.update({ where: { id: userId }, data: { avatar: avatar.id } });
      return NextResponse.json({ avatar: avatar.id });
    }

    if (typeof body?.title === "string") {
      const title = TITLES.find((t) => t.id === body.title);
      if (!title) return NextResponse.json({ error: "Neznámý titul." }, { status: 400 });
      if (!isTitleUnlocked(title, level, unlocks)) {
        return NextResponse.json({ error: "Tenhle titul ještě není odemčený." }, { status: 403 });
      }
      await prisma.user.update({ where: { id: userId }, data: { title: title.id } });
      return NextResponse.json({ title: title.id });
    }

    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Databáze není dostupná." }, { status: 503 });
  }
}
