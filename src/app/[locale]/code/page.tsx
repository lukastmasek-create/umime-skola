import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CodeLearn } from "@/components/CodeLearn";
import { SketchIcon } from "@/components/SketchIcons";
import { isLocale } from "@/i18n/config";

// Stránka je zatím jen česky, proto ostatní jazyky vrací 404.
export const metadata: Metadata = {
  title: "Kód na hraní",
  description: "Projdi si HTML, CSS a JavaScript řádek po řádku a u každého příkazu si přečti, co dělá.",
};

export default async function CodePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale !== "cs") notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-8 flex items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-[var(--sketch-ink)] bg-[#ffc933] shadow-[3px_3px_0_var(--shadow-ink)]">
          <SketchIcon kind="bolt" size={30} />
        </span>
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            Kód na hraní
          </h1>
          <p className="mt-1 max-w-2xl text-[var(--muted)]">
            Tři malé soubory: HTML, CSS a JavaScript. Klikni na řádek s jiskrou a přečti si, co každý příkaz dělá. Nebo spusť přehrávání a sleduj to.
          </p>
        </div>
      </div>

      <CodeLearn />
    </div>
  );
}
