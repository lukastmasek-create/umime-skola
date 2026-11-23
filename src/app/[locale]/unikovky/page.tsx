import { notFound } from "next/navigation";
import { getEscapeText } from "@/i18n/escape";
import { isLocale, type Locale } from "@/i18n/config";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROOM_DIFFICULTY, escapeTimeLimit, getEscape } from "@/lib/escape/rewards";
import { EscapeList, type EscapeCard } from "@/components/escape/EscapeList";
import { PxHeader, PxStage } from "@/components/pixel/PixelKit";
import { staticPageMetadata } from "@/lib/seo";

// Nejlepší hodnocení přihlášeného hráče v každé únikovce. Bez přihlášení nebo databáze je prázdné.
// auth() zůstává mimo try/catch, aby Next poznal, že je stránka dynamická (čte cookies).
async function bestStars(): Promise<Record<string, number>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return {};
  try {
    const rows = await prisma.escapeRun.groupBy({ by: ["room"], where: { userId }, _max: { stars: true } });
    return Object.fromEntries(rows.map((r) => [r.room, r._max.stars ?? 0]));
  } catch {
    return {};
  }
}

export const generateMetadata = staticPageMetadata("/unikovky");

export default async function EscapeRoomsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getEscapeText(locale as Locale).list;
  const best = await bestStars();

  const cards: EscapeCard[] = t.rooms.map((room) => ({
    ...room,
    difficulty: ROOM_DIFFICULTY[room.id] ?? 3,
    roomCount: getEscape(room.id, locale as Locale)?.rooms.length ?? 1,
    minutes: Math.round(escapeTimeLimit(room.id) / 60),
    best: best[room.id] || undefined,
  }));

  return (
    <PxStage>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <PxHeader title={t.title} subtitle={t.subtitle} />

        <EscapeList locale={locale as Locale} t={t} cards={cards} />

        <p className="px-box mt-8 px-4 py-3 text-sm text-[var(--px-dim)]">{t.note}</p>
      </div>
    </PxStage>
  );
}
