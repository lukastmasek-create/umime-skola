import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug } from "@/lib/taxonomy";
import { LEARNING_RESUME_GAME, parseLearningResume, type LearningResume } from "@/lib/learning-resume";
import type { Prisma } from "@prisma/client";

const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
async function available(resume: LearningResume) {
  return prisma.course.findFirst({
    where: {
      slug: resume.course,
      category: getCategoryBySlug(resume.category)!.value,
      published: true,
      questions: { some: { difficulty: resume.difficulty } },
    },
    select: { title: true },
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return json({ resume: null }, 401);
  try {
    const row = await prisma.idleState.findUnique({ where: { userId_game: { userId: session.user.id, game: LEARNING_RESUME_GAME } } });
    const resume = parseLearningResume(row?.data);
    const course = resume ? await available(resume) : null;
    return json({ resume: resume && course ? { ...resume, title: course.title } : null });
  } catch {
    return json({ resume: null }, 503);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return json({ error: "login-required" }, 401);
  const resume = parseLearningResume(await request.json().catch(() => null));
  if (!resume) return json({ error: "invalid-exercise" }, 400);
  try {
    if (!(await available(resume))) return json({ error: "unavailable" }, 404);
    const data = resume as unknown as Prisma.InputJsonValue;
    const userId = session.user.id;
    await prisma.idleState.upsert({
      where: { userId_game: { userId, game: LEARNING_RESUME_GAME } },
      create: { userId, game: LEARNING_RESUME_GAME, data }, update: { data },
    });
    return json({ ok: true });
  } catch {
    return json({ error: "unavailable" }, 503);
  }
}
