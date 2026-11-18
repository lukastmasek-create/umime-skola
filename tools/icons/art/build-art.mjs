#!/usr/bin/env node
// Vygeneruje SVG ikon z kreslicích modulů tools/icons/art/icons/<název>.mjs do public/ikony/<název>.svg.
// Ikony bez modulu zůstávají tak, jak jsou. Pak spusť tools/icons/build-webp.mjs (npm run icons:build).
// Kresba, která přesahuje bezpečnou plochu (okraje viewBoxu), se v Chromiu změří a zmenší kolem středu spodní hrany,
// aby se obrys, nálepkový okraj ani pohupování neřezaly.
import { readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import { Art, toSvg } from "./kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "..", "..", "public", "ikony");
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const SAFE = { x0: 4, x1: 124, y0: 4, y1: 124 }; // bbox kresby bez obrysu; obrys 1,7 + okraj 3,2 se vejde do -4…132
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
let n = 0, fitted = [];
for (const f of readdirSync(join(HERE, "icons")).filter((f) => f.endsWith(".mjs")).sort()) {
  const name = f.slice(0, -4);
  if (only && !only.includes(name)) continue;
  const art = new Art(name.replace(/[^a-z0-9]/gi, "").slice(0, 6) + "_");
  const opts = (await import(pathToFileURL(join(HERE, "icons", f)).href)).default(art, { name });
  let svg = toSvg(art, opts);
  if (!opts.still) {
    await page.setContent(`<body>${svg}</body>`);
    const b = await page.evaluate(() => { const r = document.querySelector("g[filter]").getBBox(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    const [x0, y0, x1] = [b.x, b.y, b.x + b.w];
    const px = 64, py = 122;
    const s = Math.min(1, (py - SAFE.y0) / (py - y0), (px - SAFE.x0) / (px - x0), (SAFE.x1 - px) / (x1 - px));
    if (s < 0.999) {
      fitted.push(`${name} ×${s.toFixed(2)}`);
      art.parts = [`<g transform="translate(${px} ${py}) scale(${s.toFixed(4)}) translate(${-px} ${-py})">`, ...art.parts, "</g>"];
      svg = toSvg(art, opts);
    }
  }
  writeFileSync(join(OUT, name + ".svg"), svg);
  n++;
}
await browser.close();
console.log(`Nakresleno ${n} ikon` + (fitted.length ? `; zmenšeno do bezpečné plochy: ${fitted.join(", ")}` : ""));
