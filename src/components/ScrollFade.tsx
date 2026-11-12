"use client";

import { useEffect } from "react";

// Celé bloky obsahu (karty, nadpisy, odstavce, obrázky) se při scrollu plně objeví, když vjedou
// do obrazovky, a plně zmizí, když z ní vyjedou. Běží na celé stránce a řídí průhlednost, posun
// a měřítko přes inline styly. Vlastní vjezdy (sm-in, reveal) jsou pro tyto bloky vypnuté v CSS,
// aby se s tímto efektem nepraly. Při prefers-reduced-motion i přepínači Animace se nic nedělá.
//
// Výkon: nejdřív se přečtou všechny souřadnice (jedno přepočítání rozložení), až potom se zapisují
// styly, a jen ty, jejichž hodnota se změnila. Seznam bloků se znovu hledá s prodlevou, ne při
// každé změně DOM (animované texty a čítadla mění DOM téměř pořád).

// Nejvyšší bloky obsahu uvnitř <main>; vnořené prvky se řídí rodičem.
const CANDIDATES = "main :is(.card, .gc-item, .gcard, h1, h2, h3, p, figure, img, canvas, form, table, blockquote)";
const FADE_BAND = 0.35; // podíl výšky okna, přes který se blok rozsvěcí a zhasíná
const SLIDE = 28; // px, o kolik blok při zhasínání ujede
const EPS = 0.002; // nejmenší změna průhlednosti, která se ještě zapíše
const RECOLLECT_DELAY = 250; // ms, prodleva před novým hledáním bloků po změně DOM

function motionOff(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "off";
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function ScrollFade() {
  useEffect(() => {
    if (motionOff()) return;

    let targets: HTMLElement[] = [];
    let raf = 0;
    let needsCollect = true;
    let recollectTimer = 0;
    const lastOpacity = new Map<HTMLElement, number>();

    function resetStyles(el: HTMLElement) {
      el.style.opacity = "";
      el.style.translate = "";
      el.style.scale = "";
      delete el.dataset.sf;
      lastOpacity.delete(el);
    }

    function collect() {
      needsCollect = false;
      const found: HTMLElement[] = [];
      document.querySelectorAll<HTMLElement>(CANDIDATES).forEach((el) => {
        // Bereme jen nejvyšší blok, vnořené prvky (např. text uvnitř karty) jedou s ním.
        if (el.parentElement?.closest(CANDIDATES)) return;
        const pos = getComputedStyle(el).position;
        if (pos === "fixed" || pos === "sticky") return; // lepicí lišty nechám být
        found.push(el);
        el.dataset.sf = "1";
      });
      // Bloky, které už nejsou mezi cíli, vrátím do původního stavu.
      const keep = new Set(found);
      for (const el of targets) if (!keep.has(el)) resetStyles(el);
      targets = found;
    }

    function update() {
      raf = 0;
      if (motionOff()) return;
      if (needsCollect) collect();
      const vh = window.innerHeight;
      const band = vh * FADE_BAND;
      const n = targets.length;
      const tops = new Float64Array(n);
      const bottoms = new Float64Array(n);

      // 1) Jen čtení: prohlížeč přepočítá rozložení jednou, místo jednou pro každý blok.
      for (let i = 0; i < n; i++) {
        const r = targets[i].getBoundingClientRect();
        tops[i] = r.top;
        bottoms[i] = r.bottom;
      }

      // 2) Jen zápisy, a jen tam, kde se průhlednost od minula změnila.
      for (let i = 0; i < n; i++) {
        const el = targets[i];
        if (!el.isConnected) continue;
        const top = tops[i];
        // Vjezd zdola: blok se rozsvěcí, jakmile jeho horní hrana vstoupí do pásma u spodního okraje.
        const enter = clamp01((vh - top) / band);
        // Výjezd nahoru: blok zhasne, jakmile jeho spodní hrana opustí pásmo u horního okraje.
        const exit = clamp01(bottoms[i] / band);
        const p = Math.min(enter, exit);
        const e = p * p * (3 - 2 * p); // jemné rozběhnutí a dojezd
        const prev = lastOpacity.get(el);
        if (prev !== undefined && Math.abs(prev - e) < EPS) continue;
        lastOpacity.set(el, e);
        const dir = top > vh / 2 ? 1 : -1; // při výjezdu ujede nahoru, při vjezdu přichází zdola
        el.style.opacity = e.toFixed(3);
        el.style.translate = `0 ${((1 - e) * SLIDE * dir).toFixed(1)}px`;
        el.style.scale = (0.96 + 0.04 * e).toFixed(3);
      }
    }

    function schedule(recollect = false) {
      if (recollect) needsCollect = true;
      if (!raf) raf = requestAnimationFrame(update);
    }

    const onScroll = () => schedule();
    const onResize = () => schedule(true);
    const mo = new MutationObserver(() => {
      if (recollectTimer) return;
      recollectTimer = window.setTimeout(() => {
        recollectTimer = 0;
        schedule(true);
      }, RECOLLECT_DELAY);
    });
    const main = document.querySelector("main");

    schedule(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    if (main) mo.observe(main, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(recollectTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      mo.disconnect();
      targets.forEach(resetStyles);
      targets = [];
    };
  }, []);

  return null;
}
