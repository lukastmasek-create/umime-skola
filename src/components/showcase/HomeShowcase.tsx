"use client";

import "./showcase.css";
import type { HomeShowcaseText } from "@/i18n/home-showcase";
import { Dock, FillButton, Island, LivesCombo, Particles, Rewards, Ripples, Shortcuts, Ticker, Typing } from "./motion";
import { Folder, Loader } from "./effects";
import { DitherField } from "./widgets";

// Lampa (effects.tsx) a přehledy (LED displej, historie bodů, mapa aktivity, studijní čas v widgets.tsx)
// jsou připravené, ale na úvodní stránce zatím nejsou. Stačí je sem vrátit.

const heading = { fontFamily: "var(--font-heading)" };

export function HomeShowcase({ t }: { t: HomeShowcaseText }) {
  const c = t.cards;
  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6">
      <h2 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl" style={heading}>{t.title}</h2>
      <p className="mb-10 max-w-2xl text-white/75">{t.lead}</p>

      <h3 className="mb-4 text-lg font-bold text-[var(--accent-yellow)]" style={heading}>{t.groups.motion}</h3>
      <div className="sc-grid mb-12">
        <Ripples c={c} />
        <Particles c={c} />
        <Typing c={c} />
        <Ticker c={c} />
        <FillButton c={c} />
        <LivesCombo c={c} />
        <Rewards c={c} />
        <Dock c={c} />
        <Island c={c} />
        <Shortcuts c={c} />
      </div>

      <h3 className="mb-4 text-lg font-bold text-[var(--accent-yellow)]" style={heading}>{t.groups.effects}</h3>
      <div className="sc-grid mb-12">
        <Folder c={c} />
        <Loader c={c} />
        <DitherField c={c} />
      </div>
    </div>
  );
}
