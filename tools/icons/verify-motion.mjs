#!/usr/bin/env node
// Vizuální ověření: původní SVG (s animacemi zastavenými v čase t) proti sestavě z WebP vrstev + CSS z globals.css
// (stejné DOM jako komponenta Icon, vyrobené funkcí iconHtml). Porovnává pixely v několika časech animace.
//
// Spuštění:  node --experimental-strip-types --import ./tests/ts-resolve.mjs tools/icons/verify-motion.mjs [--only=a,b] [--shots=složka]
//   --shots  uloží vedle sebe původní | WebP | rozdíl (PNG) pro každou ikonu a čas
// Chromium: CHROMIUM_PATH nebo `npx playwright-core install chromium`.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { chromium } from "playwright-core";
import { iconHtml } from "../../src/lib/icons.ts";
import { ICON_MANIFEST } from "../../src/lib/icon-manifest.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PUBLIC = join(ROOT, "public");
const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const shots = args.find((a) => a.startsWith("--shots="))?.slice(8);
const TIMES = [0, 0.4, 0.9, 1.4, 1.9, 2.4];
// Ikona se porovnává v rozměru své bitmapy (1 : 1), aby se neměřilo jen převzorkování.
let PX = 256;
const MIME = { ".webp": "image/webp", ".svg": "image/svg+xml", ".html": "text/html" };

const globals = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
const css = globals.slice(globals.indexOf("/* icon-layers:start */"), globals.indexOf("/* icon-layers:end */"))
  .replace("@layer components {", "").replace(/}\s*$/, "");
// Utility třídy, které Icon používá (inline-block, select-none) tu nejsou potřeba.

// Obě strany se lehce rozostří (σ 1,2 px): při pohupování se bitmapa převzorkuje, vektor se vykreslí znovu, takže
// se okraje liší o zlomek pixelu. Posun, špatná fáze animace nebo chybějící vrstva se ale projeví naplno.
async function rgba(buf) {
  const { data, info } = await sharp(buf).blur(1.2).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}
function compare(A, B) {
  let max = 0, sum = 0, bad = 0;
  const out = Buffer.alloc(A.data.length);
  for (let i = 0; i < A.data.length; i += 4) {
    const aa = A.data[i + 3] / 255, ba = B.data[i + 3] / 255;
    let d = Math.abs(A.data[i + 3] - B.data[i + 3]);
    for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(A.data[i + c] * aa - B.data[i + c] * ba));
    max = Math.max(max, d); sum += d; if (d > 48) bad++;
    out[i] = 255; out[i + 1] = 0; out[i + 2] = 0; out[i + 3] = Math.min(255, d * 4);
  }
  const n = A.data.length / 4;
  return { max, mean: sum / n, bad: bad / n, out };
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--force-color-profile=srgb"] });
const ctx = await browser.newContext({ viewport: { width: PX, height: PX }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.route("http://icons.local/**", (route) => {
  const url = new URL(route.request().url());
  if (url.pathname === "/") return route.fulfill({ contentType: "text/html", body: "<!doctype html><body style='margin:0;background:transparent'></body>" });
  const f = join(PUBLIC, decodeURIComponent(url.pathname));
  if (!existsSync(f)) return route.fulfill({ status: 404, body: "" });
  return route.fulfill({ contentType: MIME[extname(f)] ?? "application/octet-stream", body: readFileSync(f) });
});
await page.goto("http://icons.local/");

async function shot(html, t) {
  await page.evaluate((h) => { document.body.innerHTML = h; }, html);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
  await page.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; }), t * 1000);
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: PX, height: PX } });
}

const names = Object.keys(ICON_MANIFEST).filter((n) => !ICON_MANIFEST[n].v && (!only || only.includes(n)));
if (shots) mkdirSync(shots, { recursive: true });
const rows = [];
let failed = 0;
for (const name of names) {
  PX = ICON_MANIFEST[name].px;
  await page.setViewportSize({ width: PX, height: PX });
  const svg = readFileSync(join(PUBLIC, "ikony", name + ".svg"), "utf8").replace(/ width="\d+" height="\d+"/, ` width="${PX}" height="${PX}"`);
  const animated = !!ICON_MANIFEST[name].b;
  const worst = { max: 0, mean: 0, bad: 0 };
  for (const t of animated ? TIMES : [0]) {
    const orig = await shot(`<style>svg{display:block}</style>${svg}`, t);
    const mine = await shot(`<style>${css} .inline-block{display:inline-block}</style>${iconHtml(name, PX)}`, t);
    const c = compare(await rgba(orig), await rgba(mine));
    worst.max = Math.max(worst.max, c.max); worst.mean = Math.max(worst.mean, c.mean); worst.bad = Math.max(worst.bad, c.bad);
    if (shots) {
      const diffPng = await sharp(c.out, { raw: { width: PX, height: PX, channels: 4 } }).png().toBuffer();
      await sharp({ create: { width: PX * 3, height: PX, channels: 4, background: "#8a9" } }).composite([{ input: orig, left: 0, top: 0 }, { input: mine, left: PX, top: 0 }, { input: diffPng, left: PX * 2, top: 0 }]).png().toFile(join(shots, `${name}-t${t}.png`));
    }
  }
  // Prahy: statická ikona = téměř shodná; animovaná = lehce rozostřené snímky se smí lišit o okraje (bitmapa se při
  // pohupování převzorkuje, vektor se vykreslí znovu) a u třpytek o tloušťku obrysu, který se v originále při zmenšení
  // třpytky nezmenšuje. Chybná fáze, posun nebo chybějící vrstva by znamenaly mnohonásobně víc.
  const ok = animated ? worst.bad <= 0.016 && worst.mean <= 4 : worst.bad <= 0.002 && worst.mean <= 1;
  if (!ok) failed++;
  rows.push({ name, animated, mean: +worst.mean.toFixed(3), badPct: +(worst.bad * 100).toFixed(3), max: worst.max | 0, ok });
  console.log(`${ok ? "OK  " : "FAIL"} ${name.padEnd(18)} ${animated ? "animace" : "statická"}  prům ${worst.mean.toFixed(3)}  >48: ${(worst.bad * 100).toFixed(3)} %  max ${worst.max | 0}`);
}
await browser.close();
writeFileSync(join(ROOT, "tools/icons/verify-motion.json"), JSON.stringify(rows, null, 1) + "\n");
console.log(`\n${rows.length - failed}/${rows.length} ikon odpovídá originálu` + (failed ? `, ${failed} se liší` : ""));
if (failed) process.exitCode = 1;
