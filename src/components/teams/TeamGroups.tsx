"use client";

import { Glyph } from "./Glyph";
import { useState, type ReactNode } from "react";
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { tfill } from "@/i18n/teams";
import type { TeamsAll } from "@/i18n/teams-more";
import type { Locale } from "@/i18n/config";
import { getTeamsEdx } from "@/i18n/teams-edx";
import { AvatarStack, Badge } from "./ui";
import { field, type Member, type Team } from "./types";

type Post = (body: object) => Promise<boolean>;

function Chip({ s, label, lifted = false }: { s: Member; label: string; lifted?: boolean }) {
  return (
    <span className={`flex items-center gap-1.5 rounded-full bg-[var(--surface-muted)] py-0.5 pl-0.5 pr-3 text-sm font-semibold ${lifted ? "cursor-grabbing shadow-lg ring-2 ring-[var(--brand-500)]" : "cursor-grab"}`}>
      <Badge name={s.name || s.email} size={24} round />{label}
    </span>
  );
}

function DragChip({ s, label }: { s: Member; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: s.id });
  return (
    <li ref={setNodeRef} {...listeners} {...attributes} className={isDragging ? "opacity-30" : ""}>
      <Chip s={s} label={label} />
    </li>
  );
}

function Zone({ id, className, children }: { id: string; className: string; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return <div ref={setNodeRef} className={`${className} ${isOver ? "outline-dashed outline-2 outline-offset-2 outline-[var(--brand-500)]" : ""}`}>{children}</div>;
}

/** Skupiny uvnitř třídy: mřížka karet, náhodné rozlosování a přetahování žáků mezi skupinami (myš, dotyk i klávesnice). */
export function TeamGroups({ t, team, post, locale }: { t: TeamsAll; team: Team; post: Post; locale: Locale }) {
  const e = getTeamsEdx(locale);
  const students = team.members.filter((m) => m.role === "STUDENT");
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [count, setCount] = useState(3);
  const [q, setQ] = useState("");
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [dragging, setDragging] = useState<Member | null>(null);
  // Okamžité přesunutí při puštění; zruší se, až server odpoví a tým se znovu načte.
  const [local, setLocal] = useState<Record<string, string | null>>({});
  const groupOf = (s: Member) => (s.id in local ? local[s.id] : s.groupId);
  const label = (s: Member) => s.name || s.email || t.student;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );
  async function onEnd(ev: DragEndEvent) {
    setDragging(null);
    if (!ev.over) return;
    const uid = String(ev.active.id);
    const to = String(ev.over.id) === "none" ? null : String(ev.over.id);
    const st = students.find((x) => x.id === uid);
    if (!st || groupOf(st) === to) return;
    setLocal((l) => ({ ...l, [uid]: to }));
    await post({ action: "setGroup", userId: uid, groupId: to });
    setLocal((l) => { const n = { ...l }; delete n[uid]; return n; });
  }
  const onStart = (ev: DragStartEvent) => setDragging(students.find((x) => x.id === ev.active.id) ?? null);

  const groups = team.groups.filter((g) => !q.trim() || g.name.toLowerCase().includes(q.trim().toLowerCase()));
  const ungrouped = students.filter((s) => !groupOf(s));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>{t.tabGroups}</h2>
        <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold text-[var(--muted)]">{students.length} {e.gStudents}</span>
        <input value={q} onChange={(ev) => setQ(ev.target.value)} placeholder={e.gSearch} aria-label={e.gSearch} className={`${field} w-56 !rounded-full`} />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <form
            className="flex items-center gap-1.5 rounded-full bg-[var(--surface)] p-1 pl-3"
            onSubmit={async (ev) => {
              ev.preventDefault();
              if (students.length < 2) return;
              if (team.groups.some((g) => g.members > 0) && !confirm(t.confirmShuffle)) return;
              await post({ action: "randomGroups", count, prefix: t.groupPrefix });
            }}
          >
            <input type="number" min={2} max={12} value={count} onChange={(ev) => setCount(Number(ev.target.value))} aria-label={t.groupCount} className="w-12 !border-0 bg-transparent text-center text-sm font-bold" />
            <button disabled={students.length < 2} className="rounded-full bg-[var(--accent-yellow)] px-4 py-2 text-sm font-bold text-[#17142b] disabled:opacity-50">
              <Glyph name="dice" className="mr-1.5 size-[1.1em]" />{t.shuffle}
            </button>
          </form>
          <button type="button" onClick={() => setAdding((v) => !v)} aria-expanded={adding} className="rounded-full bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">+ {e.gAdd}</button>
        </div>
      </div>

      {adding && (
        <form className="card flex flex-wrap items-center gap-2 p-4" onSubmit={async (ev) => { ev.preventDefault(); if (await post({ action: "createGroup", name })) { setName(""); setAdding(false); } }}>
          <label htmlFor="new-group" className="sr-only">{t.newGroup}</label>
          <input id="new-group" value={name} onChange={(ev) => setName(ev.target.value)} maxLength={40} placeholder={t.groupNamePh} className={`${field} min-w-0 flex-1`} required autoFocus />
          <button className="rounded-full bg-[var(--brand-500)] px-5 py-2 text-sm font-bold text-white">{t.add}</button>
          <button type="button" onClick={() => setAdding(false)} className="px-3 text-sm font-bold text-[var(--muted)]">{e.gCancel}</button>
        </form>
      )}

      <p className="text-sm text-[var(--muted)]">{t.groupsIntro} {t.dragHint}</p>

      <DndContext sensors={sensors} onDragStart={onStart} onDragEnd={onEnd} onDragCancel={() => setDragging(null)}>
        {students.length > 0 && team.groups.length > 0 && (
          <Zone id="none" className="card flex flex-col gap-2 p-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-[var(--muted)]">{t.ungrouped} · {ungrouped.length}</h3>
            <ul className="flex min-h-9 flex-wrap gap-1.5">{ungrouped.map((s) => <DragChip key={s.id} s={s} label={label(s)} />)}</ul>
          </Zone>
        )}

        {team.groups.length === 0 && <p className="card p-6 text-center text-[var(--muted)]">{t.noGroups}</p>}
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => {
            const members = students.filter((s) => groupOf(s) === g.id);
            const tasks = team.assignments.filter((a) => !a.archived && a.groupIds?.includes(g.id)).length;
            return (
              <li key={g.id}>
                <Zone id={g.id} className="card flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-2">
                    {renaming?.id === g.id ? (
                      <form className="flex min-w-0 flex-1 gap-2" onSubmit={async (ev) => { ev.preventDefault(); if (await post({ action: "renameGroup", groupId: g.id, name: renaming.name })) setRenaming(null); }}>
                        <input value={renaming.name} onChange={(ev) => setRenaming({ id: g.id, name: ev.target.value })} maxLength={40} aria-label={t.groupNamePh} className={`${field} min-w-0 flex-1`} autoFocus />
                        <button className="text-xs font-bold text-[var(--brand-600)]">{t.save}</button>
                      </form>
                    ) : (
                      <span className="flex min-w-0 items-center gap-3">
                        <Badge name={g.name} size={48} />
                        <span className="flex min-w-0 flex-col">
                          <b className="truncate text-base">{g.name}</b>
                          <span className="text-xs text-[var(--muted)]">{tfill(t.membersN, members.length)}</span>
                        </span>
                      </span>
                    )}
                    <details className="relative">
                      <summary aria-label={e.gMenu} className="grid size-8 cursor-pointer list-none place-items-center rounded-full text-lg font-bold leading-none text-[var(--muted)] hover:bg-[var(--surface-muted)]">⋯</summary>
                      <div className="card absolute right-0 z-20 mt-1 flex w-40 flex-col p-1.5" role="menu">
                        <button role="menuitem" onClick={(ev) => { (ev.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open"); setRenaming({ id: g.id, name: g.name }); }} className="rounded-lg px-3 py-2 text-left text-sm font-bold hover:bg-[var(--surface-muted)]">{t.rename}</button>
                        <button role="menuitem" onClick={() => confirm(t.confirmDeleteGroup) && post({ action: "deleteGroup", groupId: g.id })} className="rounded-lg px-3 py-2 text-left text-sm font-bold text-[var(--danger)] hover:bg-[var(--surface-muted)]">{t.remove}</button>
                      </div>
                    </details>
                  </div>
                  <AvatarStack names={members.map((s) => s.name || s.email)} max={8} />
                  <ul className="flex min-h-9 flex-wrap gap-1.5">
                    {members.map((s) => <DragChip key={s.id} s={s} label={label(s)} />)}
                    {members.length === 0 && <li className="text-sm text-[var(--muted)]">{e.gDrop}</li>}
                  </ul>
                  <div className="mt-auto flex items-end justify-between border-t border-[var(--border-soft)] pt-3">
                    <div>
                      <p className="text-xs text-[var(--muted)]">{e.gAssignments}</p>
                      <p className="text-sm font-bold">{tasks}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--muted)]">{e.gMembers}</p>
                      <p className="text-2xl font-extrabold leading-none text-[var(--accent-green)]">{members.length}</p>
                    </div>
                  </div>
                </Zone>
              </li>
            );
          })}
        </ul>
        <DragOverlay>{dragging ? <Chip s={dragging} label={label(dragging)} lifted /> : null}</DragOverlay>
      </DndContext>

      {students.length > 0 && team.groups.length > 0 && (
        <details className="card p-4">
          <summary className="cursor-pointer text-lg font-extrabold">{t.assignToGroups}</summary>
          <h3 className="sr-only">{t.assignToGroups}</h3>
          <ul className="mt-2 divide-y divide-[var(--border-soft)]">
            {students.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 py-1.5">
                <span className="flex min-w-0 items-center gap-2 truncate font-semibold"><Badge name={s.name || s.email} size={28} round />{label(s)}</span>
                <select value={groupOf(s) ?? ""} onChange={(ev) => post({ action: "setGroup", userId: s.id, groupId: ev.target.value || null })} aria-label={label(s)} className={field}>
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
