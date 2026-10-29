import { sfx } from "@/lib/market-sfx";
import { clamp, ease, heroSprite, lerp, load, readCam, rnd, setHero, setup, sm, type Geo, type Handle, type Refs } from "@/lib/market-cinema";

// Filmové vstupy do tří světů obchodu (městečko zůstává v DOMu, efekty se kreslí do canvasu nad ním):
//  - les: světlušky a víla se slétnou ke zářícímu kmeni, hrdina vejde dovnitř, listí se zavíří a les zaplaví světlo,
//  - hrad: zazní roh, padací mříž se zvedne, pochodně vzplanou, hrdina projde bránou do tmy se zlatým světlem,
//  - moře: hrdina skočí z věže do laguny, potápí se mezi rybami a medúzami k zářícímu podmořskému městu.
// Vše jsou procedurální kresby, takže nepotřebují další obrázky (kromě hrdiny a ponorky, které už hub načítá).

type R = Pick<Refs, "box" | "cam" | "cv" | "hero" | "heroSpr">;
export type WorldKind = "forest" | "castle" | "sea";
type Spark = { x: number; y: number; vx: number; vy: number; age: number; life: number; r: number; kind: number; rot: number };
type Frame = { ctx: CanvasRenderingContext2D; cw: number; ch: number; t: number; tau: number; dt: number; sx: number; sy: number; K: number; hx: number; hy: number; sparks: Spark[] };

