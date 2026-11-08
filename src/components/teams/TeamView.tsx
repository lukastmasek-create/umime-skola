"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { call, errorCode, fmtDate } from "./api";
import { tfill } from "@/i18n/teams";
import { getTeamsAll, teamsAllError } from "@/i18n/teams-more";
import { getSubjectText } from "@/i18n/subjects";
import type { Locale } from "@/i18n/config";

import { TeamChat } from "./TeamChat";
import { TeamPeople } from "./TeamPeople";
import { TeamGroups } from "./TeamGroups";
import { TeamResults } from "./TeamResults";
import { AudiencePicker } from "./AudiencePicker";
import { Badge, Pill, Progress, colorOf } from "./ui";
import { field, linkBtn, type Audience, type Assignment, type Group, type Member, type Team } from "./types";

type Course = { slug: string; title: string; subject: string; grade: number | null; questions: number };
type SetRow = { id: string; title: string };
type Tab = "tasks" | "results" | "groups" | "chat" | "people";

const SUBJECTS = ["CESTINA", "LITERATURA", "ANGLICTINA", "NEMCINA", "RUSTINA", "MATEMATIKA", "DEJEPIS", "ZEMEPIS", "PRIRODOPIS", "FYZIKA", "CHEMIE", "OBCANKA", "HUDEBKA", "FRANCOUZSTINA", "SPANELSTINA"];

