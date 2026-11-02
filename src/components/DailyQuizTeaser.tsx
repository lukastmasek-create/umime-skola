"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDailyQuizText } from "@/i18n/daily-quiz";
import type { Locale } from "@/i18n/config";

type Status = { loggedIn: boolean; started: boolean; finished: boolean; score: number; points: number; msToNext: number };

// Karta na úvodní stránce: stav dnešního denního kvízu a odkaz na hru.
export function DailyQuizTeaser({ locale }: { locale: Locale }) {
  const t = getDailyQuizText(locale);
  const [s, setS] = useState<Status | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/denni-kviz")
      .then((r) => r.json())
      .then((d) => !cancelled && !d.error && setS(d))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!s) return null;
  const left = `${Math.floor(s.msToNext / 3_600_000)} h ${Math.floor((s.msToNext % 3_600_000) / 60_000)} min`;
  const done = s.loggedIn && s.finished;
  const text = done
    ? t.teaserDone.replace("{n}", String(s.score)).replace("{p}", String(s.points)).replace("{t}", left)
    : s.loggedIn && s.started
      ? t.teaserContinue
      : t.teaserWaiting;

  return (
    <div className="card flex flex-wrap items-center gap-4 p-5">
      <span className="text-3xl" aria-hidden>
        📅
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.title}
        </h2>
        <p className="text-sm text-[var(--muted)]">{text}</p>
      </div>
      <Link href={`/${locale}/denni-kviz`} className="btn-bouncy btn-primary px-5 py-2.5 text-sm font-bold">
        {done ? t.teaserOpen : t.teaserPlay}
      </Link>
    </div>
  );
}
