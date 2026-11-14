"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SketchIcon } from "@/components/SketchIcons";
import { tokenize } from "@/components/CodeLearn";
import { CURRICULUM, LEARNING_PLAN, type Block } from "@/lib/code-curriculum";
import { EXERCISES, LANG_LABEL } from "@/lib/code-exercises";

const TITLE_BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e.title]));

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((b, i) => {
        if (b.type === "text") return <p key={i} className="text-sm leading-relaxed text-[#cfc8e4]">{b.text}</p>;
        if (b.type === "code")
          return (
            <div key={i}>
              {b.title && <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#9d96bf]">{b.title}</p>}
              <pre className="overflow-x-auto rounded-xl border-2 border-[#35305f] bg-[#0f0d24] p-3 font-mono text-[13px] leading-6 text-[#f6f1e4]">
                {b.code.split("\n").map((line, j) => (
                  <div key={j}>{tokenize(line)}</div>
                ))}
              </pre>
            </div>
          );
        if (b.type === "table")
          return (
            <div key={i} className="overflow-x-auto rounded-xl border-2 border-[#35305f]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#221e44] text-[#ffc933]">
                  <tr>
                    {b.head.map((h) => (
                      <th key={h} className="px-3 py-2 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((r, j) => (
                    <tr key={j} className="border-t border-[#35305f] text-[#cfc8e4]">
                      {r.map((cell, k) => (
                        <td key={k} className="px-3 py-2 align-top font-mono text-[13px] text-[#f6f1e4]">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        if (b.type === "tip")
          return (
            <p key={i} className="rounded-xl border-2 border-dashed border-[#8fd0ff] bg-[#1b2440] p-3 text-sm text-[#d6ebff]">
              <b>Tip: </b>{b.text}
            </p>
          );
        return (
          <p key={i} className="rounded-xl border-2 border-dashed border-[#ff8a6b] bg-[#2a1c33] p-3 text-sm text-[#ffd2c5]">
            <b>Pozor: </b>{b.text}
          </p>
        );
      })}
    </div>
  );
}

export function CodeCurriculum() {
  const [open, setOpen] = useState<string | null>(CURRICULUM[0].id);
  const [showPlan, setShowPlan] = useState(true);

  return (
    <div>
      {/* Učební plán */}
      <div className="mb-6 rounded-2xl border-2 border-[#35305f] bg-[#16132b] p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setShowPlan((v) => !v)}
          aria-expanded={showPlan}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="flex items-center gap-3">
            <SketchIcon kind="rocket" size={26} />
            <span>
              <span className="block text-lg font-bold text-white">Učební plán: od čeho začít</span>
              <span className="block text-sm text-[#cfc8e4]">Jdi krok za krokem. Další krok začni, až zvládneš projekt předchozího.</span>
            </span>
          </span>
          <span className="text-[#ffc933]">{showPlan ? "▲" : "▼"}</span>
        </button>

        <AnimatePresence initial={false}>
          {showPlan && (
            <motion.ol
              key="plan"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex flex-col gap-3 overflow-hidden"
            >
              {LEARNING_PLAN.map((s, i) => (
                <motion.li
                  key={s.step}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 rounded-xl border-2 border-[#35305f] bg-[#221e44] p-3"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[#16132b] bg-[#ffc933] font-extrabold text-[#16132b]">
                    {s.step}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-bold text-white">{s.title}</span>
                      <span className="text-xs text-[#9d96bf]">⏱ {s.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#cfc8e4]">Cíl: {s.goal}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {s.sections.map((id) => {
                        const sec = CURRICULUM.find((c) => c.id === id);
                        return sec ? (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setOpen(id);
                              document.getElementById(`sekce-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }}
                            className="rounded-md border-2 border-[#8d99ff] px-2 py-0.5 font-bold text-[#d6dcff] hover:bg-[#2c2a52]"
                          >
                            <span className="inline-flex items-center gap-1.5"><SketchIcon kind="study" size={14} />{sec.title}</span>
                          </button>
                        ) : null;
                      })}
                      {s.project && (
                        <a href="#cviceni" className="rounded-md border-2 border-[#17a864] px-2 py-0.5 font-bold text-[#b8f5d6] hover:bg-[#0f2a20]">
                          <span className="inline-flex items-center gap-1.5"><SketchIcon kind="gear" size={14} />Projekt: {TITLE_BY_ID[s.project] ?? s.project}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          )}
        </AnimatePresence>
      </div>

      {/* Sekce učiva */}
      <ul className="flex flex-col gap-3">
        {CURRICULUM.map((s) => {
          const isOpen = open === s.id;
          return (
            <li key={s.id} id={`sekce-${s.id}`} className="scroll-mt-24 overflow-hidden rounded-2xl border-2 border-[#35305f] bg-[#16132b]">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : s.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-[#221e44]"
              >
                <span className="rounded-md px-2 py-0.5 font-mono text-xs font-bold text-[#16132b]" style={{ background: s.lang === "html" ? "#ff8a6b" : s.lang === "css" ? "#8fd0ff" : "#ffc933" }}>
                  {LANG_LABEL[s.lang]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-white">{s.title}</span>
                  <span className="block text-sm text-[#9d96bf]">{s.summary}</span>
                </span>
                <span className="text-[#ffc933]">{isOpen ? "▲" : "▼"}</span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="body"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t-2 border-[#35305f] p-4 sm:p-5">
                      <Blocks blocks={s.blocks} />
                      {s.practice.length > 0 && (
                        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-bold text-[#ffc933]">Procvič:</span>
                          {s.practice.map((id) => (
                            <a key={id} href="#cviceni" className="rounded-md border-2 border-[#35305f] px-2 py-0.5 text-[#cfc8e4] hover:border-[#ffc933]">
                              {TITLE_BY_ID[id] ?? id}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
