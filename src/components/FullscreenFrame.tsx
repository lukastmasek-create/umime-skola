"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";

const TEXT: Record<Locale, { enter: string; exit: string; back: string }> = {
  cs: { enter: "Celá obrazovka", exit: "Zavřít celou obrazovku", back: "Zpět na kurz" },
  en: { enter: "Full screen", exit: "Exit full screen", back: "Back to course" },
  de: { enter: "Vollbild", exit: "Vollbild beenden", back: "Zurück zum Kurs" },
  ru: { enter: "На весь экран", exit: "Выйти из полноэкранного режима", back: "Назад к курсу" },
};

// Obal hry: tlačítko „Celá obrazovka“ roztáhne na celou obrazovku celý obal (hru, ovládací tlačítka,
// vysvětlení i výsledky), takže všechno zůstane uvnitř. Prohlížeče bez Fullscreen API (iPhone) dostanou
// záložní režim: obal přes celé okno. Esc ukončí režim v obou případech.
export function FullscreenFrame({ locale, children, backHref }: { locale: Locale; children: React.ReactNode; backHref?: string }) {
  const t = TEXT[locale];
  const ref = useRef<HTMLDivElement>(null);
  const [native, setNative] = useState(false);
  const [fallback, setFallback] = useState(false);
  const active = native || fallback;

  useEffect(() => {
    const onChange = () => {
      const on = document.fullscreenElement === ref.current;
      setNative(on);
      if (!on) screen.orientation?.unlock?.();
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!fallback) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFallback(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [fallback]);

  const toggle = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    if (fallback) return setFallback(false);
    if (document.fullscreenElement) return void document.exitFullscreen().catch(() => {});
    if (el.requestFullscreen) {
      try {
        await el.requestFullscreen();
        // Mobil: akční hry se hrají na šířku. Zámek podporuje jen Android; jinde se tiše přeskočí.
        if (window.matchMedia("(pointer: coarse)").matches && el.querySelector(".fs-game")) {
          (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> })?.lock?.("landscape")?.catch(() => {});
        }
        return;
      } catch {
        // zamítnuto prohlížečem: použijeme záložní režim
      }
    }
    setFallback(true);
  }, [fallback]);

  return (
    <div ref={ref} className={`fs-frame ${active ? "is-fs" : ""} ${fallback ? "is-fs-fallback" : ""}`}>
      <div className="fs-inner">
        {/* Ve fullscreenu tlačítko plave nad hrou (nesjede při posouvání a panely ho nepřekryjí). */}
        <div className={active ? "fs-bar flex gap-2" : "mb-2 flex items-center justify-between gap-2"}>
          {backHref && (
            <Link
              href={backHref}
              className={`btn-bouncy rounded-full border-2 px-3 py-1.5 text-xs font-semibold ${
                active ? "border-white/40 bg-black/70 text-white shadow-lg" : "border-[var(--border-soft)] bg-[var(--surface)]"
              }`}
            >
              ← {t.back}
            </Link>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-pressed={active}
            className={`btn-bouncy rounded-full border-2 px-3 py-1.5 text-xs font-semibold ${
              active ? "border-white/40 bg-black/70 text-white shadow-lg" : "border-[var(--border-soft)] bg-[var(--surface)]"
            }`}
          >
            {active ? `✕ ${t.exit}` : `⛶ ${t.enter}`}
          </button>
        </div>
        {active && <div aria-hidden className="h-9 shrink-0" />}
        {children}
      </div>
    </div>
  );
}
