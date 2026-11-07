"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { call, fmtDate } from "./api";
import { TeamChat } from "./TeamChat";

type Assignment = {
  id: string; title: string; description: string; maxAttempts: number | null; passPercent: number; dueAt: string | null; questions: number;
  students?: number; done?: number; viewed?: number; used?: number; best?: number;
};
type Member = { id: string; name: string | null; email: string | null; role: string };
type Team = { id: string; name: string; role: string; userId: string; code: string | null; members: Member[]; assignments: Assignment[] };
type Course = { slug: string; title: string; subject: string; grade: number | null; questions: number };
type SetRow = { id: string; title: string };

const SUBJECTS = ["CESTINA", "LITERATURA", "ANGLICTINA", "NEMCINA", "RUSTINA", "MATEMATIKA", "DEJEPIS", "ZEMEPIS", "PRIRODOPIS", "FYZIKA", "CHEMIE", "OBCANKA", "HUDEBKA", "FRANCOUZSTINA", "SPANELSTINA"];
const field = "rounded-xl border-2 border-[var(--field-border)] bg-[var(--surface)] px-3 py-2 text-sm";

export function TeamView({ locale, teamId }: { locale: string; teamId: string }) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null | "missing">(null);
  const [tab, setTab] = useState<"tasks" | "chat" | "people">("tasks");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setTeam(await call<Team>(`/api/tymy/${teamId}`));
    } catch (e) {
      setError((e as Error).message);
      setTeam("missing");
    }
  }, [teamId]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (team === null) return <div className="card h-48 animate-pulse bg-[var(--surface-muted)]" aria-hidden />;
  if (team === "missing")
    return (
      <div className="card p-6">
        <p className="mb-3 text-[var(--muted)]">{error || "Tým nenalezen."}</p>
        <Link href={`/${locale}/tymy`} className="font-bold text-[var(--brand-600)]">← Moje týmy</Link>
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
      setError((e as Error).message);
      return false;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/${locale}/tymy`} className="text-sm font-bold text-[var(--brand-600)]">← Moje týmy</Link>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{team.name}</h1>
          <p className="text-sm text-[var(--muted)]">{teacher ? "Jsi učitel" : "Jsi žák"} · {team.members.length} členů{team.code && <> · kód pro žáky: <b className="tracking-widest">{team.code}</b></>}</p>
        </div>
      </div>
      {error && <p className="card p-3 text-sm font-semibold text-[var(--danger)]">{error}</p>}
      <div role="tablist" className="flex gap-2">
        {([["tasks", "Zadání"], ["chat", "Chat"], ["people", "Lidé"]] as const).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold ${tab === k ? "border-[var(--edge)] bg-[var(--brand-500)] text-white" : "border-[var(--border-soft)] bg-[var(--surface)]"}`}>{label}</button>
        ))}
      </div>

      {tab === "tasks" && (
        <div className="flex flex-col gap-4">
          {teacher && <NewAssignment teamId={teamId} onCreated={load} />}
          {team.assignments.length === 0 && <p className="text-[var(--muted)]">{teacher ? "Zatím žádné zadání. Vytvoř první." : "Učitel zatím nic nezadal."}</p>}
          <ul className="flex flex-col gap-3">
            {team.assignments.map((a) => (
              <li key={a.id}>
                <Link href={`/${locale}/tymy/${teamId}/zadani/${a.id}`} className="card flex flex-col gap-1 p-4 hover:-translate-y-0.5">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <b className="text-lg">{a.title}</b>
                    {teacher ? (
                      <span className="text-sm font-bold">splnilo {a.done}/{a.students} · zobrazilo {a.viewed}/{a.students}</span>
                    ) : (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${(a.best ?? 0) >= a.passPercent && (a.used ?? 0) > 0 ? "bg-[var(--accent-green)] text-white" : !a.viewed ? "bg-[var(--accent-yellow)]" : "bg-[var(--surface-muted)]"}`}>
                        {(a.used ?? 0) > 0 && (a.best ?? 0) >= a.passPercent ? `Splněno ${a.best} %` : (a.used ?? 0) > 0 ? `Zkoušeno, nejlépe ${a.best} %` : !a.viewed ? "Nové" : "Zobrazeno"}
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-[var(--muted)]">
                    {a.questions} otázek · splněno od {a.passPercent} % · {a.maxAttempts == null ? "neomezeně pokusů" : `${a.maxAttempts}× pokusů`}
                    {!teacher && a.maxAttempts != null && ` (zbývá ${Math.max(0, a.maxAttempts - (a.used ?? 0))})`}
                    {a.dueAt && ` · termín ${fmtDate(a.dueAt)}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "chat" && <section className="card p-4"><TeamChat teamId={teamId} userId={team.userId} height="h-96" /></section>}

      {tab === "people" && (
        <div className="flex flex-col gap-4">
          {teacher && <AddMember onAdd={(email, role) => post({ action: "addMember", email, role })} />}
          <ul className="card divide-y divide-[var(--border-soft)]">
            {team.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                <span className="min-w-0 truncate"><b>{m.name || m.email || "Člen"}</b>{m.email && m.name && <span className="text-sm text-[var(--muted)]"> · {m.email}</span>}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--muted)]">{m.role === "TEACHER" ? "učitel" : "žák"}</span>
                  {teacher && m.id !== team.userId && <button onClick={() => confirm("Odebrat z týmu?") && post({ action: "removeMember", userId: m.id })} className="text-xs font-bold text-[var(--danger)]">Odebrat</button>}
                </span>
              </li>
            ))}
          </ul>
          <button onClick={async () => { if (confirm("Opravdu odejít z týmu?") && (await post({ action: "leave" }))) router.push(`/${locale}/tymy`); }} className="self-start text-sm font-bold text-[var(--danger)]">Odejít z týmu</button>
        </div>
      )}
    </div>
  );
}

