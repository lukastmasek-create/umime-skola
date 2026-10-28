"use client";

import { MODES, isSyncMode } from "@/lib/live/logic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { fmt, getLiveText } from "@/i18n/live";
import type { Locale } from "@/i18n/config";
import type { LiveMode, LiveQuestion } from "@/lib/live/types";
import { liveApi, saveHost } from "./api";
import { errorText } from "./LiveRoom";

type Course = { slug: string; title: string; category: string; subject: string | null; grade: number | null; questions: number };
type SetRow = { id: string; title: string; questions: LiveQuestion[] };

const MODE_ICON: Record<LiveMode, string> = { QUIZ: "⏱️", RACE: "🏁", GOLD: "🪙", STREAK: "🔥", SURVIVAL: "❤️", TEAMS: "🤝" };

export function CreateGame({ locale }: { locale: Locale }) {
  const t = getLiveText(locale);
  const router = useRouter();
  const [source, setSource] = useState<"course" | "set">("course");
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [sets, setSets] = useState<SetRow[] | null | "login">(null);
  const [query, setQuery] = useState("");
  const [slug, setSlug] = useState("");
  const [setId, setSetId] = useState("");
  const [difficulty, setDifficulty] = useState(0);
  const [count, setCount] = useState(10);
  const [mode, setMode] = useState<LiveMode>("QUIZ");
  const [seconds, setSeconds] = useState(20);
  const [raceTarget, setRaceTarget] = useState(10);
  const [durationMin, setDurationMin] = useState(5);
  const [lives, setLives] = useState(3);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [c, s] = await Promise.all([fetch("/api/live/courses").then((r) => r.json()).catch(() => []), liveApi<{ sets: SetRow[] }>("/sets")]);
      if (!alive) return;
      setCourses(Array.isArray(c) ? (c as Course[]) : []);
      if (s.ok) setSets(s.sets);
      else setSets(s.status === 401 ? "login" : []);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (courses ?? []).filter((c) => !q || c.title.toLowerCase().includes(q)).slice(0, 200);
  }, [courses, query]);

  const chosenCourse = courses?.find((c) => c.slug === slug);
  const chosenSet = Array.isArray(sets) ? sets.find((s) => s.id === setId) : undefined;
  const available = source === "course" ? chosenCourse?.questions : chosenSet?.questions.length;
  const ready = source === "course" ? !!slug : !!setId;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError(null);
    const body = {
      mode,
      source: source === "course" ? { type: "course", slug, difficulty: difficulty || undefined, count } : { type: "set", id: setId, count },
      settings: { seconds, raceTarget, durationMin, lives },
    };
    const r = await liveApi<{ pin: string; hostSecret: string }>("/rooms", { body });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    saveHost(r.pin, r.hostSecret);
    router.push(`/${locale}/hrat-spolecne/${r.pin}`);
  }

  const field = "rounded-lg border-2 px-3 py-2 outline-none focus:border-[var(--brand-500)]";
  const label = "flex flex-col gap-1 text-sm font-semibold";

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.create.title}
        </h1>
        <p className="text-[var(--muted)]">{t.create.subtitle}</p>
      </div>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="text-lg font-bold">{t.create.source}</h2>
        <div className="flex gap-2" role="tablist">
          {(["course", "set"] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={source === s}
              onClick={() => setSource(s)}
              className={`btn-bouncy px-4 py-2 text-sm font-bold ${source === s ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)]"}`}
            >
              {s === "course" ? t.create.fromCourse : t.create.fromSet}
            </button>
          ))}
        </div>

        {source === "course" ? (
          <div className="flex flex-col gap-3">
            <label className={label}>
              {t.create.course}
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.create.search} className={field} />
            </label>
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              size={6}
              aria-label={t.create.course}
              className={`${field} w-full`}
            >
              {courses === null && <option disabled>{t.create.loading}</option>}
              {filtered.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                  {c.grade ? ` (${c.grade}.)` : ""}
                </option>
              ))}
            </select>
            <label className={label}>
              {t.create.difficulty}
              <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} className={field}>
                <option value={0}>{t.create.anyDifficulty}</option>
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : sets === "login" ? (
          <p className="text-[var(--muted)]">
            {t.create.loginForSets}{" "}
            <Link href={`/${locale}/prihlaseni`} className="font-bold text-[var(--brand-600)] hover:underline">
              →
            </Link>
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {Array.isArray(sets) && sets.length === 0 && <p className="text-[var(--muted)]">{t.create.noSets}</p>}
            {Array.isArray(sets) && sets.length > 0 && (
              <select value={setId} onChange={(e) => setSetId(e.target.value)} size={Math.min(6, sets.length + 1)} aria-label={t.create.fromSet} className={`${field} w-full`}>
                {sets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.questions.length})
                  </option>
                ))}
              </select>
            )}
            <Link href={`/${locale}/hrat-spolecne/sady`} className="text-sm font-bold text-[var(--brand-600)] hover:underline">
              {t.create.manageSets} →
            </Link>
          </div>
        )}

        <label className={label}>
          {t.create.count}
          <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} className={`${field} w-28`} />
          {available !== undefined && <span className="text-xs font-normal text-[var(--muted)]">{fmt(t.create.available, { n: available })}</span>}
        </label>
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="text-lg font-bold">{t.create.mode}</h2>
        <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label={t.create.mode}>
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`btn-bouncy flex flex-col items-start gap-1 p-4 text-left ${mode === m ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)]"}`}
            >
              <span aria-hidden className="text-3xl">{MODE_ICON[m]}</span>
              <span className="font-bold">{t.create.modes[m].name}</span>
              <span className="text-xs">{t.create.modes[m].description}</span>
            </button>
          ))}
        </div>

        <h3 className="mt-2 font-bold">{t.create.settings}</h3>
        {isSyncMode(mode) ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              {t.create.seconds}: {seconds} s
              <input type="range" min={5} max={60} step={5} value={seconds} onChange={(e) => setSeconds(Number(e.target.value))} />
            </label>
            {mode === "SURVIVAL" && (
              <label className={label}>
                {t.create.lives}: {lives}
                <input type="range" min={1} max={5} value={lives} onChange={(e) => setLives(Number(e.target.value))} />
              </label>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {mode === "RACE" && (
              <label className={label}>
                {t.create.raceTarget}: {raceTarget}
                <input type="range" min={3} max={30} value={raceTarget} onChange={(e) => setRaceTarget(Number(e.target.value))} />
              </label>
            )}
            <label className={label}>
              {t.create.duration}: {durationMin} {t.create.minutes}
              <input type="range" min={1} max={20} value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} />
            </label>
          </div>
        )}
      </section>

      {error && (
        <p role="alert" className="font-semibold text-[var(--danger)]">
          {errorText(t, error)}
        </p>
      )}
      <button type="submit" disabled={busy || !ready} className="btn-bouncy btn-primary btn-lg self-start disabled:opacity-50">
        {busy ? t.create.creating : t.create.submit}
      </button>
    </form>
  );
}