const TE: Record<WorldKind, number> = { forest: 6.0, castle: 6.4, sea: 7.0 };

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a: number) {
  if (a <= 0 || r < 1) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(0.45, `rgba(${rgb},${a * 0.4})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function bars(ctx: CanvasRenderingContext2D, cw: number, ch: number, k: number) {
  ctx.fillStyle = "#000";
  const h = ch * 0.075 * k;
  ctx.fillRect(0, 0, cw, h);
  ctx.fillRect(0, ch - h, cw, h);
}

function pushSpark(list: Spark[], s: Partial<Spark> & { x: number; y: number }) {
  list.push({ vx: 0, vy: 0, age: 0, life: 1, r: 2, kind: 0, rot: 0, ...s });
}

// kind: 0 jiskra, 1 list, 2 okvětní plátek, 3 ohnivý uhlík, 4 prach, 5 kapka, 6 bublina
function stepSparks(f: Frame, grav: number) {
  const { ctx, sparks, dt } = f;
  for (let i = sparks.length - 1; i >= 0; i--) {
    const p = sparks[i];
    p.age += dt;
    if (p.age > p.life) {
      sparks.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += (p.kind === 5 ? 700 : p.kind === 6 ? -60 : p.kind === 4 ? -6 : grav) * dt;
    p.rot += dt * (1 + (i % 5));
    const a = 1 - p.age / p.life;
    if (p.kind === 0 || p.kind === 3) {
      ctx.globalCompositeOperation = "lighter";
      glow(ctx, p.x, p.y, p.r * 4 * (0.5 + a), p.kind === 3 ? "255,150,60" : "255,244,170", a);
      ctx.globalCompositeOperation = "source-over";
    } else if (p.kind === 1 || p.kind === 2) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, 0.55 + 0.45 * Math.sin(p.rot * 2));
      ctx.fillStyle = p.kind === 1 ? `rgba(${100 + (i % 4) * 25},${190 + (i % 3) * 20},${70},${Math.min(1, a * 1.6)})` : `rgba(255,${170 + (i % 3) * 25},${200},${Math.min(1, a * 1.6)})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 1.7, p.r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.kind === 4) {
      glow(ctx, p.x, p.y, p.r * (1.5 - a * 0.4) * 4, "190,170,150", 0.35 * a);
    } else if (p.kind === 5) {
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * a + 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = `rgba(235,255,255,${0.75 * a})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// ------------------------------------------------------------------------------------------------ les
function forestFx(f: Frame, fairyPos: { x: number; y: number }) {
  const { ctx, cw, ch, t, tau, K, sx, sy, sparks } = f;
  const cx = sx - 20 * K;
  const cy = sy - 50 * K;
  const arrive = sm(tau, 0, 1.2);
  // záře kmene sílí a pulzuje
  ctx.globalCompositeOperation = "lighter";
  glow(ctx, cx, cy, (70 + 40 * Math.sin(t * 3)) * K * (0.5 + arrive), "255,246,170", 0.5 * arrive);
  // světlušky se slétají od okrajů a krouží do dveří
  for (let i = 0; i < 46; i++) {
    const delay = rnd(i) * 1.1;
    const k = clamp((tau - delay) / (1.5 + rnd(i + 5) * 1.0));
    if (k <= 0) continue;
    const a0 = rnd(i + 11) * Math.PI * 2;
    const r0 = (160 + rnd(i + 21) * 260) * K;
    const sp = a0 + k * 5 + t * 0.6;
    const rr = r0 * (1 - ease(k));
    const px = cx + Math.cos(sp) * rr;
    const py = cy + Math.sin(sp) * rr * 0.6 - 30 * K * (1 - k);
    const fl = 0.55 + 0.45 * Math.sin(t * 9 + i * 1.7);
    glow(ctx, px, py, 7 * K * (0.6 + 0.6 * fl), "230,255,140", Math.min(1, k * 4) * (1 - sm(k, 0.92, 1)) * fl);
  }
  ctx.globalCompositeOperation = "source-over";
  // víla: smyčky kolem hrdiny, pak vletí do kmene
  const fk = clamp((tau - 0.25) / 2.1);
  if (fk > 0 && fk < 1) {
    const x = fairyPos.x;
    const y = fairyPos.y;
    ctx.globalCompositeOperation = "lighter";
    glow(ctx, x, y, 34 * K, "255,210,250", 0.9);
    glow(ctx, x, y, 12 * K, "255,255,255", 1);
    ctx.globalCompositeOperation = "source-over";
    const flap = Math.sin(t * 46);
    ctx.fillStyle = "rgba(220,245,255,0.75)";
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(s * (0.5 + 0.5 * flap));
      ctx.beginPath();
      ctx.ellipse(s * 9 * K, -6 * K, 11 * K, 5 * K, s * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (let i = 0; i < 2; i++) pushSpark(sparks, { x: x + (Math.random() - 0.5) * 6 * K, y: y + 4 * K, vx: (Math.random() - 0.5) * 30, vy: 20 + Math.random() * 30, life: 0.9, r: 1.6 * K, kind: 0 });
  }
  // listí se zavíří do dveří
  const vort = sm(tau, 0.6, 1.6) * (1 - sm(tau, 3.4, 4.3));
  if (vort > 0 && Math.random() < 0.5 + 0.4 * vort) {
    const a = Math.random() * Math.PI * 2;
    const r = (90 + Math.random() * 120) * K;
    pushSpark(sparks, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.6, vx: -Math.sin(a) * 140 * K * 0.5, vy: -30 - Math.random() * 40, life: 1.6 + Math.random(), r: (3 + Math.random() * 3) * K * 0.5, kind: Math.random() < 0.7 ? 1 : 2, rot: Math.random() * 6 });
  }
  // světlo zaplaví obraz
  const fl = sm(tau, 2.5, 4.9);
  if (fl > 0) {
    const R = Math.max(cw, ch) * 1.5 * ease(fl);
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, R));
    g.addColorStop(0, "rgba(255,252,200,1)");
    g.addColorStop(0.55, "rgba(190,255,150,0.85)");
    g.addColorStop(1, "rgba(110,215,120,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = "source-over";
  }
  const wf = sm(tau, 4.7, 5.9);
  if (wf > 0) {
    ctx.fillStyle = `rgba(232,255,176,${wf})`;
    ctx.fillRect(0, 0, cw, ch);
  }
}

// ------------------------------------------------------------------------------------------------ hrad
function castleFx(f: Frame) {
  const { ctx, cw, ch, t, tau, K, sx, sy, sparks } = f;
  const W = 68 * K;
  const H = 72 * K;
  const gx = sx + 10 * K;
  const gy = sy - 33 * K;
  const top = gy - H;
  const open = ease(sm(tau, 0.55, 2.2));
  // světlo za bránou a kužel na dlažbě
  ctx.save();
  ctx.beginPath();
  ctx.rect(gx - W / 2, top + W / 2, W, H - W / 2);
  ctx.arc(gx, top + W / 2, W / 2, Math.PI, 0);
  ctx.closePath();
  ctx.clip();
  const g = ctx.createLinearGradient(0, top, 0, gy);
  g.addColorStop(0, "#2a1a14");
  g.addColorStop(1, `rgba(${Math.round(lerp(40, 255, open))},${Math.round(lerp(26, 190, open))},${Math.round(lerp(20, 90, open))},1)`);
  ctx.fillStyle = g;
  ctx.fillRect(gx - W, top - W, W * 2, H + W * 2);
  // padací mříž
  const lift = open * (H + 10 * K);
  ctx.strokeStyle = "#16141c";
  ctx.lineWidth = 3.6 * K;
  for (let i = 0; i < 7; i++) {
    const x = gx - W / 2 + ((i + 0.5) / 7) * W;
    ctx.beginPath();
    ctx.moveTo(x, top - lift);
    ctx.lineTo(x, gy - lift);
    ctx.stroke();
  }
  ctx.lineWidth = 3 * K;
  for (let j = 0; j < 5; j++) {
    const y = top + (j + 0.5) * (H / 5) - lift;
    ctx.beginPath();
    ctx.moveTo(gx - W / 2, y);
    ctx.lineTo(gx + W / 2, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(160,160,180,0.35)";
  ctx.lineWidth = 1.2 * K;
  for (let i = 0; i < 7; i++) {
    const x = gx - W / 2 + ((i + 0.5) / 7) * W - K;
    ctx.beginPath();
    ctx.moveTo(x, top - lift);
    ctx.lineTo(x, gy - lift);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalCompositeOperation = "lighter";
  glow(ctx, gx, gy - 24 * K, 120 * K * open, "255,196,100", 0.45 * open);
  // pochodně po stranách
  for (const s of [-1, 1]) {
    const fx = gx + s * (W / 2 + 18 * K);
    const fy = gy - 40 * K;
    const fl = 0.7 + 0.3 * Math.sin(t * 17 + s) + 0.15 * Math.random();
    glow(ctx, fx, fy - 6 * K, 70 * K * fl * (0.6 + 0.6 * sm(tau, 0, 0.6)), "255,160,60", 0.55);
    ctx.fillStyle = `rgba(255,${Math.round(150 + 80 * fl)},70,0.95)`;
    ctx.beginPath();
    ctx.moveTo(fx - 5 * K, fy);
    ctx.quadraticCurveTo(fx - 7 * K, fy - 12 * K * fl, fx, fy - 22 * K * fl);
    ctx.quadraticCurveTo(fx + 7 * K, fy - 12 * K * fl, fx + 5 * K, fy);
    ctx.closePath();
    ctx.fill();
    if (Math.random() < 0.5) pushSpark(sparks, { x: fx + (Math.random() - 0.5) * 6 * K, y: fy - 18 * K, vx: (Math.random() - 0.5) * 30, vy: -50 - Math.random() * 60, life: 1 + Math.random() * 0.8, r: 1.4 * K, kind: 3 });
  }
  ctx.globalCompositeOperation = "source-over";
  // prach, když se mříž zvedne
  if (tau > 2.15 && tau < 2.25 && Math.random() < 0.9) for (let i = 0; i < 4; i++) pushSpark(sparks, { x: gx + (Math.random() - 0.5) * W, y: top, vx: (Math.random() - 0.5) * 90, vy: 20 + Math.random() * 30, life: 1.5, r: 5 * K, kind: 4 });
  // tma pohltí obraz
  const u = sm(tau, 3.1, 5.4);
  if (u > 0) {
    const R = Math.max(cw, ch) * 1.35 * ease(u);
    const g3 = ctx.createRadialGradient(gx, gy - 30 * K, 0, gx, gy - 30 * K, Math.max(1, R));
    g3.addColorStop(0, "rgba(255,200,110,1)");
    g3.addColorStop(0.18, "rgba(60,36,28,1)");
    g3.addColorStop(0.7, "rgba(22,14,28,0.97)");
    g3.addColorStop(1, "rgba(22,14,28,0)");
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, cw, ch);
  }
  const wf = sm(tau, 5.2, 6.2);
  if (wf > 0) {
    ctx.fillStyle = `rgba(26,16,32,${wf})`;
    ctx.fillRect(0, 0, cw, ch);
  }
}

// ------------------------------------------------------------------------------------------------ moře
function fish(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, dir: number, hue: number, t: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  const wag = Math.sin(t * 9 + x * 0.05) * 0.35;
  ctx.fillStyle = `hsl(${hue},85%,62%)`;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-12 * s, 0);
  ctx.lineTo(-24 * s, (-8 + wag * 6) * s);
  ctx.lineTo(-24 * s, (8 + wag * 6) * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `hsl(${hue + 20},90%,85%)`;
  ctx.beginPath();
  ctx.ellipse(2 * s, 2 * s, 8 * s, 3 * s, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = "#12304a";
  ctx.beginPath();
  ctx.arc(8 * s, -2 * s, 1.8 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function jelly(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, t: number, hue: number) {
  const p = 0.85 + 0.15 * Math.sin(t * 3 + x);
  ctx.globalCompositeOperation = "lighter";
  glow(ctx, x, y, 46 * s, `${hue === 0 ? "255,150,230" : "150,230,255"}`, 0.35);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = hue === 0 ? "rgba(255,170,235,0.7)" : "rgba(160,235,255,0.7)";
  ctx.beginPath();
  ctx.ellipse(x, y, 20 * s * p, 15 * s / p, 0, Math.PI, 0);
  ctx.quadraticCurveTo(x + 14 * s, y + 6 * s, x, y + 3 * s);
  ctx.quadraticCurveTo(x - 14 * s, y + 6 * s, x - 20 * s * p, y);
  ctx.fill();
  ctx.strokeStyle = hue === 0 ? "rgba(255,190,240,0.6)" : "rgba(190,245,255,0.6)";
  ctx.lineWidth = 1.6 * s;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 6 * s, y + 3 * s);
    for (let k = 1; k <= 6; k++) ctx.lineTo(x + i * 6 * s + Math.sin(t * 3 + k * 0.9 + i) * 4 * s, y + 3 * s + k * 7 * s);
    ctx.stroke();
  }
}

function seaFx(f: Frame, assets: { hero: HTMLImageElement; sub: HTMLImageElement }) {
  const { ctx, cw, ch, t, tau, K, sx, sy, sparks } = f;
  const wx = sx + 0.03 * cw;
  const wy = sy + 0.09 * ch;
  // plácnutí do hladiny: kruhy a kapky
  if (tau > 0.78 && tau < 0.82) for (let i = 0; i < 44; i++) pushSpark(sparks, { x: wx, y: wy, vx: (Math.random() - 0.5) * 380, vy: -150 - Math.random() * 380, life: 0.8 + Math.random() * 0.7, r: 2 + Math.random() * 3.5, kind: 5 });
  for (let i = 0; i < 3; i++) {
    const ua = clamp((tau - 0.8 - i * 0.2) / 1.0);
    if (ua <= 0 || ua >= 1) continue;
    ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - ua)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(wx, wy, 20 * K + ua * 160 * K, 6 * K + ua * 40 * K, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  const veil = sm(tau, 1.0, 1.7);
  if (veil > 0) {
    const depth = sm(tau, 1.6, 5.6);
    const top = [Math.round(lerp(95, 12, depth)), Math.round(lerp(208, 62, depth)), Math.round(lerp(238, 130, depth))];
    const bot = [Math.round(lerp(20, 4, depth)), Math.round(lerp(110, 22, depth)), Math.round(lerp(190, 70, depth))];
    ctx.globalAlpha = veil;
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, `rgb(${top[0]},${top[1]},${top[2]})`);
    g.addColorStop(1, `rgb(${bot[0]},${bot[1]},${bot[2]})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);
    // sluneční paprsky
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 8; i++) {
      const x0 = (rnd(i + 2) * 1.3 - 0.15) * cw + Math.sin(t * 0.6 + i) * 0.03 * cw;
      const w = (0.03 + rnd(i + 8) * 0.05) * cw;
      ctx.fillStyle = `rgba(200,250,255,${0.1 * (1 - depth * 0.75)})`;
      ctx.beginPath();
      ctx.moveTo(x0, 0);
      ctx.lineTo(x0 + w, 0);
      ctx.lineTo(x0 + w - 0.2 * cw, ch);
      ctx.lineTo(x0 - 0.2 * cw, ch);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    const scroll = (tau - 1.0) * 0.16 * ch; // hloubka: svět míjí potápěče směrem nahoru
    // kelp u dna
    const bottomRise = sm(tau, 4.6, 6.0);
    // medúzy a ryby míjejí
    for (let i = 0; i < 4; i++) {
      const jy = ((rnd(i * 3 + 1) * 1.8 + 1.0) * ch - scroll * (1 + rnd(i) * 0.8)) % (ch * 1.6);
      jelly(ctx, (0.12 + rnd(i * 7 + 2) * 0.76) * cw, jy - 0.1 * ch, (0.8 + rnd(i + 4) * 0.7) * K * 1.2, t, i % 2);
    }
    for (let sch = 0; sch < 3; sch++) {
      const dir = sch % 2 ? 1 : -1;
      for (let i = 0; i < 6; i++) {
        const k = (t * (0.18 + sch * 0.05) + sch * 0.31 + i * 0.012) % 1;
        const x = dir > 0 ? lerp(-0.1, 1.1, k) * cw : lerp(1.1, -0.1, k) * cw;
        const y = (0.2 + sch * 0.22) * ch + Math.sin(t * 1.6 + i * 0.9) * 0.025 * ch + (i % 3) * 0.02 * ch - scroll * 0.05;
        fish(ctx, x, y, 1.1 * K * 1.2, dir, 30 + sch * 90 + i * 6, t);
      }
    }
    // ponorka míjí zprava
    const sk = clamp((tau - 3.2) / 2.6);
    if (sk > 0 && sk < 1) {
      const sw = 0.36 * cw;
      const sxp = lerp(1.25 * cw, -0.4 * cw, sk);
      const fr = Math.floor((t / 3.2) * 12) % 12;
      ctx.drawImage(assets.sub, fr * 640, 0, 640, 384, sxp - sw / 2, 0.18 * ch + Math.sin(t * 2) * 6, sw, sw * 0.6);
    }
    // podmořské město: kopule s okny vyrůstají odspodu
    if (bottomRise > 0) {
      const base = ch * (1.15 - 0.42 * ease(bottomRise));
      for (let i = 0; i < 6; i++) {
        const x = (0.08 + i * 0.17 + (rnd(i + 30) - 0.5) * 0.05) * cw;
        const r = (0.07 + rnd(i + 40) * 0.05) * cw;
        const y = base + (i % 2) * 0.03 * ch;
        const dg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.5, 0, x, y - r * 0.2, r * 1.1);
        dg.addColorStop(0, "rgba(180,255,245,0.95)");
        dg.addColorStop(0.5, "rgba(70,190,210,0.9)");
        dg.addColorStop(1, "rgba(20,90,140,0.95)");
        ctx.fillStyle = dg;
        ctx.beginPath();
        ctx.arc(x, y, r, Math.PI, 0);
        ctx.lineTo(x + r, y + 0.4 * ch);
        ctx.lineTo(x - r, y + 0.4 * ch);
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation = "lighter";
        for (let w = 0; w < 5; w++) {
          const a = Math.PI + 0.5 + w * 0.55;
          const px = x + Math.cos(a) * r * 0.6;
          const py = y + Math.sin(a) * r * 0.6;
          glow(ctx, px, py, r * 0.22, "255,240,160", 0.9 * (0.6 + 0.4 * Math.sin(t * 2 + w + i)));
        }
        ctx.globalCompositeOperation = "source-over";
      }
      // kelp
      ctx.strokeStyle = "rgba(40,170,110,0.85)";
      ctx.lineWidth = 5 * K;
      ctx.lineCap = "round";
      for (let i = 0; i < 14; i++) {
        const x = (i / 13) * cw + (rnd(i + 5) - 0.5) * 0.03 * cw;
        const hh = (0.12 + rnd(i + 9) * 0.1) * ch;
        ctx.beginPath();
        ctx.moveTo(x, ch + 4);
        for (let k = 1; k <= 8; k++) ctx.lineTo(x + Math.sin(t * 1.4 + k * 0.5 + i) * 10 * k * 0.4 * K, ch + 4 - (k / 8) * hh * bottomRise);
        ctx.stroke();
      }
      ctx.lineCap = "butt";
    }
    // potápěč: hrdina klesá pod hladinu a pak se vznáší uprostřed záběru
    const dk = sm(tau, 1.0, 2.5);
    const hw = 0.3 * ch;
    const dx = cw * 0.5 + Math.sin(tau * 1.3) * 0.03 * cw;
    const dy = lerp(-0.12 * ch, 0.5 * ch, dk) + Math.sin(tau * 2) * 0.012 * ch;
    const fr2 = Math.floor(((t % 3) / 3) * 24) % 24;
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(lerp(0.9, 0.18, dk) + Math.sin(tau * 1.7) * 0.05);
    ctx.drawImage(assets.hero, fr2 * 192, 0, 192, 192, -hw / 2, -0.55 * hw, hw, hw);
    ctx.restore();
    if (Math.random() < 0.5) pushSpark(sparks, { x: dx + (Math.random() - 0.5) * 0.05 * cw, y: dy - 0.12 * ch, vx: (Math.random() - 0.5) * 20, vy: -40, life: 1.8, r: (2 + Math.random() * 5) * K, kind: 6 });
    ctx.globalAlpha = 1;
  }
  const wf = sm(tau, 6.0, 6.9);
  if (wf > 0) {
    ctx.fillStyle = `rgba(170,240,255,${wf})`;
    ctx.fillRect(0, 0, cw, ch);
  }
}

