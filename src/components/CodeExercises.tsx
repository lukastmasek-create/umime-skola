"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SketchIcon, type SketchIconKind } from "@/components/SketchIcons";
import { EXERCISES, LANG_LABEL, type Exercise, type Lang } from "@/lib/code-exercises";

// Pracovní prostředí ve stylu VS Code: průzkumník vlevo, záložky souborů, editor s čísly řádků,
// spodní panel s výsledky a stavový řádek dole. Vizuál zůstává v barvách a ikonách webu.

type Result = { passed: boolean; items: { ok: boolean; msg: string }[]; n: number };
type Panel = "problems" | "hint" | "solution";
type GroupKey = "doplni" | "napis" | "projekt";

const LANG_COLOR: Record<Lang, string> = { html: "#ff8a6b", css: "#8fd0ff", js: "#ffc933" };
const LANG_ICON: Record<Lang, SketchIconKind> = { html: "scroll", css: "palette", js: "bolt" };

const GROUPS: { key: GroupKey; label: string; icon: SketchIconKind }[] = [
  { key: "doplni", label: "Doplň chybějící", icon: "study" },
  { key: "napis", label: "Napiš od nuly", icon: "pencil" },
  { key: "projekt", label: "Projekty", icon: "rocket" },
];

const PANELS: { key: Panel; label: string }[] = [
  { key: "problems", label: "Problémy" },
  { key: "hint", label: "Nápověda" },
  { key: "solution", label: "Řešení" },
];

function groupOf(e: Exercise): GroupKey {
  if (e.kind === "doplni") return "doplni";
  if (e.kind === "projekt") return "projekt";
  return "napis";
}

// Název „souboru“ v průzkumníku, např. kostra.html nebo formular.js.
function fileName(e: Exercise) {
  const stem = e.id.replace(/^(doplni|projekt)-/, "").replace(/^(html|css|js)-/, "");
  return `${stem}.${e.lang}`;
}

function Pill({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span className="rounded-md px-2 py-0.5 font-mono text-[11px] font-bold text-[#16132b]" style={{ background: color }}>
      {children}
    </span>
  );
}

// Editor: čísla řádků vlevo, zvýrazněná místa ___ a Tab vloží odsazení.
function CodeEditor({
  value,
  onChange,
  onRun,
}: {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
}) {
  const lines = value.split("\n");
  const rows = Math.max(lines.length + 1, 12);
  const longest = lines.reduce((m, l) => Math.max(m, l.length), 0);
  const parts = value.split(/(___)/);

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const s = el.selectionStart;
      const t = el.selectionEnd;
      onChange(value.slice(0, s) + "  " + value.slice(t));
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = s + 2;
      });
    } else if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "Enter")) {
      e.preventDefault();
      onRun();
    }
  }

  const textStyle = "px-4 py-3 font-mono text-[13px] leading-6 sm:text-sm";

  return (
    <div className="flex min-w-full">
      <div
        aria-hidden
        className="sticky left-0 z-[2] shrink-0 select-none border-r-2 border-[#1d1a3a] bg-[#0f0d24] py-3 pl-3 pr-3 text-right font-mono text-[13px] leading-6 text-[#5b5480] sm:text-sm"
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div className="relative min-w-0 flex-1" style={{ minWidth: `${longest + 6}ch` }}>
        <pre aria-hidden className={`pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre text-transparent ${textStyle}`}>
          {parts.map((p, i) =>
            p === "___" ? (
              <mark key={i} className="rounded-sm bg-[#ffc933]/30 text-transparent shadow-[0_0_0_1px_#ffc933]">
                ___
              </mark>
            ) : (
              <span key={i}>{p}</span>
            ),
          )}
          {"\n"}
        </pre>
        <label htmlFor="ex-code" className="sr-only">
          Tvůj kód
        </label>
        <textarea
          id="ex-code"
          value={value}
          rows={rows}
          wrap="off"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Napiš kód sem…"
          className={`relative z-[1] block w-full resize-none overflow-hidden bg-transparent text-[#f6f1e4] caret-[#ffc933] outline-none placeholder:text-[#5b5480] ${textStyle}`}
        />
      </div>
    </div>
  );
}

