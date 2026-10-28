"use client";

import { useEffect, useRef, useState } from "react";
import town from "./mesto-scena.json";

// „Jak to funguje“ jako živé městečko. Městečko, obyvatelé a zvířata jsou z Blenderu
// (umime-art/blender/mestecko.py a mesto_figury.py), pohoří a sopka jsou vrstvy za ním.
// Hrdina (dítě s batohem) jde podle rolování po cestě mezi třemi budovami = třemi kroky, budova se
// při dosažení rozsvítí, krok se odemkne a na konci sopka vybuchne. Počasí (sníh, déšť), noc/den,
// mraky, ptáci, kouř z komínů a fontána se kreslí v canvasu. Bez animací stojí hrdina u cíle.

export type TownStep = { title: string; text: string };

const DIR = "/home/mesto";
const SKY = 520; // výška oblohy nad městečkem (v px při šířce scény 2000)
const TOWN_H = town.h;
const BOX_H = TOWN_H + SKY;
const ASPECT = town.w / BOX_H;
const FIG = 0.06; // šířka snímku hrdiny (ortografický záběr 1,6) jako podíl šířky scény

type P = [number, number];
type Spr = { f: string; n: number; o: number; tz: number; dur: number };
const SPR = {
  hero_walk: { f: "hrdina-chuze", n: 16, o: 1.6, tz: 0.55, dur: 0.9 },
  hero_idle: { f: "hrdina-stoji", n: 24, o: 1.6, tz: 0.55, dur: 3 },
  hero_joy: { f: "hrdina-radost", n: 24, o: 1.9, tz: 0.7, dur: 1.1 },
  knihovnice: { f: "knihovnice", n: 24, o: 1.7, tz: 0.62, dur: 2.6 },
  pekar: { f: "pekar", n: 24, o: 1.9, tz: 0.62, dur: 2.0 },
  farmar: { f: "farmar", n: 16, o: 1.9, tz: 0.62, dur: 1.6 },
  babicka: { f: "babicka", n: 16, o: 1.7, tz: 0.55, dur: 1.7 },
  kluk: { f: "kluk", n: 24, o: 1.7, tz: 0.55, dur: 1.6 },
  pes_bezi: { f: "pes-bezi", n: 16, o: 1.3, tz: 0.28, dur: 0.6 },
  pes_sedi: { f: "pes-sedi", n: 24, o: 1.3, tz: 0.3, dur: 1.8 },
  kocka: { f: "kocka", n: 24, o: 1.2, tz: 0.27, dur: 6 },
  ovce: { f: "ovce", n: 24, o: 1.4, tz: 0.33, dur: 6 },
  slepice: { f: "slepice", n: 16, o: 0.9, tz: 0.2, dur: 1.3 },
  kralik: { f: "kralik", n: 16, o: 1.2, tz: 0.28, dur: 0.9 },
  ptak: { f: "ptak", n: 12, o: 1.0, tz: 0.0, dur: 0.55 },
  ryba: { f: "ryba", n: 16, o: 1.3, tz: 0.2, dur: 0.9 },
} satisfies Record<string, Spr>;
type SK = keyof typeof SPR;

type Extra = Record<string, P>;
const EX = (town as unknown as { extra: Extra }).extra;
const ROAD = town.road as P[];
const STOPS = town.stops as P[];

// souřadnice v obrázku městečka (0..1) → souřadnice ve scéně (0..1)
const Y = (y: number) => (SKY + y * TOWN_H) / BOX_H;
const at = (p: P) => ({ left: `${p[0] * 100}%`, top: `${Y(p[1]) * 100}%` });

