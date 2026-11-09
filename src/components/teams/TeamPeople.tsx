"use client";

import { useState } from "react";
import { call, errorCode, fmtDate } from "./api";
import { teamsAllError, type TeamsAll } from "@/i18n/teams-more";
import { tfill } from "@/i18n/teams";
import type { Locale } from "@/i18n/config";
import { Badge, StatCard } from "./ui";
import { dangerBtn, field, linkBtn, primaryBtn, type Team } from "./types";

type Post = (body: object) => Promise<boolean>;

/** Záložka Lidé: žádosti o připojení, kód a režim připojení, hromadné přidání, role a odebrání. */
export function TeamPeople({ t, locale, team, post, reload, teamId, onLeave }: { t: TeamsAll; locale: Locale; team: Team; post: Post; reload: () => void; teamId: string; onLeave: () => void }) {
  const teacher = team.role === "TEACHER";
  const groupName = (id: string | null) => team.groups.find((g) => g.id === id)?.name;
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"name" | "group">("name");
  const [sel, setSel] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const needle = q.trim().toLocaleLowerCase(locale);
  const shown = team.members
    .filter((m) => !needle || `${m.name ?? ""} ${m.email ?? ""} ${groupName(m.groupId) ?? ""}`.toLocaleLowerCase(locale).includes(needle))
    .sort((a, b) => sort === "group"
      ? (groupName(a.groupId) ?? "\uffff").localeCompare(groupName(b.groupId) ?? "\uffff", locale) || (a.name ?? "").localeCompare(b.name ?? "", locale)
      : (a.name ?? a.email ?? "").localeCompare(b.name ?? b.email ?? "", locale));
  const selectable = shown.filter((m) => m.id !== team.userId).map((m) => m.id);
  const toggle = (id: string) => setSel((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const picked = sel.filter((id) => team.members.some((m) => m.id === id));
  return (
    <div className="flex flex-col gap-4">
      <StatCard
        label={t.statMembers}
        value={team.members.length}
        stats={[
          { label: t.teacherLc, value: team.members.filter((m) => m.role === "TEACHER").length },
          { label: t.studentLc, value: team.members.filter((m) => m.role !== "TEACHER").length },
        ]}
      />
      {teacher && team.pending.length > 0 && (
        <section className="card flex flex-col gap-2 border-2 border-[var(--accent-yellow)] p-4" aria-label={t.pendingTitle}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold">{tfill(t.pendingTitleN, team.pending.length)}</h2>
            <button onClick={() => post({ action: "approve", all: true })} className={linkBtn}>{t.approveAll}</button>
          </div>
          <ul className="divide-y divide-[var(--border-soft)]">
            {team.pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="flex min-w-0 items-center gap-2 truncate"><Badge name={p.name || p.email} size={32} round /><b>{p.name || p.email}</b>{p.name && p.email && <span className="text-sm text-[var(--muted)]"> · {p.email}</span>} <span className="text-xs text-[var(--muted)]">{fmtDate(locale, p.requestedAt)}</span></span>
                <span className="flex gap-3">
                  <button onClick={() => post({ action: "approve", userId: p.id })} className={linkBtn}>{t.approve}</button>
                  <button onClick={() => post({ action: "reject", userId: p.id })} className={dangerBtn}>{t.reject}</button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}


      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchMember} aria-label={t.searchMember} className={`${field} min-w-0 flex-1`} type="search" />
        <select value={sort} onChange={(e) => setSort(e.target.value as "name" | "group")} aria-label={t.sortLabel} className={field}>
          <option value="name">{t.sortByName}</option>
          <option value="group">{t.sortByGroup}</option>
        </select>
        {teacher && selectable.length > 0 && (
          <button onClick={() => setSel(picked.length === selectable.length ? [] : selectable)} className={linkBtn}>{picked.length === selectable.length ? t.clearSel : t.selectAll}</button>
        )}
      </div>
      {teacher && picked.length > 0 && (
        <div className="card flex flex-wrap items-center gap-3 p-3" style={{ borderTop: "6px solid var(--brand-500)" }} role="region" aria-label={tfill(t.selectedN, picked.length)}>
          <b className="text-sm">{tfill(t.selectedN, picked.length)}</b>
          {team.groups.length > 0 && (
            <>
              <select value={target} onChange={(e) => setTarget(e.target.value)} aria-label={t.bulkMove} className={field}>
                <option value="">{t.noGroup}</option>
                {team.groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <button onClick={async () => { if (await post({ action: "bulkSetGroup", userIds: picked, groupId: target || null })) setSel([]); }} className={primaryBtn}>{t.bulkMove}</button>
            </>
          )}
          <button onClick={async () => { if (confirm(tfill(t.confirmBulkRemove, picked.length)) && (await post({ action: "bulkRemove", userIds: picked }))) setSel([]); }} className={dangerBtn}>{t.bulkRemove}</button>
        </div>
      )}
      {[shown.filter((m) => m.role === "TEACHER"), shown.filter((m) => m.role !== "TEACHER")].map((list, gi) => list.length > 0 && (
        <section key={gi} className="flex flex-col gap-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-[var(--muted)]">{gi === 0 ? t.teacherLc : t.studentLc} · {list.length}</h2>
          <ul className="card divide-y divide-[var(--border-soft)]">
            {list.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <span className="flex min-w-0 items-center gap-3">
                  {teacher && m.id !== team.userId && <input type="checkbox" checked={sel.includes(m.id)} onChange={() => toggle(m.id)} className="size-4" aria-label={m.name || m.email || t.memberFallback} />}
                  <Badge name={m.name || m.email} size={36} round />
                  <span className="min-w-0 truncate">
                    <b>{m.name || m.email || t.memberFallback}</b>
                    {m.email && m.name && <span className="text-sm text-[var(--muted)]"> · {m.email}</span>}
                    {groupName(m.groupId) && <span className="ml-2 text-xs text-[var(--muted)]">{groupName(m.groupId)}</span>}
                  </span>
                </span>
                {teacher && m.id !== team.userId && (
                  <span className="flex items-center gap-3">
                    <button onClick={() => post({ action: "setRole", userId: m.id, role: m.role === "TEACHER" ? "STUDENT" : "TEACHER" })} className={linkBtn}>{m.role === "TEACHER" ? t.makeStudent : t.makeTeacher}</button>
                    <button onClick={() => confirm(t.confirmRemove) && post({ action: "removeMember", userId: m.id })} className={dangerBtn}>{t.remove}</button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {teacher && (
        <details className="card p-4">
          <summary className="cursor-pointer text-lg font-extrabold">{t.manageMembers}</summary>
          <div className="mt-3 flex flex-col gap-4">
            <JoinSettings t={t} locale={locale} team={team} post={post} />
            <BulkAdd t={t} teamId={teamId} onDone={reload} />
          </div>
        </details>
      )}
      <button onClick={onLeave} className="self-start text-sm font-bold text-[var(--danger)]">{t.leave}</button>
    </div>
  );
}

function JoinSettings({ t, locale, team, post }: { t: TeamsAll; locale: Locale; team: Team; post: Post }) {
  const [copied, setCopied] = useState(false);
  const modes = [["OPEN", `${t.joinOpen}`], ["APPROVAL", `${t.joinApproval}`], ["CLOSED", `${t.joinClosed}`]] as const;
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-extrabold">{t.joinSettings}</h3>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm">{t.codeForStudents}: <b className="tracking-widest">{team.code}</b></span>
        <button onClick={() => confirm(t.confirmRegen) && post({ action: "regenCode" })} className={linkBtn}>{t.regenCode}</button>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(`${window.location.origin}/${locale}/tymy?kod=${team.code}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            } catch { /* schránka nedostupná */ }
          }}
          className={linkBtn}
        >{copied ? t.inviteCopied : t.inviteLink}</button>
      </div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t.joinSettings}>
        {modes.map(([k, label]) => (
          <button key={k} role="radio" aria-checked={team.joinMode === k} onClick={() => team.joinMode !== k && post({ action: "setJoinMode", joinMode: k })} className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${team.joinMode === k ? "border-[var(--edge)] bg-[var(--brand-50)]" : "border-[var(--border-soft)]"}`}>{label}</button>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">{team.joinMode === "OPEN" ? t.joinOpenHint : team.joinMode === "APPROVAL" ? t.joinApprovalHint : t.joinClosedHint}</p>
    </section>
  );
}

function BulkAdd({ t, teamId, onDone }: { t: TeamsAll; teamId: string; onDone: () => void }) {
  const [emails, setEmails] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      className="flex flex-col gap-2 border-t-2 border-[var(--border-soft)] pt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMsg(null);
        try {
          const r = await call<{ added: number; notFound: string[] }>(`/api/tymy/${teamId}`, { action: "addMembers", emails, role });
          setMsg({ ok: r.notFound.length === 0, text: tfill(t.bulkResult, r.added) + (r.notFound.length ? `${tfill(t.bulkNotFound, r.notFound.join(", "))}` : "") });
          setEmails(r.notFound.join("\n"));
          onDone();
        } catch (err) {
          setMsg({ ok: false, text: teamsAllError(t, errorCode(err)) });
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="text-sm font-semibold" htmlFor="bulk-emails">{t.bulkTitle}</label>
      <textarea id="bulk-emails" value={emails} onChange={(e) => setEmails(e.target.value)} rows={3} placeholder={t.bulkPh} className={field} required />
      <div className="flex flex-wrap items-center gap-2">
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label={t.teacher} className={field}><option value="STUDENT">{t.student}</option><option value="TEACHER">{t.teacher}</option></select>
        <button disabled={busy} className={primaryBtn}>{t.add}</button>
      </div>
      {msg && <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-[var(--accent-green)]" : "text-[var(--danger)]"}`}>{msg.text}</p>}
    </form>
  );
}
