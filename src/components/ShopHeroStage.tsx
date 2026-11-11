"use client";

import { useEffect, useRef } from "react";

// Kosmonaut z 3D snímků (public/home/obchod): je zaseknutý uvnitř rámu karty, zapne trysky v botách,
// prorazí rám, přeletí a usedne na zbytek horní hrany; potom se smyčkou houpe a mává.
// Pohyb po dráze počítá rAF (plynulých 60 fps), pózu a plamen nesou snímky (30 fps úvod, 24 fps smyčka).
// Čas probourání rámu řídí třídy na kartě: is-cracking (pavučina trhlin) a is-broken (zubatá díra).
const D = 280; // velikost snímku na stránce
const INTRO = { src: "/home/obchod/kosmonaut-intro.webp", n: 150, cols: 15, rows: 10, fps: 30 } as const;
const LOOP = { src: "/home/obchod/kosmonaut-smycka.webp", n: 89, cols: 10, rows: 9, fps: 24 } as const;
const FEET = 0.58 * D; // výška chodidel ve snímku
const CRACK_AT = 2.35;
const BREAK_AT = 3.05;
const INTRO_END = 5.0;
// Dráha chodidel vůči pravému hornímu rohu karty: [čas, vzdálenost zprava, y shora]
const PATH: [number, number, number][] = [
  [0, 200, 340], [2.2, 200, 340], [2.9, 200, 318], [3.05, 200, 268], [3.5, 204, 60], [4.2, 270, -150], [4.8, 470, 26], [5.0, 470, 26],
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
    const prev = PATH[Math.max(0, k - 1)], next = PATH[Math.min(n - 1, k + 1)];
    const dt = next[0] - prev[0] || 1;
    return (next[c] - prev[c]) / dt;
  };
  const h = t1 - t0, u = (t - t0) / h;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  return [
    h00 * x0 + h10 * h * tan(i, 1) + h01 * x1 + h11 * h * tan(i + 1, 1),
    h00 * y0 + h10 * h * tan(i, 2) + h01 * y1 + h11 * h * tan(i + 1, 2),
  ];
}

export function ShopHeroStage() {
  const box = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = box.current;
    const card = el?.closest<HTMLElement>(".gs-hero-card");
    if (!el || !card) return;
    const wide = window.matchMedia("(min-width: 900px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0, stopped = false, started = false;

    const place = (xr: number, y: number) => {
      el.style.right = `${xr - D / 2}px`;
      el.style.top = `${y - FEET}px`;
    };
    const frame = (s: typeof INTRO | typeof LOOP, i: number) => {
      const c = i % s.cols, r = Math.floor(i / s.cols);
      el.style.backgroundImage = `url(${s.src})`;
      el.style.backgroundSize = `${s.cols * 100}% ${s.rows * 100}%`;
      el.style.backgroundPosition = `${(c / (s.cols - 1)) * 100}% ${(r / (s.rows - 1)) * 100}%`;
    };
    const finalPose = () => {
      card.classList.add("is-broken");
      place(PATH[PATH.length - 1][1], PATH[PATH.length - 1][2]);
      frame(LOOP, 0);
      el.style.opacity = "1";
    };

    const run = () => {
      if (started || stopped) return;
      started = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        if (stopped) return;
        const t = (now - t0) / 1000;
        if (t >= CRACK_AT) card.classList.add("is-cracking");
        if (t >= BREAK_AT) { card.classList.add("is-broken"); card.classList.remove("is-cracking"); }
        if (t < INTRO_END) {
          const [xr, y] = pathAt(t);
          place(xr, y);
          frame(INTRO, Math.min(INTRO.n - 1, Math.floor(t * INTRO.fps)));
        } else {
          place(PATH[PATH.length - 1][1], PATH[PATH.length - 1][2]);
          frame(LOOP, Math.floor((t - INTRO_END) * LOOP.fps) % LOOP.n);
        }
        el.style.opacity = "1";
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const begin = () => {
      if (!wide.matches) return;
      if (reduced.matches) { finalPose(); return; }
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); run(); } }, { threshold: 0.35 });
      io.observe(card);
      cleanups.push(() => io.disconnect());
    };
    const cleanups: (() => void)[] = [];
    // snímky se nejdřív stáhnou, ať animace nezačne prázdná
    let pending = 2;
    for (const s of [INTRO, LOOP]) {
      const im = new Image();
      im.onload = im.onerror = () => { if (--pending === 0 && !stopped) begin(); };
      im.src = s.src;
    }
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((f) => f());
      card.classList.remove("is-cracking", "is-broken");
    };
  }, []);

  return <span ref={box} aria-hidden className="gs-stage" style={{ width: D, height: D }} />;
}
