"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { tr8, type Locale } from "@/i18n/config";

const copy = tr8("O krok dál na cestě", "One step farther", "Einen Schritt weiter", "Ещё один шаг", "Ще один крок", "一歩前へ", "Un paso más", "Un pas de plus");

export function CompletionJourney({ locale, xp, levelComplete = false }: { locale: Locale; xp: number; levelComplete?: boolean }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion() || xp <= 0) {
      const immediate = window.setTimeout(() => setShown(xp), 0);
      return () => window.clearTimeout(immediate);
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 850);
      setShown(Math.round(xp * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [xp]);

  return (
    <div className="completion-journey" aria-label={`${copy[locale]} · +${xp} XP`}>
      <p className="completion-journey-title">{copy[locale]}</p>
      <div className="completion-journey-track" aria-hidden="true">
        <span className="completion-journey-line" />
        {[0, 1, 2, 3].map((stop) => <span key={stop} className={`completion-journey-stop ${stop <= 1 ? "is-reached" : ""}`} style={{ left: `${stop * 33.333}%` }} />)}
        <svg className="completion-journey-rocket" viewBox="0 0 48 48" fill="none"><path d="M12 31c2-14 14-23 28-24-1 14-10 26-24 28l-4-4Z" fill="#fff" stroke="#16132b" strokeWidth="2.5"/><circle cx="29" cy="19" r="4" fill="#78d9ef" stroke="#16132b" strokeWidth="2"/><path d="m15 28-8-1 5-7 7 2m3 11 2 7 7-5-2-7M12 34c-4 2-5 5-5 8 3 0 6-2 8-6" fill="#ffb75e" stroke="#16132b" strokeWidth="2" strokeLinejoin="round"/></svg>
      </div>
      <span className="completion-journey-xp" aria-hidden="true">+{shown} XP{levelComplete ? " ★" : ""}</span>
    </div>
  );
}
