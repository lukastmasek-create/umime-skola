"use client";

import Link from "next/link";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Podium } from "@/components/Podium";
import { fmt, type LiveText } from "@/i18n/live";
import { tr8, type Locale } from "@/i18n/config";
import type { LiveView } from "@/lib/live/types";
import { liveApi, type Identity } from "./api";
import { errorText } from "./LiveRoom";
import { isSyncMode } from "@/lib/live/logic";
import { Countdown, EndsIn, Leaderboard, OptionButton, TeamScores } from "./shared";

const lockLabel = tr8("Zamknout připojování", "Lock joining", "Beitritt sperren", "Закрыть вход", "Закрити вхід", "参加をロック", "Cerrar el acceso", "Fermer les inscriptions");
const unlockLabel = tr8("Povolit připojování", "Allow joining", "Beitritt erlauben", "Открыть вход", "Відкрити вхід", "参加を許可", "Permitir el acceso", "Ouvrir les inscriptions");

export function HostView({
  locale,
  t,
  view,
  identity,
  serverNow,
}: {
  locale: Locale;
  t: LiveText;
  view: LiveView;
  identity: Identity;
  serverNow: () => number;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = view.settings.joinLocked === true;
  const [copied, setCopied] = useState(false);
  const unit = view.mode === "GOLD" ? t.end.gold : view.mode === "RACE" ? t.end.progress : view.mode === "SURVIVAL" ? t.end.lives : t.end.score;
  const teamNames = t.play.teamNames;
  const teams = view.teams && <TeamScores teams={view.teams} names={teamNames} />;
  const boardProps = { mode: view.mode, rows: view.leaderboard, unit, raceTarget: view.settings.raceTarget, lives: view.settings.lives, teamNames };

  async function control(action: "next" | "end" | "lock" | "unlock") {
    if (action === "end" && !window.confirm(t.play.confirmEnd)) return;
    setBusy(true);
    const r = await liveApi(`/rooms/${view.pin}/control`, { body: { action }, identity });
    setBusy(false);
    setError(r.ok ? null : r.error);
  }

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/${locale}/hrat-spolecne/${view.pin}` : "";
  const modeName = t.create.modes[view.mode].name;

  const header = (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold sm:text-2xl" style={{ fontFamily: "var(--font-heading)" }}>
          {view.title}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {modeName} · {t.lobby.players}: {view.counts.players}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="pill bg-[var(--surface)] px-3 py-1 font-mono text-sm">{view.pin}</span>
        {view.status !== "ENDED" && view.status !== "LOBBY" && (
          <button type="button" onClick={() => control("end")} disabled={busy} className="btn-bouncy bg-[var(--surface)] px-3 py-1.5 text-sm font-bold">
            {t.play.endGame}
          </button>
        )}
      </div>
    </div>
  );

  const err = error && (
    <p role="alert" className="mb-3 text-sm font-semibold text-[var(--danger)]">
      {errorText(t, error)}
    </p>
  );

  // --- Čekárna ---
  if (view.status === "LOBBY") {
    return (
      <div className="refresh-host-lobby">
        <div className="card refresh-host-invite flex flex-col items-center gap-3 p-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
<img src={`/arena/emblem-${view.mode.toLowerCase()}.webp`} alt="" width={120} height={120} decoding="async" className="arena-emblem" />
          <p className="text-sm font-semibold text-[var(--muted)]">{fmt(t.lobby.share, { site: typeof window !== "undefined" ? window.location.host : "" })}</p>
          <p className="refresh-room-pin font-mono font-extrabold" aria-label={view.pin.split("").join(" ")}>
            {view.pin}
          </p>
          {joinUrl && (
            <a href={joinUrl} className="refresh-room-qr" aria-label={t.join.title}>
              <QRCodeSVG value={joinUrl} title={t.join.title} size={112} marginSize={4} level="M" />
            </a>
          )}
          <button
            type="button"
            className="btn-bouncy btn-secondary min-h-11 px-4 text-sm font-bold"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(joinUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {}
            }}
          >
            {copied ? t.lobby.copied : t.lobby.copyLink}
          </button>
          <p className="text-sm text-[var(--muted)]">
            {view.title} · {modeName} · {fmt(t.lobby.questions, { n: view.total })}
          </p>
        </div>
        <div className="card refresh-host-roster flex flex-col gap-4 p-5">
          <h2 className="text-lg font-bold">
            {t.lobby.players} ({view.counts.players})
          </h2>
          {view.leaderboard.length === 0 ? (
            <p className="text-[var(--muted)]">{t.lobby.waiting}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {view.leaderboard.map((p) => (
                <li key={p.id} className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm">
                  {p.name}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto grid gap-3">
            {err}
            <button type="button" disabled={busy} onClick={() => control(locked ? "unlock" : "lock")} className="btn-bouncy btn-secondary min-h-11 px-4 text-sm font-bold">
              {locked ? unlockLabel[locale] : lockLabel[locale]}
            </button>
            <button type="button" onClick={() => control("next")} disabled={busy || view.counts.players === 0} className="btn-bouncy btn-primary btn-lg disabled:opacity-50">
              <span aria-hidden>▶ </span>{t.lobby.start}
            </button>
            {view.counts.players === 0 && <p className="text-center text-sm text-[var(--muted)]">{t.lobby.needPlayers}</p>}
          </div>
        </div>
      </div>
    );
  }

  // --- Konec ---
  if (view.status === "ENDED") {
    const top = view.leaderboard.slice(0, 3);
    return (
      <div className="flex flex-col gap-6">
        {header}
        <div className="card flex flex-col items-center gap-2 p-6 text-center">
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {t.end.title}
          </h2>
          {top[0] && (
            <p className="text-lg">
              {t.end.winner}: <strong>{top[0].name}</strong>
            </p>
          )}
          {top.length > 0 && <Podium players={top} anonymous="" />}
        </div>
        {view.teams && (
          <div className="card flex flex-col gap-2 p-5">
            {view.teams[0].score !== view.teams[1].score && (
              <p className="text-center text-lg font-bold">{fmt(t.play.teamWins, { name: teamNames[view.teams[0].score > view.teams[1].score ? 0 : 1] })}</p>
            )}
            {teams}
          </div>
        )}
        <div className="card p-5">
          <Leaderboard {...boardProps} />
        </div>
        <Link href={`/${locale}/hrat-spolecne/nova`} className="btn-bouncy btn-primary btn-lg self-center">
          {t.end.newGame}
        </Link>
      </div>
    );
  }

  // --- Klasický kvíz ---
  if (isSyncMode(view.mode) && view.question) {
    const q = view.question;
    const reveal = view.status === "REVEAL";
    const last = q.index + 1 >= view.total;
    return (
      <div className="flex flex-col gap-4">
        {header}
        <div className="card flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between text-sm font-semibold text-[var(--muted)]">
            <span>{fmt(t.play.questionOf, { n: q.index + 1, total: view.total })}</span>
            <span>{fmt(t.play.answered, { n: view.counts.answered, total: view.counts.players })}</span>
          </div>
          <h2 className="text-2xl font-bold leading-snug sm:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
            {q.prompt}
          </h2>
          {!reveal && q.startedAt !== null && q.seconds !== null && <Countdown startedAt={q.startedAt} seconds={q.seconds} now={serverNow} />}
          <div className="grid gap-3 sm:grid-cols-2">
            {q.options.map((o, i) => (
              <OptionButton
                key={i}
                index={i}
                label={o}
                disabled
                count={reveal ? view.distribution?.[i] : undefined}
                state={reveal ? (i === q.correctIndex ? "correct" : "dim") : null}
              />
            ))}
          </div>
          {reveal && q.explanation && <p className="rounded-xl bg-[var(--surface-muted)] p-3 text-sm">{q.explanation}</p>}
        </div>
        {teams && <div className="card p-5">{teams}</div>}
        {reveal && (
          <div className="card p-5">
            <h3 className="mb-2 font-bold">{t.lobby.players}</h3>
            <Leaderboard {...boardProps} limit={view.mode === "SURVIVAL" ? undefined : 5} />
          </div>
        )}
        {err}
        <button type="button" onClick={() => control("next")} disabled={busy} className="btn-bouncy btn-primary btn-lg self-center">
          {reveal ? (last ? t.play.finish : t.play.nextQuestion) : t.play.showAnswer}
        </button>
      </div>
    );
  }

  // --- Závod, Zlatá horečka a Série: učitel sleduje průběh ---
  return (
    <div className="flex flex-col gap-4">
      {header}
      <div className="card flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">{view.mode === "RACE" ? t.play.race : view.mode === "STREAK" ? t.play.streakMode : t.play.gold}</h2>
          {view.endsAt && <EndsIn endsAt={view.endsAt} now={serverNow} label={t.play.timeLeft} />}
        </div>
        {view.mode === "RACE" && <p className="text-sm text-[var(--muted)]">🏁 {view.settings.raceTarget}</p>}
        {view.mode === "STREAK" && <p className="text-sm text-[var(--muted)]">{t.play.streakHint}</p>}
        <Leaderboard {...boardProps} />
      </div>
      {err}
    </div>
  );
}
