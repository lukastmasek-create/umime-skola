import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { proTiers } from "@/lib/pro-server";
import { isLocale, type Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import { featureTier, isProFeature, type ProFeatureSlug } from "@/lib/pro-tools/features";
import { AiTutor } from "@/components/pro/AiTutor";
import { ExamRunner } from "@/components/pro/ExamRunner";
import { MistakeNotebook } from "@/components/pro/MistakeNotebook";
import { NotesCards } from "@/components/pro/NotesCards";
import { OfflineManager } from "@/components/pro/OfflineManager";
import { OralExam } from "@/components/pro/OralExam";
import { PhotoTasks } from "@/components/pro/PhotoTasks";
import { Pronunciation } from "@/components/pro/Pronunciation";
import { StudyPlan } from "@/components/pro/StudyPlan";
import { FamilyDuel, FamilyHub, HolidayPlan } from "@/components/pro/FamilyTools";
import { SchoolTools } from "@/components/pro/SchoolTools";

export const dynamic = "force-dynamic";

const VIEWS: Record<ProFeatureSlug, (props: { locale: Locale }) => React.ReactNode> = {
  doucovatel: (p) => <AiTutor {...p} />,
  plan: (p) => <StudyPlan {...p} />,
  zkouska: (p) => <ExamRunner {...p} />,
  fotka: (p) => <PhotoTasks {...p} />,
  ustni: (p) => <OralExam {...p} />,
  "sesit-chyb": (p) => <MistakeNotebook {...p} />,
  poznamky: (p) => <NotesCards {...p} />,
  vyslovnost: (p) => <Pronunciation {...p} />,
  offline: (p) => <OfflineManager {...p} />,
  rodina: (p) => <FamilyHub {...p} />,
  souboj: (p) => <FamilyDuel {...p} />,
  prazdniny: (p) => <HolidayPlan {...p} />,
  skola: (p) => <SchoolTools {...p} />,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; feature: string }> }): Promise<Metadata> {
  const { locale, feature } = await params;
  if (!isLocale(locale) || !isProFeature(feature)) return {};
  const f = getProToolsText(locale).features[feature];
  return { title: `${f.title} · UčímePRO`, description: f.text, robots: { index: false } };
}

export default async function ProToolPage({ params }: { params: Promise<{ locale: string; feature: string }> }) {
  const { locale: rawLocale, feature } = await params;
  if (!isLocale(rawLocale) || !isProFeature(feature)) notFound();
  const locale = rawLocale as Locale;
  const t = getProToolsText(locale);
  const f = t.features[feature];

  let allowed = false;
  let loggedIn = false;
  try {
    const userId = (await auth())?.user?.id;
    loggedIn = !!userId;
    if (userId) {
      const tiers = await proTiers(userId);
      const need = featureTier(feature);
      // Stránka Rodina je otevřená každému přihlášenému, aby se pozvaný člen mohl připojit kódem.
      allowed = feature === "rodina" || (need ? tiers.has(need) : tiers.size > 0);
    }
  } catch {
    allowed = false;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <Link href={`/${locale}/pro`} className="mb-4 inline-block text-sm font-semibold text-[var(--brand-600)] hover:underline print:hidden">
        ← UčímePRO
      </Link>
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {f.title}
      </h1>
      <p className="mb-8 text-[var(--muted)] print:hidden">{f.text}</p>
      {allowed ? (
        VIEWS[feature]({ locale })
      ) : (
        <div className="card p-6">
          <h2 className="mb-1 text-lg font-bold">{t.gateTitle}</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">{featureTier(feature) === "FAMILY" ? t.gateFamily : featureTier(feature) === "SCHOOL" ? t.gateSchool : t.gateText}</p>
          <div className="flex flex-wrap gap-2">
            {!loggedIn && (
              <Link href={`/${locale}/prihlaseni`} className="btn-bouncy btn-secondary btn-lg">
                {t.gateLogin}
              </Link>
            )}
            <Link href={`/${locale}/pro`} className="btn-bouncy btn-lg bg-[var(--brand-500)] font-bold text-white">
              {t.gatePlans}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
