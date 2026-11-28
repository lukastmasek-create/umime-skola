import { unstable_cache } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SpaceShell } from "@/components/SpaceShell";
import { isLocale } from "@/i18n/config";
import { siteSearch as t } from "@/i18n/site-search";
import { getEscapeText } from "@/i18n/escape";
import { getIdleText } from "@/i18n/idle";
import { getLiveText } from "@/i18n/live";
import { courseQueryFilter, normalizeSearchText } from "@/lib/course-search";
import { getMaterialSubjects, getTopics } from "@/lib/materials";
import { MODES } from "@/lib/live/logic";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/taxonomy";

const publishedCourses = unstable_cache(async () => prisma.course.findMany({
  where: { published: true },
  orderBy: { title: "asc" },
  select: { title: true, description: true, slug: true, category: true },
}), ["published-course-search"], { revalidate: 300 });

const gameSlugs = ["zakladna", "mazlicci", "farma", "mesto", "ekonomika"];
type SearchResult = { title: string; description: string | null; href: string };

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default async function SiteSearchPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const needle = normalizeSearchText(query);
  const match = courseQueryFilter(query);
  const prefix = `/${locale}`;

  const foundCourses = needle ? await publishedCourses().catch(() => null) : [];

  const courses: SearchResult[] = (foundCourses ?? []).flatMap((course) => {
    const category = CATEGORIES.find(c => c.value === course.category);
    return category ? [{ ...course, href: `${prefix}/kurzy/${category.slug}/${course.slug}` }] : [];
  });
  const materials = getMaterialSubjects().flatMap(subject => getTopics(subject.slug).map(topic => ({
    title: topic.title,
    description: topic.intro,
    href: `${prefix}/materialy/${subject.slug}/${topic.slug}`,
  })));
  const live = getLiveText(locale);
  const games = [
    ...getIdleText(locale).games.flatMap((game, i) => gameSlugs[i] ? [{ title: game.name, description: game.description, href: `${prefix}/stale-hry/${gameSlugs[i]}` }] : []),
    ...getEscapeText(locale).list.rooms.filter(room => room.available).map(room => ({ title: room.name, description: room.description, href: `${prefix}/unikovky/${room.id}` })),
    ...MODES.map(mode => ({ title: live.create.modes[mode].name, description: live.create.modes[mode].description, href: `${prefix}/hrat-spolecne/nova?mode=${mode}` })),
  ];

  const sections = needle ? [
    { label: t.courses[locale], items: courses },
    { label: t.materials[locale], items: materials },
    { label: t.games[locale], items: games },
  ].map(section => ({
    ...section,
    items: section.items.filter(match).sort((a, b) => Number(normalizeSearchText(b.title).includes(needle)) - Number(normalizeSearchText(a.title).includes(needle))).slice(0, 20),
  })) : [];

  return (
    <SpaceShell title={t.title[locale]}>
      <form role="search" action={`${prefix}/hledat`} method="get" className="flex flex-wrap gap-2">
        <input name="q" type="search" defaultValue={query} maxLength={100} aria-label={t.title[locale]} className="min-h-11 min-w-0 flex-1 rounded-lg border-2 border-[var(--edge)] bg-[var(--surface)] px-3" />
        <button className="btn-bouncy btn-primary btn-lg" type="submit">{t.submit[locale]}</button>
      </form>
      {foundCourses === null && <p className="mt-4" role="status">{t.unavailable[locale]}</p>}
      {needle && sections.every(section => section.items.length === 0) && <p className="mt-4">{t.empty[locale]}</p>}
      {sections.filter(section => section.items.length).map(section => (
        <section key={section.label} className="mt-6">
          <h2 className="mb-2 text-xl font-bold">{section.label}</h2>
          <ul className="grid gap-2">
            {section.items.map(item => (
              <li key={item.href}>
                <Link href={item.href} className="card block p-3 focus-visible:outline-2" prefetch={false}>
                  <strong>{item.title} <span aria-hidden>→</span></strong>
                  {item.description && <p className="line-clamp-2 text-sm text-[var(--muted)]">{item.description}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </SpaceShell>
  );
}
