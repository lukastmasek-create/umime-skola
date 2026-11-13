// Čistý list: více souborů v paměti prohlížeče. Tady je logika jmen souborů a náhledu.
// Náhled skládá propojené soubory do jedné stránky a zprovozní fetch() na soubory z projektu,
// takže JSON z projektu jde načíst přímo ve skriptu.

export const ALLOWED_EXT = ["html", "htm", "css", "js", "mjs", "json", "txt", "md", "svg", "csv"];
export const MAX_FILE_BYTES = 512 * 1024;

export function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

// Vrátí bezpečné jméno souboru, nebo chybovou hlášku.
export function checkName(raw: string, existing: string[]): { name: string } | { error: string } {
  const name = raw.trim().replace(/\s+/g, "-");
  if (!name) return { error: "Zadej jméno souboru." };
  if (name.length > 40) return { error: "Jméno je moc dlouhé (max 40 znaků)." };
  if (!/^[A-Za-z0-9_-][A-Za-z0-9_.-]*$/.test(name) || name.includes("..")) {
    return { error: "Jen písmena, čísla, pomlčka, podtržítko a tečka." };
  }
  if (!ALLOWED_EXT.includes(extOf(name))) return { error: `Přípona musí být jedna z: ${ALLOWED_EXT.join(", ")}.` };
  if (existing.includes(name)) return { error: "Soubor s tímhle jménem už existuje." };
  return { name };
}

// Jméno pro nahrávání: když existuje, přidá číslo (a.css → a-2.css).
export function uniqueName(name: string, existing: string[]) {
  if (!existing.includes(name)) return name;
  const dot = name.lastIndexOf(".");
  const stem = dot === -1 ? name : name.slice(0, dot);
  const ext = dot === -1 ? "" : name.slice(dot);
  let n = 2;
  while (existing.includes(`${stem}-${n}${ext}`)) n++;
  return `${stem}-${n}${ext}`;
}

const normalize = (href: string) => href.split(/[?#]/)[0].replace(/^\.\//, "");

// Sestaví stránku pro náhled: propojené CSS a JS se vloží přímo, fetch() vidí soubory projektu.
export function buildPreview(files: Record<string, string>): string {
  const entry = files["index.html"] !== undefined ? "index.html" : Object.keys(files).find((n) => /\.html?$/i.test(n));
  if (!entry) return "<!DOCTYPE html><p style='font-family:sans-serif'>Nemám HTML soubor. Přidej index.html.</p>";

  let html = files[entry];
  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href || !/rel=["']stylesheet/i.test(tag)) return tag;
    const css = files[normalize(href)];
    return css === undefined ? tag : `<style>${css.replace(/<\/style/gi, "<\\/style")}</style>`;
  });
  html = html.replace(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/gi, (tag, src: string) => {
    const js = files[normalize(src)];
    return js === undefined ? tag : `<script>${js.replace(/<\/script/gi, "<\\/script")}</script>`;
  });

  // Virtuální soubory: fetch("data.json") vrátí obsah souboru z projektu.
  const data = JSON.stringify(files).replace(/</g, "\\u003c");
  const shim =
    "<script>(function(){var F=" +
    data +
    ";var of=window.fetch;window.fetch=function(u,o){var k=String(u).split('?')[0].replace(/^\\.\\//,'');" +
    "if(Object.prototype.hasOwnProperty.call(F,k)){var t=/\\.json$/i.test(k)?'application/json':'text/plain';" +
    "return Promise.resolve(new Response(F[k],{headers:{'Content-Type':t}}));}return of.apply(this,arguments);};})();</script>";
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => m + shim);
  return shim + html;
}
