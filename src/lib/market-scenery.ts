// Moře a nebe kreslené do canvasu (uživatelský obchod i filmové přechody).

export const wave = (x: number, y: number, a: number, t: number, f: number) => y + Math.sin(x * f + t) * a + Math.sin(x * f * 2.3 - t * 1.3) * a * 0.4;

export function drawSea(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, night: boolean) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.34);
  sky.addColorStop(0, night ? "#0b1230" : "#6ec6ff");
  sky.addColorStop(1, night ? "#2a3a7a" : "#d8f1ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const horizon = h * 0.3;
  const sea = ctx.createLinearGradient(0, horizon, 0, h);
  sea.addColorStop(0, night ? "#1d4f8c" : "#3fb8e8");
  sea.addColorStop(0.5, night ? "#12346a" : "#1f86cf");
  sea.addColorStop(1, night ? "#0a1f45" : "#14529c");
  ctx.fillStyle = sea;
  ctx.fillRect(0, horizon, w, h - horizon);
  if (night) {
    for (let i = 0; i < 70; i++) {
      const sx = ((Math.sin(i * 91.7) + 1) / 2) * w;
      const sy = ((Math.sin(i * 47.3 + 2) + 1) / 2) * horizon * 0.95;
      ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i))})`;
      ctx.fillRect(sx, sy, 1.6, 1.6);
    }
  }
  ctx.fillStyle = night ? "rgba(235,240,255,0.95)" : "rgba(255,244,190,0.95)";
  ctx.beginPath();
  ctx.arc(w * 0.86, h * 0.1, h * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = night ? "rgba(180,200,255,0.2)" : "rgba(255,244,190,0.25)";
  ctx.beginPath();
  ctx.arc(w * 0.86, h * 0.1, h * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = night ? "rgba(120,140,200,0.55)" : "rgba(255,255,255,0.92)";
  for (let ci = 0; ci < 4; ci++) {
    const x = ((([0.12, 0.38, 0.7, 0.9][ci] + t * (0.004 + ci * 0.0015)) % 1.2) - 0.1) * w;
    const y = (0.05 + (ci % 2) * 0.07) * h;
    const r = h * 0.03 * (0.7 + (ci % 3) * 0.25);
    for (const [dx, dy, k] of [[0, 0, 1], [1.1, 0.2, 0.8], [-1.1, 0.25, 0.75], [0.4, -0.5, 0.8], [-0.5, -0.3, 0.7]] as const) {
      ctx.beginPath();
      ctx.arc(x + dx * r, y + dy * r, r * k, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (let i = 0; i < 11; i++) {
    const y0 = horizon + ((i + 1) / 12) * (h - horizon);
    ctx.strokeStyle = `rgba(255,255,255,${0.1 + i * 0.012})`;
    ctx.lineWidth = 1 + i * 0.15;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 12) {
      const yy = wave(x, y0, 1.2 + i * 0.5, t * (0.8 + i * 0.05) + i, 0.012 - i * 0.0004);
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  for (let i = 0; i < 26; i++) {
    const sx = w * (0.86 + Math.sin(i * 12.9) * 0.07);
    const sy = horizon + (i / 26) * h * 0.2;
    const on = (Math.sin(t * 2 + i * 1.7) + 1) / 2;
    ctx.fillStyle = `rgba(255,255,230,${0.2 + on * 0.5})`;
    ctx.fillRect(sx - 6 - on * 6, sy, 12 + on * 12, 1.6);
  }
  if (!night) {
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const x = (((0.2 + i * 0.3 + t * (0.018 + i * 0.006)) % 1.1) - 0.05) * w;
      const y = (0.14 + i * 0.05) * h + Math.sin(t * 0.7 + i * 2) * h * 0.012;
      const flap = Math.sin(t * 6 + i * 2) * 6;
      ctx.beginPath();
      ctx.moveTo(x - 12, y + flap * 0.6);
      ctx.quadraticCurveTo(x - 5, y - 6 - flap, x, y);
      ctx.quadraticCurveTo(x + 5, y - 6 - flap, x + 12, y + flap * 0.6);
      ctx.stroke();
    }
  }
}

// ---------------------------------------------------------------------------------------------- společné
const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

function glowAt(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// Zářící lampy na přední vrstvě (sčítací míchání).
export function drawLampGlows(fctx: CanvasRenderingContext2D, w: number, h: number, t: number, lamps: number[][], rgb: string, strength: number) {
  fctx.globalCompositeOperation = "lighter";
  for (const [lx, ly] of lamps) {
    const flick = 0.85 + 0.15 * Math.sin(t * 7 + lx * 40);
    glowAt(fctx, lx * w, ly * h, w * 0.05, rgb, strength * flick);
  }
  fctx.globalCompositeOperation = "source-over";
}

function cloudPuff(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) {
  ctx.fillStyle = fill;
  for (const [dx, dy, k] of [[0, 0, 1], [1.1, 0.2, 0.8], [-1.1, 0.25, 0.75], [0.4, -0.5, 0.8], [-0.5, -0.3, 0.7]] as const) {
    ctx.beginPath();
    ctx.arc(x + dx * r, y + dy * r, r * k, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------------------------- pohádkový les
export function drawForest(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, night: boolean) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, night ? "#0c1c2a" : "#bfe8a8");
  bg.addColorStop(0.5, night ? "#12382f" : "#5fb870");
  bg.addColorStop(1, night ? "#08201a" : "#236a46");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  // vzdálené kmeny ve třech vrstvách, pomalu se vlní mlha mezi nimi
  for (let layer = 0; layer < 3; layer++) {
    const dark = night ? [0.5, 0.35, 0.22][layer] : [0.78, 0.58, 0.38][layer];
    ctx.fillStyle = night ? `rgba(${12 + layer * 6},${40 + layer * 14},${36 + layer * 8},${dark + 0.3})` : `rgba(${40 + layer * 16},${110 + layer * 18},${70 + layer * 8},${dark})`;
    for (let i = 0; i < 9; i++) {
      const x = ((i + 0.3 * layer + rnd(i * 7 + layer) * 0.6) / 9) * w;
      const tw = (14 + layer * 10 + rnd(i + layer * 20) * 16) * (w / 1100);
      const sway = Math.sin(t * 0.3 + i + layer) * 2;
      ctx.beginPath();
      ctx.moveTo(x - tw, h * 0.62);
      ctx.lineTo(x - tw * 0.7 + sway, 0);
      ctx.lineTo(x + tw * 0.7 + sway, 0);
      ctx.lineTo(x + tw, h * 0.62);
      ctx.closePath();
      ctx.fill();
    }
    // koruny stromů nahoře
    ctx.fillStyle = night ? `rgba(10,${44 + layer * 10},34,0.9)` : `rgba(${50 + layer * 14},${150 + layer * 14},${74 + layer * 6},0.92)`;
    for (let i = 0; i < 12; i++) {
      const x = ((i + 0.2 * layer) / 12) * w + Math.sin(t * 0.25 + i * 2 + layer) * 6;
      ctx.beginPath();
      ctx.ellipse(x, h * (0.02 + layer * 0.03), (70 + layer * 22) * (w / 1100), (50 + layer * 12) * (w / 1100), 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // sluneční paprsky (ve dne) nebo měsíční svit (v noci)
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 5; i++) {
    const x = w * (0.12 + i * 0.2) + Math.sin(t * 0.2 + i) * 20;
    const a = (night ? 0.07 : 0.13) * (0.7 + 0.3 * Math.sin(t * 0.6 + i * 1.7));
    const g = ctx.createLinearGradient(x, 0, x + w * 0.12, h * 0.8);
    g.addColorStop(0, `rgba(${night ? "150,190,255" : "255,244,190"},${a})`);
    g.addColorStop(1, "rgba(255,244,190,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.025, 0);
    ctx.lineTo(x + w * 0.025, 0);
    ctx.lineTo(x + w * 0.2, h * 0.8);
    ctx.lineTo(x + w * 0.06, h * 0.8);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
  // mlha
  for (let i = 0; i < 3; i++) {
    const y = h * (0.42 + i * 0.1);
    const x = ((t * (0.01 + i * 0.006) + i * 0.4) % 1.4) * w - w * 0.2;
    const g = ctx.createRadialGradient(x, y, 0, x, y, w * 0.35);
    g.addColorStop(0, night ? "rgba(120,180,200,0.16)" : "rgba(255,255,255,0.22)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - w * 0.35, y - h * 0.15, w * 0.7, h * 0.3);
  }
  // padající listy
  for (let i = 0; i < 12; i++) {
    const u = (t * (0.03 + rnd(i) * 0.03) + rnd(i + 40)) % 1;
    const x = (rnd(i + 80) + Math.sin(t * 0.8 + i) * 0.03) * w;
    const y = u * h * 0.9;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 1.2 + i);
    ctx.fillStyle = night ? "rgba(120,200,120,0.5)" : ["#e8a23c", "#7ec850", "#d6603a"][i % 3];
    ctx.beginPath();
    ctx.ellipse(0, 0, 5 * (w / 1100), 2.5 * (w / 1100), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function drawForestFront(fctx: CanvasRenderingContext2D, w: number, h: number, t: number, night: boolean, lamps: number[][]) {
  drawLampGlows(fctx, w, h, t, lamps, "255,214,120", night ? 0.7 : 0.18);
  // světlušky: ve dne jen občas, v noci hejno
  fctx.globalCompositeOperation = "lighter";
  const n = night ? 46 : 8;
  for (let i = 0; i < n; i++) {
    const x = (rnd(i + 3) + Math.sin(t * (0.2 + rnd(i) * 0.3) + i * 3) * 0.05) * w;
    const y = (0.15 + rnd(i + 9) * 0.7 + Math.cos(t * (0.25 + rnd(i + 5) * 0.2) + i) * 0.04) * h;
    const a = 0.25 + 0.75 * Math.max(0, Math.sin(t * (1.2 + rnd(i + 2)) + i * 2));
    glowAt(fctx, x, y, w * 0.012, "200,255,120", a * (night ? 0.9 : 0.5));
  }
  fctx.globalCompositeOperation = "source-over";
}

// ---------------------------------------------------------------------------------------------- hrad a tržiště
export function drawCastle(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, night: boolean) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  sky.addColorStop(0, night ? "#0a1030" : "#5eb4ff");
  sky.addColorStop(1, night ? "#3a3a7a" : "#fff0cf");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  if (night) {
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * Math.abs(Math.sin(t * 1.2 + i))})`;
      ctx.fillRect(rnd(i + 2) * w, rnd(i + 33) * h * 0.4, 1.6, 1.6);
    }
  }
  ctx.fillStyle = night ? "rgba(235,240,255,0.95)" : "rgba(255,244,190,0.95)";
  ctx.beginPath();
  ctx.arc(w * 0.16, h * 0.14, h * 0.05, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    const x = (((0.1 + i * 0.22 + t * (0.004 + i * 0.0012)) % 1.2) - 0.1) * w;
    cloudPuff(ctx, x, h * (0.08 + (i % 3) * 0.07), h * 0.035, night ? "rgba(120,140,200,0.55)" : "rgba(255,255,255,0.93)");
  }
  // kopce, lesy a hrad v dálce
  const hills = [
    [0.52, night ? "#1d3a52" : "#6cc08a", 0.8],
    [0.62, night ? "#16304a" : "#4aa86a", 1.3],
  ] as const;
  for (const [yy, col, f] of hills) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) ctx.lineTo(x, h * yy - Math.sin(x * 0.004 * f + f) * h * 0.05 - Math.sin(x * 0.011 * f) * h * 0.015);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }
  // siluet hradu na kopci vpravo
  const cx = w * 0.84;
  const base = h * 0.5;
  ctx.fillStyle = night ? "#2a3652" : "#9a92a8";
  ctx.fillRect(cx - w * 0.07, base - h * 0.1, w * 0.14, h * 0.1);
  for (const dx of [-0.07, 0.0, 0.07]) {
    ctx.fillRect(cx + w * dx - w * 0.012, base - h * 0.2, w * 0.024, h * 0.2);
    ctx.fillStyle = night ? "#6a2a3a" : "#c0392b";
    ctx.beginPath();
    ctx.moveTo(cx + w * dx - w * 0.018, base - h * 0.2);
    ctx.lineTo(cx + w * dx, base - h * 0.27);
    ctx.lineTo(cx + w * dx + w * 0.018, base - h * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = night ? "#2a3652" : "#9a92a8";
  }
  // praporky vlají
  for (const dx of [-0.07, 0.0, 0.07]) {
    ctx.strokeStyle = "#5a3c24";
    ctx.beginPath();
    ctx.moveTo(cx + w * dx, base - h * 0.27);
    ctx.lineTo(cx + w * dx, base - h * 0.32);
    ctx.stroke();
    ctx.fillStyle = "#d6362b";
    ctx.beginPath();
    ctx.moveTo(cx + w * dx, base - h * 0.32);
    ctx.quadraticCurveTo(cx + w * dx + 8 + Math.sin(t * 4 + dx * 40) * 3, base - h * 0.315, cx + w * dx + 14, base - h * 0.305 + Math.sin(t * 5) * 1.5);
    ctx.lineTo(cx + w * dx, base - h * 0.295);
    ctx.fill();
  }
  // ptáci a občas drak
  ctx.strokeStyle = night ? "rgba(255,255,255,0.4)" : "rgba(40,40,60,0.7)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    const x = (((0.1 + i * 0.25 + t * (0.014 + i * 0.004)) % 1.1) - 0.05) * w;
    const y = (0.2 + i * 0.04) * h + Math.sin(t * 0.7 + i) * h * 0.012;
    const flap = Math.sin(t * 6 + i) * 5;
    ctx.beginPath();
    ctx.moveTo(x - 10, y + flap * 0.6);
    ctx.quadraticCurveTo(x - 4, y - 5 - flap, x, y);
    ctx.quadraticCurveTo(x + 4, y - 5 - flap, x + 10, y + flap * 0.6);
    ctx.stroke();
  }
  const dp = (t % 48) / 14;
  if (dp < 1) {
    const dx = lerpN(w * 1.1, -w * 0.15, dp);
    const dy = h * 0.18 + Math.sin(dp * 9) * h * 0.02;
    ctx.fillStyle = night ? "#2a1a3a" : "#5a2a6a";
    ctx.beginPath();
    ctx.ellipse(dx, dy, 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(dx - 4, dy);
    ctx.lineTo(dx + 18, dy - 22 - Math.sin(t * 8) * 10);
    ctx.lineTo(dx + 26, dy - 3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(dx - 8, dy - 2);
    ctx.lineTo(dx - 30, dy - 22 + Math.sin(t * 8) * 10);
    ctx.lineTo(dx - 20, dy);
    ctx.fill();
  }
  // dlážděné nádvoří až do spodního okraje (pod vrstvou Blenderu)
  const fy = h * 0.78;
  const floor = ctx.createLinearGradient(0, fy, 0, h);
  floor.addColorStop(0, night ? "#3a3640" : "#b4a891");
  floor.addColorStop(1, night ? "#25222c" : "#7d7260");
  ctx.fillStyle = floor;
  ctx.fillRect(0, fy, w, h - fy);
  ctx.strokeStyle = night ? "rgba(10,8,16,0.35)" : "rgba(60,50,38,0.28)";
  ctx.lineWidth = 1.5;
  for (let r = 0; r < 6; r++) {
    const y = fy + (h - fy) * (r / 6) ** 0.9;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    for (let x = (r % 2) * 40; x < w; x += 80 + r * 12) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, fy + (h - fy) * ((r + 1) / 6) ** 0.9);
      ctx.stroke();
    }
  }
}

