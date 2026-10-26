// Živé efekty nad budovami z Blenderu: komínový kouř, blikající majáky, vodotrysk, plamen rakety,
// letadlo na ranveji, paprsek majáku a podobně. Sprity jsou nehybné obrázky, takže se animace kreslí
// přes ně. Kotvy jsou podíly šířky a výšky obrázku (0 = levý/horní okraj, 1 = pravý/dolní).

export type Dest = { x: number; y: number; w: number; h: number };

type Ctx = CanvasRenderingContext2D;

const TAU = Math.PI * 2;

function blob(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: string, alpha: number) {
  if (alpha <= 0.01) return;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function glow(ctx: Ctx, x: number, y: number, r: number, rgb: string, alpha: number) {
  if (alpha <= 0.01) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// Kouř nebo pára: kuličky stoupají, rostou, ztrácejí průhlednost a vítr je pomalu unáší doprava.
function plume(ctx: Ctx, x: number, y: number, s: number, time: number, seed: number, color: string, opts: { rise?: number; spread?: number; count?: number; alpha?: number } = {}) {
  const { rise = 46, spread = 12, count = 5, alpha = 0.55 } = opts;
  for (let i = 0; i < count; i++) {
    const t = (time * 0.28 + i / count + seed) % 1;
    const drift = t * spread + Math.sin(t * 5 + i * 1.7 + seed * 9) * 2.2;
    blob(ctx, x + drift * s * 2, y - t * rise * s * 2, (2.4 + t * 6.5) * s * 2, (2 + t * 5.2) * s * 2, color, (1 - t) * (t < 0.08 ? t / 0.08 : 1) * alpha);
  }
}

function ripple(ctx: Ctx, x: number, y: number, rx: number, ry: number, time: number, seed: number, color = "255,255,255") {
  for (let k = 0; k < 2; k++) {
    const t = (time * 0.35 + seed + k * 0.5) % 1;
    ctx.globalAlpha = (1 - t) * 0.55;
    ctx.strokeStyle = `rgb(${color})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y, rx * (0.2 + t), ry * (0.2 + t), 0, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function emergency(ctx: Ctx, x: number, y: number, s: number, time: number, seed: number) {
  const phase = Math.floor((time * 2.6 + seed) % 2);
  const rgb = phase === 0 ? "255,60,70" : "70,130,255";
  ctx.globalCompositeOperation = "lighter";
  glow(ctx, x, y, 11 * s, rgb, 0.85);
  ctx.globalCompositeOperation = "source-over";
  blob(ctx, x, y, 2 * s, 1.4 * s, phase === 0 ? "#ff3c46" : "#4682ff", 1);
}

type Effect = (ctx: Ctx, d: Dest, time: number, seed: number, night: number) => void;

const at = (d: Dest, u: number, v: number): [number, number] => [d.x + u * d.w, d.y + v * d.h];

const EFFECTS: Record<string, Effect[]> = {
  cottage: [(c, d, t, sd) => plume(c, ...at(d, 0.63, 0.2), d.w / 256, t, sd, "#e6e6ee", { rise: 40 })],
  house: [(c, d, t, sd) => plume(c, ...at(d, 0.47, 0.1), d.w / 256, t, sd, "#e6e6ee", { rise: 40 })],
  factory: [
    (c, d, t, sd) => plume(c, ...at(d, 0.735, 0.06), d.w / 256, t, sd, "#9a9aa6", { rise: 56, spread: 16, alpha: 0.6 }),
    (c, d, t, sd) => plume(c, ...at(d, 0.755, 0.13), d.w / 256, t, sd + 0.37, "#b6b6c0", { rise: 46, spread: 14, alpha: 0.5, count: 4 }),
  ],
  power_plant: [
    (c, d, t, sd) => plume(c, ...at(d, 0.4, 0.05), d.w / 256, t, sd, "#ffffff", { rise: 60, spread: 10, alpha: 0.7, count: 6 }),
    (c, d, t, sd) => plume(c, ...at(d, 0.57, 0.12), d.w / 256, t, sd + 0.5, "#ffffff", { rise: 56, spread: 10, alpha: 0.7, count: 6 }),
    (c, d, t, sd) => plume(c, ...at(d, 0.79, 0.15), d.w / 256, t, sd + 0.2, "#8a8a96", { rise: 40, spread: 12, alpha: 0.55, count: 4 }),
  ],
  fire_station: [(c, d, t, sd) => emergency(c, ...at(d, 0.255, 0.6), d.w / 256, t, sd)],
  police: [
    (c, d, t, sd) => emergency(c, ...at(d, 0.42, 0.77), d.w / 256, t, sd),
    (c, d, t, sd) => {
      const [x, y] = at(d, 0.65, 0.23);
      c.globalCompositeOperation = "lighter";
      glow(c, x, y, 9 * (d.w / 256), "80,140,255", 0.45 + 0.4 * Math.sin(t * 5 + sd));
      c.globalCompositeOperation = "source-over";
    },
  ],
  hospital: [
    (c, d, t, sd) => emergency(c, ...at(d, 0.25, 0.6), d.w / 384, t, sd),
    (c, d, t) => {
      const [x, y] = at(d, 0.53, 0.42);
      c.globalCompositeOperation = "lighter";
      glow(c, x, y, 12 * (d.w / 384), "255,70,90", 0.25 + 0.25 * Math.sin(t * 2.4));
      c.globalCompositeOperation = "source-over";
    },
  ],
  fountain: [
    (c, d, t, sd) => {
      const s = d.w / 256;
      const [cx, cy] = at(d, 0.5, 0.46);
      const [tx, ty] = at(d, 0.5, 0.12);
      for (let i = 0; i < 10; i++) {
        const u = (t * 0.9 + i / 10) % 1;
        const a = (i / 10) * TAU + sd;
        const out = Math.sin(u * Math.PI) * 22 * s * (0.6 + (i % 3) * 0.2);
        const x = tx + Math.cos(a) * out * 1.0;
        const y = ty + (cy - ty) * u * u + Math.sin(a) * out * 0.35 - Math.sin(u * Math.PI) * 14 * s;
        blob(c, x, y, 1.5 * s, 1.5 * s, "#e8f6ff", 0.9 * (1 - u * 0.5));
      }
      ripple(c, cx, cy, 36 * s, 14 * s, t, sd);
    },
  ],
  pond: [
    (c, d, t, sd) => {
      const s = d.w / 256;
      ripple(c, ...at(d, 0.45, 0.46), 14 * s, 6 * s, t, sd);
      ripple(c, ...at(d, 0.62, 0.56), 12 * s, 5 * s, t, sd + 0.4);
    },
  ],
  pool: [
    (c, d, t, sd) => {
      const s = d.w / 320;
      const u = 0.5 + 0.5 * Math.sin(t * 0.55 + sd * 6);
      const [x0, y0] = at(d, 0.34, 0.22);
      const [x1, y1] = at(d, 0.82, 0.52);
      const x = x0 + (x1 - x0) * u;
      const y = y0 + (y1 - y0) * u;
      ripple(c, x, y, 9 * s, 4 * s, t * 2, sd);
      blob(c, x, y - 1 * s, 2.2 * s, 1.6 * s, "#3b2a20", 1);
      blob(c, x - 4 * s, y + 1 * s, 3 * s, 1.2 * s, "#ffffff", 0.7);
    },
  ],
  rocket_pad: [
    (c, d, t, sd) => {
      const s = d.w / 384;
      const [x, y] = at(d, 0.5, 0.6);
      c.globalCompositeOperation = "lighter";
      glow(c, x, y, 20 * s, "255,170,60", 0.45 + 0.2 * Math.sin(t * 17 + sd));
      c.globalCompositeOperation = "source-over";
      blob(c, x, y, (6 + 1.5 * Math.sin(t * 23)) * s, (3 + Math.sin(t * 19)) * s, "#ffd24d", 0.85);
      blob(c, x, y, 3 * s, 1.6 * s, "#ff7a2e", 0.9);
      for (let i = 0; i < 5; i++) {
        const u = (t * 0.5 + i / 5) % 1;
        const a = (i / 5) * TAU + sd;
        blob(c, x + Math.cos(a) * u * 34 * s, y + Math.sin(a) * u * 12 * s - u * 6 * s, (3 + u * 6) * s, (2 + u * 3) * s, "#e8e8ee", (1 - u) * 0.4);
      }
    },
  ],
  airport: [
    (c, d, t, sd) => {
      const s = d.w / 512;
      const cycle = (t * 0.045 + sd) % 1;
      if (cycle > 0.4) return;
      const u = cycle / 0.4;
      const [x0, y0] = at(d, 0.3, 0.14);
      const [x1, y1] = at(d, 0.96, 0.66);
      const lift = Math.max(0, u - 0.62) * 80 * s;
      const x = x0 + (x1 - x0) * u;
      const y = y0 + (y1 - y0) * u - lift;
      const ang = Math.atan2(y1 - y0, x1 - x0);
      c.save();
      c.translate(x, y);
      c.rotate(ang);
      blob(c, 0, 0, 11 * s, 3 * s, "#f4f6fa", 1);
      blob(c, 0, 0, 3 * s, 8 * s, "#d8dde8", 1);
      blob(c, 9 * s, 0, 2 * s, 2 * s, "#3b82f6", 1);
      c.restore();
    },
  ],
  lighthouse: [
    (c, d, t, sd, night) => {
      const s = d.w / 256;
      const [x, y] = at(d, 0.5, 0.2);
      const a = t * 1.1 + sd * 6;
      const len = 120 * s;
      const strength = 0.22 + 0.5 * night;
      c.globalCompositeOperation = "lighter";
      for (const dir of [a, a + Math.PI]) {
        const ex = x + Math.cos(dir) * len;
        const ey = y + Math.sin(dir) * len * 0.45;
        const g = c.createLinearGradient(x, y, ex, ey);
        g.addColorStop(0, `rgba(255,236,160,${strength})`);
        g.addColorStop(1, "rgba(255,236,160,0)");
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(ex - Math.sin(dir) * 14 * s, ey + Math.cos(dir) * 6 * s);
        c.lineTo(ex + Math.sin(dir) * 14 * s, ey - Math.cos(dir) * 6 * s);
        c.closePath();
        c.fill();
      }
      glow(c, x, y, 14 * s, "255,236,160", 0.7);
      c.globalCompositeOperation = "source-over";
    },
  ],
  port: [
    (c, d, t, sd) => {
      const s = d.w / 448;
      for (let i = 0; i < 7; i++) {
        const [x, y] = at(d, 0.5 + ((i * 0.37 + sd) % 1) * 0.42, 0.4 + ((i * 0.53 + sd * 3) % 1) * 0.28);
        const k = 0.5 + 0.5 * Math.sin(t * 2.4 + i * 2.1);
        blob(c, x, y, (1 + k * 1.5) * s * 1.5, 0.7 * s * 1.5, "#ffffff", k * 0.8);
      }
    },
  ],
  observatory: [
    (c, d, t, sd) => {
      const s = d.w / 256;
      for (let i = 0; i < 6; i++) {
        const [x, y] = at(d, 0.28 + ((i * 0.31) % 0.5), 0.04 + ((i * 0.47) % 0.28));
        const k = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.9 + sd);
        blob(c, x, y, (0.8 + k) * s * 1.6, (0.8 + k) * s * 1.6, "#fff8d0", 0.25 + k * 0.7);
      }
      const [x, y] = at(d, 0.55, 0.34);
      c.globalCompositeOperation = "lighter";
      glow(c, x, y, 9 * s, "130,170,255", 0.3 + 0.2 * Math.sin(t * 1.5));
      c.globalCompositeOperation = "source-over";
    },
  ],
};

// Co budova dělá, ukazuje malá mince, která v pravidelných odstupech vyskočí nad pracující budovou.
function coin(ctx: Ctx, d: Dest, time: number, seed: number) {
  const period = 7 + (seed * 10) % 4;
  const t = ((time + seed * 13) % period) / 1.5;
  if (t >= 1) return;
  const s = Math.max(0.7, d.w / 160);
  const x = d.x + d.w * 0.5;
  const y = d.y + d.h * 0.08 - t * 22 * s;
  const squash = Math.abs(Math.cos(t * 7));
  ctx.globalAlpha = t < 0.15 ? t / 0.15 : 1 - Math.max(0, (t - 0.65) / 0.35);
  ctx.fillStyle = "#b8860b";
  ctx.beginPath();
  ctx.ellipse(x, y, 4.6 * s * Math.max(0.25, squash), 4.6 * s, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#ffd24d";
  ctx.beginPath();
  ctx.ellipse(x, y, 3.6 * s * Math.max(0.2, squash), 3.6 * s, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawLiveEffects(ctx: Ctx, id: string, dest: Dest, time: number, seed: number, night: number, working: boolean, earns: boolean) {
  for (const effect of EFFECTS[id] ?? []) effect(ctx, dest, time, seed, night);
  if (working && earns) coin(ctx, dest, time, seed);
}

// Hejna ptáků, která přelétá přes výřez kamery.
export function drawBirds(ctx: Ctx, cameraX: number, cameraY: number, zoom: number, time: number) {
  const span = 1100 / zoom;
  for (let flock = 0; flock < 2; flock++) {
    const cycle = (time * 0.012 + flock * 0.5) % 1;
    const baseX = cameraX - span / 2 + cycle * span;
    const baseY = cameraY - 190 / zoom + flock * 70 / zoom + Math.sin(cycle * 6 + flock) * 14 / zoom;
    for (let i = 0; i < 4; i++) {
      const x = baseX - i * 16 / zoom;
      const y = baseY + (i % 2 ? 7 : -3) * (1 + i * 0.3) / zoom + Math.sin(time * 2 + i) * 2 / zoom;
      const flap = Math.sin(time * 9 + i * 1.3 + flock * 2) * 3.4 / zoom;
      ctx.strokeStyle = "rgba(30,30,50,0.65)";
      ctx.lineWidth = 1.3 / zoom;
      ctx.beginPath();
      ctx.moveTo(x - 4.5 / zoom, y - flap);
      ctx.quadraticCurveTo(x - 1 / zoom, y + 1.2 / zoom, x, y);
      ctx.quadraticCurveTo(x + 1 / zoom, y + 1.2 / zoom, x + 4.5 / zoom, y - flap);
      ctx.stroke();
    }
  }
}