export function CodeExercises() {
  const [activeId, setActiveId] = useState(EXERCISES[0].id);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, Result>>({});
  const [panel, setPanel] = useState<Panel>("problems");
  const [query, setQuery] = useState("");
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  const ex = EXERCISES.find((e) => e.id === activeId) ?? EXERCISES[0];
  const code = codes[ex.id] ?? ex.starter;
  const result = results[ex.id];
  const modified = code !== ex.starter;
  const passedCount = EXERCISES.filter((e) => results[e.id]?.passed).length;
  const percent = Math.round((passedCount / EXERCISES.length) * 100);
  const failedCount = result ? result.items.filter((i) => !i.ok).length : 0;
  const lineCount = code.split("\n").length;
  const q = query.trim().toLowerCase();

  function matches(e: Exercise) {
    return !q || e.title.toLowerCase().includes(q) || e.topic.toLowerCase().includes(q);
  }

  function check() {
    const items = ex.checks.map((c) => ({
      msg: c.msg,
      ok: c.re ? c.re.test(code) : c.fn ? c.fn(code) : false,
    }));
    setResults((r) => ({
      ...r,
      [ex.id]: { passed: items.every((i) => i.ok), items, n: (r[ex.id]?.n ?? 0) + 1 },
    }));
    setPanel("problems");
    // Na mobilu je panel pod dlouhým editorem, tak ho přivedeme do záběru.
    window.setTimeout(() => {
      document.getElementById("ex-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 60);
  }

  function reset() {
    setCodes((c) => {
      const next = { ...c };
      delete next[ex.id];
      return next;
    });
    setResults((r) => {
      const next = { ...r };
      delete next[ex.id];
      return next;
    });
    setPanel("problems");
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
        <span className="truncate font-mono text-xs text-[#9d96bf]">kod-na-hrani — cvičení</span>
      </div>

      <div className="grid lg:grid-cols-[270px_1fr]">
        {/* Průzkumník */}
        <aside className="flex flex-col border-b-2 border-[#35305f] bg-[#1b1838] lg:border-b-0 lg:border-r-2">
          <div className="flex flex-col gap-2 p-3">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#9d96bf]">Průzkumník</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hledat cvičení…"
              aria-label="Hledat cvičení"
              className="w-full rounded-md border-2 border-[#35305f] bg-[#0f0d24] px-2.5 py-1.5 text-sm text-white outline-none placeholder:text-[#5b5480] focus:border-[#ffc933]"
            />
          </div>

          <nav aria-label="Seznam cvičení" className="flex max-h-[300px] flex-col gap-1 overflow-y-auto px-2 pb-3 lg:max-h-[640px]">
            {GROUPS.map((g) => {
              const items = EXERCISES.filter((e) => groupOf(e) === g.key && matches(e));
              if (items.length === 0) return null;
              const open = q ? true : !closed[g.key];
              const doneInGroup = items.filter((e) => results[e.id]?.passed).length;
              return (
                <div key={g.key}>
                  <button
                    type="button"
                    onClick={() => setClosed((c) => ({ ...c, [g.key]: !c[g.key] }))}
                    aria-expanded={open}
                    className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-[#9d96bf] hover:bg-[#25215a] hover:text-white"
                  >
                    <span aria-hidden className="w-3 text-[10px]">{open ? "▾" : "▸"}</span>
                    <SketchIcon kind={g.icon} size={14} />
                    <span className="truncate">{g.label}</span>
                    <span className="ml-auto rounded bg-[#2c2a52] px-1.5 text-[10px] tracking-normal text-[#cfc8e4]">
                      {doneInGroup}/{items.length}
                    </span>
                  </button>

                  {open && (
                    <ul className="mt-0.5 flex flex-col gap-0.5">
                      {items.map((e) => {
                        const active = e.id === ex.id;
                        const done = results[e.id]?.passed;
                        return (
                          <li key={e.id}>
                            <button
                              type="button"
                              onClick={() => setActiveId(e.id)}
                              aria-current={active ? "true" : undefined}
                              className={`flex w-full items-center gap-2 border-l-2 py-1.5 pl-3 pr-2 text-left text-sm transition-colors ${
                                active
                                  ? "border-[#ffc933] bg-[#2c2a52] text-white"
                                  : "border-transparent text-[#cfc8e4] hover:bg-[#25215a]"
                              }`}
                            >
                              <span
                                className="grid h-5 w-5 shrink-0 place-items-center rounded border border-[#16132b]"
                                style={{ background: LANG_COLOR[e.lang] }}
                              >
                                <SketchIcon kind={LANG_ICON[e.lang]} size={12} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium">{e.title}</span>
                                <span className="block truncate font-mono text-[11px] text-[#7d76a3]">{fileName(e)}</span>
                              </span>
                              {done && (
                                <span className="font-bold text-[#7ee0b0]" aria-label="Splněno">
                                  ✓
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
            {q && GROUPS.every((g) => !EXERCISES.some((e) => groupOf(e) === g.key && matches(e))) && (
              <p className="px-2 py-3 text-sm text-[#9d96bf]">Nic nenašlo. Zkus jiné slovo.</p>
            )}
          </nav>
        </aside>

        {/* Editor a panel */}
        <div className="flex min-w-0 flex-col">
          {/* Záložka souboru */}
          <div role="tablist" aria-label="Otevřené soubory" className="flex items-stretch overflow-x-auto border-b-2 border-[#35305f] bg-[#1b1838]">
            <div
              role="tab"
              aria-selected="true"
              className="flex items-center gap-2 border-t-2 border-t-[#ffc933] bg-[#0f0d24] px-4 py-2 font-mono text-sm text-white"
            >
              <span className="grid h-4 w-4 place-items-center rounded-sm" style={{ background: LANG_COLOR[ex.lang] }}>
                <SketchIcon kind={LANG_ICON[ex.lang]} size={11} />
              </span>
              {fileName(ex)}
              {modified && <span aria-label="Neuložené změny" className="text-[#ffc933]">●</span>}
            </div>
          </div>

          {/* Cesta */}
          <div className="border-b border-[#35305f] px-4 py-1.5 font-mono text-[11px] text-[#7d76a3]">
            cvičení › {GROUPS.find((g) => g.key === groupOf(ex))?.label} › {fileName(ex)}
          </div>

          {/* Zadání */}
          <div className="border-b-2 border-[#35305f] bg-[#16132b] px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-center gap-2">
              <Pill color={LANG_COLOR[ex.lang]}>{LANG_LABEL[ex.lang]}</Pill>
              {ex.kind && ex.kind !== "napis" && (
                <span className="rounded-md border-2 border-[#16132b] bg-[#ffc933] px-2 py-0.5 text-[11px] font-extrabold text-[#16132b]">
                  {ex.kind === "projekt" ? "PROJEKT" : "DOPLŇ"}
                </span>
              )}
              <span className="text-xs text-[#9d96bf]">{ex.topic}</span>
              <span className="ml-auto flex items-center gap-0.5 text-[#ffc933]" aria-label={`Obtížnost ${ex.level} z 3`}>
                {[1, 2, 3].map((n) => (
                  <SketchIcon key={n} kind="star" size={12} style={{ opacity: n <= ex.level ? 1 : 0.25 }} />
                ))}
              </span>
            </div>
            <h2 id="ex-title" className="mt-2 text-lg font-bold text-white">{ex.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#cfc8e4]">{ex.task}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={check}
                title="Zkontrolovat (Ctrl+S)"
                className="rounded-lg border-2 border-[#ffc933] bg-[#ffc933] px-4 py-1.5 text-sm font-bold text-[#16132b] shadow-[3px_3px_0_#16132b] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                ▶ Zkontrolovat
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-lg px-3 py-1.5 text-sm text-[#9d96bf] underline underline-offset-4 hover:text-white"
              >
                Vrátit na začátek
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="max-h-[440px] min-h-[260px] overflow-auto bg-[#0f0d24]" aria-labelledby="ex-title">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={ex.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <CodeEditor
                  value={code}
                  onChange={(v) => setCodes((c) => ({ ...c, [ex.id]: v }))}
                  onRun={check}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Spodní panel */}
          <div id="ex-panel" className="border-t-2 border-[#35305f] bg-[#16132b] scroll-mt-24">
            <div role="tablist" aria-label="Panel" className="flex gap-1 border-b border-[#35305f] px-2">
              {PANELS.map((p) => {
                const active = panel === p.key;
                const badge = p.key === "problems" && result && failedCount > 0 ? failedCount : null;
                return (
                  <button
                    key={p.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setPanel(p.key)}
                    className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                      active ? "border-[#ffc933] text-white" : "border-transparent text-[#9d96bf] hover:text-white"
                    }`}
                  >
                    {p.label}
                    {badge !== null && (
                      <span className="rounded bg-[#ff8a6b] px-1.5 text-[10px] text-[#16132b]">{badge}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div role="tabpanel" className="min-h-[150px] p-4 text-sm">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${panel}-${ex.id}-${panel === "problems" ? result?.n ?? 0 : 0}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {panel === "problems" &&
                    (!result ? (
                      <p className="text-[#9d96bf]">Ještě jsi nekontroloval. Klikni na Zkontrolovat nebo stiskni Ctrl+S.</p>
                    ) : result.passed ? (
                      <motion.div
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 16 }}
                        className="flex items-center gap-3 rounded-xl border-2 border-[#17a864] bg-[#0f2a20] p-3 text-[#b8f5d6]"
                      >
                        <SketchIcon kind="trophy" size={28} />
                        <span className="font-bold">Jupí, splněno! Můžeš jít na další.</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={result.n}
                        animate={{ x: [0, -8, 8, -5, 5, 0] }}
                        transition={{ duration: 0.4 }}
                      >
                        <p className="mb-2 font-bold text-[#ffd2c5]">
                          Splněno {result.items.length - failedCount} z {result.items.length}. Podívej se, co chybí:
                        </p>
                        <ul className="flex flex-col gap-1.5">
                          {result.items.map((it, i) => (
                            <motion.li
                              key={`${ex.id}-${i}`}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06 }}
                              className={`flex items-start gap-2 ${it.ok ? "text-[#b8f5d6]" : "text-[#ff9a8a]"}`}
                            >
                              <span aria-hidden className="font-bold">{it.ok ? "✓" : "✗"}</span>
                              <span>{it.msg}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}

                  {panel === "hint" && (
                    <p className="rounded-xl border-2 border-dashed border-[#8fd0ff] bg-[#1b2440] p-3 text-[#d6ebff]">
                      💡 {ex.hint}
                    </p>
                  )}

                  {panel === "solution" && (
                    <div>
                      <p className="mb-2 text-xs text-[#ffd2c5]">
                        Nejdřív zkus sám. Když to nevyjde, podívej se sem a pak to napiš po svém.
                      </p>
                      <pre className="overflow-x-auto rounded-xl border-2 border-dashed border-[#ff8a6b] bg-[#2a1c33] p-3 font-mono text-[13px] leading-6 text-[#ffd2c5]">
                        {ex.solution}
                      </pre>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Stavový řádek */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t-2 border-[#35305f] bg-[#ffc933] px-3 py-1.5 text-xs font-bold text-[#16132b]">
        <span>✔ Splněno {passedCount} z {EXERCISES.length}</span>
        <span className="h-2.5 w-24 overflow-hidden rounded-full border border-[#16132b] bg-[#fff3c4]" aria-hidden>
          <motion.span
            className="block h-full bg-[#17a864]"
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </span>
        <span className="ml-auto">{LANG_LABEL[ex.lang]}</span>
        <span>{lineCount} {lineCount === 1 ? "řádek" : lineCount < 5 ? "řádky" : "řádků"}</span>
        <span className="hidden md:inline">Ctrl+S = zkontrolovat · Tab = odsazení</span>
      </div>
    </div>
  );
}
