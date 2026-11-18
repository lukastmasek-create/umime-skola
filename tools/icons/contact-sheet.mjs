#!/usr/bin/env node
// Kontaktní listy ikon z hotových WebP (stejné DOM i CSS jako na webu).
//   --compare=a,b,c --base=<git ref>   před/po v 32, 64 a 256 px (původní SVG z gitu vs. nové WebP)
//   --all                              celá sada na světlém a tmavém pozadí (docs/icons/set-light.png, set-dark.png)
//   --out=<složka>                     výchozí docs/icons
// Spuštění:  node --experimental-strip-types --import ./tests/ts-resolve.mjs tools/icons/contact-sheet.mjs --all
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { iconHtml } from "../../src/lib/icons.ts";
import { ICON_MANIFEST } from "../../src/lib/icon-manifest.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PUBLIC = join(ROOT, "public");
const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const OUT = join(ROOT, arg("out") ?? "docs/icons");
mkdirSync(OUT, { recursive: true });
const MIME = { ".webp": "image/webp", ".svg": "image/svg+xml" };
const globals = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
const css = globals.slice(globals.indexOf("/* icon-layers:start */"), globals.indexOf("/* icon-layers:end */")).replace("@layer components {", "").replace(/}\s*$/, "");

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--force-color-profile=srgb"] });
const page = await (await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })).newPage();
await page.route("http://icons.local/**", (route) => {
  const url = new URL(route.request().url());
  if (url.pathname === "/") return route.fulfill({ contentType: "text/html", body: "<!doctype html><body></body>" });
  const f = join(PUBLIC, decodeURIComponent(url.pathname));
  return existsSync(f) ? route.fulfill({ contentType: MIME[extname(f)] ?? "application/octet-stream", body: readFileSync(f) }) : route.fulfill({ status: 404, body: "" });
});
await page.goto("http://icons.local/");

async function render(html, file, bg, width) {
  await page.setViewportSize({ width, height: 400 });
  await page.evaluate(({ h, bg }) => { document.body.style.cssText = `margin:0;background:${bg};font:11px sans-serif;color:#889`; document.body.innerHTML = h; }, { h: html, bg });
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
  await page.screenshot({ path: join(OUT, file), fullPage: true });
  console.log("→ " + join("docs/icons", file));
}

const compare = arg("compare")?.split(",");
if (compare) {
  const base = arg("base") ?? "HEAD";
  const sizes = [32, 64, 256];
  const row = (label, cells) => `<div style="display:flex;align-items:flex-end;gap:18px;padding:10px 14px;border-bottom:1px solid #8883"><b style="width:150px">${label}</b>${cells}</div>`;
  let html = `<style>${css} .inline-block{display:inline-block}</style>`;
  for (const name of compare) {
    let before = "";
    try { before = execFileSync("git", ["show", `${base}:public/ikony/${name}.svg`], { cwd: ROOT, encoding: "utf8" }); } catch { /* nová ikona */ }
    const svgAt = (s) => before.replace(/ width="\d+" height="\d+"/, ` width="${s}" height="${s}"`).replace(/<style>.*?<\/style>/s, "");
    html += row(`${name} — před`, sizes.map((s) => `<span style="display:inline-block;width:${s}px;height:${s}px">${before ? svgAt(s) : ""}</span>`).join(""));
    html += row(`${name} — po`, sizes.map((s) => iconHtml(name, s)).join(""));
  }
  await render(html, "before-after.png", "#f6f4ee", 760);
}

if (process.argv.includes("--all")) {
  const names = Object.keys(ICON_MANIFEST).sort();
  const grid = (cols) => `<style>${css} .inline-block{display:inline-block} .cell{text-align:center;padding:6px 0 8px;width:104px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}</style><div style="display:grid;grid-template-columns:repeat(${cols},104px);gap:2px;padding:10px">` + names.map((n) => `<div class="cell">${iconHtml(n, 88)}<br>${n}</div>`).join("") + "</div>";
  await render(grid(14), "set-light.png", "#f6f4ee", 14 * 106 + 24);
  await render(grid(14), "set-dark.png", "#16132b", 14 * 106 + 24);
  const mini = (s) => names.map((n) => `<span style="display:inline-block;margin:6px">${iconHtml(n, s)}</span>`).join("");
  await render(`<style>${css} .inline-block{display:inline-block}</style><div style="padding:10px;max-width:1500px">${mini(32)}</div>`, "set-32px.png", "#f6f4ee", 1540);
}
await browser.close();
