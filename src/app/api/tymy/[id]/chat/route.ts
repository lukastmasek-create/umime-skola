import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { withinRateLimit } from "@/lib/rate-limit";
import { MAX_MESSAGE } from "@/lib/teams/logic";
import { requireMember, requireUserId } from "@/lib/teams/server";

export const dynamic = "force-dynamic";
type Ctx = RouteContext<"/api/tymy/[id]/chat">;

// Obecný chat týmu (bez assignmentId) nebo vlákno pod zadáním (?assignmentId=…).
export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return handle(async () => {
    const userId = await requireUserId();
    const me = await requireMember(id, userId);
    const url = new URL(request.url);
    const assignmentId = url.searchParams.get("assignmentId") || null;
    const rows = await prisma.teamMessage.findMany({
      where: { teamId: id, assignmentId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { name: true } } },
    });
    const roles = await prisma.teamMember.findMany({ where: { teamId: id, userId: { in: [...new Set(rows.map((r) => r.userId))] } }, select: { userId: true, role: true } });
    return {
      canModerate: me.role === "TEACHER",
      messages: rows.reverse().map((m) => ({
        id: m.id,
        text: m.text,
        createdAt: m.createdAt,
        userId: m.userId,
        name: m.user.name,
        teacher: roles.find((r) => r.userId === m.userId)?.role === "TEACHER",
      })),
    };
  });
}

export async function POST(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return handle(async () => {
    const userId = await requireUserId();
    const me = await requireMember(id, userId);
    const body = await readJson(request);
    if (body.action === "delete") {
      const msg = await prisma.teamMessage.findFirst({ where: { id: String(body.messageId ?? ""), teamId: id } });
      if (!msg) throw new LiveError("not-found", 404);
      if (msg.userId !== userId && me.role !== "TEACHER") throw new LiveError("forbidden", 403);
      await prisma.teamMessage.delete({ where: { id: msg.id } });
      return { ok: true };
    }
    const text = typeof body.text === "string" ? body.text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, MAX_MESSAGE) : "";
    if (!text) throw new LiveError("empty");
    if (!(await withinRateLimit(`team-chat:${userId}`, 30, 60))) throw new LiveError("rate-limited", 429);
    const assignmentId = typeof body.assignmentId === "string" && body.assignmentId ? body.assignmentId : null;
    if (assignmentId && !(await prisma.assignment.findFirst({ where: { id: assignmentId, teamId: id }, select: { id: true } }))) throw new LiveError("assignment-not-found", 404);
    await prisma.teamMessage.create({ data: { teamId: id, assignmentId, userId, text } });
    return { ok: true };
  });
}