const lerpN = (a: number, b: number, k: number) => a + (b - a) * k;

export function drawCastleFront(fctx: CanvasRenderingContext2D, w: number, h: number, t: number, night: boolean, lamps: number[][]) {
  drawLampGlows(fctx, w, h, t, lamps, "255,170,70", night ? 0.8 : 0.25);
}

// ---------------------------------------------------------------------------------------------- podmořské město
export function drawDeep(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#5fd0ee");
  bg.addColorStop(0.4, "#1f8ccc");
  bg.addColorStop(1, "#0a2c6a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  // světelné paprsky shora
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 7; i++) {
    const x = w * (0.05 + i * 0.15) + Math.sin(t * 0.25 + i * 2) * w * 0.03;
    const a = 0.1 * (0.6 + 0.4 * Math.sin(t * 0.5 + i));
    const g = ctx.createLinearGradient(x, 0, x + w * 0.1, h * 0.8);
    g.addColorStop(0, `rgba(210,250,255,${a})`);
    g.addColorStop(1, "rgba(210,250,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.02, 0);
    ctx.lineTo(x + w * 0.03, 0);
    ctx.lineTo(x + w * 0.15, h * 0.8);
    ctx.lineTo(x + w * 0.02, h * 0.8);
    ctx.closePath();
    ctx.fill();
  }
  // kaustiky na hladině
  ctx.strokeStyle = "rgba(220,255,255,0.18)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 14) {
      const y = h * (0.015 + i * 0.012) + Math.sin(x * 0.02 + t * (0.8 + i * 0.1) + i) * 3 + Math.sin(x * 0.05 - t * 1.4) * 1.5;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
  // vzdálená města: siluety kopulí
  ctx.fillStyle = "rgba(20,90,150,0.45)";
  for (let i = 0; i < 8; i++) {
    const x = ((i + 0.4) / 8) * w;
    ctx.beginPath();
    ctx.ellipse(x, h * 0.6, (36 + rnd(i) * 40) * (w / 1100), (50 + rnd(i + 5) * 60) * (w / 1100), 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 3, h * 0.45 - rnd(i + 8) * 60, 6, 80);
  }
  // hejna ryb
  for (let s = 0; s < 3; s++) {
    const dir = s % 2 ? -1 : 1;
    const base = (t * (0.025 + s * 0.01) * dir + s * 0.37 + 10) % 1.3;
    const bx = (dir > 0 ? base : 1.3 - base) * w - w * 0.15;
    const by = h * (0.18 + s * 0.12) + Math.sin(t * 0.5 + s) * 12;
    ctx.fillStyle = ["#ffb347", "#ff7aa8", "#9ad8ff"][s];
    for (let i = 0; i < 9; i++) {
      const fx = bx - dir * (i % 3) * 22 * (w / 1100) + Math.sin(t * 2 + i) * 4;
      const fy = by + Math.floor(i / 3) * 14 * (w / 1100) + Math.cos(t * 1.7 + i * 2) * 4;
      ctx.beginPath();
      ctx.ellipse(fx, fy, 8 * (w / 1100), 3.5 * (w / 1100), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(fx - dir * 7 * (w / 1100), fy);
      ctx.lineTo(fx - dir * 13 * (w / 1100), fy - 4);
      ctx.lineTo(fx - dir * 13 * (w / 1100), fy + 4);
      ctx.fill();
    }
  }
  // velká medúza pomalu vznáší
  const mx = ((t * 0.01 + 0.3) % 1.2) * w - w * 0.1;
  const my = h * 0.3 + Math.sin(t * 0.6) * 18;
  glowAt(ctx, mx, my, w * 0.06, "255,170,230", 0.4);
  ctx.fillStyle = "rgba(255,190,240,0.55)";
  ctx.beginPath();
  ctx.ellipse(mx, my, 26 * (w / 1100), (18 + Math.sin(t * 2) * 3) * (w / 1100), 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,190,240,0.5)";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(mx + (i - 2) * 9 * (w / 1100), my);
    ctx.quadraticCurveTo(mx + (i - 2) * 9 * (w / 1100) + Math.sin(t * 2 + i) * 6, my + 20, mx + (i - 2) * 11 * (w / 1100), my + 38 * (w / 1100));
    ctx.stroke();
  }
}

export function drawDeepFront(fctx: CanvasRenderingContext2D, w: number, h: number, t: number, lamps: number[][]) {
  drawLampGlows(fctx, w, h, t, lamps, "180,255,240", 0.5);
  // stoupající bubliny přes celou scénu
  fctx.strokeStyle = "rgba(235,255,255,0.7)";
  fctx.lineWidth = 1.4;
  for (let i = 0; i < 26; i++) {
    const sp = 0.05 + rnd(i) * 0.07;
    const y = h * (1.05 - ((t * sp + rnd(i + 50)) % 1.15));
    const x = (rnd(i + 20) + Math.sin(t * 0.8 + i) * 0.01) * w;
    const r = (2 + rnd(i + 70) * 5) * (w / 1100);
    fctx.beginPath();
    fctx.arc(x, y, r, 0, Math.PI * 2);
    fctx.stroke();
    fctx.fillStyle = "rgba(255,255,255,0.5)";
    fctx.fillRect(x - r * 0.4, y - r * 0.5, r * 0.4, r * 0.3);
  }
}
