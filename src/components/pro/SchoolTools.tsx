"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getProToolsText, type ProToolsText } from "@/i18n/pro-tools";
import { SUBJECTS } from "@/lib/taxonomy";
import { errorText, imageToDataUrl, proFetch } from "./api";
import { DilnaTool } from "./DilnaTool";
import { getDilnaText } from "@/i18n/dilna";

type Team = { id: string; name: string; members: number };
type Q = { prompt: string; options: string[]; correctIndex: number; explanation: string };
type Tab = "gaps" | "live" | "test" | "variants" | "exit" | "cover" | "meeting" | "pace" | "content" | "dilna" | "support";
const TABS: Tab[] = ["gaps", "live", "test", "variants", "exit", "cover", "meeting", "pace", "content", "dilna", "support"];
const heading = { fontFamily: "var(--font-heading)" } as const;
const input = "rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm";
const primary = "btn-bouncy btn-lg bg-[var(--brand-500)] font-bold text-white disabled:opacity-50";

type Common = { t: ProToolsText; locale: Locale; teamId: string };

// Nástroje pro učitele školního tarifu. Vše se váže na vybranou třídu (tým), kde je účet učitelem.
export function SchoolTools({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [teamId, setTeamId] = useState("");
  const [tab, setTab] = useState<Tab>("gaps");
  const [error, setError] = useState("");

  useEffect(() => {
    void proFetch<{ teams: Team[] }>("/api/pro/skola?view=teams").then((r) => {
      if (!r.ok) return setError(errorText(t, r.error));
      setTeams(r.data.teams);
      setTeamId(r.data.teams[0]?.id ?? "");
    });
  }, [t]);

  if (error) return <p className="card p-4 text-sm font-semibold">{error}</p>;
  if (!teams) return <p className="text-sm text-[var(--muted)]">{t.loading}</p>;
  if (teams.length === 0) return <p className="card p-5 text-sm">{t.noTeams}</p>;

  const common: Common = { t, locale, teamId };
  return (
    <div className="grid gap-5">
      <label className="grid w-fit gap-1 text-sm font-bold print:hidden">
        {t.teamPick}
        <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className={input}>
          {teams.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2 print:hidden" role="tablist">
        {TABS.map((k) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`btn-bouncy px-3 py-1.5 text-sm font-bold ${tab === k ? "bg-[var(--brand-500)] text-white" : "btn-secondary"}`}>
            {k === "dilna" ? getDilnaText(locale).tab : t.sTabs[k]}
          </button>
        ))}
      </div>
      <div key={`${teamId}-${tab}`}>
        {tab === "gaps" && <Gaps {...common} />}
        {tab === "live" && <Live {...common} />}
        {tab === "test" && <TestMaker {...common} />}
        {tab === "variants" && <Variants {...common} />}
        {tab === "exit" && <ExitTicket {...common} />}
        {tab === "cover" && <Cover {...common} />}
        {tab === "meeting" && <Meeting {...common} />}
        {tab === "pace" && <Pace {...common} />}
        {tab === "content" && <OwnContent {...common} />}
        {tab === "dilna" && <DilnaTool locale={locale} />}
        {tab === "support" && <Support {...common} />}
      </div>
    </div>
  );
}

function QList({ items, t, key0 = 1 }: { items: Q[]; t: ProToolsText; key0?: number }) {
  return (
    <ol className="grid gap-3" start={key0}>
      {items.map((q, i) => (
        <li key={i} className="border-t border-[var(--edge)] pt-2 first:border-t-0 first:pt-0">
          <p className="font-semibold">{q.prompt}</p>
          <p className="text-sm text-[var(--muted)]">{q.options.map((o, j) => `${String.fromCharCode(65 + j)}) ${o}`).join("   ")}</p>
          <p className="text-sm">
            <span className="font-bold text-[var(--accent-green)]">{t.sCorrect}: </span>
            {String.fromCharCode(65 + q.correctIndex)}) {q.options[q.correctIndex]}
          </p>
        </li>
      ))}
    </ol>
  );
}

// --- Mapa mezer a lekce ---
type Gap = { courseId: string; title: string; href: string; students: number; items: number };
type Lesson = { warmup: Q[]; core: Q[]; exit: Q[] };

