import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/taxonomy";
import { getMaterialSubjects, getTopics } from "@/lib/materials";
import { STATIC_PAGE_PATHS, SITE_URL } from "@/lib/seo";
import { defaultLocale, locales } from "@/i18n/config";

// Kurzy se čtou z databáze; sitemap se obnoví nejvýš jednou za hodinu.
export const revalidate = 3600;

type Entry = { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly"; lastModified?: Date };

// Jeden záznam na jazykovou verzi, každý s odkazy na ostatní jazyky (hreflang).
function expand({ path, priority, changeFrequency, lastModified }: Entry): MetadataRoute.Sitemap {
  const languages = {
    ...Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`])),
    "x-default": `${SITE_URL}/${defaultLocale}${path}`,
  };
  return locales.map((l) => ({
    url: `${SITE_URL}/${l}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: Entry[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    ...CATEGORIES.map((c) => ({ path: `/kurzy/${c.slug}`, priority: 0.9, changeFrequency: "weekly" as const })),
    ...STATIC_PAGE_PATHS.map((path) => ({ path, priority: 0.6, changeFrequency: "monthly" as const })),
    { path: "/materialy", priority: 0.7, changeFrequency: "weekly" },
    { path: "/pro", priority: 0.5, changeFrequency: "monthly" },
    { path: "/kontakt", priority: 0.4, changeFrequency: "monthly" },
    { path: "/ochrana-soukromi", priority: 0.2, changeFrequency: "monthly" },
    { path: "/podminky", priority: 0.2, changeFrequency: "monthly" },
  ];

  for (const subject of getMaterialSubjects()) {
    entries.push({ path: `/materialy/${subject.slug}`, priority: 0.6, changeFrequency: "monthly" });
    for (const topic of getTopics(subject.slug)) {
      entries.push({ path: `/materialy/${subject.slug}/${topic.slug}`, priority: 0.5, changeFrequency: "monthly" });
    }
  }

  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
      select: { slug: true, category: true, updatedAt: true },
    });
    const slugByCategory = new Map(CATEGORIES.map((c) => [c.value, c.slug]));
    for (const course of courses) {
      const category = slugByCategory.get(course.category);
      if (category) {
        entries.push({
          path: `/kurzy/${category}/${course.slug}`,
          priority: 0.7,
          changeFrequency: "weekly",
          lastModified: course.updatedAt,
        });
      }
    }
  } catch (error) {
    // Bez databáze (např. při buildu) zůstane sitemap bez jednotlivých kurzů.
    console.error("Sitemap: kurzy se nepodařilo načíst:", error);
  }

  return entries.flatMap(expand);
}
