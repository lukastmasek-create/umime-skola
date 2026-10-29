import { sfx } from "@/lib/market-sfx";
import { drawSea } from "@/lib/market-scenery";

// Filmové přechody z městečka do světů obchodu. Kulisy městečka zůstávají v DOMu (ať žijí obyvatelé), kamera je
// transformace vrstvy `cam`, kouř, oheň, hvězdy a vlny se kreslí do průhledného canvasu nad ní.
//  - runSpace: hrdina nastoupí do rakety, ta se postaví, odpočet, start, oblaka, hvězdy, vlet do dokovací brány stanice.
//  - runPirate: hrdina dojde ke schodům, vlna zakryje obraz, na molu vejde po lávce na palubu galéry, ta vyplouvá.
// Obě skončí zavoláním onEnd (rodič pak přepne svět a překryje to závojem).

export type Pt = [number, number];
export type Refs = {
  box: HTMLDivElement;
  cam: HTMLDivElement;
  sky: HTMLDivElement;
  bgDark: HTMLDivElement;
  cv: HTMLCanvasElement;
  hero: HTMLDivElement;
  heroSpr: HTMLSpanElement;
  rocket: HTMLDivElement;
  bars: HTMLDivElement;
  count: HTMLDivElement;
};
export type Geo = {
  toBox: (p: Pt) => Pt; // souřadnice scény (0..1) → zlomky boxu (0..1)
  rocket: Pt;
  start: Pt;
  road: Pt[]; // cesta od schodů doprava
  fig: number; // šířka snímku hrdiny v zlomku šířky boxu
};
export type Handle = { stop: () => void; skip: () => void };

type NastupAnchors = { piloty: Pt[]; paluba_start: Pt; lavka_zacatek: Pt; lavka_konec: Pt; paluba_stred: Pt };

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sm = (x: number, a: number, b: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((res) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(im);
    im.src = src;
  });
}

function setup(r: Refs) {
  const cw = r.box.clientWidth;
  const ch = r.box.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  r.cv.width = Math.round(cw * dpr);
  r.cv.height = Math.round(ch * dpr);
  const ctx = r.cv.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { cw, ch, ctx };
}

function bars(r: Refs, ch: number, amount: number) {
  const h = `${ch * 0.075 * amount}px`;
  (r.bars.children[0] as HTMLElement).style.height = h;
  (r.bars.children[1] as HTMLElement).style.height = h;
}

function setHero(r: Refs, x: number, y: number, flip: boolean, sc: number, op: number) {
  r.hero.style.left = `${x}px`;
  r.hero.style.top = `${y}px`;
  r.hero.style.opacity = String(op);
  r.hero.style.transformOrigin = "50% 84.4%";
  r.hero.style.transform = `translate(-50%, -84.4%) scale(${flip ? -sc : sc}, ${sc})`;
}