function Gaps({ t, teamId, locale }: Common) {
  const [data, setData] = useState<{ students: number; courses: Gap[] } | null>(null);
  const [lesson, setLesson] = useState<{ courseId: string; title: string; lesson: Lesson } | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    void proFetch<{ students: number; courses: Gap[] }>(`/api/pro/skola?view=gaps&teamId=${teamId}`).then((r) => (r.ok ? setData(r.data) : setError(errorText(t, r.error))));
  }, [teamId, t]);

  async function build(c: Gap, assign: boolean) {
    setBusy(c.courseId);
    setError("");
    setMsg("");
    const r = await proFetch<{ title: string; lesson: Lesson; assignmentId?: string }>("/api/pro/skola", { action: "lesson", teamId, courseId: c.courseId, assign });
    setBusy("");
    if (!r.ok) return setError(errorText(t, r.error));
    if (assign) setMsg(t.sAssigned);
    else setLesson({ courseId: c.courseId, title: r.data.title, lesson: r.data.lesson });
  }

  if (error && !data) return <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>;
  if (!data) return <p className="text-sm text-[var(--muted)]">{t.loading}</p>;
  return (
    <div className="grid gap-4">
      <p className="text-sm text-[var(--muted)] print:hidden">{t.sGapsIntro}</p>
      {data.courses.length === 0 && <p className="card p-4 text-sm text-[var(--muted)]">{t.sGapsNone}</p>}
      <ul className="grid gap-3 print:hidden">
        {data.courses.map((c) => (
          <li key={c.courseId} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <Link href={`/${locale}/kurzy/${c.href}`} className="font-bold hover:underline">
                {c.title}
              </Link>
              <p className="text-sm text-[var(--muted)]">{t.sGapsStudents.replace("{n}", String(c.students))}</p>
            </div>
            <span className="flex gap-2">
              <button type="button" disabled={busy === c.courseId} onClick={() => void build(c, false)} className="btn-bouncy btn-secondary px-3 py-1.5 text-sm font-bold">
                {t.sLessonBuild}
              </button>
              <button type="button" disabled={busy === c.courseId} onClick={() => void build(c, true)} className="btn-bouncy bg-[var(--brand-500)] px-3 py-1.5 text-sm font-bold text-white">
                {t.sAssignClass}
              </button>
            </span>
          </li>
        ))}
      </ul>
      {msg && <p className="text-sm font-semibold text-[var(--accent-green)]">{msg}</p>}
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      {lesson && (
        <section className="card grid gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold" style={heading}>
              {t.sLesson}: {lesson.title}
            </h2>
            <button type="button" onClick={() => window.print()} className="btn-bouncy btn-secondary px-3 py-1.5 text-sm font-bold print:hidden">
              {t.sPrint}
            </button>
          </div>
          {([["warmup", t.sWarmup], ["core", t.sCore], ["exit", t.sExit]] as const).map(([k, label]) => (
            <div key={k}>
              <h3 className="mb-2 font-bold">{label}</h3>
              <QList items={lesson.lesson[k]} t={t} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

// --- Souběžná hodina ---
type LiveRow = { id: string; name: string; groupId: string | null; status: "done" | "tried" | "viewed" | "new"; attempts: number; best: number; stuck: boolean };
type LiveData = { title: string; passPercent: number; total: number; rows: LiveRow[]; groups: { id: string; name: string; members: number; done: number; avg: number }[] };

function Live({ t, teamId }: Common) {
  const [list, setList] = useState<{ id: string; title: string }[]>([]);
  const [id, setId] = useState("");
  const [data, setData] = useState<LiveData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void proFetch<{ assignments: { id: string; title: string }[] }>(`/api/pro/skola?view=assignments&teamId=${teamId}`).then((r) => {
      if (!r.ok) return setError(errorText(t, r.error));
      setList(r.data.assignments);
      setId(r.data.assignments[0]?.id ?? "");
    });
  }, [teamId, t]);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    const tick = () =>
      void proFetch<LiveData>(`/api/pro/skola?view=live&teamId=${teamId}&assignmentId=${id}`).then((r) => {
        if (!alive) return;
        if (r.ok) setData(r.data);
        else setError(errorText(t, r.error));
      });
    tick();
    const timer = setInterval(tick, 6000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [id, teamId, t]);

  const tone = { done: "bg-[var(--accent-green)] text-[#16132b]", tried: "bg-[var(--accent-yellow)] text-[#16132b]", viewed: "bg-[var(--surface-muted)]", new: "bg-[var(--surface)]" };
  const stuck = data?.rows.filter((r) => r.stuck) ?? [];
  return (
    <div className="grid gap-4">
      <p className="text-sm text-[var(--muted)]">{t.sLiveIntro}</p>
      <label className="grid w-fit gap-1 text-sm font-bold">
        {t.sLiveAssignment}
        <select value={id} onChange={(e) => setId(e.target.value)} className={input}>
          {list.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      {data && (
        <>
          <p className="text-sm font-bold">
            {t.sLiveDone}: {data.rows.filter((r) => r.status === "done").length}/{data.rows.length}
            {stuck.length > 0 && <span className="ml-3 text-[#ff5d73]">{t.sLiveStuck}: {stuck.map((s) => s.name).join(", ")}</span>}
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {data.rows.map((r) => (
              <li key={r.id} className={`flex items-center justify-between rounded-xl border-2 px-3 py-2 text-sm font-semibold ${r.stuck ? "border-[#ff5d73]" : "border-[var(--edge)]"} ${tone[r.status]}`}>
                <span>{r.name || "—"}</span>
                <span className="text-xs">{t.sLiveStatus[r.status]}{r.attempts > 0 ? ` · ${r.best} %` : ""}</span>
              </li>
            ))}
          </ul>
          {data.groups.length > 0 && (
            <section>
              <h3 className="mb-2 font-bold">{t.sLiveGroups}</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {data.groups.map((g) => (
                  <li key={g.id} className="card flex justify-between p-3 text-sm font-semibold">
                    <span>{g.name}</span>
                    <span className="text-[var(--muted)]">{g.done}/{g.members} · {t.sLiveAvg.replace("{n}", String(g.avg))}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

// --- Nepsaný test ---
function TestMaker({ t }: Common) {
  const [subject, setSubject] = useState("MATEMATIKA");
  const [grade, setGrade] = useState("");
  const [count, setCount] = useState(15);
  const [test, setTest] = useState<{ questions: Q[]; scale: { min: number; grade: number; points: number }[] } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function make() {
    setBusy(true);
    setError("");
    const r = await proFetch<{ questions: Q[]; scale: { min: number; grade: number; points: number }[] }>("/api/pro/skola", { action: "test", subject, grade: grade ? Number(grade) : undefined, count });
    setBusy(false);
    if (r.ok) setTest(r.data);
    else setError(errorText(t, r.error));
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 print:hidden">
        <p className="text-sm text-[var(--muted)]">{t.sTestIntro}</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm font-bold">
            {t.sTestSubject}
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className={input}>
              {SUBJECTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.emoji} {s.value.charAt(0) + s.value.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold">
            {t.sTestGrade}
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className={input}>
              <option value="">—</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                <option key={g} value={g}>
                  {g}.
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold">
            {t.sTestCount}
            <input type="number" min={5} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} className={`${input} w-24`} />
          </label>
          <button type="button" onClick={() => void make()} disabled={busy} className={primary}>
            {busy ? t.thinking : t.sTestMake}
          </button>
        </div>
        {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      </div>
      {test && (
        <>
          <button type="button" onClick={() => window.print()} className="btn-bouncy btn-secondary btn-lg w-fit print:hidden">
            {t.sPrint}
          </button>
          <section className="card p-6">
            <p className="mb-4 border-b border-[var(--edge)] pb-2 text-sm">{t.sTestName}: ______________________</p>
            <ol className="grid gap-4">
              {test.questions.map((q, i) => (
                <li key={i}>
                  <p className="font-semibold">{q.prompt}</p>
                  <p className="text-sm">{q.options.map((o, j) => `${String.fromCharCode(65 + j)}) ${o}`).join("    ")}</p>
                </li>
              ))}
            </ol>
          </section>
          <section className="card p-6" style={{ breakBefore: "page" }}>
            <h2 className="mb-2 font-bold">{t.sTestKey}</h2>
            <p className="mb-4 text-sm">{test.questions.map((q, i) => `${i + 1}${String.fromCharCode(65 + q.correctIndex)}`).join("  ")}</p>
            <h3 className="mb-1 font-bold">{t.sTestScale}</h3>
            <ul className="text-sm">
              {test.scale.map((s) => (
                <li key={s.grade}>
                  {s.grade}: {t.sTestPoints.replace("{n}", String(s.points))} ({s.min} %)
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

// Hledání kurzu podle názvu, společné pro nástroje, které vybírají kurz.
function CoursePicker({ t, onPick, picked }: { t: ProToolsText; onPick: (slug: string) => void; picked: string }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<{ slug: string; title: string }[]>([]);
  async function search(e: React.FormEvent) {
    e.preventDefault();
    const r = await proFetch<{ courses: { slug: string; title: string }[] }>(`/api/pro/offline?q=${encodeURIComponent(q)}`);
    if (r.ok) setHits(r.data.courses);
  }
  return (
    <div className="grid gap-2">
      <form onSubmit={search} className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.sVarCourse} className={`${input} min-w-0 flex-1`} />
        <button type="submit" className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white">
          {t.search}
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {hits.map((c) => (
          <button key={c.slug} type="button" onClick={() => onPick(c.slug)} className={`btn-bouncy px-3 py-1.5 text-sm font-bold ${picked === c.slug ? "bg-[var(--brand-500)] text-white" : "btn-secondary"}`}>
            {c.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Různá zadání ---
function Variants({ t, teamId }: Common) {
  const [slug, setSlug] = useState("");
  const [count, setCount] = useState(8);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function make() {
    setBusy(true);
    setError("");
    setMsg("");
    const r = await proFetch<{ created: number }>("/api/pro/skola", { action: "variants", teamId, slug, count });
    setBusy(false);
    if (r.ok) setMsg(t.sVarDone.replace("{n}", String(r.data.created)));
    else setError(errorText(t, r.error));
  }
  return (
    <div className="grid gap-4">
      <p className="text-sm text-[var(--muted)]">{t.sVarIntro}</p>
      <CoursePicker t={t} onPick={setSlug} picked={slug} />
      <label className="grid w-fit gap-1 text-sm font-bold">
        {t.sVarCount}
        <input type="number" min={3} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} className={`${input} w-24`} />
      </label>
      <button type="button" onClick={() => void make()} disabled={!slug || busy} className={`${primary} w-fit`}>
        {busy ? t.thinking : t.sVarMake}
      </button>
      {msg && <p className="text-sm font-semibold text-[var(--accent-green)]">{msg}</p>}
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
    </div>
  );
}

// --- Exit ticket ---
type ExitData = { title: string; assigned: number; answered: number; understood: number; questions: { prompt: string; attempts: number; wrong: number }[] };

function ExitTicket({ t, teamId }: Common) {
  const [slug, setSlug] = useState("");
  const [id, setId] = useState("");
  const [data, setData] = useState<ExitData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(
    async (aid: string) => {
      const r = await proFetch<ExitData>(`/api/pro/skola?view=exit&teamId=${teamId}&assignmentId=${aid}`);
      if (r.ok) setData(r.data);
      else setError(errorText(t, r.error));
    },
    [teamId, t],
  );

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  async function make() {
    setBusy(true);
    setError("");
    const r = await proFetch<{ assignmentId: string }>("/api/pro/skola", { action: "exit", teamId, slug });
    setBusy(false);
    if (!r.ok) return setError(errorText(t, r.error));
    setId(r.data.assignmentId);
    void load(r.data.assignmentId);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => void load(r.data.assignmentId), 8000);
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-[var(--muted)]">{t.sExitIntro}</p>
      <CoursePicker t={t} onPick={setSlug} picked={slug} />
      <button type="button" onClick={() => void make()} disabled={!slug || busy} className={`${primary} w-fit`}>
        {busy ? t.thinking : t.sExitMake}
      </button>
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      {id && data && (
        <section className="card grid gap-3 p-5">
          <h2 className="text-lg font-bold" style={heading}>
            {t.sExitResults}: {data.title}
          </h2>
          <p className="text-3xl font-extrabold">{data.understood} %</p>
          <p className="text-sm text-[var(--muted)]">{t.sExitUnderstood.replace("{p}", String(data.understood)).replace("{a}", String(data.answered)).replace("{n}", String(data.assigned))}</p>
          <ul className="grid gap-1 text-sm">
            {data.questions.map((q, i) => (
              <li key={i} className="flex justify-between gap-3 border-t border-[var(--edge)] pt-1">
                <span>{q.prompt}</span>
                <span className="shrink-0 text-[var(--muted)]">{t.sExitWrong.replace("{w}", String(q.wrong)).replace("{a}", String(q.attempts))}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// --- Suplování ---
function Cover({ t, teamId }: Common) {
  const [slug, setSlug] = useState("");
  const [note, setNote] = useState("");
  const [sheet, setSheet] = useState<{ team: string; code: string; title: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function make() {
    setBusy(true);
    setError("");
    const r = await proFetch<{ team: string; code: string; title: string }>("/api/pro/skola", { action: "cover", teamId, slug, note });
    setBusy(false);
    if (r.ok) setSheet(r.data);
    else setError(errorText(t, r.error));
  }
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 print:hidden">
        <p className="text-sm text-[var(--muted)]">{t.sCoverIntro}</p>
        <CoursePicker t={t} onPick={setSlug} picked={slug} />
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder={t.sCoverNote} className={input} />
        <button type="button" onClick={() => void make()} disabled={!slug || busy} className={`${primary} w-fit`}>
          {busy ? t.thinking : t.sCoverMake}
        </button>
        {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      </div>
      {sheet && (
        <section className="card grid gap-3 p-6">
          <h2 className="text-lg font-bold" style={heading}>
            {t.sCoverSheet}
          </h2>
          <p className="text-sm">{t.sCoverSteps.replace("{t}", sheet.team).replace("{a}", `Suplování: ${sheet.title}`).replace("{c}", sheet.code)}</p>
          {note && <p className="text-sm text-[var(--muted)]">{note}</p>}
          <button type="button" onClick={() => window.print()} className="btn-bouncy btn-secondary w-fit px-4 py-2 text-sm font-bold print:hidden">
            {t.sPrint}
          </button>
        </section>
      )}
    </div>
  );
}

// --- Průvodce rodičovskými schůzkami ---
type MeetRow = { id: string; name: string; assigned: number; attempted: number; passed: number; avg: number | null; doneCourses: number; weak: string[] };

function Meeting({ t, teamId }: Common) {
  const [rows, setRows] = useState<MeetRow[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    void proFetch<{ students: MeetRow[] }>(`/api/pro/skola?view=meeting&teamId=${teamId}`).then((r) => (r.ok ? setRows(r.data.students) : setError(errorText(t, r.error))));
  }, [teamId, t]);
  if (error) return <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>;
  if (!rows) return <p className="text-sm text-[var(--muted)]">{t.loading}</p>;
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <p className="text-sm text-[var(--muted)]">{t.sMeetIntro}</p>
        <button type="button" onClick={() => window.print()} className="btn-bouncy btn-secondary px-4 py-2 text-sm font-bold">
          {t.sMeetPrint}
        </button>
      </div>
      {rows.map((s) => (
        <section key={s.id} className="card grid gap-1 p-5" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
          <h2 className="text-lg font-bold" style={heading}>
            {s.name || "—"}
          </h2>
          <p className="text-sm">{t.sMeetAssigned.replace("{p}", String(s.passed)).replace("{a}", String(s.assigned))}</p>
          <p className="text-sm">{s.avg === null ? t.sMeetNoData : t.sMeetAvg.replace("{n}", String(s.avg))}</p>
          <p className="text-sm">{t.sMeetDone.replace("{n}", String(s.doneCourses))}</p>
          <p className="text-sm font-semibold">{s.weak.length ? t.sMeetWeak.replace("{w}", s.weak.join(", ")) : t.sMeetNothing}</p>
        </section>
      ))}
    </div>
  );
}

// --- Tempo ---
type PaceData = { enough: boolean; groups: { key: "slower" | "middle" | "faster"; label: string; students: { id: string; name: string }[] }[] };

function Pace({ t, teamId }: Common) {
  const [data, setData] = useState<PaceData | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    void proFetch<PaceData>(`/api/pro/skola?view=pace&teamId=${teamId}`).then((r) => (r.ok ? setData(r.data) : setError(errorText(t, r.error))));
  }, [teamId, t]);

  async function apply() {
    if (!data) return;
    setError("");
    const groups = Object.fromEntries(data.groups.map((g) => [g.key, g.students.map((s) => s.id)]));
    const r = await proFetch("/api/pro/skola", { action: "applyPace", teamId, groups });
    if (r.ok) setMsg(t.fSchoolDone);
    else setError(errorText(t, r.error));
  }

  if (error && !data) return <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>;
  if (!data) return <p className="text-sm text-[var(--muted)]">{t.loading}</p>;
  const names = { slower: t.sPaceSlower, middle: t.sPaceMiddle, faster: t.sPaceFaster };
  return (
    <div className="grid gap-4">
      <p className="text-sm text-[var(--muted)]">{t.sPaceIntro}</p>
      {!data.enough && <p className="card p-3 text-sm">{t.sPaceNotEnough}</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        {data.groups.map((g) => (
          <section key={g.key} className="card p-4">
            <h3 className="font-bold">
              {g.label} <span className="text-xs font-normal text-[var(--faint)]">({names[g.key]})</span>
            </h3>
            <ul className="mt-2 grid gap-1 text-sm">
              {g.students.map((s) => (
                <li key={s.id}>{s.name || "—"}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">{t.sPaceHint}</p>
      <button type="button" onClick={() => void apply()} className={`${primary} w-fit`}>
        {t.sPaceApply}
      </button>
      {msg && <p className="text-sm font-semibold text-[var(--accent-green)]">{msg}</p>}
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
    </div>
  );
}

// --- Vlastní obsah školy ---
function OwnContent({ t, teamId, locale }: Common) {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [assign, setAssign] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ count: number; questions: Q[] } | null>(null);

  async function make(image?: string) {
    setBusy(true);
    setError("");
    const r = await proFetch<{ count: number; questions: Q[] }>("/api/pro/skola", { action: "content", teamId, text: image ? undefined : text, image, title, assign, locale });
    setBusy(false);
    if (r.ok) setResult(r.data);
    else setError(errorText(t, r.error));
  }
  async function photo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      await make(await imageToDataUrl(f));
    } catch {
      setError(t.errGeneric);
    }
  }
  return (
    <div className="grid gap-4">
      <p className="text-sm text-[var(--muted)]">{t.sContentIntro}</p>
      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder={t.sContentTitle} className={input} />
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} maxLength={6000} placeholder={t.sContentText} className={`${input} p-3`} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={assign} onChange={(e) => setAssign(e.target.checked)} /> {t.sContentAssign}
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void make()} disabled={busy || text.trim().length < 40} className={primary}>
          {busy ? t.thinking : t.sContentMake}
        </button>
        <label className="btn-bouncy btn-secondary btn-lg cursor-pointer">
          {t.sContentPhoto}
          <input type="file" accept="image/*" onChange={photo} disabled={busy} className="sr-only" />
        </label>
      </div>
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      {result && (
        <section className="card grid gap-3 p-5">
          <p className="text-sm font-semibold text-[var(--accent-green)]">{t.sContentResult.replace("{n}", String(result.count))}</p>
          <QList items={result.questions} t={t} />
        </section>
      )}
    </div>
  );
}

function Support({ t, locale }: Common) {
  return (
    <section className="card grid gap-3 p-5">
      <h2 className="text-lg font-bold" style={heading}>
        {t.sSupportTitle}
      </h2>
      <p className="text-sm text-[var(--muted)]">{t.sSupportText}</p>
      <Link href={`/${locale}/kontakt`} className="btn-bouncy btn-lg w-fit bg-[var(--brand-500)] font-bold text-white">
        {t.sSupportCta}
      </Link>
    </section>
  );
}
