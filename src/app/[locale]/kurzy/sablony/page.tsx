import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { QuizTemplatesShowcase } from "@/components/QuizTemplatesShowcase";

export default async function SablonyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {dict.templates.title}
      </h1>
      <p className="mb-10 max-w-2xl text-[var(--muted)]">{dict.templates.subtitle}</p>
      <QuizTemplatesShowcase dict={dict} />
    </div>
  );
}
