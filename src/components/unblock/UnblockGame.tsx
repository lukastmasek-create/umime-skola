"use client";

import { useEffect, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { LEVELS } from "@/lib/unblock/levels";
import {
  SIZE,
  H_ROW,
  V_COL,
  axisRange,
  bbox,
  isSolved,
  movePiece,
  type Piece,
} from "@/lib/unblock/logic";
import { checkAnswer, pickRound, questionFor, type Round } from "@/lib/unblock/questions";

const CELL = 100 / SIZE;
const WOOD: [string, string][] = [
  ["#e7bc84", "#b9793f"],
  ["#d9a46a", "#a86a36"],
  ["#c58b52", "#8f5728"],
  ["#eccb9a", "#c08a4e"],
  ["#b8763c", "#7a4522"],
  ["#dcae78", "#9c6232"],
];
const CHERRY: [string, string] = ["#b4442c", "#6e2112"];

const grain = (dir: "h" | "v") =>
  `repeating-linear-gradient(${dir === "h" ? "90deg" : "180deg"}, rgba(255,255,255,0.09) 0 2px, rgba(0,0,0,0.05) 2px 7px, transparent 7px 13px)`;

function Lock({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2" fill="currentColor" stroke="none" opacity="0.9" />
      <path d={open ? "M8 11V7a4 4 0 0 1 8 0" : "M8 11V7a4 4 0 0 1 8 0v4"} />
    </svg>
  );
}

type Drag = { id: string; axis: "h" | "v"; d: number } | null;

export function UnblockGame({ backHref }: { backHref: string }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [pieces, setPieces] = useState<Piece[]>(LEVELS[0].pieces);
  const [moves, setMoves] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [offset, setOffset] = useState(0);
  const [unlockedId, setUnlockedId] = useState<string | null>(null);
  const [dialogId, setDialogId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [wrong, setWrong] = useState(false);
  const [drag, setDrag] = useState<Drag>(null);
  const [hint, setHint] = useState(HINT_START);
  const [won, setWon] = useState(false);
  const [boardEl, setBoardEl] = useState<HTMLDivElement | null>(null);

  // Náhodné kolo až na klientu (kvůli shodě SSR/hydratace).
  useEffect(() => {
    setRound(pickRound());
  }, []);

  const reset = (idx: number) => {
    setLevelIdx(idx);
    setPieces(LEVELS[idx].pieces);
    setMoves(0);
    setWrongTotal(0);
    setOffset(0);
    setUnlockedId(null);
    setDialogId(null);
    setDrag(null);
    setWon(false);
    setRound(pickRound());
    setHint(HINT_START);
  };

  const commitMove = (id: string, axis: "h" | "v", k: number) => {
    const next = movePiece(pieces, id, axis, k);
    setPieces(next);
    setMoves((m) => m + 1);
    setUnlockedId(null);
    if (isSolved(next)) {
      setWon(true);
      setHint("Oba klíče prošly dírami. Hotovo!");
    } else {
      setHint("Pěkný posun. Na další tah odpověz na otázku jiného kusu.");
    }
  };

  const openDialog = (id: string) => {
    setDialogId(id);
    setInput("");
    setWrong(false);
  };

  const onPiecePointerDown = (e: RPointerEvent<HTMLDivElement>, p: Piece) => {
    if (won || dialogId || !boardEl) return;
    e.preventDefault();
    const px = boardEl.getBoundingClientRect().width / SIZE;
    const sx = e.clientX;
    const sy = e.clientY;
    const unlocked = unlockedId === p.id;
    let moved = false;
    let axis: "h" | "v" | null = null;
    let start = 0;
    let min = 0;
    let max = 0;
    let d = 0;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      if (!moved && Math.max(Math.abs(dx), Math.abs(dy)) > 6) moved = true;
      if (!unlocked || !moved) return;
      if (axis === null) {
        axis = p.axis === "both" ? (Math.abs(dx) > Math.abs(dy) ? "h" : "v") : p.axis;
        const r = axisRange(pieces, p.id, axis);
        min = r.min;
        max = r.max;
        start = axis === "h" ? p.c : p.r;
      }
      const delta = axis === "h" ? dx : dy;
      d = Math.min(Math.max(delta / px, min - start), max - start);
      setDrag({ id: p.id, axis, d });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (!unlocked) {
        if (!moved) openDialog(p.id);
        else setHint("Zamčeno. Nejdřív klikni na kus a odpověz na otázku.");
        return;
      }
      setDrag(null);
      if (axis === null) return;
      const k = Math.min(Math.max(Math.round(start + d), min), max);
      if (k !== start) commitMove(p.id, axis, k);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const dialogIdx = dialogId ? pieces.findIndex((p) => p.id === dialogId) : -1;
  const dialogPiece = dialogIdx >= 0 ? pieces[dialogIdx] : null;
  const dialogQ = round && dialogIdx >= 0 ? questionFor(round, dialogIdx, offset) : null;

  const submit = () => {
    if (!dialogQ || !dialogId) return;
    if (checkAnswer(dialogQ, input)) {
      setUnlockedId(dialogId);
      setOffset((o) => o + 1);
      setDialogId(null);
      setInput("");
      setWrong(false);
      setHint("Správně! Kus se smí posunout jednou. Otázky se otočily.");
    } else {
      setWrong(true);
      setWrongTotal((n) => n + 1);
    }
  };

  const pieceIdx = (id: string) => pieces.findIndex((p) => p.id === id);
  const nonKeyIdx = (idx: number) => pieces.slice(0, idx).filter((p) => !p.key).length;

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Panel: tahy, chyby, reset */}
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex gap-3">
          <Stat label="Tahy" value={moves} />
          <Stat label="Chyby" value={wrongTotal} />
        </div>
        <div className="flex items-center gap-2">
          {round && (
            <span className="pill bg-[var(--accent-yellow)] px-3 py-1 text-xs font-bold text-[#16132b]">
              {round.type === "number" ? "Kolo s čísly" : "Kolo se slovy"}
            </span>
          )}
          <button type="button" onClick={() => reset(levelIdx)} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">
            Restart
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {LEVELS.map((lv, i) => (
          <button
            key={lv.name}
            type="button"
            onClick={() => reset(i)}
            className={`pill border-2 border-[var(--edge)] px-3 py-1.5 text-sm font-semibold transition ${
              i === levelIdx ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            {i + 1}. {lv.name}
          </button>
        ))}
      </div>

      {/* Deska: dřevěný rám 6×6 se dvěma dírami */}
      <div className="mx-auto w-full max-w-md rounded-[24px] border-2 border-[var(--edge)] p-3.5 sm:p-4" style={FRAME}>
        <div ref={setBoardEl} className="relative w-full rounded-lg" style={{ ...BOARD, aspectRatio: "1 / 1" }}>
          {pieces.map((p) => {
            const dragging = drag?.id === p.id;
            const axisPos = dragging ? (drag!.axis === "h" ? p.c : p.r) + drag!.d : undefined;
            const r = dragging && drag!.axis === "v" ? (axisPos as number) : p.r;
            const c = dragging && drag!.axis === "h" ? (axisPos as number) : p.c;
            const { w, h } = bbox(p.shape);
            const unlocked = unlockedId === p.id;
            const idx = pieceIdx(p.id);
            const [light, dark] = p.key ? CHERRY : WOOD[nonKeyIdx(idx) % WOOD.length];
            const q = round && !p.key && dialogIdx !== idx ? questionFor(round, idx, offset) : null;
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={`Kus ${p.id}${unlocked ? ", odemčeno" : ", zamčeno"}`}
                onPointerDown={(e) => onPiecePointerDown(e, p)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !unlocked && !won) {
                    e.preventDefault();
                    openDialog(p.id);
                  }
                }}
                className="touch-none rounded-[8px] outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent-yellow)]"
                style={{
                  position: "absolute",
                  left: `${c * CELL}%`,
                  top: `${r * CELL}%`,
                  width: `${w * CELL}%`,
                  height: `${h * CELL}%`,
                  zIndex: dragging ? 10 : 1,
                  transition: dragging ? "none" : "left .2s ease, top .2s ease",
                  cursor: won ? "default" : unlocked ? "grab" : "pointer",
                }}
              >
                {p.shape.map(([dr, dc]) => (
                  <div
                    key={`${dr},${dc}`}
                    style={{
                      position: "absolute",
                      left: `${(dc / w) * 100}%`,
                      top: `${(dr / h) * 100}%`,
                      width: `${100 / w}%`,
                      height: `${100 / h}%`,
                      padding: 4,
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      className="rounded-[7px] text-[#fff6e6]"
                      style={{
                        width: "100%",
                        height: "100%",
                        background: `${grain(p.axis === "v" ? "v" : "h")}, linear-gradient(135deg, ${light}, ${dark})`,
                        boxShadow: dragging
                          ? "0 14px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.35)"
                          : "0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.25)",
                        outline: unlocked ? "3px solid #ffd76a" : "none",
                        outlineOffset: 1,
                      }}
                    />
                  </div>
                ))}
                {/* popisek uprostřed bboxu */}
                <div
                  className="pointer-events-none font-bold text-[#fff1d6] drop-shadow"
                  style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(10px, 2.6vw, 14px)" }}
                >
                  {p.key ? (
                    <span className="flex items-center gap-1 text-[#ffe2c4] tracking-wide">
                      KLÍČ {p.key === "H" ? "→" : "↓"}
                    </span>
                  ) : (
                    <span className={`flex items-center gap-1 ${unlocked ? "text-[#ffe9a8]" : ""}`}>
                      <Lock open={unlocked} />
                      {q && !unlocked && <span className="opacity-80">{q.type === "number" ? "123" : "abc"}</span>}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* díry: vpravo (řádek H_ROW) a dole (sloupec V_COL) */}
        <Hole style={{ left: "100%", top: `${H_ROW * CELL}%`, width: 14, height: `${CELL}%` }} label="→" />
        <Hole style={{ top: "100%", left: `${V_COL * CELL}%`, height: 14, width: `${CELL}%` }} label="↓" />
      </div>

      <p className="min-h-[3rem] text-center text-sm text-[var(--muted)]" role="status" aria-live="polite">
        {hint}
      </p>

      <div className="flex justify-center">
        <a href={backHref} className="text-sm font-semibold text-[var(--faint)] hover:text-[var(--foreground)]">
          ← Zpět na hry
        </a>
      </div>

      {/* Otázka */}
      {dialogQ && dialogPiece && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unblock-q"
          onKeyDown={(e) => e.key === "Escape" && setDialogId(null)}
        >
          <div className="card w-full max-w-sm p-6">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
              {dialogQ.type === "number" ? "Číselná otázka" : "Slovní otázka"}
            </div>
            <h2 id="unblock-q" className="mb-4 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {dialogQ.prompt}
            </h2>
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
                placeholder={dialogQ.type === "number" ? "napiš číslo" : "napiš slovo"}
                className={`w-full rounded-xl border-2 bg-[var(--surface)] px-3 py-2 text-lg text-[var(--foreground)] outline-none ${
                  wrong ? "border-[#e0533a]" : "border-[var(--edge)]"
                }`}
              />
              {wrong && <p className="mt-2 text-sm font-semibold text-[#e0533a]">Špatně, zkus to znovu.</p>}
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setDialogId(null)} className="btn-bouncy flex-1 border-2 border-[var(--edge)] bg-[var(--surface)] px-4 py-2 font-semibold text-[var(--foreground)]">
                  Zrušit
                </button>
                <button type="submit" className="btn-bouncy flex-1 bg-[var(--brand-500)] px-4 py-2 font-bold text-white">
                  Odpovědět
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Výhra */}
      {won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true">
          <div className="card w-full max-w-sm p-7 text-center">
            <div className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>Vyhráno!</div>
            <p className="mt-2 text-[var(--muted)]">
              {moves} tahů · {wrongTotal} chyb
            </p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => reset(levelIdx)} className="btn-bouncy flex-1 border-2 border-[var(--edge)] bg-[var(--surface)] px-4 py-2 font-semibold text-[var(--foreground)]">
                Znovu
              </button>
              {levelIdx < LEVELS.length - 1 && (
                <button type="button" onClick={() => reset(levelIdx + 1)} className="btn-bouncy flex-1 bg-[var(--accent-yellow)] px-4 py-2 font-bold text-[#16132b]">
                  Další level
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const HINT_START = "Klikni na zamčený kus a odpověz na otázku. Správně = kus se smí posunout. Dostaň oba klíče dírami ven.";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border-2 border-[var(--edge)] bg-[var(--surface-muted)] px-4 py-2 text-center">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{label}</div>
      <div className="text-2xl font-extrabold tabular-nums" style={{ fontFamily: "var(--font-heading)" }}>{value}</div>
    </div>
  );
}

function Hole({ style, label }: { style: CSSProperties; label: string }) {
  return (
    <div
      aria-hidden
      className="absolute flex items-center justify-center rounded-md bg-[#2a1608] text-[10px] text-[#ffd7a0]"
      style={{ position: "absolute", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6)", ...style }}
    >
      {label}
    </div>
  );
}

const FRAME: CSSProperties = {
  background: "linear-gradient(160deg, #6b4423, #3d2412 70%)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,220,160,0.25)",
};
const BOARD: CSSProperties = {
  position: "relative",
  background:
    "repeating-linear-gradient(0deg, rgba(90,50,20,0.06) 0 1px, transparent 1px 11px), linear-gradient(135deg, #d8ad74, #b07d45)",
  boxShadow: "inset 0 4px 12px rgba(40,20,5,0.55), inset 0 0 0 2px #4a2a12",
};
