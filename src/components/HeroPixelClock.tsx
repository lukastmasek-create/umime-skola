"use client";

import { useEffect } from "react";
import { heroPhase } from "@/lib/hero-phase";

// Drží data-time na pixelovém pozadí aktuální (po klientské navigaci a při dlouho otevřené stránce).
export function HeroPixelClock() {
  useEffect(() => {
    const apply = () => {
      const el = document.querySelector(".hero-pixel");
      if (!el) return;
      const q = new URLSearchParams(window.location.search).get("hero");
      el.setAttribute("data-time", heroPhase(new Date().getHours(), q));
    };
    apply();
    const id = window.setInterval(apply, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);
  return null;
}
