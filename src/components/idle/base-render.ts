// Vykreslovač Základny: pohled shora na mřížku modulů ve vesmíru. Čistý canvas bez knihoven.

import { BASE_SIZE, footprint, getModule, type BaseCat, type Placed } from "@/lib/idle/base";

export type BaseGhost = { id: string; x: number; y: number; rot: 0 | 1; valid: boolean };

export type BaseScene = {
  items: Placed[];
  // Indexy modulů, které nejsou spojené s velitelským modulem.
  idle: Set<number>;
  ghost: BaseGhost | null;
  hover: { x: number; y: number } | null;
  selected: number | null;
  demolish: boolean;
  docked: number;
  time: number;
};

export const CAT_COLORS: Record<BaseCat, string> = {
  core: "#5a6cff",
  energy: "#ffc933",
  life: "#3fbf8f",
  science: "#4aa3d8",
  industry: "#ff8a6b",
  ships: "#9a86f0",
};

export const MODULE_ICONS: Record<string, string> = {
  core: "🛰️",
  corridor: "▫️",
  solar: "☀️",
  reactor: "⚛️",
  quarters: "🛏️",
  greenhouse: "🌱",
  water: "💧",
  lab: "🧪",
  observatory: "🔭",
  antenna: "📡",
  workshop: "🔧",
  trade: "💱",
  hangar: "🚀",
  shipyard: "🏗️",
};

// 3D rendery modulů z Blenderu (public/base): pohled shora přes celý půdorys, 96 px na políčko.
// Otočené moduly mají vlastní soubor <id>_r, chodba má dlaždici podle sousedů (chodba_<maska>).
// Dokud se obrázek nenačte, kreslí se modul kódem jako dřív.
const sprites = new Map<string, HTMLImageElement>();

function sprite(name: string): HTMLImageElement | null {
  if (typeof Image === "undefined") return null;
  let img = sprites.get(name);
  if (!img) {
    img = new Image();
    img.src = `/base/modules/${name}.webp`;
    sprites.set(name, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

let dockedShip: HTMLImageElement | null = null;

function shipSprite(): HTMLImageElement | null {
  if (typeof Image === "undefined") return null;
  if (!dockedShip) {
    dockedShip = new Image();
    dockedShip.src = "/base/ships/shuttle-top.webp";
  }
  return dockedShip.complete && dockedShip.naturalWidth > 0 ? dockedShip : null;
}

export function moduleIcon(id: string): string {
  return `/base/icons/${id}.webp`;
}

export function shipIcon(type: string): string {
  return `/base/ships/${type}.webp`;
}

export function planetImage(id: string): string {
  return `/base/planets/${id}.webp`;
}

function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + (amount < 0 ? v : 255 - v) * amount)));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

