"use client";

import type { TeamsAll } from "@/i18n/teams-more";
import type { Audience, Group, Member } from "./types";

/** Komu zadání platí: celé třídě, nebo vybraným skupinám a žákům. Prázdný výběr = celá třída. */
export function AudiencePicker({ t, groups, students, value, onChange }: { t: TeamsAll; groups: Group[]; students: Member[]; value: Audience; onChange: (v: Audience) => void }) {
  const all = value.groupIds.length === 0 && value.userIds.length === 0;
  const toggle = (key: keyof Audience, id: string) => {
    const cur = value[key];
    onChange({ ...value, [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  };
  const chip = (on: boolean) => `cursor-pointer rounded-full border-2 px-3 py-1 text-sm font-bold ${on ? "border-[var(--edge)] bg-[var(--brand-50)]" : "border-[var(--border-soft)]"}`;
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-semibold">{t.audience}</legend>
      <div className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={all} onClick={() => onChange({ groupIds: [], userIds: [] })} className={chip(all)}>{t.audAll}</button>
        {groups.map((g) => (
          <button type="button" key={g.id} aria-pressed={value.groupIds.includes(g.id)} onClick={() => toggle("groupIds", g.id)} className={chip(value.groupIds.includes(g.id))}>{g.name}</button>
        ))}
      </div>
      {students.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold text-[var(--brand-600)]">{t.audPickStudents}{value.userIds.length > 0 && ` (${value.userIds.length})`}</summary>
          <div className="mt-2 flex max-h-48 flex-wrap gap-2 overflow-y-auto">
            {students.map((s) => (
              <label key={s.id} className={chip(value.userIds.includes(s.id))}>
                <input type="checkbox" className="sr-only" checked={value.userIds.includes(s.id)} onChange={() => toggle("userIds", s.id)} />
                {s.name || s.email || t.student}
              </label>
            ))}
          </div>
        </details>
      )}
      {!all && <p className="text-xs text-[var(--muted)]">{t.audHint}</p>}
    </fieldset>
  );
}
