import Link from "next/link";
import { notFound } from "next/navigation";
import { getEscapeText } from "@/i18n/escape";
import { isLocale, type Locale } from "@/i18n/config";

const COLORS = ["#7ee0b0", "#ffc933", "#8fd0ff", "#ff8a6b"];

export default async function EscapeRoomsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getEscapeText(locale as Locale).list;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.title}
      </h1>
      <p className="mb-8 max-w-2xl text-[var(--muted)]">{t.subtitle}</p>

      <div className="grid gap-5 sm:grid-cols-2">
        {t.rooms.map((room, i) => {
          const content = (
            <>
              <div
                className="relative flex h-44 items-end justify-between overflow-hidden rounded-xl border-2 border-[var(--edge)] p-3"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              >
                <div
                  aria-hidden
                  className="globe-sprite pointer-events-none absolute -bottom-2 left-1/2 h-48 w-48 -translate-x-1/2 drop-shadow-[0_6px_6px_rgba(0,0,0,0.35)]"
                  style={{ backgroundImage: `url(/home/unikovky/${room.id}.webp)` }}
                />
                <span className="pill relative bg-[var(--surface)] px-2.5 py-1">{room.subject}</span>
                <span className="pill relative bg-[var(--surface)] px-2.5 py-1">
                  {room.available ? t.play : t.soon}
                </span>
              </div>
              <div>
                <h2 className="mb-1 text-lg font-bold">{room.name}</h2>
                <p className="text-sm text-[var(--muted)]">{room.description}</p>
              </div>
            </>
          );
          return room.available ? (
            <Link
              key={room.id}
              href={`/${locale}/unikovky/${room.id}`}
              className="card card-hover flex flex-col gap-4 p-5"
            >
              {content}
            </Link>
          ) : (
            <div key={room.id} className="card flex flex-col gap-4 p-5 opacity-70">
              {content}
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-[var(--faint)]">{t.note}</p>
    </div>
  );
}
