// Izometrický vykreslovač města. Budovy, dlaždice a auta jsou rendery 3D modelů z Blenderu
// (public/city/sprites/, seznam v manifest.json, postup v umime-art/scripts/city2.py).
// Co v manifestu chybí nebo se nenačte, kreslí se dál kódem.
//
// Názvy spritů: <id> (budova v základní poloze), <id>_r (otočená, půdorys h × w),
// <id>_noc a <id>_r_noc (noc s rozsvícenými okny), road_<maska> (1 = +x, 2 = −x, 4 = +y, 8 = −y),
// rail_x / rail_y / rail_xy, crossing_x / crossing_y (podle směru kolejí), grass_a / grass_b,
// car_<barva>_<x|y> a train_<lead|wagon>_<x|y> (vystředěné na bod na zemi).

import { CITY_SIZE, footprint, getItem, type Placed } from "@/lib/idle/city";
import { vehicleParts, type Traffic } from "./city-traffic";

export const TW = 64;
export const TH = 32;

export type Camera = { x: number; y: number; zoom: number };
export type Ghost = { id: string; x: number; y: number; rot: 0 | 1; valid: boolean };

export type Scene = {
  items: Placed[];
  notWorking: Set<number>;
  ghosts: Ghost[];
  hover: { x: number; y: number } | null;
  selected: number | null;
  // 0 = den, 1 = noc
  night: number;
  time: number;
  traffic: Traffic;
  sprites: SpriteStore | null;
};

type Pt = readonly [number, number];

export function project(gx: number, gy: number): { x: number; y: number } {
  return { x: ((gx - gy) * TW) / 2, y: ((gx + gy) * TH) / 2 };
}

export function unproject(wx: number, wy: number): { gx: number; gy: number } {
  return { gx: wy / TH + wx / TW, gy: wy / TH - wx / TW };
}

export function screenToGrid(camera: Camera, width: number, height: number, sx: number, sy: number) {
  const wx = (sx - width / 2) / camera.zoom + camera.x;
  const wy = (sy - height / 2) / camera.zoom + camera.y;
  return unproject(wx, wy);
}

const P = (gx: number, gy: number, z = 0): Pt => {
  const p = project(gx, gy);
  return [p.x, p.y - z];
};

// --- obrázky z Blenderu (volitelné) ---

export class SpriteStore {
  private images = new Map<string, HTMLImageElement>();
  private available = new Set<string>();

  async init(): Promise<void> {
    try {
      const res = await fetch("/city/sprites/manifest.json");
      if (!res.ok) return;
      const data = (await res.json()) as { sprites?: string[] };
      for (const id of data.sprites ?? []) {
        if (typeof id !== "string") continue;
        const img = new Image();
        img.onload = () => this.available.add(id);
        img.src = `/city/sprites/${encodeURIComponent(id)}.png`;
        this.images.set(id, img);
      }
    } catch {
      // žádné sprity, kreslí se kódem
    }
  }

  get(id: string): HTMLImageElement | null {
    return this.available.has(id) ? (this.images.get(id) ?? null) : null;
  }
}

// --- barvy a pomocné kreslení ---

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => {
    const t = amount < 0 ? 0 : 255;
    const p = Math.abs(amount);
    return Math.round((t - v) * p + v);
  };
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `rgb(${r},${g},${b})`;
}

