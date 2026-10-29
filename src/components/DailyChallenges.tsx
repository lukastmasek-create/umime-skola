"use client";

import { useEffect, useState } from "react";
import { fill } from "@/i18n/profile";
import { getDailyText } from "@/i18n/daily";
import { getReviewText } from "@/i18n/review";
import { notifyAccountChanged } from "@/lib/account-events";
import { CARDS } from "@/lib/collection";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { QuestId, WeeklyId } from "@/lib/gamify";

export type Snapshot = {
  streak: {
    current: number;
    best: number;
    doneToday: boolean;
    freezes: number;
    maxFreezes: number;
    freezePrice: number;
    atRisk: boolean;
    usedProtection: "freeze" | "rescue" | null;
    rescuable: boolean;
  };
  pet: { name: string; species: string; hunger: number; happy: number } | null;
  cityCoins: number;
  reviewDue: number;
  todayXp: number;
  weekKey: string;
  weekly: { id: WeeklyId; target: number; bonusXp: number; progress: number; done: boolean; claimed: boolean }[];
  quests: { id: QuestId; target: number; bonusXp: number; progress: number; done: boolean; claimed: boolean }[];
  milestones: { id: string; days: number; bonusXp: number; reached: boolean; claimed: boolean }[];
  achievements: { id: string; icon: string; target: number; bonusXp: number; value: number; done: boolean; claimed: boolean }[];
};

type State = "loading" | "guest" | "error" | Snapshot;

const GOALS = [20, 50, 100] as const;

// Osobní denní cíl v XP: kroužek s postupem, tři úrovně náročnosti (volba se pamatuje v prohlížeči).
function DailyGoal({ t, xp }: { t: ReturnType<typeof getDailyText>; xp: number }) {
  const [level, setLevel] = useState<0 | 1 | 2>(1);
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const v = Number(window.localStorage.getItem("daily-goal"));
        if (v === 0 || v === 1 || v === 2) setLevel(v);
      } catch {}
    }, 0);
    return () => window.clearTimeout(id);
  }, []);
  function pick(l: 0 | 1 | 2) {
    setLevel(l);
    try {
      window.localStorage.setItem("daily-goal", String(l));
    } catch {}
  }
  const goal = GOALS[level];
  const pct = Math.min(1, xp / goal);
  const done = xp >= goal;
  const R = 26;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface-muted)] p-3">
      <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label={`${t.goal.title}: ${Math.round(pct * 100)} %`} className={done ? "goal-done" : undefined}>
        <circle cx="32" cy="32" r={R} fill="none" stroke="var(--edge)" strokeWidth="7" opacity="0.35" />
        <circle cx="32" cy="32" r={R} fill="none" stroke={done ? "var(--accent-yellow)" : "var(--brand-500)"} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} transform="rotate(-90 32 32)" style={{ transition: "stroke-dasharray 0.6s ease" }} />
        <text x="32" y="37" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--foreground)">
          {done ? "✓" : `${Math.round(pct * 100)}%`}
        </text>
      </svg>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold">{t.goal.title}</p>
        <p className="text-sm font-semibold text-[var(--muted)]">{done ? t.goal.done : t.goal.progress.replace("{a}", String(xp)).replace("{b}", String(goal))}</p>
      </div>
      <div className="flex gap-1.5" role="group" aria-label={t.goal.hint}>
        {([0, 1, 2] as const).map((l) => (
          <button key={l} type="button" onClick={() => pick(l)} aria-pressed={level === l} className="pill px-3 py-1 text-xs font-bold" style={{ background: level === l ? "var(--accent-500)" : "var(--surface)", color: level === l ? "#fff" : undefined }}>
            {GOALS[l]} · {t.goal.levels[l]}
          </button>
        ))}
      </div>
    </div>
  );
}

