#!/usr/bin/env node
// Převod ilustrovaných SVG ikon z public/ikony/*.svg na průhledné WebP (viz docs/ICONS_WEBP.md).
//
// Co skript dělá pro každou ikonu:
//   1. Vykreslí SVG v Chromiu (stejný render jako v prohlížeči: filtry, přechody, text) bez animací.
//   2. Rozdělí ji na vrstvy, aby šla zachovat původní animace bez 25sekundové smyčky animovaného WebP:
//        <název>.webp         tělo ikony (bez stínu pod ní a bez třpytek); pohupování dělá CSS na obalu
//        <název>.tw<N>.webp   každá třpytka zvlášť, oříznutá kolem svého středu (CSS zmenšování + průhlednost)
//      Stín pod ikonou (radiální přechod) se kreslí v CSS, proto není v bitmapě.
//   3. Zapíše src/lib/icon-manifest.ts (geometrie stínu a třpytek v procentech) a docs/ICONS_WEBP_AUDIT.md.
//
// Požadavky: Node 22, `npm ci`, Chromium. Cestu k Chromiu lze zadat v CHROMIUM_PATH, jinak se použije
// ten, který nainstaluje `npx playwright-core install chromium`.
// Text v ikonách (font-family Arial/sans-serif) se vykresluje systémovým fontem: generuj na stroji s Arialem
// (Windows, macOS), shodně s tím, co dosud viděli návštěvníci.
//
// Použití:  node tools/icons/build-webp.mjs [--only=a,b] [--check]
//   --only   jen vybrané ikony (bez přípony)
//   --check  nic nezapisuje, jen ověří, že vrstvy po složení odpovídají celému renderu

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { chromium } from "playwright-core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIR = join(ROOT, "public", "ikony");
const MANIFEST = join(ROOT, "src", "lib", "icon-manifest.ts");
const AUDIT_JSON = join(ROOT, "tools", "icons", "audit.json");

// Rozměr bitmapy v px (celý viewBox). 256 = 2× pro největší běžné zobrazení (~120 px);
// ikony výher v kole (cat-*) se ukazují až na 160 px, proto 320.
const SIZE_DEFAULT = 256;
const SIZE_OVERRIDE = [[/^cat-/, 320]];
// Kódování: ve výchozím stavu bezeztrátově (ploché plochy, tenké obrysy a drobný text zůstanou ostré).
// Je-li velmi kvalitní ztrátové WebP (q95, alfa bez ztráty) aspoň o 20 % menší a odchylka od renderu zanedbatelná,
// vezme se to; jinak zůstane bezeztrátové.
const LOSSLESS = { lossless: true, effort: 6 };
const LOSSY = { quality: 95, alphaQuality: 100, effort: 6, smartSubsample: true };
const LOSSY_MAX_DIFF = 24;   // největší odchylka kanálu (0–255, premultiplikovaně)
const LOSSY_MAX_MEAN = 0.15; // průměrná odchylka přes všechny pixely
const LOSSY_GAIN = 0.8;      // lossy musí mít nejvýš 80 % velikosti lossless

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const checkOnly = args.includes("--check");

const sizeFor = (name) => SIZE_OVERRIDE.find(([re]) => re.test(name))?.[1] ?? SIZE_DEFAULT;
const r3 = (n) => Math.round(n * 1000) / 1000;

// Obsah <style>, který smí být v ikonách. Cokoli jiného znamená, že CSS animace v komponentě neodpovídá.
const STYLE_BOB = ".bob{transform-origin:64px 110px;animation:bob 2.8s ease-in-out infinite}@keyframes bob{0%,100%{transform:translateY(0) rotate(-1.6deg)}50%{transform:translateY(-3.5px) rotate(1.6deg)}}";
const STYLE_TW = ".tw{transform-box:fill-box;transform-origin:center;animation:tw 1.8s ease-in-out infinite}.tw:nth-of-type(2n){animation-delay:.6s}@keyframes tw{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.55);opacity:.55}}";
const STYLE_RM = (tw) => `@media (prefers-reduced-motion:reduce){.bob${tw ? ",.tw" : ""}{animation:none}}`;

function parseStyle(svg) {
  const m = svg.match(/<style>(.*?)<\/style>/s);
  if (!m) return { bob: false, tw: false };
  const css = m[1];
  if (css === STYLE_BOB + STYLE_RM(false)) return { bob: true, tw: false };
  if (css === STYLE_BOB + STYLE_TW + STYLE_RM(true)) return { bob: true, tw: true };
  // Několik nezávislých animací s různými periodami (balicek-*: hop, blink, drop, fl, tw): bitmapou je nelze
  // věrně složit, ikona zůstane jako SVG (výjimka v auditu).
  return { vector: true };
}

