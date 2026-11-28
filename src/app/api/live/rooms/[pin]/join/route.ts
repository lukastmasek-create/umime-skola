import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { joinRoom, LiveError } from "@/lib/live/service";

export const dynamic = "force-dynamic";

// Přihlášený hráč se připojí se svým avatarem a body se mu připíšou; host jen s přezdívkou.
export async function POST(request: Request, ctx: RouteContext<"/api/live/rooms/[pin]/join">) {
  const { pin } = await ctx.params;
  return handle(async () => {
    if (!/^\d{6}$/.test(pin)) throw new LiveError("room-not-found", 404);
    if (!(await withinRateLimit(`live-join:${clientIp(request)}`, 150, 60))) throw new LiveError("rate-limited", 429);
    const body = await readJson(request);
    const session = await auth().catch(() => null);
    const userId = session?.user?.id ?? null;
    const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { name: true, avatar: true } }) : null;
    return joinRoom({ pin, name: body.name || user?.name, userId: user ? userId : null, avatar: user?.avatar ?? null });
  });
}
