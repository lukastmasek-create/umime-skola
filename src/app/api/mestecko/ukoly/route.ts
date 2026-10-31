import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/shop";
import { dailyQuests, questReason, type QuestSnapshot } from "@/lib/town-progress";
import { questProgress, readPlots } from "@/lib/town-progress-server";
import type { PlotBuilding } from "@/lib/town-progress";

// Úkoly od obyvatel městečka: tři na den, plní se běžnou aktivitou na webu, odměnu si hráč vyzvedne.
const built = async (userId: string) => Object.values((await readPlots(userId)).plots).filter(Boolean) as PlotBuilding[];

async function snapshot(userId: string, day: string): Promise<QuestSnapshot> {
  const quests = dailyQuests(day, userId, await built(userId));
  const prog = await questProgress(userId, day, quests);
  return quests.map((q) => ({
    id: q.id,
    kind: q.kind,
    giver: q.giver,
    target: q.target,
    progress: Math.min(q.target, prog[q.id] ?? 0),
    reward: q.reward,
    claimed: !!prog[`claimed:${questReason(day, q.id)}`],
    href: q.href,
  }));
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ loggedIn: false, quests: [] });
  try {
    return NextResponse.json({ loggedIn: true, quests: await snapshot(session.user.id, dayKey()) });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

// POST { claim: id }: vyplatí odměnu za splněný úkol (jednou za den).
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const day = dayKey();
  try {
    const quest = dailyQuests(day, userId, await built(userId)).find((q) => q.id === body.claim);
    if (!quest) return NextResponse.json({ error: "unknown" }, { status: 400 });
    const prog = await questProgress(userId, day, [quest]);
    if ((prog[quest.id] ?? 0) < quest.target) return NextResponse.json({ error: "not-done" }, { status: 400 });
    const reason = questReason(day, quest.id);
    const ok = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`select pg_advisory_xact_lock(hashtext(${userId}))`;
      if (await tx.pointTransaction.findFirst({ where: { userId, reason }, select: { id: true } })) return false;
      await tx.pointTransaction.create({ data: { userId, amount: quest.reward, reason } });
      await tx.user.update({ where: { id: userId }, data: { points: { increment: quest.reward } } });
      return true;
    });
    if (!ok) return NextResponse.json({ error: "claimed" }, { status: 409 });
    return NextResponse.json({ gained: quest.reward, quests: await snapshot(userId, day) });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