function hash(a: number, b: number): number {
  let h = (Math.imul(a + 7, 374761393) + Math.imul(b + 13, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function poly(ctx: CanvasRenderingContext2D, pts: readonly Pt[], fill: string, stroke?: string, lw = 1) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

function lerp2(a: Pt, b: Pt, t: number): Pt {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// Bod na svislé stěně: u podél spodní hrany, v nahoru (0..1).
function wallPoint(b0: Pt, b1: Pt, t0: Pt, t1: Pt, u: number, v: number): Pt {
  return lerp2(lerp2(b0, b1, u), lerp2(t0, t1, u), v);
}

function wallRect(
  ctx: CanvasRenderingContext2D,
  b0: Pt,
  b1: Pt,
  t0: Pt,
  t1: Pt,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
  fill: string,
) {
  poly(
    ctx,
    [
      wallPoint(b0, b1, t0, t1, u0, v0),
      wallPoint(b0, b1, t0, t1, u1, v0),
      wallPoint(b0, b1, t0, t1, u1, v1),
      wallPoint(b0, b1, t0, t1, u0, v1),
    ],
    fill,
  );
}

type BoxOpts = {
  roofStyle?: "flat" | "gable";
  windows?: { cols: number; rows: number; lit: boolean; glass: string };
  door?: boolean;
  awning?: [string, string];
  seed?: number;
};

function box(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  w: number,
  h: number,
  z0: number,
  z1: number,
  wall: string,
  roof: string,
  opts: BoxOpts = {},
) {
  const A = P(gx, gy, z1);
  const B = P(gx + w, gy, z1);
  const C = P(gx + w, gy + h, z1);
  const D = P(gx, gy + h, z1);
  const B0 = P(gx + w, gy, z0);
  const C0 = P(gx + w, gy + h, z0);
  const D0 = P(gx, gy + h, z0);

  const leftWall = shade(wall, -0.1);
  const rightWall = shade(wall, -0.3);
  poly(ctx, [D, C, C0, D0], leftWall, "rgba(0,0,0,0.25)");
  poly(ctx, [C, B, B0, C0], rightWall, "rgba(0,0,0,0.25)");

  if (opts.windows) {
    const { cols, rows, lit, glass } = opts.windows;
    const color = lit ? "#ffe9a6" : glass;
    const dark = lit ? "#f2c96b" : shade(glass, -0.2);
    const faces: [Pt, Pt, Pt, Pt, string][] = [
      [D0, C0, D, C, color],
      [C0, B0, C, B, dark],
    ];
    const longL = Math.max(1, Math.round(w * cols));
    const longR = Math.max(1, Math.round(h * cols));
    faces.forEach(([b0, b1, t0, t1, fill], index) => {
      const nCols = index === 0 ? longL : longR;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < nCols; c++) {
          if (opts.door && index === 0 && r === 0 && c === Math.floor(nCols / 2)) continue;
          const litHere = !lit || hash(c + (opts.seed ?? 0), r + index * 17) > 0.3;
          const u0 = (c + 0.2) / nCols;
          const u1 = (c + 0.8) / nCols;
          const v0 = (r + 0.28) / rows;
          const v1 = (r + 0.74) / rows;
          wallRect(ctx, b0, b1, t0, t1, u0, u1, v0 * 0.86 + 0.1, v1 * 0.86 + 0.1, litHere ? fill : glass);
        }
      }
    });
  }
  if (opts.door) {
    wallRect(ctx, D0, C0, D, C, 0.42, 0.58, 0, 0.42, shade(wall, -0.55));
  }
  if (opts.awning) {
    const [c1, c2] = opts.awning;
    const stripes = Math.max(4, Math.round(w * 6));
    for (let i = 0; i < stripes; i++) {
      const u0 = i / stripes;
      const u1 = (i + 1) / stripes;
      const p = (u: number, v: number): Pt => {
        const q = wallPoint(D0, C0, D, C, u, v);
        return [q[0] - 3, q[1] + (v > 0.5 ? 4 : 0)];
      };
      poly(ctx, [p(u0, 0.5), p(u1, 0.5), p(u1, 0.38), p(u0, 0.38)], i % 2 ? c1 : c2);
    }
  }

  if (opts.roofStyle === "gable") {
    const rh = Math.min(16, (z1 - z0) * 0.7 + 6);
    if (w >= h) {
      const R1 = P(gx, gy + h / 2, z1 + rh);
      const R2 = P(gx + w, gy + h / 2, z1 + rh);
      poly(ctx, [A, B, R2, R1], shade(roof, -0.25), "rgba(0,0,0,0.25)");
      poly(ctx, [C, B, R2], rightWall, "rgba(0,0,0,0.25)");
      poly(ctx, [D, C, R2, R1], roof, "rgba(0,0,0,0.3)");
    } else {
      const R1 = P(gx + w / 2, gy, z1 + rh);
      const R2 = P(gx + w / 2, gy + h, z1 + rh);
      poly(ctx, [A, D, R2, R1], shade(roof, -0.25), "rgba(0,0,0,0.25)");
      poly(ctx, [D, C, R2], leftWall, "rgba(0,0,0,0.25)");
      poly(ctx, [C, B, R1, R2], roof, "rgba(0,0,0,0.3)");
    }
  } else {
    poly(ctx, [A, B, C, D], roof, "rgba(0,0,0,0.3)");
  }
}

function ellipseAt(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function groundDiamond(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, fill: string, inset = 0, stroke?: string) {
  poly(ctx, [P(gx + inset, gy + inset), P(gx + w - inset, gy + inset), P(gx + w - inset, gy + h - inset), P(gx + inset, gy + h - inset)], fill, stroke);
}

// --- přírodní prvky a drobné dekorace (kreslí se kolem středu dlaždice) ---

function tree(ctx: CanvasRenderingContext2D, cx: number, cy: number, seed: number, scale = 1) {
  const tints = ["#3f9d4a", "#4aa84f", "#5cb85c", "#3a8f55"];
  const c = tints[Math.floor(seed * 4) % 4];
  ellipseAt(ctx, cx, cy + 2 * scale, 11 * scale, 5 * scale, "rgba(0,0,0,0.22)");
  ctx.fillStyle = "#6b4a2b";
  ctx.fillRect(cx - 2 * scale, cy - 12 * scale, 4 * scale, 14 * scale);
  ellipseAt(ctx, cx, cy - 20 * scale, 11 * scale, 10 * scale, shade(c, -0.18));
  ellipseAt(ctx, cx - 3 * scale, cy - 24 * scale, 9 * scale, 8 * scale, c);
  ellipseAt(ctx, cx + 4 * scale, cy - 21 * scale, 7 * scale, 6 * scale, shade(c, 0.12));
}

function bush(ctx: CanvasRenderingContext2D, cx: number, cy: number, seed: number) {
  const c = seed > 0.5 ? "#4aa84f" : "#3f9d4a";
  ellipseAt(ctx, cx, cy + 2, 9, 4, "rgba(0,0,0,0.2)");
  ellipseAt(ctx, cx - 4, cy - 3, 6, 5, shade(c, -0.15));
  ellipseAt(ctx, cx + 4, cy - 3, 6, 5, shade(c, -0.15));
  ellipseAt(ctx, cx, cy - 6, 7, 6, c);
}

function flowerbed(ctx: CanvasRenderingContext2D, gx: number, gy: number, seed: number) {
  groundDiamond(ctx, gx, gy, 1, 1, "#7a5a3a", 0.12, "rgba(0,0,0,0.25)");
  const colors = ["#ff5d73", "#ffd24d", "#ffffff", "#b66dff", "#ff9d3d"];
  for (let i = 0; i < 9; i++) {
    const u = 0.2 + 0.6 * hash(gx * 9 + i, gy);
    const v = 0.2 + 0.6 * hash(gx, gy * 9 + i);
    const p = P(gx + u, gy + v);
    ctx.fillStyle = "#3f9d4a";
    ctx.fillRect(p[0] - 0.8, p[1] - 5, 1.6, 5);
    ellipseAt(ctx, p[0], p[1] - 6, 2.6, 2.6, colors[(i + Math.floor(seed * 5)) % colors.length]);
  }
}

function lamp(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ellipseAt(ctx, cx, cy + 1, 5, 2.5, "rgba(0,0,0,0.25)");
  ctx.fillStyle = "#3a3d4a";
  ctx.fillRect(cx - 1.4, cy - 30, 2.8, 31);
  ctx.fillRect(cx - 1.4, cy - 31, 9, 2.4);
  ctx.fillStyle = "#ffe9a6";
  ctx.beginPath();
  ctx.roundRect(cx + 5, cy - 30, 6, 4, 2);
  ctx.fill();
}

function bench(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ellipseAt(ctx, cx, cy + 2, 11, 4, "rgba(0,0,0,0.22)");
  ctx.fillStyle = "#8a5a2b";
  poly(ctx, [[cx - 10, cy - 3], [cx + 10, cy - 3], [cx + 12, cy], [cx - 8, cy]], "#9a6a3a", "rgba(0,0,0,0.3)");
  poly(ctx, [[cx - 10, cy - 11], [cx + 10, cy - 11], [cx + 10, cy - 6], [cx - 10, cy - 6]], "#7a4a1f", "rgba(0,0,0,0.3)");
  ctx.fillStyle = "#2c2c36";
  ctx.fillRect(cx - 9, cy - 3, 2, 6);
  ctx.fillRect(cx + 7, cy - 3, 2, 6);
}

function bin(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ellipseAt(ctx, cx, cy + 1, 6, 3, "rgba(0,0,0,0.22)");
  poly(ctx, [[cx - 5, cy - 11], [cx + 5, cy - 11], [cx + 4, cy], [cx - 4, cy]], "#4f9a6b", "rgba(0,0,0,0.3)");
  ellipseAt(ctx, cx, cy - 11, 5.5, 2.2, "#3d7f56");
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillRect(cx - 1, cy - 8, 2, 5);
}

function mailbox(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ellipseAt(ctx, cx, cy + 1, 5, 2.4, "rgba(0,0,0,0.22)");
  ctx.fillStyle = "#555b6b";
  ctx.fillRect(cx - 1, cy - 8, 2, 9);
  poly(ctx, [[cx - 6, cy - 18], [cx + 6, cy - 18], [cx + 6, cy - 8], [cx - 6, cy - 8]], "#2f6fd0", "rgba(0,0,0,0.3)");
  ctx.fillStyle = "#ffd24d";
  ctx.fillRect(cx - 3, cy - 14, 6, 1.6);
}

function flag(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  ellipseAt(ctx, cx, cy + 1, 5, 2.4, "rgba(0,0,0,0.22)");
  ctx.fillStyle = "#c9c9d2";
  ctx.fillRect(cx - 1, cy - 36, 2, 37);
  const wave = Math.sin(time * 3) * 2;
  poly(ctx, [[cx + 1, cy - 36], [cx + 16, cy - 34 + wave], [cx + 15, cy - 24 + wave], [cx + 1, cy - 26]], "#e5484d");
  poly(ctx, [[cx + 1, cy - 30], [cx + 15, cy - 29 + wave], [cx + 15, cy - 24 + wave], [cx + 1, cy - 26]], "#f4f4f6");
}

function statue(ctx: CanvasRenderingContext2D, gx: number, gy: number) {
  const c = P(gx + 0.5, gy + 0.5);
  box(ctx, gx + 0.25, gy + 0.25, 0.5, 0.5, 0, 9, "#bdb8aa", "#d6d1c3");
  const x = c[0];
  const y = c[1] - 9;
  ctx.fillStyle = "#c9a14a";
  ctx.beginPath();
  ctx.roundRect(x - 4, y - 16, 8, 16, 3);
  ctx.fill();
  ellipseAt(ctx, x, y - 21, 4.2, 4.6, "#d9b45a");
  ctx.fillStyle = "#c9a14a";
  ctx.fillRect(x - 8, y - 14, 5, 2.4);
}

function clockTower(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, night: number) {
  box(ctx, gx + 0.3, gy + 0.3, w - 0.6, h - 0.6, 0, 86, "#d8c9a8", "#8a5a3a");
  const cx = gx + w / 2;
  const cy = gy + h / 2;
  const top = P(cx, cy, 86);
  poly(ctx, [[top[0] - 14, top[1] + 4], [top[0] + 14, top[1] + 4], [top[0], top[1] - 30]], "#a0412f", "rgba(0,0,0,0.3)");
  const face = P(gx + w - 0.3, gy + h - 0.3, 66);
  const left = P(gx + 0.3 + (w - 0.6) / 2, gy + h - 0.3, 66);
  for (const [x, y] of [face, left]) {
    ellipseAt(ctx, x - 6, y + 2, 7.5, 7.5, "#f4f0e0");
    ctx.strokeStyle = "#2c2c36";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 2);
    ctx.lineTo(x - 6, y - 3);
    ctx.moveTo(x - 6, y + 2);
    ctx.lineTo(x - 2, y + 3);
    ctx.stroke();
  }
  void night;
}

function memorial(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, big: boolean) {
  groundDiamond(ctx, gx, gy, w, h, "#c8c2b2", 0.05, "rgba(0,0,0,0.25)");
  const steps = big ? 3 : 2;
  for (let i = 0; i < steps; i++) {
    const inset = 0.18 + i * (big ? 0.28 : 0.2);
    box(ctx, gx + inset, gy + inset, w - inset * 2, h - inset * 2, i * 5, (i + 1) * 5, "#d6d1c3", "#e6e1d3");
  }
  const cx = gx + w / 2;
  const cy = gy + h / 2;
  const base = P(cx, cy, steps * 5);
  const height = big ? 120 : 52;
  const bw = big ? 12 : 8;
  poly(ctx, [[base[0] - bw, base[1]], [base[0], base[1] + bw / 2], [base[0], base[1] + bw / 2 - height], [base[0] - bw / 2, base[1] - height + 4]], "#cfc8b6", "rgba(0,0,0,0.3)");
  poly(ctx, [[base[0], base[1] + bw / 2], [base[0] + bw, base[1]], [base[0] + bw / 2, base[1] - height + 4], [base[0], base[1] + bw / 2 - height]], "#a69f8d", "rgba(0,0,0,0.3)");
  poly(ctx, [[base[0] - bw / 2, base[1] - height + 4], [base[0], base[1] - height - (big ? 16 : 9)], [base[0] + bw / 2, base[1] - height + 4], [base[0], base[1] - height + 8]], "#e8c35a", "rgba(0,0,0,0.3)");
}

function park(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number) {
  groundDiamond(ctx, gx, gy, w, h, "#69b866", 0.04, "rgba(0,0,0,0.2)");
  // cestičky do kříže
  poly(ctx, [P(gx + w / 2 - 0.12, gy), P(gx + w / 2 + 0.12, gy), P(gx + w / 2 + 0.12, gy + h), P(gx + w / 2 - 0.12, gy + h)], "#e3d5b0");
  poly(ctx, [P(gx, gy + h / 2 - 0.12), P(gx + w, gy + h / 2 - 0.12), P(gx + w, gy + h / 2 + 0.12), P(gx, gy + h / 2 + 0.12)], "#e3d5b0");
  const spots: [number, number][] = [[0.3, 0.3], [w - 0.3, 0.3], [0.3, h - 0.3], [w - 0.3, h - 0.3], [w / 2, h / 2]];
  const list = spots.map(([u, v]) => ({ u: gx + u, v: gy + v }));
  list.sort((a, b) => a.u + a.v - (b.u + b.v));
  for (const s of list) {
    const p = P(s.u, s.v);
    tree(ctx, p[0], p[1], hash(Math.floor(s.u * 10), Math.floor(s.v * 10)), 1.05);
  }
  const b = P(gx + w / 2 + 0.55, gy + h / 2 - 0.3);
  bench(ctx, b[0], b[1] + 2);
}

function pond(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, time: number) {
  groundDiamond(ctx, gx, gy, w, h, "#8fcf86", 0.02, "rgba(0,0,0,0.15)");
  groundDiamond(ctx, gx, gy, w, h, "#4aa3d8", 0.18, "rgba(255,255,255,0.4)");
  groundDiamond(ctx, gx, gy, w, h, "#6bbcea", 0.38);
  const c = P(gx + w / 2, gy + h / 2);
  const r = 6 + Math.sin(time * 2) * 1.2;
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(c[0] + 4, c[1], r * 1.6, r * 0.8, 0, 0, Math.PI * 2);
  ctx.stroke();
  // kachna
  ellipseAt(ctx, c[0] - 8, c[1] + 2, 4.5, 2.6, "#ffffff");
  ellipseAt(ctx, c[0] - 12, c[1] - 1, 2.2, 2.2, "#ffffff");
  ctx.fillStyle = "#ff9d3d";
  ctx.fillRect(c[0] - 15, c[1] - 1, 3, 1.4);
  const reed = P(gx + 0.25, gy + h - 0.2);
  ctx.strokeStyle = "#3f7f3a";
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(reed[0] + i * 3, reed[1]);
    ctx.lineTo(reed[0] + i * 3 - 1, reed[1] - 10 - i);
    ctx.stroke();
  }
}

function fountain(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, time: number) {
  groundDiamond(ctx, gx, gy, w, h, "#d6d1c3", 0.02, "rgba(0,0,0,0.2)");
  groundDiamond(ctx, gx, gy, w, h, "#9aa0ad", 0.14, "rgba(0,0,0,0.25)");
  groundDiamond(ctx, gx, gy, w, h, "#6bbcea", 0.22);
  const c = P(gx + w / 2, gy + h / 2);
  ctx.fillStyle = "#c9c4b4";
  ctx.fillRect(c[0] - 3, c[1] - 16, 6, 16);
  ellipseAt(ctx, c[0], c[1] - 16, 7, 3, "#d6d1c3");
  ctx.strokeStyle = "rgba(190,230,255,0.95)";
  ctx.lineWidth = 1.7;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + time * 0.8;
    const dx = Math.cos(a) * 15;
    const dy = Math.sin(a) * 7;
    ctx.beginPath();
    ctx.moveTo(c[0], c[1] - 18);
    ctx.quadraticCurveTo(c[0] + dx * 0.5, c[1] - 34 + Math.sin(time * 5 + i) * 2, c[0] + dx, c[1] + dy - 4);
    ctx.stroke();
  }
}

function playground(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number) {
  groundDiamond(ctx, gx, gy, w, h, "#f0d9a0", 0.04, "rgba(0,0,0,0.2)");
  const s = P(gx + 0.5, gy + 0.6);
  box(ctx, gx + 0.3, gy + 0.3, 0.45, 0.45, 0, 16, "#e5484d", "#ff7a7a");
  poly(ctx, [[s[0] + 6, s[1] - 10], [s[0] + 22, s[1] + 4], [s[0] + 26, s[1] + 2], [s[0] + 10, s[1] - 12]], "#f5a524", "rgba(0,0,0,0.3)");
  const sw = P(gx + 1.4, gy + 1.3);
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(sw[0] - 12, sw[1] + 2);
  ctx.lineTo(sw[0] - 4, sw[1] - 22);
  ctx.lineTo(sw[0] + 14, sw[1] - 22);
  ctx.lineTo(sw[0] + 22, sw[1] + 2);
  ctx.stroke();
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sw[0] + 2, sw[1] - 22);
  ctx.lineTo(sw[0] + 2, sw[1] - 8);
  ctx.moveTo(sw[0] + 9, sw[1] - 22);
  ctx.lineTo(sw[0] + 9, sw[1] - 8);
  ctx.stroke();
  ctx.fillStyle = "#8a5a2b";
  ctx.fillRect(sw[0] + 0, sw[1] - 8, 11, 2.4);
}

function stall(ctx: CanvasRenderingContext2D, gx: number, gy: number) {
  box(ctx, gx + 0.2, gy + 0.3, 0.6, 0.45, 0, 9, "#9a6a3a", "#c89a62");
  const c = P(gx + 0.5, gy + 0.55);
  // toldo
  const top = c[1] - 26;
  const stripes = 5;
  for (let i = 0; i < stripes; i++) {
    const x0 = c[0] - 15 + i * 6;
    poly(ctx, [[x0, top], [x0 + 6, top], [x0 + 7, top + 10], [x0 + 1, top + 10]], i % 2 ? "#ffffff" : "#e5484d", "rgba(0,0,0,0.2)");
  }
  ctx.fillStyle = "#6b4a2b";
  ctx.fillRect(c[0] - 15, top, 1.8, 26);
  ctx.fillRect(c[0] + 13, top, 1.8, 26);
  ellipseAt(ctx, c[0] - 5, c[1] - 11, 3, 3, "#e5484d");
  ellipseAt(ctx, c[0], c[1] - 11, 3, 3, "#ffd24d");
  ellipseAt(ctx, c[0] + 5, c[1] - 11, 3, 3, "#7ccf5a");
}

