"use client";

import { useEffect, useRef } from "react";

// Kosmonaut z 3D snímků (public/home/obchod): je zaseknutý uvnitř rámu karty, dvakrát se pokusí vyskočit, zatrne,
// dostane nápad, zapne trysky v botách, prorazí rám (výbuch, střepy, jiskry a kouř jsou druhá sekvence snímků),
// přeletí a usedne na zbytek horní hrany; potom se smyčkou houpe a mává.
// Pohyb po dráze počítá rAF (plynulých 60 fps), pózu, plamen a kouř nesou snímky (40 fps úvod, 30 fps smyčka).
// Čas probourání rámu řídí třídy na kartě: is-crack1..3 (trhliny), is-broken (zubatá díra), gs-hit / gs-quake (otřes).
const D = 300; // velikost snímku kosmonauta na stránce
type Sheet = { src: string; n: number; cols: number; rows: number };
const INTRO_SHEETS: Sheet[] = [1, 2, 3, 4, 5].map((i) => ({ src: `/home/obchod/kosmonaut-intro-${i}.webp`, n: 56, cols: 7, rows: 8 }));
const LOOP_SHEETS: Sheet[] = [1, 2].map((i) => ({ src: `/home/obchod/kosmonaut-smycka-${i}.webp`, n: 60, cols: 10, rows: 6 }));
const BURST: Sheet = { src: "/home/obchod/kosmonaut-vybuch.webp", n: 84, cols: 7, rows: 12 };
const INTRO_FPS = 40, LOOP_FPS = 30, BURST_FPS = 30;
const INTRO_END = 7.0;
// Výkon trysek podle snímku (vyčteno z renderu): řídí oranžové světlo na kartě a prosvítání ohně trhlinami.
const FLAME = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.22,0.39,0.34,0.29,0.26,0.22,0.19,0.16,0.2,0.24,0.28,0.32,0.36,0.4,0.45,0.49,0.53,0.57,0.61,0.65,0.68,0.71,0.74,0.76,0.78,0.79,0.8,0.8,0.8,0.8,0.8,0.8,0.81,0.82,0.84,0.85,0.86,0.88,0.89,0.9,0.91,0.92,0.94,0.95,0.96,0.98,0.99,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.99,0.98,0.97,0.95,0.93,0.91,0.88,0.85,0.83,0.79,0.76,0.73,0.7,0.67,0.64,0.61,0.57,0.55,0.52,0.49,0.47,0.45,0.43,0.42,0.41,0.12,0.01,0.34,0.18,0.08,0.28,0.02,0.04,0.11,0.01,0.05,0.01,0,0,0,0,0,0,0,0,0,0,0,0,0];
const BREAK_AT = 4.5;
const HITS = [1.22, 1.85]; // nárazy hlavou do horní hrany
const CRACK3_AT = 3.7;
const FEET = 0.58 * D; // výška chodidel ve snímku
// Dráha chodidel vůči pravému hornímu rohu karty: [čas, vzdálenost zprava, y shora, hold]. hold = nulová rychlost v klíči.
const PATH: [number, number, number, number][] = [
  [0, 200, 215, 1], [0.9, 200, 215, 1], [1.05, 200, 224, 1], [1.22, 200, 150, 1], [1.38, 200, 164, 1], [1.55, 200, 215, 1], [1.7, 200, 224, 1], [1.85, 200, 148, 1],
  [2.0, 200, 162, 1], [2.2, 200, 215, 1], [4.3, 200, 215, 1], [4.5, 204, 150, 0], [4.9, 210, -80, 0], [5.5, 300, -200, 0], [6.2, 470, 26, 1], [7.0, 470, 26, 1],
];

function pathAt(t: number): [number, number] {
  const n = PATH.length;
  if (t <= PATH[0][0]) return [PATH[0][1], PATH[0][2]];
  if (t >= PATH[n - 1][0]) return [PATH[n - 1][1], PATH[n - 1][2]];
  let i = 0;
  while (t > PATH[i + 1][0]) i++;
  const [t0, x0, y0] = PATH[i];
  const [t1, x1, y1] = PATH[i + 1];
  const tan = (k: number, c: 1 | 2) => {
    if (PATH[k][3]) return 0;
    const prev = PATH[Math.max(0, k - 1)], next = PATH[Math.min(n - 1, k + 1)];
    return (next[c] - prev[c]) / (next[0] - prev[0] || 1);
  };
  const h = t1 - t0, u = (t - t0) / h;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  return [
    h00 * x0 + h10 * h * tan(i, 1) + h01 * x1 + h11 * h * tan(i + 1, 1),
    h00 * y0 + h10 * h * tan(i, 2) + h01 * y1 + h11 * h * tan(i + 1, 2),
  ];
}

// Globální číslo snímku -> list + pozice v listu
function pick(sheets: Sheet[], idx: number): { sheet: Sheet; c: number; r: number } {
  let k = 0, i = idx;
  while (k < sheets.length - 1 && i >= sheets[k].n) { i -= sheets[k].n; k++; }
  const s = sheets[k];
  return { sheet: s, c: i % s.cols, r: Math.floor(i / s.cols) };
}
function paint(el: HTMLElement, sheets: Sheet[], idx: number) {
  const { sheet, c, r } = pick(sheets, idx);
  el.style.backgroundImage = `url(${sheet.src})`;
  el.style.backgroundSize = `${sheet.cols * 100}% ${sheet.rows * 100}%`;
  el.style.backgroundPosition = `${(c / (sheet.cols - 1)) * 100}% ${(r / (sheet.rows - 1)) * 100}%`;
}
const total = (s: Sheet[]) => s.reduce((a, b) => a + b.n, 0);

