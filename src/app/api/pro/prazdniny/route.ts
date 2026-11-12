import { handle } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { requireTierUserId } from "@/lib/pro-server";
import { loadPlanInputs } from "@/lib/pro-tools/server";
import { buildHolidayPlan, holidayDays } from "@/lib/pro-tools/family";

export const dynamic = "force-dynamic";

// Plán na prázdniny (rodinný tarif): ?od=YYYY-MM-DD&do=YYYY-MM-DD, denně 15 minut a každý sedmý den volno.
export async function GET(request: Request) {
  return handle(async () => {
    const userId = await requireTierUserId("FAMILY");
    const params = new URL(request.url).searchParams;
    const days = holidayDays(params.get("od"), params.get("do"));
    if (!days) throw new LiveError("invalid-dates");
    const { weak, fresh } = await loadPlanInputs(userId);
    return { plan: buildHolidayPlan(days, weak, fresh) };
  });
}
