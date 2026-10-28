"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fmt, type LiveText } from "@/i18n/live";
import type { Locale } from "@/i18n/config";
import type { AnswerResult, ChestOutcome, ChestResult, LiveView } from "@/lib/live/types";
import { forget, liveApi, type Identity } from "./api";
import { errorText } from "./LiveRoom";
import { isSyncMode } from "@/lib/live/logic";
import { Countdown, EndsIn, Leaderboard, OptionButton, TEAM_STYLES, TeamScores } from "./shared";

type Feedback = { choice: number; correct: boolean; correctIndex: number; explanation?: string; chests: number; points: number; question: NonNullable<LiveView["question"]> };

function chestMessage(t: LiveText, r: ChestResult): string {
  const o: ChestOutcome = r.outcome;
  if (o.kind === "gold") return fmt(t.play.youGot, { n: r.gold });
  if (o.kind === "lose") return r.gold === 0 ? t.play.lost.replace("{n}", "0") : fmt(t.play.lost, { n: -r.gold });
  return r.victim ? fmt(t.play.stolen, { n: r.gold, name: r.victim }) : t.play.nobodyToSteal;
}

export function PlayerView({
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
  const me = view.me;
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  // Závod/horečka: po odpovědi chvíli držíme starou otázku se zpětnou vazbou, než ukážeme další.
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [chestResult, setChestResult] = useState<{ text: string; kind: ChestOutcome["kind"] } | null>(null);
  const [chestBusy, setChestBusy] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    },
    [],
  );

  const unit = view.mode === "GOLD" ? t.end.gold : view.mode === "RACE" ? t.end.progress : view.mode === "SURVIVAL" ? t.end.lives : t.end.score;
  const question = view.question;
  const quiz = isSyncMode(view.mode);
  const teamNames = t.play.teamNames;
  const eliminated = view.mode === "SURVIVAL" && me?.lives === 0;
  const boardProps = { mode: view.mode, rows: view.leaderboard, meId: me?.id, unit, raceTarget: view.settings.raceTarget, lives: view.settings.lives, teamNames };

  async function answer(choice: number) {
    if (sending || !question) return;
    setSending(true);
    setError(null);
    const r = await liveApi<AnswerResult>(`/rooms/${view.pin}/answer`, { body: { choice }, identity });
    setSending(false);
    if (!r.ok) return setError(r.error);
    if (quiz) return; // výsledek uvidí hráč při odhalení; stav přijde pollingem
    setFeedback({
      choice,
      correct: !!r.correct,
      correctIndex: r.correctIndex ?? -1,
      explanation: r.explanation,
      chests: r.chests ?? 0,
      points: r.points ?? 0,
      question,
    });
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    // Špatná odpověď: krátká pauza. Správná v horečce čeká na výběr truhly, ne na čas.
    if (!(r.correct && (r.chests ?? 0) > 0)) feedbackTimer.current = setTimeout(() => setFeedback(null), r.correct ? 900 : 1800);
  }

  async function pickChest(index: number) {
    if (chestBusy) return;
    setChestBusy(true);
    const r = await liveApi<ChestResult>(`/rooms/${view.pin}/chest`, { body: { index }, identity });
    setChestBusy(false);
    if (!r.ok) {
      setError(r.error);
      setFeedback(null);
      return;
    }
    setChestResult({ text: chestMessage(t, r), kind: r.outcome.kind });
    feedbackTimer.current = setTimeout(() => {
      setChestResult(null);
      setFeedback(null);
    }, 2200);
  }

  const err = error && (
    <p role="alert" className="text-center text-sm font-semibold text-[var(--danger)]">
      {errorText(t, error)}
    </p>
  );

  const hud = me && (
    <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm font-bold">
      <span className="min-w-0 truncate">{me.name}</span>
      <span className="flex items-center gap-3">
        {me.streak >= 2 && <span className="pill bg-[var(--accent-yellow)] px-2 py-0.5 text-[#16132b]">🔥 {fmt(t.play.streak, { n: me.streak })}</span>}
        <span className="font-mono tabular-nums">
          {view.mode === "GOLD"
            ? `🪙 ${me.gold}`
            : view.mode === "RACE"
              ? `🏁 ${me.progress}/${view.settings.raceTarget}`
              : view.mode === "SURVIVAL"
                ? `${"❤️".repeat(me.lives ?? 0) || "💀"} · ${me.score} ${t.play.points}`
                : `${me.score} ${t.play.points}`}
        </span>
      </span>
    </div>
  );
  const teamBanner =
    me?.team !== undefined && view.teams ? (
      <div className="mb-4 flex flex-col gap-2">
        <p className="text-center text-sm font-bold">
          {t.play.youTeam}: <span style={{ color: TEAM_STYLES[me.team].color }}>{TEAM_STYLES[me.team].shape}</span> {teamNames[me.team]}
        </p>
        <TeamScores teams={view.teams} names={teamNames} meTeam={me.team} />
      </div>
    ) : null;

  // --- Čekárna ---
  if (view.status === "LOBBY") {
    return (
      <div className="card mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <p className="font-mono text-4xl font-extrabold tracking-[0.25em]">{view.pin}</p>
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {view.title}
        </h1>
        <p className="text-[var(--muted)]">{t.lobby.waitingHost}</p>
        {me && (
          <p className="text-sm">
            {t.lobby.youAre} <strong>{me.name}</strong> · {t.lobby.players}: {view.counts.players}
          </p>
        )}
        <span aria-hidden className="space-float text-5xl">⏳</span>
      </div>
    );
  }

  // --- Konec ---
  if (view.status === "ENDED") {
    const top = view.leaderboard[0];
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <div className="card flex flex-col items-center gap-2 p-6 text-center">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {t.end.title}
          </h1>
          {me && <p className="text-xl font-bold">{fmt(t.end.yourPlace, { n: me.rank })}</p>}
          {view.reward && <p className="pill bg-[var(--accent-yellow)] px-3 py-1 text-sm text-[#16132b]">{fmt(t.end.reward, view.reward)}</p>}
          {top && (
            <p className="text-sm text-[var(--muted)]">
              {t.end.winner}: <strong className="text-[var(--foreground)]">{top.name}</strong>
            </p>
          )}
        </div>
        <div className="card p-5">
          <Leaderboard {...boardProps} limit={10} />
        </div>
        {view.teams && (
          <div className="card flex flex-col gap-2 p-5">
            {view.teams[0].score !== view.teams[1].score && (
              <p className="text-center text-lg font-bold">{fmt(t.play.teamWins, { name: teamNames[view.teams[0].score > view.teams[1].score ? 0 : 1] })}</p>
            )}
            <TeamScores teams={view.teams} names={teamNames} meTeam={me?.team} />
          </div>
        )}
        <Link
          href={`/${locale}/hrat-spolecne`}
          onClick={() => forget(view.pin)}
          className="btn-bouncy btn-primary btn-lg self-center"
        >
          {t.end.playAgain}
        </Link>
      </div>
    );
  }

  // --- Klasický kvíz ---
  if (quiz && question) {
    const reveal = view.status === "REVEAL";
    const chosen = me?.choice ?? null;
    const gotRight = me?.correct === true;
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {hud}
        {teamBanner}
        {eliminated && (
          <div role="status" className="card p-4 text-center">
            <p className="text-lg font-extrabold">💀 {t.play.eliminated}</p>
            <p className="text-sm text-[var(--muted)]">{t.play.spectating}</p>
          </div>
        )}
        <div className="card flex flex-col gap-4 p-5">
          <span className="text-sm font-semibold text-[var(--muted)]">{fmt(t.play.questionOf, { n: question.index + 1, total: view.total })}</span>
          <h1 className="text-xl font-bold leading-snug sm:text-2xl" style={{ fontFamily: "var(--font-heading)" }}>
            {question.prompt}
          </h1>
          {!reveal && question.startedAt !== null && question.seconds !== null && <Countdown startedAt={question.startedAt} seconds={question.seconds} now={serverNow} />}
          <div className="grid gap-3 sm:grid-cols-2">
            {question.options.map((o, i) => (
              <OptionButton
                key={i}
                index={i}
                label={o}
                onClick={() => answer(i)}
                disabled={sending || me?.answeredCurrent || reveal || eliminated}
                state={reveal ? (i === question.correctIndex ? "correct" : i === chosen ? "wrong" : "dim") : chosen === i ? "chosen" : chosen !== null ? "dim" : null}
              />
            ))}
          </div>
          {!reveal && me?.answeredCurrent && <p className="text-center font-semibold text-[var(--muted)]">{t.play.waitingOthers}</p>}
          {reveal && (
            <div className="flex flex-col items-center gap-1 rounded-xl p-3 text-center" style={{ background: gotRight ? "var(--accent-green)" : "var(--surface-muted)", color: gotRight ? "#fff" : "inherit" }}>
              <p className="text-xl font-extrabold">{chosen === null ? t.play.timeUp : gotRight ? t.play.correct : t.play.wrong}</p>
              {gotRight && me && <p className="font-mono font-bold">+{me.lastPoints}</p>}
              {question.explanation && <p className="text-sm">{question.explanation}</p>}
            </div>
          )}
        </div>
        {reveal && (
          <div className="card p-5">
            {me && <p className="mb-2 font-bold">{fmt(t.play.rank, { n: me.rank })}</p>}
            <Leaderboard {...boardProps} limit={view.mode === "SURVIVAL" ? 10 : 5} />
          </div>
        )}
        {err}
      </div>
    );
  }

  // --- Závod a Zlatá horečka ---
  const shown = feedback?.question ?? question;
  if (!shown) return <p className="text-center text-[var(--muted)]">{t.create.loading}</p>;
  const needChest = view.mode === "GOLD" && ((me?.chests ?? 0) > 0 || (feedback?.chests ?? 0) > 0) && !chestResult;
  const locked = !!feedback || sending || (me?.chests ?? 0) > 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      {hud}
      <div className="flex items-center justify-between">
        <span className="font-bold">{view.mode === "RACE" ? t.play.race : view.mode === "STREAK" ? t.play.streakMode : t.play.gold}</span>
        {view.endsAt && <EndsIn endsAt={view.endsAt} now={serverNow} label={t.play.timeLeft} />}
      </div>
      {view.mode === "STREAK" && <p className="text-sm text-[var(--muted)]">{t.play.streakHint}</p>}
      {view.mode === "RACE" && me && (
        <div className="h-4 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (me.progress / view.settings.raceTarget) * 100)}%`, background: "var(--brand-500)", transition: "width 0.4s ease" }} />
        </div>
      )}

      {needChest ? (
        <div className="card flex flex-col items-center gap-4 p-6 text-center">
          <p className="text-xl font-extrabold text-[var(--accent-green)]">{t.play.correct}</p>
          <h2 className="text-lg font-bold">{t.play.chestTitle}</h2>
          <p className="text-sm text-[var(--muted)]">{t.play.chestHint}</p>
          <div className="grid w-full grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <button key={i} type="button" onClick={() => pickChest(i)} disabled={chestBusy} className="btn-bouncy bg-[var(--accent-yellow)] py-6 text-5xl text-[#16132b] disabled:opacity-60" aria-label={`${t.play.chestTitle} ${i + 1}`}>
                <span aria-hidden>🎁</span>
              </button>
            ))}
          </div>
        </div>
      ) : chestResult ? (
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <span aria-hidden className="text-6xl">{chestResult.kind === "gold" ? "🪙" : chestResult.kind === "steal" ? "🏴‍☠️" : "💣"}</span>
          <p className="text-xl font-extrabold">{chestResult.text}</p>
        </div>
      ) : (
        <div className="card flex flex-col gap-4 p-5">
          <h1 className="text-xl font-bold leading-snug sm:text-2xl" style={{ fontFamily: "var(--font-heading)" }}>
            {shown.prompt}
          </h1>
          <div className="grid gap-3 sm:grid-cols-2">
            {shown.options.map((o, i) => (
              <OptionButton
                key={i}
                index={i}
                label={o}
                onClick={() => answer(i)}
                disabled={locked}
                state={feedback ? (i === feedback.correctIndex ? "correct" : i === feedback.choice ? "wrong" : "dim") : null}
              />
            ))}
          </div>
          {feedback && (
            <div className="rounded-xl p-3 text-center" style={{ background: feedback.correct ? "var(--accent-green)" : "var(--surface-muted)", color: feedback.correct ? "#fff" : "inherit" }}>
              <p className="text-lg font-extrabold">
                {feedback.correct ? t.play.correct : t.play.wrong}
                {view.mode === "STREAK" && feedback.correct && ` +${feedback.points}`}
              </p>
              {feedback.explanation && <p className="text-sm">{feedback.explanation}</p>}
            </div>
          )}
        </div>
      )}
      {err}
      <div className="card p-4">
        <Leaderboard {...boardProps} limit={5} />
      </div>
    </div>
  );
}
