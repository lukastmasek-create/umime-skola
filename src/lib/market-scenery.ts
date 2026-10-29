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
