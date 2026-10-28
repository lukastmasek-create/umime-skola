"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { fillTokens, getChallengeText } from "@/i18n/challenge";
import { BOSS_LIVES, BOSS_QUESTIONS, CHAPTERS, FAST_MS, MAX_HINTS, MAX_SHIELDS, comboMultiplier, type ChGame } from "@/lib/idle/challenge";
import type { Locale } from "@/i18n/config";

type Meta = { streak: number; best: number; shield: number; hints: number; boostUntil: number; chapter: number; bossWins: number; correct: number; total: number };
type GameView = {
  started: boolean;
  earned: number;
  progress: number;
  meta: Meta;
  boost: number;
  boostLeftMs: number;
  nextChapter: number | null;
  requirement: number | null;
  requirements: number[];
};
type Pending = {
  game: ChGame;
  kind: "quick" | "boss";
  issuedAt: number;
  limitMs: number;
  q: { prompt: string; options: string[]; course: string; weak: boolean };
  hidden: number[];
  boss: { chapter: number; idx: number; right: number; lives: number; total: number; maxLives: number } | null;
};
type Reward = { coins: number; xp: number; points: number };
type Result = {
  correct: boolean;
  fast: boolean;
  shielded: boolean;
  streak: number;
  correctIndex: number;
  explanation: string;
  reward: Reward;
  gained: { shield: boolean; hint: boolean };
  boss: { done: boolean; won: boolean; chapter: number; idx: number; right: number; lives: number } | null;
  weak: boolean;
  game: ChGame;
  choice: number;
};
type Snapshot = {
  loggedIn: true;
  now: number;
  games: Record<ChGame, GameView>;
  pending: Pending | null;
  accuracy: number;
  week: { key: string; score: number; tier: number; tiers: { id: "bronze" | "silver" | "gold"; score: number; points: number; xp: number }[]; rank: number; endsAt: number };
  lastWeek: { key: string; score: number; tier: number; claimed: boolean; rank: number; reward: Reward } | null;
  party: {
    ranking: { userId: string; name: string; score: number }[];
    groups: { id: string; name: string; members: number; score: number; target: number; claimed: boolean }[];
    friends: { userId: string; name: string }[];
    orderPoints: number;
  };
  inbox: { id: string; fromName: string; game: ChGame; amount: number }[];
  gifts: { left: number; amounts: number[]; gifted: number };
};
type Board = { rows: { id: string; name: string; avatar: string | null; earned: number; me: boolean }[]; rank: number | null; mine: number | null };
type Load = { state: "loading" } | { state: "guest" } | { state: "error" } | { state: "ready"; data: Snapshot };
type Tab = "quiz" | "boss" | "compete";

const ICON: Record<ChGame, string> = { farm: "🌾", city: "🏙️", base: "🚀", pets: "🐾" };

