"use client";

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/rewards/odznak_zlato.webp" alt="" width={44} height={44} draggable={false} />
          <b>{level}</b>
        </span>
        <div className="hs-grow">
          <div className="hs-label">{real ? `${h.progressLevel} ${real.level}` : t.progressTitle}</div>
          <div className="hs-bar"><span style={{ width: `${percent}%` }} /></div>
        </div>
      </div>
      <div className="hs-row hs-streak">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/rewards/mince.webp" alt="" width={22} height={22} draggable={false} />
        <span className="hs-label">
          {`${h.progressPoints}: ${real ? real.points : 1240}`}
        </span>
      </div>
      {real && <div className="hs-sub">{fill(h.progressNext, real.neededForNext - real.intoLevel)}</div>}
    </div>
  );
}