// Denní série, výzvy s odměnou a úspěchy. Ukazuje se na úvodní stránce a v profilu.
export function DailyChallenges({ locale, showAchievements = false }: { locale: Locale; showAchievements?: boolean }) {
  const t = getDailyText(locale);
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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
    await post(id, { id });
  }

  async function post(key: string, payload: Record<string, string>) {
    setBusy(key);
    try {
      const res = await fetch("/api/denni-vyzvy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setState(data);
        notifyAccountChanged();
        const card = CARDS.find((c) => c.id === data.card);
        if (card) setNotice(fill(t.cardGot, `${card.icon} ${card.names[locale]}`));
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

  const { streak, pet, cityCoins, reviewDue, todayXp, weekKey, quests, weekly, milestones, achievements } = state;
  const heading = { fontFamily: "var(--font-heading)" } as const;
  const claimButton = (id: string, ready: boolean, claimed: boolean) =>
    // Pevná šířka sloupce, ať jsou ukazatele ve všech řádcích stejně dlouhé.
    (
      <span className="flex w-24 shrink-0 justify-end">
        {claimed ? (
          <span className="text-xs font-bold text-[var(--muted)]">✓ {t.claimed}</span>
        ) : (
          <button
            type="button"
            disabled={!ready || busy === id}
            onClick={() => claim(id)}
            className="btn-bouncy bg-[var(--accent-500)] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
          >
            {t.claim}
          </button>
        )}
      </span>
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

      <DailyGoal t={t} xp={todayXp} />

      {(notice || streak.usedProtection || streak.rescuable || (pet && (pet.hunger < 50 || pet.happy < 40)) || cityCoins > 0) && (
        <ul className="flex flex-col gap-1.5 text-sm font-semibold">
          {notice && <li>🃏 {notice}</li>}
          {streak.usedProtection && (
            <li>🧊 {streak.usedProtection === "freeze" ? t.freezeUsed : t.rescueUsed}</li>
          )}
          {streak.rescuable && <li>🛟 {t.rescueHint}</li>}
          {pet && (pet.hunger < 50 || pet.happy < 40) && (
            <li>
              🐾{" "}
              <Link href={`/${locale}/stale-hry/mazlicci`} className="underline">
                {fill(t.petHungry, pet.name || "🐾")}
              </Link>
            </li>
          )}
          {cityCoins > 0 && (
            <li>
              🏙️{" "}
              <Link href={`/${locale}/stale-hry/mesto`} className="underline">
                {fill(t.cityCoins, cityCoins)}
              </Link>
            </li>
          )}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/${locale}/opakovani`}
          className={`btn-bouncy px-4 py-2 text-sm font-bold ${reviewDue > 0 ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)]"}`}
        >
          🔁 {fill(getReviewText(locale).reviewCta, reviewDue)}
        </Link>
        <Link href={`/${locale}/mapa`} className="btn-bouncy bg-[var(--surface)] px-4 py-2 text-sm font-bold">
          🗺️ {getReviewText(locale).mapNav}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-[var(--edge)] px-3 py-2">
        <span className="text-sm font-semibold">🧊 {fill(t.freezes, `${streak.freezes}/${streak.maxFreezes}`)}</span>
        <span className="min-w-0 flex-1 text-xs text-[var(--muted)]">{t.freezeInfo}</span>
        <button
          type="button"
          disabled={busy === "buy-freeze" || streak.freezes >= streak.maxFreezes}
          onClick={() => post("buy-freeze", { action: "buy-freeze" })}
          className="btn-bouncy shrink-0 bg-[var(--surface)] px-3 py-1.5 text-xs font-bold disabled:opacity-40"
        >
          {fill(t.buyFreeze, streak.freezePrice)}
        </button>
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
              <span className="w-14 shrink-0 text-right text-xs font-bold text-[var(--accent-500)]">{fill(t.bonus, q.bonusXp)}</span>
              {claimButton(`quest:${q.id}`, q.done, q.claimed)}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-bold text-[var(--muted)]">{t.weekly}</h3>
        <ul className="flex flex-col gap-2">
          {weekly.map((w) => (
            <li key={w.id} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.weeklyNames[w.id]}</p>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
                  <div className="h-full bg-[var(--brand-500)]" style={{ width: `${(w.progress / w.target) * 100}%` }} />
                </div>
              </div>
              <span className="w-14 shrink-0 text-right text-xs font-bold text-[var(--accent-500)]">{fill(t.bonus, w.bonusXp)}</span>
              {claimButton(`weekly:${w.id}:${weekKey}`, w.done, w.claimed)}
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
                <span className="text-xs font-bold text-[var(--accent-500)]">{fill(t.bonus, a.bonusXp)}</span>
                {a.done ? (
                  claimButton(`achievement:${a.id}`, true, a.claimed)
                ) : (
                  <span className="text-xs font-bold text-[var(--muted)]">
                    {a.value}/{a.target}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// Malý souhrn po dokončení testu, hry nebo únikovky: série a počet odměn
// k vyzvednutí s odkazem na výzvy. Nic neukazuje hostům ani při chybě.
export function DailyRecap({ locale, refreshKey = 0 }: { locale: Locale; refreshKey?: number }) {
  const t = getDailyText(locale);
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/denni-vyzvy")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.loggedIn && !data.error) setSnap(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (!snap) return null;
  const ready =
    snap.quests.filter((q) => q.done && !q.claimed).length +
    snap.weekly.filter((w) => w.done && !w.claimed).length +
    snap.milestones.filter((m) => m.reached && !m.claimed).length +
    snap.achievements.filter((a) => a.done && !a.claimed).length;

  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          🔥 {fill(t.streak, snap.streak.current)}
        </p>
        {ready > 0 && <p className="text-xs font-semibold text-[var(--accent-500)]">{fill(t.recapClaimable, ready)}</p>}
      </div>
      <a
        href={`/${locale}${ready > 0 ? "/profil" : ""}`}
        className="btn-bouncy bg-[var(--surface)] px-3 py-1.5 text-xs font-bold"
      >
        {t.recapOpen}
      </a>
    </div>
  );
}
