// Approximate layout emulator: turns the real widget tree (from ui_preview.mjs) into HTML and screenshots it with Chromium.
// This is NOT the Roblox engine: text metrics and gradients are approximated. It exists so tiers can be compared without Studio.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const shots = JSON.parse(readFileSync(path.join(here, "out", "shots.json"), "utf8"));
const enumLast = (v) => (typeof v === "string" ? v.split(".").pop() : "");
const isUI = (c) => c.c.startsWith("UI");
const udim = (u) => (u ? { s: u.Scale ?? 0, o: u.Offset ?? 0 } : { s: 0, o: 0 });
const u2 = (u) => (u ? { xs: u.XS ?? 0, xo: u.XO ?? 0, ys: u.YS ?? 0, yo: u.YO ?? 0 } : { xs: 0, xo: 0, ys: 0, yo: 0 });
const color = (c, t = 0) => {
  if (!c) return null;
  const a = 1 - (t ?? 0);
  if (c.hex) { const n = parseInt(c.hex, 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
  return `rgba(${Math.round(c.R * 255)},${Math.round(c.G * 255)},${Math.round(c.B * 255)},${a})`;
};

function textLines(text, width, size, wrap) {
  const cw = size * 0.55;
  if (!wrap) return 1;
  let lines = 0;
  for (const para of String(text).split("\n")) {
    let cur = 0, n = 1;
    for (const word of para.split(" ")) {
      const w = word.length * cw;
      if (cur > 0 && cur + cw + w > width) { n++; cur = w; } else cur += (cur ? cw : 0) + w;
    }
    lines += n;
  }
  return Math.max(1, lines);
}

function layout(node, pw, ph) {
  const p = node.p;
  const sz = u2(p.Size);
  let w = sz.xs * pw + sz.xo, h = sz.ys * ph + sz.yo;
  const auto = enumLast(p.AutomaticSize);
  const autoY = auto === "Y" || auto === "XY";
  const pad = node.k.find((c) => c.c === "UIPadding");
  const L = pad ? udim(pad.p.PaddingLeft).o : 0, T = pad ? udim(pad.p.PaddingTop).o : 0;
  const R = pad ? udim(pad.p.PaddingRight).o : 0, B = pad ? udim(pad.p.PaddingBottom).o : 0;
  const list = node.k.find((c) => c.c === "UIListLayout");
  const kids = node.k.filter((c) => !isUI(c)).map((c, i) => ({ c, i })).sort((a, b) => ((a.c.p.LayoutOrder ?? 0) - (b.c.p.LayoutOrder ?? 0)) || a.i - b.i).map((x) => x.c);
  const cw = Math.max(0, w - L - R);
  let ch = Math.max(0, h - T - B);
  if (p.Text !== undefined && autoY && !node.k.length) {
    h = textLines(p.Text, cw, p.TextSize ?? 14, p.TextWrapped !== false) * (p.TextSize ?? 14) * 1.25 + T + B;
  }
  let contentH = 0;
  if (list) {
    const horiz = enumLast(list.p.FillDirection) === "Horizontal";
    const gap = udim(list.p.Padding).o;
    const wraps = !!list.p.Wraps;
    const align = enumLast(list.p.HorizontalAlignment);
    let x = 0, y = 0, lineH = 0;
    const lines = [];
    let cur = [];
    for (const k of kids) {
      layout(k, cw, ch);
      if (k.p.Visible === false) continue;
      if (!horiz) { k.x = L; k.y = T + y; y += k.h + gap; contentH = y - gap; }
      else {
        if (wraps && x > 0 && x + k.w > cw) { lines.push({ items: cur, h: lineH }); cur = []; x = 0; lineH = 0; }
        k.x = L + x; cur.push(k); x += k.w + gap; lineH = Math.max(lineH, k.h);
      }
    }
    if (horiz) {
      lines.push({ items: cur, h: lineH });
      let yy = 0;
      for (const ln of lines) {
        const total = ln.items.reduce((a, k) => a + k.w, 0) + gap * Math.max(0, ln.items.length - 1);
        const off = align === "Right" ? cw - total : align === "Center" ? (cw - total) / 2 : 0;
        for (const k of ln.items) { k.x += off; k.y = T + yy + (ln.h - k.h) / 2 * 0; }
        yy += ln.h + gap;
      }
      contentH = Math.max(0, yy - gap);
    }
  } else {
    for (const k of kids) {
      layout(k, cw, ch);
      const pos = u2(k.p.Position), a = k.p.AnchorPoint || { X: 0, Y: 0 };
      k.x = L + pos.xs * cw + pos.xo - (a.X ?? 0) * k.w;
      k.y = T + pos.ys * ch + pos.yo - (a.Y ?? 0) * k.h;
      contentH = Math.max(contentH, k.y - T + k.h);
    }
  }
  if (autoY && (node.k.length || p.Text === undefined)) h = contentH + T + B;
  node.w = w; node.h = h;
}

const FONT = { Oswald: "Oswald, 'Arial Narrow', 'Liberation Sans Narrow', Impact, sans-serif", RobotoMono: "'Roboto Mono', 'DejaVu Sans Mono', monospace" };
function html(node, isRoot) {
  const p = node.p, cls = node.c;
  if (isUI(node)) return "";
  if (p.Visible === false) return "";
  const corner = node.k.find((c) => c.c === "UICorner");
  const stroke = node.k.find((c) => c.c === "UIStroke");
  const st = [`position:absolute`, `left:${(node.x ?? 0).toFixed(1)}px`, `top:${(node.y ?? 0).toFixed(1)}px`, `width:${node.w.toFixed(1)}px`, `height:${node.h.toFixed(1)}px`, `box-sizing:border-box`];
  const bt = p.BackgroundTransparency ?? 0;
  if (p.BackgroundColor3 && bt < 1) st.push(`background:${color(p.BackgroundColor3, bt)}`);
  if (corner) st.push(`border-radius:${udim(corner.p.CornerRadius).o}px`);
  if (stroke && (stroke.p.Transparency ?? 0) < 1) st.push(`border:${Math.max(1, stroke.p.Thickness ?? 1)}px solid ${color(stroke.p.Color, stroke.p.Transparency ?? 0)}`);
  if (p.Rotation) st.push(`transform:rotate(${p.Rotation}deg)`);
  if (cls === "ScrollingFrame" || cls === "TextButton" || isRoot) st.push("overflow:hidden");
  if (p.ZIndex) st.push(`z-index:${p.ZIndex}`);
  const gradient = node.k.find((c) => c.c === "UIGradient");
  let inner = "";
  if (p.Text !== undefined && p.Text !== "") {
    const size = p.TextSize ?? 14;
    const ax = enumLast(p.TextXAlignment) || (cls === "TextButton" ? "Center" : "Center");
    const ay = enumLast(p.TextYAlignment) || "Center";
    const font = enumLast(p.Font);
    const fam = FONT[font] || "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
    const weight = /Bold|Oswald/.test(font) ? 700 : 500;
    const wrap = p.TextWrapped !== false;
    const text = p.RichText
      ? String(p.Text).replace(/<font color="(#[0-9a-fA-F]{6})">/g, '<span style="color:$1">').replace(/<\/font>/g, "</span>")
      : String(p.Text).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    inner = `<div style="position:absolute;inset:0;display:flex;align-items:${ay === "Top" ? "flex-start" : ay === "Bottom" ? "flex-end" : "center"};justify-content:${ax === "Left" ? "flex-start" : ax === "Right" ? "flex-end" : "center"};text-align:${ax.toLowerCase()};padding:0 ${cls === "TextButton" ? 2 : 0}px;color:${color(p.TextColor3, p.TextTransparency ?? 0) || "#fff"};font:${weight} ${size}px/1.2 ${fam};white-space:${wrap ? "pre-wrap" : "nowrap"};overflow:hidden;${wrap ? "" : "text-overflow:ellipsis;"}">${text}</div>`;
  }
  const kids = node.k.filter((c) => !isUI(c));
  const sorted = kids.map((c, i) => ({ c, i })).sort((a, b) => ((a.c.p.ZIndex ?? 0) - (b.c.p.ZIndex ?? 0)) || a.i - b.i).map((x) => x.c);
  const g = gradient && cls !== "TextButton" ? "" : "";
  return `<div style="${st.join(";")}">${inner}${sorted.map((k) => html(k, false)).join("")}</div>`;
}

const browser = await chromium.launch();
const files = [];
for (const s of shots) {
  const root = s.tree;
  root.p.Size = { XS: 0, XO: s.w, YS: 0, YO: s.h };
  layout(root, s.w, s.h);
  root.x = 0; root.y = 0;
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:#0b0f1c;position:relative;width:${s.w}px;height:${s.h}px;overflow:hidden">${html(root, true)}</body></html>`);
  const file = path.join(here, "out", `${s.name}.png`);
  await page.screenshot({ path: file });
  files.push({ name: s.name, file, w: s.w, h: s.h });
  await page.close();
}
// comparison sheets
const label = { 1: "Telefon", 2: "iPad", 3: "Laptop", 4: "PC" };
async function sheet(name, items, cols, scale) {
  const cell = (it) => `<div style="display:inline-block;margin:6px;vertical-align:top"><div style="font:700 15px sans-serif;color:#eaf0ff;margin:2px 0 4px">${it.title}</div><img src="data:image/png;base64,${readFileSync(it.file).toString('base64')}" style="width:${Math.round(it.w * scale)}px;border:2px solid #33507f"></div>`;
  const width = Math.round(items.reduce((m, it, i) => (i < cols ? m + it.w * scale + 16 : m), 0)) + 12;
  const page = await browser.newPage({ viewport: { width, height: 400 } });
  await page.setContent(`<html><body style="margin:0;background:#070a14;padding:6px;width:${width}px">${items.map(cell).join("")}</body></html>`);
  await page.screenshot({ path: path.join(here, "out", name), fullPage: true });
  await page.close();
}
const by = Object.fromEntries(files.map((f) => [f.name, f]));
await sheet("tiers-wide.png", [1, 2, 3, 4].map((t) => ({ ...by[`wide-home-t${t}`], title: `${t}. ${label[t]} – 1280×720` })), 2, 0.62);
await sheet("tiers-phone.png", [1, 2, 3, 4].map((t) => ({ ...by[`phone-home-t${t}`], title: `${t}. ${label[t]} – 390×780` })), 4, 0.55);
await sheet("tier-workspaces.png", [
  { ...by["wide-compare-t3"], title: "Laptop – srovnání" }, { ...by["wide-history-t4"], title: "PC – historie" },
  { ...by["wide-invest-t3"], title: "Laptop – investice" }, { ...by["wide-device-t2"], title: "iPad – obchod se zařízeními" },
], 2, 0.62);
await sheet("phone-device.png", [{ ...by["phone-device-t1"], title: "Telefon – další zařízení (cena, podmínky, přínosy)" }], 1, 0.9);
await browser.close();
console.log("rendered", files.length, "screens + 4 sheets");
