"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RewardImage } from "@/components/RewardImage";
import { getSubjectText } from "@/i18n/subjects";
import { SUBJECTS } from "@/lib/taxonomy";
import type { SubjectSummary } from "@/app/api/predmety/route";
import type { Locale } from "@/i18n/config";

// Medaile předmětů: za každý předmět jedna, bronzová po prvním hotovém kurzu, stříbrná od poloviny kurzů,
// zlatá po dokončení všech. Nové stupně se oslaví vyskočením medaile s konfetami; co už hráč viděl,
// si pamatuje prohlížeč (localStorage), při prvním zobrazení se jen zapíše současný stav.

const TIERS = ["bronz", "stribro", "zlato"] as const;
const STORAGE = "umime-medals-seen";

const TEXT: Record<Locale, Record<string, string>> = {
  cs: { title: "Medaile předmětů", bronz: "Bronzová medaile", stribro: "Stříbrná medaile", zlato: "Zlatá medaile", locked: "Dokonči první kurz", next: "Do dalšího stupně: {n} kurzů", all: "Máš všechny kurzy!", congrats: "Nová medaile!", ok: "Super!", done: "Hotovo {done} z {total}", summary: "{m} medailí · {c} kurzů hotovo" },
  en: { title: "Subject medals", bronz: "Bronze medal", stribro: "Silver medal", zlato: "Gold medal", locked: "Finish your first course", next: "To the next tier: {n} courses", all: "You finished every course!", congrats: "New medal!", ok: "Awesome!", done: "{done} of {total} done", summary: "{m} medals · {c} courses done" },
  de: { title: "Fächer-Medaillen", bronz: "Bronzemedaille", stribro: "Silbermedaille", zlato: "Goldmedaille", locked: "Schließe deinen ersten Kurs ab", next: "Bis zur nächsten Stufe: {n} Kurse", all: "Alle Kurse geschafft!", congrats: "Neue Medaille!", ok: "Super!", done: "{done} von {total} fertig", summary: "{m} Medaillen · {c} Kurse fertig" },
  ru: { title: "Медали по предметам", bronz: "Бронзовая медаль", stribro: "Серебряная медаль", zlato: "Золотая медаль", locked: "Пройди первый курс", next: "До следующего уровня: {n} курсов", all: "Все курсы пройдены!", congrats: "Новая медаль!", ok: "Супер!", done: "Пройдено {done} из {total}", summary: "Медалей: {m} · курсов пройдено: {c}" },
};

function tierOf(s: SubjectSummary | undefined): number {
  if (!s || s.total <= 0 || s.done <= 0) return -1;
  if (s.done >= s.total) return 2;
  return s.done / s.total >= 0.5 ? 1 : 0;
}

type Won = { slug: string; label: string; tier: number };

function readSeen(): Record<string, number> | null {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? (JSON.parse(raw) as Record<string, number>) : null;
  } catch {
    return null;
  }
}

function writeSeen(v: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(v));
  } catch {
    /* soukromé okno, ukládání je jen pohodlí */
  }
}

export function SubjectMedals({ locale }: { locale: Locale }) {
  const t = TEXT[locale];
  const labels = getSubjectText(locale).labels;
  const [data, setData] = useState<Record<string, SubjectSummary> | null>(null);
  const [queue, setQueue] = useState<Won[]>([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/predmety")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d.loggedIn && d.subjects) setData(d.subjects);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const rows = useMemo(
    () => SUBJECTS.map((s) => ({ slug: s.slug, label: labels[s.value], color: s.color, sum: data?.[s.slug], tier: tierOf(data?.[s.slug]) })),
    [data, labels],
  );

  useEffect(() => {
    if (!data) return;
    const now: Record<string, number> = {};
    rows.forEach((r) => (now[r.slug] = r.tier));
    const seen = readSeen();
    if (!seen) {
      writeSeen(now);
      return;
    }
    const won = rows.filter((r) => r.tier > (seen[r.slug] ?? -1)).map((r) => ({ slug: r.slug, label: r.label, tier: r.tier }));
    // oslava se vyhodnotí až po načtení postupu a stavu z localStorage, jiný zdroj než props
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (won.length) setQueue(won);
  }, [data, rows]);

  function dismiss() {
    const first = queue[0];
    const seen = readSeen() ?? {};
    if (first) seen[first.slug] = first.tier;
    writeSeen(seen);
    setQueue((q) => q.slice(1));
  }

  if (!data) return null;
  const hero = queue[0];
  const medals = rows.filter((r) => r.tier >= 0).length;
  const courses = rows.reduce((n, r) => n + (r.sum?.done ?? 0), 0);

  return (
    <section className="card p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.title}
        </h2>
        <span className="text-sm font-bold text-[var(--muted)]">{t.summary.replace("{m}", String(medals)).replace("{c}", String(courses))}</span>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {rows.map((r) => {
          const left = r.sum ? (r.tier === 0 ? Math.ceil(r.sum.total / 2) - r.sum.done : r.tier === 1 ? r.sum.total - r.sum.done : 0) : 0;
          const hint = r.tier < 0 ? t.locked : r.tier === 2 ? t.all : t.next.replace("{n}", String(Math.max(1, left)));
          return (
            <li key={r.slug}>
              <Link
                href={`/${locale}/kurzy/zakladni?predmet=${r.slug}`}
                className="medal-card group relative flex h-full flex-col items-center gap-1 rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface-muted)] p-2 text-center transition-transform hover:-translate-y-1"
                title={hint}
              >
                <span className={`medal relative block w-full max-w-[120px] ${r.tier === 2 ? "medal-gold" : ""}`} style={r.tier < 0 ? { filter: "grayscale(1) brightness(0.6)", opacity: 0.45 } : undefined}>
                  <RewardImage name={`medaile_${TIERS[Math.max(0, r.tier)]}`} size={256} className="h-auto w-full" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/home/predmet-${r.slug}.webp`} alt="" draggable={false} className="absolute left-1/2 top-[55%] h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 object-contain" />
                </span>
                <span className="text-xs font-extrabold leading-tight">{r.label}</span>
                {r.sum && <span className="text-[10px] font-semibold text-[var(--muted)]">{t.done.replace("{done}", String(r.sum.done)).replace("{total}", String(r.sum.total))}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {hero && (
        <div className="medal-celebrate fixed inset-0 z-[80] flex items-center justify-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-label={t.congrats} onClick={dismiss}>
          <div className="confetti" aria-hidden>
            {Array.from({ length: 36 }, (_, i) => (
              <i key={i} style={{ ["--i" as string]: i }} />
            ))}
          </div>
          <div className="relative z-10 flex max-w-sm flex-col items-center gap-3 rounded-3xl border-4 border-[#16132b] bg-[var(--surface)] p-6 text-center shadow-[0_8px_0_rgba(0,0,0,0.4)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
              {t.congrats}
            </h3>
            <span className="medal-pop relative block w-48">
              <RewardImage name={`medaile_${TIERS[hero.tier]}`} size={256} className="h-auto w-full drop-shadow-[0_10px_14px_rgba(0,0,0,0.35)]" preload />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/home/predmet-${hero.slug}.webp`} alt="" draggable={false} className="absolute left-1/2 top-[55%] h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 object-contain" />
            </span>
            <p className="font-bold">
              {t[TIERS[hero.tier]]} · {hero.label}
            </p>
            <button type="button" autoFocus onClick={dismiss} className="btn-bouncy bg-[var(--accent-yellow)] px-6 py-2 text-base font-extrabold text-[#16132b]">
              {t.ok}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
