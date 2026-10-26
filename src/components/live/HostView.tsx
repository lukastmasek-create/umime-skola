"use client";

import Link from "next/link";
import { useState } from "react";
import { Podium } from "@/components/Podium";
import { fmt, type LiveText } from "@/i18n/live";
import type { Locale } from "@/i18n/config";
import type { LiveView } from "@/lib/live/types";
import { liveApi, type Identity } from "./api";
import { errorText } from "./LiveRoom";
import { Countdown, EndsIn, Leaderboard, OptionButton } from "./shared";

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
  const [copied, setCopied] = useState(false);
  const unit = view.mode === "GOLD" ? t.end.gold : view.mode === "RACE" ? t.end.progress : t.end.score;

  async function control(action: "next" | "end") {
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
      <div className="flex flex-col gap-6">
        <div className="card flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm font-semibold text-[var(--muted)]">{fmt(t.lobby.share, { site: typeof window !== "undefined" ? window.location.host : "" })}</p>
          <p className="font-mono text-6xl font-extrabold tracking-[0.25em] sm:text-7xl" aria-label={view.pin.split("").join(" ")}>
            {view.pin}
          </p>
          <button
            type="button"
            className="btn-bouncy bg-[var(--surface)] px-3 py-1.5 text-sm font-bold"
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
        <div className="card flex flex-col gap-3 p-5">
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
        </div>
        {err}
        <button type="button" onClick={() => control("next")} disabled={busy || view.counts.players === 0} className="btn-bouncy btn-primary btn-lg self-center disabled:opacity-50">
          ▶ {t.lobby.start}
        </button>
        {view.counts.players === 0 && <p className="text-center text-sm text-[var(--muted)]">{t.lobby.needPlayers}</p>}
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
        <div className="card p-5">
          <Leaderboard mode={view.mode} rows={view.leaderboard} unit={unit} raceTarget={view.settings.raceTarget} />
        </div>
        <Link href={`/${locale}/hrat-spolecne/nova`} className="btn-bouncy btn-primary btn-lg self-center">
          {t.end.newGame}
        </Link>
      </div>
    );
  }

  // --- Klasický kvíz ---
  if (view.mode === "QUIZ" && view.question) {
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
        {reveal && (
          <div className="card p-5">
            <h3 className="mb-2 font-bold">{t.lobby.players}</h3>
            <Leaderboard mode="QUIZ" rows={view.leaderboard} limit={5} unit={unit} />
          </div>
        )}
        {err}
        <button type="button" onClick={() => control("next")} disabled={busy} className="btn-bouncy btn-primary btn-lg self-center">
          {reveal ? (last ? t.play.finish : t.play.nextQuestion) : t.play.showAnswer}
        </button>
      </div>
    );
  }

  // --- Závod a Zlatá horečka: učitel sleduje průběh ---
  return (
    <div className="flex flex-col gap-4">
      {header}
      <div className="card flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">{view.mode === "RACE" ? t.play.race : t.play.gold}</h2>
          {view.endsAt && <EndsIn endsAt={view.endsAt} now={serverNow} label={t.play.timeLeft} />}
        </div>
        {view.mode === "RACE" && <p className="text-sm text-[var(--muted)]">🏁 {view.settings.raceTarget}</p>}
        <Leaderboard mode={view.mode} rows={view.leaderboard} unit={unit} raceTarget={view.settings.raceTarget} />
      </div>
      {err}
    </div>
  );
}
