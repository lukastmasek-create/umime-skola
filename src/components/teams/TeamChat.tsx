"use client";

import { Glyph } from "./Glyph";
import { useCallback, useEffect, useRef, useState } from "react";
import { call } from "./api";
import type { Locale } from "@/i18n/config";
import { getTeamsText, teamsError } from "@/i18n/teams";
import { errorCode } from "./api";
import { Badge, AvatarStack, Pill } from "./ui";
import { getTeamsEdx } from "@/i18n/teams-edx";

type Msg = { id: string; text: string; createdAt: string; userId: string; name: string | null; teacher: boolean };

// Chat týmu (bez assignmentId) nebo vlákno zadání. Průběžně se obnovuje dotazováním (Workers nemají websockety).
export function TeamChat({ locale, teamId, assignmentId, userId, height = "h-80" }: { locale: Locale; teamId: string; assignmentId?: string; userId: string; height?: string }) {
  const t = getTeamsText(locale);
  const [msgs, setMsgs] = useState<Msg[] | null>(null);
  const [mod, setMod] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const url = `/api/tymy/${teamId}/chat${assignmentId ? `?assignmentId=${assignmentId}` : ""}`;

  const load = useCallback(async () => {
    try {
      const d = await call<{ messages: Msg[]; canModerate: boolean }>(url);
      setMsgs(d.messages);
      setMod(d.canModerate);
    } catch {
      /* další dotaz to zkusí znovu */
    }
  }, [url]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const t = setInterval(() => { if (!document.hidden) void load(); }, 4000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs?.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText("");
    setError("");
    try {
      await call(`/api/tymy/${teamId}/chat`, { text: value, assignmentId });
      await load();
    } catch (err) {
      setError(teamsError(t, errorCode(err)));
      setText(value);
    }
  }

  async function remove(id: string) {
    await call(`/api/tymy/${teamId}/chat`, { action: "delete", messageId: id }).catch(() => {});
    await load();
  }

  // Hlavička: kdo ve vlákně psal a kolik je zpráv. Zprávy stejného autora krátce po sobě se slučují, dny odděluje štítek.
  const e = getTeamsEdx(locale);
  const people = Array.from(new Map((msgs ?? []).map((m) => [m.userId, m.name || ""])).values());
  const dayKey = (v: string) => new Date(v).toDateString();
  const dayLabel = (v: string) => (dayKey(v) === new Date().toDateString() ? e.schToday : new Date(v).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }));
  const hm = (v: string) => new Date(v).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <AvatarStack names={people} />
        <Pill>{msgs?.length ?? 0}</Pill>
      </div>
      <div ref={box} className={`${height} overflow-y-auto rounded-3xl bg-[var(--surface-muted)] p-4`} aria-live="polite">
        {msgs === null && <p className="text-sm text-[var(--muted)]">{t.loading}</p>}
        {msgs?.length === 0 && <p className="py-6 text-center text-sm text-[var(--muted)]">{t.chatEmpty}</p>}
        <ul className="flex flex-col gap-1">
          {msgs?.map((m, i) => {
            const mine = m.userId === userId;
            const prev = msgs[i - 1];
            const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
            const grouped = !newDay && prev.userId === m.userId && new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60000;
            return (
              <li key={m.id} className={grouped ? "" : "mt-2"}>
                {newDay && <p className="mb-2 mt-1 text-center"><span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--muted)]">{dayLabel(m.createdAt)}</span></p>}
                <div className={`group flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                  <span className={grouped ? "size-8 shrink-0" : "shrink-0"}>{!grouped && <Badge name={m.name} size={32} round />}</span>
                  <div className={`flex min-w-0 max-w-[80%] flex-col ${mine ? "items-end" : "items-start"}`}>
                    {!grouped && (
                      <span className="mb-0.5 px-1 text-xs text-[var(--muted)]">
                        <b className="text-[var(--foreground)]">{m.name || t.chatAnon}</b>
                        {m.teacher && <b className="ml-1 rounded-full bg-[var(--brand-50)] px-1.5 text-[var(--brand-700)]">{t.teacherBadge}</b>}
                      </span>
                    )}
                    <span className={`whitespace-pre-wrap break-words px-4 py-2 text-sm ${mine ? "rounded-3xl rounded-br-md bg-[var(--brand-500)] text-white" : "rounded-3xl rounded-bl-md bg-[var(--surface)]"}`}>{m.text}</span>
                  </div>
                  <span className="mb-1 flex shrink-0 items-center gap-1.5 text-[10px] text-[var(--muted)]">
                    {hm(m.createdAt)}
                    {(mine || mod) && (
                      <button type="button" onClick={() => remove(m.id)} className="opacity-0 hover:text-[var(--danger)] focus-visible:opacity-100 group-hover:opacity-100" aria-label={t.deleteMsg}><Glyph name="close" className="size-4" /></button>
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {error && <p className="text-sm font-semibold text-[var(--danger)]">{error}</p>}
      <form onSubmit={send} className="flex items-center gap-2 rounded-full border border-[var(--field-border)] bg-[var(--surface)] py-1.5 pl-4 pr-1.5">
        <input value={text} onChange={(ev) => setText(ev.target.value)} maxLength={500} placeholder={t.msgPh} aria-label={t.msgPh} className="min-w-0 flex-1 !border-0 bg-transparent py-1.5 text-sm outline-none" />
        <button aria-label={t.send} title={t.send} className="grid size-9 place-items-center rounded-full bg-[var(--brand-500)] text-white">
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z" /></svg>
        </button>
      </form>
    </div>
  );
}
