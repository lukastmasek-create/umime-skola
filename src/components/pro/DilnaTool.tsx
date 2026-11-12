"use client";

import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getDilnaText, type DilnaText } from "@/i18n/dilna";
import {
  cleanGame, DILNA_MAX_ITEMS, DILNA_MAX_PAIRS, DILNA_MAX_PROMPTS, DILNA_MAX_STEPS, DILNA_KINDS, type DilnaKind, type GameData, type StoryStep,
} from "@/lib/pro-tools/dilna";
import { imageToDataUrl, proFetch } from "./api";
import { DilnaPlay } from "./DilnaPlay";

type Tab = "make" | "library" | "shared";
type Source = "text" | "course" | "gap";
type Team = { id: string; name: string };
type Row = { id: string; title: string; game: GameData; sharedAt: string | null };
type Draft = { id?: string; title: string; game: GameData };
type Hit = { slug: string; title: string };
type GapRow = { courseId: string; title: string; students: number; items: number };
type CourseRef = { slug?: string; courseId?: string; title: string };

const input = "w-full rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm";
const btn = "btn-secondary px-3 py-1.5 text-sm font-bold";
const primary = "btn-bouncy bg-[var(--brand-500)] px-4 py-2 font-bold text-white disabled:opacity-50";

const blankStep = (): StoryStep => ({ clue: "", question: "", options: ["", ""], correctIndex: 0 });

function emptyGame(kind: DilnaKind): GameData {
  if (kind === "pairs") return { kind, pairs: [0, 1, 2].map(() => ({ left: "", right: "" })) };
  if (kind === "order") return { kind, items: ["", "", ""] };
  if (kind === "story") return { kind, steps: [blankStep()] };
  return { kind: "speak", prompts: [0, 1, 2].map(() => ({ prompt: "", model: "" })) };
}

