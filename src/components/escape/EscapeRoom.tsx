"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LabScene } from "./LabScene";
import { PuzzleModal } from "./PuzzleModal";
import { ROOMS } from "@/lib/escape/rewards";
import { computeStars, DANGER_PER_MISTAKE, DANGER_PER_MISTAKE_RELAXED } from "@/lib/escape/score";
import type { Hotspot, Puzzle } from "@/lib/escape/types";
import { getEscapeText } from "@/i18n/escape";
import { getAvatar } from "@/lib/avatars";
import { getTitle } from "@/lib/titles";
import type { Locale } from "@/i18n/config";

type Phase = "mode" | "playing" | "won" | "lost";
type SaveState = "idle" | "saving" | "saved" | "login" | "error";

function shuffleIndices(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const mmss = (total: number) => {
  const s = Math.max(0, total);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function EscapeRoom({ locale, roomId }: { locale: Locale; roomId: string }) {
  const room = ROOMS[roomId];
  const ui = getEscapeText(locale).ui;
  const listHref = `/${locale}/unikovky`;

  const [phase, setPhase] = useState<Phase>("mode");
  const [relaxed, setRelaxed] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [solved, setSolved] = useState<string[]>([]);
  const [opened, setOpened] = useState<string[]>([]);
  const [used, setUsed] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [danger, setDanger] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [puzzleHints, setPuzzleHints] = useState<Record<string, number>>({});
  const [active, setActive] = useState<{ puzzle: Puzzle; layout: number[] } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loseReason, setLoseReason] = useState<"time" | "danger">("time");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saved, setSaved] = useState<{ xp: number; unlocked: string[] } | null>(null);

  const timerRef = useRef<number | null>(null);
  const messageTimerRef = useRef<number | null>(null);
  const secondsRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (messageTimerRef.current) window.clearTimeout(messageTimerRef.current);
    };
  }, []);

  const itemById = (id: string) => room.items.find((i) => i.id === id);

  function stopTimer() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function flash(text: string) {
    setMessage(text);
    if (messageTimerRef.current) window.clearTimeout(messageTimerRef.current);
    messageTimerRef.current = window.setTimeout(() => setMessage(null), 7000);
  }

  function addItems(ids: string[]) {
    setInventory((inv) => [...inv, ...ids.filter((id) => !inv.includes(id))]);
  }

  function startGame(relaxedMode: boolean) {
    setRelaxed(relaxedMode);
    setSeconds(0);
    secondsRef.current = 0;
    setInventory([]);
    setSolved([]);
    setOpened([]);
    setUsed([]);
    setSelected(null);
    setDanger(0);
    setMistakes(0);
    setHints(0);
    setPuzzleHints({});
    setActive(null);
    setMessage(null);
    setSaveState("idle");
    setSaved(null);
    setPhase("playing");
    stopTimer();
    timerRef.current = window.setInterval(() => {
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
      if (!relaxedMode && secondsRef.current >= room.timeLimitSeconds) lose("time");
    }, 1000);
  }

  function lose(reason: "time" | "danger") {
    stopTimer();
    setActive(null);
    setLoseReason(reason);
    setPhase("lost");
  }

  async function saveResult(sec: number, mist: number, hnt: number) {
    setSaveState("saving");
    try {
      const res = await fetch("/api/unikovky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: roomId, seconds: sec, mistakes: mist, hints: hnt, relaxed }),
      });
      if (res.status === 401) {
        setSaveState("login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error();
      setSaved({ xp: data.xpGained, unlocked: data.unlocked ?? [] });
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function win() {
    stopTimer();
    setPhase("won");
    saveResult(secondsRef.current, mistakes, hints);
  }

  function openPuzzle(id: string) {
    const puzzle = room.puzzles.find((p) => p.id === id);
    if (!puzzle) return;
    const layout =
      puzzle.type === "order"
        ? shuffleIndices(puzzle.items.length)
        : puzzle.type === "match"
          ? shuffleIndices(puzzle.pairs.length)
          : [];
    setActive({ puzzle, layout });
  }

  function handleHotspot(h: Hotspot) {
    if (phase !== "playing" || active) return;

    if (h.kind === "examine") {
      flash(h.message);
      return;
    }

    if (h.kind === "robot") {
      const nextId = room.order.find((id) => !solved.includes(id));
      const puzzle = nextId ? room.puzzles.find((p) => p.id === nextId) : undefined;
      if (!nextId || !puzzle) {
        flash(`${ui.atomLabel}: ${ui.atomDone}`);
        return;
      }
      const level = puzzleHints[nextId] ?? 0;
      if (level >= 3) {
        flash(`${ui.atomLabel}: ${puzzle.hints[2]}`);
        return;
      }
      setPuzzleHints((prev) => ({ ...prev, [nextId]: level + 1 }));
      setHints((n) => n + 1);
      flash(`${ui.atomLabel}: ${puzzle.hints[level]}`);
      return;
    }

    if (h.kind === "use") {
      if (used.includes(h.id)) {
        flash(ui.nothingHere);
        return;
      }
      if (selected === h.item) {
        setUsed((u) => [...u, h.id]);
        setInventory((inv) => inv.filter((x) => x !== h.item));
        addItems(h.rewardItems);
        setSelected(null);
        flash(`${h.message} ${ui.gotItems}: ${h.rewardItems.map((id) => itemById(id)?.name).join(", ")}.`);
      } else {
        flash(h.lockedMessage);
      }
      return;
    }

    if (solved.includes(h.puzzleId)) {
      flash(ui.solved);
      return;
    }
    if (h.requiresSolved && !solved.includes(h.requiresSolved)) {
      flash(h.lockedMessage);
      return;
    }
    if (h.requiresItem && !opened.includes(h.id)) {
      if (selected === h.requiresItem) {
        setOpened((o) => [...o, h.id]);
      } else {
        flash(h.lockedMessage);
        return;
      }
    }
    openPuzzle(h.puzzleId);
  }

  function handleSolved(puzzle: Puzzle) {
    const hotspot = room.hotspots.find((h) => h.kind === "puzzle" && h.puzzleId === puzzle.id);
    setSolved((s) => [...s, puzzle.id]);
    setActive(null);
    if (hotspot && hotspot.kind === "puzzle" && hotspot.requiresItem) {
      const spent = hotspot.requiresItem;
      setInventory((inv) => inv.filter((x) => x !== spent));
      setSelected(null);
    }
    const reward = puzzle.rewardItems ?? [];
    addItems(reward);
    flash(
      `${puzzle.rewardMessage}${reward.length ? ` ${ui.gotItems}: ${reward.map((id) => itemById(id)?.name).join(", ")}.` : ""}`,
    );
    if (puzzle.id === "door") win();
  }

  function handleWrong() {
    const step = relaxed ? DANGER_PER_MISTAKE_RELAXED : DANGER_PER_MISTAKE;
    const next = Math.min(100, danger + step);
    setDanger(next);
    setMistakes((m) => m + 1);
    if (!relaxed && next >= 100) lose("danger");
  }

  function handleHint(puzzle: Puzzle) {
    const level = puzzleHints[puzzle.id] ?? 0;
    if (level >= 3) return;
    setPuzzleHints((prev) => ({ ...prev, [puzzle.id]: level + 1 }));
    setHints((n) => n + 1);
  }

  function handleInventory(id: string) {
    if (phase !== "playing") return;
    if (selected === null) {
      setSelected(id);
      return;
    }
    if (selected === id) {
      setSelected(null);
      return;
    }
    const recipe = room.recipes.find(
      (r) => (r.a === selected && r.b === id) || (r.a === id && r.b === selected),
    );
    if (recipe) {
      const first = selected;
      setInventory((inv) => [...inv.filter((x) => x !== first && x !== id), recipe.result]);
      setSelected(null);
      flash(recipe.message);
    } else {
      flash(ui.cantCombine);
      setSelected(id);
    }
  }

  const stars = computeStars({
    seconds,
    mistakes,
    hints,
    relaxed,
    limitSeconds: room.timeLimitSeconds,
  });

  const notes = inventory.map((id) => itemById(id)).filter((i) => i?.note);

  if (phase === "mode") {
    return (
      <div className="card flex flex-col gap-6 p-6">
        <p className="max-w-2xl text-[var(--muted)]">{room.intro}</p>
        <div>
          <h2 className="mb-3 text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {ui.modeTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => startGame(false)}
              className="card card-hover p-5 text-left"
            >
              <span className="block text-lg font-bold">{ui.timed}</span>
              <span className="text-sm text-[var(--muted)]">{ui.timedDesc}</span>
            </button>
            <button
              onClick={() => startGame(true)}
              className="card card-hover p-5 text-left"
            >
              <span className="block text-lg font-bold">{ui.relaxed}</span>
              <span className="text-sm text-[var(--muted)]">{ui.relaxedDesc}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "won" || phase === "lost") {
    const won = phase === "won";
    return (
      <div className="card flex flex-col items-start gap-5 p-6">
        <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {won ? ui.winTitle : loseReason === "time" ? ui.loseTime : ui.loseDanger}
        </h2>
        <p className="max-w-2xl text-[var(--muted)]">{won ? room.winMessage : ui.loseText}</p>

        {won && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                {ui.stars}
              </span>
              <span className="text-3xl tracking-widest text-[var(--accent-yellow)]" aria-label={`${stars}/3`}>
                {"★".repeat(stars)}
                <span className="text-[var(--border-soft)]">{"★".repeat(3 - stars)}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-sm font-semibold">
              <span className="pill bg-[var(--surface-muted)] px-3 py-1.5">
                {ui.timeUsed}: {mmss(seconds)}
              </span>
              <span className="pill bg-[var(--surface-muted)] px-3 py-1.5">
                {ui.mistakes}: {mistakes}
              </span>
              <span className="pill bg-[var(--surface-muted)] px-3 py-1.5">
                {ui.hintsUsed}: {hints}
              </span>
              {saved && saved.xp > 0 && (
                <span className="pill bg-[var(--accent-yellow)] px-3 py-1.5 text-[#16132b]">
                  +{saved.xp} {ui.xp}
                </span>
              )}
            </div>
            {saved && saved.unlocked.length > 0 && (
              <div className="rounded-xl bg-[var(--brand-50)] px-4 py-3 text-sm">
                <p className="mb-1 font-bold">{ui.unlocked}</p>
                <ul className="list-inside list-disc">
                  {saved.unlocked.map((key) => {
                    const [kind, id] = key.split(":");
                    const name =
                      kind === "avatar" ? getAvatar(id).names[locale] : getTitle(id)?.names[locale] ?? id;
                    return <li key={key}>{name}</li>;
                  })}
                </ul>
              </div>
            )}
            {saveState === "login" && (
              <p className="text-sm text-[var(--muted)]">
                {ui.loginToSave}{" "}
                <Link href={`/${locale}/prihlaseni`} className="font-semibold text-[var(--brand-600)] hover:underline">
                  →
                </Link>
              </p>
            )}
            {saveState === "error" && <p className="text-sm text-[var(--danger)]">{ui.saveError}</p>}
          </>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setPhase("mode")}
            className="btn-bouncy bg-[var(--brand-500)] px-6 py-3 text-sm font-bold text-white"
          >
            {ui.playAgain}
          </button>
          <Link href={listHref} className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
            ← {ui.backToRooms}
          </Link>
        </div>
      </div>
    );
  }

  const remaining = room.timeLimitSeconds - seconds;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="pill bg-[var(--surface)] px-3 py-1.5 text-sm">
          {relaxed ? ui.elapsed : ui.time}: <span className="ml-1 font-bold tabular-nums">{mmss(relaxed ? seconds : remaining)}</span>
        </div>
        <div className="flex min-w-48 flex-1 items-center gap-3 text-sm font-semibold">
          <span>{ui.danger}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
            <div
              className="h-full transition-all"
              style={{
                width: `${danger}%`,
                background: danger < 50 ? "var(--accent-green)" : danger < 80 ? "var(--accent-yellow)" : "var(--danger)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-3">
          <div className="card overflow-hidden p-0">
            <LabScene
              hotspots={room.hotspots}
              solved={solved}
              used={used}
              danger={danger}
              selectedItem={selected}
              onHotspot={handleHotspot}
            />
          </div>
          <div className="min-h-14 rounded-xl bg-[var(--surface-muted)] px-4 py-3 text-sm" aria-live="polite">
            {message ?? <span className="text-[var(--faint)]">{ui.combineHint}</span>}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="card p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
              {ui.inventory}
            </h3>
            {inventory.length === 0 ? (
              <p className="text-sm text-[var(--faint)]">{ui.inventoryEmpty}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {inventory.map((id) => {
                  const item = itemById(id);
                  if (!item) return null;
                  const isSelected = selected === id;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => handleInventory(id)}
                        title={item.description}
                        className={`flex w-full items-center gap-3 rounded-lg border-2 px-3 py-2 text-left text-sm font-semibold ${
                          isSelected
                            ? "border-[var(--brand-500)] bg-[var(--brand-50)]"
                            : "border-[var(--edge)] bg-[var(--surface)] hover:bg-[var(--surface-muted)]"
                        }`}
                      >
                        <span className="text-xl">{item.symbol}</span>
                        <span className="flex-1">{item.name}</span>
                        {isSelected && <span className="text-xs text-[var(--brand-600)]">{ui.selected}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {notes.length > 0 && (
            <section className="card p-4">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
                {ui.notes}
              </h3>
              <ul className="flex flex-col gap-2 text-sm">
                {notes.map((item) => (
                  <li key={item!.id} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2">
                    <span className="font-bold">{item!.name}: </span>
                    {item!.note}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      {active && (
        <PuzzleModal
          key={active.puzzle.id}
          puzzle={active.puzzle}
          layout={active.layout}
          ui={ui}
          hintsShown={puzzleHints[active.puzzle.id] ?? 0}
          onHint={() => handleHint(active.puzzle)}
          onSolved={() => handleSolved(active.puzzle)}
          onWrong={handleWrong}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
