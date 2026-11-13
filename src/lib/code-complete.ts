// Našeptávání jako ve VS Code: návrhy tagů, atributů, CSS vlastností a JS funkcí.
// Čisté funkce: podle textu a místa kurzoru vrátí návrhy a vloží vybraný.
// Ve vloženém textu značí „|“ místo, kam se má kurzor dát.

import { modeAt } from "@/lib/code-editing";

export type FileKind = "html" | "css" | "js";
export type Item = { label: string; detail: string; insert: string; kind: "tag" | "attr" | "css" | "js" };
export type Completion = { start: number; end: number; items: Item[] };

const VOID = new Set(["meta", "link", "img", "input", "br", "hr"]);

const TAGS = [
  "html", "head", "title", "meta", "link", "body", "h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "span",
  "a", "img", "ul", "ol", "li", "button", "input", "label", "form", "select", "option", "textarea",
  "section", "article", "header", "footer", "nav", "main", "table", "tr", "td", "th", "strong", "em",
  "br", "hr", "script", "style",
];

const TAG_ITEMS: Item[] = TAGS.map((t) => {
  if (t === "img") return { label: "img", detail: "obrázek", insert: 'img src="|" alt="">', kind: "tag" };
  if (t === "a") return { label: "a", detail: "odkaz", insert: 'a href="|"></a>', kind: "tag" };
  if (VOID.has(t)) return { label: t, detail: "prázdný tag", insert: `${t}>`, kind: "tag" };
  return { label: t, detail: `<${t}>`, insert: `${t}>|</${t}>`, kind: "tag" };
});

const ATTRS: [string, string][] = [
  ["src", "zdroj souboru"], ["href", "adresa odkazu"], ["alt", "popis obrázku"], ["class", "třída"],
  ["id", "jedinečné id"], ["type", "typ pole"], ["value", "hodnota"], ["placeholder", "našeptaný text"],
  ["name", "jméno pole"], ["style", "vlastní styl"], ["onclick", "událost po kliku"], ["rel", "vztah odkazu"],
  ["lang", "jazyk"], ["content", "obsah meta"], ["for", "přiřazení k poli"],
];
const ATTR_ITEMS: Item[] = ATTRS.map(([a, d]) => ({ label: a, detail: d, insert: `${a}="|"`, kind: "attr" }));

const CSS_PROPS: [string, string][] = [
  ["color", "barva textu"], ["background", "pozadí"], ["background-color", "barva pozadí"],
  ["font-size", "velikost písma"], ["font-weight", "tloušťka písma"], ["font-family", "font"],
  ["margin", "vnější mezera"], ["padding", "vnitřní mezera"], ["border", "ohraničení"],
  ["border-radius", "zaoblení rohů"], ["width", "šířka"], ["height", "výška"], ["max-width", "největší šířka"],
  ["min-height", "nejmenší výška"], ["display", "zobrazení"], ["flex-direction", "směr flexboxu"],
  ["justify-content", "zarovnání vodorovně"], ["align-items", "zarovnání svisle"], ["gap", "mezera mezi prvky"],
  ["grid-template-columns", "sloupce mřížky"], ["position", "poloha"], ["top", "od shora"], ["left", "od leva"],
  ["transition", "plynulý přechod"], ["opacity", "průhlednost"], ["cursor", "kurzor myši"],
  ["text-align", "zarovnání textu"], ["box-shadow", "stín"], ["transform", "transformace"], ["z-index", "vrstva"],
];
const CSS_ITEMS: Item[] = CSS_PROPS.map(([p, d]) => ({ label: p, detail: d, insert: `${p}: |;`, kind: "css" }));

const JS: [string, string, string][] = [
  ["const", "konstanta", "const |"],
  ["let", "proměnná", "let |"],
  ["function", "funkce", "function |() {\n  \n}"],
  ["if", "podmínka", "if (|) {\n  \n}"],
  ["for", "cyklus", "for (let i = 0; i < |; i++) {\n  \n}"],
  ["return", "vrátí hodnotu", "return |;"],
  ["console.log", "vypíše do konzole", "console.log(|);"],
  ["document.getElementById", "najde prvek podle id", 'document.getElementById("|")'],
  ["document.querySelector", "najde první prvek", 'document.querySelector("|")'],
  ["document.querySelectorAll", "najde všechny prvky", 'document.querySelectorAll("|")'],
  ["document.createElement", "vytvoří prvek", 'document.createElement("|")'],
  ["addEventListener", "reaguje na událost", 'addEventListener("click", () => {\n  |\n})'],
  ["textContent", "text prvku", 'textContent = "|";'],
  ["innerHTML", "HTML prvku", 'innerHTML = "|";'],
  ["classList.add", "přidá třídu", 'classList.add("|");'],
  ["classList.remove", "odebere třídu", 'classList.remove("|");'],
  ["classList.toggle", "přepne třídu", 'classList.toggle("|");'],
  ["setAttribute", "nastaví atribut", 'setAttribute("|", "")'],
  ["appendChild", "přidá prvek do stránky", "appendChild(|);"],
  ["remove", "smaže prvek", "remove();"],
  ["fetch", "načte soubor nebo data", 'fetch("|")'],
  ["JSON.parse", "z textu na data", "JSON.parse(|)"],
  ["JSON.stringify", "z dat na text", "JSON.stringify(|)"],
  ["setTimeout", "spustí později", "setTimeout(() => {\n  |\n}, 1000);"],
  ["setInterval", "opakuje každých x ms", "setInterval(() => {\n  |\n}, 1000);"],
  ["alert", "vyskakovací okno", 'alert("|");'],
  ["Math.random", "náhodné číslo 0 až 1", "Math.random()"],
  ["Math.floor", "zaokrouhlí dolů", "Math.floor(|)"],
  ["forEach", "projde každý prvek", "forEach((item) => {\n  |\n});"],
  ["map", "vytvoří nové pole", "map((item) => |)"],
  ["filter", "vybere prvky", "filter((item) => |)"],
  ["push", "přidá na konec pole", "push(|);"],
];
const JS_ITEMS: Item[] = JS.map(([l, d, i]) => ({ label: l, detail: d, insert: i, kind: "js" }));