function marketHall(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number) {
  groundDiamond(ctx, gx, gy, w, h, "#d8cdb0", 0.03, "rgba(0,0,0,0.2)");
  const colors = ["#e5484d", "#3b82f6", "#f5a524", "#2fb344"];
  const list: [number, number, number][] = [];
  let k = 0;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) list.push([gx + 0.15 + i * (w / 2), gy + 0.15 + j * (h / 2), k++]);
  list.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  for (const [x, y, idx] of list) {
    box(ctx, x + 0.1, y + 0.25, 0.9, 0.65, 0, 10, "#9a6a3a", "#c89a62");
    const c = P(x + 0.55, y + 0.6);
    const top = c[1] - 30;
    for (let s = 0; s < 6; s++) {
      const x0 = c[0] - 21 + s * 7;
      poly(ctx, [[x0, top], [x0 + 7, top], [x0 + 8, top + 12], [x0 + 1, top + 12]], s % 2 ? "#ffffff" : colors[idx % 4], "rgba(0,0,0,0.2)");
    }
    ctx.fillStyle = "#6b4a2b";
    ctx.fillRect(c[0] - 21, top, 1.8, 30);
    ctx.fillRect(c[0] + 19, top, 1.8, 30);
    ellipseAt(ctx, c[0] - 6, c[1] - 12, 3.2, 3.2, "#e5484d");
    ellipseAt(ctx, c[0] + 2, c[1] - 12, 3.2, 3.2, "#ffd24d");
    ellipseAt(ctx, c[0] + 10, c[1] - 12, 3.2, 3.2, "#7ccf5a");
  }
}

function busStop(ctx: CanvasRenderingContext2D, cx: number, cy: number, tram: boolean) {
  const w = tram ? 22 : 16;
  ellipseAt(ctx, cx, cy + 2, w, 6, "rgba(0,0,0,0.2)");
  ctx.fillStyle = tram ? "#8a93a8" : "#5a6275";
  ctx.fillRect(cx - w + 2, cy - 24, 2.4, 25);
  ctx.fillRect(cx + w - 4, cy - 24, 2.4, 25);
  poly(ctx, [[cx - w - 2, cy - 24], [cx + w, cy - 24], [cx + w + 3, cy - 29], [cx - w + 1, cy - 29]], tram ? "#d94f5c" : "#3b82f6", "rgba(0,0,0,0.3)");
  poly(ctx, [[cx - w + 4, cy - 22], [cx + w - 4, cy - 22], [cx + w - 4, cy - 5], [cx - w + 4, cy - 5]], "rgba(170,210,240,0.45)");
  ctx.fillStyle = "#f4f4f6";
  ctx.fillRect(cx + w - 1, cy - 42, 6, 6);
  ctx.fillStyle = tram ? "#d94f5c" : "#3b82f6";
  ctx.fillRect(cx + w, cy - 41, 4, 4);
  ctx.fillStyle = "#5a6275";
  ctx.fillRect(cx + w + 1.4, cy - 36, 1.6, 36);
}

function smoke(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, seed: number) {
  for (let i = 0; i < 4; i++) {
    const t = (time * 0.35 + i / 4 + seed) % 1;
    ctx.globalAlpha = (1 - t) * 0.55;
    ellipseAt(ctx, x + t * 10 + Math.sin(t * 6 + i) * 2, y - t * 34, 3 + t * 6, 2.5 + t * 5, "#d8d8e0");
  }
  ctx.globalAlpha = 1;
}

function sign(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, color: string) {
  poly(ctx, [[x - w, y], [x + w, y - w / 2], [x + w, y - w / 2 - 7], [x - w, y - 7]], color, "rgba(0,0,0,0.3)");
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillRect(x - w + 3, y - 5, w * 2 - 6, 1.6);
}

// --- speciální budovy z obchodu ---

function christmasTree(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, time: number) {
  groundDiamond(ctx, gx, gy, w, h, "#eef4f8", 0.08, "rgba(0,0,0,0.12)");
  const c = P(gx + w / 2, gy + h / 2);
  ellipseAt(ctx, c[0], c[1] + 4, 26, 11, "rgba(0,0,0,0.2)");
  ctx.fillStyle = "#6b4a2b";
  ctx.fillRect(c[0] - 4, c[1] - 12, 8, 14);
  const greens = ["#2f8f4e", "#37a05a", "#40b266", "#4cc276"];
  for (let i = 0; i < 4; i++) {
    const half = 36 - i * 8;
    const base = c[1] - 8 - i * 17;
    poly(ctx, [[c[0] - half, base], [c[0] + half, base], [c[0], base - 30]], greens[i], "rgba(0,0,0,0.3)", 1.2);
  }
  const colors = ["#ff5d73", "#ffd24d", "#5ab8ff", "#ffffff", "#ff9d3d"];
  for (let i = 0; i < 13; i++) {
    const tier = i % 4;
    const half = 30 - tier * 7;
    const u = ((i * 37) % 100) / 100;
    const x = c[0] + (u * 2 - 1) * half * 0.8;
    const y = c[1] - 10 - tier * 17 - (1 - Math.abs(u * 2 - 1)) * 9;
    ctx.globalAlpha = 0.55 + 0.45 * Math.sin(time * 4 + i * 1.3);
    ellipseAt(ctx, x, y, 2.6, 2.6, colors[i % colors.length]);
  }
  ctx.globalAlpha = 1;
  const top = [c[0], c[1] - 8 - 3 * 17 - 30] as const;
  const pts: Pt[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 8 : 3.6;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push([top[0] + Math.cos(a) * r, top[1] + Math.sin(a) * r]);
  }
  poly(ctx, pts, "#ffd24d", "#b9831a", 1);
  const gifts: [number, number, string][] = [[0.15, 0.7, "#e5484d"], [0.65, 0.78, "#3b82f6"]];
  for (const [u, v, color] of gifts) box(ctx, gx + u, gy + v, 0.3, 0.3, 0, 8, color, shade(color, 0.3));
}

function windmill(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, time: number) {
  groundDiamond(ctx, gx, gy, w, h, "#c9d98a", 0.05, "rgba(0,0,0,0.15)");
  const c = P(gx + w / 2, gy + h / 2);
  ellipseAt(ctx, c[0], c[1] + 4, 30, 12, "rgba(0,0,0,0.2)");
  poly(ctx, [[c[0] - 24, c[1] + 4], [c[0], c[1] + 12], [c[0], c[1] - 56], [c[0] - 14, c[1] - 60]], "#d8c29c", "rgba(0,0,0,0.3)");
  poly(ctx, [[c[0], c[1] + 12], [c[0] + 24, c[1] + 4], [c[0] + 14, c[1] - 60], [c[0], c[1] - 56]], "#b99e76", "rgba(0,0,0,0.3)");
  poly(ctx, [[c[0] - 18, c[1] - 58], [c[0] + 18, c[1] - 58], [c[0], c[1] - 88]], "#b5473a", "rgba(0,0,0,0.3)");
  ctx.fillStyle = "#6b4a2b";
  ctx.beginPath();
  ctx.roundRect(c[0] - 5, c[1] - 6, 10, 14, 4);
  ctx.fill();
  ctx.fillStyle = "#cfe6f7";
  ctx.fillRect(c[0] + 6, c[1] - 30, 6, 8);
  const hub: Pt = [c[0] + 2, c[1] - 62];
  const angle = time * 0.9;
  for (let i = 0; i < 4; i++) {
    const a = angle + (Math.PI / 2) * i;
    ctx.save();
    ctx.translate(hub[0], hub[1]);
    ctx.rotate(a);
    ctx.fillStyle = "#f4efe2";
    ctx.strokeStyle = "#5a4630";
    ctx.lineWidth = 1.4;
    ctx.fillRect(6, -5, 38, 10);
    ctx.strokeRect(6, -5, 38, 10);
    ctx.beginPath();
    for (let x = 12; x < 44; x += 8) {
      ctx.moveTo(x, -5);
      ctx.lineTo(x, 5);
    }
    ctx.stroke();
    ctx.restore();
  }
  ellipseAt(ctx, hub[0], hub[1], 5, 5, "#5a4630");
}

function ferrisWheel(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, time: number) {
  groundDiamond(ctx, gx, gy, w, h, "#d6d1c3", 0.1, "rgba(0,0,0,0.2)");
  const c = P(gx + w / 2, gy + h / 2);
  const hub: Pt = [c[0], c[1] - 78];
  const R = 50;
  ellipseAt(ctx, c[0], c[1] + 4, 42, 15, "rgba(0,0,0,0.2)");
  ctx.strokeStyle = "#555b6b";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(hub[0], hub[1]);
  ctx.lineTo(c[0] - 36, c[1] + 4);
  ctx.moveTo(hub[0], hub[1]);
  ctx.lineTo(c[0] + 36, c[1] + 4);
  ctx.stroke();
  const angle = time * 0.25;
  ctx.strokeStyle = "#e5484d";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(hub[0], hub[1], R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#f4f4f6";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(hub[0], hub[1], R * 0.66, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = angle + (Math.PI / 4) * i;
    ctx.moveTo(hub[0], hub[1]);
    ctx.lineTo(hub[0] + Math.cos(a) * R, hub[1] + Math.sin(a) * R);
  }
  ctx.stroke();
  const colors = ["#ffd24d", "#5ab8ff", "#ff7aa8", "#7ee0b0"];
  for (let i = 0; i < 8; i++) {
    const a = angle + (Math.PI / 4) * i;
    const x = hub[0] + Math.cos(a) * R;
    const y = hub[1] + Math.sin(a) * R;
    ctx.strokeStyle = "#3a3d4a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 6);
    ctx.stroke();
    ctx.fillStyle = colors[i % colors.length];
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.roundRect(x - 5, y + 5, 10, 8, 2);
    ctx.fill();
    ctx.stroke();
  }
  ellipseAt(ctx, hub[0], hub[1], 5, 5, "#3a3d4a");
}

// --- rozšíření: nové budovy kreslené kódem ---

// Vodorovná plocha ve výšce z (střecha stadionu, hladina na molu a podobně).
function topDiamond(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, z: number, inset: number, fill: string, stroke?: string) {
  poly(ctx, [P(gx + inset, gy + inset, z), P(gx + w - inset, gy + inset, z), P(gx + w - inset, gy + h - inset, z), P(gx + inset, gy + h - inset, z)], fill, stroke);
}

function treesIn(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, count: number, scale: number, seed: number) {
  const list: { u: number; v: number; s: number }[] = [];
  for (let i = 0; i < count; i++) {
    const u = gx + 0.3 + hash(seed + i, 3) * (w - 0.6);
    const v = gy + 0.3 + hash(seed + 7, i) * (h - 0.6);
    list.push({ u, v, s: hash(i, seed) });
  }
  list.sort((a, b) => a.u + a.v - (b.u + b.v));
  for (const t of list) {
    const p = P(t.u, t.v);
    tree(ctx, p[0], p[1], t.s, scale);
  }
}

function forest(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, seed: number) {
  groundDiamond(ctx, gx, gy, w, h, "#4c9a56", 0.02, "rgba(0,0,0,0.2)");
  treesIn(ctx, gx, gy, w, h, Math.round(w * h * 1.6), 0.95, Math.floor(seed * 50));
}

