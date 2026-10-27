"use client";

import { useEffect, useState } from "react";
import { AnimatedArt } from "./SpaceDecor";

// Slunce nebo měsíc podle hodiny v prohlížeči. Rodičovské sekci nastaví `data-time`, podle kterého CSS
// ve dne schová světlušky a večer je rozsvítí. Do načtení je den (stejné vykreslení na serveru i v prohlížeči).
export function NatureSky() {
  const [night, setNight] = useState(false);
  useEffect(() => {
    const hour = new Date().getHours();
    const isNight = hour >= 19 || hour < 6;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNight(isNight);
    const zone = document.querySelector(".zone-nature");
    zone?.setAttribute("data-time", isNight ? "night" : "day");
  }, []);
  return (
    <div aria-hidden className="sky-body pointer-events-none absolute right-[8%] top-4 z-0 hidden sm:block">
      <AnimatedArt name={night ? "mesic" : "slunce"} height={night ? 96 : 92} />
    </div>
  );
}
