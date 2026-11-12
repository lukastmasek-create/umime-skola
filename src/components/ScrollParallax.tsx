"use client";

import { useEffect } from "react";

// Parallax napříč sekcemi: nadpisy sekcí, karty a dekorativní prvky přímo pod sekcí
// se při scrollu posouvají jinou rychlostí než stránka. Používá vlastnost `translate`,
// takže nepřepisuje `transform` (náklon karet, vjezd, tlačítka). Vypíná se při
// prefers-reduced-motion i přepínači Animace v nastavení. Nic nemění rozložení.

const TARGETS = "main h2, main section > [aria-hidden='true']:not(.px-stars), main .gc-item";
const MAX_SHIFT = 120; // px

// Rozdíl rychlostí: čím vyšší koeficient, tím víc se prvek posune proti scrollu.
function factorFor(el: HTMLElement): number {
  if (el.tagName === "H2") return 0.22;
  if (el.classList.contains("gc-item")) return 0.12;
  return 0.45; // dekorace
}

function motionOff(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "off";
}

export function ScrollParallax() {
  useEffect(() => {
    if (motionOff()) return;

    let raf = 0;
    const touched = new Set<HTMLElement>();

    function update() {
      raf = 0;
      if (motionOff()) return;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return; // mimo obrazovku, nic nepočítám
        const offset = r.top + r.height / 2 - vh / 2;
        const shift = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, -offset * factorFor(el)));
        el.style.translate = `0 ${shift.toFixed(1)}px`;
        touched.add(el);
      });
    }

    function schedule() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
      touched.forEach((el) => {
        el.style.translate = "";
      });
    };
  }, []);

  return null;
}
