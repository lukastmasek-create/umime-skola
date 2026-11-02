"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { LibraryHandle } from "@/lib/town3d/library3d";

export type LibrarySubjectInfo = {
  slug: string;
  color: string;
  emoji: string;
  label: string;
  count: number;
  topics: { slug: string; title: string; level: number }[];
};
export type LibraryText = { back: string; open: string; topics: string; levels: Record<number, string> };

// Materiály jako 3D knihovna, kterou lze procházet: klik na regál přiblíží kameru a témata předmětu se objeví
// jako hřbety knih. Cedule i hřbety jsou HTML odkazy a tlačítka (fungují i bez myši, Esc vrací do místnosti).
export function MaterialsLibrary({ locale, subjects, text }: { locale: string; subjects: LibrarySubjectInfo[]; text: LibraryText }) {
  const box = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const handle = useRef<LibraryHandle | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let h: LibraryHandle | null = null;
    let alive = true;
    void import("@/lib/town3d/library3d").then(({ createLibrary3D }) => {
      if (!alive) return;
      h = createLibrary3D(el, subjects, (slug) => setFocus(slug || null));
      if (!h) {
        el.parentElement?.classList.add("hidden");
        return;
      }
      handle.current = h;
      setReady(true);
      const els = new Map<string, HTMLElement>();
      layer.current?.querySelectorAll<HTMLElement>("[data-slug]").forEach((a) => els.set(a.dataset.slug!, a));
      h.labels((items) => {
        for (const it of items) {
          const a = els.get(it.slug);
          if (!a) continue;
          a.style.display = it.visible ? "" : "none";
          a.style.transform = `translate(${it.x}px, ${it.y}px) translate(-50%, -100%)`;
        }
      });
    });
    return () => {
      alive = false;
      handle.current = null;
      h?.dispose();
    };
  }, [subjects]);

  useEffect(() => {
    handle.current?.focus(focus);
  }, [focus, ready]);

  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFocus(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus]);

  const current = subjects.find((s) => s.slug === focus) ?? null;
  const levels = current ? [...new Set(current.topics.map((t) => t.level))].sort() : [];

  return (
    <div className="relative mb-10 overflow-hidden rounded-3xl border-2 border-[var(--edge)] shadow-[0_6px_0_var(--shadow-ink)]" style={{ aspectRatio: "16 / 9", minHeight: 420 }}>
      <div ref={box} className="absolute inset-0 bg-[#2a1e18]" />
      <div ref={layer} className="pointer-events-none absolute inset-0">
        {subjects.map((s) => (
          <button key={s.slug} type="button" data-slug={s.slug} onClick={() => setFocus(s.slug)} className="library-sign" style={{ display: "none", borderColor: s.color }}>
            <span aria-hidden>{s.emoji}</span> {s.label}
            <span className="block text-[10px] font-semibold opacity-70">{s.count}</span>
          </button>
        ))}
      </div>
      {current && (
        <div className="library-shelf" role="region" aria-label={current.label}>
          <div className="library-shelf-head">
            <button type="button" onClick={() => setFocus(null)} className="library-shelf-back">
              ← {text.back}
            </button>
            <strong className="min-w-0 flex-1 truncate text-center" style={{ color: current.color }}>
              <span aria-hidden>{current.emoji}</span> {current.label} · {text.topics}: {current.count}
            </strong>
            <Link href={`/${locale}/materialy/${current.slug}`} className="library-shelf-back">
              {text.open} →
            </Link>
          </div>
          <div className="library-shelf-books">
            {levels.map((level) => (
              <div key={level} className="library-shelf-row">
                <span className="library-shelf-level">{text.levels[level]}</span>
                {current.topics
                  .filter((t) => t.level === level)
                  .map((t, i) => (
                    <Link key={t.slug} href={`/${locale}/materialy/${current.slug}/${t.slug}`} className="library-spine" style={{ background: current.color, filter: `hue-rotate(${(i % 5) * 7 - 14}deg) brightness(${1 - (i % 3) * 0.08})` }}>
                      {t.title}
                    </Link>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
