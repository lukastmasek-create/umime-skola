"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getTeamsEdx } from "@/i18n/teams-edx";
import { tfill } from "@/i18n/teams";
import { call, fmtDate } from "./api";
import type { TeamRow, Urgent } from "./types";

type Msg = { from: "ai" | "me"; text: string; at: string; model?: boolean };
const hhmm = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** Asistent v přehledu týmů. Odpovídá modelem přes /api/tymy/asistent; když služba není dostupná (chybí klíč, limit, výpadek), odpoví lokálně z dat, která stránka už má. */
export function EdxAssistant({ locale, teams, urgent }: { locale: Locale; teams: TeamRow[]; urgent: Urgent[] }) {
  const t = getTeamsEdx(locale);
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    const now = new Date();
    const h = now.getHours();
    return [{ from: "ai", text: h < 11 ? t.aiMorning : h < 18 ? t.aiDay : t.aiEve, at: hhmm(now) }];
  });
  const [text, setText] = useState("");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight }); }, [msgs]);

  const open = teams.filter((x) => x.role === "STUDENT").reduce((n, x) => n + x.open, 0);
  const late = teams.reduce((n, x) => n + x.overdue, 0);
  function answer(q: string): string {
    const s = q.toLowerCase();
    if (/term[ií]n|deadline|due|kdy/.test(s))
      return urgent[0] ? tfill(t.aiNext, urgent[0].title, fmtDate(locale, urgent[0].dueAt)) : t.aiNone;
    if (/zad[aá]n|[uú]kol|task|assign|open|nespln/.test(s)) return tfill(t.aiOpen, open) + (late > 0 ? " " + tfill(t.aiOverdue, late) : "");
    if (/t[ýy]m|team/.test(s)) return teams.length ? tfill(t.aiTeams, teams.length) : t.aiNoTeams;
    return t.aiHelp;
  }
  const [busy, setBusy] = useState(false);
  async function ask(q: string) {
    const v = q.trim();
    if (!v || busy) return;
    const mine: Msg = { from: "me", text: v, at: hhmm(new Date()) };
    // Úvodní pozdrav není součást konverzace pro model; posílá se jen to, co uživatel řekl, a odpovědi modelu.
    const history = [...msgs.filter((m) => m.from === "me" || m.model), mine].map((m) => ({ role: m.from === "me" ? "user" : "assistant", content: m.text }));
    setMsgs((m) => [...m, mine]);
    setText("");
    setBusy(true);
    let reply = "";
    let model = false;
    try {
      const d = await call<{ reply: string }>("/api/tymy/asistent", { messages: history, locale });
      reply = d.reply;
      model = true;
    } catch {
      reply = answer(v);
    }
    setBusy(false);
    setMsgs((m) => [...m, { from: "ai", text: reply, at: hhmm(new Date()), model }]);
  }

  return (
    <section className="card flex flex-col gap-4 p-5" aria-label={t.aiTitle}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold">{t.aiTitle}</h2>
        <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-bold">{t.aiToday}</span>
      </div>
      <div ref={box} className="flex max-h-44 min-h-28 flex-col gap-3 overflow-y-auto" role="log" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`flex items-start gap-3 ${m.from === "me" ? "flex-row-reverse" : ""}`}>
            {m.from === "ai" && <span aria-hidden className="mt-1 size-9 shrink-0 rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, #d9ccff, #6c3df0 55%, #2a1a7a)" }} />}
            <p className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-semibold ${m.from === "ai" ? "bg-[var(--surface-muted)]" : "bg-[var(--brand-500)] text-white"}`}>
              {m.text} <span className="ml-1 text-[10px] font-normal opacity-60">{m.at}</span>
            </p>
          </div>
        ))}
        {busy && <p className="ml-12 text-sm text-[var(--muted)]" role="status">{t.aiThinking}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[t.aiQ1, t.aiQ2, t.aiQ3].map((q) => (
          <button key={q} type="button" onClick={() => void ask(q)} className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)]">{q}</button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); void ask(text); }} className="flex items-center gap-2 rounded-2xl border border-[var(--field-border)] px-3 py-1.5">
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={120} placeholder={t.aiPh} aria-label={t.aiPh} className="min-w-0 flex-1 !border-0 bg-transparent py-1.5 text-sm outline-none" />
        <button disabled={busy} aria-label={t.aiSend} className="grid size-8 place-items-center rounded-full text-[var(--muted)] hover:text-[var(--brand-600)]">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z" /></svg>
        </button>
      </form>
    </section>
  );
}
