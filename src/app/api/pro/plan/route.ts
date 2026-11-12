import { handle } from "@/lib/live/http";
import { requireProUserId } from "@/lib/pro-server";
import { loadPlanInputs } from "@/lib/pro-tools/server";
import { buildStudyPlan } from "@/lib/pro-tools/plan";
import { DAY_MS, dayKey } from "@/lib/gamify";

export const dynamic = "force-dynamic";

// Osobní plán učení (PRO): týdenní plán po 15 minutách podle slabých míst v opakování.
export async function GET() {
  return handle(async () => {
    const userId = await requireProUserId();
    const now = Date.now();
    const { due, weak, fresh } = await loadPlanInputs(userId, now);
    const days = Array.from({ length: 7 }, (_, i) => dayKey(new Date(now + i * DAY_MS)));
    return { plan: buildStudyPlan({ days, due, weak, fresh }), due };
  });
}
