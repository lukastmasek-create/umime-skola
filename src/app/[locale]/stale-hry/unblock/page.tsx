import { notFound } from "next/navigation";
import { UnblockGame } from "@/components/unblock/UnblockGame";
import { FullscreenFrame } from "@/components/FullscreenFrame";
import { isLocale, type Locale } from "@/i18n/config";

export default async function UnblockPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          Odemkni dveře
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Odpověz na otázku kusu, posuň ho po jeho ose a dostaň oba klíče ven dírami v rámu.
        </p>
      </header>
      <FullscreenFrame locale={locale as Locale} backHref={`/${locale}/stale-hry`}>
        <UnblockGame backHref={`/${locale}/stale-hry`} />
      </FullscreenFrame>
    </div>
  );
}
