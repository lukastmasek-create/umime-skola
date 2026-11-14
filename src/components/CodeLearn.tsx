"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SketchIcon } from "@/components/SketchIcons";
import { setAssistContext } from "@/lib/code-assist";
import { CODE_FILES } from "@/lib/code-lessons";

const STEP_MS = 2800;

// Obarví jednoduché tokeny: tagy, texty v uvozovkách, komentáře a klíčová slova.
const TOKEN = /(<!DOCTYPE[^>]*>|<\/?[a-zA-Z][\w-]*|"[^"]*"|\/\/.*|@media|\b(?:const|let|function|if|else|for|return)\b)/;

export function tokenize(code: string): ReactNode[] {
  return code.split(TOKEN).map((part, i) => {
    if (i % 2 === 0) return part; // mezi tokeny
    const cls = part.startsWith("<")
      ? "text-[#8fd0ff]"
      : part.startsWith('"')
        ? "text-[#7ee0b0]"
        : part.startsWith("//")
          ? "text-[#9d96bf] italic"
          : "text-[#ff9bd2]";
    return (
      <span key={i} className={cls}>
        {part}
      </span>
    );
  });
}

export function CodeLearn() {
  const [fileIdx, setFileIdx] = useState(0);
  const [line, setLine] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  const file = CODE_FILES[fileIdx];
  const current = line != null ? file.lines[line]?.explain : undefined;

  function stopPlay() {
    if (timer.current != null) window.clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
  }

  function startPlay() {
    stopPlay();
    const steps = file.lines.flatMap((l, i) => (l.explain ? [i] : []));
    if (steps.length === 0) return;
    let k = 0;
    setLine(steps[0]);
    setPlaying(true);
    timer.current = window.setInterval(() => {
      k += 1;
      if (k >= steps.length) {
        stopPlay();
        return;
      }
      setLine(steps[k]);
    }, STEP_MS);
  }

  function pickFile(i: number) {
    stopPlay();
    setFileIdx(i);
    setLine(null);
  }

  const fileCode = file.lines.map((l) => l.code).join("\n");
  useEffect(() => {
    setAssistContext({ label: `Ukázka: ${file.name}`, code: fileCode });
    return () => setAssistContext(null);
  }, [file.name, fileCode]);

  // Při odchodu ze stránky zastav časovač.
  useEffect(() => () => {
    if (timer.current != null) window.clearInterval(timer.current);
  }, []);

  return (
    <div className="sk-rough overflow-hidden rounded-2xl border-2 border-[var(--sketch-ink)] bg-[#1e1b3a] text-[#f6f1e4] shadow-[6px_6px_0_var(--shadow-ink)]">
      {/* Titulní lišta okna */}
      <div className="flex items-center gap-2 border-b border-[#35305f] bg-[#16132b] px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5a3c]" aria-hidden />
        <span className="h-3 w-3 rounded-full bg-[#ffc933]" aria-hidden />
        <span className="h-3 w-3 rounded-full bg-[#17a864]" aria-hidden />
        <span className="ml-3 truncate font-mono text-xs text-[#9d96bf]">umime-skola / {file.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Průzkumník souborů */}
        <nav className="flex gap-1 overflow-x-auto border-b border-[#35305f] bg-[#221e44] p-2 lg:w-44 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r" aria-label="Soubory">
          {CODE_FILES.map((f, i) => {
            const active = i === fileIdx;
            return (
              <button
                key={f.name}
                type="button"
                onClick={() => pickFile(i)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 font-mono text-sm transition-colors ${
                  active ? "bg-[#353b86] text-white" : "text-[#cfc8e4] hover:bg-[#2c2a52]"
                }`}
              >
                <SketchIcon kind={f.icon} size={18} />
                {f.name}
              </button>
            );
          })}
        </nav>

        {/* Editor */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 border-b border-[#35305f] px-4 py-2">
            <span className="text-xs text-[#9d96bf]">Klikni na řádek s ikonkou, nebo nech přehrát.</span>
            <button
              type="button"
              onClick={() => (playing ? stopPlay() : startPlay())}
              className="rounded-lg border-2 border-[#ffc933] bg-[#ffc933] px-3 py-1 text-xs font-bold text-[#16132b] shadow-[3px_3px_0_#16132b] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              {playing ? "■ Stop" : "▶ Přehrát"}
            </button>
          </div>

          <div className="max-h-[480px] overflow-auto py-3 font-mono text-[13px] leading-7 sm:text-sm">
            {file.lines.map((l, i) => {
              const active = line === i;
              const clickable = !!l.explain;
              return (
                <div key={`${file.name}-${i}`} className="flex">
                  <span className="w-10 shrink-0 select-none pr-3 text-right text-[#6f6a8f]">{i + 1}</span>
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => {
                      stopPlay();
                      setLine(i);
                    }}
                    aria-current={active ? "step" : undefined}
                    className={`relative min-w-0 flex-1 whitespace-pre py-0 pr-7 text-left ${clickable ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {active && (
                      <motion.span
                        layoutId="code-highlight"
                        className="absolute inset-y-0 -inset-x-1 rounded-md bg-[#2c2a52]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                        aria-hidden
                      />
                    )}
                    <span className="relative">{tokenize(l.code)}</span>
                    {clickable && (
                      <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[#ffc933]" aria-hidden>
                        <SketchIcon kind="sparkle" size={12} />
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vysvětlení */}
        <aside className="border-t border-[#35305f] bg-[#16132b] p-4 lg:w-80 lg:border-l lg:border-t-0" aria-live="polite">
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div
                key={`${fileIdx}-${line}`}
                initial={{ opacity: 0, y: 14, rotate: -1.2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#ffc933] bg-[#221e44]">
                    <SketchIcon kind={file.icon} size={20} />
                  </span>
                  <code className="rounded bg-[#2c2a52] px-2 py-0.5 font-mono text-sm text-[#8fd0ff]">{current.cmd}</code>
                </div>
                <h2 className="mb-2 text-lg font-bold leading-snug text-white">{current.title}</h2>
                <p className="text-sm leading-relaxed text-[#cfc8e4]">{current.text}</p>
                {current.tip && (
                  <p className="mt-4 rounded-xl border-2 border-dashed border-[#ff8a6b] bg-[#2a1c33] p-3 text-sm text-[#ffd2c5]">
                    <span className="font-bold">Tip: </span>
                    {current.tip}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col items-start gap-3 py-2 text-sm text-[#cfc8e4]"
              >
                <SketchIcon kind="pencil" size={36} />
                <p className="text-base font-bold text-white">Vyber řádek</p>
                <p>Každý řádek s jiskrou ✦ má svoje vysvětlení. Můžeš na něj klikat, nebo spustit přehrávání a nechat to jet samo.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}