// cesta hrdiny: kumulativní délka v pixelech (poměr stran scény)
const CUM: number[] = [0];
for (let i = 1; i < ROAD.length; i++) CUM.push(CUM[i - 1] + Math.hypot((ROAD[i][0] - ROAD[i - 1][0]) * town.w, (ROAD[i][1] - ROAD[i - 1][1]) * TOWN_H));
const TOTAL = CUM[CUM.length - 1];
function along(u: number): P {
  const d = Math.max(0, Math.min(1, u)) * TOTAL;
  let i = 1;
  while (i < CUM.length - 1 && CUM[i] < d) i++;
  const k = (d - CUM[i - 1]) / Math.max(1e-9, CUM[i] - CUM[i - 1]);
  return [ROAD[i - 1][0] + (ROAD[i][0] - ROAD[i - 1][0]) * k, ROAD[i - 1][1] + (ROAD[i][1] - ROAD[i - 1][1]) * k];
}
const STOP_U = STOPS.map((s) => {
  let best = 0;
  let bd = 1e9;
  ROAD.forEach((r, i) => {
    const d = Math.hypot((r[0] - s[0]) * town.w, (r[1] - s[1]) * TOWN_H);
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  return CUM[best] / TOTAL;
});

const L: Record<string, { day: string; night: string; clear: string; snow: string; rain: string; auto: string }> = {
  cs: { day: "Přepnout na den", night: "Přepnout na noc", clear: "Jasno", snow: "Sníh", rain: "Déšť", auto: "Počasí automaticky" },
  en: { day: "Switch to day", night: "Switch to night", clear: "Clear sky", snow: "Snow", rain: "Rain", auto: "Automatic weather" },
  de: { day: "Auf Tag umschalten", night: "Auf Nacht umschalten", clear: "Klarer Himmel", snow: "Schnee", rain: "Regen", auto: "Wetter automatisch" },
  ru: { day: "Включить день", night: "Включить ночь", clear: "Ясно", snow: "Снег", rain: "Дождь", auto: "Погода автоматически" },
};

type Weather = "clear" | "snow" | "rain";
// automatické střídání počasí (s)
const AUTO: [Weather, number][] = [["clear", 14], ["snow", 16], ["clear", 8], ["rain", 16]];
const AUTO_TOTAL = AUTO.reduce((a, b) => a + b[1], 0);
const autoWeather = (t: number): Weather => {
  let x = t % AUTO_TOTAL;
  for (const [w, d] of AUTO) {
    if (x < d) return w;
    x -= d;
  }
  return "clear";
};

// ------------------------------------------------------------------ sprite
function Sprite({ k, p, flip = false, delay = 0, scale = 1, className = "", style }: { k: SK; p: P; flip?: boolean; delay?: number; scale?: number; className?: string; style?: React.CSSProperties }) {
  const s = SPR[k];
  const w = (s.o / 1.6) * FIG * 100 * scale;
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{ ...at(p), width: `${w}%`, aspectRatio: "1 / 1", transform: `translate(-50%, ${-(0.5 + s.tz / s.o) * 100}%) scaleX(${flip ? -1 : 1})`, ...style }}
    >
      <span
        className="town-sprite block h-full w-full"
        style={{ backgroundImage: `url(${DIR}/${s.f}.webp)`, ["--n" as string]: s.n, animationDuration: `${s.dur}s`, animationDelay: `${-delay}s` }}
      />
    </div>
  );
}