function AddMember({ onAdd }: { onAdd: (email: string, role: string) => Promise<boolean> }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("STUDENT");
  return (
    <form className="card flex flex-wrap items-center gap-2 p-4" onSubmit={async (e) => { e.preventDefault(); if (await onAdd(email, role)) setEmail(""); }}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail žáka (musí mít účet)" aria-label="E-mail" className={`${field} min-w-0 flex-1`} required />
      <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role" className={field}><option value="STUDENT">Žák</option><option value="TEACHER">Učitel</option></select>
      <button className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white">Přidat</button>
    </form>
  );
}

function NewAssignment({ teamId, onCreated }: { teamId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<"course" | "set" | "subject">("course");
  const [courses, setCourses] = useState<Course[]>([]);
  const [sets, setSets] = useState<SetRow[]>([]);
  const [f, setF] = useState({ title: "", description: "", slug: "", setId: "", subject: "MATEMATIKA", count: 10, passPercent: 50, unlimited: true, maxAttempts: 3, dueAt: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || courses.length) return;
    fetch("/api/live/courses").then((r) => r.json()).then((d) => Array.isArray(d) && setCourses(d)).catch(() => {});
    fetch("/api/live/sets").then((r) => r.json()).then((d) => Array.isArray(d.sets) && setSets(d.sets)).catch(() => {});
  }, [open, courses.length]);

  if (!open) return <button onClick={() => setOpen(true)} className="btn-bouncy self-start bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">+ Nové zadání</button>;

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await call(`/api/tymy/${teamId}`, {
        action: "createAssignment", source, title: f.title, description: f.description, slug: f.slug, setId: f.setId, subject: f.subject,
        count: f.count, passPercent: f.passPercent, maxAttempts: f.unlimited ? null : f.maxAttempts, dueAt: f.dueAt ? new Date(f.dueAt).toISOString() : "",
      });
      setOpen(false);
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-3 p-5">
      <h2 className="text-lg font-extrabold">Nové zadání</h2>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Zdroj otázek">
        {([["course", "Téma z kurzu"], ["set", "Moje sada otázek"], ["subject", "Denní kvíz z předmětu"]] as const).map(([k, l]) => (
          <button type="button" key={k} role="radio" aria-checked={source === k} onClick={() => setSource(k)} className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${source === k ? "border-[var(--edge)] bg-[var(--brand-50)]" : "border-[var(--border-soft)]"}`}>{l}</button>
        ))}
      </div>
      {source === "course" && (
        <select value={f.slug} onChange={(e) => set("slug", e.target.value)} required aria-label="Kurz" className={field}>
          <option value="">Vyber kurz…</option>
          {courses.map((c) => <option key={c.slug} value={c.slug}>{c.title}{c.grade ? ` (${c.grade}. tř.)` : ""} – {c.questions} otázek</option>)}
        </select>
      )}
      {source === "set" && (
        <select value={f.setId} onChange={(e) => set("setId", e.target.value)} required aria-label="Sada" className={field}>
          <option value="">{sets.length ? "Vyber sadu…" : "Nemáš žádnou sadu (vytvoř ji v „Hrát společně“)"}</option>
          {sets.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      )}
      {source === "subject" && <select value={f.subject} onChange={(e) => set("subject", e.target.value)} aria-label="Předmět" className={field}>{SUBJECTS.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}</select>}
      <input value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={80} placeholder="Název zadání (nepovinné)" aria-label="Název zadání" className={field} />
      <textarea value={f.description} onChange={(e) => set("description", e.target.value)} maxLength={1000} rows={2} placeholder="Pokyny pro žáky (nepovinné)" aria-label="Pokyny" className={field} />
      <div className="grid gap-3 sm:grid-cols-2">
        {source !== "set" && <label className="flex flex-col gap-1 text-sm font-semibold">Počet otázek<input type="number" min={1} max={30} value={f.count} onChange={(e) => set("count", Number(e.target.value))} className={field} /></label>}
        <label className="flex flex-col gap-1 text-sm font-semibold">Splněno od (% správně)<input type="number" min={0} max={100} value={f.passPercent} onChange={(e) => set("passPercent", Number(e.target.value))} className={field} /></label>
        <div className="flex flex-col gap-1 text-sm font-semibold">
          Počet pokusů
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1"><input type="checkbox" checked={f.unlimited} onChange={(e) => set("unlimited", e.target.checked)} className="size-4" /> neomezeně</label>
            {!f.unlimited && <input type="number" min={1} max={20} value={f.maxAttempts} onChange={(e) => set("maxAttempts", Number(e.target.value))} aria-label="Počet pokusů" className={`${field} w-24`} />}
          </div>
        </div>
        <label className="flex flex-col gap-1 text-sm font-semibold">Termín (nepovinné)<input type="datetime-local" value={f.dueAt} onChange={(e) => set("dueAt", e.target.value)} className={field} /></label>
      </div>
      {error && <p className="text-sm font-semibold text-[var(--danger)]">{error}</p>}
      <div className="flex gap-2">
        <button disabled={busy} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2 text-sm font-bold text-white disabled:opacity-60">Zadat</button>
        <button type="button" onClick={() => setOpen(false)} className="px-3 text-sm font-bold">Zrušit</button>
      </div>
    </form>
  );
}
