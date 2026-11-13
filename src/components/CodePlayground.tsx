"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { SketchIcon } from "@/components/SketchIcons";
import { backspace, comment, enter, modeAt, tab, typeChar, type Edit } from "@/lib/code-editing";
import { TEMPLATES } from "@/lib/code-playground";

// Volný editor: vlevo šablony a zadání, uprostřed kód s chováním jako ve VS Code,
// vpravo živý náhled. Každá šablona si drží vlastní rozepsaný kód, takže přepnutí nic nesmaže.

const LIVE_DELAY = 250;

export function CodePlayground() {
  const [tid, setTid] = useState(TEMPLATES[0].id);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(TEMPLATES.map((t) => [t.id, t.code])),
  );
  const [wrap, setWrap] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [preview, setPreview] = useState(TEMPLATES[0].code);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const pendingSel = useRef<[number, number] | null>(null);

  const tpl = TEMPLATES.find((t) => t.id === tid) ?? TEMPLATES[0];
  const code = drafts[tpl.id] ?? tpl.code;
  const lines = code.split("\n");
  const longest = lines.reduce((m, l) => Math.max(m, l.length), 0);
  const changed = code !== tpl.code;

  function setCode(v: string) {
    setDrafts((d) => ({ ...d, [tpl.id]: v }));
  }

  // Živý náhled se obnoví krátce po psaní.
  useEffect(() => {
    const t = window.setTimeout(() => setPreview(code), LIVE_DELAY);
    return () => window.clearTimeout(t);
  }, [code]);

  // Po změně kódu nastaví kurzor tam, kam ho chceme (když se změna nevešla do vloženého textu).
  useLayoutEffect(() => {
    const el = textRef.current;
    const sel = pendingSel.current;
    if (el && sel) {
      pendingSel.current = null;
      el.setSelectionRange(sel[0], sel[1]);
    }
  }, [code]);

  // Změnu aplikujeme přes insertText, aby zůstala v historii Ctrl+Z jako u běžného psaní.
  function apply(next: Edit) {
    const el = textRef.current;
    if (!el) return;
    const old = el.value;
    const nv = next.value;
    if (old !== nv) {
      let p = 0;
      while (p < old.length && p < nv.length && old[p] === nv[p]) p++;
      let q = 0;
      while (q < old.length - p && q < nv.length - p && old[old.length - 1 - q] === nv[nv.length - 1 - q]) q++;
      el.setSelectionRange(p, old.length - q);
      let ok = false;
      try {
        ok = document.execCommand("insertText", false, nv.slice(p, nv.length - q));
      } catch {
        ok = false;
      }
      if (!ok || el.value !== nv) {
        pendingSel.current = [next.start, next.end];
        setCode(nv);
      }
    }
    el.setSelectionRange(next.start, next.end);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.nativeEvent.isComposing) return;
    const el = e.currentTarget;
    const v = el.value;
    const s = el.selectionStart;
    const t = el.selectionEnd;
    const mod = e.ctrlKey || e.metaKey;

    if (e.key === "Escape") {
      el.blur();
      return;
    }
    if (mod && (e.key === "s" || e.key === "Enter")) {
      e.preventDefault();
      setPreview(v);
      return;
    }
    if (e.altKey && e.key.toLowerCase() === "z") {
      e.preventDefault();
      setWrap((w) => !w);
      return;
    }
    if (mod && e.key === "/") {
      e.preventDefault();
      apply(comment(v, s, t, modeAt(v, s)));
      return;
    }
    if (mod || e.altKey) return;

    let r: Edit | null = null;
    if (e.key === "Enter") r = enter(v, s, t);
    else if (e.key === "Tab") r = tab(v, s, t, e.shiftKey);
    else if (e.key === "Backspace") r = backspace(v, s, t);
    else if (e.key.length === 1) r = typeChar(v, s, t, e.key);
    if (r) {
      e.preventDefault();
      apply(r);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#35305f] bg-[#0f0d24] shadow-[6px_6px_0_#0a0818]">
      {/* Titulek okna */}
      <div className="flex items-center gap-3 border-b-2 border-[#35305f] bg-[#1b1838] px-3 py-2">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff8a6b]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffc933]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#7ee0b0]" />
        </div>
        <span className="truncate font-mono text-xs text-[#9d96bf]">volny-editor — index.html</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-[#7ee0b0]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#7ee0b0]" aria-hidden />
          Živý náhled
        </span>
      </div>

      <div className="grid lg:grid-cols-[250px_1fr]">
        {/* Šablony a zadání */}
        <aside className="flex flex-col border-b-2 border-[#35305f] bg-[#1b1838] lg:border-b-0 lg:border-r-2">
          <div className="p-3 text-[11px] font-extrabold uppercase tracking-widest text-[#9d96bf]">Šablony a zadání</div>
          <nav aria-label="Šablony a zadání" className="flex max-h-[260px] flex-col gap-0.5 overflow-y-auto px-2 pb-3 lg:max-h-[640px]">
            {[
              { label: "Šablony", items: TEMPLATES.filter((t) => !t.task) },
              { label: "Zadání k vyřešení", items: TEMPLATES.filter((t) => t.task) },
            ].map((g) => (
              <div key={g.label} className="mb-2">
                <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#9d96bf]">{g.label}</div>
                {g.items.map((t) => {
                  const active = t.id === tpl.id;
                  const edited = (drafts[t.id] ?? t.code) !== t.code;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTid(t.id)}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full items-center gap-2 border-l-2 py-1.5 pl-3 pr-2 text-left text-sm transition-colors ${
                        active ? "border-[#ffc933] bg-[#2c2a52] text-white" : "border-transparent text-[#cfc8e4] hover:bg-[#25215a]"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate font-medium">{t.title}</span>
                      {edited && <span className="text-[#ffc933]" aria-label="Upraveno">●</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Editor a náhled */}
        <div className="flex min-w-0 flex-col">
          <div className="flex items-stretch border-b-2 border-[#35305f] bg-[#1b1838]">
            <div className="flex items-center gap-2 border-t-2 border-t-[#ffc933] bg-[#0f0d24] px-4 py-2 font-mono text-sm text-white">
              <SketchIcon kind="scroll" size={13} />
              index.html
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2 px-3 py-1.5">
              <button
                type="button"
                onClick={() => setWrap((w) => !w)}
                aria-pressed={wrap}
                className="rounded-md border-2 border-[#35305f] px-2 py-1 text-xs font-bold text-[#cfc8e4] hover:border-[#8d99ff]"
              >
                Zalamování {wrap ? "zap" : "vyp"} (Alt+Z)
              </button>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                aria-pressed={showPreview}
                className="rounded-md border-2 border-[#35305f] px-2 py-1 text-xs font-bold text-[#cfc8e4] hover:border-[#8d99ff]"
              >
                Náhled {showPreview ? "skrýt" : "ukázat"}
              </button>
              <button
                type="button"
                onClick={() => setCode(tpl.code)}
                disabled={!changed}
                className="rounded-md px-2 py-1 text-xs text-[#9d96bf] underline underline-offset-4 hover:text-white disabled:no-underline disabled:opacity-40"
              >
                Vrátit šablonu
              </button>
            </div>
          </div>

          {/* Zadání nebo volná inspirace */}
          <div className="border-b-2 border-[#35305f] bg-[#16132b] px-4 py-3 text-sm">
            {tpl.task ? (
              <p className="text-[#cfc8e4]">
                <b className="text-[#ffc933]">Zadání: </b>
                {tpl.task}
              </p>
            ) : (
              <p className="text-[#9d96bf]">Volné programování. Piš, co chceš, a sleduj výsledek vpravo. Vlevo vyber šablonu nebo zadání.</p>
            )}
          </div>

          <div className="grid min-w-0 xl:grid-cols-2">
            <div className={wrap ? "bg-[#0f0d24]" : "max-h-[460px] overflow-auto bg-[#0f0d24]"}>
              <div className="flex min-w-full">
                {!wrap && (
                  <div
                    aria-hidden
                    className="sticky left-0 z-[2] shrink-0 select-none border-r-2 border-[#1d1a3a] bg-[#0f0d24] py-3 pl-3 pr-3 text-right font-mono text-[13px] leading-6 text-[#5b5480] sm:text-sm"
                  >
                    {lines.map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                )}
                <textarea
                  ref={textRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={wrap ? 18 : lines.length + 1}
                  wrap={wrap ? "soft" : "off"}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-label="Kód editoru"
                  style={wrap ? undefined : { minWidth: `${longest + 8}ch` }}
                  className={`block min-w-0 flex-1 resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-6 text-[#f6f1e4] caret-[#ffc933] outline-none sm:text-sm ${
                    wrap ? "w-full whitespace-pre-wrap break-words" : "overflow-hidden whitespace-pre"
                  }`}
                />
              </div>
            </div>

            {showPreview && (
              <div className="flex min-w-0 flex-col border-t-2 border-[#35305f] bg-white xl:border-l-2 xl:border-t-0">
                <div className="flex items-center justify-between border-b border-[#d8d2c2] bg-[#f7efe0] px-3 py-1 text-[11px] font-bold text-[#16132b]">
                  <span>Náhled stránky</span>
                  <span className="font-normal text-[#5b5480]">Ctrl+S = hned</span>
                </div>
                <iframe
                  title="Živý náhled"
                  srcDoc={preview}
                  sandbox="allow-scripts"
                  className="h-[460px] w-full bg-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stavový řádek */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t-2 border-[#35305f] bg-[#ffc933] px-3 py-1.5 text-xs font-bold text-[#16132b]">
        <span>HTML</span>
        <span>{lines.length} řádků</span>
        <span className="ml-auto hidden md:inline">Enter odsadí · ( [ {"{"} {"\""} {"'"} se doplní · Ctrl+/ komentář · Tab odsadí · Esc opustí editor</span>
      </div>
    </div>
  );
}
