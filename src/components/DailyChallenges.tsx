"use client";

import { useEffect, useState } from "react";
import { fill } from "@/i18n/profile";
import { getDailyText } from "@/i18n/daily";
import { notifyAccountChanged } from "@/lib/account-events";
import type { Locale } from "@/i18n/config";
import type { QuestId } from "@/lib/gamify";

type Snapshot = {
  streak: { current: number; best: number; doneToday: boolean };
  quests: { id: QuestId; target: number; bonusXp: number; progress: number; done: boolean; claimed: boolean }[];
  milestones: { id: string; days: number; bonusXp: number; reached: boolean; claimed: boolean }[];
  achievements: { id: string; icon: string; target: number; value: number; done: boolean }[];
};

type State = "loading" | "guest" | "error" | Snapshot;

// Denní série, výzvy s odměnou a úspěchy. Ukazuje se na úvodní stránce a v profilu.
export function DailyChallenges({ locale, showAchievements = false }: { locale: Locale; showAchievements?: boolean }) {
  const t = getDailyText(locale);
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/denni-vyzvy")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.loggedIn === false) setState("guest");
        else if (data.error) setState("error");
        else setState(data);
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  async function claim(id: string) {
    setBusy(id);
    try {
      const res = await fetch("/api/denni-vyzvy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        setState(data);
        notifyAccountChanged();
      }
    } catch {
      // zůstane tlačítko k opakování
    } finally {
      setBusy(null);
    }
  }

  if (state === "loading") return <div className="card h-40 animate-pulse bg-[var(--surface-muted)]" aria-hidden />;
  if (state === "guest") return <p className="card p-5 text-sm text-[var(--muted)]">{t.guest}</p>;
  if (state === "error") return <p className="card p-5 text-sm text-[var(--muted)]">{t.error}</p>;

  const { streak, quests, milestones, achievements } = state;
  const heading = { fontFamily: "var(--font-heading)" } as const;
  const claimButton = (id: string, ready: boolean, claimed: boolean) =>
    claimed ? (
      <span className="shrink-0 text-xs font-bold text-[var(--muted)]">✓ {t.claimed}</span>
    ) : (
      <button
        type="button"
        disabled={!ready || busy === id}
        onClick={() => claim(id)}
        className="btn-bouncy shrink-0 bg-[var(--accent-500)] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
      >
        {t.claim}
      </button>
    );

  return (
    <div className="card flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold" style={heading}>
          {t.title}
        </h2>
        <div className="text-right">
          <p className="text-lg font-extrabold" style={heading}>
            🔥 {fill(t.streak, streak.current)}
          </p>
          <p className="text-xs font-semibold text-[var(--muted)]">
            {streak.doneToday ? t.streakToday : t.streakIdle} · {fill(t.streakBest, streak.best)}
          </p>
        </div>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-bold text-[var(--muted)]">{t.quests}</h3>
        <ul className="flex flex-col gap-2">
          {quests.map((q) => (
            <li key={q.id} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.questNames[q.id]}</p>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
                  <div className="h-full bg-[var(--brand-500)]" style={{ width: `${(q.progress / q.target) * 100}%` }} />
                </div>
              </div>
              <span className="shrink-0 text-xs font-bold text-[var(--accent-500)]">{fill(t.bonus, q.bonusXp)}</span>
              {claimButton(`quest:${q.id}`, q.done, q.claimed)}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-bold text-[var(--muted)]">{t.milestones}</h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {milestones.map((m) => (
            <li key={m.id} className="flex items-center gap-3 rounded-xl border-2 border-[var(--edge)] px-3 py-2">
              <span className={m.reached ? "text-xl" : "text-xl grayscale"} aria-hidden>
                🔥
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold">
                {fill(t.days, m.days)} <span className="text-xs text-[var(--accent-500)]">{fill(t.bonus, m.bonusXp)}</span>
              </span>
              {claimButton(`milestone:${m.id}`, m.reached, m.claimed)}
            </li>
          ))}
        </ul>
      </section>

      {showAchievements && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-[var(--muted)]">{t.achievements}</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {achievements.map((a) => (
              <li
                key={a.id}
                className={`flex items-center gap-3 rounded-xl border-2 border-[var(--edge)] px-3 py-2 ${a.done ? "" : "opacity-60"}`}
              >
                <span className={a.done ? "text-2xl" : "text-2xl grayscale"} aria-hidden>
                  {a.icon}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold">{t.achievementNames[a.id]}</span>
                <span className="text-xs font-bold text-[var(--muted)]">
                  {a.value}/{a.target}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