export function runWorld(r: R, g: Geo, kind: WorldKind, onEnd: () => void): Handle {
  let stopped = false;
  let raf = 0;
  const finish = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    onEnd();
  };
  const assetsP = kind === "sea" ? Promise.all([load("/home/mesto/hrdina-stoji.webp"), load("/home/more/ponorka.webp")]) : Promise.resolve([null, null] as const);
  void assetsP.then(([heroImg, subImg]) => {
    if (stopped) return;
    const { cw, ch, ctx } = setup(r as Refs);
    r.cam.style.transformOrigin = "0 0";
    r.cam.style.willChange = "transform";
    const cam0 = readCam(r.cam);
    const [su, sv] = g.toBox(g.start);
    const path: { x: number; y: number }[] = [{ x: su * cw, y: sv * ch }];
    for (const p of g.walk ?? []) {
      const [pu, pv] = g.toBox(p);
      path.push({ x: pu * cw, y: pv * ch });
    }
    const cum = [0];
    for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y));
    const total = Math.max(1, cum[cum.length - 1]);
    const T = Math.max(1.2, Math.min(4.2, total / (0.2 * cw)));
    const END = TE[kind];
    const at = (d: number) => {
      let i = 1;
      while (i < cum.length - 1 && cum[i] < d) i++;
      const k = clamp((d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]));
      return { x: lerp(path[i - 1].x, path[i].x, k), y: lerp(path[i - 1].y, path[i].y, k), dir: path[i].x - path[i - 1].x };
    };
    const node = path[path.length - 1];
    const [au, av] = g.toBox(g.door ?? g.walk?.[g.walk.length - 1] ?? g.start);
    const door = kind === "sea" ? node : { x: au * cw, y: av * ch };
    const heroState = { cur: "idle" };
    const sparks: Spark[] = [];
    let last = performance.now();
    const t0 = last;
    let stepAcc = 0;
    let flip = false;
    let zx = cam0.x;
    let zy = cam0.y;
    let zs = cam0.s;
    let beat = 0;
    const frame = (now: number) => {
      raf = 0;
      if (stopped) return;
      const t = (now - t0) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const walking = t < T;
      const d = at(Math.min(1, t / T) * total);
      if (Math.abs(d.dir) > 0.5) flip = d.dir < 0;
      const tau = Math.max(0, t - T);

      // ---- hrdina
      let hx = d.x;
      let hy = d.y;
      let sc = 1;
      let op = 1;
      let rot = 0;
      if (!walking) {
        if (kind === "sea") {
          const u = clamp(tau / 0.85);
          hx = node.x + u * 0.03 * cw;
          hy = node.y - Math.sin(u * Math.PI) * 0.12 * ch + u * 0.09 * ch;
          rot = u < 1 ? lerp(-12, 80, u) : 80;
          op = tau < 0.9 ? 1 : 0;
        } else {
          const enter = kind === "forest" ? [1.9, 2.8] : [2.0, 3.2];
          const u = ease(clamp((tau - enter[0]) / (enter[1] - enter[0])));
          const Kb = cw / 1000;
          hx = lerp(node.x, door.x + (kind === "forest" ? -20 : 10) * Kb, u);
          hy = lerp(node.y, door.y + (kind === "forest" ? -14 : -32) * Kb, u);
          sc = 1 - 0.45 * u;
          op = 1 - u;
        }
      }
      heroSprite(r as Refs, walking ? "walk" : "idle", heroState);
      setHero(r as Refs, hx, hy, flip, sc, op);
      if (rot) r.hero.style.transform = `translate(-50%, -84.4%) rotate(${flip ? -rot : rot}deg) scale(${flip ? -sc : sc}, ${sc})`;
      if (walking) {
        stepAcc += dt;
        if (stepAcc > 0.27) {
          stepAcc = 0;
          sfx.step();
        }
      }

      // ---- zvuky
      if (!walking) {
        if (beat === 0) {
          beat = 1;
          if (kind === "castle") sfx.horn();
          else if (kind === "forest") sfx.dock();
          else sfx.creak();
        }
        if (beat === 1 && ((kind === "castle" && tau > 0.6) || (kind === "forest" && tau > 2.0) || (kind === "sea" && tau > 0.78))) {
          beat = 2;
          if (kind === "castle") sfx.creak();
          else if (kind === "forest") sfx.pop();
          else sfx.splash(2.0);
        }
        if (beat === 2 && ((kind === "castle" && tau > 2.6) || (kind === "forest" && tau > 3.0) || (kind === "sea" && tau > 1.8))) {
          beat = 3;
          if (kind === "castle") sfx.horn();
          else if (kind === "forest") sfx.dock();
          else sfx.waves(3);
        }
      }

      // ---- kamera: dojde za hrdinou, pak najede na vchod
      const push = kind === "castle" ? 0.5 : kind === "forest" ? 0.45 : 0.3;
      const zoom = 1 + 0.9 * ease(clamp(t / (T + 0.3))) + (walking ? 0 : push * ease(clamp(tau / END)));
      const focus = walking ? d : { x: door.x, y: door.y - (kind === "castle" ? 0.045 : 0.035) * ch };
      const wantX = clamp(cw / 2 - zoom * focus.x, cw - zoom * cw, 0);
      const wantY = clamp(ch * 0.6 - zoom * focus.y, ch - zoom * ch, 0);
      const k = 1 - Math.exp(-5 * dt);
      zx = lerp(zx, wantX, k);
      zy = lerp(zy, wantY, k);
      zs = lerp(zs, zoom, k);
      const quake = kind === "castle" && !walking && tau > 0.55 && tau < 2.3 ? 2.2 * (1 - sm(tau, 1.6, 2.3)) : 0;
      r.cam.style.transform = `translate(${zx + (Math.random() - 0.5) * quake}px, ${zy + (Math.random() - 0.5) * quake}px) scale(${zs})`;

      // ---- efekty
      ctx.clearRect(0, 0, cw, ch);
      if (!walking) {
        const K = (zs * cw) / 1000;
        const f: Frame = { ctx, cw, ch, t, tau, dt, sx: zx + zs * door.x, sy: zy + zs * (door.y - 0.002 * ch), K, hx: zx + zs * hx, hy: zy + zs * hy, sparks };
        if (kind === "forest") {
          const fk = clamp((tau - 0.25) / 2.1);
          const a = fk * Math.PI * 3.2;
          const rr = lerp(70, 18, fk) * K;
          const cx = f.sx - 20 * K;
          const cy = f.sy - 50 * K;
          const ring = { x: f.hx + Math.cos(a) * rr, y: f.hy - 54 * K + Math.sin(a * 1.3) * rr * 0.55 };
          const into = sm(fk, 0.78, 1);
          forestFx(f, { x: lerp(ring.x, cx, into), y: lerp(ring.y, cy, into) });
        } else if (kind === "castle") castleFx(f);
        else if (heroImg && subImg) seaFx(f, { hero: heroImg, sub: subImg });
        stepSparks(f, kind === "sea" ? 500 : -20);
        bars(ctx, cw, ch, sm(tau, 0, 0.6) * (1 - sm(tau, END - 0.5, END)));
      } else bars(ctx, cw, ch, sm(t, 0.3, 1.0) * 0.5);
      if (tau >= END) {
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
