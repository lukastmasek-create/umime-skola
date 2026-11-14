"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { LEVELS } from "@/lib/unblock/levels";
import {
  SIZE,
  TARGET_ID,
  EXIT_ROW,
  along,
  isSolved,
  moveBlock,
  slideRange,
  type Block,
} from "@/lib/unblock/logic";
import { checkAnswer, pickRound, questionFor, type Round } from "@/lib/unblock/questions";

const WOOD = [
  ["#e7bc84", "#b9793f"],
  ["#d9a46a", "#a86a36"],
  ["#c58b52", "#8f5728"],
  ["#eccb9a", "#c08a4e"],
  ["#b8763c", "#7a4522"],
  ["#dcae78", "#9c6232"],
] as const;
const CHERRY: [string, string] = ["#b4442c", "#6e2112"];
const cell = 100 / SIZE;

function blockBg(b: Block, idx: number): string {
  const [light, dark] = b.id === TARGET_ID ? CHERRY : WOOD[idx % WOOD.length];
  const grain = b.orient === "h" ? "90deg" : "180deg";
  return `repeating-linear-gradient(${grain}, rgba(255,255,255,0.09) 0 2px, rgba(0,0,0,0.05) 2px 7px, transparent 7px 13px), linear-gradient(135deg, ${light}, ${dark})`;
}

function Lock({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <rect x="4" y="11" width="16" height="10" rx="2" fill="currentColor" stroke="none" opacity="0.85" />
          <path d="M8 11V7a4 4 0 0 1 8 0" />
        </>
      ) : (
        <>
          <rect x="4" y="11" width="16" height="10" rx="2" fill="currentColor" stroke="none" opacity="0.85" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
      )}
    </svg>
  );
}

