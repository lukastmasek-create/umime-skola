"use client";

import { HeroStrip } from "@/components/HeroStrip";
import { useAccount } from "@/lib/use-account";
import { fill } from "@/i18n/profile";
import { getHomeText } from "@/i18n/home";
import type { Locale } from "@/i18n/config";

// Karta „Tvůj postup“ v hero: přihlášenému ukáže skutečnou úroveň, postup a body,
// ostatním ukázková data.
export function HeroProgressCard({ t, locale }: { t: { progressTitle: string }; locale: Locale }) {
  const [account] = useAccount();
  const h = getHomeText(locale);
  const real = account && account.loggedIn ? account : null;
  const level = real ? real.level : 7;
  const percent = real ? real.percent : 68;
  return (
    <div className="hs-card hs-progress space-float">
      <div className="hs-row">
        <span className="hs-level">
          <HeroStrip src="/home/hero3d/odznak.webp" frames={16} size={52} seconds={5} />
          <b>{level}</b>
        </span>
        <div className="hs-grow">
          <div className="hs-label">{real ? `${h.progressLevel} ${real.level}` : t.progressTitle}</div>
          <div className="hs-bar"><span style={{ width: `${percent}%` }} /></div>
        </div>
      </div>
      <div className="hs-row hs-streak">
        <HeroStrip src="/home/hero3d/mince.webp" frames={16} size={26} seconds={4} />
        <span className="hs-label">
          {`${h.progressPoints}: ${real ? real.points : 1240}`}
        </span>
      </div>
      {real && <div className="hs-sub">{fill(h.progressNext, real.neededForNext - real.intoLevel)}</div>}
    </div>
  );
}