function lake(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, time: number) {
  groundDiamond(ctx, gx, gy, w, h, "#8fcf86", 0.02, "rgba(0,0,0,0.15)");
  groundDiamond(ctx, gx, gy, w, h, "#e6d9a8", 0.14);
  groundDiamond(ctx, gx, gy, w, h, "#3f9bd6", 0.3, "rgba(255,255,255,0.4)");
  groundDiamond(ctx, gx, gy, w, h, "#63b8ea", 0.6);
  const c = P(gx + w / 2, gy + h / 2);
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    const r = 6 + i * 6 + Math.sin(time * 2 + i) * 1.4;
    ctx.beginPath();
    ctx.ellipse(c[0] + i * 3 - 5, c[1] + 2 - i, r * 1.5, r * 0.75, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // loďka
  const bx = c[0] + Math.sin(time * 0.7) * 10;
  poly(ctx, [[bx - 8, c[1] - 6], [bx + 8, c[1] - 6], [bx + 5, c[1] - 1], [bx - 5, c[1] - 1]], "#a8622b", "rgba(0,0,0,0.3)");
  poly(ctx, [[bx, c[1] - 6], [bx, c[1] - 20], [bx + 8, c[1] - 7]], "#ffffff", "rgba(0,0,0,0.25)");
  const reed = P(gx + 0.3, gy + h - 0.35);
  ctx.strokeStyle = "#3f7f3a";
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(reed[0] + i * 3, reed[1]);
    ctx.lineTo(reed[0] + i * 3 - 1, reed[1] - 10 - i);
    ctx.stroke();
  }
}

function mountain(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number) {
  groundDiamond(ctx, gx, gy, w, h, "#7fb27a", 0.02, "rgba(0,0,0,0.2)");
  const peaks: [number, number, number][] = [
    [0.38, 0.4, 1],
    [0.68, 0.62, 0.72],
  ];
  for (const [u, v, s] of peaks) {
    const base = P(gx + w * u, gy + h * v);
    const rw = 34 * s;
    const top: Pt = [base[0], base[1] - 76 * s];
    poly(ctx, [[base[0] - rw, base[1] + 4], top, [base[0] + 2, base[1] + 14]], "#8a8f9c", "rgba(0,0,0,0.3)");
    poly(ctx, [top, [base[0] + rw, base[1] + 4], [base[0] + 2, base[1] + 14]], "#666b78", "rgba(0,0,0,0.3)");
    poly(ctx, [top, [base[0] - 10 * s, top[1] + 22 * s], [base[0] - 3 * s, top[1] + 17 * s], [base[0] + 3 * s, top[1] + 24 * s], [base[0] + 11 * s, top[1] + 20 * s]], "#ffffff", "rgba(0,0,0,0.15)");
  }
  treesIn(ctx, gx, gy, w, h, 3, 0.7, 5);
}

function allotments(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number) {
  groundDiamond(ctx, gx, gy, w, h, "#9bc77a", 0.02, "rgba(0,0,0,0.15)");
  const cols = Math.round(w * 2);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < 2; j++) {
      const u = gx + 0.15 + (i * (w - 0.3)) / cols;
      const v = gy + 0.15 + j * ((h - 0.3) / 2);
      groundDiamond(ctx, u, v, (w - 0.3) / cols - 0.08, (h - 0.3) / 2 - 0.1, "#7a5a3a", 0, "rgba(0,0,0,0.25)");
      const c = P(u + ((w - 0.3) / cols) / 2, v + ((h - 0.3) / 2) / 2);
      ellipseAt(ctx, c[0] - 3, c[1] - 2, 3, 2.4, "#4aa84f");
      ellipseAt(ctx, c[0] + 3, c[1] - 1, 3, 2.4, (i + j) % 2 ? "#e5484d" : "#f5a524");
    }
  }
  box(ctx, gx + w - 0.7, gy + 0.1, 0.5, 0.5, 0, 12, "#c9a46a", "#8b4a2b", { roofStyle: "gable" });
}

function parking(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number) {
  groundDiamond(ctx, gx, gy, w, h, "#5d6270", 0.02, "rgba(0,0,0,0.25)");
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i <= 4; i++) {
    const a = P(gx + 0.15 + (i * (w - 0.3)) / 4, gy + 0.12);
    const b = P(gx + 0.15 + (i * (w - 0.3)) / 4, gy + h * 0.45);
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  }
  const colors = ["#e5484d", "#3b82f6", "#f5a524", "#ffffff"];
  for (let i = 0; i < 3; i++) {
    const u = gx + 0.2 + (i * (w - 0.3)) / 4 + 0.02;
    box(ctx, u, gy + 0.18, (w - 0.3) / 4 - 0.12, h * 0.25, 1, 7, colors[i % 4], shade(colors[i % 4], 0.25));
  }
}

function solarFarm(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number) {
  groundDiamond(ctx, gx, gy, w, h, "#9bbf84", 0.02, "rgba(0,0,0,0.2)");
  const rows = Math.max(2, Math.round(h * 1.4));
  for (let r = 0; r < rows; r++) {
    const v = gy + 0.25 + (r * (h - 0.5)) / rows;
    const p0 = P(gx + 0.2, v, 6);
    const p1 = P(gx + w - 0.2, v, 6);
    const q1 = P(gx + w - 0.2, v + 0.35, 11);
    const q0 = P(gx + 0.2, v + 0.35, 11);
    poly(ctx, [p0, p1, q1, q0], "#2c4f9a", "rgba(255,255,255,0.45)");
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 0.8;
    for (let c = 1; c < 5; c++) {
      const t = c / 5;
      ctx.beginPath();
      ctx.moveTo(p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t);
      ctx.lineTo(q0[0] + (q1[0] - q0[0]) * t, q0[1] + (q1[1] - q0[1]) * t);
      ctx.stroke();
    }
  }
}

function iceRink(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, time: number) {
  groundDiamond(ctx, gx, gy, w, h, "#c9d3e0", 0.02, "rgba(0,0,0,0.2)");
  groundDiamond(ctx, gx, gy, w, h, "#e7f6ff", 0.14, "#8fb4d0");
  const c = P(gx + w / 2, gy + h / 2);
  ctx.strokeStyle = "rgba(120,170,210,0.7)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(c[0], c[1], 22, 11, 0, 0, Math.PI * 2);
  ctx.stroke();
  // bruslař
  const sx = c[0] + Math.cos(time * 1.2) * 14;
  const sy = c[1] + Math.sin(time * 1.2) * 6;
  ellipseAt(ctx, sx, sy + 1, 4, 1.8, "rgba(0,0,0,0.2)");
  ctx.fillStyle = "#e5484d";
  ctx.fillRect(sx - 2, sy - 10, 4, 8);
  ellipseAt(ctx, sx, sy - 12, 2.6, 2.6, "#ffd5a8");
}

function pumpkinPatch(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, seed: number) {
  groundDiamond(ctx, gx, gy, w, h, "#7da55a", 0.02, "rgba(0,0,0,0.2)");
  for (let i = 0; i < 9; i++) {
    const p = P(gx + 0.25 + hash(i, seed) * (w - 0.5), gy + 0.25 + hash(seed, i + 4) * (h - 0.5));
    ellipseAt(ctx, p[0], p[1] + 1, 5, 2.2, "rgba(0,0,0,0.2)");
    ellipseAt(ctx, p[0], p[1] - 3, 5.5, 4.4, "#ff8a1f");
    ellipseAt(ctx, p[0] - 2, p[1] - 3, 2.4, 4, "#ffa347");
    ctx.fillStyle = "#3f7f3a";
    ctx.fillRect(p[0] - 0.8, p[1] - 9, 1.6, 3);
  }
}

function christmasMarket(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, time: number) {
  groundDiamond(ctx, gx, gy, w, h, "#e9eef5", 0.02, "rgba(0,0,0,0.15)");
  const stalls: [number, number, string][] = [
    [0.15, 0.2, "#e5484d"],
    [1.0, 0.2, "#2f9e6f"],
    [0.15, 1.05, "#f5a524"],
  ];
  for (const [u, v, color] of stalls) {
    box(ctx, gx + u, gy + v, 0.7, 0.7, 0, 12, "#b8895b", color, { roofStyle: "gable" });
  }
  const lights = ["#ff5d73", "#ffd24d", "#7ee0b0", "#8fd0ff"];
  for (let i = 0; i < 8; i++) {
    const p = P(gx + 0.2 + i * 0.22, gy + h - 0.2, 20 + Math.sin(i) * 2);
    ellipseAt(ctx, p[0], p[1], 1.8, 1.8, Math.sin(time * 3 + i) > -0.2 ? lights[i % 4] : "#555");
  }
}

function carousel(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, time: number) {
  groundDiamond(ctx, gx, gy, w, h, "#d6d1c3", 0.04, "rgba(0,0,0,0.2)");
  const c = P(gx + w / 2, gy + h / 2);
  ellipseAt(ctx, c[0], c[1] + 2, 24, 11, "#8a5aa8");
  ellipseAt(ctx, c[0], c[1], 22, 10, "#e8d7ef");
  const colors = ["#ff5d73", "#ffd24d", "#7ee0b0", "#8fd0ff"];
  for (let i = 0; i < 6; i++) {
    const a = time * 1.1 + (i / 6) * Math.PI * 2;
    const x = c[0] + Math.cos(a) * 15;
    const y = c[1] + Math.sin(a) * 7;
    ctx.strokeStyle = "#f5e6a8";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x, y - 22);
    ctx.lineTo(x, y);
    ctx.stroke();
    ellipseAt(ctx, x, y - 6 + Math.sin(time * 3 + i) * 2, 3.4, 3, colors[i % 4]);
  }
  ctx.fillStyle = "#c9a46a";
  ctx.fillRect(c[0] - 2, c[1] - 26, 4, 26);
  poly(ctx, [[c[0] - 26, c[1] - 22], [c[0], c[1] - 40], [c[0] + 26, c[1] - 22], [c[0], c[1] - 14]], "#e5484d", "rgba(0,0,0,0.3)");
  poly(ctx, [[c[0] - 26, c[1] - 22], [c[0], c[1] - 14], [c[0] + 26, c[1] - 22], [c[0] + 20, c[1] - 20], [c[0], c[1] - 10], [c[0] - 20, c[1] - 20]], "#ffd24d", "rgba(0,0,0,0.3)");
}

function lighthouse(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, night: number, time: number) {
  groundDiamond(ctx, gx, gy, w, h, "#c8bfa8", 0.04, "rgba(0,0,0,0.2)");
  groundDiamond(ctx, gx, gy, w, h, "#8d8a82", 0.3);
  const c = P(gx + w / 2, gy + h / 2);
  const top = 84;
  const rw = 13;
  for (let i = 0; i < 4; i++) {
    const z0 = (i * top) / 4;
    const z1 = ((i + 1) * top) / 4;
    const k0 = rw - (z0 / top) * 5;
    const k1 = rw - (z1 / top) * 5;
    const color = i % 2 ? "#e5484d" : "#ffffff";
    poly(ctx, [[c[0] - k0, c[1] - z0], [c[0] + k0, c[1] - z0], [c[0] + k1, c[1] - z1], [c[0] - k1, c[1] - z1]], color, "rgba(0,0,0,0.3)");
    poly(ctx, [[c[0] + k0 * 0.15, c[1] - z0], [c[0] + k0, c[1] - z0], [c[0] + k1, c[1] - z1], [c[0] + k1 * 0.15, c[1] - z1]], "rgba(0,0,0,0.18)");
  }
  ctx.fillStyle = "#5d6270";
  ctx.fillRect(c[0] - 11, c[1] - top - 2, 22, 3);
  const lit = night > 0.2;
  ctx.fillStyle = lit ? "#fff3b0" : "#cfe6f7";
  ctx.fillRect(c[0] - 6, c[1] - top - 14, 12, 12);
  poly(ctx, [[c[0] - 9, c[1] - top - 14], [c[0], c[1] - top - 23], [c[0] + 9, c[1] - top - 14]], "#e5484d", "rgba(0,0,0,0.3)");
  if (lit) {
    const a = Math.sin(time * 1.4) * 0.5 + 0.5;
    ctx.globalAlpha = 0.35 * night * a;
    poly(ctx, [[c[0], c[1] - top - 8], [c[0] + 90, c[1] - top - 28], [c[0] + 90, c[1] - top + 12]], "#fff3b0");
    ctx.globalAlpha = 1;
  }
}

