import { handle, hostSecretOf, readJson } from "@/lib/live/http";
import { advance, LiveError, setRoomJoinLock } from "@/lib/live/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request, ctx: RouteContext<"/api/live/rooms/[pin]/control">) {
  const { pin } = await ctx.params;
  return handle(async () => {
    const secret = hostSecretOf(request);
    if (!secret) throw new LiveError("unauthorized", 401);
    const { action } = await readJson(request);
    if (action === "lock" || action === "unlock") await setRoomJoinLock(pin, secret, action === "lock");
    else if (action === "next" || action === "end") await advance(pin, secret, action);
    else throw new LiveError("bad-request");
    return { ok: true };
  });
}
