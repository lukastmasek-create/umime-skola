"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { call, fmtDate } from "./api";
import type { Locale } from "@/i18n/config";
import { getTeamsText, teamsError } from "@/i18n/teams";
import { errorCode } from "./api";

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

  return (
    <div className="flex flex-col gap-2">
      <div ref={box} className={`${height} overflow-y-auto rounded-xl border-2 border-[var(--border-soft)] bg-[var(--surface-muted)] p-3`} aria-live="polite">
        {msgs === null && <p className="text-sm text-[var(--muted)]">{t.loading}</p>}
        {msgs?.length === 0 && <p className="text-sm text-[var(--muted)]">{t.chatEmpty}</p>}
        <ul className="flex flex-col gap-2">
          {msgs?.map((m) => {
            const mine = m.userId === userId;
            return (
              <li key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <span className="text-xs text-[var(--muted)]">
                  {m.name || t.chatAnon}
                  {m.teacher && <b className="ml-1 rounded bg-[var(--brand-50)] px-1 text-[var(--brand-700)]">{t.teacherBadge}</b>} · {fmtDate(locale, m.createdAt)}
                </span>
                <span className={`group max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-1.5 text-sm ${mine ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)]"}`}>
                  {m.text}
                  {(mine || mod) && (
                    <button type="button" onClick={() => remove(m.id)} className="ml-2 text-xs opacity-60 hover:opacity-100" aria-label={t.deleteMsg}>✕</button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      {error && <p className="text-sm font-semibold text-[var(--danger)]">{error}</p>}
      <form onSubmit={send} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder={t.msgPh} aria-label={t.msgPh} className="min-w-0 flex-1 rounded-xl border-2 border-[var(--field-border)] bg-[var(--surface)] px-3 py-2 text-sm" />
        <button className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white">{t.send}</button>
      </form>
    </div>
  );
}
