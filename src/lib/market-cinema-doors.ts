import { sfx } from "@/lib/market-sfx";
import { clamp, ease, lerp, readCam, rnd, setup, sm, type Handle, type Pt, type Refs } from "@/lib/market-cinema";
import { glow, bars } from "@/lib/market-cinema-worlds";

// Vstup do budovy v městečku (škola, herna, věž slávy, náměstí, nástěnka, studovna, pokojík, domek na stromě).
// Kamera najede na dveře, dveře se rozletí, z budovy vyšlehne světlo a každá budova má vlastní efekty (stránky z knih, neon a pixely,
// reflektory a poháry, mince, lístky, hvězdy, srdíčka, listí). Hrdina vejde dovnitř, obraz se rozzáří barvou budovy a začne další stránka.
// Vše se kreslí do průhledného plátna nad městečkem, takže zůstanou živé postavy i zvířata.

export type DoorKind = "kurzy" | "hry" | "zebricky" | "obchod" | "ukoly" | "uceni" | "pokoj" | "profil";
type R = Pick<Refs, "box" | "cam" | "cv" | "hero" | "heroSpr">;

type P = { x: number; y: number; vx: number; vy: number; age: number; life: number; r: number; k: string; rot: number; vr: number; c: string; seed: number };

type Style = {
  light: string; // rgb světla ze dveří
  edge: string; // barva rámu dveří
  inner: [string, string]; // vnitřek (nahoře, dole)
  wash: string; // rgb závěrečného zalití
  arch: boolean;
  sound: "horn" | "dock" | "pop" | "creak" | "splash";
};

const STYLE: Record<DoorKind, Style> = {
  kurzy: { light: "255,226,150", edge: "#7a4aa0", inner: ["#ffe9b0", "#ffb860"], wash: "255,236,190", arch: true, sound: "dock" },
  hry: { light: "170,140,255", edge: "#ff5fa2", inner: ["#5a3cff", "#18104a"], wash: "190,170,255", arch: false, sound: "pop" },
  zebricky: { light: "255,220,120", edge: "#2f8a9a", inner: ["#fff1b0", "#ffc83a"], wash: "255,240,170", arch: true, sound: "horn" },
  obchod: { light: "255,190,110", edge: "#c0392b", inner: ["#ffd8a0", "#ff9a4a"], wash: "255,214,160", arch: false, sound: "pop" },
  ukoly: { light: "255,235,170", edge: "#8a5a2e", inner: ["#fff3c8", "#e8c070"], wash: "255,243,200", arch: false, sound: "creak" },
  uceni: { light: "150,200,255", edge: "#3b6fd8", inner: ["#2a3a8a", "#0a1038"], wash: "170,210,255", arch: true, sound: "pop" },
  pokoj: { light: "255,196,140", edge: "#c95a3a", inner: ["#ffe2c0", "#ff9a70"], wash: "255,222,190", arch: false, sound: "dock" },
  profil: { light: "190,255,150", edge: "#2f8a4a", inner: ["#e8ffb8", "#7ad880"], wash: "220,255,180", arch: true, sound: "pop" },
};

const COLORS = ["#ff6b4a", "#ffc933", "#ff8ad0", "#7ee0b0", "#8fd0ff", "#c9a0ff"];

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rr = i % 2 ? r * 0.38 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function heart(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.9);
  ctx.bezierCurveTo(x - r * 1.3, y, x - r * 0.9, y - r * 1.0, x, y - r * 0.4);
  ctx.bezierCurveTo(x + r * 0.9, y - r * 1.0, x + r * 1.3, y, x, y + r * 0.9);
  ctx.fill();
}

