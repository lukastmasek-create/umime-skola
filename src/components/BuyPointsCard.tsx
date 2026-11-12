"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { PcardTape } from "@/components/PcardArt";
import type { Dictionary } from "@/i18n/dictionaries";

// Balíček bodů jako ručně lepená karta, stejný styl jako karty kategorií na homepage (pcard).
export function BuyPointsCard({
  pkg,
  dict,
  accent,
  tilt,
}: {
  pkg: { points: number; price: string; popular: boolean; image: string };
  dict: Dictionary;
  accent: string;
  tilt: number;
}) {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="pcard-slot" style={{ ["--ac" as string]: accent, ["--r" as string]: `${tilt}deg` }}>
      <div className="pcard pcard-shop">
        <div className="pcard-in">
          <Icon name={`balicek-${pkg.image}`} size={150} className="pcard-shop-img" />
          <h3 className="pcard-title">{pkg.points}</h3>
          <p className="pcard-text">{dict.shop.pointsSuffix}</p>
          <p className="pcard-price">{pkg.price}</p>
          <button type="button" onClick={() => setClicked(true)} className="pcard-buy">
            {dict.shop.buyButton}
          </button>
          {clicked && <p className="pcard-text pcard-soon">{dict.shop.comingSoon}</p>}
        </div>
        <PcardTape />
        {pkg.popular && <span className="pcard-sticker">{dict.shop.mostPopular}</span>}
      </div>
    </div>
  );
}