function rocketPad(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, time: number) {
  groundDiamond(ctx, gx, gy, w, h, "#7c8190", 0.02, "rgba(0,0,0,0.25)");
  groundDiamond(ctx, gx, gy, w, h, "#9aa0ad", 0.4);
  const c = P(gx + w / 2, gy + h / 2);
  // věž
  box(ctx, gx + 0.35, gy + 0.35, 0.28, 0.28, 0, 62, "#d94f5c", "#ffd24d");
  poly(ctx, [[c[0] - 8, c[1] - 6], [c[0] + 8, c[1] - 6], [c[0] + 6, c[1] + 2], [c[0] - 6, c[1] + 2]], "#5d6270");
  // raketa
  const bob = Math.sin(time * 2) * 0.6;
  poly(ctx, [[c[0] - 8, c[1] - 4 + bob], [c[0] + 8, c[1] - 4 + bob], [c[0] + 8, c[1] - 52 + bob], [c[0] - 8, c[1] - 52 + bob]], "#f4f6fa", "rgba(0,0,0,0.3)");
  poly(ctx, [[c[0], c[1] - 4 + bob], [c[0] + 8, c[1] - 4 + bob], [c[0] + 8, c[1] - 52 + bob], [c[0], c[1] - 52 + bob]], "rgba(0,0,0,0.15)");
  poly(ctx, [[c[0] - 8, c[1] - 52 + bob], [c[0], c[1] - 70 + bob], [c[0] + 8, c[1] - 52 + bob]], "#e5484d", "rgba(0,0,0,0.3)");
  poly(ctx, [[c[0] - 8, c[1] - 4 + bob], [c[0] - 16, c[1] + 4 + bob], [c[0] - 8, c[1] - 22 + bob]], "#e5484d", "rgba(0,0,0,0.3)");
  poly(ctx, [[c[0] + 8, c[1] - 4 + bob], [c[0] + 16, c[1] + 4 + bob], [c[0] + 8, c[1] - 22 + bob]], "#c43a44", "rgba(0,0,0,0.3)");
  ellipseAt(ctx, c[0], c[1] - 36 + bob, 4, 4, "#8fd0ff");
}

function astronomicalClock(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, night: number) {
  const base = P(gx + w / 2, gy + h / 2);
  ellipseAt(ctx, base[0], base[1] + 2, 24, 10, "rgba(0,0,0,0.2)");
  box(ctx, gx + 0.35, gy + 0.35, w - 0.7, h - 0.7, 0, 90, "#d9cfb5", "#6b8f9c", { roofStyle: "gable" });
  // ciferník
  const c = P(gx + w / 2, gy + h - 0.35, 56);
  ellipseAt(ctx, c[0] - 6, c[1], 12, 12, "#c9a24a");
  ellipseAt(ctx, c[0] - 6, c[1], 9.5, 9.5, "#1f3a6b");
  ctx.fillStyle = night > 0.3 ? "#ffe9a6" : "#f4efe2";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.fillRect(c[0] - 6 + Math.cos(a) * 7 - 0.7, c[1] + Math.sin(a) * 7 - 0.7, 1.4, 1.4);
  }
  ellipseAt(ctx, c[0] - 6, c[1], 3.4, 3.4, "#ff9d3d");
  ctx.fillStyle = "#c9a24a";
  ctx.fillRect(c[0] - 6.4, c[1] - 7, 1.2, 7);
  ctx.fillRect(c[0] - 6.4, c[1] - 0.6, 5, 1.2);
  // nižší ciferník s kalendářem
  const d = P(gx + w / 2, gy + h - 0.35, 28);
  ellipseAt(ctx, d[0] - 6, d[1], 10, 10, "#c9a24a");
  ellipseAt(ctx, d[0] - 6, d[1], 8, 8, "#e5484d");
}

function waterTower(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number) {
  const c = P(gx + w / 2, gy + h / 2);
  ellipseAt(ctx, c[0], c[1] + 2, 20, 9, "rgba(0,0,0,0.22)");
  ctx.strokeStyle = "#6a6a74";
  ctx.lineWidth = 3;
  for (const dx of [-11, 11]) {
    ctx.beginPath();
    ctx.moveTo(c[0] + dx, c[1] + 1);
    ctx.lineTo(c[0] + dx * 0.55, c[1] - 52);
    ctx.stroke();
  }
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(c[0] - 11, c[1] - 6);
  ctx.lineTo(c[0] + 6, c[1] - 40);
  ctx.moveTo(c[0] + 11, c[1] - 6);
  ctx.lineTo(c[0] - 6, c[1] - 40);
  ctx.stroke();
  poly(ctx, [[c[0] - 15, c[1] - 52], [c[0] + 15, c[1] - 52], [c[0] + 15, c[1] - 76], [c[0] - 15, c[1] - 76]], "#8fb4d0", "rgba(0,0,0,0.3)");
  poly(ctx, [[c[0], c[1] - 52], [c[0] + 15, c[1] - 52], [c[0] + 15, c[1] - 76], [c[0], c[1] - 76]], "rgba(0,0,0,0.18)");
  poly(ctx, [[c[0] - 15, c[1] - 76], [c[0], c[1] - 88], [c[0] + 15, c[1] - 76]], "#e5484d", "rgba(0,0,0,0.3)");
}

function airport(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, time: number) {
  groundDiamond(ctx, gx, gy, w, h, "#9bc487", 0.02, "rgba(0,0,0,0.2)");
  // dráha podél delší strany
  poly(ctx, [P(gx + 0.15, gy + h - 1.35), P(gx + w - 0.15, gy + h - 1.35), P(gx + w - 0.15, gy + h - 0.35), P(gx + 0.15, gy + h - 0.35)], "#4c505e", "rgba(0,0,0,0.3)");
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.4;
  ctx.setLineDash([6, 5]);
  const a = P(gx + 0.4, gy + h - 0.85);
  const b = P(gx + w - 0.4, gy + h - 0.85);
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
  ctx.setLineDash([]);
  // terminál a věž
  box(ctx, gx + 0.3, gy + 0.2, w - 1.4, 0.9, 0, 20, "#e0e6ef", "#3b6fd0", { windows: { cols: 3, rows: 1, lit: false, glass: "#9cc5ee" }, door: true });
  box(ctx, gx + w - 0.95, gy + 0.3, 0.45, 0.45, 0, 52, "#cdd5e0", "#3b6fd0");
  box(ctx, gx + w - 1.05, gy + 0.2, 0.65, 0.65, 52, 62, "#9cc5ee", "#e5484d");
  // letadlo
  const t = (time * 0.12) % 1;
  const p = P(gx + 0.5 + (w - 1) * t, gy + h - 0.85, 2 + Math.max(0, t - 0.6) * 60);
  ellipseAt(ctx, p[0], p[1], 11, 3.4, "#f4f6fa");
  ctx.fillStyle = "#e5484d";
  ctx.fillRect(p[0] - 2, p[1] - 9, 3, 7);
  poly(ctx, [[p[0] - 8, p[1] - 2], [p[0] + 3, p[1] - 11], [p[0] + 5, p[1] - 9], [p[0] - 2, p[1] - 1]], "#cdd5e0", "rgba(0,0,0,0.25)");
}

function port(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, time: number) {
  groundDiamond(ctx, gx, gy, w, h, "#4a9bd0", 0.0, "rgba(0,0,0,0.2)");
  groundDiamond(ctx, gx, gy + h * 0.5, w, h * 0.5, "#b8b2a0", 0.0);
  groundDiamond(ctx, gx + 0.1, gy + h * 0.5, w - 0.2, 0.25, "#8d8a82");
  // lodě
  const bobY = Math.sin(time * 1.5) * 1.2;
  const s = P(gx + 1.3, gy + 0.9);
  poly(ctx, [[s[0] - 28, s[1] - 8 + bobY], [s[0] + 28, s[1] - 8 + bobY], [s[0] + 20, s[1] + 4 + bobY], [s[0] - 20, s[1] + 4 + bobY]], "#2f4d7a", "rgba(0,0,0,0.3)");
  ctx.fillStyle = "#e5484d";
  ctx.fillRect(s[0] - 22, s[1] - 16 + bobY, 14, 8);
  ctx.fillStyle = "#f5a524";
  ctx.fillRect(s[0] - 8, s[1] - 16 + bobY, 14, 8);
  ctx.fillStyle = "#3b82f6";
  ctx.fillRect(s[0] - 22, s[1] - 22 + bobY, 14, 6);
  ctx.fillStyle = "#f4f6fa";
  ctx.fillRect(s[0] + 10, s[1] - 22 + bobY, 10, 14);
  // kontejnery a jeřáb
  const colors = ["#e5484d", "#3b82f6", "#f5a524", "#2f9e6f"];
  for (let i = 0; i < 5; i++) {
    box(ctx, gx + 0.3 + (i % 3) * 0.7, gy + h - 1.0 + Math.floor(i / 3) * 0.45, 0.6, 0.4, 0, 9, colors[i % 4], shade(colors[i % 4], 0.25));
  }
  const k = P(gx + w - 0.8, gy + h * 0.55);
  ctx.strokeStyle = "#f5a524";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(k[0], k[1]);
  ctx.lineTo(k[0], k[1] - 52);
  ctx.lineTo(k[0] - 38, k[1] - 44);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(k[0] - 32, k[1] - 45);
  ctx.lineTo(k[0] - 32, k[1] - 22);
  ctx.stroke();
}

function stadium(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, night: number) {
  const base = P(gx + w / 2, gy + h / 2);
  ellipseAt(ctx, base[0], base[1] + 2, (w + h) * 11, (w + h) * 5, "rgba(0,0,0,0.18)");
  box(ctx, gx + 0.1, gy + 0.1, w - 0.2, h - 0.2, 0, 26, "#c9cdd8", "#6a7f96");
  topDiamond(ctx, gx + 0.1, gy + 0.1, w - 0.2, h - 0.2, 26, 0.55, "#58a95c", "rgba(255,255,255,0.4)");
  topDiamond(ctx, gx + 0.1, gy + 0.1, w - 0.2, h - 0.2, 26, 0.35, "rgba(0,0,0,0)", "rgba(0,0,0,0.3)");
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1;
  const m0 = P(gx + w / 2, gy + 0.65, 26);
  const m1 = P(gx + w / 2, gy + h - 0.55, 26);
  ctx.beginPath();
  ctx.moveTo(m0[0], m0[1]);
  ctx.lineTo(m1[0], m1[1]);
  ctx.stroke();
  // věže reflektorů
  for (const [u, v] of [[0.2, 0.2], [w - 0.2, 0.2], [0.2, h - 0.2], [w - 0.2, h - 0.2]] as [number, number][]) {
    const p = P(gx + u, gy + v, 26);
    ctx.strokeStyle = "#6a6a74";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    ctx.lineTo(p[0], p[1] - 26);
    ctx.stroke();
    ctx.fillStyle = night > 0.3 ? "#fff3b0" : "#d6d1c3";
    ctx.fillRect(p[0] - 4, p[1] - 32, 8, 6);
  }
}