function drawParticle(ctx: CanvasRenderingContext2D, p: P, a: number, K: number) {
  const r = p.r * K * 1.9;
  ctx.globalAlpha = a;
  if (p.k === "spark") {
    ctx.globalCompositeOperation = "lighter";
    glow(ctx, p.x, p.y, r * 4, p.c, a);
    ctx.globalCompositeOperation = "source-over";
  } else if (p.k === "page") {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, Math.cos(p.rot * 2.3));
    ctx.fillStyle = "#fff8e6";
    ctx.fillRect(-r * 1.1, -r * 1.5, r * 2.2, r * 3);
    ctx.fillStyle = "rgba(90,70,60,0.55)";
    for (let i = 0; i < 4; i++) ctx.fillRect(-r * 0.8, -r * 1.1 + i * r * 0.7, r * 1.6, r * 0.14);
    ctx.restore();
  } else if (p.k === "pixel") {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.c;
    ctx.fillRect(-r * 0.6, -r * 0.6, r * 1.2, r * 1.2);
    ctx.restore();
  } else if (p.k === "coin") {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(Math.abs(Math.cos(p.rot)) * 0.9 + 0.1, 1);
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c98a10";
    ctx.lineWidth = Math.max(1, r * 0.2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(-r * 0.15, -r * 0.55, r * 0.3, r * 1.1);
    ctx.restore();
  } else if (p.k === "star") {
    ctx.fillStyle = p.c;
    star(ctx, p.x, p.y, r, p.rot);
  } else if (p.k === "heart") {
    ctx.fillStyle = p.c;
    heart(ctx, p.x, p.y, r);
  } else if (p.k === "leaf") {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, 0.5 + 0.5 * Math.sin(p.rot * 2));
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.6, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (p.k === "note") {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot * 0.3);
    ctx.fillStyle = p.c;
    ctx.fillRect(-r * 1.2, -r * 1.4, r * 2.4, r * 2.8);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    for (let i = 0; i < 3; i++) ctx.fillRect(-r * 0.9, -r * 0.9 + i * r * 0.7, r * 1.8, r * 0.14);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function emit(list: P[], kind: DoorKind, x: number, y: number, K: number, t: number, seed: number) {
  const mk = (k: string, o: Partial<P>) => list.push({ x, y, vx: 0, vy: 0, age: 0, life: 1.6, r: 3, k, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 6, c: "255,244,170", seed, ...o });
  const r = Math.random;
  const spread = (w: number) => (r() - 0.5) * w * K;
  if (kind === "kurzy") {
    if (r() < 0.6) mk("page", { x: x + spread(28), y: y - 22 * K, vx: spread(110), vy: -(70 + r() * 110) * K, life: 2 + r(), r: (4 + r() * 3) * K * 0.3, vr: (r() - 0.5) * 7 });
    if (r() < 0.4) mk("spark", { x: x + spread(30), y: y - 30 * K, vx: spread(60), vy: -(30 + r() * 50) * K, life: 1.2, r: 2.2 * K * 0.4, c: "255,226,150" });
  } else if (kind === "hry") {
    if (r() < 0.9) mk("pixel", { x: x + spread(30), y: y - 28 * K, vx: spread(190), vy: -(80 + r() * 170) * K, life: 1.6 + r() * 0.6, r: (3 + r() * 3) * K * 0.5, c: ["#ff5fa2", "#35d0ff", "#ffd23f", "#9a6bff", "#5af0a0"][Math.floor(r() * 5)], vr: (r() - 0.5) * 9 });
  } else if (kind === "zebricky") {
    if (r() < 0.7) mk("star", { x: x + spread(34), y: y - 30 * K, vx: spread(120), vy: -(60 + r() * 130) * K, life: 1.8 + r(), r: (3 + r() * 4) * K * 0.5, c: ["#ffd23f", "#fff1b0", "#ff9a3c"][Math.floor(r() * 3)], vr: (r() - 0.5) * 5 });
    if (r() < 0.5) mk("pixel", { x: x + spread(40), y: y - 50 * K, vx: spread(60), vy: (20 + r() * 40) * K, life: 2.2, r: 2.4 * K * 0.5, c: COLORS[Math.floor(r() * COLORS.length)] });
  } else if (kind === "obchod") {
    if (r() < 0.8) mk("coin", { x: x + spread(30), y: y - 36 * K, vx: spread(130), vy: -(120 + r() * 150) * K, life: 1.8, r: (4 + r() * 2) * K * 0.5, vr: 9 + r() * 6 });
  } else if (kind === "ukoly") {
    if (r() < 0.6) mk("note", { x: x + spread(26), y: y - 26 * K, vx: spread(90), vy: -(50 + r() * 90) * K, life: 2.2, r: (3 + r() * 2) * K * 0.5, c: ["#fff3a8", "#ffc8e0", "#bfe8ff"][Math.floor(r() * 3)] });
  } else if (kind === "uceni") {
    if (r() < 0.8) mk("star", { x: x + spread(60), y: y - 40 * K - r() * 40 * K, vx: spread(40), vy: -(10 + r() * 40) * K, life: 1.8 + r(), r: (2 + r() * 3) * K * 0.5, c: "#e8f2ff", vr: 2 });
  } else if (kind === "pokoj") {
    if (r() < 0.5) mk("heart", { x: x + spread(24), y: y - 26 * K, vx: spread(40), vy: -(40 + r() * 60) * K, life: 2.2, r: (3 + r() * 2) * K * 0.5, c: ["#ff6b8a", "#ff9ac0", "#ffc0d0"][Math.floor(r() * 3)] });
    if (r() < 0.4) mk("spark", { x: x + spread(30), y: y - 30 * K, vx: spread(40), vy: -(20 + r() * 40) * K, life: 1.4, r: 2 * K * 0.4, c: "255,200,140" });
  } else if (kind === "profil") {
    if (r() < 0.8) mk("leaf", { x: x + spread(60), y: y - 40 * K + spread(40), vx: (r() - 0.5) * 120 * K, vy: -(30 + r() * 60) * K, life: 2.4, r: (3 + r() * 2) * K * 0.5, c: ["#7ad880", "#5fb86a", "#b6e870"][Math.floor(r() * 3)] });
    if (r() < 0.4) mk("spark", { x: x + spread(60), y: y - 30 * K + spread(40), vx: spread(30), vy: -(10 + r() * 30) * K, life: 1.8, r: 2.2 * K * 0.4, c: "230,255,150" });
  }
  void t;
}

/** Vstup do budovy `kind`; `door` je dolní střed dveří (zlomek boxu). */
export function runEnter(r: R, door: Pt, kind: DoorKind, onEnd: () => void, flip = false): Handle {
  let stopped = false;
  let raf = 0;
  const finish = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    onEnd();
  };
  const st = STYLE[kind];
  const { cw, ch, ctx } = setup(r as Refs);
  r.cam.style.transformOrigin = "0 0";
  r.cam.style.willChange = "transform";
  const cam0 = readCam(r.cam);
  const dx = door[0] * cw;
  const dy = door[1] * ch;
  const parts: P[] = [];
  const T_OPEN = 0.35; // dveře se otevírají
  const T_WALK = 1.15; // hrdina vchází
  const T_WASH = 2.5; // zalití barvou
  const T_END = 3.3;
  let last = performance.now();
  const t0 = last;
  let zx = cam0.x;
  let zy = cam0.y;
  let zs = cam0.s;
  let acc = 0;
  let sfxDone = 0;
  const hx0 = parseFloat(r.hero.style.left) || dx;
  const hy0 = parseFloat(r.hero.style.top) || dy;
  r.hero.style.transition = "none";
  r.hero.style.zIndex = "90"; // hrdina je nad efekty, takže je vidět, jak vchází do dveří

  const frame = (now: number) => {
    raf = 0;
    if (stopped) return;
    const t = (now - t0) / 1000;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // kamera: plynulý dolly ke dveřím s lehkým zhoupnutím
    const zoom = 1 + 2.1 * ease(clamp(t / 1.2)) + 0.18 * sm(t, T_WALK, T_END);
    const focusY = dy - 0.035 * ch;
    const wantX = clamp(cw / 2 - zoom * dx, cw - zoom * cw, 0);
    const wantY = clamp(ch * 0.58 - zoom * focusY, ch - zoom * ch, 0);
    const k = 1 - Math.exp(-6 * dt);
    zx = lerp(zx, wantX, k);
    zy = lerp(zy, wantY, k);
    zs = lerp(zs, zoom, k);
    r.cam.style.transform = `translate(${zx}px, ${zy}px) scale(${zs})`;
    const K = (zs * cw) / 1000;
    const sx = zx + zs * dx;
    const sy = zy + zs * dy;

    // hrdina: postaví se ke dveřím, pak vejde dovnitř
    const open = ease(clamp((t - T_OPEN) / 0.55));
    const go = ease(clamp((t - T_WALK) / 0.75));
    const hx = lerp(hx0, dx + (flip ? -2 : 2) * K * 0.0, ease(clamp(t / 0.6)));
    r.hero.style.left = `${hx}px`;
    r.hero.style.top = `${lerp(hy0, dy + 2, ease(clamp(t / 0.6))) - go * 6 * K * 0}px`;
    const sc = 1 - 0.42 * go;
    r.hero.style.opacity = String(1 - sm(go, 0.6, 1));
    r.hero.style.transformOrigin = "50% 84.4%";
    r.hero.style.transform = `translate(-50%, -84.4%) translateY(${-go * 14}px) scale(${flip ? -sc : sc}, ${sc})`;

    // zvuky
    if (sfxDone === 0 && t > T_OPEN) {
      sfxDone = 1;
      sfx.creak();
    }
    if (sfxDone === 1 && t > T_OPEN + 0.3) {
      sfxDone = 2;
      if (st.sound === "horn") sfx.horn();
      else if (st.sound === "dock") sfx.dock();
      else if (st.sound === "pop") sfx.pop();
      else if (st.sound === "creak") sfx.creak();
      else sfx.splash(1);
    }

    // efekty
    ctx.clearRect(0, 0, cw, ch);
    const w = 17 * K;
    const h = 52 * K;
    // světlo, které se rozlévá po zemi před dveřmi
    ctx.globalCompositeOperation = "lighter";
    glow(ctx, sx, sy - 18 * K, 120 * K * open + 1, st.light, 0.45 * open);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.fillStyle = `rgba(${st.light},${0.22 * open})`;
    ctx.beginPath();
    ctx.moveTo(-w * 0.9, -2 * K);
    ctx.lineTo(w * 0.9, -2 * K);
    ctx.lineTo(w * (1.6 + 2.4 * open), 34 * K * open);
    ctx.lineTo(-w * (1.6 + 2.4 * open), 34 * K * open);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
    // zář: paprsky ze dveří a rázová vlna při otevření
    if (open > 0.02) {
      ctx.globalCompositeOperation = "lighter";
      const rays = 14;
      for (let i = 0; i < rays; i++) {
        const a0 = (i / rays) * Math.PI * 2 + t * 0.35;
        const len = (150 + 70 * Math.sin(t * 3 + i * 1.7)) * K * open;
        const g = ctx.createRadialGradient(sx, sy - h / 2, 0, sx, sy - h / 2, len);
        g.addColorStop(0, `rgba(${st.light},${0.32 * open})`);
        g.addColorStop(1, `rgba(${st.light},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(sx, sy - h / 2);
        ctx.arc(sx, sy - h / 2, len, a0 - 0.06, a0 + 0.06);
        ctx.closePath();
        ctx.fill();
      }
      for (let i = 0; i < 2; i++) {
        const u = clamp((t - T_OPEN - 0.15 - i * 0.28) / 0.9);
        if (u > 0 && u < 1) {
          ctx.strokeStyle = `rgba(${st.light},${0.55 * (1 - u)})`;
          ctx.lineWidth = (5 - 3 * u) * K;
          ctx.beginPath();
          ctx.ellipse(sx, sy - h / 2, (20 + 190 * ease(u)) * K, (16 + 150 * ease(u)) * K, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    }
    // otevřené dveře: vnitřek budovy a křídlo, které se otáčí kolem pantů
    if (open > 0.02) {
      ctx.save();
      ctx.beginPath();
      if (st.arch) {
        ctx.moveTo(sx - w, sy);
        ctx.lineTo(sx - w, sy - h + w);
        ctx.arc(sx, sy - h + w, w, Math.PI, 0);
        ctx.lineTo(sx + w, sy);
      } else {
        ctx.rect(sx - w, sy - h, w * 2, h);
      }
      ctx.closePath();
      const ig = ctx.createLinearGradient(0, sy - h, 0, sy);
      ig.addColorStop(0, st.inner[0]);
      ig.addColorStop(1, st.inner[1]);
      ctx.globalAlpha = open;
      ctx.fillStyle = ig;
      ctx.fill();
      ctx.clip();
      // sloupy světla uvnitř
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 3; i++) {
        const lx = sx - w + (i + 0.5) * ((w * 2) / 3) + Math.sin(t * 2 + i) * 2 * K;
        ctx.fillStyle = `rgba(255,255,255,${0.1 * open})`;
        ctx.fillRect(lx - 2 * K, sy - h, 4 * K, h);
      }
      ctx.globalCompositeOperation = "source-over";
      // křídlo
      const leaf = Math.max(0.06, 1 - open * 0.94);
      ctx.fillStyle = st.edge;
      ctx.fillRect(sx - w, sy - h, w * 2 * leaf * 0.5, h);
      ctx.restore();
      ctx.strokeStyle = st.edge;
      ctx.lineWidth = 2.2 * K;
      ctx.globalAlpha = open;
      ctx.beginPath();
      if (st.arch) {
        ctx.moveTo(sx - w, sy);
        ctx.lineTo(sx - w, sy - h + w);
        ctx.arc(sx, sy - h + w, w, Math.PI, 0);
        ctx.lineTo(sx + w, sy);
      } else ctx.rect(sx - w, sy - h, w * 2, h);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // vlastní efekty budovy
    const active = clamp((t - T_OPEN - 0.1) / 0.2) * (1 - sm(t, T_WASH - 0.3, T_WASH));
    acc += dt * 130 * active;
    while (acc >= 1) {
      acc -= 1;
      emit(parts, kind, sx, sy, K, t, 0);
    }
    if (kind === "zebricky" || kind === "uceni") {
      // reflektory (žlutě) nebo paprsek dalekohledu (modře) z budovy
      ctx.globalCompositeOperation = "lighter";
      const beams = kind === "zebricky" ? [-0.5, 0, 0.5] : [-0.18];
      for (const b of beams) {
        const ang = -Math.PI / 2 + b + Math.sin(t * 2 + b * 4) * 0.12;
        const len = (kind === "zebricky" ? 260 : 320) * K * open;
        const g = ctx.createLinearGradient(sx, sy - h, sx + Math.cos(ang) * len, sy - h + Math.sin(ang) * len);
        g.addColorStop(0, `rgba(${st.light},${0.42 * open})`);
        g.addColorStop(1, `rgba(${st.light},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(sx - 5 * K, sy - h);
        ctx.lineTo(sx + 5 * K, sy - h);
        ctx.lineTo(sx + Math.cos(ang) * len + 36 * K, sy - h + Math.sin(ang) * len);
        ctx.lineTo(sx + Math.cos(ang) * len - 36 * K, sy - h + Math.sin(ang) * len);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }
    if (kind === "hry") {
      // neonové blikání okolo dveří
      const fl = 0.55 + 0.45 * Math.sin(t * 22);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `rgba(255,95,162,${0.8 * fl * open})`;
      ctx.lineWidth = 3 * K;
      ctx.strokeRect(sx - w - 5 * K, sy - h - 5 * K, (w + 5 * K) * 2, h + 5 * K);
      ctx.strokeStyle = `rgba(53,208,255,${0.7 * (1 - fl) * open})`;
      ctx.strokeRect(sx - w - 9 * K, sy - h - 9 * K, (w + 9 * K) * 2, h + 9 * K);
      ctx.globalCompositeOperation = "source-over";
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.age += dt;
      if (p.age > p.life) {
        parts.splice(i, 1);
        continue;
      }
      const grav = p.k === "coin" || p.k === "pixel" || p.k === "page" || p.k === "note" ? 280 * K : p.k === "leaf" ? 18 * K : p.k === "heart" ? -10 * K : 0;
      p.vy += grav * dt;
      p.x += (p.vx + (p.k === "leaf" || p.k === "page" || p.k === "note" ? Math.sin(t * 3 + p.seed + i) * 40 * K : 0)) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const a = Math.min(1, p.age / 0.15) * Math.min(1, (p.life - p.age) / 0.5);
      drawParticle(ctx, p, a, 1);
    }

    // závěr: světlo budovy zaplaví obraz
    const wash = sm(t, T_WASH, T_END);
    if (wash > 0) {
      ctx.globalCompositeOperation = "lighter";
      const R = Math.max(cw, ch) * 1.5 * ease(wash);
      const g = ctx.createRadialGradient(sx, sy - 24 * K, 0, sx, sy - 24 * K, Math.max(1, R));
      g.addColorStop(0, `rgba(${st.wash},1)`);
      g.addColorStop(0.6, `rgba(${st.wash},0.85)`);
      g.addColorStop(1, `rgba(${st.wash},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = "source-over";
      if (wash > 0.85) {
        ctx.fillStyle = `rgba(${st.wash},${(wash - 0.85) / 0.15})`;
        ctx.fillRect(0, 0, cw, ch);
      }
    }
    bars(ctx, cw, ch, sm(t, 0, 0.5) * (1 - sm(t, T_END - 0.3, T_END)));
    if (t >= T_END) {
      finish();
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return {
    stop: () => {
      stopped = true;
      cancelAnimationFrame(raf);
    },
    skip: finish,
  };
}
