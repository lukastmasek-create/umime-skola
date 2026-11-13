"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SketchIcon, type SketchIconKind } from "@/components/SketchIcons";
import { EXERCISES, LANG_LABEL, type Lang } from "@/lib/code-exercises";

type Result = { passed: boolean; items: { ok: boolean; msg: string }[] };

const LANG_COLOR: Record<Lang, string> = { html: "#ff8a6b", css: "#8fd0ff", js: "#ffc933" };
const LANG_ICON: Record<Lang, SketchIconKind> = { html: "scroll", css: "palette", js: "bolt" };
const FILTERS: ("all" | Lang)[] = ["all", "html", "css", "js"];

export function CodeExercises() {
  const [filter, setFilter] = useState<"all" | Lang>("all");
  const [activeId, setActiveId] = useState(EXERCISES[0].id);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, Result>>({});
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const visible = filter === "all" ? EXERCISES : EXERCISES.filter((e) => e.lang === filter);
  const ex = EXERCISES.find((e) => e.id === activeId) ?? EXERCISES[0];
  const code = codes[ex.id] ?? ex.starter;
  const result = results[ex.id];
  const passedCount = EXERCISES.filter((e) => results[e.id]?.passed).length;
  const percent = Math.round((passedCount / EXERCISES.length) * 100);

  function selectExercise(id: string) {
    setActiveId(id);
    setShowHint(false);
    setShowSolution(false);
  }

  function check() {
    const items = ex.checks.map((c) => ({
      msg: c.msg,
      ok: c.re ? c.re.test(code) : c.fn ? c.fn(code) : false,
    }));
    setResults((r) => ({ ...r, [ex.id]: { passed: items.every((i) => i.ok), items } }));
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
  }

  return (
    <div>
      {/* Lišta: filtr a postup */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Jazyk cvičení" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f;
            const label = f === "all" ? "Všechno" : LANG_LABEL[f];
            return (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f)}
                className={`rounded-lg border-2 px-3 py-1.5 text-sm font-bold transition-transform active:translate-y-0.5 ${
                  active
                    ? "border-[#ffc933] bg-[#ffc933] text-[#16132b] shadow-[3px_3px_0_#16132b]"
                    : "border-[#35305f] bg-[#221e44] text-[#cfc8e4] hover:border-[#8d99ff]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex min-w-[200px] flex-1 items-center gap-3 sm:max-w-xs">
          <span className="whitespace-nowrap text-sm text-[#cfc8e4]">
            Splněno <b className="text-white">{passedCount}</b> z {EXERCISES.length}
          </span>
          <span className="h-3 flex-1 overflow-hidden rounded-full border-2 border-[#35305f] bg-[#16132b]">
            <motion.span
              className="block h-full bg-[#17a864]"
              initial={false}
              animate={{ width: `${percent}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Seznam cvičení */}
        <ul className="flex flex-col gap-2 lg:max-h-[640px] lg:overflow-y-auto lg:pr-1" aria-label="Cvičení">
          {visible.map((e) => {
            const active = e.id === ex.id;
            const done = results[e.id]?.passed;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => selectExercise(e.id)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                    active
                      ? "border-[#ffc933] bg-[#2c2a52]"
                      : "border-[#35305f] bg-[#221e44] hover:border-[#8d99ff]"
                  }`}
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[#16132b]"
                    style={{ background: LANG_COLOR[e.lang] }}
                  >
                    <SketchIcon kind={LANG_ICON[e.lang]} size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase tracking-widest text-[#9d96bf]">
                      {LANG_LABEL[e.lang]} · {e.topic}
                    </span>
                    <span className="block font-bold text-white">{e.title}</span>
                    <span className="mt-1 flex items-center gap-1 text-[#ffc933]" aria-label={`Obtížnost ${e.level} z 3`}>
                      {[1, 2, 3].map((n) => (
                        <SketchIcon key={n} kind="star" size={12} style={{ opacity: n <= e.level ? 1 : 0.25 }} />
                      ))}
                    </span>
                  </span>
                  {done && (
                    <span className="text-[#17a864]" aria-label="Splněno">
                      <SketchIcon kind="trophy" size={20} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Pracovní plocha */}
        <section className="rounded-2xl border-2 border-[#35305f] bg-[#16132b] p-4 sm:p-5" aria-labelledby="ex-title">
          <AnimatePresence mode="wait">
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-md px-2 py-0.5 font-mono text-xs font-bold text-[#16132b]" style={{ background: LANG_COLOR[ex.lang] }}>
                  {LANG_LABEL[ex.lang]}
                </span>
                <span className="text-xs text-[#9d96bf]">{ex.topic}</span>
              </div>
              <h2 id="ex-title" className="text-xl font-bold text-white">{ex.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#cfc8e4]">{ex.task}</p>

              <label htmlFor="ex-code" className="mt-4 block text-xs font-bold uppercase tracking-widest text-[#9d96bf]">
                Tvůj kód
              </label>
              <textarea
                id="ex-code"
                value={code}
                spellCheck={false}
                autoCapitalize="off"
                rows={10}
                onChange={(e) => {
                  const v = e.target.value;
                  setCodes((c) => ({ ...c, [ex.id]: v }));
                }}
                placeholder={`Napiš to sem (${LANG_LABEL[ex.lang]})…`}
                className="mt-1 w-full resize-y rounded-xl border-2 border-[#35305f] bg-[#0f0d24] p-3 font-mono text-[13px] leading-6 text-[#f6f1e4] outline-none focus:border-[#ffc933] sm:text-sm"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={check}
                  className="rounded-lg border-2 border-[#ffc933] bg-[#ffc933] px-4 py-2 text-sm font-bold text-[#16132b] shadow-[3px_3px_0_#16132b] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  ✔ Zkontrolovat
                </button>
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  aria-expanded={showHint}
                  className="rounded-lg border-2 border-[#35305f] px-4 py-2 text-sm font-bold text-[#cfc8e4] hover:border-[#8d99ff]"
                >
                  💡 Nápověda
                </button>
                <button
                  type="button"
                  onClick={() => setShowSolution((v) => !v)}
                  aria-expanded={showSolution}
                  className="rounded-lg border-2 border-[#35305f] px-4 py-2 text-sm font-bold text-[#cfc8e4] hover:border-[#8d99ff]"
                >
                  👀 Řešení
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-lg px-3 py-2 text-sm text-[#9d96bf] underline underline-offset-4 hover:text-white"
                >
                  Vrátit na začátek
                </button>
              </div>

              <AnimatePresence initial={false}>
                {showHint && (
                  <motion.p
                    key="hint"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden rounded-xl border-2 border-dashed border-[#8fd0ff] bg-[#1b2440] p-3 text-sm text-[#d6ebff]"
                  >
                    {ex.hint}
                  </motion.p>
                )}
                {showSolution && (
                  <motion.pre
                    key="solution"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-x-auto rounded-xl border-2 border-dashed border-[#ff8a6b] bg-[#2a1c33] p-3 font-mono text-[13px] leading-6 text-[#ffd2c5]"
                  >
                    {ex.solution}
                  </motion.pre>
                )}
              </AnimatePresence>

              {result && (
                <div className="mt-4" aria-live="polite">
                  {result.passed ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                      className="flex items-center gap-3 rounded-xl border-2 border-[#17a864] bg-[#0f2a20] p-3 text-[#b8f5d6]"
                    >
                      <SketchIcon kind="trophy" size={28} />
                      <span className="font-bold">Jupí, splněno! Můžeš jít na další.</span>
                    </motion.div>
                  ) : (
                    <p className="mb-2 text-sm font-bold text-[#ffd2c5]">Ještě to nesedí, podívej se na body níž:</p>
                  )}
                  <ul className="mt-2 flex flex-col gap-1.5 text-sm">
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
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
