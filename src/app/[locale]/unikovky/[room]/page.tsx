import Link from "next/link";
import { notFound } from "next/navigation";
import { EscapeRoom } from "@/components/escape/EscapeRoom";
import { DifficultyStars } from "@/components/escape/DifficultyStars";
import { ROOMS, ROOM_DIFFICULTY, escapeTimeLimit, getEscape } from "@/lib/escape/rewards";
import { getEscapeText } from "@/i18n/escape";
import { FullscreenFrame } from "@/components/FullscreenFrame";
import { isLocale, type Locale } from "@/i18n/config";

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ""));

export default async function EscapeRoomPage({
  params,
}: {
  params: Promise<{ locale: string; room: string }>;
}) {
  const { locale, room } = await params;
  if (!isLocale(locale) || !ROOMS[room]) notFound();
  const t = getEscapeText(locale as Locale);
  const meta = t.list.rooms.find((r) => r.id === room);
  const difficulty = ROOM_DIFFICULTY[room] ?? 3;
  const level = t.list.levels[difficulty - 1];
  const roomCount = getEscape(room, locale as Locale)?.rooms.length ?? 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <FullscreenFrame locale={locale as Locale}>
        <Link
          href={`/${locale}/unikovky`}
          className="mb-3 inline-block text-sm font-medium text-[var(--faint)] hover:text-[var(--foreground)]"
        >
          ← {t.ui.backToRooms}
        </Link>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
            {meta?.name ?? t.list.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {meta && <span className="pill bg-[var(--surface)] px-3 py-1">{meta.subject}</span>}
            <span className="pill flex items-center gap-1.5 bg-[var(--surface)] px-3 py-1">
              <DifficultyStars value={difficulty} label={`${t.list.difficulty}: ${level} (${difficulty}/5)`} />
              {level}
            </span>
            <span className="pill bg-[var(--surface)] px-3 py-1">🚪 {fill(t.list.roomsCount, { n: roomCount })}</span>
            <span className="pill bg-[var(--surface)] px-3 py-1">⏱ {fill(t.list.minutes, { min: Math.round(escapeTimeLimit(room) / 60) })}</span>
          </div>
        </div>
        <EscapeRoom locale={locale as Locale} roomId={room} />
      </FullscreenFrame>
    </div>
  );
}
