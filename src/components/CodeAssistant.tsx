"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SketchIcon } from "@/components/SketchIcons";
import { getAssistContext } from "@/lib/code-assist";
import { AiMarkdown } from "@/components/ai/AiMarkdown";

type Msg = { role: "user" | "assistant"; content: string };

const QUICK = ["Vysvětli mi můj kód", "Proč to nefunguje?", "Dej mi nápovědu", "Jak to vylepšit?", "Najdi chybu", "Co zkusit dál?"];
const STORE_KEY = "umime-code-ai-v1";

// Plovoucí AI pomocník s kódem. Vidí, co má žák právě otevřené v editoru (jde vypnout).
export function CodeAssistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [useCode, setUseCode] = useState(true);
  const [error, setError] = useState("");
  const box = useRef<HTMLDivElement>(null);

  // Konverzace přežije přechod mezi editory a obnovení stránky (jen v této záložce).
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) ?? "[]") as Msg[];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(saved)) setMsgs(saved.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-20));
    } catch {
      /* bez úložiště */
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(msgs.slice(-20)));
    } catch {
      /* bez úložiště */
    }
  }, [msgs]);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [msgs, busy, open]);

  async function ask(q: string) {
    const v = q.trim();
    if (!v || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: v }];
    setMsgs(next);
    setText("");
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/code-asistent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, useCode, context: getAssistContext() }),
      });
      const d = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (res.ok && d.reply) setMsgs([...next, { role: "assistant", content: d.reply }]);
      else setError(d.error === "rate-limited" ? "Moc otázek najednou. Zkus to za chvíli." : "Pomocník je teď mimo. Zkus to znovu později.");
    } catch {
      setError("Pomocník je teď mimo. Zkus to znovu později.");
    }
    setBusy(false);
  }

  return (
    <div className="sk-ai fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            role="dialog"
            aria-label="AI pomocník s kódem"
            initial={{ opacity: 0, y: 16, rotate: -1.2, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="flex max-h-[min(34rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border-2 border-[var(--sketch-ink)] bg-[#1e1b3a] text-[#f6f1e4] shadow-[6px_6px_0_var(--shadow-ink)]"
          >
            <header className="flex items-center gap-2 border-b border-[#35305f] bg-[#16132b] px-4 py-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#ffc933] bg-[#221e44]">
                <SketchIcon kind="sparkle" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold leading-tight text-white">AI pomocník</h2>
                <p className="text-[11px] text-[#9d96bf]">Ptej se na kód, chyby i nápady</p>
              </div>
              {msgs.length > 0 && (
                <button type="button" onClick={() => { setMsgs([]); setError(""); }} title="Nový rozhovor" className="rounded-md px-2 py-1 text-xs font-bold text-[#cfc8e4] hover:bg-[#2c2a52]">
                  Nový
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} aria-label="Zavřít pomocníka" className="rounded-md px-2 py-1 text-lg leading-none text-[#cfc8e4] hover:bg-[#2c2a52]">
                ×
              </button>
            </header>

            <div ref={box} role="log" aria-live="polite" className="flex min-h-40 flex-1 flex-col gap-3 overflow-y-auto p-4 text-sm">
              {msgs.length === 0 && (
                <p className="rounded-xl border-2 border-dashed border-[#35305f] p-3 text-[#cfc8e4]">
                  Ahoj! Jsem pomocník s kódem. Vidím, co máš otevřené v editoru, takže se můžeš ptát rovnou. Řešení ti hned nevyzradím, nejdřív tě navedu.
                </p>
              )}
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[90%] rounded-2xl px-3 py-2 leading-relaxed ${
                    m.role === "user" ? "self-end bg-[#353b86] text-white" : "self-start bg-[#2c2a52] text-[#f6f1e4]"
                  }`}
                >
                  {m.role === "user" ? <p className="whitespace-pre-wrap">{m.content}</p> : <AiMarkdown text={m.content} dark />}
                </div>
              ))}
              {busy && <p className="text-[#9d96bf]" role="status">Přemýšlím…</p>}
              {error && <p className="text-[#ff9bd2]" role="alert">{error}</p>}
            </div>

            <div className="border-t border-[#35305f] p-3">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {QUICK.map((q) => (
                  <button key={q} type="button" disabled={busy} onClick={() => void ask(q)} className="rounded-full border border-[#35305f] bg-[#221e44] px-2.5 py-1 text-xs font-bold text-[#cfc8e4] hover:border-[#8d99ff] disabled:opacity-50">
                    {q}
                  </button>
                ))}
              </div>
              <label className="mb-2 flex items-center gap-2 text-xs text-[#9d96bf]">
                <input type="checkbox" checked={useCode} onChange={(e) => setUseCode(e.target.checked)} className="accent-[#ffc933]" />
                Poslat pomocníkovi můj kód z editoru
              </label>
              <form onSubmit={(e) => { e.preventDefault(); void ask(text); }} className="flex items-center gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={1500}
                  placeholder="Zeptej se…"
                  aria-label="Tvoje otázka"
                  className="min-w-0 flex-1 rounded-lg border-2 border-[#35305f] bg-[#0f0d24] px-3 py-2 text-sm text-white outline-none focus:border-[#ffc933]"
                />
                <button disabled={busy || !text.trim()} className="rounded-lg border-2 border-[#ffc933] bg-[#ffc933] px-3 py-2 text-sm font-bold text-[#16132b] shadow-[3px_3px_0_#16132b] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50">
                  Poslat
                </button>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border-2 border-[var(--sketch-ink)] bg-[#ffc933] px-4 py-3 text-sm font-extrabold text-[#16132b] shadow-[4px_4px_0_var(--shadow-ink)] transition-transform hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        <SketchIcon kind="sparkle" size={18} />
        {open ? "Zavřít" : "AI pomocník"}
      </button>
    </div>
  );
}