export function ChallengePanel({ game, locale, onChange }: { game: ChGame; locale: Locale; onChange?: () => void }) {
  const t = getChallengeText(locale);
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [tab, setTab] = useState<Tab>("quiz");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [intro, setIntro] = useState<string | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [now, setNow] = useState(0);
  const [giftTo, setGiftTo] = useState("");

  const say = useCallback((text: string, ok = false) => setMessage({ text, ok }), []);
  const errorText = useCallback((code?: string) => t.errors[code ?? "unavailable"] ?? t.errors.unavailable, [t]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/stale-hry/vyzvy", { cache: "no-store" });
      const data = await res.json();
      if (data.loggedIn === false) setLoad({ state: "guest" });
      else if (!res.ok || data.error) setLoad({ state: "error" });
      else setLoad({ state: "ready", data });
    } catch {
      setLoad({ state: "error" });
    }
  }, []);

  const loadBoard = useCallback(async () => {
    try {
      const res = await fetch(`/api/stale-hry/vyzvy?board=${game}`, { cache: "no-store" });
      if (res.ok) setBoard(await res.json());
    } catch {
      /* žebříček není kritický */
    }
  }, [game]);

  useEffect(() => {
    const first = window.setTimeout(() => void refresh(), 0);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(tick);
    };
  }, [refresh]);

  useEffect(() => {
    if (tab !== "compete") return;
    const id = window.setTimeout(() => void loadBoard(), 0);
    return () => window.clearTimeout(id);
  }, [tab, loadBoard]);

  const post = useCallback(
    async (body: Record<string, unknown>) => {
      if (busy) return null;
      setBusy(true);
      setMessage(null);
      try {
        const res = await fetch("/api/stale-hry/vyzvy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          say(errorText(data.error));
          if (res.status === 409) await refresh();
          return null;
        }
        setLoad({ state: "ready", data });
        return data as Snapshot & { result?: Omit<Result, "choice">; claimed?: Reward & { rank?: number }; received?: { game: ChGame; amount: number } };
      } catch {
        say(errorText("unavailable"));
        return null;
      } finally {
        setBusy(false);
      }
    },
    [busy, errorText, refresh, say],
  );

  if (load.state === "loading") return <div className="card mt-6 h-40 animate-pulse bg-[var(--surface-muted)]" aria-label={t.loading} />;
  if (load.state === "guest") {
    return (
      <section className="card mt-6 p-5">
        <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {ICON[game]} {t.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{t.loginRequired}</p>
        <Link href={`/${locale}/prihlaseni`} className="btn-bouncy mt-3 inline-block bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white">
          {locale === "cs" ? "Přihlásit se" : locale === "de" ? "Anmelden" : locale === "ru" ? "Войти" : "Log in"}
        </Link>
      </section>
    );
  }
  if (load.state === "error") return <div className="card mt-6 p-5 text-sm text-[var(--muted)]">{t.unavailable}</div>;

  const data = load.data;
  const g = data.games[game];
  const unit = t.currency[game];
  const pending = data.pending;
  const mine = pending && pending.game === game ? pending : null;
  const otherPending = pending && pending.game !== game ? pending : null;
  const clock = now || data.now;
  const boostLeft = Math.max(0, Math.ceil((g.meta.boostUntil - clock) / 60_000));
  const chapters = t.story[game];

  const answer = async (choice: number) => {
    const out = await post({ action: "answer", choice });
    if (out?.result) {
      setResult({ ...out.result, choice });
      onChange?.();
    }
  };

  const startQuick = async () => {
    setResult(null);
    await post({ action: "ask", game });
  };
  const startBoss = async () => {
    setResult(null);
    const next = g.nextChapter;
    const out = await post({ action: "boss", game });
    if (out && next) setIntro(chapters[next - 1]?.intro ?? null);
  };
  const dismissResult = () => {
    setResult(null);
    setIntro(null);
  };

  const timeLeft = mine ? Math.max(0, FAST_MS - (clock - mine.issuedAt)) : 0;

  const questionCard = (p: Pending) => (
    <div className="rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] p-4">
      {p.boss && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
          <span>
            {t.chapterLabel.replace("{n}", String(p.boss.chapter))} · {chapters[p.boss.chapter - 1]?.name}
          </span>
          <span>{fillTokens(t.bossQuestion, { i: Math.min(BOSS_QUESTIONS, p.boss.idx + 1), n: BOSS_QUESTIONS })}</span>
          <span aria-label={t.lives}>{Array.from({ length: BOSS_LIVES }, (_, i) => (i < p.boss!.lives ? "❤️" : "🖤")).join(" ")}</span>
        </div>
      )}
      {intro && p.boss && <p className="mb-3 rounded-lg bg-[var(--surface-muted)] p-3 text-sm italic text-[var(--muted)]">{intro}</p>}
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--muted)]">
        <span>{fillTokens(t.course, { n: p.q.course })}</span>
        {p.q.weak && <span className="pill bg-[var(--accent-pink)] px-2 py-0.5 text-white">{t.weakBadge}</span>}
        {timeLeft > 0 && <span className="pill bg-[var(--accent-yellow)] px-2 py-0.5 text-[#16132b]">⚡ {t.fastBadge} · {fillTokens(t.seconds, { n: Math.ceil(timeLeft / 1000) })}</span>}
      </div>
      <p className="mb-3 text-lg font-bold">{p.q.prompt}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {p.q.options.map((o, i) => {
          const hidden = p.hidden.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={busy || hidden}
              onClick={() => void answer(i)}
              className={`rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2.5 text-left text-sm font-semibold hover:bg-[var(--brand-50)] disabled:opacity-40 ${hidden ? "line-through" : ""}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy || g.meta.hints < 1 || p.hidden.length > 0}
          onClick={() => void post({ action: "hint" })}
          className="btn-bouncy bg-[var(--accent-yellow)] px-3 py-1.5 text-sm font-bold text-[#16132b] disabled:opacity-40"
        >
          💡 {t.useHint} ({g.meta.hints})
        </button>
        <button type="button" disabled={busy} onClick={() => void post({ action: "abort" })} className="btn-bouncy bg-[var(--surface)] px-3 py-1.5 text-sm font-bold">
          {t.giveUp}
        </button>
      </div>
    </div>
  );

  const rewardLine = (r: Reward) => fillTokens(t.reward, { coins: r.coins.toLocaleString(locale), unit, xp: r.xp, points: r.points });

  const resultCard = (r: Result) => (
    <div className={`rounded-2xl border-2 p-4 ${r.correct ? "border-[var(--accent-green)] bg-[var(--accent-green)]/10" : "border-[var(--accent-pink)] bg-[var(--accent-pink)]/10"}`} role="status">
      <p className="text-lg font-extrabold">
        {r.correct ? `✅ ${t.correct}` : `❌ ${t.wrong}`} {r.fast && <span className="text-sm">⚡ {t.fastBadge}</span>}
      </p>
      {r.shielded && <p className="text-sm font-semibold">🛡️ {t.shieldSaved}</p>}
      {r.explanation && <p className="mt-1 text-sm text-[var(--muted)]">{r.explanation}</p>}
      {(r.reward.coins > 0 || r.reward.xp > 0 || r.reward.points > 0) && <p className="mt-2 font-bold">{rewardLine(r.reward)}</p>}
      {r.gained.shield && <p className="text-sm font-semibold">🛡️ {t.gainedShield}</p>}
      {r.gained.hint && <p className="text-sm font-semibold">💡 {t.gainedHint}</p>}
      {r.boss?.done && (
        <div className="mt-3 rounded-xl bg-[var(--surface)] p-3">
          <p className="font-extrabold">{r.boss.won ? `🏆 ${t.bossWon}` : t.bossLost}</p>
          {r.boss.won && <p className="mt-1 text-sm">{chapters[r.boss.chapter - 1]?.win}</p>}
          {r.boss.won && r.boss.lives >= BOSS_LIVES && <p className="text-sm font-semibold">{t.flawless}</p>}
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          dismissResult();
          if (!r.boss && !data.pending) void startQuick();
        }}
        className="btn-bouncy mt-3 bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white"
      >
        {r.boss && !r.boss.done ? t.next : r.boss ? "OK" : t.next}
      </button>
    </div>
  );

  const stat = (label: string) => <span className="pill bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold">{label}</span>;

  const tabs: { id: Tab; label: string }[] = [
    { id: "quiz", label: t.tabs.quiz },
    { id: "boss", label: t.tabs.boss },
    { id: "compete", label: t.tabs.compete },
  ];

  const weekEnd = Math.max(0, data.week.endsAt - clock);
  const days = Math.floor(weekEnd / 86_400_000);
  const hours = Math.floor((weekEnd % 86_400_000) / 3_600_000);

  return (
    <section className="card mt-6 p-4 sm:p-5" aria-label={t.title}>
      <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {ICON[game]} {t.title}
      </h2>
      <p className="mb-3 text-sm text-[var(--muted)]">{t.subtitle}</p>

      <div className="mb-4 flex flex-wrap gap-1.5" role="tablist">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            onClick={() => setTab(x.id)}
            className={`rounded-lg border-2 px-3.5 py-1.5 text-sm font-semibold ${tab === x.id ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]" : "border-transparent text-[var(--muted)] hover:border-[var(--edge)]"}`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {message && (
        <p role="status" className={`mb-3 rounded-lg px-3 py-2 text-sm font-semibold ${message.ok ? "bg-[var(--accent-green)]/20" : "bg-[var(--accent-pink)]/20"}`}>
          {message.text}
        </p>
      )}
      {otherPending && (
        <p className="mb-3 rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm">
          {ICON[otherPending.game]} {t.errors.pending}
        </p>
      )}

      {tab === "quiz" && (
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {stat(`🔥 ${fillTokens(t.streak, { n: g.meta.streak })} (${fillTokens(t.best, { n: g.meta.best })})`)}
            {stat(`✖️ ${fillTokens(t.multiplier, { n: comboMultiplier(g.meta.streak).toFixed(1) })}`)}
            {stat(`🛡️ ${fillTokens(t.shields, { n: `${g.meta.shield}/${MAX_SHIELDS}` })}`)}
            {stat(`💡 ${fillTokens(t.hints, { n: `${g.meta.hints}/${MAX_HINTS}` })}`)}
            {stat(`🎯 ${fillTokens(t.accuracy, { n: Math.round(data.accuracy * 100) })}`)}
          </div>
          <p className="mb-3 text-sm font-semibold">
            {boostLeft > 0 && g.boost > 0 ? `⚡ ${fillTokens(t.boost, { n: Math.round(g.boost * 100), m: boostLeft })}` : t.noBoost}
          </p>
          {!g.started ? (
            <p className="rounded-lg bg-[var(--surface-muted)] p-3 text-sm">{t.needsGame}</p>
          ) : result && result.game === game && !result.boss ? (
            resultCard(result)
          ) : mine && !mine.boss ? (
            questionCard(mine)
          ) : (
            <div>
              <p className="mb-3 text-sm text-[var(--muted)]">{t.quickHint}</p>
              <button type="button" disabled={busy || !!pending} onClick={() => void startQuick()} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-45">
                ❓ {t.ask}
              </button>
              <p className="mt-3 text-xs text-[var(--faint)]">{t.adaptive}</p>
            </div>
          )}
        </div>
      )}

      {tab === "boss" && (
        <div>
          <h3 className="mb-2 font-bold">{t.bossTitle}</h3>
          <ol className="mb-4 grid gap-2">
            {chapters.map((c, i) => {
              const n = i + 1;
              const done = g.meta.chapter >= n;
              const next = g.nextChapter === n;
              const ready = next && g.progress >= (g.requirements[i] ?? Infinity);
              return (
                <li key={n} className={`rounded-xl border-2 p-3 ${done ? "border-[var(--accent-green)] bg-[var(--accent-green)]/10" : next ? "border-[var(--edge)]" : "border-transparent bg-[var(--surface-muted)] opacity-70"}`}>
                  <p className="flex items-center justify-between gap-2 text-sm font-extrabold">
                    <span>
                      {done ? "✅" : next ? "⚔️" : "🔒"} {t.chapterLabel.replace("{n}", String(n))}: {c.name}
                    </span>
                    {!done && <span className="text-xs font-semibold text-[var(--muted)]">{fillTokens(t.need[game], { n: g.requirements[i] })}</span>}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{done ? c.win : c.intro}</p>
                  {next && !mine && !(result?.boss) && (
                    <div className="mt-2">
                      {ready && g.started ? (
                        <button type="button" disabled={busy || !!pending} onClick={() => void startBoss()} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-45">
                          ⚔️ {t.fight}
                        </button>
                      ) : (
                        <p className="text-xs font-semibold text-[var(--faint)]">{fillTokens(t.locked, { n: fillTokens(t.need[game], { n: g.requirements[i] }) })}</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          {g.meta.chapter >= CHAPTERS && <p className="mb-3 font-bold">{t.allDone}</p>}
          {result && result.game === game && result.boss ? resultCard(result) : mine?.boss ? questionCard(mine) : null}
        </div>
      )}

      {tab === "compete" && (
        <div className="grid gap-5">
          <div>
            <h3 className="mb-2 font-bold">🏆 {t.boardTitle}</h3>
            {!board ? (
              <div className="h-20 animate-pulse rounded-xl bg-[var(--surface-muted)]" />
            ) : board.rows.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t.boardEmpty}</p>
            ) : (
              <ol className="grid gap-1.5">
                {board.rows.map((r, i) => (
                  <li key={r.id} className={`flex items-center gap-3 rounded-xl border-2 px-3 py-1.5 text-sm ${r.me ? "border-[var(--edge)] bg-[var(--accent-yellow)]/40" : "border-transparent bg-[var(--surface-muted)]"}`}>
                    <span className="w-6 text-center font-extrabold">{i + 1}.</span>
                    <Avatar id={r.avatar} size={28} />
                    <span className="min-w-0 flex-1 truncate font-semibold">
                      {r.name} {r.me && <span className="text-xs text-[var(--muted)]">({t.you})</span>}
                    </span>
                    <span className="font-bold">{r.earned.toLocaleString(locale)}</span>
                  </li>
                ))}
              </ol>
            )}
            {board?.rank && <p className="mt-2 text-sm font-semibold">{fillTokens(t.boardMine, { n: board.rank })} <span className="font-normal text-[var(--muted)]">({t.boardUnit})</span></p>}
          </div>

          <div>
            <h3 className="mb-1 font-bold">🗓️ {t.weekTitle}</h3>
            <p className="text-sm font-semibold">
              {fillTokens(t.weekScore, { n: data.week.score })} · {fillTokens(t.weekEnds, { d: days, h: hours })}
            </p>
            <div className="my-2 grid gap-1.5 sm:grid-cols-3">
              {data.week.tiers.map((x, i) => (
                <div key={x.id} className={`rounded-xl border-2 p-2 text-sm ${data.week.tier > i ? "border-[var(--accent-green)] bg-[var(--accent-green)]/10" : "border-[var(--edge)]"}`}>
                  <p className="font-extrabold">
                    {data.week.tier > i ? "✅" : "🎯"} {t.tier[x.id]} · {x.score}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{fillTokens(t.tierReward, { points: x.points, xp: x.xp })}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--faint)]">{t.weekHow}</p>
            {data.lastWeek && data.lastWeek.score > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-[var(--surface-muted)] p-3 text-sm">
                <span className="font-semibold">
                  {fillTokens(t.lastWeek, { n: data.lastWeek.score })}
                  {data.lastWeek.rank > 0 && ` · ${fillTokens(t.lastWeekRank, { n: data.lastWeek.rank })}`}
                </span>
                {data.lastWeek.reward.points > 0 || data.lastWeek.reward.xp > 0 ? (
                  <button
                    type="button"
                    disabled={busy || data.lastWeek.claimed}
                    onClick={async () => {
                      const out = await post({ action: "claimWeek" });
                      if (out?.claimed) {
                        say(rewardLine(out.claimed), true);
                        onChange?.();
                      }
                    }}
                    className="btn-bouncy bg-[var(--brand-500)] px-3 py-1.5 text-sm font-bold text-white disabled:opacity-45"
                  >
                    {data.lastWeek.claimed ? t.claimed : `${t.claim} (${fillTokens(t.tierReward, { points: data.lastWeek.reward.points, xp: data.lastWeek.reward.xp })})`}
                  </button>
                ) : null}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-bold">👥 {t.partyTitle}</h3>
            {data.party.groups.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t.partyEmpty}</p>
            ) : (
              <div className="grid gap-4">
                {data.party.groups.map((p) => (
                  <div key={p.id} className="rounded-xl border-2 border-[var(--edge)] p-3">
                    <p className="font-extrabold">{fillTokens(t.partyOrder, { name: p.name })}</p>
                    <div className="my-2 h-3 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]" role="progressbar" aria-valuenow={Math.min(p.score, p.target)} aria-valuemax={p.target}>
                      <div className="h-full bg-[var(--accent-green)]" style={{ width: `${Math.min(100, (p.score / p.target) * 100)}%` }} />
                    </div>
                    <p className="text-sm">{fillTokens(t.partyProgress, { n: p.score, m: p.target })} · {fillTokens(t.partyReward, { n: data.party.orderPoints })}</p>
                    <button
                      type="button"
                      disabled={busy || p.claimed || p.score < p.target}
                      onClick={async () => {
                        const out = await post({ action: "claimParty", group: p.id });
                        if (out?.claimed) {
                          say(rewardLine(out.claimed), true);
                          onChange?.();
                        }
                      }}
                      className="btn-bouncy mt-2 bg-[var(--brand-500)] px-3 py-1.5 text-sm font-bold text-white disabled:opacity-45"
                    >
                      {p.claimed ? t.claimed : t.claim}
                    </button>
                  </div>
                ))}
                {data.party.ranking.length > 0 && (
                  <div>
                    <p className="mb-1 text-sm font-bold">{t.partyRanking}</p>
                    <ol className="grid gap-1">
                      {data.party.ranking.map((r, i) => (
                        <li key={r.userId} className="flex justify-between rounded-lg bg-[var(--surface-muted)] px-3 py-1 text-sm">
                          <span>
                            {i + 1}. {r.name}
                          </span>
                          <span className="font-bold">{r.score}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>

          {data.party.groups.length > 0 && (
            <div>
              <h3 className="mb-1 font-bold">🎁 {t.giftsTitle}</h3>
              <p className="mb-2 text-sm text-[var(--muted)]">{fillTokens(t.giftsHint, { n: data.gifts.left })}</p>
              {data.party.friends.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <label className="text-sm font-semibold" htmlFor={`gift-${game}`}>
                    {t.giftTo}
                  </label>
                  <select id={`gift-${game}`} value={giftTo} onChange={(e) => setGiftTo(e.target.value)} className="rounded-lg border-2 border-[var(--edge)] bg-[var(--surface)] px-2 py-1.5 text-sm">
                    <option value="">–</option>
                    {data.party.friends.map((f) => (
                      <option key={f.userId} value={f.userId}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  {data.gifts.amounts.map((amount, tier) => (
                    <button
                      key={amount}
                      type="button"
                      disabled={busy || !giftTo || data.gifts.left < 1 || !g.started}
                      onClick={async () => {
                        const out = await post({ action: "gift", game, to: giftTo, tier });
                        if (out) {
                          say(t.giftSent, true);
                          onChange?.();
                        }
                      }}
                      className="btn-bouncy bg-[var(--accent-yellow)] px-3 py-1.5 text-sm font-bold text-[#16132b] disabled:opacity-45"
                    >
                      {t.giftSend} {amount.toLocaleString(locale)} {unit}
                    </button>
                  ))}
                </div>
              )}
              <p className="mb-1 text-sm font-bold">{t.giftInbox}</p>
              {data.inbox.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">{t.giftNone}</p>
              ) : (
                <ul className="grid gap-1.5">
                  {data.inbox.map((gift) => (
                    <li key={gift.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--surface-muted)] px-3 py-1.5 text-sm">
                      <span>
                        {ICON[gift.game]} {fillTokens(t.giftFrom, { name: gift.fromName })} · <b>{gift.amount.toLocaleString(locale)}</b> {t.currency[gift.game]}
                      </span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          const out = await post({ action: "claimGift", id: gift.id });
                          if (out?.received) {
                            say(fillTokens(t.giftReceived, { n: out.received.amount.toLocaleString(locale), unit: t.currency[out.received.game] }), true);
                            onChange?.();
                          }
                        }}
                        className="btn-bouncy bg-[var(--brand-500)] px-3 py-1 text-xs font-bold text-white disabled:opacity-45"
                      >
                        {t.claim}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