function parseSvg(name, svg) {
  const vb = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/).slice(1).map(Number);
  const style = parseStyle(svg);
  if (style.vector) return { vb, style, shadow: null };
  let alpha = 0;
  const sh = svg.match(/<ellipse cx="([\d.]+)" cy="([\d.]+)" rx="([\d.]+)" ry="([\d.]+)" fill="url\(#sh\)"\/>/);
  if (style.bob && !sh) throw new Error(`${name}: chybí stín`);
  if (style.bob) {
    const g = svg.match(/<radialGradient id="sh"><stop offset="0" stop-color="#000" stop-opacity="([\d.]+)"\/><stop offset="1" stop-color="#000" stop-opacity="0"\/><\/radialGradient>/);
    if (!g) throw new Error(`${name}: stín má jiný přechod, než umí komponenta`);
    alpha = +g[1];
    if (!svg.includes('<g class="bob">')) throw new Error(`${name}: chybí skupina .bob`);
  }
  const shadow = sh ? { cx: +sh[1], cy: +sh[2], rx: +sh[3], ry: +sh[4], alpha } : null;
  return { vb, style, shadow };
}

// ---- kód běžící v prohlížeči ----------------------------------------------------------------------------
// Připraví DOM pro jednu variantu a vrátí metadata. Varianty: "full" (celé SVG bez stylů a stínu = klidový stav),
// "body" (bez třpytek, s obrysem), "twhalo" (jen obrys jedné třpytky),
// "twgfx" (jen kresba jedné třpytky bez obrysu).
function prepare({ svg, px, variant, index }) {
  document.body.innerHTML = svg.replace(/ width="\d+" height="\d+"/, ` width="${px}" height="${px}"`);
  const el = document.querySelector("svg");
  el.style.display = "block";
  const tws = [...el.querySelectorAll(".tw")];
  const meta = tws.map((t) => {
    const cs = getComputedStyle(t);
    return { delay: parseFloat(cs.animationDelay) || 0, opacity: parseFloat(cs.opacity) };
  });
  el.querySelectorAll("style").forEach((s) => s.remove());
  const shadow = el.querySelector('ellipse[fill="url(#sh)"]');
  if (shadow) shadow.remove();
  const bob = el.querySelector(".bob");
  if (bob) bob.classList.remove("bob");
  tws.forEach((t) => t.classList.remove("tw"));
  let center = null;
  if (variant === "body") tws.forEach((t) => t.remove());
  if (variant === "twhalo" || variant === "twgfx") {
    const keep = tws[index];
    keep.removeAttribute("opacity");
    const chain = new Set();
    for (let n = keep; n && n !== el; n = n.parentNode) chain.add(n);
    const root = el.querySelector("[filter]") ?? el;
    const strip = (node) => {
      for (const c of [...node.children]) {
        if (c === keep) continue;
        if (chain.has(c)) strip(c);
        else if (c.tagName.toLowerCase() !== "defs") c.remove();
      }
    };
    strip(root);
    if (variant === "twgfx") root.removeAttribute("filter");
    if (variant === "twhalo") el.querySelectorAll("filter feMergeNode[in=SourceGraphic]").forEach((n) => n.remove());
    // Zbytek obsahu nad filtrem (mimo skupinu s filtrem) pryč.
    for (const c of [...el.children]) if (c.tagName.toLowerCase() !== "defs" && !c.contains(keep)) c.remove();
    const r = keep.getBoundingClientRect();
    center = { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }
  return { count: tws.length, meta, center };
}

async function render(page, svg, px, variant, index = 0) {
  const info = await page.evaluate(prepare, { svg, px, variant, index });
  const png = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: px, height: px } });
  return { ...info, png };
}

async function rgba(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

function alphaBBox({ data, w, h }) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 0) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return x1 < 0 ? null : { x0, y0, x1: x1 + 1, y1: y1 + 1 };
}

// Složí vrstvy přes sebe (zdroj-nad) a vrátí RGBA.
async function composite(base, layers, px) {
  return sharp(base).composite(layers.map((l) => ({ input: l.input, left: l.left, top: l.top }))).png().toBuffer();
}

