"use client";

import { useEffect, useState } from "react";

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
  return <div aria-hidden className={`sky-body pointer-events-none absolute right-[8%] top-6 z-0 hidden sm:block ${night ? "sky-moon" : "sky-sun"}`} />;
}
