import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { TeamsHome } from "@/components/teams/TeamsHome";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Týmy a třídy</h1>
      <p className="mb-8 max-w-2xl text-[var(--muted)]">Učitel založí tým, přidá žáky a zadává úkoly. Žáci plní zadání a píšou si v chatu. Učitel vidí, kdo úkol zobrazil, kdo ho udělal a kolikrát to zkoušel.</p>
      <TeamsHome locale={locale} />
    </div>
  );
}
