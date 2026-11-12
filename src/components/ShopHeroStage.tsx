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
// Dráhy chodidel vůči pravému hornímu rohu karty (úvod; let a výskok jsou níž): [čas, vzdálenost zprava, y shora, hold]. hold = nulová rychlost v klíči.
type Key = [number, number, number, number];
const PATH: Key[] = [
  [0, 200, 215, 1], [0.9, 200, 215, 1], [1.05, 200, 224, 1], [1.22, 200, 150, 1], [1.38, 200, 164, 1], [1.55, 200, 215, 1], [1.7, 200, 224, 1], [1.85, 200, 148, 1],
  [2.0, 200, 162, 1], [2.2, 200, 215, 1], [4.3, 200, 215, 1], [4.5, 204, 150, 0], [4.9, 210, -80, 0], [5.5, 300, -200, 0], [6.2, 470, 3, 1], [7.0, 470, 3, 1],
];

function pathAt(t: number, keys: Key[] = PATH): [number, number] {
  const n = keys.length;
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  if (t >= keys[n - 1][0]) return [keys[n - 1][1], keys[n - 1][2]];
  let i = 0;
  while (t > keys[i + 1][0]) i++;
  const [t0, x0, y0] = keys[i];
  const [t1, x1, y1] = keys[i + 1];
  const tan = (k: number, c: 1 | 2) => {
    if (keys[k][3]) return 0;
    const prev = keys[Math.max(0, k - 1)], next = keys[Math.min(n - 1, k + 1)];
    return (next[c] - prev[c]) / (next[0] - prev[0] || 1);
  };
  const h = t1 - t0, u = (t - t0) / h;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  return [
    h00 * x0 + h10 * h * tan(i, 1) + h01 * x1 + h11 * h * tan(i + 1, 1),
    h00 * y0 + h10 * h * tan(i, 2) + h01 * y1 + h11 * h * tan(i + 1, 2),
  ];
}