// Slovo těsně před kurzorem (písmena, čísla, tečka, pomlčka, podtržítko, dolar).
function wordBefore(v: string, pos: number) {
  const m = /[A-Za-z0-9_$.\-]*$/.exec(v.slice(0, pos));
  return m ? m[0] : "";
}

function filterItems(items: Item[], word: string) {
  const w = word.toLowerCase();
  return items
    .filter((it) => it.label.toLowerCase() !== w && (w === "" || it.label.toLowerCase().includes(w)))
    // Nejdřív shody od začátku (kratší první: h1 před html), pak ostatní.
    .sort((a, b) => {
      const pa = a.label.toLowerCase().startsWith(w) ? 0 : 1;
      const pb = b.label.toLowerCase().startsWith(w) ? 0 : 1;
      return pa - pb || a.label.length - b.label.length;
    })
    .slice(0, 12);
}

// Kontext v HTML souboru: tag po „<“, atribut uvnitř otevřeného tagu, CSS nebo JS v bloku.
function htmlContext(v: string, pos: number): { items: Item[]; start: number } | null {
  const before = v.slice(0, pos);
  const lt = before.lastIndexOf("<");
  const gt = before.lastIndexOf(">");
  if (lt > gt) {
    const seg = before.slice(lt + 1);
    if (/^[A-Za-z0-9]*$/.test(seg)) return { items: TAG_ITEMS, start: lt + 1 };
    // Uvnitř tagu za názvem: atributy, pokud nejsme v uvozovkách.
    const quotes = (seg.match(/"/g) ?? []).length;
    if (/^[A-Za-z0-9]+\s/.test(seg) && quotes % 2 === 0) {
      const word = /[A-Za-z-]*$/.exec(before)?.[0] ?? "";
      return { items: ATTR_ITEMS, start: pos - word.length };
    }
    return null;
  }
  const mode = modeAt(v, pos);
  if (mode === "css") return { items: CSS_ITEMS, start: pos - (/[a-z-]*$/.exec(before)?.[0].length ?? 0) };
  if (mode === "js") return { items: JS_ITEMS, start: pos - wordBefore(v, pos).length };
  return null;
}

// Návrhy pro místo kurzoru. `manual` = uživatel zavolal Ctrl+Space, pak se ukážou i bez písmen.
export function completionAt(v: string, pos: number, kind: FileKind, manual = false): Completion | null {
  if (pos < 0 || pos > v.length) return null;
  if (kind === "css") {
    const word = /[a-z-]*$/.exec(v.slice(0, pos))?.[0] ?? "";
    const items = filterItems(CSS_ITEMS, word);
    return items.length && (word || manual) ? { start: pos - word.length, end: pos, items } : null;
  }
  if (kind === "js") {
    const word = wordBefore(v, pos);
    const full = filterItems(JS_ITEMS, word);
    if (full.length || !word) return full.length && (word || manual) ? { start: pos - word.length, end: pos, items: full } : null;
    // Metoda za tečkou (el.addEv): nabídneme podle posledního dílu a vložíme jen ten díl.
    const seg = word.slice(word.lastIndexOf(".") + 1);
    const items = filterItems(JS_ITEMS, seg).map((it) => ({
      ...it,
      insert: it.insert.slice(it.label.lastIndexOf(".") + 1),
      label: it.label.slice(it.label.lastIndexOf(".") + 1),
    }));
    return items.length ? { start: pos - seg.length, end: pos, items } : null;
  }
  const ctx = htmlContext(v, pos);
  if (!ctx) return null;
  // Uvnitř <script> nebo <style> se doplňuje podle jazyka bloku.
  if (ctx.items === JS_ITEMS) return completionAt(v, pos, "js", manual);
  if (ctx.items === CSS_ITEMS) return completionAt(v, pos, "css", manual);
  const word = v.slice(ctx.start, pos);
  if (!/^[A-Za-z0-9_-]*$/.test(word)) return null;
  const items = filterItems(ctx.items, word);
  if (!items.length) return null;
  // Bez písmen nabízíme jen tagy po „<“; atributy, CSS a JS až po zadání písmene (nebo Ctrl+Space).
  if (!word && !manual && ctx.items !== TAG_ITEMS) return null;
  return { start: ctx.start, end: pos, items };
}

// Vloží návrh do textu. Vrátí nový text a místo kurzoru (podle „|“ ve vzoru).
export function applyCompletion(v: string, start: number, end: number, item: Item) {
  const bar = item.insert.indexOf("|");
  const text = item.insert.replace("|", "");
  const value = v.slice(0, start) + text + v.slice(end);
  const cursor = start + (bar === -1 ? text.length : bar);
  return { value, start: cursor, end: cursor };
}