function zoo(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, seed: number) {
  groundDiamond(ctx, gx, gy, w, h, "#8fcf86", 0.02, "rgba(0,0,0,0.2)");
  poly(ctx, [P(gx + w / 2 - 0.1, gy), P(gx + w / 2 + 0.1, gy), P(gx + w / 2 + 0.1, gy + h), P(gx + w / 2 - 0.1, gy + h)], "#e3d5b0");
  poly(ctx, [P(gx, gy + h / 2 - 0.1), P(gx + w, gy + h / 2 - 0.1), P(gx + w, gy + h / 2 + 0.1), P(gx, gy + h / 2 + 0.1)], "#e3d5b0");
  const pens: [number, number, string, string][] = [
    [0.15, 0.15, "#d9c38a", "#c8742a"],
    [w / 2 + 0.2, 0.15, "#9cd0ee", "#5d6270"],
    [0.15, h / 2 + 0.2, "#b9d98a", "#f4f6fa"],
    [w / 2 + 0.2, h / 2 + 0.2, "#e6d3a0", "#8a5a3a"],
  ];
  pens.forEach(([u, v, ground, animal], i) => {
    const pw = w / 2 - 0.35;
    groundDiamond(ctx, gx + u, gy + v, pw, pw, ground, 0, "#6b5a46");
    const c = P(gx + u + pw / 2, gy + v + pw / 2);
    ellipseAt(ctx, c[0], c[1] + 1, 7, 3, "rgba(0,0,0,0.2)");
    ellipseAt(ctx, c[0], c[1] - 5, 7, 5.5, animal);
    ellipseAt(ctx, c[0] + 6, c[1] - 9, 3.5, 3.5, animal);
    if (i === 0) {
      ctx.fillStyle = "#c8742a";
      ctx.fillRect(c[0] - 6, c[1] - 2, 2, 5);
      ctx.fillRect(c[0] + 3, c[1] - 2, 2, 5);
    }
  });
  treesIn(ctx, gx, gy, w, h, 4, 0.75, Math.floor(seed * 40));
}

function pool(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, time: number) {
  groundDiamond(ctx, gx, gy, w, h, "#d6d1c3", 0.02, "rgba(0,0,0,0.2)");
  groundDiamond(ctx, gx + 0.2, gy + 0.4, w - 0.4, h - 0.6, "#e8f4f8", 0, "rgba(0,0,0,0.2)");
  groundDiamond(ctx, gx + 0.3, gy + 0.5, w - 0.6, h - 0.8, "#4fc3e8");
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    const a = P(gx + 0.3 + ((w - 0.6) * i) / 3, gy + 0.5);
    const b = P(gx + 0.3 + ((w - 0.6) * i) / 3, gy + h - 0.3);
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  }
  const c = P(gx + w / 2, gy + h / 2 + 0.1);
  ellipseAt(ctx, c[0] + Math.sin(time * 1.3) * 12, c[1] + 2, 3, 1.8, "#ffd5a8");
  box(ctx, gx + 0.1, gy + 0.05, 0.6, 0.3, 0, 10, "#f2c6c6", "#d0575a");
}

function gasStation(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number) {
  groundDiamond(ctx, gx, gy, w, h, "#6c7080", 0.02, "rgba(0,0,0,0.25)");
  box(ctx, gx + 0.1, gy + 0.1, 0.7, 0.8, 0, 14, "#f0f0f0", "#e5484d", { door: true, windows: { cols: 2, rows: 1, lit: false, glass: "#9cc5ee" } });
  // stříška
  const t0 = P(gx + 0.7, gy + 1.0, 22);
  const t1 = P(gx + 1.9, gy + 1.0, 22);
  const t2 = P(gx + 1.9, gy + 1.9, 22);
  const t3 = P(gx + 0.7, gy + 1.9, 22);
  for (const [u, v] of [[0.8, 1.1], [1.8, 1.1], [0.8, 1.8], [1.8, 1.8]] as [number, number][]) {
    const p = P(gx + u, gy + v);
    ctx.fillStyle = "#d6d6de";
    ctx.fillRect(p[0] - 1, p[1] - 22, 2, 22);
  }
  poly(ctx, [t0, t1, t2, t3], "#e5484d", "rgba(0,0,0,0.3)");
  for (const u of [1.05, 1.55]) {
    const p = P(gx + u, gy + 1.45);
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(p[0] - 2, p[1] - 9, 4, 9);
  }
}

function drawExtra(ctx: CanvasRenderingContext2D, id: string, gx: number, gy: number, w: number, h: number, seed: number, scene: Scene): boolean {
  switch (id) {
    case "forest":
      forest(ctx, gx, gy, w, h, seed);
      return true;
    case "lake":
      lake(ctx, gx, gy, w, h, scene.time);
      return true;
    case "mountain":
      mountain(ctx, gx, gy, w, h);
      return true;
    case "allotments":
      allotments(ctx, gx, gy, w, h);
      return true;
    case "parking":
      parking(ctx, gx, gy, w, h);
      return true;
    case "solar_farm":
      solarFarm(ctx, gx, gy, w, h);
      return true;
    case "ice_rink":
      iceRink(ctx, gx, gy, w, h, scene.time);
      return true;
    case "pumpkin_patch":
      pumpkinPatch(ctx, gx, gy, w, h, Math.floor(seed * 40));
      return true;
    case "christmas_market":
      christmasMarket(ctx, gx, gy, w, h, scene.time);
      return true;
    case "carousel":
      carousel(ctx, gx, gy, w, h, scene.time);
      return true;
    case "lighthouse":
      lighthouse(ctx, gx, gy, w, h, scene.night, scene.time);
      return true;
    case "rocket_pad":
      rocketPad(ctx, gx, gy, w, h, scene.time);
      return true;
    case "astronomical_clock":
      astronomicalClock(ctx, gx, gy, w, h, scene.night);
      return true;
    case "water_tower":
      waterTower(ctx, gx, gy, w, h);
      return true;
    case "airport":
      airport(ctx, gx, gy, w, h, scene.time);
      return true;
    case "port":
      port(ctx, gx, gy, w, h, scene.time);
      return true;
    case "stadium":
      stadium(ctx, gx, gy, w, h, scene.night);
      return true;
    case "zoo":
      zoo(ctx, gx, gy, w, h, seed);
      return true;
    case "pool":
      pool(ctx, gx, gy, w, h, scene.time);
      return true;
    case "gas_station":
      gasStation(ctx, gx, gy, w, h);
      return true;
    default:
      return false;
  }
}

// --- tabulka vzhledu budov ---

type Art = {
  wall: string;
  roof: string;
  hz: number;
  roofStyle?: "flat" | "gable";
  glass?: string;
  cols?: number;
  rows?: number;
  door?: boolean;
  awning?: [string, string];
  extra?: "chimney" | "smoke" | "flag" | "cross" | "sign" | "crown" | "columns" | "spire" | "dome" | "turrets";
};

const ART: Record<string, Art> = {
  cottage: { wall: "#f4d9a8", roof: "#c4553f", hz: 12, roofStyle: "gable", door: true, cols: 1, rows: 1, glass: "#9cc5ee", extra: "chimney" },
  house: { wall: "#f0c9a0", roof: "#b5473a", hz: 18, roofStyle: "gable", door: true, cols: 2, rows: 1, glass: "#9cc5ee", extra: "chimney" },
  townhouse: { wall: "#e8b4a0", roof: "#8c3f4a", hz: 30, roofStyle: "gable", door: true, cols: 2, rows: 2, glass: "#9cc5ee" },
  apartments: { wall: "#cdc6ba", roof: "#7a7a86", hz: 72, cols: 2, rows: 5, glass: "#8fb8dc" },
  tower: { wall: "#9fb4c9", roof: "#5d7188", hz: 160, cols: 2, rows: 12, glass: "#7fb0d8" },
  shop: { wall: "#f2c6c6", roof: "#d0575a", hz: 22, door: true, cols: 2, rows: 1, glass: "#9cc5ee", awning: ["#ffffff", "#d0575a"] },
  bakery: { wall: "#ffd9a0", roof: "#b7653d", hz: 22, roofStyle: "gable", door: true, cols: 2, rows: 1, glass: "#9cc5ee", awning: ["#ffffff", "#e0883a"], extra: "chimney" },
  cafe: { wall: "#bfe0c9", roof: "#4f9a6b", hz: 22, door: true, cols: 2, rows: 1, glass: "#9cc5ee", awning: ["#ffffff", "#4f9a6b"] },
  supermarket: { wall: "#e0e6ef", roof: "#3b6fd0", hz: 30, door: true, cols: 2, rows: 1, glass: "#9cc5ee", extra: "sign" },
  workshop: { wall: "#b8a58c", roof: "#6e5a46", hz: 30, cols: 2, rows: 1, glass: "#a7b9c9", extra: "smoke" },
  factory: { wall: "#a7a7b0", roof: "#55555f", hz: 46, cols: 2, rows: 2, glass: "#a7b9c9", extra: "smoke" },
  office: { wall: "#b6c7d9", roof: "#6a7f96", hz: 84, cols: 2, rows: 6, glass: "#8fb8dc" },
  hotel: { wall: "#e8d7ef", roof: "#8a5aa8", hz: 66, cols: 2, rows: 4, glass: "#9cc5ee", extra: "sign" },
  mall: { wall: "#d6d6de", roof: "#e05a8a", hz: 40, door: true, cols: 2, rows: 2, glass: "#9cc5ee", extra: "sign" },
  skyscraper: { wall: "#7aa7d6", roof: "#405d86", hz: 200, cols: 2, rows: 16, glass: "#6aa0d6" },
  school: { wall: "#f0d58a", roof: "#b0412f", hz: 34, roofStyle: "gable", door: true, cols: 2, rows: 2, glass: "#9cc5ee", extra: "flag" },
  library: { wall: "#cdb89e", roof: "#7c5a3a", hz: 38, door: true, cols: 2, rows: 2, glass: "#9cc5ee", extra: "columns" },
  fire_station: { wall: "#e4573d", roof: "#8a2b20", hz: 34, door: true, cols: 2, rows: 1, glass: "#cfe6f7", extra: "sign" },
  police: { wall: "#4f6fb3", roof: "#2f4577", hz: 34, door: true, cols: 2, rows: 2, glass: "#cfe6f7", extra: "sign" },
  town_hall: { wall: "#efe6d2", roof: "#6b8f9c", hz: 50, door: true, cols: 2, rows: 3, glass: "#9cc5ee", extra: "columns" },
  hospital: { wall: "#f4f6fa", roof: "#d94f5c", hz: 62, cols: 2, rows: 4, glass: "#9cc5ee", extra: "cross" },
  museum: { wall: "#e6dccb", roof: "#8a7d6b", hz: 36, door: true, cols: 2, rows: 2, glass: "#9cc5ee", extra: "columns" },
  university: { wall: "#d4b896", roof: "#6d4c3a", hz: 48, door: true, cols: 2, rows: 3, glass: "#9cc5ee", extra: "flag" },
  train_station: { wall: "#d9c9a8", roof: "#4f6f8c", hz: 28, door: true, cols: 2, rows: 1, glass: "#9cc5ee", extra: "sign" },
  bus_station: { wall: "#e4e8ef", roof: "#2f9e6f", hz: 24, door: true, cols: 2, rows: 1, glass: "#9cc5ee", extra: "sign" },
  metro: { wall: "#d6d6de", roof: "#e5484d", hz: 20, door: true, cols: 1, rows: 1, glass: "#9cc5ee", extra: "sign" },
  restaurant: { wall: "#f2d2a8", roof: "#b5473a", hz: 22, roofStyle: "gable", door: true, cols: 2, rows: 1, glass: "#ffe9a6", awning: ["#ffffff", "#b5473a"], extra: "chimney" },
  bank: { wall: "#e6dccb", roof: "#3f6a4f", hz: 40, door: true, cols: 2, rows: 2, glass: "#9cc5ee", extra: "columns" },
  cinema: { wall: "#3a3358", roof: "#e05a8a", hz: 34, door: true, cols: 2, rows: 1, glass: "#ffd24d", extra: "sign" },
  theatre: { wall: "#c9a46a", roof: "#8a2b3a", hz: 40, door: true, cols: 2, rows: 2, glass: "#ffe9a6", extra: "columns" },
  recycling: { wall: "#b8d9a0", roof: "#3f9d4a", hz: 24, cols: 2, rows: 1, glass: "#cfe6f7", extra: "sign" },
  power_plant: { wall: "#c4c8d2", roof: "#55555f", hz: 40, cols: 3, rows: 2, glass: "#a7b9c9", extra: "smoke" },
  kindergarten: { wall: "#ffe0a8", roof: "#4aa3d8", hz: 20, roofStyle: "gable", door: true, cols: 2, rows: 1, glass: "#9cc5ee", extra: "flag" },
  post_office: { wall: "#ffe08a", roof: "#e5a524", hz: 22, door: true, cols: 2, rows: 1, glass: "#9cc5ee", extra: "sign" },
  church: { wall: "#efe6d2", roof: "#8a4a3a", hz: 30, roofStyle: "gable", door: true, cols: 1, rows: 2, glass: "#7aa7d6", extra: "spire" },
  observatory: { wall: "#dfe6f2", roof: "#3a4a7a", hz: 38, cols: 1, rows: 3, glass: "#8fb8dc", extra: "dome" },
  aquarium: { wall: "#9fd6e8", roof: "#2f7fa8", hz: 30, door: true, cols: 3, rows: 2, glass: "#4fc3e8", extra: "sign" },
  cathedral: { wall: "#e0d6c0", roof: "#5d6f8c", hz: 50, roofStyle: "gable", door: true, cols: 2, rows: 3, glass: "#7a5cff", extra: "spire" },
  castle: { wall: "#cfc8b6", roof: "#8a8f9c", hz: 44, door: true, cols: 2, rows: 2, glass: "#6a6a74", extra: "turrets" },
};

