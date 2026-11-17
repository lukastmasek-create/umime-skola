// Vector icons as SVG path data (24x24 viewBox), drawn through Path2D → crisp at any zoom.
export const ICON = {
  home: {d: 'M12 2.8 2.8 10.2V21.2h6.6v-6.4h5.2v6.4h6.6V10.2z', fill: true},
  homeO: {d: 'M12 3.6 4.4 9.7V19.6h4.1v-6.4h7v6.4h4.1V9.7z', fill: false},
  search: {d: 'M10.6 3.2a7.4 7.4 0 1 0 4.5 13.3l5 5 1.6-1.6-5-5A7.4 7.4 0 0 0 10.6 3.2zm0 2.2a5.2 5.2 0 1 1 0 10.4 5.2 5.2 0 0 1 0-10.4z', fill: true},
  library: {d: 'M3.5 3h2.3v18H3.5zM8.4 3h2.3v18H8.4zM13.6 4.1l2.2-.6 4.6 17-2.2.6z', fill: true},
  plus: {d: 'M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z', fill: true},
  heart: {d: 'M12 20.7C5.2 15.4 3 12 3 8.6 3 5.9 5 4 7.5 4c1.8 0 3.3.9 4.5 2.6C13.2 4.9 14.7 4 16.5 4 19 4 21 5.9 21 8.6c0 3.4-2.2 6.8-9 12.1z', fill: true},
  play: {d: 'M7.4 3.9v16.2a1 1 0 0 0 1.5.9l13.2-8.1a1 1 0 0 0 0-1.7L8.9 3a1 1 0 0 0-1.5.9z', fill: true},
  pause: {d: 'M6.2 3.5h3.6a.7.7 0 0 1 .7.7v15.6a.7.7 0 0 1-.7.7H6.2a.7.7 0 0 1-.7-.7V4.2a.7.7 0 0 1 .7-.7zM14.2 3.5h3.6a.7.7 0 0 1 .7.7v15.6a.7.7 0 0 1-.7.7h-3.6a.7.7 0 0 1-.7-.7V4.2a.7.7 0 0 1 .7-.7z', fill: true},
  prev: {d: 'M5.2 4h2.2v16H5.2zM20 4.6v14.8a.6.6 0 0 1-.95.5L9 12.5a.6.6 0 0 1 0-1L19.05 4.1a.6.6 0 0 1 .95.5z', fill: true},
  next: {d: 'M16.6 4h2.2v16h-2.2zM4 4.6v14.8a.6.6 0 0 0 .95.5L15 12.5a.6.6 0 0 0 0-1L4.95 4.1A.6.6 0 0 0 4 4.6z', fill: true},
  shuffle: {d: 'M3 6.5h3.4c1.9 0 3.1.9 4.1 2.6l2.6 4.6c1 1.7 2.2 2.6 4.1 2.6H21M3 17.5h3.4c1.9 0 3.1-.9 4.1-2.6M13.1 9.1c1-1.7 2.2-2.6 4.1-2.6H21M18.6 3.9 21 6.5l-2.4 2.6M18.6 14.9 21 17.5l-2.4 2.6', fill: false},
  repeat: {d: 'M4 11V9.5A3.5 3.5 0 0 1 7.5 6H20M16.8 2.8 20 6l-3.2 3.2M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H4M7.2 21.2 4 18l3.2-3.2', fill: false},
  volume: {d: 'M2.8 9.4v5.2h3.9l5.3 4.4V5L6.7 9.4zM15.6 8.8a4.6 4.6 0 0 1 0 6.4M18.3 6a8.5 8.5 0 0 1 0 12', fill: false},
  chevDown: {d: 'M5 9l7 7 7-7', fill: false},
  more: {d: 'M5 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM19 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z', fill: true},
  device: {d: 'M5 3h14a1.5 1.5 0 0 1 1.5 1.5v15A1.5 1.5 0 0 1 19 21H5a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 5 3zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 5.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z', fill: false},
  download: {d: 'M12 3.5v11.2M7.2 10.3 12 15.1l4.8-4.8M4.5 19.5h15', fill: false},
  bell: {d: 'M12 3.2c-3.3 0-5.5 2.3-5.5 5.6v3.2L4.6 15.6V17h14.8v-1.4L17.5 12V8.8c0-3.3-2.2-5.6-5.5-5.6zM9.8 19.2a2.3 2.3 0 0 0 4.4 0', fill: false},
};
export type IconName = keyof typeof ICON;
const cache = new Map<string, Path2D>();
export function drawIcon(ctx: CanvasRenderingContext2D, name: IconName, x: number, y: number, size: number, color: string, lw = 1.9) {
  const ic = ICON[name];
  let p = cache.get(name);
  if (!p) { p = new Path2D(ic.d); cache.set(name, p); }
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  if (ic.fill) { ctx.fillStyle = color; ctx.fill(p); }
  else { ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(p); }
  ctx.restore();
}
/** Spotify logomark: green disc + three sound-wave arcs */
export function drawSpotifyMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, disc = '#1DB954', arcs = '#030504') {
  ctx.save();
  ctx.fillStyle = disc;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = arcs; ctx.lineCap = 'round';
  const u = (x: number, y: number) => [cx + (x - 0.5) * 2 * r, cy + (y - 0.5) * 2 * r] as const;
  const arc = (pts: number[], lw: number) => {
    ctx.lineWidth = lw * 2 * r; ctx.beginPath();
    const a = u(pts[0], pts[1]); ctx.moveTo(a[0], a[1]);
    const b = u(pts[2], pts[3]), c = u(pts[4], pts[5]), d = u(pts[6], pts[7]);
    ctx.bezierCurveTo(b[0], b[1], c[0], c[1], d[0], d[1]); ctx.stroke();
  };
  arc([0.215, 0.375, 0.42, 0.30, 0.67, 0.33, 0.80, 0.435], 0.082);
  arc([0.25, 0.53, 0.42, 0.475, 0.62, 0.495, 0.745, 0.585], 0.066);
  arc([0.285, 0.675, 0.42, 0.64, 0.58, 0.655, 0.69, 0.725], 0.052);
  ctx.restore();
}
