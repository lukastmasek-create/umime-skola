import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getScratchText } from "@/i18n/scratch";
import { ScratchEditor } from "@/components/scratch/ScratchEditor";
import { auth } from "@/lib/auth";
import { loadScratchProject } from "@/lib/scratch/store";
import { staticPageMetadata } from "@/lib/seo";

export const generateMetadata = staticPageMetadata("/scratch");

export default async function ScratchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getScratchText(locale as Locale);

  // auth() zůstává mimo try/catch, aby Next poznal dynamickou stránku (čte cookies).
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const blocks = userId ? await loadScratchProject(userId) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 flex flex-col gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          {t.title}
        </h1>
        <p className="max-w-2xl text-base text-[var(--muted)]">{t.subtitle}</p>
      </header>
      <ScratchEditor t={t} initialBlocks={blocks} loggedIn={Boolean(userId)} loginHref={`/${locale}/prihlaseni`} />
    </div>
  );
}
