"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { fill } from "@/i18n/profile";
import { getSocialText } from "@/i18n/social";
import type { Locale } from "@/i18n/config";

type Person = { id: string; name: string | null; avatar: string | null };
type Group = {
  id: string;
  name: string;
  code: string;
  isOwner: boolean;
  members: (Person & { xp: number })[];
  target: number;
  total: number;
  done: boolean;
};
type Duel = {
  id: string;
  status: string;
  incoming: boolean;
  endsAt: string | null;
  ended: boolean;
  me: number;
  them: number;
  other: Person;
  won: boolean;
  tied: boolean;
  claimed: boolean;
  reward: number;
};
type Parta = { loggedIn: true; userId: string; groups: Group[]; duels: Duel[] };
type League = {
  loggedIn: true;
  tier: number;
  movement: number;
  rank: number;
  size: number;
  promote: number;
  demote: number;
  endsAt: string;
  rows: (Person & { me: boolean; xp: number })[];
};

const TIER_COLORS = ["#cd7f32", "#b8c0cc", "#ffc933", "#7fd6e8", "#8f9bff"];

// Parta, souboje a týdenní liga: společný cíl, soutěž jeden na jednoho
// a žebříček 30 hráčů stejné úrovně.
export function SocialView({ locale }: { locale: Locale }) {
  const t = getSocialText(locale);
  const [parta, setParta] = useState<Parta | null | "guest" | "error">(null);
  const [league, setLeague] = useState<League | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [p, l] = await Promise.all([fetch("/api/parta").then((r) => r.json()), fetch("/api/liga").then((r) => r.json())]);
      if (p.loggedIn === false) return setParta("guest");
      if (p.error) return setParta("error");
      setParta(p);
      if (l.loggedIn && !l.error) setLeague(l);
    } catch {
      setParta("error");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function act(payload: Record<string, string>) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/parta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setParta(data);
        setName("");
        setCode("");
      } else {
        setMessage(t.actionError);
      }
    } catch {
      setMessage(t.actionError);
    } finally {
      setBusy(false);
    }
  }

  const heading = { fontFamily: "var(--font-heading)" } as const;
  const date = (iso: string) => new Date(iso).toLocaleDateString(locale);
  const personName = (p: Person) => p.name ?? t.noName;

  if (parta === null) return <div className="card h-48 animate-pulse bg-[var(--surface-muted)]" aria-hidden />;
  if (parta === "error") return <p className="card p-6 text-[var(--muted)]">{t.loadError}</p>;
  if (parta === "guest") {
    return (
      <div className="card flex flex-col items-start gap-3 p-6">
        <p className="text-[var(--muted)]">{t.loginNeeded}</p>
        <Link href={`/${locale}/prihlaseni`} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">
          {t.login}
        </Link>
      </div>
    );
  }

  const teammates = new Map<string, Person>();
  for (const g of parta.groups) for (const m of g.members) if (m.id !== parta.userId) teammates.set(m.id, m);
  const duelOpponents = new Set(parta.duels.map((d) => d.other.id));
  const input = "min-w-0 flex-1 rounded-lg border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm";

  return (
    <div className="flex flex-col gap-8">
      {message && <p className="card p-3 text-sm font-semibold text-[var(--danger)]">{message}</p>}

      {league && (
        <section className="card flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold" style={heading}>
                {t.league}:{" "}
                <span style={{ color: TIER_COLORS[league.tier] }}>{t.tiers[league.tier]}</span>
              </h2>
              <p className="text-sm text-[var(--muted)]">{t.leagueHint}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-extrabold" style={heading}>
                {fill(t.place, `${league.rank} / ${league.size}`)}
              </p>
              <p className="text-xs text-[var(--muted)]">{fill(t.leagueEnds, date(league.endsAt))}</p>
            </div>
          </div>
          {league.movement > 0 && <p className="text-sm font-semibold">⬆️ {t.movedUp}</p>}
          {league.movement < 0 && <p className="text-sm font-semibold">⬇️ {t.movedDown}</p>}
          <ol className="flex flex-col gap-1.5">
            {league.rows.map((row, i) => (
              <li key={row.id}>
                {i === league.promote && league.promote > 0 && (
                  <p className="my-1 text-xs font-bold text-[var(--accent-500)]">▲ {t.promoteZone}</p>
                )}
                {i === league.rows.length - league.demote && league.demote > 0 && (
                  <p className="my-1 text-xs font-bold text-[var(--danger)]">▼ {t.demoteZone}</p>
                )}
                <div
                  className={`flex items-center gap-3 rounded-xl border-2 px-3 py-1.5 ${
                    row.me ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]" : "border-[var(--border-soft)]"
                  }`}
                >
                  <span className="w-6 text-sm font-bold">{i + 1}.</span>
                  <Avatar id={row.avatar} size={28} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{personName(row)}</span>
                  <span className="text-sm font-bold">{row.xp} XP</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-extrabold" style={heading}>
            {t.groups}
          </h2>
          <p className="text-sm text-[var(--muted)]">{t.groupsHint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form
            className="flex min-w-[16rem] flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              act({ action: "create", name });
            }}
          >
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder={t.groupNamePlaceholder} />
            <button disabled={busy || name.trim().length < 2} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">
              {t.create}
            </button>
          </form>
          <form
            className="flex min-w-[16rem] flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              act({ action: "join", code });
            }}
          >
            <input className={input} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={12} placeholder={t.codePlaceholder} />
            <button disabled={busy || code.trim().length < 4} className="btn-bouncy bg-[var(--surface)] px-4 py-2 text-sm font-bold disabled:opacity-40">
              {t.join}
            </button>
          </form>
        </div>

        {parta.groups.map((g) => (
          <div key={g.id} className="card flex flex-col gap-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-extrabold" style={heading}>
                {g.name}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="pill bg-[var(--surface-muted)] px-2.5 py-1 font-bold">
                  {t.code}: {g.code}
                </span>
                <button disabled={busy} onClick={() => act({ action: "leave", groupId: g.id })} className="font-semibold text-[var(--muted)] underline">
                  {t.leave}
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">
                {fill(t.teamGoal, `${Math.min(g.total, g.target)} / ${g.target}`)} {g.done && `· 🎉 ${t.goalDone}`}
              </p>
              <div className="mt-1 h-3 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
                <div className="h-full bg-[var(--accent-500)]" style={{ width: `${Math.min(100, (g.total / g.target) * 100)}%` }} />
              </div>
            </div>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {g.members.map((m) => (
                <li key={m.id} className="flex items-center gap-2 rounded-xl border-2 border-[var(--border-soft)] px-2.5 py-1.5">
                  <Avatar id={m.avatar} size={26} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {m.id === parta.userId ? t.you : personName(m)}
                  </span>
                  <span className="text-xs font-bold text-[var(--muted)]">{m.xp} XP</span>
                  {m.id !== parta.userId && !duelOpponents.has(m.id) && (
                    <button
                      disabled={busy}
                      onClick={() => act({ action: "challenge", opponentId: m.id })}
                      className="btn-bouncy bg-[var(--surface)] px-2 py-1 text-xs font-bold"
                    >
                      ⚔️ {t.challenge}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-extrabold" style={heading}>
            ⚔️ {t.duels}
          </h2>
          <p className="text-sm text-[var(--muted)]">{t.duelsHint}</p>
        </div>
        {parta.duels.length === 0 && <p className="text-sm text-[var(--muted)]">{teammates.size === 0 ? t.groupsHint : t.noDuels}</p>}
        {parta.duels.map((d) => (
          <div key={d.id} className="card flex flex-wrap items-center gap-3 p-4">
            <Avatar id={d.other.avatar} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{personName(d.other)}</p>
              {d.status === "pending" ? (
                <p className="text-xs text-[var(--muted)]">{d.incoming ? fill(t.incoming, personName(d.other)) : t.sent}</p>
              ) : (
                <p className="text-xs text-[var(--muted)]">
                  {t.you} {d.me} : {d.them} {personName(d.other)} · {d.ended ? (d.won ? t.won : d.tied ? t.tie : t.lost) : `${t.running}, ${fill(t.endsOn, date(d.endsAt!))}`}
                </p>
              )}
            </div>
            {d.incoming && (
              <div className="flex gap-2">
                <button disabled={busy} onClick={() => act({ action: "accept", duelId: d.id })} className="btn-bouncy bg-[var(--brand-500)] px-3 py-1.5 text-xs font-bold text-white">
                  {t.accept}
                </button>
                <button disabled={busy} onClick={() => act({ action: "decline", duelId: d.id })} className="btn-bouncy bg-[var(--surface)] px-3 py-1.5 text-xs font-bold">
                  {t.decline}
                </button>
              </div>
            )}
            {d.ended && (d.won || d.tied) &&
              (d.claimed ? (
                <span className="text-xs font-bold text-[var(--muted)]">✓ {t.claimed}</span>
              ) : (
                <button disabled={busy} onClick={() => act({ action: "claim", duelId: d.id })} className="btn-bouncy bg-[var(--accent-500)] px-3 py-1.5 text-xs font-bold text-white">
                  {fill(t.claim, d.reward)}
                </button>
              ))}
          </div>
        ))}
      </section>
    </div>
  );
}
