"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import { DUEL_QUESTIONS, HANDICAPS, cleanHandicap, duelResult, type DuelResult, type Handicap } from "@/lib/pro-tools/family";
import type { PlanDay } from "@/lib/pro-tools/plan";
import { errorText, proFetch } from "./api";
import { PlanList } from "./StudyPlan";

type Member = { id: string; name: string; safe: boolean; doneThisWeek: number; doneTotal: number; due: number; weak: string[] };
type FamilyView =
  | { role: "none" | "member"; canStart?: boolean }
  | { role: "owner"; members: Member[]; invites: { code: string; exp: number }[]; seatsLeft: number };

const heading = { fontFamily: "var(--font-heading)" } as const;

// Správa rodiny: členové, pozvánky, dětský bezpečný režim a tip „Začínat s dítětem“.
export function FamilyHub({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [view, setView] = useState<FamilyView | null>(null);
  const [error, setError] = useState("");
  const [code, setCode] = useState(() => (typeof window === "undefined" ? "" : (new URLSearchParams(window.location.search).get("kod") ?? "")));
  const [msg, setMsg] = useState("");
  const [link, setLink] = useState("");
  const [tips, setTips] = useState<Record<string, { tip: string; course: string | null }>>({});
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const r = await proFetch<FamilyView>("/api/pro/rodina");
    if (r.ok) setView(r.data);
    else setError(errorText(t, r.error));
  }, [t]);

  useEffect(() => {
    void proFetch<FamilyView>("/api/pro/rodina").then((r) => (r.ok ? setView(r.data) : setError(errorText(t, r.error))));
  }, [t]);

  async function act(body: Record<string, unknown>, then?: () => void) {
    setError("");
    const r = await proFetch<Record<string, unknown>>("/api/pro/rodina", body);
    if (!r.ok) return setError(errorText(t, r.error));
    then?.();
    await load();
    return r.data;
  }

  async function invite() {
    setError("");
    const r = await proFetch<{ invite: { code: string } }>("/api/pro/rodina", { action: "invite" });
    if (!r.ok) return setError(errorText(t, r.error));
    setLink(`${window.location.origin}/${locale}/pro/rodina?kod=${encodeURIComponent(r.data.invite.code)}`);
    await load();
  }

  async function tip(id: string) {
    setBusy(id);
    const r = await proFetch<{ tip: string; course: string | null }>("/api/pro/rodina", { action: "tip", userId: id, locale });
    setBusy("");
    if (r.ok) setTips((x) => ({ ...x, [id]: r.data }));
    else setError(errorText(t, r.error));
  }

  if (!view) return <p className="text-sm text-[var(--muted)]">{error || t.loading}</p>;

  if (view.role !== "owner") {
    return (
      <div className="card grid gap-3 p-5">
        <p className="text-sm font-semibold">{view.role === "member" ? t.famMember : t.famNone}</p>
        {view.role === "member" ? (
          <button type="button" onClick={() => void act({ action: "leave" })} className="btn-bouncy btn-secondary btn-lg w-fit">
            {t.famLeave}
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void act({ action: "join", code: code.trim() }, () => setMsg(t.famJoined));
            }}
            className="flex gap-2"
          >
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t.famCode} className="min-w-0 flex-1 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm" />
            <button type="submit" disabled={!code.trim()} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
              {t.famJoin}
            </button>
          </form>
        )}
        {view.canStart && (
          <button type="button" onClick={() => void act({ action: "start" })} className="btn-bouncy btn-secondary btn-lg w-fit">
            {t.famStart}
          </button>
        )}
        {msg && <p className="text-sm font-semibold text-[var(--accent-green)]">{msg}</p>}
        {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      <section className="card grid gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold" style={heading}>
            {t.famInvite}
          </h2>
          <span className="text-sm text-[var(--muted)]">{t.famSeats.replace("{n}", String(view.seatsLeft))}</span>
        </div>
        <p className="text-sm text-[var(--muted)]">{t.famInviteHint}</p>
        <button type="button" onClick={() => void invite()} disabled={view.seatsLeft <= 0} className="btn-bouncy btn-lg w-fit bg-[var(--brand-500)] font-bold text-white disabled:opacity-50">
          {t.create}
        </button>
        {link && (
          <div className="flex gap-2">
            <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface-muted)] px-3 py-2 text-xs" />
            <button type="button" onClick={() => void navigator.clipboard?.writeText(link).then(() => setMsg(t.copied))} className="btn-bouncy btn-secondary px-3 py-2 text-sm font-bold">
              {msg === t.copied ? t.copied : t.copy}
            </button>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold" style={heading}>
          {t.famMembers}
        </h2>
        {view.members.length === 0 && <p className="card p-4 text-sm text-[var(--muted)]">{t.famNoMembers}</p>}
        <ul className="grid gap-3">
          {view.members.map((m) => (
            <li key={m.id} className="card grid gap-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold">{m.name || "—"}</p>
                <button type="button" onClick={() => void act({ action: "remove", userId: m.id })} className="text-sm font-semibold text-[#ff5d73] hover:underline">
                  {t.famRemove}
                </button>
              </div>
              <p className="text-sm text-[var(--muted)]">
                {t.famWeek.replace("{n}", String(m.doneThisWeek))} · {t.famDue.replace("{n}", String(m.due))}
                {m.weak.length > 0 && <> · {t.famWeak.replace("{w}", m.weak.join(", "))}</>}
              </p>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1" checked={m.safe} onChange={(e) => void act({ action: "setSafe", userId: m.id, safe: e.target.checked })} />
                <span>
                  <span className="font-semibold">{t.famSafe}</span>
                  <span className="block text-xs text-[var(--muted)]">{t.famSafeHint}</span>
                </span>
              </label>
              <button type="button" onClick={() => void tip(m.id)} disabled={busy === m.id} className="btn-bouncy btn-secondary w-fit px-4 py-2 text-sm font-bold disabled:opacity-50">
                {busy === m.id ? t.thinking : t.famTip}
              </button>
              {tips[m.id] && (
                <div className="rounded-xl bg-[var(--surface-muted)] p-3 text-sm">
                  {tips[m.id].tip ? (
                    <>
                      {tips[m.id].course && <p className="mb-1 text-xs font-bold text-[var(--faint)]">{t.famTipFor.replace("{c}", tips[m.id].course ?? "")}</p>}
                      <p className="whitespace-pre-wrap">{tips[m.id].tip}</p>
                    </>
                  ) : (
                    <p>{t.famTipNone}</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

type DuelQ = { id: string; prompt: string; options: string[]; correctIndex: number };
type Who = "child" | "parent";

function shuffled<T>(a: T[]): T[] {
  const c = [...a];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

// Rodinný souboj: dítě a rodič na jednom zařízení, dítě má náskok v bodech, rodič odpovídá na čas.
export function FamilyDuel({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<{ slug: string; title: string }[]>([]);
  const [slug, setSlug] = useState("");
  const [handicap, setHandicap] = useState<Handicap>(2);
  const [questions, setQuestions] = useState<DuelQ[]>([]);
  const [step, setStep] = useState(0);
  const [who, setWho] = useState<Who>("child");
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ child: 0, parent: 0 });
  const [left, setLeft] = useState(0);
  const [result, setResult] = useState<DuelResult | null>(null);
  const [error, setError] = useState("");
  const answered = useRef(false);

  const finish = useCallback(
    (s: { child: number; parent: number }) => setResult(duelResult(s.child, s.parent, handicap)),
    [handicap],
  );

  const next = useCallback(
    (s: { child: number; parent: number }, from: Who, idx: number) => {
      answered.current = false;
      setPicked(null);
      if (from === "child") {
        setWho("parent");
        setLeft(HANDICAPS[handicap].parentSeconds);
      } else if (idx + 1 >= DUEL_QUESTIONS) {
        finish(s);
      } else {
        setStep(idx + 1);
        setWho("child");
      }
    },
    [handicap, finish],
  );

  const answer = useCallback(
    (i: number | null) => {
      if (answered.current) return;
      answered.current = true;
      const correct = i !== null && i === questions[step]?.correctIndex;
      setPicked(i ?? -1);
      setScore((s) => ({ ...s, [who]: s[who] + (correct ? 1 : 0) }));
    },
    [questions, step, who],
  );

  // Časovač rodiče: po vypršení se odpověď počítá jako chybná.
  useEffect(() => {
    if (who !== "parent" || picked !== null || questions.length === 0 || result) return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [who, picked, questions.length, result]);
  useEffect(() => {
    if (who === "parent" && picked === null && left <= 0 && questions.length > 0 && !result) answer(null);
  }, [left, who, picked, questions.length, result, answer]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const r = await proFetch<{ courses: { slug: string; title: string }[] }>(`/api/pro/offline?q=${encodeURIComponent(q)}`);
    if (r.ok) setHits(r.data.courses);
    else setError(errorText(t, r.error));
  }

  async function start() {
    if (!slug) return setError(t.duelNeedCourse);
    setError("");
    const r = await proFetch<{ questions: DuelQ[] }>(`/api/pro/offline?slug=${encodeURIComponent(slug)}`);
    if (!r.ok) return setError(errorText(t, r.error));
    const qs = shuffled(r.data.questions.filter((x) => x.options.length >= 2)).slice(0, DUEL_QUESTIONS);
    if (qs.length < 3) return setError(t.errNoQuestions);
    answered.current = false;
    setQuestions(qs);
    setStep(0);
    setWho("child");
    setPicked(null);
    setScore({ child: 0, parent: 0 });
    setResult(null);
  }

  if (result) {
    const name = result.winner === "child" ? t.duelWinChild : result.winner === "parent" ? t.duelWinParent : t.duelDraw;
    return (
      <div className="card p-6 text-center">
        <p className="text-sm font-semibold text-[var(--muted)]">{t.duelResult}</p>
        <p className="my-2 text-4xl font-extrabold" style={heading}>
          {name}
        </p>
        <p className="text-sm">
          {t.duelChild}: {result.child} ({t.duelBonus.replace("{n}", String(HANDICAPS[handicap].childBonus))}) · {t.duelParent}: {result.parent}
        </p>
        <button type="button" onClick={() => { setQuestions([]); setResult(null); }} className="btn-bouncy btn-secondary btn-lg mt-4">
          {t.duelAgain}
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="card grid gap-4 p-5">
        <p className="text-sm text-[var(--muted)]">{t.duelIntro}</p>
        <div>
          <p className="mb-2 text-sm font-bold">{t.duelCourse}</p>
          <form onSubmit={search} className="mb-2 flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.offlineSearch} className="min-w-0 flex-1 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm" />
            <button type="submit" className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white">
              {t.search}
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {hits.map((c) => (
              <button key={c.slug} type="button" onClick={() => setSlug(c.slug)} className={`btn-bouncy px-3 py-1.5 text-sm font-bold ${slug === c.slug ? "bg-[var(--brand-500)] text-white" : "btn-secondary"}`}>
                {c.title}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold">{t.duelHandicap}</p>
          <div className="flex flex-wrap gap-2">
            {([1, 2, 3] as Handicap[]).map((h) => (
              <button key={h} type="button" onClick={() => setHandicap(cleanHandicap(h))} className={`btn-bouncy px-4 py-2 text-sm font-bold ${handicap === h ? "bg-[var(--brand-500)] text-white" : "btn-secondary"}`}>
                {{ 1: t.duelH1, 2: t.duelH2, 3: t.duelH3 }[h]} · {t.duelBonus.replace("{n}", String(HANDICAPS[h].childBonus))}, {t.duelSeconds.replace("{n}", String(HANDICAPS[h].parentSeconds))}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
        <button type="button" onClick={() => void start()} className="btn-bouncy btn-lg bg-[var(--brand-500)] font-bold text-white">
          {t.duelStart}
        </button>
      </div>
    );
  }

  const cur = questions[step];
  return (
    <div className="grid gap-4">
      <div className="card flex items-center justify-between p-4 text-sm font-bold">
        <span>
          {step + 1}/{questions.length}
        </span>
        <span>{t.duelTurn.replace("{who}", who === "child" ? t.duelChild : t.duelParent)}</span>
        <span className={who === "parent" && left <= 3 ? "text-[#ff5d73]" : "text-[var(--muted)]"}>{who === "parent" && picked === null ? `⏱ ${Math.max(0, left)}` : ""}</span>
      </div>
      <div className="card p-5">
        <p className="mb-4 text-lg font-semibold">{cur.prompt}</p>
        <div className="grid gap-2">
          {cur.options.map((o, i) => {
            const state = picked === null ? "" : i === cur.correctIndex ? "bg-[var(--accent-green)] text-[#16132b]" : i === picked ? "bg-[#ff5d73] text-white" : "";
            return (
              <button key={i} type="button" disabled={picked !== null} onClick={() => answer(i)} className={`rounded-xl border-2 border-[var(--edge)] px-4 py-3 text-left text-sm font-semibold ${state || "bg-[var(--surface)]"}`}>
                {o}
              </button>
            );
          })}
        </div>
      </div>
      {picked !== null && (
        <button type="button" onClick={() => next(score, who, step)} className="btn-bouncy btn-lg bg-[var(--brand-500)] font-bold text-white">
          {t.duelNextTurn}
        </button>
      )}
    </div>
  );
}

// Plán na prázdniny: 15 minut denně od-do, každý sedmý den volno.
export function HolidayPlan({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [plan, setPlan] = useState<PlanDay[] | null>(null);
  const [error, setError] = useState("");

  async function make(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await proFetch<{ plan: PlanDay[] }>(`/api/pro/prazdniny?od=${from}&do=${to}`);
    if (r.ok) setPlan(r.data.plan);
    else setError(errorText(t, r.error));
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-[var(--muted)]">{t.holIntro}</p>
      <form onSubmit={make} className="card flex flex-wrap items-end gap-3 p-4">
        <label className="grid gap-1 text-sm font-bold">
          {t.holFrom}
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          {t.holTo}
          <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm font-normal" />
        </label>
        <button type="submit" className="btn-bouncy btn-lg bg-[var(--brand-500)] font-bold text-white">
          {t.holMake}
        </button>
      </form>
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      {plan && <PlanList plan={plan} locale={locale} />}
    </div>
  );
}