// ------------------------------------------------------------------ komponenta
export function TownLife({ steps, locale = "cs" }: { steps: TownStep[]; locale?: string }) {
  const labels = L[locale] ?? L.cs;
  const wrap = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const heroSpr = useRef<HTMLSpanElement>(null);
  const dog = useRef<HTMLDivElement>(null);
  const dogSpr = useRef<HTMLSpanElement>(null);
  const farmer = useRef<HTMLDivElement>(null);
  const farmerSpr = useRef<HTMLSpanElement>(null);
  const granny = useRef<HTMLDivElement>(null);
  const grannySpr = useRef<HTMLSpanElement>(null);
  const bunny = useRef<HTMLDivElement>(null);
  const birds = useRef<(HTMLDivElement | null)[]>([]);
  const volcano = useRef<HTMLDivElement>(null);
  const [reached, setReached] = useState(0);
  const [night, setNight] = useState(true);
  const [pick, setPick] = useState<Weather | "auto">("auto");
  const [calm, setCalm] = useState(false);
  // stav sdílený se smyčkou (bez překreslování Reactu)
  const live = useRef({ night: true, pick: "auto" as Weather | "auto", reached: 0, override: null as null | { u: number; t: number }, calm: false });

  useEffect(() => {
    live.current.night = night;
    live.current.pick = pick;
  }, [night, pick]);

  useEffect(() => {
    const wr = wrap.current;
    const bx = box.current;
    const canvas = cv.current;
    const hr = hero.current;
    if (!wr || !bx || !canvas || !hr) return;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      live.current.calm = true;
    }
    let raf = 0;
    let visible = true;
    let disposed = false;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let cur = reduced ? 1 : 0;
    let lastU = cur;
    let target = cur;
    let tPrev = performance.now();
    let walkAcc = 0;
    let joyUntil = 0;
    let heroMode = "";
    let facing = 1;
    let lastHx = 0;
    let pan = 0;
    let erupt = 0;
    let eruptAt = 0;
    const inten = { snow: 0, rain: 0 };
    let flash = 0;
    let nextFlash = 5;
    const flakes: { x: number; y: number; v: number; s: number; ph: number }[] = [];
    const drops: { x: number; y: number; v: number }[] = [];
    const puffs: { x: number; y: number; life: number; vx: number; r: number; src: number }[] = [];
    const water: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
    const sparks: { x: number; y: number; vx: number; vy: number; life: number; c: string }[] = [];
    const flies = Array.from({ length: 16 }, (_, i) => ({ x: (i * 0.0613) % 1, y: 0.05 + ((i * 0.37) % 1) * 0.1, ph: i * 1.7, s: 0.2 + (i % 5) * 0.08 }));
    const fish = [{ x: 0.38, t: 3 }, { x: 0.57, t: 8 }, { x: 0.8, t: 12 }];

    const resize = () => {
      const r = bx.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    const px = (p: P) => [p[0] * W, Y(p[1]) * H] as const;

    const progress = () => {
      const r = wr.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.78;
      const end = vh * 0.9 - r.height;
      return Math.max(0, Math.min(1, (start - r.top) / (start - end)));
    };

    const setStrip = (el: HTMLSpanElement, k: SK) => {
      const s = SPR[k];
      el.style.backgroundImage = `url(${DIR}/${s.f}.webp)`;
      el.style.backgroundSize = `${s.n * 100}% 100%`;
      el.dataset.n = String(s.n);
    };
    const setFrame = (el: HTMLSpanElement, f: number) => {
      const n = Number(el.dataset.n || 1);
      el.style.backgroundPosition = `${(Math.min(n - 1, Math.max(0, f)) / Math.max(1, n - 1)) * 100}% 0`;
    };
    const place = (el: HTMLElement, p: P, k: SK, flip: boolean) => {
      const s = SPR[k];
      el.style.left = `${p[0] * 100}%`;
      el.style.top = `${Y(p[1]) * 100}%`;
      el.style.width = `${(s.o / 1.6) * FIG * 100}%`;
      el.style.transform = `translate(-50%, ${-(0.5 + s.tz / s.o) * 100}%) scaleX(${flip ? -1 : 1})`;
    };

    const emitSmoke = (dt: number) => {
      const list = town.chimneys as P[];
      list.forEach((c, i) => {
        if (Math.random() < dt * (1.1 + (i % 3) * 0.2)) puffs.push({ x: c[0], y: Y(c[1]), life: 0, vx: 0.004 + Math.random() * 0.004, r: 3 + Math.random() * 2, src: i });
      });
    };

    const frame = (now: number) => {
      raf = 0;
      if (disposed) return;
      const dt = Math.min(0.05, (now - tPrev) / 1000);
      tPrev = now;
      const st = live.current;

      // ---- hrdina
      let u = cur;
      if (!st.calm) {
        const ov = st.override;
        target = ov ? ov.u : progress();
        cur += (target - cur) * Math.min(1, dt * 4.2);
        if (Math.abs(target - cur) < 0.0005) cur = target;
        u = cur;
      }
      const moving = Math.abs(u - lastU) > 0.00018;
      lastU = u;
      const hp = along(u);
      const [hx] = px(hp);
      if (Math.abs(hx - lastHx) > 0.3) facing = hx > lastHx ? 1 : -1;
      lastHx = hx;
      const n = STOP_U.filter((s) => u >= s - 0.004).length;
      if (n !== st.reached) {
        if (n > st.reached) joyUntil = now + 1500;
        st.reached = n;
        setReached(n);
        if (n === 3 && !st.calm) {
          eruptAt = now;
          erupt = 1;
        }
      }
      const joy = now < joyUntil || (n === 3 && !moving);
      calmFrames += 1;
      const mode = joy ? "hero_joy" : moving ? "hero_walk" : "hero_idle";
      const hs = heroSpr.current;
      if (hs) {
        if (mode !== heroMode) {
          heroMode = mode;
          setStrip(hs, mode as SK);
          place(hr, hp, mode as SK, facing < 0);
        }
        place(hr, hp, mode as SK, facing < 0);
        if (mode === "hero_walk") {
          walkAcc += Math.abs(u - wasU) * TOTAL;
          setFrame(hs, Math.floor(walkAcc / 4.4) % 16); // jeden cyklus chůze = asi 70 px cesty, nohy tedy neklouzou
        } else if (st.calm) {
          setFrame(hs, 0);
        } else if (mode === "hero_joy") {
          setFrame(hs, Math.floor(((now - (joyUntil - 1500)) / 1100) * 24) % 24);
        } else {
          setFrame(hs, Math.floor(now / 125) % 24);
        }
      }
      wasU = u;

      // pes běží za hrdinou, když stojí, sedí
      const dg = dog.current;
      const ds = dogSpr.current;
      if (dg && ds) {
        const du = Math.max(0, u - 0.045);
        const dp = along(du);
        const [dx] = px(dp);
        const dmoving = Math.abs(du - dogU) > 0.00015;
        const dmode: SK = dmoving ? "pes_bezi" : "pes_sedi";
        if (dx !== dogX) dogFace = dx > dogX ? 1 : -1;
        dogX = dx;
        dogU = du;
        if (ds.dataset.k !== dmode) {
          ds.dataset.k = dmode;
          setStrip(ds, dmode);
        }
        place(dg, [dp[0] + 0.004, dp[1] + 0.012], dmode, dogFace < 0);
        const sec = now / 1000;
        if (dmoving) dogAcc += Math.abs(du - dogPrev) * TOTAL;
        dogPrev = du;
        setFrame(ds, Math.floor(dmoving ? (dogAcc / 5.6) % SPR[dmode].n : (sec * 12) % SPR[dmode].n));
      }

      // chodci: farmář a babička chodí tam a zpět
      const walkers: [React.RefObject<HTMLDivElement | null>, React.RefObject<HTMLSpanElement | null>, P, P, number, SK, number][] = [
        [farmer, farmerSpr, EX.farmar_a, EX.farmar_b, 26, "farmar", 0],
        [granny, grannySpr, EX.babicka_a, EX.babicka_b, 22, "babicka", 5],
      ];
      for (const [ref, sref, a, b, per, k, off] of walkers) {
        const el = ref.current;
        const sp = sref.current;
        if (!el || !sp) continue;
        const x = (((now / 1000 + off) % per) / per) * 2;
        const f = x < 1 ? x : 2 - x;
        const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
        const p: P = [a[0] + (b[0] - a[0]) * (st.calm ? 0.4 : e), a[1] + (b[1] - a[1]) * (st.calm ? 0.4 : e)];
        place(el, p, k, x < 1 ? b[0] < a[0] : b[0] > a[0]);
        if (!sp.dataset.n) setStrip(sp, k);
        setFrame(sp, st.calm ? 0 : Math.floor((now / 1000) * (SPR[k].n / SPR[k].dur)) % SPR[k].n);
      }
      // králík skáče po louce
      const bn = bunny.current;
      if (bn && !st.calm) {
        const x = ((now / 1000) % 18) / 18;
        const p: P = [EX.kralik_a[0] + (EX.kralik_b[0] - EX.kralik_a[0]) * (x < 0.5 ? x * 2 : 2 - x * 2), EX.kralik_a[1] + 0.01 * Math.sin(x * 12)];
        bn.style.left = `${p[0] * 100}%`;
        bn.style.top = `${Y(p[1]) * 100}%`;
        bn.style.transform = `translate(-50%, ${-(0.5 + SPR.kralik.tz / SPR.kralik.o) * 100}%) scaleX(${x < 0.5 ? 1 : -1})`;
      }
      // ptáci přelétají oblohu
      birds.current.forEach((el, i) => {
        if (!el) return;
        const per = 26 + i * 9;
        const x = (((now / 1000 + i * 8.7) % per) / per) * 1.3 - 0.15;
        const y = 0.1 + i * 0.06 + 0.012 * Math.sin(now / 700 + i);
        el.style.left = `${(i % 2 ? 1.15 - x : x) * 100}%`;
        el.style.top = `${y * 100}%`;
        el.style.transform = `translate(-50%, -50%) scaleX(${i % 2 ? -1 : 1})`;
      });

      // ---- panorama na úzkých displejích sleduje hrdinu
      const bw = bx.clientWidth;
      const ww = wr.clientWidth;
      if (bw > ww + 1) {
        const want = Math.max(0, Math.min(bw - ww, hx - ww / 2));
        pan += (want - pan) * Math.min(1, dt * 5);
        bx.style.transform = `translate3d(${-pan}px,0,0)`;
      } else if (pan !== 0) {
        pan = 0;
        bx.style.transform = "";
      }

      // ---- canvas: počasí, kouř, fontána, jiskry
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const sec = now / 1000;
      const want: Weather = st.calm ? "clear" : st.pick === "auto" ? autoWeather(sec) : st.pick;
      inten.snow += ((want === "snow" ? 1 : 0) - inten.snow) * Math.min(1, dt * 0.8);
      inten.rain += ((want === "rain" ? 1 : 0) - inten.rain) * Math.min(1, dt * 0.8);
      bx.style.setProperty("--rain", inten.rain.toFixed(3));
      bx.style.setProperty("--snow", inten.snow.toFixed(3));
      if (!st.calm) {
        // sníh
        if (inten.snow > 0.02 && flakes.length < 240 * inten.snow) {
          for (let i = 0; i < 3; i++) flakes.push({ x: Math.random() * W, y: -6, v: 24 + Math.random() * 36, s: 1 + Math.random() * 2.2, ph: Math.random() * 6 });
        }
        ctx.fillStyle = "#ffffff";
        for (let i = flakes.length - 1; i >= 0; i--) {
          const f = flakes[i];
          f.y += f.v * dt * (W / 900);
          f.x += Math.sin(sec * 1.3 + f.ph) * 14 * dt;
          if (f.y > H * 0.97 || (inten.snow < 0.05 && f.y > H)) {
            flakes.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = Math.min(1, inten.snow * 1.2 + 0.1) * 0.9;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.s * (W / 1100), 0, 6.283);
          ctx.fill();
        }
        // déšť
        if (inten.rain > 0.02) {
          const want = 170 * inten.rain;
          while (drops.length < want) drops.push({ x: Math.random() * (W + 80) - 40, y: -10 - Math.random() * H * 0.3, v: 620 + Math.random() * 300 });
        }
        ctx.strokeStyle = "rgba(190,210,255,0.55)";
        ctx.lineWidth = Math.max(1, W / 1100);
        ctx.beginPath();
        for (let i = drops.length - 1; i >= 0; i--) {
          const d = drops[i];
          d.y += d.v * dt * (W / 1000);
          d.x -= d.v * dt * 0.16 * (W / 1000);
          if (d.y > H * (0.58 + Math.random() * 0.4)) {
            if (inten.rain > 0.15) sparks.push({ x: d.x, y: d.y, vx: 0, vy: 0, life: 0.9, c: "rain" });
            drops.splice(i, 1);
            continue;
          }
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + 3.5 * (W / 1000), d.y - 14 * (W / 1000));
        }
        ctx.globalAlpha = Math.min(1, inten.rain * 1.3);
        ctx.stroke();
        // blesk
        if (inten.rain > 0.7) {
          nextFlash -= dt;
          if (nextFlash < 0) {
            flash = 1;
            nextFlash = 6 + Math.random() * 9;
          }
        }
        flash = Math.max(0, flash - dt * 2.6);
        bx.style.setProperty("--flash", (flash > 0.55 || (flash > 0.2 && flash < 0.4) ? flash * 0.5 : 0).toFixed(3));

        // kouř z komínů
        emitSmoke(dt);
        for (let i = puffs.length - 1; i >= 0; i--) {
          const p = puffs[i];
          p.life += dt * 0.45;
          if (p.life >= 1) {
            puffs.splice(i, 1);
            continue;
          }
          p.x += p.vx * dt * 3;
          p.y -= dt * 0.045 * (1 + p.life);
          const a = Math.sin(Math.min(1, p.life) * Math.PI) * 0.45;
          const r = (p.r + p.life * 12) * (W / 1500);
          const g = ctx.createRadialGradient(p.x * W, p.y * H, 0, p.x * W, p.y * H, r);
          g.addColorStop(0, `rgba(235,232,255,${a})`);
          g.addColorStop(1, "rgba(235,232,255,0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x * W, p.y * H, r, 0, 6.283);
          ctx.fill();
        }
        // fontána
        const [fx, fy] = px(town.fontana as P);
        if (Math.random() < dt * 40) water.push({ x: fx, y: fy, vx: (Math.random() - 0.5) * 22 * (W / 1500), vy: -(60 + Math.random() * 38) * (W / 1500), life: 0 });
        ctx.fillStyle = "rgba(170,225,255,0.9)";
        for (let i = water.length - 1; i >= 0; i--) {
          const w = water[i];
          w.life += dt;
          w.vy += 190 * dt * (W / 1500);
          w.x += w.vx * dt;
          w.y += w.vy * dt;
          if (w.life > 0.85) {
            water.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = 1 - w.life;
          ctx.beginPath();
          ctx.arc(w.x, w.y, 1.5 * (W / 1500) + 0.4, 0, 6.283);
          ctx.fill();
        }
        // světlušky nad loukou (jen v noci)
        if (st.night) {
          for (const f of flies) {
            const x = (f.x + 0.03 * Math.sin(sec * f.s + f.ph)) % 1;
            const y = Y(0.84 + 0.12 * ((f.y * 7) % 1)) + 0.014 * Math.sin(sec * f.s * 1.7 + f.ph);
            const a = 0.35 + 0.65 * Math.max(0, Math.sin(sec * (0.9 + f.s) + f.ph));
            const g = ctx.createRadialGradient(x * W, y * H, 0, x * W, y * H, 7 * (W / 1200));
            g.addColorStop(0, `rgba(230,255,150,${a})`);
            g.addColorStop(1, "rgba(230,255,150,0)");
            ctx.globalAlpha = 1;
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x * W, y * H, 7 * (W / 1200), 0, 6.283);
            ctx.fill();
          }
        }
        // ryby skáčou z říčky
        for (const f of fish) {
          f.t -= dt;
          if (f.t < 0) {
            f.t = 9 + Math.random() * 12;
            const el = document.getElementById("town-fish-" + fish.indexOf(f));
            if (el) {
              el.style.left = `${(0.2 + Math.random() * 0.6) * 100}%`;
              el.classList.remove("town-fish-go");
              void el.offsetWidth;
              el.classList.add("town-fish-go");
            }
          }
        }
        // sopka: erupce po dosažení cíle + občasné pufnutí
        const sv = volcano.current;
        if (sv) {
          const r = sv.getBoundingClientRect();
          const b = bx.getBoundingClientRect();
          const cx = r.left - b.left + r.width * 0.5;
          const cy = r.top - b.top + r.height * 0.6;
          if (erupt > 0) {
            const age = (now - eruptAt) / 1000;
            if (age < 2.6) {
              for (let i = 0; i < 6; i++) {
                const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
                const sp = (160 + Math.random() * 360) * (W / 1500);
                sparks.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.4, c: Math.random() < 0.5 ? "#ffb23a" : "#ff6a2a" });
              }
              sv.style.transform = `translate(-50%,0) translateX(${Math.sin(now / 30) * 2 * Math.max(0, 1 - age / 1.2)}px)`;
            } else {
              erupt = 0;
              sv.style.transform = "translate(-50%,0)";
            }
          }
        }
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          if (s.c === "rain") {
            s.life -= dt * 2.4;
            if (s.life <= 0) {
              sparks.splice(i, 1);
              continue;
            }
            ctx.globalAlpha = s.life * 0.5;
            ctx.strokeStyle = "rgba(190,210,255,0.8)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(s.x, s.y, (1 - s.life) * 7 * (W / 1100) + 1, ((1 - s.life) * 7 * (W / 1100) + 1) * 0.35, 0, 0, 6.283);
            ctx.stroke();
            continue;
          }
          s.life -= dt;
          s.vy += 380 * dt * (W / 1500);
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          if (s.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = Math.min(1, s.life);
          ctx.fillStyle = s.c;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 2.6 * (W / 1500) + 0.6, 0, 6.283);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      if (visible && !(st.calm && calmFrames > 6)) raf = requestAnimationFrame(frame);
    };
    let calmFrames = 0;
    let wasU = cur;
    let dogU = cur;
    let dogPrev = cur;
    let dogAcc = 0;
    let dogX = 0;
    let dogFace = 1;
    const kick = () => {
      if (!raf && !disposed && visible) {
        tPrev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const onScroll = () => {
      const ov = live.current.override;
      if (ov && Date.now() - ov.t > 500) live.current.override = null;
    };
    resize();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(wr);
    const ro = new ResizeObserver(resize);
    ro.observe(bx);
    window.addEventListener("scroll", onScroll, { passive: true });
    kick();
    const clickHook = (e: Event) => {
      const i = Number((e as CustomEvent<number>).detail);
      if (!Number.isNaN(i) && STOP_U[i] !== undefined) live.current.override = { u: STOP_U[i], t: Date.now() };
    };
    wr.addEventListener("town-go", clickHook);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      wr.removeEventListener("town-go", clickHook);
    };
  }, []);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => {
      live.current.calm = m.matches;
      setCalm(m.matches);
      if (m.matches) setReached(3);
    };
    set();
    m.addEventListener("change", set);
    return () => m.removeEventListener("change", set);
  }, []);

  const go = (i: number) => wrap.current?.dispatchEvent(new CustomEvent("town-go", { detail: i }));
  const dayCls = night ? "" : "town-day";
  const doors = [EX.b1_door, EX.b2_door, EX.b3_door];
  const lampList = town.lamps as P[];

  return (
    <div>
      <div ref={wrap} className={`relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-3xl border-2 border-white/15 bg-[#0c0a24]/30 shadow-[0_20px_60px_rgba(10,6,40,0.55)] ${dayCls}`}>
        <div ref={box} className="town-box relative w-full min-w-[760px] will-change-transform" style={{ aspectRatio: String(ASPECT) }}>
          {/* obloha: noc / den */}
          <div aria-hidden className="town-sky absolute inset-0" />
          <div aria-hidden className="town-stars absolute inset-0" />
          {/* eslint-disable @next/next/no-img-element */}
          <div aria-hidden className="town-moon pointer-events-none absolute" style={{ left: "12%", top: "5%", width: "7.5%", aspectRatio: "0.973" }}>
            <span className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/anim/mesic.webp)", ["--n" as string]: 12, animationDuration: "5s" }} />
          </div>
          <div aria-hidden className="town-sun pointer-events-none absolute" style={{ left: "11%", top: "4%", width: "9%", aspectRatio: "1" }}>
            <span className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/anim/slunce.webp)", ["--n" as string]: 16, animationDuration: "6s" }} />
          </div>
          <div aria-hidden className="town-shooting pointer-events-none absolute" />
          {/* pohoří s paralaxou */}
          <img src="/home/anim/hory-zadni.webp" alt="" aria-hidden draggable={false} className="town-mtn town-mtn-back pointer-events-none absolute left-0 w-full select-none" style={{ bottom: "35%" }} />
          <img src="/home/anim/hory-stredni.webp" alt="" aria-hidden draggable={false} className="town-mtn town-mtn-mid pointer-events-none absolute left-0 w-full select-none" style={{ bottom: "32%" }} />
          {/* sopka za kopci */}
          <div
            ref={volcano}
            aria-hidden
            className="pointer-events-none absolute"
            style={{ left: `${EX.sopka[0] * 100}%`, top: `${Y(EX.sopka[1]) * 100}%`, width: "31%", transform: "translate(-50%,0)", marginTop: "-37%" }}
          >
            <div className="town-volcano-glow absolute left-1/2 top-[40%] h-[62%] w-[170%] -translate-x-1/2" />
            <picture className="block" style={{ maskImage: "linear-gradient(180deg, transparent 0%, #000 22%)", WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 22%)" }}>
              <source media="(prefers-reduced-motion: reduce)" srcSet="/home/anim/sopka-still.webp" />
              <img src="/home/anim/sopka.webp" alt="" draggable={false} className="relative block h-auto w-full" />
            </picture>
          </div>
          {/* mraky */}
          {[["oblak-1", 9, 0.09, 110, 0], ["oblak-2", 7, 0.2, 150, 60], ["oblak-1", 6, 0.28, 90, 30]].map(([n, w, y, d, off], i) => (
            <img key={i} src={`/home/${n}.webp`} alt="" aria-hidden draggable={false} className="town-cloud pointer-events-none absolute select-none" style={{ top: `${Number(y) * 100}%`, width: `${w}%`, animationDuration: `${d}s`, animationDelay: `-${off}s` }} />
          ))}
          {/* ptáci */}
          {[0, 1, 2].map((i) => (
            <div key={i} ref={(el) => void (birds.current[i] = el)} aria-hidden className="pointer-events-none absolute" style={{ width: `${(SPR.ptak.o / 1.6) * FIG * 100 * 0.9}%`, aspectRatio: "1 / 1" }}>
              <span className="town-sprite block h-full w-full" style={{ backgroundImage: `url(${DIR}/ptak.webp)`, ["--n" as string]: SPR.ptak.n, animationDuration: `${SPR.ptak.dur + i * 0.08}s` }} />
            </div>
          ))}
          {/* městečko */}
          <img src={`${DIR}/scena.webp`} alt="" aria-hidden draggable={false} className="town-img pointer-events-none absolute left-0 w-full select-none" style={{ top: `${(SKY / BOX_H) * 100}%` }} />
          {/* větrník */}
          <div aria-hidden className="town-mill pointer-events-none absolute" style={{ ...at(town.mlyn as P), width: "6.2%", aspectRatio: "1 / 1", transform: "translate(-50%,-50%)" }}>
            <img src={`${DIR}/mlyn.webp`} alt="" draggable={false} className="town-mill-blades block h-full w-full" />
          </div>
          {/* záře lamp a neonu (jen v noci) */}
          {lampList.map((p, i) => (
            <span key={i} aria-hidden className="town-lamp pointer-events-none absolute" style={{ ...at(p), animationDelay: `-${(i * 0.7) % 3}s` }} />
          ))}
          <span aria-hidden className="town-neon pointer-events-none absolute" style={at((town.neon as P[])[0])} />
          {/* obyvatelé a zvířata */}
          <Sprite k="knihovnice" p={EX.knihovnice} flip />
          <Sprite k="pekar" p={EX.pekar} delay={0.4} />
          <Sprite k="kluk" p={EX.kluk} delay={0.8} />
          <Sprite k="kocka" p={EX.kocka} delay={1.2} />
          <Sprite k="ovce" p={EX.ovce_a} delay={0.5} />
          <Sprite k="ovce" p={EX.ovce_b} delay={3.1} flip scale={0.9} />
          <Sprite k="slepice" p={EX.slepice_a} delay={0.2} />
          <Sprite k="slepice" p={EX.slepice_b} delay={0.7} flip scale={0.85} />
          <div ref={farmer} aria-hidden className="pointer-events-none absolute" style={{ aspectRatio: "1 / 1" }}><span ref={farmerSpr} className="block h-full w-full" style={{ backgroundRepeat: "no-repeat" }} /></div>
          <div ref={granny} aria-hidden className="pointer-events-none absolute" style={{ aspectRatio: "1 / 1" }}><span ref={grannySpr} className="block h-full w-full" style={{ backgroundRepeat: "no-repeat" }} /></div>
          <div ref={bunny} aria-hidden className="pointer-events-none absolute" style={{ width: `${(SPR.kralik.o / 1.6) * FIG * 100}%`, aspectRatio: "1 / 1" }}>
            <span className="town-sprite block h-full w-full" style={{ backgroundImage: `url(${DIR}/kralik.webp)`, ["--n" as string]: SPR.kralik.n, animationDuration: `${SPR.kralik.dur * 1.4}s` }} />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} id={`town-fish-${i}`} aria-hidden className="town-fish pointer-events-none absolute" style={{ top: `${Y(EX.rybnik[1]) * 100}%`, width: `${(SPR.ryba.o / 1.6) * FIG * 100}%`, aspectRatio: "1 / 1" }}>
              <span className="town-sprite town-fish-spr block h-full w-full" style={{ backgroundImage: `url(${DIR}/ryba.webp)`, ["--n" as string]: SPR.ryba.n, animationDuration: "0.9s" }} />
            </div>
          ))}
          <div aria-hidden className="pointer-events-none absolute" style={{ ...at(EX.jezek), width: "3.4%", aspectRatio: "1.324", transform: "translate(-50%,-85%)" }}>
            <span className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/anim/jezek.webp)", ["--n" as string]: 16, animationDuration: "2.4s", backgroundSize: "calc(var(--n) * 100%) 100%" }} />
          </div>
          <div aria-hidden className="pointer-events-none absolute" style={{ ...at(EX.veverka), width: "2.3%", aspectRatio: "0.598", transform: "translate(-50%,-90%)" }}>
            <span className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/anim/veverka.webp)", ["--n" as string]: 16, animationDuration: "2.4s" }} />
          </div>
          <div ref={dog} aria-hidden className="pointer-events-none absolute" style={{ aspectRatio: "1 / 1" }}>
            <span ref={dogSpr} className="block h-full w-full" style={{ backgroundRepeat: "no-repeat" }} />
          </div>
          <div ref={hero} aria-hidden className="pointer-events-none absolute z-[3] drop-shadow-[0_5px_5px_rgba(10,8,40,0.35)]" style={{ aspectRatio: "1 / 1" }}>
            <span ref={heroSpr} className="block h-full w-full" style={{ backgroundRepeat: "no-repeat", backgroundImage: `url(${DIR}/hrdina-stoji.webp)`, backgroundSize: "2400% 100%" }} />
          </div>
          {/* odemčené budovy: zlatá aura a hvězdička nad dveřmi */}
          {doors.map((d, i) => (
            <span key={i} aria-hidden className="pointer-events-none absolute" style={{ ...at(d), width: "9%", aspectRatio: "1 / 1", transform: "translate(-50%,-70%)", opacity: reached > i ? 1 : 0, transition: "opacity 0.7s", background: "radial-gradient(circle, rgba(255,214,90,0.5), rgba(255,214,90,0) 65%)" }}>
              <span className="town-pop absolute left-1/2 top-[8%] -translate-x-1/2 text-[clamp(14px,2.2vw,26px)]" style={{ animationPlayState: reached > i ? "running" : "paused" }}>⭐</span>
            </span>
          ))}
          {/* kliknutelné budovy */}
          {doors.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={steps[i]?.title}
              className="town-hit absolute z-[4] rounded-full"
              style={{ ...at(d), width: "13%", aspectRatio: "1.4 / 1", transform: "translate(-50%,-110%)" }}
            />
          ))}
          <canvas ref={cv} aria-hidden className="pointer-events-none absolute inset-0 z-[5] h-full w-full" />
          <div aria-hidden className="town-rain pointer-events-none absolute inset-0 z-[5]" />
          <div aria-hidden className="town-flash pointer-events-none absolute inset-0 z-[6]" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-[9%] bg-gradient-to-b from-transparent to-[#160a2c]/90" />
          {/* eslint-enable @next/next/no-img-element */}
        </div>
        <div className="pointer-events-none absolute right-3 top-3 z-10 flex gap-2">
          {[
            { k: "tod", icon: night ? "☀️" : "🌙", label: night ? labels.day : labels.night, on: false, act: () => setNight((v) => !v) },
            { k: "snow", icon: "❄️", label: labels.snow, on: pick === "snow", act: () => setPick((p) => (p === "snow" ? "clear" : "snow")) },
            { k: "rain", icon: "🌧️", label: labels.rain, on: pick === "rain", act: () => setPick((p) => (p === "rain" ? "clear" : "rain")) },
            { k: "auto", icon: "🔄", label: labels.auto, on: pick === "auto", act: () => setPick("auto") },
          ].map((b) => (
            <button
              key={b.k}
              type="button"
              onClick={b.act}
              aria-label={b.label}
              aria-pressed={b.k === "tod" ? !night : b.on}
              title={b.label}
              className={`pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border-2 text-base shadow-[0_3px_0_rgba(10,6,40,0.6)] backdrop-blur transition-transform hover:-translate-y-0.5 ${b.on ? "border-[#ffd24d] bg-[#ffd24d]/25" : "border-white/30 bg-[#0c0a24]/60"}`}
            >
              <span aria-hidden>{b.icon}</span>
            </button>
          ))}
        </div>
      </div>

      <ol className="mx-auto mt-6 grid max-w-[1280px] gap-4 sm:grid-cols-3">
        {steps.map((s, i) => {
          const on = reached > i;
          return (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => go(i)}
                className="relative flex h-full w-full gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-500 sm:p-5"
                style={{
                  borderColor: on ? "#ffd24d" : "rgba(255,255,255,0.18)",
                  background: on ? "rgba(255,210,77,0.12)" : "rgba(10,8,32,0.32)",
                  boxShadow: on ? "0 0 30px rgba(255,210,77,0.25)" : undefined,
                  opacity: on || calm ? 1 : 0.66,
                  transform: on ? "translateY(0)" : "translateY(4px)",
                }}
              >
                <span
                  aria-hidden
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-xl font-extrabold"
                  style={{ borderColor: on ? "#16132b" : "rgba(255,255,255,0.35)", background: on ? "#ffd24d" : "transparent", color: on ? "#16132b" : "#fff", fontFamily: "var(--font-heading)" }}
                >
                  {on ? "✓" : i + 1}
                </span>
                <span>
                  <span className="block font-bold">
                    <span className="sr-only">{i + 1}. </span>
                    {s.title}
                  </span>
                  <span className="mt-1 block text-sm text-white/80">{s.text}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
