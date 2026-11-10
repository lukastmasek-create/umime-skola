import { NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/reminders";
import { runDeadlineReminders } from "@/lib/reminders-server";

export const dynamic = "force-dynamic";

// Volá ji plánovač (worker.ts, cron v wrangler.jsonc). Bez shodného CRON_SECRET nepustí nikoho.
export async function GET(request: Request) {
  if (!cronAuthorized(process.env.CRON_SECRET, request.headers.get("authorization"))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    return NextResponse.json(await runDeadlineReminders());
  } catch (error) {
    console.error("Připomínky: běh selhal", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
