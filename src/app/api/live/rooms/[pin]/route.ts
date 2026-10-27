import { handle, hostSecretOf, playerTokenOf } from "@/lib/live/http";
import { getView } from "@/lib/live/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request, ctx: RouteContext<"/api/live/rooms/[pin]">) {
  const { pin } = await ctx.params;
  return handle(() => getView(pin, { hostSecret: hostSecretOf(request), playerToken: playerTokenOf(request) }));
}
