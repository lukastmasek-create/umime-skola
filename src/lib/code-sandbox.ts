// Čistý list: soubory projektu v paměti prohlížeče (jméno = cesta, např. "js/app.js").
// Tady je logika cest, kontroly jmen a sestavení náhledu.
// Náhled: propojené CSS a classic skripty se vloží přímo, ES moduly se načtou přes importmap
// a fetch() čte soubory projektu.

export const ALLOWED_EXT = ["html", "htm", "css", "js", "mjs", "json", "txt", "md", "svg", "csv"];
export const MAX_FILE_BYTES = 512 * 1024;
export const ENTRY = "index.html";

export function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

// Složí "a/./b/../c.js" na "a/c.js" a odstraní vedoucí "./".
export function normPath(p: string): string {
  const out: string[] = [];
  for (const seg of p.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return out.join("/");
}

// Cesta odkazu z pohledu souboru: resolvePath("js/app.js", "../css/a.css") = "css/a.css".
export function resolvePath(fromFile: string, ref: string): string {
  const clean = ref.split(/[?#]/)[0];
  if (clean.startsWith("/")) return normPath(clean);
  const dir = fromFile.includes("/") ? fromFile.slice(0, fromFile.lastIndexOf("/")) : "";
  return normPath(dir ? `${dir}/${clean}` : clean);
}

const SEG = /^[A-Za-z0-9_-][A-Za-z0-9_.-]*$/;

// Vrátí bezpečnou cestu, nebo chybovou hlášku. Složky jsou povolené, kontroluje se každý díl.
export function checkName(raw: string, existing: string[]): { name: string } | { error: string } {
  const name = raw.trim().replace(/\s+/g, "-").replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
  if (!name) return { error: "Zadej jméno souboru." };
  if (name.length > 80) return { error: "Cesta je moc dlouhá (max 80 znaků)." };
  const parts = name.split("/");
  if (parts.some((p) => !SEG.test(p) || p.includes(".."))) {
    return { error: "Jen písmena, čísla, pomlčka, podtržítko a tečka (složky oddělené /)." };
  }
  if (!ALLOWED_EXT.includes(extOf(name))) return { error: `Přípona musí být jedna z: ${ALLOWED_EXT.join(", ")}.` };
  if (existing.includes(name)) return { error: "Soubor s tímhle jménem už existuje." };
  return { name };
}

// Když jméno existuje, přidá číslo (a.css → a-2.css).
export function uniqueName(name: string, existing: string[]) {
  if (!existing.includes(name)) return name;
  const dot = name.lastIndexOf(".");
  const stem = dot === -1 ? name : name.slice(0, dot);
  const ext = dot === -1 ? "" : name.slice(dot);
  let n = 2;
  while (existing.includes(`${stem}-${n}${ext}`)) n++;
  return `${stem}-${n}${ext}`;
}

const MODULE_EXT = /\.(m?js)$/i;
const moduleKey = (p: string) => `__f/${p}`;
const dataUrl = (code: string, type: string) => `data:${type};charset=utf-8,${encodeURIComponent(code)}`;

// Importy mezi moduly přepíšeme na klíče v importmap, takže funguje i vnořený import.
function rewriteImports(file: string, code: string) {
  return code.replace(/(\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)(["'])(\.{1,2}\/[^"']+)\2/g, (m, pre, q, spec) => {
    return `${pre}${q}${moduleKey(resolvePath(file, spec))}${q}`;
  });
}

const safeJson = (obj: unknown) => JSON.stringify(obj).replace(/</g, "\\u003c");

export function buildPreview(files: Record<string, string>): string {
  const entry = files[ENTRY] !== undefined ? ENTRY : Object.keys(files).find((n) => /\.html?$/i.test(n));
  if (!entry) return "<!DOCTYPE html><p style='font-family:sans-serif'>Nemám HTML soubor. Přidej index.html.</p>";

  // Importmap: každý modul se zabalí do data: URL a klíč __f/cesta na něj ukazuje.
  const imports: Record<string, string> = {};
  for (const name of Object.keys(files)) {
    if (MODULE_EXT.test(name)) imports[moduleKey(name)] = dataUrl(rewriteImports(name, files[name]), "text/javascript");
  }

  let html = files[entry];
  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href || !/rel=["']stylesheet/i.test(tag)) return tag;
    const css = files[resolvePath(entry, href)];
    return css === undefined ? tag : `<style>${css.replace(/<\/style/gi, "<\\/style")}</style>`;
  });
  html = html.replace(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (tag, a: string, src: string, b: string) => {
    const path = resolvePath(entry, src);
    const js = files[path];
    if (js === undefined) return tag;
    if (/type=["']module["']/i.test(a + b)) return `<script type="module">import "${moduleKey(path)}";</script>`;
    return `<script>${js.replace(/<\/script/gi, "<\\/script")}</script>`;
  });

  // Virtuální soubory: fetch("data.json") vrátí obsah souboru z projektu.
  const shim =
    "<script>(function(){var F=" +
    safeJson(files) +
    ";var of=window.fetch;window.fetch=function(u,o){var k=String(u).split('?')[0].replace(/^\\.\\//,'');" +
    "if(Object.prototype.hasOwnProperty.call(F,k)){var t=/\\.json$/i.test(k)?'application/json':'text/plain';" +
    "return Promise.resolve(new Response(F[k],{headers:{'Content-Type':t}}));}return of.apply(this,arguments);};})();</script>";
  const map = Object.keys(imports).length ? `<script type="importmap">${safeJson({ imports })}</script>` : "";
  const head = shim + map;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => m + head);
  return head + html;
}

// Relativní cesta z pohledu souboru „from“ na cíl „to“ (pro importy a odkazy).
export function relativeFrom(from: string, to: string): string {
  const fromDir = from.includes("/") ? from.split("/").slice(0, -1) : [];
  const toParts = to.split("/");
  let i = 0;
  while (i < fromDir.length && i < toParts.length - 1 && fromDir[i] === toParts[i]) i++;
  const up = fromDir.slice(i).map(() => "..");
  const rest = toParts.slice(i);
  const rel = [...up, ...rest].join("/");
  return rel.startsWith("..") ? rel : `./${rel}`;
}

// Po přejmenování přepíše odkazy a importy, které mířily na starou cestu.
export function renameReferences(files: Record<string, string>, oldPath: string, newPath: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, content] of Object.entries(files)) {
    const ext = extOf(name);
    let next = content;
    if (ext === "js" || ext === "mjs") {
      next = content.replace(/(\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)(["'])(\.{1,2}\/[^"']+)\2/g, (m, pre, q, spec) =>
        resolvePath(name, spec) === oldPath ? `${pre}${q}${relativeFrom(name, newPath)}${q}` : m,
      );
    } else if (ext === "html" || ext === "htm" || ext === "svg") {
      next = content.replace(/\b(href|src)=(["'])([^"']+)\2/gi, (m, attr, q, val) =>
        resolvePath(name, val) === oldPath ? `${attr}=${q}${relativeFrom(name, newPath)}${q}` : m,
      );
    }
    out[name === oldPath ? newPath : name] = next;
  }
  return out;
}
