import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withinRateLimit } from "@/lib/rate-limit";

// Hodnocení obchodu: GET vrátí průměr, počet, poslední texty a hodnocení přihlášeného; POST ho uloží (jedno na účet).
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  try {
    const [agg, latest, mine] = await Promise.all([
      prisma.shopReview.aggregate({ _avg: { stars: true }, _count: { _all: true } }),
      prisma.shopReview.findMany({
        where: { text: { not: null } },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { stars: true, text: true, updatedAt: true, user: { select: { name: true } } },
      }),
      userId ? prisma.shopReview.findUnique({ where: { userId }, select: { stars: true, text: true } }) : null,
    ]);
    return NextResponse.json({
      average: agg._avg.stars ?? 0,
      count: agg._count._all,
      mine,
      latest: latest.map((r) => ({ stars: r.stars, text: r.text, at: r.updatedAt, name: r.user.name?.split(" ")[0] ?? "Hráč" })),
    });
  } catch (error) {
    console.error("shop reviews GET failed", error);
    return NextResponse.json({ average: 0, count: 0, mine: null, latest: [] });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });
  if (!(await withinRateLimit(`shop-review:${userId}`, 10, 3600))) return NextResponse.json({ error: "rate" }, { status: 429 });

  const body = (await request.json().catch(() => ({}))) as { stars?: unknown; text?: unknown };
  const stars = typeof body.stars === "number" ? Math.round(body.stars) : 0;
  if (stars < 1 || stars > 5) return NextResponse.json({ error: "bad-stars" }, { status: 400 });
  const text = typeof body.text === "string" ? body.text.trim().slice(0, 280) : "";

  try {
    await prisma.shopReview.upsert({
      where: { userId },
      create: { userId, stars, text: text || null },
      update: { stars, text: text || null },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("shop reviews POST failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
