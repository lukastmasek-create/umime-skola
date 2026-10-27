"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { ACHIEVEMENT_TEXT, DAILY_TEXT, GAME_ICON, GAME_LABEL, HUB_TEXT, WEEKLY_TEXT, fill, tr } from "@/i18n/hub";
import { EVENT_TEXT, eventLabel } from "@/i18n/events";
import { notifyAccountChanged } from "@/lib/account-events";
import type { AchievementView, DailyView, GameKey } from "@/lib/idle/hub";

type EventBonus = { total: number; events: string[]; focus: boolean };
type Payload = {
  points: number;
  daily: DailyView[];
  weekly?: DailyView[];
  events?: Record<"base" | "city" | "farm" | "pets", EventBonus>;
  achievements: AchievementView[];
  reward?: number;
};

const GAMES: GameKey[] = ["farm", "city", "base", "pets", "learn"];
const fmtNum = (n: number) => n.toLocaleString("cs-CZ").replace(/ /g, " ");

function Bar({ value, max, done }: { value: number; max: number; done: boolean }) {
  return (
    <div className="h-3 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div className="h-full rounded-full" style={{ width: `${max ? Math.min(100, (value / max) * 100) : 0}%`, background: done ? "var(--accent-green)" : "var(--brand-500)", transition: "width 0.4s ease" }} />
    </div>
  );
}

