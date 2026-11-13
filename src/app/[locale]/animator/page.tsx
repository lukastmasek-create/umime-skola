import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getAnimatorText } from "@/i18n/animator";
import { AnimatorEditor } from "@/components/animator/AnimatorEditor";
import { staticPageMetadata } from "@/lib/seo";

export const generateMetadata = staticPageMetadata("/animator");

export default async function AnimatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getAnimatorText(locale as Locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 flex flex-col gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          {t.title}
        </h1>
        <p className="max-w-2xl text-base text-[var(--muted)]">{t.subtitle}</p>
      </header>
      <AnimatorEditor t={t} />
    </div>
  );
}
