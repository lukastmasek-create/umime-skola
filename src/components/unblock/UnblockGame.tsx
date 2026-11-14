"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { LEVELS } from "@/lib/unblock/levels";
import { SIZE, H_ROW, V_COL, axisRange, bbox, isSolved, movePiece, type Piece } from "@/lib/unblock/logic";
import { checkAnswer, pickRound, questionFor, type Question, type Round } from "@/lib/unblock/questions";

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
const HINT_START = "Klikni na zamčený kus a odpověz na otázku. Správně = kus se smí posunout. Dostaň oba klíče dírami ven.";

// Ukázka: přesné řešení levelu 1 (H doprava ven, pak V dolů ven). Každý krok jde přes stejnou logiku jako hráč.
const DEMO: { id: string; axis: "h" | "v"; to: number; text: string }[] = [
  { id: "H", axis: "h", to: 6, text: "Kus H (klíč →) — odpověz na jeho otázku a posuň ho doprava ven dírou." },
  { id: "V", axis: "v", to: 6, text: "Kus V (klíč ↓) — odpověz a posuň ho dolů ven dírou. Oba klíče venku = výhra." },
];

function Lock({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2" fill="currentColor" stroke="none" opacity="0.9" />
      <path d={open ? "M8 11V7a4 4 0 0 1 8 0" : "M8 11V7a4 4 0 0 1 8 0v4"} />
    </svg>
  );
}

