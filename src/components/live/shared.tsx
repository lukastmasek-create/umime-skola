"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { livesLeft } from "@/lib/live/logic";
import type { LiveMode, PlayerRow } from "@/lib/live/types";

// Čtyři barvy a tvary možností jako v kvízech: poznají se i bez barev.
export const OPTION_STYLES = [
  { bg: "#ff5a3c", fg: "#ffffff", shape: "▲" },
  { bg: "#29a3ff", fg: "#10213a", shape: "◆" },
  { bg: "#ffc933", fg: "#16132b", shape: "●" },
  { bg: "#17a864", fg: "#ffffff", shape: "■" },
] as const;

export function OptionButton({
  index,
  label,
  onClick,
  disabled,
  state,
  count,
}: {
  index: number;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Při odhalení: správná možnost zůstane svítit, ostatní zbledne. */
  state?: "correct" | "wrong" | "chosen" | "dim" | null;
  count?: number;
}) {
  const s = OPTION_STYLES[index % 4];
  const dim = state === "dim" || state === "wrong";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === "chosen"}
      className="btn-bouncy relative flex min-h-20 w-full items-center gap-3 px-4 py-3 text-left text-base font-bold disabled:cursor-default sm:min-h-24 sm:text-lg"
      style={{
        background: s.bg,
        color: s.fg,
        opacity: dim ? 0.35 : 1,
        outline: state === "correct" ? "4px solid var(--foreground)" : state === "chosen" ? "4px dashed var(--foreground)" : undefined,
        outlineOffset: 2,
      }}
    >
      <span aria-hidden className="text-2xl">
        {s.shape}
      </span>
      <span className="min-w-0 flex-1 break-words">{label}</span>
      {state === "correct" && <span aria-hidden className="text-2xl">✓</span>}
      {typeof count === "number" && (
        <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-sm font-extrabold text-white">{count}</span>
      )}
    </button>
  );
}

/** Odpočet s ubývajícím pruhem; čas serveru dostává funkcí, aby se hodiny prohlížeče nemusely shodovat. */
export function Countdown({ startedAt, seconds, now, label }: { startedAt: number; seconds: number; now: () => number; label?: string }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 100);
    return () => clearInterval(id);
  }, []);
  void t;
  const left = Math.max(0, startedAt + seconds * 1000 - now());
  const pct = Math.min(100, (left / (seconds * 1000)) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="h-4 flex-1 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]" role="progressbar" aria-valuemin={0} aria-valuemax={seconds} aria-valuenow={Math.ceil(left / 1000)}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 30 ? "var(--accent-green)" : "var(--accent-500)", transition: "width 0.1s linear" }} />
      </div>
      <span className="w-14 text-right font-mono text-lg font-extrabold tabular-nums">
        {label ? `${label} ` : ""}
        {Math.ceil(left / 1000)}
      </span>
    </div>
  );
}

export function EndsIn({ endsAt, now, label }: { endsAt: number; now: () => number; label: string }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 500);
    return () => clearInterval(id);
  }, []);
  void t;
  const left = Math.max(0, Math.ceil((endsAt - now()) / 1000));
  const m = Math.floor(left / 60);
  const s = String(left % 60).padStart(2, "0");
  return (
    <span className="pill bg-[var(--accent-yellow)] px-3 py-1 text-sm text-[#16132b]">
      {label} {m}:{s}
    </span>
  );
}

export function metricOf(mode: LiveMode, p: PlayerRow, lives = 0): number {
  return mode === "GOLD" ? p.gold : mode === "RACE" ? p.progress : mode === "SURVIVAL" ? livesLeft(lives, p.progress) : p.score;
}

// Barvy týmů se liší i tvarem, aby se daly rozeznat bez barev.
export const TEAM_STYLES = [
  { color: "#ff5a3c", shape: "▲" },
  { color: "#29a3ff", shape: "●" },
] as const;

/** Součty bodů obou týmů jako dva pruhy. */
export function TeamScores({ teams, names, meTeam }: { teams: { score: number; players: number }[]; names: [string, string]; meTeam?: 0 | 1 }) {
  const max = Math.max(1, ...teams.map((x) => x.score));
  return (
    <div className="flex flex-col gap-2">
      {teams.map((team, i) => (
        <div key={i} className={`relative overflow-hidden rounded-xl border-2 px-3 py-2 ${meTeam === i ? "border-[var(--foreground)]" : "border-[var(--border-soft)]"} bg-[var(--surface)]`}>
          <span aria-hidden className="absolute inset-y-0 left-0 opacity-30" style={{ width: `${(team.score / max) * 100}%`, background: TEAM_STYLES[i].color, transition: "width 0.5s ease" }} />
          <span className="relative flex items-center justify-between gap-3 font-bold">
            <span>
              <span aria-hidden style={{ color: TEAM_STYLES[i].color }}>{TEAM_STYLES[i].shape}</span> {names[i]} <span className="text-xs font-semibold text-[var(--muted)]">({team.players})</span>
            </span>
            <span className="font-mono text-lg font-extrabold tabular-nums">{team.score}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function Leaderboard({
  mode,
  rows,
  meId,
  limit,
  raceTarget,
  lives,
  teamNames,
  unit,
}: {
  mode: LiveMode;
  rows: PlayerRow[];
  meId?: string;
  limit?: number;
  raceTarget?: number;
  /** Přežití: počet životů na začátku. */
  lives?: number;
  /** Týmový mód: názvy týmů pro čtečky obrazovky. */
  teamNames?: [string, string];
  unit: string;
}) {
  const shown = limit ? rows.slice(0, limit) : rows;
  const max = mode === "SURVIVAL" ? Math.max(1, lives ?? 1) : Math.max(1, ...shown.map((p) => metricOf(mode, p)));
  return (
    <ol className="flex flex-col gap-2">
      {shown.map((p, i) => {
        const value = metricOf(mode, p, lives);
        const pct = mode === "RACE" && raceTarget ? (value / raceTarget) * 100 : (value / max) * 100;
        return (
          <li
            key={p.id}
            className={`relative flex items-center gap-3 overflow-hidden rounded-xl border-2 px-3 py-2 ${p.id === meId ? "border-[var(--brand-500)]" : "border-[var(--border-soft)]"} bg-[var(--surface)]`}
          >
            <span aria-hidden className="absolute inset-y-0 left-0 opacity-20" style={{ width: `${Math.min(100, pct)}%`, background: "var(--brand-500)", transition: "width 0.5s ease" }} />
            <span className="relative w-6 text-center font-extrabold tabular-nums">{i + 1}</span>
            <span className="relative">
              <Avatar id={p.avatar} size={32} />
            </span>
            <span className={`relative min-w-0 flex-1 truncate font-bold ${mode === "SURVIVAL" && value === 0 ? "line-through opacity-60" : ""}`}>
              {p.team !== undefined && (
                <span role="img" aria-label={teamNames?.[p.team]} style={{ color: TEAM_STYLES[p.team].color }} className="mr-1">
                  {TEAM_STYLES[p.team].shape}
                </span>
              )}
              {p.name}
            </span>
            <span className="relative font-mono font-extrabold tabular-nums">
              {value} <span className="text-xs font-semibold text-[var(--muted)]">{unit}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
