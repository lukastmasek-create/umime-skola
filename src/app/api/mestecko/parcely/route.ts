import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/shop";
import {
  PLOT_BUILDING,
  PLOT_ROAD,
  ROAD_COST,
  incomeReason,
  isPlotBuilding,
  isPlotId,
  isRoadId,
  plotIncome,
  plotReason,
  roadReason,
  type PlotState,
} from "@/lib/town-progress";
import { readPlots, writePlots } from "@/lib/town-progress-server";

// Parcely městečka: dostavění cesty, stavba vlastní budovy a denní příjem z postavených budov.
const view = (s: PlotState, day: string, points: number) => ({ roads: s.roads, plots: s.plots, income: plotIncome(s), incomeClaimed: s.incomeDay === day, points });

export async function GET() {
  const session = await auth();
  const day = dayKey();
  if (!session?.user?.id) return NextResponse.json({ loggedIn: false, roads: [], plots: {}, income: 0, incomeClaimed: false, points: 0 });
  try {
    const [state, user] = await Promise.all([readPlots(session.user.id), prisma.user.findUnique({ where: { id: session.user.id }, select: { points: true } })]);
    return NextResponse.json({ loggedIn: true, ...view(state, day, user?.points ?? 0) });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

// POST { road } | { plot, building } | { income: true }
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const day = dayKey();
  const road: unknown = body.road;
  const plot: unknown = body.plot;
  const building: unknown = body.building;
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`select pg_advisory_xact_lock(hashtext(${userId}))`;
      const state = await readPlots(userId, tx);
      const pay = async (price: number, reason: string) => {
        const paid = await tx.user.updateMany({ where: { id: userId, points: { gte: price } }, data: { points: { decrement: price } } });
        if (paid.count === 0) return false;
        await tx.pointTransaction.create({ data: { userId, amount: -price, reason } });
        return true;
      };
      let gained = 0;
      if (isRoadId(road)) {
        if (state.roads.includes(road)) return { error: "built" as const };
        if (!(await pay(ROAD_COST[road], roadReason(road)))) return { error: "not-enough" as const };
        state.roads.push(road);
      } else if (isPlotId(plot) && isPlotBuilding(building)) {
        if (!state.roads.includes(PLOT_ROAD[plot])) return { error: "no-road" as const };
        if (state.plots[plot] || Object.values(state.plots).includes(building)) return { error: "built" as const };
        if (!(await pay(PLOT_BUILDING[building].cost, plotReason(plot, building)))) return { error: "not-enough" as const };
        state.plots[plot] = building;
      } else if (body.income === true) {
        gained = plotIncome(state);
        if (!gained || state.incomeDay === day) return { error: "claimed" as const };
        state.incomeDay = day;
        await tx.pointTransaction.create({ data: { userId, amount: gained, reason: incomeReason(day) } });
        await tx.user.update({ where: { id: userId }, data: { points: { increment: gained } } });
      } else return { error: "invalid" as const };
      await writePlots(userId, state, tx);
      const user = await tx.user.findUnique({ where: { id: userId }, select: { points: true } });
      return { ok: true as const, gained, ...view(state, day, user?.points ?? 0) };
    });
    if ("error" in result) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