async function diffStats(a, b) {
  const A = await rgba(a), B = await rgba(b);
  let max = 0, sum = 0, n = 0, bad = 0;
  for (let i = 0; i < A.data.length; i += 4) {
    // Rozdíl v premultiplikovaných barvách, aby neviditelné pixely nehrály roli.
    const aa = A.data[i + 3] / 255, ba = B.data[i + 3] / 255;
    let d = Math.abs(A.data[i + 3] - B.data[i + 3]);
    for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(A.data[i + c] * aa - B.data[i + c] * ba));
    max = Math.max(max, d); sum += d; n++; if (d > 48) bad++;
  }
  return { max, mean: sum / n, bad: bad / n };
}

async function encode(png) {
  const lossless = await sharp(png).webp(LOSSLESS).toBuffer();
  const lossy = await sharp(png).webp(LOSSY).toBuffer();
  if (lossy.length <= lossless.length * LOSSY_GAIN) {
    const d = await diffStats(png, await sharp(lossy).png().toBuffer());
    if (d.max <= LOSSY_MAX_DIFF && d.mean <= LOSSY_MAX_MEAN) return { buf: lossy, mode: "lossy" };
  }
  return { buf: lossless, mode: "lossless" };
}

const kb = (n) => Math.round((n / 1024) * 10) / 10;

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--force-color-profile=srgb"] });
  const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  await page.setContent('<!doctype html><html><body style="margin:0;background:transparent"></body></html>');

  const names = readdirSync(DIR).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4)).sort().filter((n) => !only || only.includes(n));
  const manifest = {};
  const audit = [];
  const problems = [];

  for (const name of names) {
    const svg = readFileSync(join(DIR, name + ".svg"), "utf8");
    const { vb, style, shadow } = parseSvg(name, svg);
    const px = sizeFor(name);
    if (style.vector) {
      manifest[name] = { px: 0, v: 1 };
      audit.push({ name, px: 0, svgBytes: Buffer.byteLength(svg), webpBytes: 0, files: 0, mode: "svg", bob: true, sparkles: 0, diffMax: 0, diffMean: 0, exception: "víc nezávislých animací (hop, blink, drop, fl, tw) s různou periodou" });
      console.log(`${name.padEnd(18)} ponecháno jako SVG (složená animace)`);
      continue;
    }
    const full = await render(page, svg, px, "full");
    let bodyPng = full.png;
    const layers = [];
    if (style.tw && full.count > 0) {
      bodyPng = (await render(page, svg, px, "body")).png;
      for (let i = 0; i < full.count; i++) {
        const t = await render(page, svg, px, "twhalo", i);
        const g = await render(page, svg, px, "twgfx", i);
        // Obrys třpytky patří pod tělo ikony (v původním SVG je společný pro celou skupinu a leží pod vším):
        // tam, kde už tělo (včetně svého obrysu) kryje, se z obrysu třpytky odečte. Kresba třpytky je nad tělem.
        const halo = await rgba(t.png), plain = await rgba(bodyPng);
        for (let k = 0; k < halo.data.length; k += 4) halo.data[k + 3] = Math.round(halo.data[k + 3] * (1 - plain.data[k + 3] / 255));
        const haloPng = await sharp(halo.data, { raw: { width: px, height: px, channels: 4 } }).png().toBuffer();
        t.png = await sharp(haloPng).composite([{ input: g.png }]).png().toBuffer();
        const raw = await rgba(t.png);
        const bb = alphaBBox(raw);
        if (!bb) throw new Error(`${name}: třpytka ${i} je prázdná`);
        const cx = Math.round(t.center.x), cy = Math.round(t.center.y);
        let half = Math.max(cx - bb.x0, bb.x1 - cx, cy - bb.y0, bb.y1 - cy) + 1;
        half = Math.min(half, cx, cy, px - cx, px - cy);
        const left = cx - half, top = cy - half, side = half * 2;
        const crop = await sharp(t.png).extract({ left, top, width: side, height: side }).png().toBuffer();
        layers.push({ crop, left, top, side, delay: full.meta[i].delay, opacity: full.meta[i].opacity });
      }
    }

    // Kontrola ořezu: u okraje bitmapy nesmí být nic viditelného (obrys nebo nálepkový okraj by byl useknutý).
    {
      const raw = await rgba(full.png);
      let edge = 0;
      for (let k = 0; k < px; k++) for (const [x, y] of [[k, 0], [k, px - 1], [0, k], [px - 1, k]]) if (raw.data[(y * px + x) * 4 + 3] > 24) edge++;
      if (edge > 0) problems.push(`${name}: kresba zasahuje k okraji (${edge} px), je useknutá`);
    }
    // Kontrola: tělo + třpytky v klidovém stavu musí dát celý render (až na přeložení obrysů přes tělo).
    const rest = layers.length ? await composite(bodyPng, layers.map((l) => ({ input: l.crop, left: l.left, top: l.top })), px) : bodyPng;
    const diff = await diffStats(full.png, rest);
    // Poznámka: celé SVG má třpytky s opacity .95; vrstvy jsou bez ní (opacity řídí CSS), proto rozdíl <~13/255.
    // Povolena je jen hrstka krajních pixelů (obrys třpytky na styku s obrysem těla): < 0,2 % plochy.
    if (diff.bad > 0.002) problems.push(`${name}: složené vrstvy se liší od celého renderu (${(diff.bad * 100).toFixed(2)} % pixelů, max ${diff.max.toFixed(0)}, průměr ${diff.mean.toFixed(3)})`);

    const entry = { px };
    if (style.bob) {
      const [vx, vy, vw, vh] = vb;
      entry.b = 1;
      entry.s = [r3(((shadow.cx - shadow.rx - vx) / vw) * 100), r3(((shadow.cy - shadow.ry - vy) / vh) * 100), r3(((shadow.rx * 2) / vw) * 100), r3(((shadow.ry * 2) / vh) * 100), shadow.alpha];
    }
    if (layers.length) entry.t = layers.map((l) => [r3((l.left / px) * 100), r3((l.top / px) * 100), r3((l.side / px) * 100), r3(l.delay), r3(l.opacity)]);
    manifest[name] = entry;

    const sizes = [];
    const modes = [];
    if (!checkOnly) {
      const body = await encode(bodyPng);
      writeFileSync(join(DIR, name + ".webp"), body.buf);
      sizes.push(body.buf.length); modes.push(body.mode);
      for (const f of readdirSync(DIR)) if (f.startsWith(name + ".tw") && f.endsWith(".webp")) rmSync(join(DIR, f));
      for (let i = 0; i < layers.length; i++) {
        const sp = await encode(layers[i].crop);
        writeFileSync(join(DIR, `${name}.tw${i + 1}.webp`), sp.buf);
        sizes.push(sp.buf.length); modes.push(sp.mode);
      }
    }
    audit.push({
      name, px, svgBytes: Buffer.byteLength(svg), webpBytes: sizes.reduce((a, b) => a + b, 0), files: sizes.length,
      mode: modes.join("/"), bob: !!style.bob, sparkles: layers.length, diffMax: +diff.max.toFixed(1), diffMean: +diff.mean.toFixed(4), diffBadPct: +(diff.bad * 100).toFixed(3),
    });
    process.stdout.write(`${name.padEnd(18)} ${px}px  ${kb(sizes.reduce((a, b) => a + b, 0))} kB (${sizes.length} soub.)  diff max ${diff.max.toFixed(0)}, ${(diff.bad * 100).toFixed(3)} % pixelů >48\n`);
  }

  await browser.close();
  if (problems.length) { console.error("\nPROBLÉMY:\n" + problems.join("\n")); process.exitCode = 1; }
  if (checkOnly) return;
  // S --only se výsledek slije s dosavadním manifestem a auditem.
  let merged = manifest, mergedAudit = audit;
  if (only) {
    const oldM = existsSync(MANIFEST) ? Object.fromEntries([...readFileSync(MANIFEST, "utf8").matchAll(/^  "([^"]+)": (\{.*\}),$/gm)].map((m) => [m[1], JSON.parse(m[2])])) : {};
    merged = { ...oldM, ...manifest };
    const oldA = existsSync(AUDIT_JSON) ? JSON.parse(readFileSync(AUDIT_JSON, "utf8")) : [];
    mergedAudit = [...oldA.filter((a) => !only.includes(a.name)), ...audit].sort((a, b) => a.name.localeCompare(b.name));
  }

  const body = Object.entries(merged).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n");
  writeFileSync(MANIFEST, `// GENEROVÁNO skriptem tools/icons/build-webp.mjs, neupravuj ručně.
// px = rozměr bitmapy; v = ponecháno jako SVG; b = ikona se pohupuje; s = stín [left, top, width, height v % viewBoxu, průhlednost středu];
// t = třpytky [left, top, strana, zpoždění v s, průhlednost v klidu], vše v % bitmapy.
export type IconEntry = { px: number; v?: 1; b?: 1; s?: [number, number, number, number, number]; t?: [number, number, number, number, number][] };
export const ICON_MANIFEST: Record<string, IconEntry> = {
${body}
};
`);
  writeFileSync(AUDIT_JSON, JSON.stringify(mergedAudit, null, 1) + "\n");
  console.log(`\nHotovo: ${mergedAudit.length} ikon, manifest ${MANIFEST.replace(ROOT + "/", "")}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