// Epizody po usednutí (náhodně po klidové smyčce) a reakce na myš. Každá je krátká sekvence 3D snímků (30 fps).
const sheetsOf = (name: string, counts: number[], cols = 10): Sheet[] => counts.map((n, i) => ({ src: `/home/obchod/ep-${name}-${i + 1}.webp`, n, cols, rows: Math.ceil(n / cols) }));
type Episode = { sheets: Sheet[]; dur: number; path?: Key[]; fx?: "coins" | "flash" };
const FPATH: Key[] = [[0, 470, 3, 1], [0.5, 470, 3, 1], [1.2, 462, -70, 0], [2.0, 330, -150, 0], [2.7, 170, -110, 0], [3.1, 120, -30, 0], [3.5, 230, -120, 0], [4.1, 360, -175, 0], [4.8, 455, -110, 0], [5.4, 470, -10, 1], [6.0, 470, 3, 1]];
const HPATH: Key[] = [[0, 470, 3, 1], [0.3, 470, 3, 1], [1.0, 470, -72, 0], [1.7, 470, -60, 0], [2.1, 470, 3, 1], [2.2, 470, 3, 1]];
const EPISODES: Record<string, Episode> = {
  yawn: { sheets: sheetsOf("yawn", [90]), dur: 3.0 },
  read: { sheets: sheetsOf("read", [75]), dur: 2.5 },
  selfie: { sheets: sheetsOf("selfie", [60]), dur: 2.0, fx: "flash" },
  dance: { sheets: sheetsOf("dance", [60]), dur: 2.0 },
  muscles: { sheets: sheetsOf("muscles", [60]), dur: 2.0 },
  cheer: { sheets: sheetsOf("cheer", [75]), dur: 2.5, fx: "coins" },
  wave: { sheets: sheetsOf("wave", [50]), dur: 1.6667 },
  hop: { sheets: sheetsOf("hop", [66]), dur: 2.2, path: HPATH },
  flight: { sheets: sheetsOf("flight", [90, 90]), dur: 6.0, path: FPATH },
};
const RANDOM_POOL = ["yawn", "read", "selfie", "dance", "muscles", "cheer", "flight", "cheer", "dance"];
const LOOK: Sheet = { src: "/home/obchod/ep-look-1.webp", n: 15, cols: 5, rows: 3 };
const EP_FPS = 30;

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
  const hit = useRef<HTMLSpanElement>(null);
  const shadow = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = box.current, bu = burst.current, gl = glow.current, ht = hit.current, sh = shadow.current;
    const card = el?.closest<HTMLElement>(".gs-hero-card");
    if (!el || !bu || !card || !ht || !sh) return;
    const wide = window.matchMedia("(min-width: 900px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0, stopped = false, started = false;
    const timers: number[] = [];
    const cleanups: (() => void)[] = [];
    const loaded = new Set<string>();
    const shake = (cls: string, ms: number) => {
      card.classList.remove("gs-hit", "gs-quake");
      void card.offsetWidth;
      card.classList.add(cls);
      timers.push(window.setTimeout(() => card.classList.remove(cls), ms));
    };
    const place = (xr: number, y: number) => {
      el.style.right = `${xr - D / 2}px`;
      el.style.top = `${y - FEET}px`;
      ht.style.right = `${xr - 55}px`;
      ht.style.top = `${y - FEET + 0.1 * D}px`;
    };
    const last = PATH[PATH.length - 1];
    const sit: [number, number] = [last[1], last[2]];

    // efekty epizod: déšť mincí a záblesk fotoaparátu
    const spawn = (cls: string, x: number, y: number, w: number, h: number, ms: number, html = "") => {
      const n = document.createElement("span");
      n.className = cls; n.setAttribute("aria-hidden", "true");
      n.style.right = `${x}px`; n.style.top = `${y}px`; n.style.width = `${w}px`; n.style.height = `${h}px`;
      n.innerHTML = html; card.appendChild(n);
      timers.push(window.setTimeout(() => n.remove(), ms));
      return n;
    };
    const coinRain = (xr: number, y: number) => {
      for (let i = 0; i < 18; i++) {
        const n = spawn("gs-coinfall", xr - 14 + (Math.random() - 0.5) * 240, y - 120 - Math.random() * 60, 26, 26, 3200, '<img loading="lazy" decoding="async" src="/ikony/hero-mince.svg" alt="" width="26" height="26" />');
        n.style.animationDelay = `${(i * 0.09 + Math.random() * 0.2).toFixed(2)}s`;
        n.style.setProperty("--dx", `${((Math.random() - 0.5) * 80).toFixed(0)}px`);
        n.style.setProperty("--fall", `${(200 + Math.random() * 120).toFixed(0)}px`);
      }
    };

    // --- stavový automat po úvodu: klidová smyčka, náhodné epizody, ohlédnutí za myší ---
    type Mode = "intro" | "idle" | "episode" | "look";
    let mode: Mode = "intro";
    let modeT0 = 0;
    let ep: { name: string; def: Episode } | null = null;
    let nextEpAt = 0, lastEp = "", lookIdx = 7, lastPointer = 0, fxDone = false;
    const idleN = total(LOOP_SHEETS);
    const ready = (name: string) => EPISODES[name].sheets.every((s) => loaded.has(s.src));
    const startEpisode = (name: string, now: number) => {
      const def = EPISODES[name];
      if (!def || !ready(name)) return false;
      ep = { name, def }; mode = "episode"; modeT0 = now; fxDone = false; lastEp = name;
      return true;
    };
    const toIdle = (now: number) => { mode = "idle"; modeT0 = now; ep = null; nextEpAt = now + 4500 + Math.random() * 4500; };

    const run = () => {
      if (started || stopped) return;
      started = true;
      const t0 = performance.now();
      const fired = new Set<string>();
      const once = (k: string, f: () => void) => { if (!fired.has(k)) { fired.add(k); f(); } };
      const introN = total(INTRO_SHEETS), burstN = BURST.n;
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
          if (mode === "intro") { mode = "idle"; modeT0 = now; nextEpAt = now + 3500 + Math.random() * 2500; el.style.pointerEvents = ""; }
          if (gl) gl.style.opacity = "0";
          card.style.setProperty("--leak", "0");
          card.style.setProperty("--bulge", "0");
          const dt = (now - modeT0) / 1000;
          if (mode === "episode" && ep) {
            if (dt >= ep.def.dur) toIdle(now);
          }
          if (mode === "look" && now - lastPointer > 1800) toIdle(now);
          if (mode === "idle" && now >= nextEpAt && !document.hidden) {
            const pool = RANDOM_POOL.filter((n) => n !== lastEp && ready(n));
            if (!pool.length || !startEpisode(pool[Math.floor(Math.random() * pool.length)], now)) nextEpAt = now + 2000;
          }
          sh.style.opacity = mode === "episode" && ep?.def.path ? "0" : "1";
          if (mode === "episode" && ep) {
            const e = (now - modeT0) / 1000;
            const [xr, y] = ep.def.path ? pathAt(e, ep.def.path) : sit;
            place(xr, y);
            paint(el, ep.def.sheets, Math.min(total(ep.def.sheets) - 1, Math.floor(e * EP_FPS)));
            if (!fxDone && ep.def.fx === "coins" && e > 0.5) { fxDone = true; coinRain(xr, y); }
            if (!fxDone && ep.def.fx === "flash" && e > 0.95) {
              fxDone = true;
              spawn("gs-flashbulb", xr - 70, y - FEET - 40, 140, 140, 600);
            }
            if (gl) {
              const lit = ep.name === "flight" ? 0.8 : ep.name === "hop" ? 0.7 : 0;
              gl.style.right = `${xr - 260}px`; gl.style.top = `${y - 230}px`; gl.style.opacity = String(lit * (e > 0.2 && e < ep.def.dur - 0.5 ? 1 : 0));
            }
          } else if (mode === "look") {
            place(sit[0], sit[1]);
            paint(el, [LOOK], lookIdx);
          } else {
            place(sit[0], sit[1]);
            paint(el, LOOP_SHEETS, Math.floor(((now - modeT0) / 1000) * LOOP_FPS) % idleN);
          }
        }
        el.style.opacity = "1";
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    // reakce na myš: pohled za kurzorem po kartě, zamávání při najetí na kosmonauta, salto na tryskách po kliknutí
    const idleLike = () => mode === "idle" || mode === "look";
    const onMove = (e: PointerEvent) => {
      if (!idleLike() || !loaded.has(LOOK.src)) return;
      const r = el.getBoundingClientRect();
      const hx = r.left + r.width / 2, hy = r.top + 0.22 * D;
      const dx = Math.max(-1, Math.min(1, (e.clientX - hx) / 320)), dy = Math.max(-1, Math.min(1, (e.clientY - hy) / 200));
      const col = Math.round((dx + 1) * 2), row = dy > 0.35 ? 0 : dy < -0.35 ? 2 : 1;
      lookIdx = row * 5 + col;
      lastPointer = performance.now();
      if (mode === "idle") { mode = "look"; modeT0 = lastPointer; }
    };
    const onEnter = () => { if (idleLike()) startEpisode("wave", performance.now()); };
    const onClick = () => { if (idleLike()) startEpisode("hop", performance.now()); };
    card.addEventListener("pointermove", onMove);
    ht.addEventListener("pointerenter", onEnter);
    ht.addEventListener("click", onClick);
    cleanups.push(() => { card.removeEventListener("pointermove", onMove); ht.removeEventListener("pointerenter", onEnter); ht.removeEventListener("click", onClick); });

    const begin = () => {
      if (!wide.matches) return;
      if (reduced.matches) {
        card.classList.add("is-broken");
        place(sit[0], sit[1]);
        paint(el, LOOP_SHEETS, 0);
        el.style.opacity = "1";
        return;
      }
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); run(); } }, { threshold: 0.35 });
      io.observe(card);
      cleanups.push(() => io.disconnect());
    };
    // úvodní listy se stáhnou a dekódují před startem; epizody se dotahují potom na pozadí
    const load = (s: Sheet, then?: () => void) => {
      const im = new Image();
      const done = () => { loaded.add(s.src); then?.(); };
      im.onload = () => { (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(done); };
      im.onerror = () => then?.();
      im.src = s.src;
    };
    const core = [...INTRO_SHEETS, ...LOOP_SHEETS, BURST];
    let pending = core.length;
    const lazy = () => {
      const all = [...Object.values(EPISODES).flatMap((e) => e.sheets), LOOK];
      let i = 0;
      const next = () => { if (stopped || i >= all.length) return; load(all[i++], () => timers.push(window.setTimeout(next, 150))); };
      next();
    };
    for (const s of core) load(s, () => { if (--pending === 0 && !stopped) { begin(); if (!reduced.matches && wide.matches) timers.push(window.setTimeout(lazy, 2500)); } });
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      cleanups.forEach((f) => f());
      card.classList.remove("is-crack1", "is-crack2", "is-crack3", "is-broken", "gs-hit", "gs-quake");
      for (const v of ["--leak", "--bulge", "--cp1", "--cp2", "--cp3"]) card.style.removeProperty(v);
      card.querySelectorAll(".gs-coinfall, .gs-flashbulb").forEach((n) => n.remove());
    };
  }, []);

  return (
    <>
      <span ref={glow} aria-hidden className="gs-fireglow" />
      <span ref={burst} aria-hidden className="gs-burst" />
      <span ref={box} aria-hidden className="gs-stage" style={{ width: D, height: D }} />
      <span ref={shadow} aria-hidden className="gs-sitshadow" />
      <span ref={hit} aria-hidden className="gs-hitbox" />
    </>
  );
}
