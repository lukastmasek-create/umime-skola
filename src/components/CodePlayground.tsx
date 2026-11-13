"use client";

import { useEffect, useState } from "react";
import { CodeArea } from "@/components/CodeArea";
import { SketchIcon } from "@/components/SketchIcons";
import { useCodeKeys } from "@/components/useCodeKeys";
import { modeAt } from "@/lib/code-editing";
import { TEMPLATES } from "@/lib/code-playground";

// Volný editor se šablonami: vlevo šablony a zadání, uprostřed kód, vpravo živý náhled.
// Každá šablona si drží vlastní rozepsaný kód, takže přepnutí nic nesmaže.

const LIVE_DELAY = 250;

export function CodePlayground() {
  const [tid, setTid] = useState(TEMPLATES[0].id);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(TEMPLATES.map((t) => [t.id, t.code])),
  );
  const [wrap, setWrap] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [preview, setPreview] = useState(TEMPLATES[0].code);

  const tpl = TEMPLATES.find((t) => t.id === tid) ?? TEMPLATES[0];
  const code = drafts[tpl.id] ?? tpl.code;
  const changed = code !== tpl.code;

  function setCode(v: string) {
    setDrafts((d) => ({ ...d, [tpl.id]: v }));
  }

  // Živý náhled se obnoví krátce po psaní.
  useEffect(() => {
    const t = window.setTimeout(() => setPreview(code), LIVE_DELAY);
    return () => window.clearTimeout(t);
  }, [code]);

  const { textRef, onKeyDown } = useCodeKeys(code, setCode, {
    onRun: () => setPreview(code),
    toggleWrap: () => setWrap((w) => !w),
    commentMode: (v, pos) => modeAt(v, pos),
  });

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
            <CodeArea value={code} onChange={setCode} onKeyDown={onKeyDown} textRef={textRef} wrap={wrap} label="Kód editoru" />

            {showPreview && (
              <div className="flex min-w-0 flex-col border-t-2 border-[#35305f] bg-white xl:border-l-2 xl:border-t-0">
                <div className="flex items-center justify-between border-b border-[#d8d2c2] bg-[#f7efe0] px-3 py-1 text-[11px] font-bold text-[#16132b]">
                  <span>Náhled stránky</span>
                  <span className="font-normal text-[#5b5480]">Ctrl+S = hned</span>
                </div>
                <iframe title="Živý náhled" srcDoc={preview} sandbox="allow-scripts" className="h-[460px] w-full bg-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stavový řádek */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t-2 border-[#35305f] bg-[#ffc933] px-3 py-1.5 text-xs font-bold text-[#16132b]">
        <span>HTML</span>
        <span>{code.split("\n").length} řádků</span>
        <span className="ml-auto hidden md:inline">Enter odsadí · {"( [ {"} · uvozovky se doplní · Ctrl+/ komentář · Tab odsadí · Esc opustí editor</span>
      </div>
    </div>
  );
}
