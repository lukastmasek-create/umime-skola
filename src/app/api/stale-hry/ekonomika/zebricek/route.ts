import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeState } from "@/lib/idle/economy";

const GAME = "ekonomika";
const TOP = 20;

// Žebříček podle nejlepšího jmění (rekord přes všechny pokusy). Zobrazuje se jen jméno postavy, ne účtu.
// Prisma neumí řadit podle polí uvnitř JSONu, proto se řadí v paměti; pro desítky tisíc hráčů by bylo třeba
// rekord přesunout do vlastního sloupce.
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  try {
    const now = Date.now();
    const rows = await prisma.idleState.findMany({ where: { game: GAME }, select: { userId: true, data: true }, take: 5000 });
    const all = rows
      .map((r) => {
        const s = normalizeState(r.data, now);
        return { userId: r.userId, best: s.best, runs: s.runs, name: s.character?.name ?? null, country: s.character?.country ?? null };
      })
      .filter((r) => r.best > 0)
      .sort((a, b) => b.best - a.best);

    const top = all.slice(0, TOP).map((r, i) => ({ rank: i + 1, name: r.name ?? "—", country: r.country, best: Math.round(r.best), runs: r.runs, me: r.userId === userId }));
    const mineIndex = all.findIndex((r) => r.userId === userId);
    const me = mineIndex >= 0 ? { rank: mineIndex + 1, best: Math.round(all[mineIndex].best) } : null;
    return NextResponse.json({ top, me, total: all.length });
  } catch (error) {
    console.error("ekonomika zebricek failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