const NIGHT_LIT = 0.35;

function drawBuilding(ctx: CanvasRenderingContext2D, id: string, gx: number, gy: number, w: number, h: number, seed: number, night: number, time: number) {
  const art = ART[id];
  if (!art) return;
  const base = P(gx + w / 2, gy + h / 2);
  ellipseAt(ctx, base[0], base[1], (w + h) * 12, (w + h) * 5, "rgba(0,0,0,0.18)");
  box(ctx, gx + 0.06, gy + 0.06, w - 0.12, h - 0.12, 0, art.hz, art.wall, art.roof, {
    roofStyle: art.roofStyle,
    door: art.door,
    awning: art.awning,
    seed,
    windows: { cols: art.cols ?? 2, rows: art.rows ?? 1, lit: night > NIGHT_LIT, glass: art.glass ?? "#9cc5ee" },
  });

  const roofTop = P(gx + w / 2, gy + h / 2, art.hz + (art.roofStyle === "gable" ? 12 : 0));
  switch (art.extra) {
    case "chimney": {
      const c = P(gx + w * 0.7, gy + h * 0.35, art.hz + 6);
      ctx.fillStyle = "#8a4a3a";
      ctx.fillRect(c[0] - 2.5, c[1] - 9, 5, 11);
      smoke(ctx, c[0], c[1] - 9, time, seed);
      break;
    }
    case "smoke": {
      for (let i = 0; i < Math.max(1, Math.round(w / 2)); i++) {
        const c = P(gx + 0.5 + i * 1.1, gy + h * 0.4, art.hz);
        ctx.fillStyle = "#6a6a74";
        ctx.fillRect(c[0] - 3, c[1] - 16, 6, 18);
        ctx.fillStyle = "#c0504a";
        ctx.fillRect(c[0] - 3, c[1] - 16, 6, 2.4);
        smoke(ctx, c[0], c[1] - 16, time, seed + i * 0.3);
      }
      break;
    }
    case "flag": {
      flag(ctx, roofTop[0], roofTop[1] + 4, time);
      break;
    }
    case "cross": {
      ctx.fillStyle = "#d94f5c";
      ctx.fillRect(roofTop[0] - 2, roofTop[1] - 12, 4, 14);
      ctx.fillRect(roofTop[0] - 7, roofTop[1] - 7, 14, 4);
      break;
    }
    case "sign": {
      const p = P(gx + w / 2, gy + h - 0.06, art.hz * 0.55);
      sign(ctx, p[0], p[1], Math.min(26, w * 7), art.roof);
      break;
    }
    case "columns": {
      for (let i = 0; i < Math.max(2, Math.round(w * 2)); i++) {
        const u = (i + 0.5) / Math.max(2, Math.round(w * 2));
        const p = P(gx + 0.06 + (w - 0.12) * u, gy + h - 0.06, 0);
        ctx.fillStyle = "#f4efe2";
        ctx.fillRect(p[0] - 1.8, p[1] - art.hz * 0.8, 3.6, art.hz * 0.8);
      }
      break;
    }
    case "spire": {
      const base = P(gx + w / 2, gy + h / 2, art.hz + 8);
      poly(ctx, [[base[0] - 9, base[1]], [base[0], base[1] - 38], [base[0] + 9, base[1]]], shade(art.roof, 0.05), "rgba(0,0,0,0.3)");
      poly(ctx, [[base[0], base[1] + 2], [base[0], base[1] - 38], [base[0] + 9, base[1]]], "rgba(0,0,0,0.2)");
      ctx.fillStyle = "#ffd24d";
      ctx.fillRect(base[0] - 0.8, base[1] - 50, 1.6, 12);
      ctx.fillRect(base[0] - 3.5, base[1] - 46, 7, 1.6);
      break;
    }
    case "dome": {
      const base = P(gx + w / 2, gy + h / 2, art.hz);
      ellipseAt(ctx, base[0], base[1], 17, 8, shade("#cfd8e8", -0.15));
      ctx.beginPath();
      ctx.ellipse(base[0], base[1], 15, 15, 0, Math.PI, 0);
      ctx.fillStyle = "#e8eef8";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.stroke();
      ctx.fillStyle = "#3a4a7a";
      ctx.fillRect(base[0] - 1.6, base[1] - 15, 3.2, 15);
      break;
    }
    case "turrets": {
      const corners: [number, number][] = [[0.18, 0.18], [w - 0.18, 0.18], [0.18, h - 0.18], [w - 0.18, h - 0.18]];
      for (const [u, v] of corners) {
        const p = P(gx + u, gy + v, art.hz);
        ctx.fillStyle = "#b9b2a0";
        ctx.fillRect(p[0] - 6, p[1] - 28, 12, 28);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(p[0], p[1] - 28, 6, 28);
        poly(ctx, [[p[0] - 8, p[1] - 28], [p[0], p[1] - 44], [p[0] + 8, p[1] - 28]], "#e5484d", "rgba(0,0,0,0.3)");
      }
      flag(ctx, roofTop[0], roofTop[1] + 2, time);
      break;
    }
    default:
      break;
  }
}

// --- vlastní kreslení jedné položky ---