function move<T>(arr: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const out = [...arr];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

function errorMessage(t: DilnaText, code: string): string {
  if (code === "network") return t.errNetwork;
  if (code === "ai-unavailable") return t.errAi;
  if (code === "rate-limited") return t.errLimit;
  if (code === "library-full") return t.errLibraryFull;
  if (code === "not-assignable") return t.errNotAssignable;
  if (code === "no-questions") return t.errNoQuestions;
  if (code === "course-not-found") return t.errCourse;
  if (code === "invalid-game") return t.tooFew;
  return t.errGeneric;
}

export function DilnaTool({ locale }: { locale: Locale }) {
  const t = getDilnaText(locale);
  const [tab, setTab] = useState<Tab>("make");
  const [kind, setKind] = useState<DilnaKind>("pairs");
  const [source, setSource] = useState<Source>("text");
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [course, setCourse] = useState<CourseRef | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");
  const [gaps, setGaps] = useState<GapRow[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [library, setLibrary] = useState<Row[] | null>(null);
  const [shared, setShared] = useState<Row[] | null>(null);
  const [playing, setPlaying] = useState<GameData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTeams = useCallback(() => {
    void proFetch<{ teams: Team[] }>("/api/pro/skola?view=teams").then((r) => {
      if (!r.ok) return;
      setTeams(r.data.teams);
      setTeamId((prev) => prev || r.data.teams[0]?.id || "");
    });
  }, []);

  const loadLibrary = useCallback(() => {
    void proFetch<{ games: Row[] }>("/api/pro/dilna").then((r) => {
      if (r.ok) setLibrary(r.data.games);
      else setError(errorMessage(t, r.error));
    });
  }, [t]);

  const loadShared = useCallback(() => {
    void proFetch<{ games: Row[] }>("/api/pro/dilna?view=shared").then((r) => {
      if (r.ok) setShared(r.data.games);
      else setError(errorMessage(t, r.error));
    });
  }, [t]);

  useEffect(() => {
    loadTeams();
    loadLibrary();
  }, [loadTeams, loadLibrary]);

  useEffect(() => {
    if (tab === "shared") loadShared();
  }, [tab, loadShared]);

  useEffect(() => {
    if (source !== "gap" || !teamId) return;
    void proFetch<{ courses: GapRow[] }>(`/api/pro/skola?view=gaps&teamId=${teamId}`).then((r) => {
      setGaps(r.ok ? r.data.courses : []);
    });
  }, [source, teamId]);

  function search() {
    void proFetch<{ courses: Hit[] }>(`/api/pro/offline?q=${encodeURIComponent(q)}`).then((r) => {
      setHits(r.ok ? r.data.courses.map((c) => ({ slug: c.slug, title: c.title })) : []);
    });
  }

  async function photo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImage(await imageToDataUrl(file));
  }

  async function generate() {
    setBusy(true);
    setError("");
    setNotice("");
    const body: Record<string, unknown> = { action: "generate", kind, locale, source: source === "text" ? "text" : "course" };
    if (source === "text") {
      if (image) body.image = image;
      else body.text = text;
    } else if (course) {
      if (course.courseId) body.courseId = course.courseId;
      if (course.slug) body.slug = course.slug;
    }
    const r = await proFetch<{ title: string; game: GameData }>("/api/pro/dilna", body);
    setBusy(false);
    if (!r.ok) return setError(errorMessage(t, r.error));
    setDraft({ title: r.data.title, game: r.data.game });
  }

  async function saveDraft() {
    if (!draft) return;
    if (!cleanGame(draft.game.kind, draft.game)) return setError(t.tooFew);
    setBusy(true);
    setError("");
    const r = await proFetch<{ id: string }>("/api/pro/dilna", { action: "save", id: draft.id, kind: draft.game.kind, title: draft.title, game: draft.game });
    setBusy(false);
    if (!r.ok) return setError(errorMessage(t, r.error));
    setDraft({ ...draft, id: r.data.id });
    setNotice(t.saved);
    loadLibrary();
  }

  async function act(body: Record<string, unknown>, done: string) {
    setError("");
    setNotice("");
    const r = await proFetch<unknown>("/api/pro/dilna", body);
    if (!r.ok) return setError(errorMessage(t, r.error));
    if (done) setNotice(done);
    loadLibrary();
    loadShared();
  }

  if (playing) return <DilnaPlay game={playing} t={t} onExit={() => setPlaying(null)} />;

  const draftKind = draft?.game.kind;

  return (
    <div className="grid gap-5">
      <section className="card grid gap-2 p-5">
        <h2 className="text-lg font-bold">{t.title}</h2>
        <p className="text-sm text-[var(--muted)]">{t.intro}</p>
      </section>

      <div className="flex flex-wrap gap-2" role="tablist">
        {(["make", "library", "shared"] as Tab[]).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`btn-bouncy px-3 py-1.5 text-sm font-bold ${tab === k ? "bg-[var(--brand-500)] text-white" : "btn-secondary"}`}>
            {k === "make" ? t.tabMake : k === "library" ? t.tabLibrary : t.tabShared}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="card p-4 text-sm font-semibold">{error}</p>}
      {notice && <p role="status" className="card p-4 text-sm font-semibold">{notice}</p>}

      {tab === "make" && (
        <>
          <section className="card grid gap-3 p-5">
            <p className="text-sm font-bold">{t.kindLabel}</p>
            <div className="flex flex-wrap gap-2">
              {DILNA_KINDS.map((k) => (
                <button key={k} type="button" disabled={!!draft} aria-pressed={kind === k} onClick={() => setKind(k)} className={`px-3 py-1.5 text-sm font-bold ${kind === k ? "btn-bouncy bg-[var(--brand-500)] text-white" : "btn-secondary"} disabled:opacity-50`}>
                  {t.kinds[k].name}
                </button>
              ))}
            </div>
            <p className="text-sm text-[var(--muted)]">{t.kinds[draftKind ?? kind].hint}</p>
            {draft && (
              <button type="button" onClick={() => { setDraft(null); setNotice(""); }} className={`${btn} w-fit`}>{t.newDraft}</button>
            )}
          </section>

          {!draft && (
            <section className="card grid gap-3 p-5">
              <p className="text-sm font-bold">{t.sourceLabel}</p>
              <div className="flex flex-wrap gap-2">
                {(["text", "course", "gap"] as Source[]).map((s) => (
                  <button key={s} type="button" aria-pressed={source === s} onClick={() => { setSource(s); setCourse(null); }} className={`px-3 py-1.5 text-sm font-bold ${source === s ? "btn-bouncy bg-[var(--brand-500)] text-white" : "btn-secondary"}`}>
                    {s === "text" ? t.sourceText : s === "course" ? t.sourceCourse : t.sourceGap}
                  </button>
                ))}
              </div>

              {source === "text" && (
                <>
                  <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={!!image} rows={5} maxLength={6000} placeholder={t.textPlaceholder} className={input} />
                  <label className="flex items-center gap-2 text-sm font-bold">
                    <input type="file" accept="image/*" capture="environment" onChange={photo} />
                    {t.photo}
                  </label>
                  {image && <button type="button" onClick={() => setImage("")} className={`${btn} w-fit`}>{t.remove}</button>}
                </>
              )}

              {source === "course" && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchCourse} className={`${input} max-w-sm`} />
                    <button type="button" onClick={search} className={btn}>{t.search}</button>
                  </div>
                  {hits.length === 0 && q && <p className="text-sm text-[var(--muted)]">{t.searchEmpty}</p>}
                  <ul className="grid gap-1">
                    {hits.map((h) => (
                      <li key={h.slug}>
                        <button type="button" onClick={() => setCourse({ slug: h.slug, title: h.title })} className="text-left text-sm font-semibold underline">{h.title}</button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {source === "gap" && (
                <>
                  <label className="grid w-fit gap-1 text-sm font-bold">
                    {t.chooseTeam}
                    <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className={input}>
                      {teams.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                    </select>
                  </label>
                  {gaps?.length === 0 && <p className="text-sm text-[var(--muted)]">{t.gapEmpty}</p>}
                  <ul className="grid gap-1">
                    {gaps?.map((g) => (
                      <li key={g.courseId}>
                        <button type="button" onClick={() => setCourse({ courseId: g.courseId, title: g.title })} className="text-left text-sm font-semibold underline">{g.title} ({g.students})</button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {course && <p className="text-sm">{t.pickedCourse} <strong>{course.title}</strong></p>}

              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={busy || (source === "text" ? !text.trim() && !image : !course)} onClick={generate} className={`${primary} w-fit`}>
                  {busy ? t.generating : t.generate}
                </button>
                <button type="button" onClick={() => { setDraft({ title: "", game: emptyGame(kind) }); setError(""); setNotice(""); }} className={`${btn} w-fit`}>
                  {t.blankGame}
                </button>
              </div>
            </section>
          )}

          {draft && (
            <section className="card grid gap-3 p-5">
              <h3 className="font-bold">{t.draftTitle}</h3>
              <label className="grid gap-1 text-sm font-bold">
                {t.gameTitle}
                <input value={draft.title} maxLength={80} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={input} />
              </label>
              <Editor game={draft.game} t={t} onChange={(game) => setDraft({ ...draft, game })} />
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={busy} onClick={saveDraft} className={primary}>{t.save}</button>
                <button type="button" onClick={() => setPlaying(draft.game)} className={`${btn} px-4 py-2`}>{t.play}</button>
              </div>
            </section>
          )}
        </>
      )}

      {tab === "library" && (
        <section className="card grid gap-3 p-5">
          <h3 className="font-bold">{t.libraryTitle}</h3>
          {teams.length > 0 && (
            <label className="grid w-fit gap-1 text-sm font-bold">
              {t.chooseTeam}
              <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className={input}>
                {teams.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </label>
          )}
          {library === null && <p className="text-sm text-[var(--muted)]">…</p>}
          {library?.length === 0 && <p className="text-sm text-[var(--muted)]">{t.libraryEmpty}</p>}
          <ul className="grid gap-2">
            {library?.map((g) => (
              <li key={g.id} className="grid gap-2 rounded-xl border-2 border-[var(--line)] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold">{g.title}</span>
                  <span className="text-xs text-[var(--muted)]">{t.kinds[g.game.kind].name}</span>
                  {g.sharedAt && <span className="rounded-full bg-[var(--brand-500)] px-2 py-0.5 text-xs font-bold text-white">{t.sharedBadge}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setPlaying(g.game)} className={btn}>{t.play}</button>
                  <button type="button" onClick={() => { setDraft({ id: g.id, title: g.title, game: g.game }); setKind(g.game.kind); setTab("make"); }} className={btn}>{t.edit}</button>
                  {g.game.kind !== "speak" && (
                    <button type="button" disabled={!teamId} onClick={() => act({ action: "assign", id: g.id, teamId, locale }, t.assigned)} className={btn}>{t.assign}</button>
                  )}
                  <button type="button" onClick={() => act({ action: "share", id: g.id, shared: g.sharedAt === null }, "")} className={btn}>
                    {g.sharedAt ? t.unshare : t.share}
                  </button>
                  <button type="button" onClick={() => act({ action: "delete", id: g.id }, "")} className={btn}>{t.remove}</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "shared" && (
        <section className="card grid gap-3 p-5">
          <h3 className="font-bold">{t.sharedTitle}</h3>
          {shared === null && <p className="text-sm text-[var(--muted)]">…</p>}
          {shared?.length === 0 && <p className="text-sm text-[var(--muted)]">{t.sharedEmpty}</p>}
          <ul className="grid gap-2">
            {shared?.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[var(--line)] p-3">
                <span className="text-sm font-bold">{g.title} <span className="text-xs font-normal text-[var(--muted)]">· {t.kinds[g.game.kind].name}</span></span>
                <span className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setPlaying(g.game)} className={btn}>{t.play}</button>
                  <button type="button" onClick={() => act({ action: "copy", id: g.id }, t.copied)} className={btn}>{t.copy}</button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** Editor obsahu podle typu hry. */
function Editor({ game, t, onChange }: { game: GameData; t: DilnaText; onChange: (g: GameData) => void }) {
  if (game.kind === "pairs") {
    return (
      <div className="grid gap-2">
        {game.pairs.map((p, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input aria-label={t.left} value={p.left} maxLength={120} className={input} onChange={(e) => onChange({ ...game, pairs: game.pairs.map((x, j) => (j === i ? { ...x, left: e.target.value } : x)) })} />
            <input aria-label={t.right} value={p.right} maxLength={120} className={input} onChange={(e) => onChange({ ...game, pairs: game.pairs.map((x, j) => (j === i ? { ...x, right: e.target.value } : x)) })} />
            <button type="button" onClick={() => onChange({ ...game, pairs: game.pairs.filter((_, j) => j !== i) })} className={btn}>{t.remove}</button>
          </div>
        ))}
        {game.pairs.length < DILNA_MAX_PAIRS ? (
          <button type="button" onClick={() => onChange({ ...game, pairs: [...game.pairs, { left: "", right: "" }] })} className={`${btn} w-fit`}>{t.addPair}</button>
        ) : <p className="text-sm">{t.limitReached}</p>}
      </div>
    );
  }

  if (game.kind === "order") {
    return (
      <div className="grid gap-2">
        {game.items.map((it, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[auto_1fr_auto_auto_auto] sm:items-center">
            <span className="text-sm font-bold">{i + 1}.</span>
            <input aria-label={`${i + 1}`} value={it} maxLength={120} className={input} onChange={(e) => onChange({ ...game, items: game.items.map((x, j) => (j === i ? e.target.value : x)) })} />
            <button type="button" onClick={() => onChange({ ...game, items: move(game.items, i, -1) })} className={btn}>{t.moveUp}</button>
            <button type="button" onClick={() => onChange({ ...game, items: move(game.items, i, 1) })} className={btn}>{t.moveDown}</button>
            <button type="button" onClick={() => onChange({ ...game, items: game.items.filter((_, j) => j !== i) })} className={btn}>{t.remove}</button>
          </div>
        ))}
        {game.items.length < DILNA_MAX_ITEMS ? (
          <button type="button" onClick={() => onChange({ ...game, items: [...game.items, ""] })} className={`${btn} w-fit`}>{t.addItem}</button>
        ) : <p className="text-sm">{t.limitReached}</p>}
      </div>
    );
  }

  if (game.kind === "story") {
    const setStep = (i: number, s: StoryStep) => onChange({ ...game, steps: game.steps.map((x, j) => (j === i ? s : x)) });
    return (
      <div className="grid gap-4">
        {game.steps.map((s, i) => (
          <div key={i} className="grid gap-2 rounded-xl border-2 border-[var(--line)] p-3">
            <textarea aria-label={`${t.stepClue} ${i + 1}`} value={s.clue} rows={2} maxLength={300} placeholder={t.stepClue} className={input} onChange={(e) => setStep(i, { ...s, clue: e.target.value })} />
            <input aria-label={`${t.stepQuestion} ${i + 1}`} value={s.question} maxLength={120} placeholder={t.stepQuestion} className={input} onChange={(e) => setStep(i, { ...s, question: e.target.value })} />
            {s.options.map((o, k) => (
              <div key={k} className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1 text-xs font-bold">
                  <input type="radio" name={`s${i}`} checked={s.correctIndex === k} onChange={() => setStep(i, { ...s, correctIndex: k })} />
                  {t.correctOption}
                </label>
                <input aria-label={`${t.stepOption} ${k + 1}`} value={o} maxLength={120} className={`${input} flex-1`} onChange={(e) => setStep(i, { ...s, options: s.options.map((x, j) => (j === k ? e.target.value : x)) })} />
                {s.options.length > 2 && (
                  <button type="button" onClick={() => setStep(i, { ...s, options: s.options.filter((_, j) => j !== k), correctIndex: s.correctIndex > k ? s.correctIndex - 1 : Math.min(s.correctIndex, s.options.length - 2) })} className={btn}>{t.remove}</button>
                )}
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {s.options.length < 4 && <button type="button" onClick={() => setStep(i, { ...s, options: [...s.options, ""] })} className={btn}>{t.addOption}</button>}
              {game.steps.length > 1 && <button type="button" onClick={() => onChange({ ...game, steps: game.steps.filter((_, j) => j !== i) })} className={btn}>{t.remove}</button>}
            </div>
          </div>
        ))}
        {game.steps.length < DILNA_MAX_STEPS && <button type="button" onClick={() => onChange({ ...game, steps: [...game.steps, blankStep()] })} className={`${btn} w-fit`}>{t.addStep}</button>}
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {game.prompts.map((p, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input aria-label={t.promptLabel} value={p.prompt} maxLength={300} placeholder={t.promptLabel} className={input} onChange={(e) => onChange({ ...game, prompts: game.prompts.map((x, j) => (j === i ? { ...x, prompt: e.target.value } : x)) })} />
          <input aria-label={t.modelLabel} value={p.model} maxLength={300} placeholder={t.modelLabel} className={input} onChange={(e) => onChange({ ...game, prompts: game.prompts.map((x, j) => (j === i ? { ...x, model: e.target.value } : x)) })} />
          <button type="button" onClick={() => onChange({ ...game, prompts: game.prompts.filter((_, j) => j !== i) })} className={btn}>{t.remove}</button>
        </div>
      ))}
      {game.prompts.length < DILNA_MAX_PROMPTS ? (
        <button type="button" onClick={() => onChange({ ...game, prompts: [...game.prompts, { prompt: "", model: "" }] })} className={`${btn} w-fit`}>{t.addPrompt}</button>
      ) : <p className="text-sm">{t.limitReached}</p>}
    </div>
  );
}
