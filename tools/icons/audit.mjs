#!/usr/bin/env node
// Z tools/icons/audit.json (zapisuje build-webp.mjs) a zdrojového kódu složí docs/ICONS_WEBP_AUDIT.md.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const audit = JSON.parse(readFileSync(join(ROOT, "tools/icons/audit.json"), "utf8"));
const base = process.argv.find((a) => a.startsWith("--base="))?.slice(7) ?? "HEAD";
function walk(d, out = []) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (f !== "node_modules" && f !== "archive") walk(p, out); } else if (/\.(tsx?|css)$/.test(f) && !p.endsWith("icon-manifest.ts") && !p.endsWith("lib/icons.ts")) out.push(p); } return out; }
const files = walk(join(ROOT, "src")).map((f) => [f.replace(ROOT + "/src/", ""), readFileSync(f, "utf8")]);
const uses = (n) => {
  const re = new RegExp(`(^|[^A-Za-z0-9_-])${n.replace(/[-_]/g, "[-_]")}([^A-Za-z0-9_-]|$)`);
  const hit = files.filter(([, s]) => re.test(s)).map(([f]) => f.replace(/^(components|app|lib)\//, "").replace(/\.(tsx?|css)$/, ""));
  return hit.length ? hit.slice(0, 4).join(", ") + (hit.length > 4 ? ` +${hit.length - 4}` : "") : "dynamické (slug/tabulka) nebo nepoužito";
};
const oldSize = (n) => { try { return execFileSync("git", ["cat-file", "-s", `${base}:public/ikony/${n}.svg`], { cwd: ROOT, encoding: "utf8" }).trim() * 1; } catch { return 0; } };
const kb = (n) => (n / 1024).toFixed(1);
let tot = { svg: 0, webp: 0, oldsvg: 0, files: 0 };
const rows = audit.map((a) => {
  const old = oldSize(a.name);
  tot.svg += a.svgBytes; tot.webp += a.webpBytes; tot.oldsvg += old; tot.files += a.files || 1;
  const out = a.mode === "svg" ? "— (ponecháno SVG)" : `${a.name}.webp` + (a.sparkles ? ` + ${a.sparkles}× .tw` : "");
  const motion = a.mode === "svg" ? "SVG animace (hop, blink, drop, fl, tw)" : a.bob ? `CSS pohupování${a.sparkles ? ` + ${a.sparkles}× třpyt` : ""}; stín v CSS; reduced-motion = statické` : "statická";
  return `| ${a.name} | \`public/ikony/${a.name}.svg\` | ${out} | ${a.px || "—"} | ${a.mode === "svg" ? kb(a.svgBytes) + " (SVG)" : kb(a.webpBytes) + " (" + a.mode + ")"} | ${kb(old || a.svgBytes)} | ${motion} | ${uses(a.name)} |`;
});
const md = `# Audit ikon: SVG → WebP

Generováno \`node tools/icons/audit.mjs\` z \`tools/icons/audit.json\`. Postup a příkazy: [ICONS_WEBP.md](ICONS_WEBP.md).

Součet (jen převedené ikony): **${kb(tot.webp)} kB WebP** (${tot.files} souborů) proti **${kb(tot.oldsvg)} kB** původních SVG (nekomprimovaných; na síti SVG gzip/brotli zmenší zhruba na třetinu).

| Ikona | Zdroj | Výstup | px | Velikost kB (kódování) | Původní SVG kB | Pohyb | Použití v src/ |
|---|---|---|---|---|---|---|---|
${rows.join("\n")}
`;
writeFileSync(join(ROOT, "docs/ICONS_WEBP_AUDIT.md"), md);
console.log(`Audit: ${audit.length} ikon → docs/ICONS_WEBP_AUDIT.md`);
