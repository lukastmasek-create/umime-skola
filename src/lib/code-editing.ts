// Chování editoru jako ve VS Code: odsazení po Enteru, párování závorek a uvozovek,
// odsazení bloku pomocí Tab, komentáře přes Ctrl+/. Všechny funkce jsou čisté:
// dostanou text a výběr a vrátí nový text a nový výběr.

export type Edit = { value: string; start: number; end: number };

const PAIRS: Record<string, string> = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" };
const CLOSERS = new Set([")", "]", "}", '"', "'", "`"]);
const OPENERS = new Set(["(", "[", "{"]);
const QUOTES = new Set(['"', "'", "`"]);

export function lineStart(v: string, pos: number) {
  return v.lastIndexOf("\n", pos - 1) + 1;
}

export function lineEnd(v: string, pos: number) {
  const i = v.indexOf("\n", pos);
  return i === -1 ? v.length : i;
}

// Enter: nový řádek se stejným odsazením. Za otevírací závorkou se odsadí víc
// a závorka těsně před kurzorem se rozdělí na tři řádky.
export function enter(v: string, s: number, e: number): Edit {
  const ls = lineStart(v, s);
  const indent = /^[ \t]*/.exec(v.slice(ls, lineEnd(v, ls)))?.[0] ?? "";
  const before = s > 0 ? v[s - 1] : "";
  const after = e < v.length ? v[e] : "";
  let ins: string;
  let cursorInside: number;
  if (before && OPENERS.has(before) && after && CLOSERS.has(after)) {
    ins = "\n" + indent + "  " + "\n" + indent;
    cursorInside = 1 + indent.length + 2;
  } else {
    ins = "\n" + indent + (before && OPENERS.has(before) ? "  " : "");
    cursorInside = ins.length;
  }
  const value = v.slice(0, s) + ins + v.slice(e);
  return { value, start: s + cursorInside, end: s + cursorInside };
}

// Tab vloží odsazení; když je vybráno víc řádků nebo je zadán Shift, odsadí nebo zruší odsazení celé bloky.
export function tab(v: string, s: number, e: number, outdent: boolean): Edit {
  if (s === e && !outdent) {
    return { value: v.slice(0, s) + "  " + v.slice(e), start: s + 2, end: s + 2 };
  }
  const ls = lineStart(v, s);
  const le = lineEnd(v, e);
  const block = v.slice(ls, le).split("\n");
  const changed = block.map((l) => (outdent ? l.replace(/^( {1,2}|\t)/, "") : "  " + l)).join("\n");
  return { value: v.slice(0, ls) + changed + v.slice(le), start: ls, end: ls + changed.length };
}

// Psaní znaku: závorky a uvozovky se doplní, zavírací znak se jen přeskočí, když už stojí za kurzorem.
// Vrací null, když má prohlížeč znak vložit sám.
export function typeChar(v: string, s: number, e: number, ch: string): Edit | null {
  if (e > s && PAIRS[ch]) {
    const value = v.slice(0, s) + ch + v.slice(s, e) + PAIRS[ch] + v.slice(e);
    return { value, start: s + 1, end: e + 1 };
  }
  const next = e < v.length ? v[e] : "";
  if (CLOSERS.has(ch) && next === ch) {
    return { value: v, start: s + 1, end: s + 1 };
  }
  if (PAIRS[ch]) {
    const prev = s > 0 ? v[s - 1] : "";
    const quoteAfterWord = QUOTES.has(ch) && /\w/.test(prev);
    const safeNext = next === "" || /[\s)\]}>,;]/.test(next);
    if (safeNext && !quoteAfterWord) {
      const value = v.slice(0, s) + ch + PAIRS[ch] + v.slice(e);
      return { value, start: s + 1, end: s + 1 };
    }
  }
  return null;
}

// Backspace mezi párem (například „()“) smaže oba znaky.
export function backspace(v: string, s: number, e: number): Edit | null {
  if (s !== e || s === 0) return null;
  const prev = v[s - 1];
  if (PAIRS[prev] && v[s] === PAIRS[prev]) {
    return { value: v.slice(0, s - 1) + v.slice(s + 1), start: s - 1, end: s - 1 };
  }
  return null;
}

export type CommentMode = "js" | "css" | "html";

// Podle místa v souboru pozná, jestli je kurzor v <script>, <style> nebo v běžném HTML.
export function modeAt(v: string, pos: number): CommentMode {
  const before = v.slice(0, pos);
  if (before.lastIndexOf("<script") > before.lastIndexOf("</script>")) return "js";
  if (before.lastIndexOf("<style") > before.lastIndexOf("</style>")) return "css";
  return "html";
}

const TOKENS: Record<CommentMode, { open: string; close: string }> = {
  js: { open: "// ", close: "" },
  css: { open: "/* ", close: " */" },
  html: { open: "<!-- ", close: " -->" },
};

// Ctrl+/: když jsou všechny řádky okomentované, odkomentuje je, jinak okomentuje všechny.
export function comment(v: string, s: number, e: number, mode: CommentMode): Edit {
  const ls = lineStart(v, s);
  const le = lineEnd(v, e);
  const { open, close } = TOKENS[mode];
  const lines = v.slice(ls, le).split("\n");
  const indentOf = (l: string) => /^[ \t]*/.exec(l)?.[0] ?? "";
  const isOn = (l: string) => {
    const t = l.trim();
    if (t === "") return true;
    return mode === "js" ? t.startsWith("//") : t.startsWith(open.trim()) && t.endsWith(close.trim());
  };
  const allOn = lines.every(isOn);
  const out = lines.map((l) => {
    if (l.trim() === "") return l;
    const ind = indentOf(l);
    const body = l.slice(ind.length);
    if (allOn) {
      if (mode === "js") return ind + body.replace(/^\/\/ ?/, "");
      return ind + body.replace(open.trimEnd(), "").replace(close.trimStart(), "").replace(/^ /, "").replace(/ $/, "");
    }
    return mode === "js" ? ind + open + body : ind + open + body + close;
  });
  const changed = out.join("\n");
  return { value: v.slice(0, ls) + changed + v.slice(le), start: ls, end: ls + changed.length };
}
