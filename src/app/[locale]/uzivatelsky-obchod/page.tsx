import { notFound } from "next/navigation";
import { getCommunityText } from "@/i18n/community";
import { isLocale, type Locale } from "@/i18n/config";

const SAMPLE_COLORS = ["#ffc933", "#8fd0ff", "#7ee0b0"];

export default async function MarketplacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getCommunityText(locale as Locale).marketplace;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {t.title}
          </h1>
          <p className="max-w-xl text-[var(--muted)]">{t.subtitle}</p>
        </div>
        <button
          disabled
          className="btn-bouncy cursor-not-allowed bg-[var(--surface-muted)] px-5 py-2.5 text-sm font-bold opacity-60"
        >
          {t.addListing}
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {t.sampleItems.map((name, i) => (
          <div key={name} className="card flex flex-col gap-4 p-4 opacity-70">
            <div
              className="h-28 rounded-xl border-2 border-[var(--edge)]"
              style={{ background: SAMPLE_COLORS[i] }}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{name}</span>
              <span className="pill bg-[var(--surface-muted)] px-2.5 py-1">{t.soon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-8 p-8 text-center">
        <p className="mb-1 font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.emptyTitle}
        </p>
        <p className="mx-auto max-w-lg text-sm text-[var(--muted)]">{t.emptyText}</p>
      </div>
    </div>
  );
}