function drawStars(ctx: CanvasRenderingContext2D, size: number, time: number) {
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.75);
  g.addColorStop(0, "#1b1650");
  g.addColorStop(1, "#07061c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 70; i++) {
    const x = hash(i) * size;
    const y = hash(i + 100) * size;
    const tw = 0.5 + 0.5 * Math.sin(time * (0.8 + hash(i + 200) * 1.6) + i);
    ctx.globalAlpha = 0.25 + tw * 0.6;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, 1.4 + hash(i + 300) * 1.4, 1.4 + hash(i + 300) * 1.4);
  }
  ctx.globalAlpha = 1;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawModule(
  ctx: CanvasRenderingContext2D,
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  cell: number,
  time: number,
  idle: boolean,
  docked: number,
  rot: 0 | 1 = 0,
  mask = 15,
) {
  const def = getModule(id);
  if (!def) return;
  const color = CAT_COLORS[def.cat];
  const px = x * cell + 1.5;
  const py = y * cell + 1.5;
  const pw = w * cell - 3;
  const ph = h * cell - 3;
  const cx = px + pw / 2;
  const cy = py + ph / 2;

  const art = sprite(id === "corridor" ? `chodba_${mask}` : rot && w !== h ? `${id}_r` : id);
  if (art) {
    drawSprite(ctx, art, id, x, y, w, h, cell, time, rot, docked);
    if (idle) drawIdle(ctx, px, py, pw, ph, cx, cell, time);
    return;
  }

  // stín a trup
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  roundRect(ctx, px + 2, py + 3, pw, ph, cell * 0.16);
  ctx.fill();
  const g = ctx.createLinearGradient(px, py, px, py + ph);
  g.addColorStop(0, shade(color, 0.18));
  g.addColorStop(1, shade(color, -0.35));
  ctx.fillStyle = g;
  roundRect(ctx, px, py, pw, ph, cell * 0.16);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();

  if (id === "corridor") {
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(cx - cell * 0.12, py + cell * 0.12, cell * 0.24, ph - cell * 0.24);
    ctx.fillRect(px + cell * 0.12, cy - cell * 0.12, pw - cell * 0.24, cell * 0.24);
  } else {
    // vnitřní panel
    ctx.fillStyle = "rgba(10,8,40,0.38)";
    roundRect(ctx, px + cell * 0.12, py + cell * 0.12, pw - cell * 0.24, ph - cell * 0.24, cell * 0.1);
    ctx.fill();
  }

  if (id === "solar") {
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(px + (pw * i) / 4, py + cell * 0.12);
      ctx.lineTo(px + (pw * i) / 4, py + ph - cell * 0.12);
      ctx.stroke();
    }
    const glint = ((time * 0.35) % 1) * (pw + ph);
    ctx.save();
    roundRect(ctx, px, py, pw, ph, cell * 0.16);
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.moveTo(px + glint - ph, py + ph);
    ctx.lineTo(px + glint - ph + 10, py + ph);
    ctx.lineTo(px + glint + 10, py);
    ctx.lineTo(px + glint, py);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (id === "reactor") {
    const pulse = 0.5 + 0.5 * Math.sin(time * 3);
    const rg = ctx.createRadialGradient(cx, cy, 2, cx, cy, cell * 0.9);
    rg.addColorStop(0, `rgba(255,230,120,${0.7 + pulse * 0.3})`);
    rg.addColorStop(1, "rgba(255,200,60,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(px, py, pw, ph);
  } else if (id === "observatory") {
    const a = time * 0.8;
    ctx.strokeStyle = "rgba(190,235,255,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * cell * 0.75, cy + Math.sin(a) * cell * 0.75);
    ctx.stroke();
  } else if (id === "greenhouse") {
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = `rgba(150,255,170,${0.35 + 0.3 * Math.sin(time * 2 + i)})`;
      ctx.beginPath();
      ctx.arc(px + hash(i + x * 7) * pw, py + hash(i + 9 + y * 3) * ph, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === "core") {
    const on = Math.sin(time * 4) > 0;
    ctx.fillStyle = on ? "#ff5d73" : "#7a2a38";
    ctx.beginPath();
    ctx.arc(px + pw - cell * 0.22, py + cell * 0.22, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === "hangar") {
    for (let i = 0; i < Math.min(docked, 2); i++) {
      const sx = px + pw * (0.3 + i * 0.4);
      const sy = py + ph * 0.72;
      ctx.fillStyle = "#e8eef8";
      ctx.beginPath();
      ctx.moveTo(sx, sy - cell * 0.4);
      ctx.lineTo(sx + cell * 0.2, sy);
      ctx.lineTo(sx - cell * 0.2, sy);
      ctx.closePath();
      ctx.fill();
    }
  }

  // okna svítí a blikají podle výkonu
  if (def.cat !== "core" || id === "core") {
    ctx.fillStyle = "rgba(255,240,160,0.9)";
    const count = Math.max(1, Math.round(w * h));
    for (let i = 0; i < count; i++) {
      if (hash(i + x * 13 + y * 5) < 0.3) continue;
      ctx.fillRect(px + 5 + i * 7, py + 4, 3, 3);
    }
  }

  // ikona
  const icon = MODULE_ICONS[id];
  if (icon && id !== "corridor") {
    ctx.font = `${Math.min(cell * 0.9, Math.min(pw, ph) * 0.7)}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(icon, cx, cy + 1);
  }

  if (idle) drawIdle(ctx, px, py, pw, ph, cx, cell, time);
}

// Modul odpojený od velitelského modulu: červený závoj a blikající vykřičník.
function drawIdle(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number, ph: number, cx: number, cell: number, time: number) {
  ctx.fillStyle = "rgba(255,70,90,0.35)";
  roundRect(ctx, px, py, pw, ph, cell * 0.16);
  ctx.fill();
  const pulse = 0.6 + 0.4 * Math.sin(time * 5);
  ctx.globalAlpha *= pulse;
  ctx.fillStyle = "#ff5d73";
  ctx.beginPath();
  ctx.arc(cx, py + 10, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha /= pulse;
  ctx.fillStyle = "#fff";
  ctx.font = "bold 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("!", cx, py + 10.5);
}

// 3D render modulu a nad ním jen živé efekty: záře reaktoru, odlesk panelů, maják a lodě v hangáru.
function drawSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  cell: number,
  time: number,
  rot: 0 | 1,
  docked: number,
) {
  const px = x * cell;
  const py = y * cell;
  const pw = w * cell;
  const ph = h * cell;
  const cx = px + pw / 2;
  const cy = py + ph / 2;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = cell * 0.25;
  ctx.shadowOffsetY = cell * 0.08;
  ctx.drawImage(img, px, py, pw, ph);
  ctx.restore();

  if (id === "reactor") {
    const pulse = 0.5 + 0.5 * Math.sin(time * 3);
    const rg = ctx.createRadialGradient(cx, cy, 1, cx, cy, cell * 0.55);
    rg.addColorStop(0, `rgba(255,236,140,${0.25 + pulse * 0.35})`);
    rg.addColorStop(1, "rgba(255,200,60,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(px, py, pw, ph);
  } else if (id === "solar") {
    const glint = ((time * 0.35) % 1) * (pw + ph);
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.moveTo(px + glint - ph, py + ph);
    ctx.lineTo(px + glint - ph + 8, py + ph);
    ctx.lineTo(px + glint + 8, py);
    ctx.lineTo(px + glint, py);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (id === "core") {
    if (Math.sin(time * 4) > 0) {
      ctx.fillStyle = "#ff5d73";
      ctx.beginPath();
      ctx.arc(px + pw * 0.67, py + ph * 0.67, Math.max(2, cell * 0.08), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === "hangar") {
    // Přistávací kruhy leží v přední polovině hangáru; otočený hangár je má vpravo.
    const ship = shipSprite();
    const spots = rot ? [[0.72, 0.3], [0.72, 0.7]] : [[0.3, 0.72], [0.7, 0.72]];
    for (let i = 0; i < Math.min(docked, 2); i++) {
      const sx = px + pw * spots[i][0];
      const sy = py + ph * spots[i][1];
      const s = cell * 0.95;
      if (ship) ctx.drawImage(ship, sx - s / 2, sy - s / 2, s, s);
    }
  }
}

export function drawBase(ctx: CanvasRenderingContext2D, size: number, dpr: number, scene: BaseScene) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawStars(ctx, size, scene.time);
  const cell = size / BASE_SIZE;

  // mřížka
  ctx.strokeStyle = "rgba(160,170,255,0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= BASE_SIZE; i++) {
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, size);
    ctx.moveTo(0, i * cell);
    ctx.lineTo(size, i * cell);
  }
  ctx.stroke();

  // Obsazená políčka, aby chodba věděla, kam vést trubky (1 = +x, 2 = -x, 4 = +y, 8 = -y).
  const taken = new Set<number>();
  for (const [id, x, y, rot] of scene.items) {
    const def = getModule(id);
    if (!def) continue;
    const [w, h] = footprint(def, rot);
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) taken.add((y + dy) * BASE_SIZE + x + dx);
  }
  const at = (x: number, y: number) => x >= 0 && y >= 0 && x < BASE_SIZE && y < BASE_SIZE && taken.has(y * BASE_SIZE + x);

  scene.items.forEach(([id, x, y, rot], index) => {
    const def = getModule(id);
    if (!def) return;
    const [w, h] = footprint(def, rot);
    const mask = id === "corridor" ? (at(x + 1, y) ? 1 : 0) | (at(x - 1, y) ? 2 : 0) | (at(x, y + 1) ? 4 : 0) | (at(x, y - 1) ? 8 : 0) : 15;
    drawModule(ctx, id, x, y, w, h, cell, scene.time, scene.idle.has(index), scene.docked, rot, mask);
    if (scene.selected === index) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      roundRect(ctx, x * cell, y * cell, w * cell, h * cell, cell * 0.18);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  if (scene.ghost) {
    const def = getModule(scene.ghost.id);
    if (def) {
      const [w, h] = footprint(def, scene.ghost.rot);
      ctx.globalAlpha = 0.6;
      const { x: gx, y: gy } = scene.ghost;
      const mask = (at(gx + 1, gy) ? 1 : 0) | (at(gx - 1, gy) ? 2 : 0) | (at(gx, gy + 1) ? 4 : 0) | (at(gx, gy - 1) ? 8 : 0);
      drawModule(ctx, scene.ghost.id, gx, gy, w, h, cell, scene.time, false, 0, scene.ghost.rot, mask);
      ctx.globalAlpha = 1;
      ctx.fillStyle = scene.ghost.valid ? "rgba(80,230,150,0.25)" : "rgba(255,80,100,0.35)";
      ctx.fillRect(scene.ghost.x * cell, scene.ghost.y * cell, w * cell, h * cell);
      ctx.strokeStyle = scene.ghost.valid ? "#2fe08e" : "#ff5d73";
      ctx.lineWidth = 2;
      ctx.strokeRect(scene.ghost.x * cell, scene.ghost.y * cell, w * cell, h * cell);
    }
  } else if (scene.hover) {
    ctx.fillStyle = scene.demolish ? "rgba(255,80,100,0.3)" : "rgba(255,255,255,0.12)";
    ctx.fillRect(scene.hover.x * cell, scene.hover.y * cell, cell, cell);
  }
}

export function cellAt(size: number, px: number, py: number): { x: number; y: number } | null {
  const cell = size / BASE_SIZE;
  const x = Math.floor(px / cell);
  const y = Math.floor(py / cell);
  if (x < 0 || y < 0 || x >= BASE_SIZE || y >= BASE_SIZE) return null;
  return { x, y };
}
