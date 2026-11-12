"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import { errorText, proFetch } from "./api";

type Entry = { id: string; prompt: string; answer: string; explanation: string; box: number; due: boolean; courseId: string; courseTitle: string; courseHref: string };

// Sešit chyb: chyby z opakování seskupené podle kurzu, s vysvětlením. Jde vytisknout.
export function MistakeNotebook({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void proFetch<{ entries: Entry[] }>("/api/pro/sesit-chyb").then((r) => (r.ok ? setEntries(r.data.entries) : setError(errorText(t, r.error))));
  }, [t]);

  const groups = useMemo(() => {
    const map = new Map<string, { title: string; href: string; id: string; items: Entry[] }>();
    for (const e of entries ?? []) {
      const g = map.get(e.courseId) ?? { title: e.courseTitle, href: e.courseHref, id: e.courseId, items: [] };
      g.items.push(e);
      map.set(e.courseId, g);
    }
    return [...map.values()].sort((a, b) => b.items.length - a.items.length);
  }, [entries]);

  if (error) return <p className="card p-4 text-sm font-semibold">{error}</p>;
  if (!entries) return <p className="text-sm text-[var(--muted)]">{t.loading}</p>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-[var(--muted)]">{t.notebookCount.replace("{n}", String(entries.length))}</p>
        {entries.length > 0 && (
          <button type="button" onClick={() => window.print()} className="btn-bouncy btn-secondary btn-lg">
            {t.print}
          </button>
        )}
      </div>
      {entries.length === 0 && <p className="card p-5 text-sm font-semibold text-[var(--muted)]">{t.notebookEmpty}</p>}
      <div className="grid gap-6">
        {groups.map((g) => (
          <section key={g.id} className="card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {g.title}
              </h2>
              <Link href={`/${locale}/opakovani?kurz=${g.id}`} className="btn-bouncy bg-[var(--brand-500)] px-3 py-1.5 text-sm font-bold text-white print:hidden">
                {t.practice}
              </Link>
            </div>
            <ol className="grid gap-4">
              {g.items.map((e, i) => (
                <li key={e.id} className="border-t border-[var(--edge)] pt-3 first:border-t-0 first:pt-0">
                  <p className="font-semibold">
                    {i + 1}. {e.prompt}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-bold text-[var(--accent-green)]">{t.correctAnswer}: </span>
                    {e.answer}
                  </p>
                  {e.explanation && <p className="mt-1 text-sm text-[var(--muted)]">{e.explanation}</p>}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