export function ShopHeroStage() {
  const box = useRef<HTMLSpanElement>(null);
  const burst = useRef<HTMLSpanElement>(null);
  const glow = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = box.current, bu = burst.current, gl = glow.current;
    const card = el?.closest<HTMLElement>(".gs-hero-card");
    if (!el || !bu || !card) return;
    const wide = window.matchMedia("(min-width: 900px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0, stopped = false, started = false;
    const timers: number[] = [];
    const cleanups: (() => void)[] = [];
    const shake = (cls: string, ms: number) => {
      card.classList.remove("gs-hit", "gs-quake");
      void card.offsetWidth;
      card.classList.add(cls);
      timers.push(window.setTimeout(() => card.classList.remove(cls), ms));
    };
    const place = (xr: number, y: number) => {
      el.style.right = `${xr - D / 2}px`;
      el.style.top = `${y - FEET}px`;
    };
    const last = PATH[PATH.length - 1];

    const run = () => {
      if (started || stopped) return;
      started = true;
      const t0 = performance.now();
      const fired = new Set<string>();
      const once = (k: string, f: () => void) => { if (!fired.has(k)) { fired.add(k); f(); } };
      const introN = total(INTRO_SHEETS), loopN = total(LOOP_SHEETS), burstN = BURST.n;
      const tick = (now: number) => {
        if (stopped) return;
        const t = (now - t0) / 1000;
        if (t >= HITS[0]) once("c1", () => { card.classList.add("is-crack1"); shake("gs-hit", 260); });
        if (t >= HITS[1]) once("c2", () => { card.classList.add("is-crack2"); shake("gs-hit", 320); });
        if (t >= CRACK3_AT) once("c3", () => card.classList.add("is-crack3"));
        if (t >= BREAK_AT) once("br", () => {
          card.classList.add("is-broken");
          shake("gs-quake", 700);
          bu.style.opacity = "1";
        });
        if (t >= BREAK_AT) {
          const bi = Math.floor((t - BREAK_AT) * BURST_FPS);
          if (bi < burstN) paint(bu, [BURST], bi); else bu.style.opacity = "0";
        }
        if (t < INTRO_END) {
          const [xr, y] = pathAt(t);
          place(xr, y);
          const fi = Math.min(introN - 1, Math.floor(t * INTRO_FPS));
          paint(el, INTRO_SHEETS, fi);
          // světlo ohně na kartě (posouvá se s kosmonautem), prosvítání trhlinami a jejich postupné plazení
          const fl = FLAME[fi] ?? 0;
          if (gl) { gl.style.right = `${xr - 260}px`; gl.style.top = `${y - 230}px`; gl.style.opacity = String(Math.min(1, fl * 1.1)); }
          card.style.setProperty("--leak", fl.toFixed(2));
          card.style.setProperty("--bulge", String(t < BREAK_AT ? Math.min(1, Math.max(0, (t - 3.5) / 1.0)) : 0));
          card.style.setProperty("--cp3", String(Math.min(1, Math.max(0, (t - CRACK3_AT) / (BREAK_AT - CRACK3_AT)) ** 0.8)));
          card.style.setProperty("--cp2", String(Math.min(1, Math.max(0, (t - HITS[1]) / 1.4))));
          card.style.setProperty("--cp1", String(Math.min(1, Math.max(0, (t - HITS[0]) / 0.9))));
        } else {
          place(last[1], last[2]);
          paint(el, LOOP_SHEETS, Math.floor((t - INTRO_END) * LOOP_FPS) % loopN);
          if (gl) gl.style.opacity = "0";
          card.style.setProperty("--leak", "0");
        }
        el.style.opacity = "1";
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const begin = () => {
      if (!wide.matches) return;
      if (reduced.matches) {
        card.classList.add("is-broken");
        place(last[1], last[2]);
        paint(el, LOOP_SHEETS, 0);
        el.style.opacity = "1";
        return;
      }
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); run(); } }, { threshold: 0.35 });
      io.observe(card);
      cleanups.push(() => io.disconnect());
    };
    // všechny listy se nejdřív stáhnou a dekódují, ať animace nezačne prázdná ani nebliká při přepnutí listu
    const all = [...INTRO_SHEETS, ...LOOP_SHEETS, BURST];
    let pending = all.length;
    for (const s of all) {
      const im = new Image();
      const done = () => { if (--pending === 0 && !stopped) begin(); };
      im.onload = () => { (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(done); };
      im.onerror = done;
      im.src = s.src;
    }
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      cleanups.forEach((f) => f());
      card.classList.remove("is-crack1", "is-crack2", "is-crack3", "is-broken", "gs-hit", "gs-quake");
      for (const v of ["--leak", "--bulge", "--cp1", "--cp2", "--cp3"]) card.style.removeProperty(v);
    };
  }, []);

  return (
    <>
      <span ref={glow} aria-hidden className="gs-fireglow" />
      <span ref={burst} aria-hidden className="gs-burst" />
      <span ref={box} aria-hidden className="gs-stage" style={{ width: D, height: D }} />
    </>
  );
}
