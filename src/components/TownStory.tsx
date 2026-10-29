"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTownStoryText, type Line } from "@/i18n/town-story";
import { CHAPTERS, type ObjectiveProgress } from "@/lib/town-story";
import { notifyAccountChanged } from "@/lib/account-events";
import { sfx } from "@/lib/market-sfx";
import type { Locale } from "@/i18n/config";

type State = { claimed: number; total: number; progress: ObjectiveProgress[]; ready: boolean; loggedIn: boolean };

const PORTRAIT: Record<Line["who"], string> = { hrdina: "🧑‍🎤", knihovnice: "👩‍🏫", pekar: "🧑‍🍳", kluk: "🧒", farmar: "🧑‍🌾", babicka: "👵" };

// Příběh městečka: kapitola se vypráví jako dialog; cíl se plní hraním (povídání, srdíčka, minihry), odměnu vyplatí server.
export function TownStory({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const t = getTownStoryText(locale);
  const [state, setState] = useState<State | "loading" | "error">("loading");
  const [lines, setLines] = useState<Line[] | null>(null); // právě hraný dialog
  const [at, setAt] = useState(0);
  const [reward, setReward] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let off = false;
    fetch("/api/mestecko/pribeh")
      .then((r) => r.json())
      .then((d) => {
        if (off) return;
        if (d.error) return setState("error");
        setState({ claimed: d.claimed, total: d.total, progress: d.progress, ready: !!d.ready, loggedIn: d.loggedIn !== false });
      })
      .catch(() => !off && setState("error"));
    return () => {
      off = true;
    };
  }, []);

  if (state === "loading") return <div className="h-32 animate-pulse rounded-2xl bg-[var(--surface-muted)]" aria-hidden />;
  if (state === "error") return <p className="text-sm text-[var(--muted)]">{t.error}</p>;

  const heading = { fontFamily: "var(--font-heading)" } as const;
  const chapterId = CHAPTERS[Math.min(state.claimed, CHAPTERS.length - 1)].id;
  const cur = state.claimed < state.total ? t.chapters[chapterId] : null;

  function play(list: Line[]) {
    setLines(list);
    setAt(0);
    sfx.pop();
  }
  function advance() {
    if (!lines) return;
    if (at + 1 < lines.length) {
      setAt(at + 1);
      sfx.pop();
    } else setLines(null);
  }
  async function claim() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/mestecko/pribeh", { method: "POST" });
      const d = await res.json();
      if (res.ok && d.ok) {
        sfx.dock();
        setReward(d.reward);
        setState({ claimed: d.claimed, total: d.total, progress: d.progress, ready: !!d.ready, loggedIn: true });
        if (cur) play(cur.outro);
        notifyAccountChanged();
      } else setMsg(d.error === "not-ready" ? t.notReady : t.error);
    } catch {
      setMsg(t.error);
    } finally {
      setBusy(false);
    }
  }

  // dialog přes celý modál
  if (lines) {
    const l = lines[at];
    const hero = l.who === "hrdina";
    return (
      <div className="flex flex-col gap-4">
        {reward !== null && at === 0 && <p className="pill self-start bg-[var(--accent-yellow)] px-3 py-1.5 text-sm font-bold text-[#16132b]">{t.reward.replace("{n}", String(reward))}</p>}
        <div className={`flex items-end gap-3 ${hero ? "flex-row-reverse" : ""}`}>
          <span aria-hidden className="story-portrait">
            {PORTRAIT[l.who]}
          </span>
          <div key={`${at}-${l.text}`} className="story-bubble">
            <p className="mb-1 text-xs font-extrabold text-[var(--muted)]">{t.who[l.who]}</p>
            <p className="font-semibold">{l.text}</p>
          </div>
        </div>
        <button type="button" onClick={advance} className="btn-bouncy btn-primary self-end px-5 py-2 text-sm font-bold">
          {at + 1 < lines.length ? t.next : t.close}
        </button>
      </div>
    );
  }

  if (!cur) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-lg font-bold" style={heading}>
          ⭐ {t.title}
        </p>
        <p className="font-semibold">{t.finished}</p>
        <button type="button" onClick={onClose} className="btn-bouncy btn-primary self-start px-5 py-2 text-sm font-bold">
          {t.close}
        </button>
      </div>
    );
  }

  const def = CHAPTERS[state.claimed];
  const label = (p: ObjectiveProgress) => {
    if (p.kind === "talked") return t.objective.talked.replace("{n}", String(p.need));
    if (p.kind === "hearts") return t.objective.hearts.replace("{h}", String(p.hearts)).replace("{n}", String(p.need));
    if (p.kind === "minis") return t.objective.minis;
    return t.objective.sumfp.replace("{n}", String(p.need));
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{t.chapter.replace("{a}", String(state.claimed + 1)).replace("{b}", String(state.total))}</p>
        <p className="text-xl font-extrabold" style={heading}>
          {cur.title}
        </p>
      </div>
      <div className="flex gap-1" aria-hidden>
        {CHAPTERS.map((c, i) => (
          <span key={c.id} className="h-2 flex-1 rounded-full" style={{ background: i < state.claimed ? "var(--accent-yellow)" : i === state.claimed ? "var(--brand-500)" : "var(--surface-muted)" }} />
        ))}
      </div>
      <button type="button" onClick={() => play(cur.intro)} className="btn-bouncy bg-[var(--surface-muted)] px-4 py-2 text-left text-sm font-bold">
        💬 {cur.intro[0].text.slice(0, 70)}…
      </button>
      <ul className="flex flex-col gap-2">
        {state.progress.map((p, i) => (
          <li key={i} className="rounded-xl bg-[var(--surface-muted)] p-3 text-sm font-semibold">
            <div className="flex items-center justify-between gap-2">
              <span>
                {p.have >= p.need ? "✅" : "⬜"} {label(p)}
              </span>
              <span className="tabular-nums text-xs text-[var(--muted)]">
                {p.have} / {p.need}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface)]">
              <div className="h-full rounded-full bg-[var(--brand-500)] transition-all" style={{ width: `${Math.min(100, (p.have / p.need) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
      {!state.loggedIn ? (
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm text-[var(--muted)]">{t.login}</p>
          <Link href={`/${locale}/prihlaseni`} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white">
            →
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button type="button" disabled={!state.ready || busy} onClick={claim} className="btn-bouncy btn-primary px-5 py-2.5 text-sm font-bold disabled:opacity-40">
            {t.claim} · {t.reward.replace("{n}", String(def.reward))}
          </button>
          {msg && <span className="text-xs font-bold text-[#ff5d73]">{msg}</span>}
        </div>
      )}
    </div>
  );
}
