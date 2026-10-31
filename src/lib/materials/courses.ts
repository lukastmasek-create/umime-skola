import { prisma } from "@/lib/prisma";
import { CATEGORIES, type SubjectValue } from "@/lib/taxonomy";
import type { Topic } from "./types";

// Kurzy k procvičení tématu: stejný předmět, nejvíc společných slov v názvu (jen serverově).
const words = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);

export async function relatedCourses(subject: SubjectValue | null, topic: Topic) {
  if (!subject) return [];
  try {
    const rows = await prisma.course.findMany({ where: { subject, published: true }, select: { title: true, slug: true, category: true } });
    const mine = new Set(words(`${topic.title} ${topic.intro}`));
    const wantCategory = topic.level === 4 ? "PRIJIMACKY" : topic.level === 3 ? null : "ZAKLADNI";
    return rows
      .map((r) => ({ ...r, score: words(r.title).filter((w) => mine.has(w)).length * 2 + (wantCategory && r.category === wantCategory ? 1 : 0) }))
      .filter((r) => r.score >= 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => ({ title: r.title, slug: r.slug, category: CATEGORIES.find((c) => c.value === r.category)?.slug ?? "zakladni" }));
  } catch {
    return [];
  }
}
