import { handle, playerTokenOf, readJson } from "@/lib/live/http";
import { LiveError, openChest } from "@/lib/live/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request, ctx: RouteContext<"/api/live/rooms/[pin]/chest">) {
  const { pin } = await ctx.params;
  return handle(async () => {
    const token = playerTokenOf(request);
    if (!token) throw new LiveError("unauthorized", 401);
    return openChest(pin, token, (await readJson(request)).index);
  });
}
