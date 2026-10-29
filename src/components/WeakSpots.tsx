"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getReviewText } from "@/i18n/review";
import type { Locale } from "@/i18n/config";

type Weak = { courseId: string; title: string; href: string; count: number; due: number; low: number; best: number | null };
type State = "loading" | "hidden" | { weak: Weak[] };

// Slabá místa: kurzy, ve kterých hráč nejvíc chybuje; tlačítko spustí opakování jen z jeho chybných otázek.
export function WeakSpots({ locale }: { locale: Locale }) {
  const t = getReviewText(locale);
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/opakovani?weak=1")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setState(d.loggedIn === false || d.error ? "hidden" : { weak: d.weak ?? [] });
      })
      .catch(() => !cancelled && setState("hidden"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading" || state === "hidden") return null;
  const heading = { fontFamily: "var(--font-heading)" } as const;
  const max = Math.max(1, ...state.weak.map((w) => w.count));

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold" style={heading}>
        🎯 {t.weak.title}
      </h2>
      <p className="mb-3 text-sm text-[var(--muted)]">{t.weak.subtitle}</p>
      {state.weak.length === 0 ? (
        <p className="card p-4 text-sm font-semibold text-[var(--muted)]">{t.weak.empty}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {state.weak.map((w) => (
            <li key={w.courseId} className="card flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/${locale}/kurzy/${w.href}`} className="font-bold hover:underline">
                  {w.title}
                </Link>
                {w.due > 0 && <span className="pill shrink-0 bg-[var(--accent-yellow)] px-2 py-0.5 text-xs font-bold text-[#16132b]">{t.weak.due.replace("{n}", String(w.due))}</span>}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]" aria-hidden>
                <div className="h-full rounded-full bg-[#ff5d73]" style={{ width: `${Math.round((w.count / max) * 100)}%` }} />
              </div>
              <p className="text-xs font-semibold text-[var(--muted)]">
                {t.weak.count.replace("{n}", String(w.count))}
                {w.best !== null ? ` · ${t.weak.best.replace("{n}", String(w.best))}` : ""}
              </p>
              <Link href={`/${locale}/opakovani?kurz=${w.courseId}`} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-center text-sm font-bold text-white">
                {t.weak.practice}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
