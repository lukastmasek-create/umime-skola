"use client";

import { useEffect } from "react";

// Při rolování se hlavička zkompaktní (menší odsazení, mírná průhlednost); jen přepíná atribut data-scrolled,
// o vzhled se stará globals.css, takže nevzniká žádné překreslování Reactu.
export function HeaderScroll() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!header) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      header.toggleAttribute("data-scrolled", window.scrollY > 24);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}
