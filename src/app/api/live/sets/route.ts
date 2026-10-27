import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { cleanQuestions } from "@/lib/live/logic";
import { LiveError } from "@/lib/live/service";

export const dynamic = "force-dynamic";

async function requireUser(): Promise<string> {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) throw new LiveError("login-required", 401);
  return session.user.id;
}

export async function GET() {
  return handle(async () => {
    const ownerId = await requireUser();
    const sets = await prisma.questionSet.findMany({ where: { ownerId }, orderBy: { updatedAt: "desc" } });
    return { sets: sets.map((s) => ({ id: s.id, title: s.title, questions: cleanQuestions(s.questions) })) };
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const ownerId = await requireUser();
    const body = await readJson(request);
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 80) : "";
    const questions = cleanQuestions(body.questions);
    if (!title || questions.length === 0) throw new LiveError("invalid-set");
    const set = await prisma.questionSet.create({ data: { ownerId, title, questions } });
    return { id: set.id };
  });
}