function drawItem(ctx: CanvasRenderingContext2D, id: string, gx: number, gy: number, w: number, h: number, scene: Scene, fences: Set<number>) {
  const seed = hash(gx, gy);
  const center = P(gx + w / 2, gy + h / 2);
  const cx = center[0];
  const cy = center[1] + 4;
  switch (id) {
    case "tree":
      return tree(ctx, cx, cy, seed);
    case "bush":
      return bush(ctx, cx, cy, seed);
    case "flowerbed":
      return flowerbed(ctx, gx, gy, seed);
    case "lamp":
      return lamp(ctx, cx, cy);
    case "bench":
      return bench(ctx, cx, cy);
    case "bin":
      return bin(ctx, cx, cy);
    case "mailbox":
      return mailbox(ctx, cx, cy);
    case "flag":
      return flag(ctx, cx, cy, scene.time);
    case "statue":
      return statue(ctx, gx, gy);
    case "clock_tower":
      return clockTower(ctx, gx, gy, w, h, scene.night);
    case "memorial":
      return memorial(ctx, gx, gy, w, h, false);
    case "monument":
      return memorial(ctx, gx, gy, w, h, true);
    case "park":
      return park(ctx, gx, gy, w, h);
    case "pond":
      return pond(ctx, gx, gy, w, h, scene.time);
    case "fountain":
      return fountain(ctx, gx, gy, w, h, scene.time);
    case "playground":
      return playground(ctx, gx, gy, w, h);
    case "stall":
      return stall(ctx, gx, gy);
    case "market":
      return marketHall(ctx, gx, gy, w, h);
    case "bus_stop":
      return busStop(ctx, cx, cy, false);
    case "tram_stop":
      return busStop(ctx, cx, cy, true);
    case "christmas_tree":
      return christmasTree(ctx, gx, gy, w, h, scene.time);
    case "windmill":
      return windmill(ctx, gx, gy, w, h, scene.time);
    case "ferris_wheel":
      return ferrisWheel(ctx, gx, gy, w, h, scene.time);
    case "fence": {
      ellipseAt(ctx, cx, cy + 1, 5, 2.4, "rgba(0,0,0,0.2)");
      const c = (dx: number, dy: number) => (fences.has((gy + dy) * CITY_SIZE + gx + dx) ? true : false);
      ctx.strokeStyle = "#6b5a46";
      ctx.lineWidth = 1.8;
      const sides: [number, number, Pt][] = [
        [1, 0, P(gx + 1, gy + 0.5)],
        [-1, 0, P(gx, gy + 0.5)],
        [0, 1, P(gx + 0.5, gy + 1)],
        [0, -1, P(gx + 0.5, gy)],
      ];
      let any = false;
      for (const [dx, dy, edge] of sides) {
        if (!c(dx, dy)) continue;
        any = true;
        for (const z of [6, 12]) {
          ctx.beginPath();
          ctx.moveTo(cx, cy - z);
          ctx.lineTo(edge[0], edge[1] + 4 - z);
          ctx.stroke();
        }
      }
      if (!any) {
        const a = P(gx, gy + 0.5);
        const b = P(gx + 1, gy + 0.5);
        for (const z of [6, 12]) {
          ctx.beginPath();
          ctx.moveTo(a[0] + 4, a[1] + 4 - z);
          ctx.lineTo(b[0] - 4, b[1] + 4 - z);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "#4a3b2c";
      ctx.fillRect(cx - 1.6, cy - 14, 3.2, 16);
      return;
    }
    default:
      if (drawExtra(ctx, id, gx, gy, w, h, seed, scene)) return;
      return drawBuilding(ctx, id, gx, gy, w, h, Math.floor(seed * 100), scene.night, scene.time);
  }
}

// --- zem, silnice, koleje ---

function drawGround(ctx: CanvasRenderingContext2D, sprites: SpriteStore | null) {
  const size = CITY_SIZE;
  // boky mapy
  const L0 = P(0, size);
  const L1 = P(size, size);
  const R1 = P(size, 0);
  const th = 22;
  poly(ctx, [L0, L1, [L1[0], L1[1] + th], [L0[0], L0[1] + th]], "#6e5232");
  poly(ctx, [L1, R1, [R1[0], R1[1] + th], [L1[0], L1[1] + th]], "#57402a");
  for (let gx = 0; gx < size; gx++) {
    for (let gy = 0; gy < size; gy++) {
      const dark = (gx + gy) % 2 === 0;
      const tile = sprites?.get(dark ? "grass_a" : "grass_b");
      if (tile) drawFootprintSprite(ctx, tile, gx, gy, 1, 1);
      else groundDiamond(ctx, gx, gy, 1, 1, dark ? "#7cc47a" : "#74bb72");
    }
  }
}

function neighbours(items: Placed[], pred: (id: string) => boolean): Set<number> {
  const set = new Set<number>();
  for (const [id, x, y] of items) if (pred(id)) set.add(y * CITY_SIZE + x);
  return set;
}

function drawRoad(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  roads: Set<number>,
  rails: Set<number>,
  crossing: boolean,
  sprites: SpriteStore | null,
) {
  const has = (dx: number, dy: number) => roads.has((gy + dy) * CITY_SIZE + gx + dx);
  const railHas = (dx: number, dy: number) => rails.has((gy + dy) * CITY_SIZE + gx + dx);
  const key = crossing
    ? `crossing_${railHas(0, 1) || railHas(0, -1) ? "y" : "x"}`
    : `road_${(has(1, 0) ? 1 : 0) | (has(-1, 0) ? 2 : 0) | (has(0, 1) ? 4 : 0) | (has(0, -1) ? 8 : 0)}`;
  const tile = sprites?.get(key);
  if (tile) {
    drawFootprintSprite(ctx, tile, gx, gy, 1, 1);
    return;
  }
  groundDiamond(ctx, gx, gy, 1, 1, "#3b3e4b", 0);
  // chodníky na stranách bez sousední silnice
  const walk = "#b9b4a6";
  const wd = 0.14;
  if (!has(1, 0)) poly(ctx, [P(gx + 1 - wd, gy), P(gx + 1, gy), P(gx + 1, gy + 1), P(gx + 1 - wd, gy + 1)], walk);
  if (!has(-1, 0)) poly(ctx, [P(gx, gy), P(gx + wd, gy), P(gx + wd, gy + 1), P(gx, gy + 1)], walk);
  if (!has(0, 1)) poly(ctx, [P(gx, gy + 1 - wd), P(gx + 1, gy + 1 - wd), P(gx + 1, gy + 1), P(gx, gy + 1)], walk);
  if (!has(0, -1)) poly(ctx, [P(gx, gy), P(gx + 1, gy), P(gx + 1, gy + wd), P(gx, gy + wd)], walk);
  // středová čára
  ctx.strokeStyle = "rgba(255,230,140,0.75)";
  ctx.lineWidth = 1.4;
  ctx.setLineDash([5, 5]);
  const c = P(gx + 0.5, gy + 0.5);
  const dirs: [number, number, Pt][] = [
    [1, 0, P(gx + 1, gy + 0.5)],
    [-1, 0, P(gx, gy + 0.5)],
    [0, 1, P(gx + 0.5, gy + 1)],
    [0, -1, P(gx + 0.5, gy)],
  ];
  let count = 0;
  for (const [dx, dy, edge] of dirs) {
    if (!has(dx, dy)) continue;
    count++;
    ctx.beginPath();
    ctx.moveTo(c[0], c[1]);
    ctx.lineTo(edge[0], edge[1]);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  if (count === 0) {
    ctx.beginPath();
    ctx.moveTo(P(gx + 0.2, gy + 0.5)[0], P(gx + 0.2, gy + 0.5)[1]);
    ctx.lineTo(P(gx + 0.8, gy + 0.5)[0], P(gx + 0.8, gy + 0.5)[1]);
    ctx.stroke();
  }
  if (crossing) {
    drawRails(ctx, gx, gy, rails);
    // pruhy přejezdu
    const stripes = 4;
    for (let i = 0; i < stripes; i++) {
      const u = 0.1 + (i / (stripes - 1)) * 0.8;
      poly(ctx, [P(gx + u - 0.04, gy + 0.05), P(gx + u + 0.04, gy + 0.05), P(gx + u + 0.04, gy + 0.2), P(gx + u - 0.04, gy + 0.2)], "rgba(255,255,255,0.8)");
      poly(ctx, [P(gx + u - 0.04, gy + 0.8), P(gx + u + 0.04, gy + 0.8), P(gx + u + 0.04, gy + 0.95), P(gx + u - 0.04, gy + 0.95)], "rgba(255,255,255,0.8)");
    }
  }
}

function drawRails(ctx: CanvasRenderingContext2D, gx: number, gy: number, rails: Set<number>) {
  const has = (dx: number, dy: number) => rails.has((gy + dy) * CITY_SIZE + gx + dx);
  const axes: [boolean, boolean] = [has(1, 0) || has(-1, 0), has(0, 1) || has(0, -1)];
  if (!axes[0] && !axes[1]) axes[0] = true;
  const rail = (ax: "x" | "y", from: number, to: number) => {
    const a = (t: number, off: number) => (ax === "x" ? P(gx + t, gy + 0.5 + off) : P(gx + 0.5 + off, gy + t));
    // pražce
    ctx.strokeStyle = "#5a4630";
    ctx.lineWidth = 2;
    for (let t = from + 0.1; t <= to - 0.05; t += 0.22) {
      const p0 = a(t, -0.22);
      const p1 = a(t, 0.22);
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.stroke();
    }
    ctx.strokeStyle = "#c9ccd6";
    ctx.lineWidth = 1.5;
    for (const off of [-0.12, 0.12]) {
      const p0 = a(from, off);
      const p1 = a(to, off);
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.stroke();
    }
  };
  if (axes[0]) rail("x", 0, 1);
  if (axes[1]) rail("y", 0, 1);
}

// Sprite budovy nebo dlaždice: šířka obrázku = šířka diamantu půdorysu, levý okraj v levém rohu
// půdorysu, spodní okraj v rohu nejblíž ke kameře (pro w ≠ h není ve středu obrázku).
function drawFootprintSprite(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const left = P(x, y + h)[0];
  const bottom = P(x + w, y + h)[1];
  const dw = ((w + h) * TW) / 2;
  const dh = (img.height / img.width) * dw;
  ctx.drawImage(img, left, bottom - dh, dw, dh);
}

const CAR_SPRITES: Record<string, string> = {
  "#e5484d": "cervene",
  "#3b82f6": "modre",
  "#f5a524": "oranzove",
  "#2fb344": "zelene",
  "#f4f4f6": "bile",
  "#8b5cf6": "fialove",
  "#14b8a6": "tyrkysove",
};

// --- hlavní kreslení ---

type Drawable = { depth: number; draw: () => void };

export function drawCity(ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number, camera: Camera, scene: Scene) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#0f1d2e";
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  drawGround(ctx, scene.sprites);

  const roads = neighbours(scene.items, (id) => id === "road" || id === "crossing");
  const rails = neighbours(scene.items, (id) => id === "rail" || id === "crossing");
  const fences = neighbours(scene.items, (id) => id === "fence");

  // plochá vrstva: silnice a koleje
  for (const [id, x, y] of scene.items) {
    if (id === "road") drawRoad(ctx, x, y, roads, rails, false, scene.sprites);
    else if (id === "crossing") drawRoad(ctx, x, y, roads, rails, true, scene.sprites);
    else if (id === "rail") {
      const has = (dx: number, dy: number) => rails.has((y + dy) * CITY_SIZE + x + dx);
      const ax = has(1, 0) || has(-1, 0);
      const ay = has(0, 1) || has(0, -1);
      const tile = scene.sprites?.get(ax && ay ? "rail_xy" : ay ? "rail_y" : "rail_x");
      if (tile) drawFootprintSprite(ctx, tile, x, y, 1, 1);
      else {
        groundDiamond(ctx, x, y, 1, 1, "#9c9384", 0);
        drawRails(ctx, x, y, rails);
      }
    }
  }

  const drawables: Drawable[] = [];
  scene.items.forEach(([id, x, y, rot], index) => {
    if (id === "road" || id === "rail" || id === "crossing") return;
    const def = getItem(id);
    if (!def) return;
    const [w, h] = footprint(def, rot);
    drawables.push({
      depth: x + w - 1 + (y + h - 1) + 0.01 * (w + h),
      draw: () => {
        const key = rot === 1 && w !== h ? `${id}_r` : id;
        const sprite = scene.sprites?.get(key);
        if (sprite) {
          drawFootprintSprite(ctx, sprite, x, y, w, h);
          const night = scene.night > 0.05 ? scene.sprites?.get(`${key}_noc`) : null;
          if (night) {
            ctx.globalAlpha = Math.min(1, scene.night * 1.4);
            drawFootprintSprite(ctx, night, x, y, w, h);
            ctx.globalAlpha = 1;
          }
        } else {
          drawItem(ctx, id, x, y, w, h, scene, fences);
        }
        if (scene.notWorking.has(index)) {
          const top = P(x + w / 2, y + h / 2, (ART[id]?.hz ?? 14) + 20);
          const pulse = 0.6 + 0.4 * Math.sin(scene.time * 5);
          ctx.globalAlpha = pulse;
          ellipseAt(ctx, top[0], top[1], 9, 9, "#ff5d73");
          ctx.globalAlpha = 1;
          ctx.fillStyle = "#fff";
          ctx.font = "bold 12px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("!", top[0], top[1] + 0.5);
        }
      },
    });
  });

  for (const v of scene.traffic.vehicles) {
    for (const part of vehicleParts(v)) {
      drawables.push({
        depth: part.gx + part.gy - 1,
        draw: () => {
          const alongX = part.dx !== 0 || part.dy === 0;
          const len = v.kind === "train" ? 0.6 : 0.4;
          const wid = v.kind === "train" ? 0.3 : 0.22;
          const bw = alongX ? len : wid;
          const bh = alongX ? wid : len;
          // jízda vpravo
          const lane = v.kind === "car" ? 0.13 : 0;
          const ox = part.dy * lane;
          const oy = part.dx * lane;
          const bx = part.gx + ox - bw / 2;
          const by = part.gy + oy - bh / 2;
          const name = v.kind === "train" ? `train_${part.lead ? "lead" : "wagon"}` : `car_${CAR_SPRITES[v.color] ?? "cervene"}`;
          const sprite = scene.sprites?.get(`${name}_${alongX ? "x" : "y"}`);
          if (sprite) {
            const c = P(part.gx + ox, part.gy + oy);
            const size = sprite.width / 2;
            ctx.drawImage(sprite, c[0] - size / 2, c[1] - size / 2, size, size);
            return;
          }
          const color = v.kind === "train" ? (part.lead ? "#d94f5c" : "#4f7fbf") : v.color;
          const hz = v.kind === "train" ? 11 : 7;
          box(ctx, bx, by, bw, bh, 1, 1 + hz, color, shade(color, 0.25));
          if (v.kind === "car") {
            box(ctx, bx + bw * 0.25, by + bh * 0.2, bw * 0.5, bh * 0.6, 1 + hz, 1 + hz + 4, "#9cc5ee", "#cfe6f7");
          }
        },
      });
    }
  }

  drawables.sort((a, b) => a.depth - b.depth);
  for (const d of drawables) d.draw();

  // duchové (náhled stavění) a označení pod kurzorem
  for (const g of scene.ghosts) {
    const def = getItem(g.id);
    if (!def) continue;
    const [w, h] = footprint(def, g.rot);
    groundDiamond(ctx, g.x, g.y, w, h, g.valid ? "rgba(80,220,140,0.45)" : "rgba(255,80,100,0.5)", 0, g.valid ? "#2fb344" : "#e5484d");
    if (g.valid && w * h > 1) {
      ctx.globalAlpha = 0.7;
      drawItem(ctx, g.id, g.x, g.y, w, h, scene, fences);
      ctx.globalAlpha = 1;
    }
  }
  if (scene.hover && scene.ghosts.length === 0) {
    groundDiamond(ctx, scene.hover.x, scene.hover.y, 1, 1, "rgba(255,255,255,0.18)", 0, "rgba(255,255,255,0.6)");
  }
  if (scene.selected !== null) {
    const entry = scene.items[scene.selected];
    const def = entry ? getItem(entry[0]) : undefined;
    if (entry && def) {
      const [w, h] = footprint(def, entry[3]);
      const pulse = 0.5 + 0.5 * Math.sin(scene.time * 5);
      groundDiamond(ctx, entry[1], entry[2], w, h, `rgba(255,255,255,${0.12 + pulse * 0.12})`, 0, "#ffffff");
    }
  }

  ctx.restore();

  // noc: ztmavení celé scény a záře lamp
  if (scene.night > 0.02) {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "multiply";
    const k = scene.night * 0.9;
    const r = Math.round(255 + (70 - 255) * k);
    const g = Math.round(255 + (85 - 255) * k);
    const b = Math.round(255 + (150 - 255) * k);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);
    ctx.globalCompositeOperation = "lighter";
    for (const [id, x, y] of scene.items) {
      if (id !== "lamp" && id !== "bus_stop" && id !== "tram_stop" && id !== "fountain") continue;
      const p = P(x + 0.5, y + 0.5, id === "lamp" ? 26 : 12);
      const radius = id === "lamp" ? 46 : 28;
      const grad = ctx.createRadialGradient(p[0] + (id === "lamp" ? 7 : 0), p[1], 0, p[0] + (id === "lamp" ? 7 : 0), p[1], radius);
      grad.addColorStop(0, `rgba(255,220,130,${0.55 * scene.night})`);
      grad.addColorStop(1, "rgba(255,200,100,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(p[0] - radius + 7, p[1] - radius, radius * 2, radius * 2);
    }
    ctx.restore();
  }
}