function Row({
  text,
  value,
  target,
  reward,
  done,
  claimed,
  busy,
  onClaim,
  locale,
}: {
  text: string;
  value: number;
  target: number;
  reward: number;
  done: boolean;
  claimed: boolean;
  busy: boolean;
  onClaim: () => void;
  locale: Locale;
}) {
  return (
    <li className={`flex flex-col gap-2 rounded-xl border-2 p-3 ${done && !claimed ? "border-[var(--accent-green)]" : "border-[var(--border-soft)]"} bg-[var(--surface)]`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm font-semibold ${claimed ? "text-[var(--muted)] line-through" : ""}`}>{text}</p>
        <span className="pill shrink-0 bg-[var(--accent-yellow)] px-2 py-0.5 text-[#16132b]">+{reward} {tr(HUB_TEXT.points, locale)}</span>
      </div>
      <Bar value={value} max={target} done={done} />
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-[var(--muted)]">
          {fmtNum(value)} / {fmtNum(target)}
        </span>
        {claimed ? (
          <span className="text-xs font-bold text-[var(--accent-green)]">✓ {tr(HUB_TEXT.claimed, locale)}</span>
        ) : (
          <button type="button" onClick={onClaim} disabled={!done || busy} className="btn-bouncy bg-[var(--brand-500)] px-3 py-1 text-xs font-bold text-white disabled:opacity-40">
            {tr(HUB_TEXT.claim, locale)}
          </button>
        )}
      </div>
    </li>
  );
}

export function IdleHub({ locale }: { locale: Locale }) {
  const [data, setData] = useState<Payload | null>(null);
  const [login, setLogin] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/stale-hry/prehled", { cache: "no-store" });
      if (res.status === 401) return setLogin(true);
      if (!res.ok) return setError(true);
      setData((await res.json()) as Payload);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    // Načtení přehledu při otevření stránky; stav se nastaví až po odpovědi serveru.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function claim(kind: "daily" | "weekly" | "achievement", id: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/stale-hry/prehled", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "claim", kind, id }) });
      const body = (await res.json().catch(() => ({}))) as Payload & { error?: string };
      if (res.ok) {
        setData(body);
        setToast(fill(tr(HUB_TEXT.got, locale), { n: body.reward ?? 0 }));
        setTimeout(() => setToast(null), 2500);
        notifyAccountChanged();
      } else {
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  if (login) {
    return (
      <section className="card mt-10 flex flex-col items-start gap-3 p-5">
        <h2 className="text-xl font-bold">{tr(HUB_TEXT.title, locale)}</h2>
        <p className="text-[var(--muted)]">{tr(HUB_TEXT.loginHint, locale)}</p>
        <Link href={`/${locale}/prihlaseni`} className="btn-bouncy btn-primary btn-lg">
          {tr(HUB_TEXT.login, locale)}
        </Link>
      </section>
    );
  }
  if (error) return <p className="mt-10 text-sm text-[var(--danger)]">{tr(HUB_TEXT.error, locale)}</p>;
  if (!data) return null;

  const open = data.achievements.filter((a) => !a.claimed);
  const ready = data.achievements.filter((a) => a.done && !a.claimed).length;
  // Pro každý žebříček ukážeme nejbližší nesplněný (nebo čekající na vybrání), ostatní po rozbalení.
  const nextPerMetric = new Map<string, AchievementView>();
  for (const a of open) if (!nextPerMetric.has(a.metric)) nextPerMetric.set(a.metric, a);
  const visible = expanded ? data.achievements : [...nextPerMetric.values()];

  return (
    <section className="mt-10 flex flex-col gap-8" aria-labelledby="hub-title">
      <div>
        <h2 id="hub-title" className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {tr(HUB_TEXT.title, locale)}
        </h2>
        {toast && (
          <p role="status" className="pill mt-2 bg-[var(--accent-green)] px-3 py-1 text-white">
            {toast}
          </p>
        )}
      </div>

      {data.events && (
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">🎉 {tr(EVENT_TEXT.title, locale)}</h3>
          {(["farm", "city", "base", "pets"] as const).filter((g) => data.events![g].total > 0).length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{tr(EVENT_TEXT.none, locale)}</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {(["farm", "city", "base", "pets"] as const)
                .filter((g) => data.events![g].total > 0)
                .map((g) => {
                  const e = data.events![g];
                  return (
                    <li key={g} className="flex items-center justify-between gap-3 rounded-xl border-2 border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2 text-sm">
                      <span className="min-w-0">
                        <span className="font-bold">{tr(EVENT_TEXT.games[g], locale)}</span>
                        <span className="block truncate text-xs text-[var(--muted)]">{eventLabel(e.events, e.focus, locale)}</span>
                      </span>
                      <span className="pill shrink-0 bg-[var(--accent-500)] px-2 py-0.5 text-white">+{Math.round(e.total * 100)} %</span>
                    </li>
                  );
                })}
            </ul>
          )}
          <p className="text-xs text-[var(--faint)]">{tr(EVENT_TEXT.hint, locale)}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold">{tr(HUB_TEXT.daily, locale)}</h3>
        <p className="text-sm text-[var(--muted)]">{tr(HUB_TEXT.dailyHint, locale)}</p>
        <ul className="grid gap-3 md:grid-cols-3">
          {data.daily.map((d) => (
            <Row key={d.id} locale={locale} text={fill(tr(DAILY_TEXT[d.id] ?? HUB_TEXT.daily, locale), { n: fmtNum(d.target) })} value={d.progress} target={d.target} reward={d.reward} done={d.done} claimed={d.claimed} busy={busy} onClaim={() => claim("daily", d.id)} />
          ))}
        </ul>
      </div>

      {data.weekly && data.weekly.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold">{tr(HUB_TEXT.weekly, locale)}</h3>
          <p className="text-sm text-[var(--muted)]">{tr(HUB_TEXT.weeklyHint, locale)}</p>
          <ul className="grid gap-3 md:grid-cols-3">
            {data.weekly.map((d) => (
              <Row key={d.id} locale={locale} text={fill(tr(WEEKLY_TEXT[d.id] ?? HUB_TEXT.weekly, locale), { n: fmtNum(d.target) })} value={d.progress} target={d.target} reward={d.reward} done={d.done} claimed={d.claimed} busy={busy} onClaim={() => claim("weekly", d.id)} />
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold">
            {tr(HUB_TEXT.achievements, locale)} {ready > 0 && <span className="pill ml-2 bg-[var(--accent-green)] px-2 py-0.5 text-white">{ready}</span>}
          </h3>
          <button type="button" onClick={() => setExpanded((v) => !v)} className="text-sm font-bold text-[var(--brand-600)] hover:underline">
            {expanded ? tr(HUB_TEXT.showLess, locale) : tr(HUB_TEXT.showAll, locale)}
          </button>
        </div>
        {GAMES.map((g) => {
          const list = visible.filter((a) => a.game === g);
          if (list.length === 0) return null;
          return (
            <div key={g} className="flex flex-col gap-2">
              <h4 className="text-sm font-bold text-[var(--muted)]">
                <span aria-hidden>{GAME_ICON[g]}</span> {tr(GAME_LABEL[g], locale)}
              </h4>
              <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {list.map((a) => (
                  <Row key={a.id} locale={locale} text={fill(tr(ACHIEVEMENT_TEXT[a.metric], locale), { n: fmtNum(a.target) })} value={a.progress} target={a.target} reward={a.reward} done={a.done} claimed={a.claimed} busy={busy} onClaim={() => claim("achievement", a.id)} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
