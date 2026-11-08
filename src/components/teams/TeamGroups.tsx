"use client";

import { useState } from "react";
import { tfill } from "@/i18n/teams";
import type { TeamsAll } from "@/i18n/teams-more";
import { Badge, Pill } from "./ui";
import { dangerBtn, field, linkBtn, primaryBtn, type Team } from "./types";

type Post = (body: object) => Promise<boolean>;

/** Skupiny uvnitř třídy: ruční správa, náhodné rozlosování a přiřazení žáků. */
export function TeamGroups({ t, team, post }: { t: TeamsAll; team: Team; post: Post }) {
  const students = team.members.filter((m) => m.role === "STUDENT");
  const [name, setName] = useState("");
  const [count, setCount] = useState(3);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const drop = (groupId: string | null) => (e: React.DragEvent) => {
    e.preventDefault();
    setOver(null);
    const uid = e.dataTransfer.getData("text/plain");
    const st = students.find((x) => x.id === uid);
    if (st && st.groupId !== groupId) void post({ action: "setGroup", userId: uid, groupId });
  };
  const zone = (key: string, groupId: string | null) => ({
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setOver(key); },
    onDragLeave: () => setOver((o) => (o === key ? null : o)),
    onDrop: drop(groupId),
  });
  const chip = (s: (typeof students)[number]) => (
    <li
      key={s.id}
      draggable
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", s.id); e.dataTransfer.effectAllowed = "move"; }}
      className="flex cursor-grab items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] py-0.5 pl-0.5 pr-2.5 font-semibold active:cursor-grabbing"
    >
      <Badge name={s.name || s.email} size={22} round />{s.name || s.email || t.student}
    </li>
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--muted)]">{t.groupsIntro} {t.dragHint}</p>
      <div className="card flex flex-wrap items-end gap-x-6 gap-y-3 p-4">
        <form className="flex min-w-0 flex-1 flex-col gap-1" onSubmit={async (e) => { e.preventDefault(); if (await post({ action: "createGroup", name })) setName(""); }}>
          <label htmlFor="new-group" className="text-sm font-semibold">{t.newGroup}</label>
          <div className="flex gap-2">
            <input id="new-group" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder={t.groupNamePh} className={`${field} min-w-0 flex-1`} required />
            <button className={primaryBtn}>{t.add}</button>
          </div>
        </form>
        <form
          className="flex flex-col gap-1"
          onSubmit={async (e) => {
            e.preventDefault();
            if (students.length === 0) return;
            if (team.groups.some((g) => g.members > 0) && !confirm(t.confirmShuffle)) return;
            await post({ action: "randomGroups", count, prefix: t.groupPrefix });
          }}
        >
          <label htmlFor="group-count" className="text-sm font-semibold">{t.randomGroups}</label>
          <div className="flex items-center gap-2">
            <input id="group-count" type="number" min={2} max={12} value={count} onChange={(e) => setCount(Number(e.target.value))} aria-label={t.groupCount} className={`${field} w-20`} />
            <button disabled={students.length < 2} className={primaryBtn}>{t.shuffle}</button>
          </div>
        </form>
      </div>

      {team.groups.length === 0 && <p className="card p-6 text-center text-[var(--muted)]">{t.noGroups}</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {team.groups.map((g) => (
          <li key={g.id} {...zone(g.id, g.id)} className={`card flex flex-col gap-3 p-4 ${over === g.id ? "outline-dashed outline-2 outline-offset-2 outline-[var(--brand-500)]" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              {renaming?.id === g.id ? (
                <form className="flex min-w-0 flex-1 gap-2" onSubmit={async (e) => { e.preventDefault(); if (await post({ action: "renameGroup", groupId: g.id, name: renaming.name })) setRenaming(null); }}>
                  <input value={renaming.name} onChange={(e) => setRenaming({ id: g.id, name: e.target.value })} maxLength={40} aria-label={t.groupNamePh} className={`${field} min-w-0 flex-1`} autoFocus />
                  <button className={linkBtn}>{t.save}</button>
                </form>
              ) : (
                <>
                  <span className="flex min-w-0 items-center gap-2">
                    <Badge name={g.name} size={36} />
                    <b className="truncate text-lg">{g.name}</b>
                    <Pill>{tfill(t.membersN, g.members)}</Pill>
                  </span>
                  <span className="flex gap-3">
                    <button onClick={() => setRenaming({ id: g.id, name: g.name })} className={linkBtn}>{t.rename}</button>
                    <button onClick={() => confirm(t.confirmDeleteGroup) && post({ action: "deleteGroup", groupId: g.id })} className={dangerBtn}>{t.remove}</button>
                  </span>
                </>
              )}
            </div>
            <ul className="flex flex-wrap gap-1.5 text-sm">
              {students.filter((s) => s.groupId === g.id).map(chip)}
            </ul>
          </li>
        ))}
      </ul>

      {students.length > 0 && team.groups.length > 0 && (
        <section {...zone("none", null)} className={`card flex flex-col gap-2 p-3 ${over === "none" ? "outline-dashed outline-2 outline-offset-2 outline-[var(--brand-500)]" : ""}`} aria-label={t.ungrouped}>
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-[var(--muted)]">{t.ungrouped} · {students.filter((s) => !s.groupId).length}</h2>
          <ul className="flex flex-wrap gap-1.5 text-sm">{students.filter((s) => !s.groupId).map(chip)}</ul>
        </section>
      )}

      {students.length > 0 && team.groups.length > 0 && (
        <details className="card p-4">
          <summary className="cursor-pointer text-lg font-extrabold">{t.assignToGroups}</summary>
          <h2 className="sr-only">{t.assignToGroups}</h2>
          <ul className="mt-2 divide-y divide-[var(--border-soft)]">
            {students.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 py-1.5">
                <span className="flex min-w-0 items-center gap-2 truncate font-semibold"><Badge name={s.name || s.email} size={28} round />{s.name || s.email || t.student}</span>
                <select value={s.groupId ?? ""} onChange={(e) => post({ action: "setGroup", userId: s.id, groupId: e.target.value || null })} aria-label={s.name || s.email || t.student} className={field}>
                  <option value="">{t.noGroup}</option>
                  {team.groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