function heroSprite(r: Refs, kind: "walk" | "idle", pending: { cur: string }) {
  if (pending.cur === kind) return;
  pending.cur = kind;
  r.heroSpr.style.setProperty("--n", kind === "walk" ? "16" : "24");
  r.heroSpr.style.backgroundImage = `url(/home/mesto/${kind === "walk" ? "hrdina-chuze" : "hrdina-stoji"}.webp)`;
  r.heroSpr.style.animationDuration = kind === "walk" ? "0.9s" : "3s";
}

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, shade = 1) {
  for (const [dx, dy, k] of [[0, 0, 1], [1.0, 0.15, 0.8], [-1.0, 0.2, 0.75], [0.45, -0.45, 0.8], [-0.5, -0.35, 0.7], [1.7, 0.3, 0.5], [-1.7, 0.35, 0.5]] as const) {
    const g = ctx.createRadialGradient(x + dx * r, y + dy * r, 0, x + dx * r, y + dy * r, r * k);
    const c = Math.round(255 * shade);
    g.addColorStop(0, `rgba(${c},${c},${c},${a})`);
    g.addColorStop(0.7, `rgba(${c},${c},${Math.round(c * 0.97)},${a * 0.6})`);
    g.addColorStop(1, `rgba(${c},${c},${c},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x + dx * r - r * k, y + dy * r - r * k, r * k * 2, r * k * 2);
  }
}

type Particle = { x: number; y: number; vx: number; vy: number; age: number; life: number; r0: number; r1: number; kind: 0 | 1 | 2; seed: number };

function drawParticles(ctx: CanvasRenderingContext2D, ps: Particle[], tx: number, ty: number, s: number) {
  for (const p of ps) {
    const k = p.age / p.life;
    const sx = tx + s * p.x;
    const sy = ty + s * p.y;
    const r = lerp(p.r0, p.r1, Math.sqrt(k)) * s;
    if (p.kind === 2) {
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(255,${Math.round(190 - 90 * k)},80,${1 - k})`;
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(0.6, r), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      continue;
    }
    let cr: number, cg: number, cb: number, a: number;
    if (p.kind === 0) {
      const hot = 1 - clamp(p.age / 0.45);
      cr = lerp(150 + p.seed * 25, 255, hot);
      cg = lerp(150 + p.seed * 25, 175, hot);
      cb = lerp(155 + p.seed * 25, 90, hot);
      a = 0.55 * Math.pow(1 - k, 1.3) * Math.min(1, 0.25 + p.age / 0.12);
    } else {
      cr = 205 + p.seed * 25;
      cg = 190 + p.seed * 20;
      cb = 160 + p.seed * 20;
      a = 0.5 * Math.pow(1 - k, 1.2) * Math.min(1, 0.2 + p.age / 0.1);
    }
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    g.addColorStop(0, `rgba(${cr | 0},${cg | 0},${cb | 0},${a})`);
    g.addColorStop(0.6, `rgba(${cr | 0},${cg | 0},${cb | 0},${a * 0.6})`);
    g.addColorStop(1, `rgba(${cr | 0},${cg | 0},${cb | 0},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
  }
}

function stepParticles(ps: Particle[], dt: number) {
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    p.age += dt;
    if (p.age >= p.life) {
      ps.splice(i, 1);
      continue;
    }
    const drag = Math.exp(-(p.kind === 2 ? 0.2 : 1.1) * dt);
    p.vx *= drag;
    p.vy = p.kind === 2 ? p.vy + 620 * dt : p.vy * drag - (p.kind === 0 ? 14 * dt : 0);
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
}

// ---------------------------------------------------------------------------------------------- vesmír
export function runSpace(r: Refs, g: Geo, onEnd: () => void): Handle {
  let stopped = false;
  let raf = 0;
  const imgsP = Promise.all([load("/home/kosmicka/zadni.webp"), load("/home/kosmicka/predni.webp")]);
  const T_BOARD = 1.35;
  const T_STAND = 1.95;
  const T_COUNT = [3.0, 3.5, 4.0];
  const T_LIFT = 4.5;
  const T_IRIS = 7.0;
  const T_END = 8.5;

  const finish = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    onEnd();
  };

  void imgsP.then(([zadni, predni]) => {
    if (stopped) return;
    const { cw, ch, ctx } = setup(r);
    const S = cw / 1100; // měřítko podle šířky (návrh pro 1100 px)
    const [ru, rv] = g.toBox(g.rocket);
    const fw = 0.15 * cw;
    const fh = fw * 0.6;
    const pivot = { x: ru * cw + 0.106 * fw, y: rv * ch - 0.12 * fh };
    const half = 0.356 * fw;
    const groundY = pivot.y + 0.1 * fh;
    const [su, sv] = g.toBox(g.start);
    const hs = { x: su * cw, y: sv * ch };
    const hTarget = { x: pivot.x - 0.28 * fw, y: groundY + 0.015 * ch };
    const heroState = { cur: "idle" };
    const parts: Particle[] = [];
    const stars = Array.from({ length: 260 }, (_, i) => ({ x: rnd(i * 3 + 1), y: rnd(i * 7 + 2), par: 0.2 + rnd(i * 5 + 3) * 0.8, size: 0.6 + rnd(i) * 1.6, ph: rnd(i + 9) * 6 }));
    const clouds = Array.from({ length: 34 }, (_, i) => ({ x: rnd(i * 11 + 4) * 1.2 - 0.1, y: -(0.15 + rnd(i * 13 + 5) * 1.9), r: (60 + rnd(i * 17 + 6) * 130) * S, par: 0.9 + rnd(i * 19) * 0.5 }));
    r.rocket.style.transformOrigin = "60.6% 50%";
    r.cam.style.transformOrigin = "0 0";
    r.cam.style.willChange = "transform";
    r.hero.style.transition = "none";
    bars(r, ch, 0);
    let fired = 0;
    let last = performance.now();
    const t0 = last;
    let shiftPrev = 0;
    let vel = 0;
    let spawnAcc = 0;
    let dustOnce = false;

    const frame = (now: number) => {
      raf = 0;
      if (stopped) return;
      const t = (now - t0) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // ---- zvuk podle času
      if (fired === 0 && t > T_STAND) {
        sfx.standUp(0.9);
        fired = 1;
      }
      if (fired === 1 && t > T_COUNT[0]) {
        sfx.beep();
        fired = 2;
      }
      if (fired === 2 && t > T_COUNT[1]) {
        sfx.beep();
        fired = 3;
      }
      if (fired === 3 && t > T_COUNT[2]) {
        sfx.beep();
        fired = 4;
      }
      if (fired === 4 && t > T_LIFT) {
        sfx.beep(true);
        sfx.liftoff(3.8);
        fired = 5;
      }
      if (fired === 5 && t > T_LIFT + 2.0) {
        sfx.whoosh(1.6);
        fired = 6;
      }
      if (fired === 6 && t > T_IRIS + 0.2) {
        sfx.dock();
        fired = 7;
      }

      // ---- hrdina: cesta k raketě, skok do průlezu
      const walk = clamp(t / 1.2);
      let hx = lerp(hs.x, hTarget.x, ease(walk));
      let hy = lerp(hs.y, hTarget.y, ease(walk));
      let hsc = 1;
      let hop = 0;
      if (t >= T_BOARD) {
        const b = clamp((t - T_BOARD) / 0.5);
        hx = lerp(hTarget.x, pivot.x, ease(b));
        hy = lerp(hTarget.y, pivot.y + 0.02 * fh, ease(b)) - Math.sin(b * Math.PI) * 0.09 * ch;
        hsc = 1 - 0.75 * b;
        hop = b;
      }
      heroSprite(r, t < T_BOARD ? "walk" : "idle", heroState);
      setHero(r, hx, hy, hx < hs.x - 2 && walk < 1, hsc, hop >= 1 ? 0 : 1);

      // ---- raketa: postaví se, pak vzlétne
      const ang = (Math.PI / 2) * ease(clamp((t - T_STAND) / 0.9));
      const dx = half * (Math.cos(ang) - 1);
      const dy = -half * Math.sin(ang);
      const tau = Math.max(0, t - T_LIFT);
      const accel = 0.95 * ch;
      const rise = 0.5 * accel * tau * tau;
      const shake = t > T_STAND ? (t < T_LIFT ? 0.8 + 2.4 * sm(t, T_COUNT[0], T_LIFT) : 5 * (1 - sm(tau, 1.5, 3))) * S : 0;
      const wob = t >= T_LIFT ? Math.sin(t * 17) * 0.5 : 0;
      const jx = shake ? (Math.random() - 0.5) * shake : 0;
      const jy = shake ? (Math.random() - 0.5) * shake : 0;
      r.rocket.style.transform = `translate(-50%, -62%) translate(${dx + jx}px, ${dy - rise + jy}px) rotate(${-(ang * 180) / Math.PI + wob}deg)`;
      const tail = { x: pivot.x - half, y: pivot.y - rise };

      // ---- kamera
      const shift = Math.max(0, rise - 0.3 * ch);
      vel = (shift - shiftPrev) / Math.max(dt, 0.001);
      shiftPrev = shift;
      const alt = shift / ch;
      const zoom = 1 + 0.2 * sm(t, T_STAND, T_COUNT[2]) * (1 - sm(t, T_LIFT, T_LIFT + 1.2));
      const px = tail.x;
      const py = groundY;
      const tx = (1 - zoom) * px + jx * 0.5;
      const ty = (1 - zoom) * py + shift + jy * 0.5;
      r.cam.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
      r.sky.style.opacity = String(1 - sm(alt, 0.5, 1.9));
      r.bgDark.style.opacity = String(sm(alt, 0.45, 2.7));
      bars(r, ch, sm(t, 0, 0.6) * (1 - sm(t, T_END - 0.4, T_END)));

      // ---- odpočet
      const cd = T_COUNT.findIndex((c, i) => t >= c && t < (T_COUNT[i + 1] ?? T_LIFT));
      const label = cd >= 0 ? String(3 - cd) : t >= T_LIFT && t < T_LIFT + 0.9 ? "🚀" : "";
      if (r.count.dataset.l !== label) {
        r.count.dataset.l = label;
        r.count.textContent = label;
        r.count.style.animation = "none";
        void r.count.offsetWidth;
        r.count.style.animation = label ? "market-count 0.55s ease-out both" : "";
      }

      // ---- částice
      const ign = sm(t, T_STAND - 0.2, T_LIFT);
      const thrust = t < T_LIFT ? 0.12 + 0.35 * ign : 0.5 + 0.5 * sm(tau, 0, 1.2);
      spawnAcc += dt;
      const flameLen = (lerp(30, 140, thrust) + (t >= T_LIFT ? 170 * sm(tau, 0, 2) : 0)) * S;
      if (t > T_STAND + 0.3) {
        const rate = t < T_LIFT ? 20 + 60 * ign : 170;
        while (spawnAcc > 1 / rate) {
          spawnAcc -= 1 / rate;
          parts.push({ x: tail.x + (Math.random() - 0.5) * 0.04 * fw, y: tail.y + 0.02 * fh, vx: (Math.random() - 0.5) * 70 * S, vy: (60 + Math.random() * 90 + (t >= T_LIFT ? 160 : 0)) * S, age: 0, life: 2.4 + Math.random() * 1.8, r0: 0.03 * fw, r1: (0.1 + Math.random() * 0.1) * fw, kind: 0, seed: Math.random() });
          if (t >= T_LIFT && Math.random() < 0.4) parts.push({ x: tail.x, y: tail.y + flameLen * 0.5, vx: (Math.random() - 0.5) * 420 * S, vy: (120 + Math.random() * 260) * S, age: 0, life: 0.6 + Math.random() * 0.5, r0: 2.4 * S, r1: 0.6 * S, kind: 2, seed: Math.random() });
        }
        if (t >= T_COUNT[0] && t < T_LIFT && Math.random() < 0.55) parts.push({ x: tail.x + (Math.random() - 0.5) * 0.2 * fw, y: groundY, vx: (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 160) * S, vy: -(8 + Math.random() * 25) * S, age: 0, life: 2.6 + Math.random(), r0: 0.04 * fw, r1: (0.12 + Math.random() * 0.1) * fw, kind: 1, seed: Math.random() });
        if (t >= T_LIFT && tau < 1.6) {
          for (let i = 0; i < 3; i++) parts.push({ x: tail.x + (Math.random() - 0.5) * 0.15 * fw, y: groundY, vx: (Math.random() < 0.5 ? -1 : 1) * (200 + Math.random() * 520) * S, vy: -(10 + Math.random() * 60) * S, age: 0, life: 3 + Math.random() * 1.5, r0: 0.06 * fw, r1: (0.18 + Math.random() * 0.18) * fw, kind: 1, seed: Math.random() });
        }
      }
      if (!dustOnce && t >= T_LIFT) {
        dustOnce = true;
        for (let i = 0; i < 40; i++) parts.push({ x: tail.x + (Math.random() - 0.5) * 0.3 * fw, y: groundY + (Math.random() - 0.5) * 6, vx: (i % 2 ? 1 : -1) * (250 + Math.random() * 650) * S, vy: -(Math.random() * 40) * S, age: 0, life: 3.5 + Math.random() * 1.5, r0: 0.05 * fw, r1: (0.2 + Math.random() * 0.25) * fw, kind: 1, seed: Math.random() });
      }
      stepParticles(parts, dt);

      // ---- canvas
      ctx.clearRect(0, 0, cw, ch);
      const night = sm(alt, 0.9, 2.6);
      // hvězdy (v obrazovkových souřadnicích s paralaxou) a rychlostní čáry
      if (night > 0.01) {
        for (const s of stars) {
          const sy = (((s.y * ch + shift * s.par * 0.55) % ch) + ch) % ch;
          const sx = s.x * cw;
          const tw = 0.5 + 0.5 * Math.sin(t * 2 + s.ph);
          const len = Math.min(120 * S, vel * s.par * 0.045);
          ctx.strokeStyle = `rgba(255,255,255,${night * (0.35 + tw * 0.5) * (0.5 + s.par * 0.5)})`;
          ctx.lineWidth = s.size;
          ctx.beginPath();
          ctx.moveTo(sx, sy - len);
          ctx.lineTo(sx, sy + 0.2);
          ctx.stroke();
        }
        // planeta s prstencem sjede dolů
        const py2 = -0.9 * ch + shift * 0.3;
        if (py2 > -0.4 * ch && py2 < 1.4 * ch) {
          const pr = 0.26 * ch;
          const ppx = cw * 0.78;
          ctx.save();
          ctx.globalAlpha = night;
          ctx.translate(ppx, py2);
          ctx.rotate(-0.3);
          ctx.strokeStyle = "rgba(255,214,150,0.55)";
          ctx.lineWidth = pr * 0.12;
          ctx.beginPath();
          ctx.ellipse(0, 0, pr * 1.8, pr * 0.45, 0, Math.PI, Math.PI * 2);
          ctx.stroke();
          const pg = ctx.createRadialGradient(-pr * 0.35, -pr * 0.35, pr * 0.1, 0, 0, pr);
          pg.addColorStop(0, "#ffd18a");
          pg.addColorStop(0.6, "#e8803c");
          pg.addColorStop(1, "#6a2a14");
          ctx.fillStyle = pg;
          ctx.beginPath();
          ctx.arc(0, 0, pr, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(0, 0, pr * 1.8, pr * 0.45, 0, 0, Math.PI);
          ctx.stroke();
          ctx.restore();
        }
      }
      // oblaka: pevná ve světě, takže při stoupání padají dolů, blízká rychleji
      const cloudFade = (1 - sm(alt, 1.3, 2.3)) * sm(alt, 0.05, 0.3);
      if (cloudFade > 0.01) {
        for (const c of clouds) {
          const sy = c.y * ch + shift * c.par;
          if (sy < -c.r * 2 || sy > ch + c.r * 2) continue;
          cloud(ctx, c.x * cw, sy, c.r, 0.85 * cloudFade, 0.95);
        }
      }
      drawParticles(ctx, parts, tx, ty, zoom);

      // plamen a záře motoru
      if (t > T_STAND + 0.2 && t < T_END) {
        const sx = tx + zoom * tail.x;
        const sy = ty + zoom * (tail.y + 0.015 * fh);
        const flick = 0.85 + Math.random() * 0.3;
        const L = flameLen * flick * zoom;
        const Wd = (0.075 + 0.05 * thrust) * fw * zoom;
        ctx.globalCompositeOperation = "lighter";
        const glow = ctx.createRadialGradient(sx, sy + L * 0.25, 0, sx, sy + L * 0.25, L * 1.1 + 0.5 * fw);
        glow.addColorStop(0, `rgba(255,170,70,${0.55 * thrust * flick})`);
        glow.addColorStop(1, "rgba(255,120,40,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(sx - 2 * fw, sy - fw, 4 * fw, L * 2 + 2 * fw);
        for (const [k, col] of [[1, "rgba(255,90,30,0.75)"], [0.72, "rgba(255,170,50,0.9)"], [0.42, "rgba(255,240,170,0.95)"]] as const) {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(sx - Wd * k, sy);
          ctx.quadraticCurveTo(sx - Wd * k * 1.1, sy + L * 0.45 * k, sx, sy + L * k);
          ctx.quadraticCurveTo(sx + Wd * k * 1.1, sy + L * 0.45 * k, sx + Wd * k, sy);
          ctx.closePath();
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
        // odlesk na zemi před startem
        if (t < T_LIFT + 1.5) {
          ctx.globalCompositeOperation = "lighter";
          const gy = ty + zoom * groundY;
          const gg = ctx.createRadialGradient(sx, gy, 0, sx, gy, fw * 1.4 * zoom);
          gg.addColorStop(0, `rgba(255,150,60,${0.35 * thrust * flick})`);
          gg.addColorStop(1, "rgba(255,150,60,0)");
          ctx.fillStyle = gg;
          ctx.fillRect(sx - fw * 1.6, gy - fw, fw * 3.2, fw * 2);
          ctx.globalCompositeOperation = "source-over";
        }
      }
      // rychlostní čáry při stoupání
      if (vel > 200) {
        const a = clamp((vel - 200) / 900) * 0.5;
        ctx.strokeStyle = `rgba(255,255,255,${a})`;
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 26; i++) {
          const lx = rnd(i * 5 + Math.floor(t * 40)) * cw;
          const ly = rnd(i * 9 + Math.floor(t * 40) + 3) * ch;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx, ly + 40 * S + vel * 0.05);
          ctx.stroke();
        }
      }
      // brána stanice se otevře a pohltí raketu
      if (t > T_IRIS) {
        const ip = ease(clamp((t - T_IRIS) / 1.2));
        const R = ip * Math.hypot(cw, ch) * 0.62;
        const cx = cw * 0.5;
        const cy = ch * 0.45;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(1, R), 0, Math.PI * 2);
        ctx.clip();
        const bg = ctx.createLinearGradient(0, 0, 0, ch);
        bg.addColorStop(0, "#05061a");
        bg.addColorStop(0.55, "#12123f");
        bg.addColorStop(1, "#2a1450");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cw, ch);
        const sc = lerp(1.35, 1, ip);
        ctx.translate(cx, cy);
        ctx.scale(sc, sc);
        ctx.translate(-cx, -cy);
        ctx.drawImage(zadni, 0, 0, cw, ch);
        ctx.drawImage(predni, 0, 0, cw, ch);
        ctx.restore();
        // světelný kruh brány
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = `rgba(110,225,255,${0.9 * (1 - ip * 0.6)})`;
        ctx.lineWidth = 6 * S;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(1, R), 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(110,225,255,${0.3 * (1 - ip)})`;
        ctx.lineWidth = 22 * S;
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      }
      if (t >= T_END) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  });

  return {
    stop: () => {
      stopped = true;
      cancelAnimationFrame(raf);
    },
    skip: finish,
  };
}

