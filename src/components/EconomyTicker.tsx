"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { getEconomyTickerText, TICKER_VERSION } from "@/i18n/economy-ticker";
import type { Locale } from "@/i18n/config";

const DISMISS_KEY = "umime:ticker-dismissed";

function read() {
  try {
    return localStorage.getItem(DISMISS_KEY);
  } catch {
    return null;
  }
}

function write(value: string) {
  try {
    localStorage.setItem(DISMISS_KEY, value);
  } catch {
    // bez úložiště se lišta jen znovu objeví po načtení stránky
  }
}

// Lišta s tržními zprávami pod hlavičkou na všech stránkách. Zprávy se posouvají (pauza najetím myši),
// při vypnutých animacích zůstanou statické a dají se odscrollovat. Zavřená lišta se nepamatuje jen
// do změny TICKER_VERSION. Bez localStorage se lišta prostě ukáže znovu po každém načtení.
const noSubscribe = () => () => {};

export function EconomyTicker({ locale }: { locale: Locale }) {
  const t = getEconomyTickerText(locale);
  // Na serveru i při hydrataci se lišta skryje; po načtení v prohlížeči se ukáže, pokud ji hráč nezavřel.
  const dismissedBefore = useSyncExternalStore(
    noSubscribe,
    () => read() === TICKER_VERSION,
    () => true,
  );
  const [closed, setClosed] = useState(false);

  if (dismissedBefore || closed) return null;

  // Zprávy jsou dvakrát za sebou, aby posun o polovinu šířky navazoval bez skoku.
  const duration = Math.max(40, t.items.length * 12);

  return (
    <div
      role="region"
      aria-label={t.label}
      className="border-b-2 border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-1.5 text-sm font-semibold sm:px-6">
        <span className="shrink-0 rounded-md border-2 border-[var(--edge)] bg-[#16132b] px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[var(--accent-yellow)]">
          {t.label}
        </span>
        <div className="econ-ticker min-w-0 flex-1">
          <div className="econ-ticker-track" style={{ animationDuration: `${duration}s` }}>
            <div className="econ-ticker-group">
              {t.items.map((item) => (
                <span key={item} className="econ-ticker-item">
                  {item}
                </span>
              ))}
            </div>
            <div className="econ-ticker-group" aria-hidden>
              {t.items.map((item) => (
                <span key={item} className="econ-ticker-item">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        <span className="hidden shrink-0 text-xs font-medium opacity-80 md:inline">({t.disclaimer})</span>
        <Link href={`/${locale}/stale-hry/ekonomika`} className="shrink-0 underline">
          {t.open}
        </Link>
        <button
          type="button"
          aria-label={t.dismiss}
          onClick={() => {
            write(TICKER_VERSION);
            setClosed(true);
          }}
          className="shrink-0 px-1 leading-none"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
