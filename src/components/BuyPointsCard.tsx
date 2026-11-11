"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import type { Dictionary } from "@/i18n/dictionaries";

export function BuyPointsCard({
  pkg,
  dict,
}: {
  pkg: { points: number; price: string; popular: boolean; image: string };
  dict: Dictionary;
}) {
  const [clicked, setClicked] = useState(false);

  return (
    <div
      className={`group card card-hover relative flex flex-col items-center gap-2 p-6 text-center ${
        pkg.popular ? "border-[var(--brand-500)]" : ""
      }`}
    >
      {pkg.popular && (
        <span className="pill absolute -top-3 bg-[var(--brand-500)] px-3 py-1 text-white">
          {dict.shop.mostPopular}
        </span>
      )}
      <Icon name={`balicek-${pkg.image}`} size={176} className="-mt-2 drop-shadow-[0_6px_6px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" />
      <p className="text-2xl font-bold">{pkg.points}</p>
      <p className="text-sm text-[var(--faint)]">{dict.shop.pointsSuffix}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--brand-600)]">{pkg.price}</p>
      <button
        onClick={() => setClicked(true)}
        className="btn-bouncy mt-3 w-full rounded-full bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-600)]"
      >
        {dict.shop.buyButton}
      </button>
      {clicked && (
        <p className="text-xs text-[var(--faint)]">{dict.shop.comingSoon}</p>
      )}
    </div>
  );
}
