import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getXp } from "@/lib/xp";
import { levelProgress } from "@/lib/progression";
import { AVATARS, DEFAULT_AVATAR, isAvatarUnlocked } from "@/lib/avatars";
import { TITLES, isTitleUnlocked } from "@/lib/titles";
import { STYLE_GAME, isBannerId, isFrameId, normalizeStyle } from "@/lib/cosmetics";
import { normalizeCustom } from "@/lib/avatar-custom";
import { normalizeState as normalizePets, levelInfo } from "@/lib/idle/pets";
import { computeCity, normalizeCity } from "@/lib/idle/city";
import type { Prisma } from "@prisma/client";

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
    const styleRow = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: STYLE_GAME } } });
    const style = normalizeStyle(styleRow?.data);
    // Doplňky profilu: pozice v žebříčku, mazlíčci a město. Když něco selže, prostě chybí.
    const now = Date.now();
    const [ahead, total, petRow, cityRow] = await Promise.all([
      prisma.user.count({ where: { points: { gt: user?.points ?? 0 } } }).catch(() => null),
      prisma.user.count().catch(() => null),
      prisma.idleState.findUnique({ where: { userId_game: { userId, game: "mazlicci" } } }).catch(() => null),
      prisma.idleState.findUnique({ where: { userId_game: { userId, game: "mesto" } } }).catch(() => null),
    ]);
    let pets: { owned: number; active: string | null; name: string; level: number } | null = null;
    try {
      const ps = normalizePets(petRow?.data, now);
      const act = ps.active ? ps.pets[ps.active] : undefined;
      pets = {
        owned: Object.keys(ps.pets).length,
        active: ps.active,
        name: act?.name ?? "",
        level: act ? levelInfo(act.growth).level : 0,
      };
    } catch {}
    let city: { buildings: number; population: number } | null = null;
    try {
      const stats = computeCity(normalizeCity(cityRow?.data, now), 0);
      city = { buildings: stats.buildings, population: Math.floor(stats.population) };
    } catch {}
    return NextResponse.json({
      loggedIn: true,
      rank: ahead === null ? null : ahead + 1,
      players: total,
      pets,
      city,
      frame: style.frame,
      banner: style.banner,
      custom: style.custom,
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
      frame: null,
      banner: null,
      custom: {},
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

    if (typeof body?.custom === "object" && body.custom && typeof body?.customFor === "string") {
      if (!AVATARS.some((a) => a.id === body.customFor)) {
        return NextResponse.json({ error: "Neznámý avatar." }, { status: 400 });
      }
      const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: STYLE_GAME } } });
      const prev = normalizeStyle(row?.data);
      const custom = normalizeCustom(body.custom);
      const next = { ...prev, custom: { ...prev.custom, [body.customFor]: custom } };
      const data = next as unknown as Prisma.InputJsonValue;
      await prisma.idleState.upsert({
        where: { userId_game: { userId, game: STYLE_GAME } },
        create: { userId, game: STYLE_GAME, data },
        update: { data },
      });
      return NextResponse.json({ custom });
    }

    if ("frame" in body || "banner" in body) {
      const key = "frame" in body ? "frame" : "banner";
      const value = body[key];
      if (value !== null) {
        const known = key === "frame" ? isFrameId(value) : isBannerId(value);
        if (!known) return NextResponse.json({ error: "Neznámá ozdoba." }, { status: 400 });
        if (!unlocks.includes(`${key}:${value}`)) {
          return NextResponse.json({ error: "Tuhle ozdobu ještě nemáš." }, { status: 403 });
        }
      }
      const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: STYLE_GAME } } });
      const next = { ...normalizeStyle(row?.data), [key]: value };
      const data = next as unknown as Prisma.InputJsonValue;
      await prisma.idleState.upsert({
        where: { userId_game: { userId, game: STYLE_GAME } },
        create: { userId, game: STYLE_GAME, data },
        update: { data },
      });
      return NextResponse.json({ [key]: value });
    }

    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Databáze není dostupná." }, { status: 503 });
  }
}
