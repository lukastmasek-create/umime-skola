import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FEED_KEEP } from "@/lib/idle/economy-feed";

// Veřejná oznámení Ekonomiky (poslední založené firmy a předehnání) a oznámení „tě předehnal“ pro přihlášeného.
// Jméno je jen jméno postavy, stejně jako v žebříčku.ID hráčů se ven neposílají.
const PUBLIC_FIELDS = { id: true, kind: true, actorName: true, companyId: true, targetName: true, createdAt: true } as const;

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const [events, mine] = await Promise.all([
      prisma.economyEvent.findMany({ orderBy: { createdAt: "desc" }, take: FEED_KEEP, select: PUBLIC_FIELDS }),
      userId
        ? prisma.economyEvent.findMany({
            where: { targetUserId: userId, targetSeen: false, kind: "overtook" },
            orderBy: { createdAt: "desc" },
            take: FEED_KEEP,
            select: PUBLIC_FIELDS,
          })
        : Promise.resolve([]),
    ]);
    return NextResponse.json({ events, mine, loggedIn: userId !== null });
  } catch (error) {
    console.error("ekonomika oznameni failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

// Přihlášený hráč potvrdí, že své předehnání viděl. Oznámení se pak přestane nabízet.
export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  try {
    await prisma.economyEvent.updateMany({ where: { targetUserId: userId, targetSeen: false }, data: { targetSeen: true } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ekonomika oznameni seen failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