export function UnblockGame() {
  const [levelIdx, setLevelIdx] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>(LEVELS[0].blocks);
  const [moves, setMoves] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [offset, setOffset] = useState(0);
  const [unlockedId, setUnlockedId] = useState<string | null>(null);
  const [dialogId, setDialogId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [wrong, setWrong] = useState(false);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [drag, setDrag] = useState<{ id: string; d: number } | null>(null);
  const [hint, setHint] = useState("Tap a locked block to answer its question. Correct = it slides free.");
  const [won, setWon] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // Random round only on the client (avoids hydration mismatch).
  useEffect(() => {
    setRound(pickRound());
  }, []);

  const reset = (idx: number) => {
    setLevelIdx(idx);
    setBlocks(LEVELS[idx].blocks);
    setMoves(0);
    setWrongTotal(0);
    setOffset(0);
    setUnlockedId(null);
    setDialogId(null);
    setDrag(null);
    setWon(false);
    setRound(pickRound());
    setHint("Tap a locked block to answer its question. Correct = it slides free.");
  };

  const commitMove = (id: string, target: number, from: Block[]) => {
    const next = moveBlock(from, id, target);
    setBlocks(next);
    setMoves((m) => m + 1);
    setUnlockedId(null);
    if (isSolved(next)) {
      setWon(true);
      setHint("Through the exit! Puzzle solved.");
    } else {
      setHint("Nice slide. Answer another question to move again.");
    }
  };

  const onBlockPointerDown = (e: RPointerEvent<HTMLDivElement>, b: Block) => {
    if (won || dialogId || !boardRef.current) return;
    e.preventDefault();
    const size = boardRef.current.getBoundingClientRect().width;
    const px = size / SIZE;
    const { min, max } = slideRange(blocks, b.id);
    const start = along(b);
    const horiz = b.orient === "h";
    const unlocked = unlockedId === b.id;
    const sx = e.clientX;
    const sy = e.clientY;
    let moved = false;
    let d = 0;
    if (unlocked) setDrag({ id: b.id, d: 0 });

    const onMove = (ev: PointerEvent) => {
      const delta = horiz ? ev.clientX - sx : ev.clientY - sy;
      if (Math.abs(delta) > 6) moved = true;
      if (!unlocked) return;
      d = Math.min(Math.max(delta / px, min - start), max - start);
      setDrag({ id: b.id, d });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (!unlocked) {
        if (!moved) {
          setDialogId(b.id);
          setInput("");
          setWrong(false);
        } else {
          setHint("Locked! Tap the block to answer its question first.");
        }
        return;
      }
      setDrag(null);
      const target = Math.min(Math.max(Math.round(start + d), min), max);
      if (target !== start) commitMove(b.id, target, blocks);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const dialogIdx = dialogId ? blocks.findIndex((b) => b.id === dialogId) : -1;
  const dialogQ = round && dialogIdx >= 0 ? questionFor(round, dialogIdx, offset) : null;

  const submit = () => {
    if (!dialogQ || !dialogId) return;
    if (checkAnswer(dialogQ, input)) {
      setUnlockedId(dialogId);
      setOffset((o) => o + 1);
      setDialogId(null);
      setInput("");
      setWrong(false);
      setHint("Correct! Block is free to slide once. Questions rotated.");
    } else {
      setWrong(true);
      setWrongTotal((n) => n + 1);
    }
  };

  const frame: CSSProperties = {
    background: "linear-gradient(160deg, #6b4423, #3d2412 70%)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.45), inset 0 2px 0 rgba(255,220,160,0.25)",
  };
  const boardBg: CSSProperties = {
    background:
      "repeating-linear-gradient(0deg, rgba(90,50,20,0.06) 0 1px, transparent 1px 11px), linear-gradient(135deg, #d8ad74, #b07d45)",
    boxShadow: "inset 0 4px 12px rgba(40,20,5,0.55), inset 0 0 0 2px #4a2a12",
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 text-[#f6e7cc] select-none">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <div className="rounded-xl border border-[#8a5a2b] bg-[#2a1808] px-4 py-2 text-center">
            <div className="text-[10px] uppercase tracking-widest text-[#d9a46a]">Moves</div>
            <div className="text-2xl font-bold tabular-nums" aria-live="polite">{moves}</div>
          </div>
          <div className="rounded-xl border border-[#8a5a2b] bg-[#2a1808] px-4 py-2 text-center">
            <div className="text-[10px] uppercase tracking-widest text-[#d9a46a]">Wrong</div>
            <div className="text-2xl font-bold tabular-nums">{wrongTotal}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => reset(levelIdx)}
          className="rounded-xl bg-gradient-to-b from-[#c98a4b] to-[#8a5524] px-5 py-3 font-semibold text-[#2a1606] shadow-md transition hover:brightness-110 active:scale-95"
        >
          Reset
        </button>
      </div>

      {/* Level picker + round type */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((lv, i) => (
            <button
              key={lv.name}
              type="button"
              onClick={() => reset(i)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                i === levelIdx ? "bg-[#f0c27a] text-[#2a1606]" : "bg-[#3d2412] text-[#e9cfa0] hover:bg-[#4f3018]"
              }`}
            >
              {i + 1}. {lv.name}
            </button>
          ))}
        </div>
        {round && (
          <span className="rounded-full border border-[#b4442c] bg-[#5a1f12] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#ffd7b8]">
            {round.type} round
          </span>
        )}
      </div>

      {/* Board */}
      <div className="relative rounded-[22px] p-3.5 sm:p-4" style={frame}>
        <div
          ref={boardRef}
          className="relative aspect-square w-full rounded-lg"
          style={{ ...boardBg, position: "relative", aspectRatio: "1 / 1" }}
        >
          {blocks.map((b, idx) => {
            const pos = drag?.id === b.id ? along(b) + drag.d : along(b);
            const left = b.orient === "h" ? pos : b.c;
            const top = b.orient === "v" ? pos : b.r;
            const isTarget = b.id === TARGET_ID;
            const unlocked = unlockedId === b.id;
            const dragging = drag?.id === b.id;
            const q = round && !isTarget ? questionFor(round, idx, offset) : null;
            return (
              <div
                key={b.id}
                role="button"
                tabIndex={0}
                aria-label={`Block ${b.id}${unlocked ? " unlocked" : " locked, answer its question"}`}
                onPointerDown={(e) => onBlockPointerDown(e, b)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!unlocked) {
                      setDialogId(b.id);
                      setInput("");
                      setWrong(false);
                    }
                  }
                }}
                className={`touch-none rounded-[9px] text-[#fff6e6] outline-none focus-visible:ring-4 focus-visible:ring-[#f0c27a] ${
                  unlocked ? "ring-4 ring-[#ffd76a]" : ""
                }`}
                style={{
                  position: "absolute",
                  left: `calc(${left * cell}% + 4px)`,
                  top: `calc(${top * cell}% + 4px)`,
                  width: b.orient === "h" ? `calc(${b.len * cell}% - 8px)` : `calc(${cell}% - 8px)`,
                  height: b.orient === "v" ? `calc(${b.len * cell}% - 8px)` : `calc(${cell}% - 8px)`,
                  background: blockBg(b, idx),
                  boxShadow: dragging
                    ? "0 16px 22px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.35)"
                    : "0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.25)",
                  transition: dragging ? "none" : "left .2s ease, top .2s ease, box-shadow .2s",
                  cursor: won ? "default" : unlocked ? "grab" : "pointer",
                  zIndex: dragging ? 10 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isTarget ? (
                  <span className="font-bold tracking-widest text-[#ffe2c4] drop-shadow">KEY</span>
                ) : (
                  <span className={`flex items-center gap-1 font-bold drop-shadow ${unlocked ? "text-[#ffe9a8]" : "text-[#fff1d6]/90"}`}>
                    <Lock open={unlocked} />
                    {!unlocked && q && <span className="hidden text-xs opacity-80 sm:inline">{q.type === "number" ? "#" : "Aa"}</span>}
                  </span>
                )}
              </div>
            );
          })}
          {/* exit opening on the right edge, row 2 */}
          <div
            aria-hidden
            className="flex items-center justify-center rounded-r-md bg-[#2a1608] text-[10px] text-[#ffd7a0]"
            style={{
              position: "absolute",
              left: "100%",
              top: `calc(${EXIT_ROW * cell}% + 4px)`,
              width: "14px",
              height: `calc(${cell}% - 8px)`,
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6)",
            }}
          >
            ▶
          </div>
        </div>
      </div>

      <p className="min-h-[3rem] text-center text-sm text-[#e9cfa0]" role="status">
        {hint}
      </p>

      {/* Question dialog */}
      {dialogQ && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unblock-q"
          onKeyDown={(e) => e.key === "Escape" && setDialogId(null)}
        >
          <div className="w-full max-w-sm rounded-2xl border-2 border-[#b07d45] bg-[#f4dcb4] p-6 text-[#2a1606] shadow-2xl">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[#8a4a22]">
              {dialogQ.type === "number" ? "Number question" : "Word question"}
            </div>
            <h2 id="unblock-q" className="mb-4 text-xl font-bold">{dialogQ.prompt}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <input
                autoFocus
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setWrong(false);
                }}
                inputMode={dialogQ.type === "number" ? "decimal" : "text"}
                placeholder={dialogQ.type === "number" ? "type a number" : "type a word"}
                className={`w-full rounded-lg border-2 bg-white px-3 py-2 text-lg outline-none ${
                  wrong ? "animate-[unbshake_.3s] border-[#b4442c]" : "border-[#b07d45] focus:border-[#6e2112]"
                }`}
              />
              {wrong && <p className="mt-2 text-sm font-semibold text-[#b4442c]">Not quite. Try again.</p>}
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setDialogId(null)} className="flex-1 rounded-lg border-2 border-[#8a5a2b] px-4 py-2 font-semibold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-lg bg-[#6e2112] px-4 py-2 font-semibold text-[#ffe9d0] hover:brightness-110">
                  Answer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Win overlay */}
      {won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl border-2 border-[#f0c27a] bg-[#3d2412] p-7 text-center shadow-2xl">
            <div className="text-3xl font-extrabold text-[#ffd76a]">Solved!</div>
            <p className="mt-2 text-[#e9cfa0]">
              {moves} moves · {wrongTotal} wrong answers
            </p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => reset(levelIdx)} className="flex-1 rounded-lg border-2 border-[#8a5a2b] px-4 py-2 font-semibold text-[#f6e7cc]">
                Replay
              </button>
              {levelIdx < LEVELS.length - 1 && (
                <button type="button" onClick={() => reset(levelIdx + 1)} className="flex-1 rounded-lg bg-gradient-to-b from-[#f0c27a] to-[#c98a4b] px-4 py-2 font-bold text-[#2a1606]">
                  Next puzzle
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes unbshake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
    </div>
  );
}