/** Jeden kus jako jedno spojené těleso: buňky bez mezer, hranice jen vně tvaru. */
function PieceBody({ id, shape, w, h, light, dark, shadow }: { id: string; shape: Piece["shape"]; w: number; h: number; light: string; dark: string; shadow: string }) {
  const set = new Set(shape.map(([r, c]) => `${r},${c}`));
  const has = (r: number, c: number) => set.has(`${r},${c}`);
  const edges: [number, number, number, number][] = [];
  for (const [r, c] of shape) {
    if (!has(r - 1, c)) edges.push([c, r, c + 1, r]);
    if (!has(r + 1, c)) edges.push([c, r + 1, c + 1, r + 1]);
    if (!has(r, c - 1)) edges.push([c, r, c, r + 1]);
    if (!has(r, c + 1)) edges.push([c + 1, r, c + 1, r + 1]);
  }
  const gid = `g-${id}`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", filter: `drop-shadow(0 ${shadow} rgba(0,0,0,0.38))` }}
    >
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2={h}>
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      {shape.map(([r, c]) => (
        <rect key={`${r},${c}`} x={c} y={r} width={1} height={1} fill={`url(#${gid})`} />
      ))}
      <g stroke="#3a1e0c" strokeOpacity={0.75} strokeWidth={0.06} strokeLinecap="square">
        {edges.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
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
  const [showAnswers, setShowAnswers] = useState(false);
  const [demoOn, setDemoOn] = useState(false);
  const [boardEl, setBoardEl] = useState<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  // Náhodné kolo až na klientu (kvůli shodě SSR/hydratace).
  useEffect(() => {
    setRound(pickRound());
  }, []);

  const reset = (idx: number, r: Round = pickRound()) => {
    clearTimers();
    setDemoOn(false);
    setLevelIdx(idx);
    setPieces(LEVELS[idx].pieces);
    setMoves(0);
    setWrongTotal(0);
    setOffset(0);
    setUnlockedId(null);
    setDialogId(null);
    setInput("");
    setDrag(null);
    setWon(false);
    setRound(r);
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
    if (won || dialogId || demoOn || !boardEl) return;
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

  /** Ukázka: stejné kroky jako hráč (otevřít otázku → napsat odpověď → odeslat → posun), s časováním. */
  const runDemo = () => {
    clearTimers();
    const r = pickRound();
    reset(0, r);
    setDemoOn(true);
    let t = 600;
    let off = 0;
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

    DEMO.forEach((step, i) => {
      const idx = LEVELS[0].pieces.findIndex((p) => p.id === step.id);
      const q: Question = questionFor(r, idx, off);
      at(t, () => {
        setDialogId(step.id);
        setInput("");
        setWrong(false);
        setHint(`Ukázka ${i + 1}/${DEMO.length}: ${step.text}`);
      });
      t += 900;
      [...q.answer].forEach((_, j) => {
        at(t, () => setInput(q.answer.slice(0, j + 1)));
        t += 160;
      });
      t += 500;
      const off0 = off;
      at(t, () => {
        setUnlockedId(step.id);
        setOffset(off0 + 1);
        setDialogId(null);
        setInput("");
        setHint("Správně! Kus je odemčený — posouvám ho.");
      });
      off += 1;
      t += 700;
      at(t, () => {
        setPieces((prev) => movePiece(prev, step.id, step.axis, step.to));
        setMoves((m) => m + 1);
        setUnlockedId(null);
      });
      t += 900;
    });
    at(t, () => {
      setDemoOn(false);
      setWon(true);
      setHint("Ukázka hotová. Teď zkus level sám.");
    });
  };

  const pieceIdx = (id: string) => pieces.findIndex((p) => p.id === id);
  const nonKeyIdx = (idx: number) => pieces.slice(0, idx).filter((p) => !p.key).length;
  const revealed = showAnswers || demoOn;

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Panel: tahy, chyby, ovládání */}
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex gap-3">
          <Stat label="Tahy" value={moves} />
          <Stat label="Chyby" value={wrongTotal} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {round && (
            <span className="pill bg-[var(--accent-yellow)] px-3 py-1 text-xs font-bold text-[#16132b]">
              {round.type === "number" ? "Kolo s čísly" : "Kolo se slovy"}
            </span>
          )}
          <button type="button" disabled={demoOn} onClick={runDemo} className="btn-bouncy bg-[var(--accent-green)] px-4 py-2.5 text-sm font-bold text-[#16132b] disabled:opacity-50">
            ▶ Ukázka
          </button>
          <button type="button" onClick={() => setShowAnswers((s) => !s)} className="btn-bouncy border-2 border-[var(--edge)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]">
            {showAnswers ? "Skrýt odpovědi" : "Ukázat odpovědi"}
          </button>
          <button type="button" onClick={() => reset(levelIdx)} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2.5 text-sm font-bold text-white">
            Restart
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {LEVELS.map((lv, i) => (
          <button
            key={lv.name}
            type="button"
            disabled={demoOn}
            onClick={() => reset(i)}
            className={`pill border-2 border-[var(--edge)] px-3 py-1.5 text-sm font-semibold transition ${
              i === levelIdx ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            {i + 1}. {lv.name}
          </button>
        ))}
      </div>

      {/* Otázky nad deskou (a odpovědi, když je zapnuté zobrazení) */}
      {round && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {pieces.map((p, idx) => {
            const q = questionFor(round, idx, offset);
            const unlocked = unlockedId === p.id;
            const active = demoOn && dialogId === p.id;
            return (
              <div
                key={p.id}
                className={`flex items-start justify-between gap-3 rounded-xl border-2 px-3 py-2 text-sm ${
                  active ? "border-[var(--accent-yellow)] bg-[var(--surface-muted)]" : "border-[var(--edge)] bg-[var(--surface)]"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                    {p.key ? `Klíč ${p.key === "H" ? "→" : "↓"}` : `Kus ${p.id}`} · {unlocked ? "odemčeno" : "zamčeno"}
                  </div>
                  <div className="font-semibold">{q.prompt}</div>
                </div>
                {revealed && (
                  <div className="shrink-0 rounded-lg bg-[#16132b] px-2 py-1 font-mono font-bold text-[var(--accent-yellow)]">
                    {q.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Deska: dřevěný rám 6×6 se dvěma dírami */}
      <div className="mx-auto w-full max-w-md rounded-[24px] border-2 border-[var(--edge)] p-3.5 sm:p-4" style={FRAME}>
        <div ref={setBoardEl} className="relative w-full rounded-lg" style={{ ...BOARD, aspectRatio: "1 / 1" }}>
          {pieces.map((p) => {
            const dragging = drag?.id === p.id;
            const pos = dragging ? (drag!.axis === "h" ? p.c : p.r) + drag!.d : undefined;
            const r = dragging && drag!.axis === "v" ? (pos as number) : p.r;
            const c = dragging && drag!.axis === "h" ? (pos as number) : p.c;
            const { w, h } = bbox(p.shape);
            const unlocked = unlockedId === p.id;
            const idx = pieceIdx(p.id);
            const [light, dark] = p.key ? CHERRY : WOOD[nonKeyIdx(idx) % WOOD.length];
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={`Kus ${p.id}${unlocked ? ", odemčeno" : ", zamčeno"}`}
                onPointerDown={(e) => onPiecePointerDown(e, p)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !unlocked && !won && !demoOn) {
                    e.preventDefault();
                    openDialog(p.id);
                  }
                }}
                className="touch-none outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent-yellow)]"
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
                <PieceBody
                  id={p.id}
                  shape={p.shape}
                  w={w}
                  h={h}
                  light={light}
                  dark={dark}
                  shadow={dragging ? "14px" : "4px"}
                />
                {unlocked && (
                  <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 0 3px #ffd76a", borderRadius: 4 }} />
                )}
                <div
                  className="pointer-events-none font-bold text-[#fff1d6] drop-shadow"
                  style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(10px, 2.6vw, 14px)" }}
                >
                  {p.key ? (
                    <span className="tracking-wide text-[#ffe2c4]">KLÍČ {p.key === "H" ? "→" : "↓"}</span>
                  ) : (
                    <span className={unlocked ? "text-[#ffe9a8]" : ""}>
                      <Lock open={unlocked} />
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
          onKeyDown={(e) => e.key === "Escape" && !demoOn && setDialogId(null)}
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
                if (!demoOn) submit();
              }}
            >
              <input
                autoFocus
                readOnly={demoOn}
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
                <button type="button" disabled={demoOn} onClick={() => setDialogId(null)} className="btn-bouncy flex-1 border-2 border-[var(--edge)] bg-[var(--surface)] px-4 py-2 font-semibold text-[var(--foreground)] disabled:opacity-50">
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
      className="flex items-center justify-center rounded-md bg-[#2a1608] text-[10px] text-[#ffd7a0]"
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