// ---------------------------------------------------------------------------------------------- loď
export function runPirate(r: Refs, g: Geo, anchors: NastupAnchors, onEnd: () => void): Handle {
  let stopped = false;
  let raf = 0;
  const finish = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    onEnd();
  };
  const imgsP = Promise.all([load("/home/pristav/lod.webp"), load("/home/pristav/nastup-molo.webp"), load("/home/pristav/nastup-lavka.webp"), load("/home/mesto/hrdina-chuze.webp"), load("/home/mesto/hrdina-stoji.webp"), load("/home/mesto/hrdina-radost.webp")]);

  void imgsP.then(([ship, molo, lavka, walkImg, idleImg, joyImg]) => {
    if (stopped) return;
    const { cw, ch, ctx } = setup(r);
    const S = cw / 1100;
    r.cam.style.transformOrigin = "0 0";
    r.cam.style.willChange = "transform";
    r.hero.style.transition = "none";
    bars(r, ch, 0);
    // ---- fáze A: cesta po městečku ke schodům
    const [su, sv] = g.toBox(g.start);
    const roadPx = g.road.map((p) => g.toBox(p)).map(([u, v]) => ({ x: u * cw, y: v * ch }));
    let ci = 0;
    let bd = 1e9;
    roadPx.forEach((p, i) => {
      const d = Math.hypot(p.x - su * cw, p.y - sv * ch);
      if (d < bd) {
        bd = d;
        ci = i;
      }
    });
    const path: { x: number; y: number }[] = [{ x: su * cw, y: sv * ch }];
    for (let i = ci; i >= 0; i--) path.push(roadPx[i]);
    const endP = roadPx[0];
    path.push({ x: endP.x - 0.012 * cw, y: endP.y + 0.05 * ch });
    const cum = [0];
    for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y));
    const total = cum[cum.length - 1];
    const T_A = Math.max(2.4, Math.min(3.6, total / (0.21 * cw)));
    const along = (d: number) => {
      let i = 1;
      while (i < cum.length - 1 && cum[i] < d) i++;
      const k = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
      return { x: lerp(path[i - 1].x, path[i].x, k), y: lerp(path[i - 1].y, path[i].y, k), dir: path[i].x - path[i - 1].x };
    };
    const heroState = { cur: "idle" };
    const T_COVER = 0.6;
    const T_DRAIN = 0.7;
    const T_B = T_A + T_COVER; // tady začíná scéna B (pod vlnou)
    // ---- fáze B: molo, lávka, loď
    const WALK = 215;
    const toArt = (a: Pt) => ({ x: a[0] * 1280, y: a[1] * 512 });
    const pts = [{ x: -40, y: toArt(anchors.paluba_start).y }, toArt(anchors.paluba_start), toArt(anchors.lavka_zacatek), toArt(anchors.lavka_konec), toArt(anchors.paluba_stred)];
    const pcum = [0];
    for (let i = 1; i < pts.length; i++) pcum.push(pcum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    const pTotal = pcum[pcum.length - 1];
    const T_WALK = pTotal / WALK;
    const T_JOY = 1.0;
    const T_SAIL = T_WALK + T_JOY + 0.3;
    const T_BEND = T_SAIL + 3.2;
    const alongArt = (d: number) => {
      let i = 1;
      while (i < pcum.length - 1 && pcum[i] < d) i++;
      const k = (d - pcum[i - 1]) / Math.max(1e-6, pcum[i] - pcum[i - 1]);
      return { x: lerp(pts[i - 1].x, pts[i].x, k), y: lerp(pts[i - 1].y, pts[i].y, k) };
    };
    const foam: { x: number; y: number; age: number; life: number; w: number }[] = [];
    const spray: { x: number; y: number; vx: number; vy: number; age: number; life: number }[] = [];
    const total_t = T_B + T_DRAIN + T_BEND;
    let fired = 0;
    let last = performance.now();
    const t0 = last;
    let shipDX = 0;
    let shipV = 0;
    let stepAcc = 0;
    let camXs = 500;
    let acc = 0;

    const frame = (now: number) => {
      raf = 0;
      if (stopped) return;
      const t = (now - t0) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      bars(r, ch, sm(t, 0, 0.6) * (1 - sm(t, total_t - 0.5, total_t)));
      ctx.clearRect(0, 0, cw, ch);

      if (t < T_B) {
        // ----- A: kamera sleduje hrdinu k schodům
        const d = along(Math.min(1, t / T_A) * total);
        const walking = t < T_A;
        heroSprite(r, walking ? "walk" : "idle", heroState);
        setHero(r, d.x, d.y, d.dir < 0, 1, 1);
        if (walking) {
          stepAcc += dt;
          if (stepAcc > 0.27) {
            stepAcc = 0;
            sfx.step();
          }
        }
        const zoom = 1 + 0.95 * ease(clamp(t / (T_A + 0.2)));
        const wantX = clamp(cw / 2 - zoom * d.x, cw - zoom * cw, 0);
        const wantY = clamp(ch * 0.62 - zoom * d.y, ch - zoom * ch, 0);
        r.cam.style.transform = `translate(${wantX}px, ${wantY}px) scale(${zoom})`;
        if (fired === 0 && t > T_A - 0.1) {
          sfx.splash(1.2);
          fired = 1;
        }
        // vlna zalévá obraz
        const cover = ease(clamp((t - T_A) / T_COVER));
        if (cover > 0) drawCurtain(ctx, cw, ch, t, 1 - cover * 1.25 + 0.25, 1);
      } else {
        // ----- B
        if (fired === 1) {
          r.cam.style.opacity = "0";
          fired = 2;
          sfx.waves(5);
        }
        const tb = t - T_B - T_DRAIN * 0.0;
        const tw = Math.max(0, tb - T_DRAIN);
        // pohyb lodi
        const tsail = Math.max(0, tw - T_SAIL);
        const acc2 = 55;
        shipV = Math.min(240, acc2 * tsail);
        acc += shipV * dt;
        shipDX = acc;
        const k = (cw / 1000) * (1 + 0.14 * sm(tw, T_SAIL + 1, T_BEND));
        const wl = ch * 0.8;
        // kamera: nejdřív za hrdinou po molu, pak za lodí
        const hp = alongArt(Math.min(pTotal, Math.max(0, tw) * WALK));
        const targetX = tw < T_WALK + T_JOY ? clamp(hp.x + 130, 500, 760) : 760 + shipDX * 0.95;
        camXs = lerp(camXs, targetX, 1 - Math.exp(-3 * dt));
        const X = (ax: number) => cw / 2 + (ax - camXs) * k;
        const Y = (ay: number) => wl + (ay - 400) * k;
        // moře a obloha z obchodního canvasu (horizont je na 30 %)
        drawSea(ctx, cw, ch, tb, false);
        // ostrůvky na horizontu
        for (let i = 0; i < 3; i++) {
          const ix = ((((rnd(i + 20) * 1.6 - 0.3) * cw - camXs * 0.06 * (1 + i * 0.3)) % (cw * 1.5)) + cw * 1.5) % (cw * 1.5) - cw * 0.2;
          ctx.fillStyle = i === 1 ? "#4fa36a" : "#3f9a60";
          ctx.beginPath();
          ctx.ellipse(ix, ch * 0.3 + 2, (60 + i * 25) * S, (11 + i * 4) * S, 0, Math.PI, Math.PI * 2);
          ctx.fill();
        }
        // loď
        const frameN = Math.floor((tb / 3.6) * 12) % 12;
        const bob = Math.sin(2 * Math.PI * (frameN / 12) + 0.5) * 5;
        ctx.drawImage(ship, frameN * 640, 0, 640, 512, X(320 + shipDX), Y(0), 640 * k, 512 * k);
        // pěna a stříkance za lodí
        if (shipV > 8) {
          for (let i = 0; i < 2; i++) {
            const fx = 640 + shipDX - 220 + Math.random() * 520;
            foam.push({ x: fx, y: 402 + Math.random() * 16, age: 0, life: 2.2 + Math.random(), w: 18 + Math.random() * 28 });
          }
          if (Math.random() < shipV / 200) spray.push({ x: 640 + shipDX + 300, y: 405, vx: 60 + Math.random() * 90, vy: -(80 + Math.random() * 120), age: 0, life: 0.7 });
        }
        for (let i = foam.length - 1; i >= 0; i--) {
          const f = foam[i];
          f.age += dt;
          if (f.age > f.life) {
            foam.splice(i, 1);
            continue;
          }
          const a = (1 - f.age / f.life) * 0.7;
          ctx.strokeStyle = `rgba(255,255,255,${a})`;
          ctx.lineWidth = 2 * k;
          ctx.beginPath();
          ctx.ellipse(X(f.x), Y(f.y), f.w * k * (1 + f.age * 0.5), 3.5 * k, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        for (let i = spray.length - 1; i >= 0; i--) {
          const s = spray[i];
          s.age += dt;
          if (s.age > s.life) {
            spray.splice(i, 1);
            continue;
          }
          s.vy += 380 * dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          ctx.fillStyle = `rgba(255,255,255,${1 - s.age / s.life})`;
          ctx.beginPath();
          ctx.arc(X(s.x), Y(s.y), 2.2 * k, 0, Math.PI * 2);
          ctx.fill();
        }
        // molo před lodí, pěna u pilot
        ctx.drawImage(molo, X(0), Y(0), 1280 * k, 512 * k);
        const pil = (anchors.piloty ?? []) as Pt[];
        for (const [pu, pv] of pil) {
          const kk = (Math.sin(tb * 1.7 + pu * 30) + 1) / 2;
          ctx.strokeStyle = `rgba(255,255,255,${0.35 + kk * 0.4})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(X(pu * 1280), Y(pv * 512) + 3 * k, (20 + kk * 8) * k, 4.5 * k, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        // lávka se zvedne s odplutím
        const pull = sm(tw, T_SAIL - 0.2, T_SAIL + 0.7);
        ctx.save();
        ctx.globalAlpha = 1 - pull;
        ctx.translate(X(0) + 0, Y(0) - pull * 30 * k);
        ctx.drawImage(lavka, 0, 0, 1280 * k, 512 * k);
        ctx.restore();
        // hrdina
        let feet: { x: number; y: number };
        let img: HTMLImageElement;
        let n: number;
        let dur: number;
        if (tw < T_WALK) {
          const a = alongArt(tw * WALK);
          feet = { x: a.x, y: a.y };
          img = walkImg;
          n = 16;
          dur = 0.9;
          stepAcc += dt;
          if (stepAcc > 0.27 && a.x > 0) {
            stepAcc = 0;
            sfx.step();
          }
        } else if (tw < T_WALK + T_JOY) {
          feet = { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y };
          img = joyImg;
          n = 24;
          dur = 1.1;
        } else {
          feet = { x: pts[pts.length - 1].x + shipDX, y: pts[pts.length - 1].y - bob * 0.0 };
          img = idleImg;
          n = 24;
          dur = 3;
        }
        if (tw >= T_WALK) feet = { x: feet.x, y: feet.y - Math.sin(2 * Math.PI * (frameN / 12) + 0.5) * 5 };
        const hw = 160 * k;
        const fr = Math.floor(((tw % dur) / dur) * n) % n;
        ctx.drawImage(img, fr * 192, 0, 192, 192, X(feet.x) - hw / 2, Y(feet.y) - 0.844 * hw, hw, hw);
        // zvuky
        if (fired === 2 && tw > T_WALK + 0.2) {
          sfx.horn();
          fired = 3;
        }
        if (fired === 3 && tw > T_SAIL + 0.3) {
          sfx.gull();
          sfx.creak();
          fired = 4;
        }
        if (fired === 4 && tw > T_SAIL + 1.6) {
          sfx.gull();
          fired = 5;
        }
        // vlna, která odtéká dolů
        if (tb < T_DRAIN) {
          const p = ease(tb / T_DRAIN);
          drawCurtain(ctx, cw, ch, tb, -0.25 + p * 1.3, -1);
        }
        // bílá mlha při příjezdu do přístavu
        const fade = sm(tw, T_BEND - 0.8, T_BEND);
        if (fade > 0) {
          ctx.fillStyle = `rgba(207,232,255,${fade})`;
          ctx.fillRect(0, 0, cw, ch);
        }
        if (tb >= T_DRAIN + T_BEND) {
          finish();
          return;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  });

  return {
    stop: () => {
      stopped = true;
      cancelAnimationFrame(raf);
    },
    skip: finish,
  };
}

// Vlnitá voda, která přes obraz buď stoupá (dir 1), nebo klesá (dir -1). `top` je poloha hrany v poměru výšky.
function drawCurtain(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, top: number, dir: 1 | -1) {
  void dir;
  const y0 = top * h;
  ctx.save();
  const g = ctx.createLinearGradient(0, y0, 0, y0 + h);
  g.addColorStop(0, "#5fd0ff");
  g.addColorStop(0.15, "#2aa6e8");
  g.addColorStop(1, "#14529c");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, h + 20);
  for (let x = 0; x <= w; x += 10) {
    const y = y0 + Math.sin(x * 0.018 + t * 6) * 12 + Math.sin(x * 0.047 - t * 9) * 6;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h + 20);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 10) {
    const y = y0 + Math.sin(x * 0.018 + t * 6) * 12 + Math.sin(x * 0.047 - t * 9) * 6;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  for (let i = 0; i < 40; i++) {
    const x = rnd(i + Math.floor(t * 8)) * w;
    const y = y0 - rnd(i * 3 + Math.floor(t * 8)) * 40 + Math.sin(x * 0.018 + t * 6) * 12;
    ctx.beginPath();
    ctx.arc(x, y, 1.5 + rnd(i * 7) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
