import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { joinRoom } from "@/lib/live/service";

export const dynamic = "force-dynamic";

// Přihlášený hráč se připojí se svým avatarem a body se mu připíšou; host jen s přezdívkou.
export async function POST(request: Request, ctx: RouteContext<"/api/live/rooms/[pin]/join">) {
  const { pin } = await ctx.params;
  return handle(async () => {
    const body = await readJson(request);
    const session = await auth().catch(() => null);
    const userId = session?.user?.id ?? null;
    const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { name: true, avatar: true } }) : null;
    return joinRoom({ pin, name: body.name || user?.name, userId: user ? userId : null, avatar: user?.avatar ?? null });
  });
}
