"use client";

import { MODES, isChoice, isSyncMode } from "@/lib/live/logic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { fmt, getLiveText } from "@/i18n/live";
import type { Locale } from "@/i18n/config";
import type { LiveMode, SetItem } from "@/lib/live/types";
import { liveApi, saveHost } from "./api";
import { errorText } from "./LiveRoom";
import { PcardTape } from "@/components/PcardArt";
import { CountGlyph, CourseGlyph, DifficultyGlyph, SearchGlyph, SetGlyph } from "./FormIcons";
import { ModeScene } from "./ModeScenes";

// Barvy karet režimů: stejná paleta jako karty na homepage.
const MODE_ACCENT: Record<LiveMode, string> = { QUIZ: "#8fd0ff", RACE: "#7ee0b0", GOLD: "#ffc933", STREAK: "#ff8a6b", SURVIVAL: "#c9a8ff", TEAMS: "#ffb3c7" };

type Course = { slug: string; title: string; category: string; subject: string | null; grade: number | null; questions: number };
type SetRow = { id: string; title: string; questions: SetItem[] };

/** Dlaždice bento mřížky: vstupní animace na obalu, zvednutí a ikona na vnitřní kartě (hero-in by jinak přebil hover). */
function BentoTile({ accent, icon, title, span = "", delay = 0, children }: { accent: string; icon: ReactNode; title: string; span?: string; delay?: number; children: ReactNode }) {
  return (
    <div className={`hero-in ${span}`} style={{ ["--d" as string]: `${delay}s` } as CSSProperties}>
      <div
        className="group flex h-full flex-col gap-3 rounded-[22px] border-2 border-[var(--ink)] p-4 shadow-[7px_9px_0_rgba(8,8,24,0.55)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[11px_14px_0_rgba(8,8,24,0.55)] focus-within:-translate-y-1 focus-within:shadow-[11px_14px_0_rgba(8,8,24,0.55)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        style={{ background: `color-mix(in srgb, ${accent} 15%, #1b1a30)` }}
      >
        <div className="flex items-center gap-3">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-[var(--ink)] shadow-[3px_4px_0_rgba(8,8,24,0.5)] transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none"
            style={{ background: `color-mix(in srgb, ${accent} 42%, #1b1a30)` }}
          >
            {icon}
          </span>
          <span className="text-sm font-extrabold uppercase tracking-wider" style={{ color: accent }}>
            {title}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

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
  const available = source === "course" ? chosenCourse?.questions : chosenSet?.questions.filter(isChoice).length;
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

  // Samotné pole je průhledné: papírovou kartu kolem něj (BentoTile) nese okraj, barvu i stín.
  const fieldInner = "w-full bg-transparent text-base text-[#f4f3ff] outline-none [&_option]:bg-[#1b1a30]";
  const label = "flex flex-col gap-1 text-sm font-semibold";

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.create.title}
        </h1>
        <p className="text-[var(--muted)]">{t.create.subtitle}</p>
      </div>

      <div className="lobby-panel text-[#f4f3ff]" style={{ ["--ink" as string]: "rgba(244,239,227,0.88)" } as CSSProperties}>
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          {t.create.source}
        </h2>

        <div role="tablist" className="mx-auto mb-6 grid max-w-xl grid-cols-2 gap-4">
          {(["course", "set"] as const).map((s, i) => {
            const accent = s === "course" ? "#8fd0ff" : "#c9a8ff";
            const on = source === s;
            return (
              <div key={s} className="hero-in" style={{ ["--d" as string]: `${i * 0.08}s` } as CSSProperties}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setSource(s)}
                  className="group flex w-full flex-col items-center gap-2 rounded-[22px] border-2 border-[var(--ink)] p-4 shadow-[7px_9px_0_rgba(8,8,24,0.55)] transition-[transform,box-shadow,background] duration-300 ease-out hover:-translate-y-1 hover:shadow-[11px_14px_0_rgba(8,8,24,0.55)] active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none"
                  style={{
                    background: `color-mix(in srgb, ${accent} ${on ? 40 : 15}%, #1b1a30)`,
                    outline: on ? "3px solid #fff" : "none",
                    outlineOffset: 4,
                  } as CSSProperties}
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-[var(--ink)] transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none" style={{ background: `color-mix(in srgb, ${accent} 42%, #1b1a30)` }}>
                    {s === "course" ? <CourseGlyph size={38} /> : <SetGlyph size={38} />}
                  </span>
                  <span className="font-extrabold">{s === "course" ? t.create.fromCourse : t.create.fromSet}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {source === "course" ? (
            <BentoTile accent="#8fd0ff" icon={<SearchGlyph size={34} />} title={t.create.course} span="sm:col-span-2" delay={0.12}>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.create.search} className={fieldInner} />
              <div role="listbox" aria-label={t.create.course} className="live-scroll max-h-72 overflow-y-auto rounded-xl bg-[#0b1030]/60 p-1.5" style={{ ["--ac" as string]: "#8fd0ff" } as CSSProperties}>
                {courses === null && <p className="px-3 py-2 text-sm text-[var(--muted)]">{t.create.loading}</p>}
                {filtered.map((c, i) => {
                  const on = c.slug === slug;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      role="option"
                      aria-selected={on}
                      onClick={() => setSlug(c.slug)}
                      className="live-item flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ac)_18%,transparent)]"
                      style={{ animationDelay: `${Math.min(i, 14) * 0.03}s`, background: on ? "color-mix(in srgb, var(--ac) 35%, transparent)" : undefined }}
                    >
                      <span className="truncate">{c.title}</span>
                      {c.grade ? <span className="shrink-0 text-xs opacity-70">{c.grade}.</span> : null}
                    </button>
                  );
                })}
              </div>
            </BentoTile>
          ) : sets === "login" ? (
            <p className="text-[var(--muted)] sm:col-span-2">
              {t.create.loginForSets}{" "}
              <Link href={`/${locale}/prihlaseni`} className="font-bold text-[var(--brand-600)] hover:underline">
                →
              </Link>
            </p>
          ) : (
            <BentoTile accent="#c9a8ff" icon={<SetGlyph size={34} />} title={t.create.fromSet} span="sm:col-span-2" delay={0.12}>
              {Array.isArray(sets) && sets.length === 0 && <p className="text-[var(--muted)]">{t.create.noSets}</p>}
              {Array.isArray(sets) && sets.length > 0 && (
                <select value={setId} onChange={(e) => setSetId(e.target.value)} size={Math.min(6, sets.length + 1)} aria-label={t.create.fromSet} className={fieldInner}>
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
            </BentoTile>
          )}

          {source === "course" && (
            <BentoTile accent="#ffc933" icon={<DifficultyGlyph size={34} />} title={t.create.difficulty} delay={0.2}>
              <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} className={fieldInner}>
                <option value={0}>{t.create.anyDifficulty}</option>
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </BentoTile>
          )}

          <BentoTile accent="#ff8a6b" icon={<CountGlyph size={34} />} title={t.create.count} delay={source === "course" ? 0.28 : 0.2}>
            <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} className={fieldInner} />
            {available !== undefined && <span className="text-xs font-normal text-[var(--muted)]">{fmt(t.create.available, { n: available })}</span>}
          </BentoTile>
        </div>
      </div>

      <div className="lobby-panel">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          {t.create.mode}
        </h2>
        <div className="pcard-pile pcard-pile-wide" role="radiogroup" aria-label={t.create.mode}>
          {MODES.map((m, i) => (
            <div key={m} className="pcard-slot" style={{ ["--ac" as string]: MODE_ACCENT[m] }}>
              <button type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className="pcard pcard-static w-full text-left">
                <span className="pcard-in">
                  <span className="pcard-num" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pcard-title">{t.create.modes[m].name}</span>
                  <span className="pcard-text">{t.create.modes[m].description}</span>
                  <ModeScene mode={m} />
                  <span className="pcard-go" aria-hidden>
                    {mode === m ? "✓" : "→"}
                  </span>
                </span>
                <PcardTape />
              </button>
            </div>
          ))}
        </div>
      </div>

      <section className="card flex flex-col gap-4 p-5">
        <h3 className="font-bold">{t.create.settings}</h3>
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
