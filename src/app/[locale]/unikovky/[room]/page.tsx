import Link from "next/link";
import { notFound } from "next/navigation";
import { EscapeRoom } from "@/components/escape/EscapeRoom";
import { ROOMS } from "@/lib/escape/rewards";
import { getEscapeText } from "@/i18n/escape";
import { FullscreenFrame } from "@/components/FullscreenFrame";
import { isLocale, type Locale } from "@/i18n/config";

export default async function EscapeRoomPage({
  params,
}: {
  params: Promise<{ locale: string; room: string }>;
}) {
  const { locale, room } = await params;
  if (!isLocale(locale) || !ROOMS[room]) notFound();
  const t = getEscapeText(locale as Locale);
  const meta = t.list.rooms.find((r) => r.id === room);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <FullscreenFrame locale={locale as Locale}>
        <Link
          href={`/${locale}/unikovky`}
          className="mb-3 inline-block text-sm font-medium text-[var(--faint)] hover:text-[var(--foreground)]"
        >
          ← {t.ui.backToRooms}
        </Link>
        <h1 className="mb-6 text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {meta?.name ?? t.list.title}
        </h1>
        <EscapeRoom locale={locale as Locale} roomId={room} />
      </FullscreenFrame>
    </div>
  );
}