export function TeamView({ locale, teamId }: { locale: Locale; teamId: string }) {
  const router = useRouter();
  const t = getTeamsAll(locale);
  const [team, setTeam] = useState<Team | null | "missing">(null);
  const [tab, setTab] = useState<Tab>("tasks");
  const [error, setError] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setTeam(await call<Team>(`/api/tymy/${teamId}`));
    } catch (e) {
      setError(teamsAllError(t, errorCode(e)));
      setTeam("missing");
    }
  }, [teamId, t]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (team === null) return <div className="card h-48 animate-pulse bg-[var(--surface-muted)]" aria-hidden />;
  if (team === "missing")
    return (
      <div className="card p-6">
        <p className="mb-3 text-[var(--muted)]">{error || t.e_team}</p>
        <Link href={`/${locale}/tymy`} className="font-bold text-[var(--brand-600)]">{t.backTeams}</Link>
      </div>
    );

  const teacher = team.role === "TEACHER";
  const post = async (body: object) => {
    setError("");
    try {
      await call(`/api/tymy/${teamId}`, body);
      await load();
      return true;
    } catch (e) {
      setError(teamsAllError(t, errorCode(e)));
      return false;
    }
  };
  const tabs: [Tab, string, string, number][] = [
    ["tasks", t.tabTasks, "", 0],
    ...(teacher ? ([["results", t.tabResults, "", 0], ["groups", t.tabGroups, "", 0]] as [Tab, string, string, number][]) : []),
    ["chat", t.tabChat, "", 0],
    ["people", t.tabPeople, "", team.pending.length],
  ];
  const students = team.members.filter((m) => m.role === "STUDENT");
  const passedN = team.assignments.filter((a) => (a.used ?? 0) > 0 && (a.best ?? 0) >= a.passPercent).length;
  const overdueN = team.assignments.filter((a) => a.due === "overdue").length;
  const myGroup = team.groups.find((g) => g.id === team.members.find((m) => m.id === team.userId)?.groupId);

  return (
    <div className="flex flex-col gap-5">
      <Link href={`/${locale}/tymy`} className="text-sm font-bold text-[var(--brand-600)]">{t.backTeams}</Link>
      <header
        className="card flex flex-wrap items-center gap-4 p-5"
        style={{ background: teacher ? "linear-gradient(135deg, var(--brand-50), var(--surface))" : "linear-gradient(135deg, color-mix(in srgb, var(--accent-yellow) 30%, var(--surface)), var(--surface))", borderTop: `8px solid ${colorOf(team.name)}` }}
      >
        <Badge name={team.name} size={64} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {renaming !== null ? (
            <form className="flex items-center gap-2" onSubmit={async (e) => { e.preventDefault(); if (await post({ action: "rename", name: renaming })) setRenaming(null); }}>
              <input value={renaming} onChange={(e) => setRenaming(e.target.value)} maxLength={40} aria-label={t.namePh} className={`${field} text-xl font-bold`} autoFocus />
              <button className={linkBtn}>{t.save}</button>
              <button type="button" onClick={() => setRenaming(null)} className="text-xs font-bold">{t.cancel}</button>
            </form>
          ) : (
            <h1 className="flex flex-wrap items-center gap-3 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {team.name}
              {teacher && <button onClick={() => setRenaming(team.name)} className={linkBtn} aria-label={t.rename}>{t.rename}</button>}
            </h1>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={teacher ? "brand" : "good"}>{teacher ? `${t.youTeacher}` : `${t.youStudent}`}</Pill>
            <Pill>{tfill(t.membersN, team.members.length)}</Pill>
            {team.code && <Pill>{t.codeForStudents}: <b className="tracking-widest">{team.code}</b></Pill>}
            {!teacher && myGroup && <Pill tone="warn">{t.yourGroup}: {myGroup.name}</Pill>}
            {teacher && overdueN > 0 && <Pill tone="danger">{tfill(t.overdueN, overdueN)}</Pill>}
          </div>
          {team.assignments.length > 0 && (
            <div className="max-w-md">
              <Progress
                value={passedN}
                max={team.assignments.length}
                color={teacher ? "var(--brand-500)" : "var(--accent-green)"}
                label={teacher ? `${team.assignments.length} · ${students.length} ` : `${passedN} / ${team.assignments.length}`}
              />
            </div>
          )}
        </div>
      </header>
      {error && <p role="alert" className="card p-3 text-sm font-semibold text-[var(--danger)]">{error}</p>}
      <div role="tablist" className="flex flex-wrap gap-2">
        {tabs.map(([k, label, icon, badge]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`relative flex items-center gap-1.5 rounded-full border-2 px-4 py-1.5 text-sm font-bold ${tab === k ? "border-[var(--edge)] bg-[var(--brand-500)] text-white" : "border-[var(--border-soft)] bg-[var(--surface)] hover:border-[var(--edge)]"}`}>
            <span aria-hidden>{icon}</span>{label}
            {badge > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-[var(--accent-500)] px-1 text-xs font-extrabold text-white" aria-label={String(badge)}>{badge}</span>}
          </button>
        ))}
      </div>

      {tab === "tasks" && (
        <div className="flex flex-col gap-4">
          {teacher && <NewAssignment locale={locale} teamId={teamId} groups={team.groups} students={team.members.filter((m) => m.role === "STUDENT")} onCreated={load} />}
          {team.assignments.length === 0 && <p className="card p-6 text-center text-[var(--muted)]">{teacher ? t.noTasksT : t.noTasksS}</p>}
          <ul className="flex flex-col gap-3">
            {team.assignments.map((a) => <AssignmentCard key={a.id} a={a} teacher={teacher} locale={locale} teamId={teamId} groups={team.groups} members={team.members} />)}
          </ul>
        </div>
      )}

      {tab === "results" && teacher && <TeamResults t={t} locale={locale} teamId={teamId} teamName={team.name} />}
      {tab === "groups" && teacher && <TeamGroups t={t} team={team} post={post} />}
      {tab === "chat" && <section className="card p-4"><TeamChat locale={locale} teamId={teamId} userId={team.userId} height="h-96" /></section>}
      {tab === "people" && (
        <TeamPeople
          t={t} locale={locale} team={team} post={post} reload={load} teamId={teamId}
          onLeave={async () => { if (confirm(t.confirmLeave) && (await post({ action: "leave" }))) router.push(`/${locale}/tymy`); }}
        />
      )}
    </div>
  );
}

function AssignmentCard({ a, teacher, locale, teamId, groups, members }: { a: Assignment; teacher: boolean; locale: Locale; teamId: string; groups: Group[]; members: Member[] }) {
  const t = getTeamsAll(locale);
  const passed = (a.used ?? 0) > 0 && (a.best ?? 0) >= a.passPercent;
  const audience = [
    ...(a.groupIds ?? []).map((id) => groups.find((g) => g.id === id)?.name),
    ...(a.userIds ?? []).map((id) => members.find((m) => m.id === id)?.name),
  ].filter(Boolean);
  const dueCls = a.due === "overdue" ? "font-bold text-[var(--danger)]" : a.due === "soon" ? "font-bold" : "";
  return (
    <li>
      <Link href={`/${locale}/tymy/${teamId}/zadani/${a.id}`} className="card flex flex-col gap-2 p-4 hover:-translate-y-0.5" style={{ borderLeft: `8px solid ${a.due === "overdue" && !passed ? "var(--danger)" : passed ? "var(--accent-green)" : teacher ? "var(--brand-500)" : "var(--accent-yellow)"}` }}>
        <span className="flex flex-wrap items-center justify-between gap-2">
          <b className="text-lg">{a.title}</b>
          {!teacher && (
            <span className="flex items-center gap-1.5">
              {!passed && a.due === "overdue" && <Pill tone="danger">{t.afterDeadline}</Pill>}
              {!passed && a.due === "soon" && <Pill tone="warn">⏰ {t.dueSoon}</Pill>}
              <Pill tone={passed ? "good" : !a.viewed ? "warn" : "plain"}>
                {passed ? tfill(t.stDone, a.best ?? 0) : (a.used ?? 0) > 0 ? tfill(t.stTried, a.best ?? 0) : !a.viewed ? t.stNew : t.stViewed}
              </Pill>
            </span>
          )}
        </span>
        {teacher ? (
          <span className="grid gap-2 sm:grid-cols-2">
            <Progress value={a.done ?? 0} max={a.students ?? 0} color="var(--accent-green)" label={`${tfill(t.doneOf, a.done ?? 0, a.students ?? 0)}`} />
            <Progress value={a.viewed ?? 0} max={a.students ?? 0} color="var(--accent-blue)" label={`${tfill(t.viewedOf, a.viewed ?? 0, a.students ?? 0)}`} />
          </span>
        ) : (
          (a.used ?? 0) > 0 && <Progress value={Math.min(a.best ?? 0, 100)} max={Math.max(a.passPercent, 1)} color={passed ? "var(--accent-green)" : "var(--accent-yellow)"} label={`${a.best ?? 0} % / ${a.passPercent} %`} />
        )}
        <span className="text-sm text-[var(--muted)]">
          {tfill(t.taskMeta, a.questions, a.passPercent)} · {a.maxAttempts == null ? t.attUnlimited : tfill(t.attMax, a.maxAttempts)}
          {!teacher && a.maxAttempts != null && ` (${tfill(t.attLeft, Math.max(0, a.maxAttempts - (a.used ?? 0)))})`}
          {a.dueAt && <> ·  <span className={dueCls}>{tfill(t.due, fmtDate(locale, a.dueAt))}</span></>}
        </span>
        {teacher && audience.length > 0 && <span className="text-xs font-semibold text-[var(--brand-700)]">{tfill(t.onlyForNames, audience.join(", "))}</span>}
      </Link>
    </li>
  );
}

function NewAssignment({ locale, teamId, groups, students, onCreated }: { locale: Locale; teamId: string; groups: Group[]; students: Member[]; onCreated: () => void }) {
  const t = getTeamsAll(locale);
  const subjectLabels = getSubjectText(locale).labels as Record<string, string>;
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<"course" | "set" | "subject">("course");
  const [courses, setCourses] = useState<Course[]>([]);
  const [sets, setSets] = useState<SetRow[]>([]);
  const [f, setF] = useState({ title: "", description: "", slug: "", setId: "", subject: "MATEMATIKA", count: 10, passPercent: 50, unlimited: true, maxAttempts: 3, dueAt: "" });
  const [aud, setAud] = useState<Audience>({ groupIds: [], userIds: [] });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || courses.length) return;
    fetch("/api/live/courses").then((r) => r.json()).then((d) => Array.isArray(d) && setCourses(d)).catch(() => {});
    fetch("/api/live/sets").then((r) => r.json()).then((d) => Array.isArray(d.sets) && setSets(d.sets)).catch(() => {});
  }, [open, courses.length]);

  if (!open) return <button onClick={() => setOpen(true)} className="btn-bouncy self-start bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">{t.newTask}</button>;

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await call(`/api/tymy/${teamId}`, {
        action: "createAssignment", source, description: f.description, slug: f.slug, setId: f.setId, subject: f.subject,
        title: f.title || (source === "subject" ? tfill(t.quizTitle, subjectLabels[f.subject] ?? f.subject) : ""), count: f.count, passPercent: f.passPercent, maxAttempts: f.unlimited ? null : f.maxAttempts, dueAt: f.dueAt ? new Date(f.dueAt).toISOString() : "", audience: aud,
      });
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(teamsAllError(t, errorCode(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-3 p-5">
      <h2 className="text-lg font-extrabold">{t.newTaskTitle}</h2>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t.srcCourse}>
        {([["course", t.srcCourse], ["set", t.srcSet], ["subject", t.srcSubject]] as const).map(([k, l]) => (
          <button type="button" key={k} role="radio" aria-checked={source === k} onClick={() => setSource(k)} className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${source === k ? "border-[var(--edge)] bg-[var(--brand-50)]" : "border-[var(--border-soft)]"}`}>{l}</button>
        ))}
      </div>
      {source === "course" && (
        <select value={f.slug} onChange={(e) => set("slug", e.target.value)} required aria-label={t.srcCourse} className={field}>
          <option value="">{t.pickCourse}</option>
          {courses.map((c) => <option key={c.slug} value={c.slug}>{tfill(t.courseOpt, c.title + (c.grade ? ` (${tfill(t.gradeFmt, c.grade)})` : ""), c.questions)}</option>)}
        </select>
      )}
      {source === "set" && (
        <select value={f.setId} onChange={(e) => set("setId", e.target.value)} required aria-label={t.srcSet} className={field}>
          <option value="">{sets.length ? t.pickSet : t.noSets}</option>
          {sets.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      )}
      {source === "subject" && <select value={f.subject} onChange={(e) => set("subject", e.target.value)} aria-label={t.srcSubject} className={field}>{SUBJECTS.map((s) => <option key={s} value={s}>{subjectLabels[s] ?? s}</option>)}</select>}
      <input value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={80} placeholder={t.taskTitlePh} aria-label={t.taskTitlePh} className={field} />
      <textarea value={f.description} onChange={(e) => set("description", e.target.value)} maxLength={1000} rows={2} placeholder={t.instrPh} aria-label={t.instrPh} className={field} />
      <div className="grid gap-3 sm:grid-cols-2">
        {source !== "set" && <label className="flex flex-col gap-1 text-sm font-semibold">{t.qCount}<input type="number" min={1} max={30} value={f.count} onChange={(e) => set("count", Number(e.target.value))} className={field} /></label>}
        <label className="flex flex-col gap-1 text-sm font-semibold">{t.passLabel}<input type="number" min={0} max={100} value={f.passPercent} onChange={(e) => set("passPercent", Number(e.target.value))} className={field} /></label>
        <div className="flex flex-col gap-1 text-sm font-semibold">
          {t.attemptsLabel}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1"><input type="checkbox" checked={f.unlimited} onChange={(e) => set("unlimited", e.target.checked)} className="size-4" /> {t.unlimited}</label>
            {!f.unlimited && <input type="number" min={1} max={20} value={f.maxAttempts} onChange={(e) => set("maxAttempts", Number(e.target.value))} aria-label={t.attemptsLabel} className={`${field} w-24`} />}
          </div>
        </div>
        <label className="flex flex-col gap-1 text-sm font-semibold">{t.dueLabel}<input type="datetime-local" value={f.dueAt} onChange={(e) => set("dueAt", e.target.value)} className={field} /></label>
      </div>
      <AudiencePicker t={t} groups={groups} students={students} value={aud} onChange={setAud} />
      {error && <p className="text-sm font-semibold text-[var(--danger)]">{error}</p>}
      <div className="flex gap-2">
        <button disabled={busy} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2 text-sm font-bold text-white disabled:opacity-60">{t.assign}</button>
        <button type="button" onClick={() => setOpen(false)} className="px-3 text-sm font-bold">{t.cancel}</button>
      </div>
    </form>
  );
}
