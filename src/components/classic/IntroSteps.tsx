"use client";

import { getClassicText } from "@/i18n/classic";
import type { Locale } from "@/i18n/config";

// Tři kroky s ikonou pro úvod akčních her: přečti, ovládej, sleduj barvu. Prostřední krok je ovládání dané hry.
export function IntroSteps({ locale, controls, light = false }: { locale: string; controls: string; light?: boolean }) {
  const t = getClassicText((locale as Locale) ?? "cs");
  const steps = t.introSteps ?? getClassicText("en").introSteps ?? ["", ""];
  // Na malé obrazovce stačí první věta ovládání.
  const short = controls.replace(/^[^:]{1,15}:\s*/, "").split(/(?<=[.!?])\s|,\s/)[0].replace(/[.,]$/, "");
  const items = [
    { icon: "👀", text: steps[0] },
    { icon: "👆", text: short },
    { icon: "✅", text: steps[1] },
  ];
  return (
    <div className="grid w-full max-w-2xl grid-cols-3 gap-2">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-1 rounded-2xl p-2 text-center text-[11px] font-bold leading-tight sm:text-sm"
          style={light ? { background: "#f1effb", color: "#16132b" } : { background: "rgba(27,24,64,0.85)", border: "2px solid rgba(255,255,255,0.28)", color: "#fff" }}
        >
          <span className="text-2xl leading-none sm:text-3xl" aria-hidden>
            {it.icon}
          </span>
          <span>{it.text}</span>
        </div>
      ))}
    </div>
  );
}
