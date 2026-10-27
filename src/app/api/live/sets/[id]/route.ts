import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { cleanQuestions } from "@/lib/live/logic";
import { LiveError } from "@/lib/live/service";

export const dynamic = "force-dynamic";

async function ownedSet(id: string) {
  const session = await auth().catch(() => null);
  const ownerId = session?.user?.id;
  if (!ownerId) throw new LiveError("login-required", 401);
  const set = await prisma.questionSet.findFirst({ where: { id, ownerId } });
  if (!set) throw new LiveError("set-not-found", 404);
  return set;
}

export async function PUT(request: Request, ctx: RouteContext<"/api/live/sets/[id]">) {
  const { id } = await ctx.params;
  return handle(async () => {
    await ownedSet(id);
    const body = await readJson(request);
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 80) : "";
    const questions = cleanQuestions(body.questions);
    if (!title || questions.length === 0) throw new LiveError("invalid-set");
    await prisma.questionSet.update({ where: { id }, data: { title, questions } });
    return { ok: true };
  });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/live/sets/[id]">) {
  const { id } = await ctx.params;
  return handle(async () => {
    await ownedSet(id);
    await prisma.questionSet.delete({ where: { id } });
    return { ok: true };
  });
}
