"use client";

import { useState } from "react";
import { tfill } from "@/i18n/teams";
import type { TeamsAll } from "@/i18n/teams-more";
import { dangerBtn, field, linkBtn, primaryBtn, type Team } from "./types";

type Post = (body: object) => Promise<boolean>;

/** Skupiny uvnitř třídy: ruční správa, náhodné rozlosování a přiřazení žáků. */
export function TeamGroups({ t, team, post }: { t: TeamsAll; team: Team; post: Post }) {
  const students = team.members.filter((m) => m.role === "STUDENT");
  const [name, setName] = useState("");
  const [count, setCount] = useState(3);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--muted)]">{t.groupsIntro}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <form className="card flex flex-col gap-2 p-4" onSubmit={async (e) => { e.preventDefault(); if (await post({ action: "createGroup", name })) setName(""); }}>
          <h2 className="text-lg font-extrabold">{t.newGroup}</h2>
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder={t.groupNamePh} aria-label={t.groupNamePh} className={`${field} min-w-0 flex-1`} required />
            <button className={primaryBtn}>{t.add}</button>
          </div>
        </form>
        <form
          className="card flex flex-col gap-2 p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (students.length === 0) return;
            if (team.groups.some((g) => g.members > 0) && !confirm(t.confirmShuffle)) return;
            await post({ action: "randomGroups", count, prefix: t.groupPrefix });
          }}
        >
          <h2 className="text-lg font-extrabold">{t.randomGroups}</h2>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold">{t.groupCount}<input type="number" min={2} max={12} value={count} onChange={(e) => setCount(Number(e.target.value))} className={`${field} w-20`} /></label>
            <button disabled={students.length < 2} className={primaryBtn}>{t.shuffle}</button>
          </div>
        </form>
      </div>

      {team.groups.length === 0 && <p className="text-[var(--muted)]">{t.noGroups}</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {team.groups.map((g) => (
          <li key={g.id} className="card flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-2">
              {renaming?.id === g.id ? (
                <form className="flex min-w-0 flex-1 gap-2" onSubmit={async (e) => { e.preventDefault(); if (await post({ action: "renameGroup", groupId: g.id, name: renaming.name })) setRenaming(null); }}>
                  <input value={renaming.name} onChange={(e) => setRenaming({ id: g.id, name: e.target.value })} maxLength={40} aria-label={t.groupNamePh} className={`${field} min-w-0 flex-1`} autoFocus />
                  <button className={linkBtn}>{t.save}</button>
                </form>
              ) : (
                <>
                  <b className="truncate text-lg">{g.name} <span className="text-sm font-normal text-[var(--muted)]">· {tfill(t.membersN, g.members)}</span></b>
                  <span className="flex gap-3">
                    <button onClick={() => setRenaming({ id: g.id, name: g.name })} className={linkBtn}>{t.rename}</button>
                    <button onClick={() => confirm(t.confirmDeleteGroup) && post({ action: "deleteGroup", groupId: g.id })} className={dangerBtn}>{t.remove}</button>
                  </span>
                </>
              )}
            </div>
            <ul className="flex flex-wrap gap-1.5 text-sm">
              {students.filter((s) => s.groupId === g.id).map((s) => <li key={s.id} className="rounded-full bg-[var(--brand-50)] px-2.5 py-0.5 font-semibold">{s.name || s.email || t.student}</li>)}
            </ul>
          </li>
        ))}
      </ul>

      {students.length > 0 && team.groups.length > 0 && (
        <section className="card p-4">
          <h2 className="mb-2 text-lg font-extrabold">{t.assignToGroups}</h2>
          <ul className="divide-y divide-[var(--border-soft)]">
            {students.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 py-1.5">
                <span className="min-w-0 truncate font-semibold">{s.name || s.email || t.student}</span>
                <select value={s.groupId ?? ""} onChange={(e) => post({ action: "setGroup", userId: s.id, groupId: e.target.value || null })} aria-label={s.name || s.email || t.student} className={field}>
                  <option value="">{t.noGroup}</option>
                  {team.groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
