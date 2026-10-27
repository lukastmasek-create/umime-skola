import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Kurzy, ze kterých si učitel může vzít otázky (jen ty, které nějaké mají).
export async function GET() {
  try {
    const rows = await prisma.course.findMany({
      where: { published: true, questions: { some: {} } },
      select: { slug: true, title: true, category: true, subject: true, grade: true, _count: { select: { questions: true } } },
      orderBy: [{ category: "asc" }, { subject: "asc" }, { grade: "asc" }, { title: "asc" }],
    });
    return NextResponse.json(
      rows.map((c) => ({ slug: c.slug, title: c.title, category: c.category, subject: c.subject, grade: c.grade, questions: c._count.questions })),
    );
  } catch (e) {
    console.error("live courses failed", e);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
