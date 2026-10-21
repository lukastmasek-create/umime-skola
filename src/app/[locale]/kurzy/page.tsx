import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/taxonomy";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";

export default async function KurzyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-2 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {dict.kurzyPage.title}
      </h1>
      <p className="mb-4 text-[var(--muted)]">{dict.kurzyPage.subtitle}</p>
      <Link
        href={`/${locale}/kurzy/sablony`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-600)] hover:underline"
      >
        {dict.templates.title} →
      </Link>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${locale}/kurzy/${cat.slug}`}
            className="card card-hover flex flex-col gap-2 p-6"
          >
            <h2 className="text-lg font-semibold">{dict.categories[cat.slug].label}</h2>
            <p className="text-sm text-[var(--muted)]">
              {dict.categories[cat.slug].description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
