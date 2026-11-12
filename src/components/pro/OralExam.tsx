"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import { errorText, listenOnce, proFetch, speechRecognition } from "./api";

type Msg = { role: "user" | "assistant"; content: string };
type Verdict = { score: number; right: string[]; missing: string[]; advice: string };

const SPEECH_LANG: Record<string, string> = { cs: "cs-CZ", en: "en-US", de: "de-DE", ru: "ru-RU", uk: "uk-UA", ja: "ja-JP", es: "es-ES", fr: "fr-FR" };

// Hlas zkoušejícího: v prohlížeči se mluví systémovým hlasem. Vybereme mužský, pokud v zařízení je
// (podle jména), jinak aspoň ne ženský. Hlas se zesílí níž tónem a pomalejším tempem, ať zní přátelsky.
const MALE_VOICE = /jakub|pavel|ondřej|ondrej|tomáš|tomas|martin|david|daniel|jan\b|male|muž|man\b/i;
const FEMALE_VOICE = /zuzana|vlasta|alena|eva\b|female|žena|woman|kateřina|katerina|lucie|petra|monika/i;

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const prefix = lang.slice(0, 2).toLowerCase();
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(prefix));
  return voices.find((v) => MALE_VOICE.test(v.name)) ?? voices.find((v) => !FEMALE_VOICE.test(v.name)) ?? voices[0] ?? null;
}

const BUBBLE_BORDER = "#6ee7ff";
const BUBBLE_BG = "#1a1644";

// Vlastní SVG ocas bubliny. Levý je pro zkoušejícího, pravý pro žáka (zrcadlově).
function Tail({ side, gradientId }: { side: "left" | "right"; gradientId: string }) {
  const mirrored = side === "right";
  const fill = mirrored ? `url(#${gradientId})` : BUBBLE_BG;
  return (
    <svg
      aria-hidden
      width="18"
      height="14"
      viewBox="0 0 18 14"
      className={`pointer-events-none absolute top-full -mt-0.5 ${mirrored ? "right-4 scale-x-[-1]" : "left-4"}`}
    >
      {mirrored && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffd24d" />
            <stop offset="1" stopColor="#ff8fd0" />
          </linearGradient>
        </defs>
      )}
      <path d="M0 0 H18 L4 13 Z" fill={fill} stroke={mirrored ? "none" : BUBBLE_BORDER} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// Avatar zkoušejícího: vlastní SVG (kulatý obličej a čepice absolventa).
function ExaminerAvatar() {
  return (
    <svg aria-hidden viewBox="0 0 48 48" width="40" height="40" className="shrink-0 drop-shadow-[0_0_10px_rgba(110,231,255,0.45)]">
      <circle cx="24" cy="26" r="18" fill="#2a2466" stroke={BUBBLE_BORDER} strokeWidth="2" />
      <circle cx="18" cy="24" r="2.4" fill="#f2fbff" />
      <circle cx="30" cy="24" r="2.4" fill="#f2fbff" />
      <path d="M18 33 Q24 38 30 33" fill="none" stroke="#ffd24d" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 3 L44 10 L24 17 L4 10 Z" fill="#ffd24d" stroke="#16132b" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 13 V19 Q24 24 36 19 V13" fill="none" stroke="#16132b" strokeWidth="1.6" strokeLinejoin="round" />
      <line x1="40" y1="10" x2="40" y2="19" stroke="#ffd24d" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChatBubble({ role, children }: { role: Msg["role"]; children: React.ReactNode }) {
  const id = useId().replace(/:/g, "");
  const mine = role === "user";
  return (
    <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
      {!mine && <ExaminerAvatar />}
      <div className={`relative max-w-[82%] whitespace-pre-wrap rounded-[1.25rem] px-4 py-3 text-[0.95rem] leading-relaxed sm:max-w-[72%] ${mine ? "rounded-br-md font-semibold text-[#16132b]" : "rounded-bl-md text-[#f2fbff]"}`}
        style={
          mine
            ? { background: "linear-gradient(90deg, #ffd24d, #ff8fd0)", boxShadow: "0 4px 0 rgba(8,5,30,0.55), 0 0 1.6em rgba(255,143,208,0.25)" }
            : { background: `linear-gradient(160deg, ${BUBBLE_BG}, #0e0a2c)`, border: `2px solid ${BUBBLE_BORDER}`, boxShadow: "0 4px 0 rgba(8,5,30,0.55), 0 0 1.6em rgba(110,231,255,0.22)" }
        }
      >
        {children}
        <Tail side={mine ? "right" : "left"} gradientId={`tail-${id}`} />
      </div>
    </div>
  );
}

function TypingDots({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2" role="status">
      <ExaminerAvatar />
      <div className="flex items-center gap-1.5 rounded-[1.25rem] rounded-bl-md px-4 py-3" style={{ background: BUBBLE_BG, border: `2px solid ${BUBBLE_BORDER}` }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 animate-pulse rounded-full bg-[#6ee7ff]" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}

const IconMic = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);

const IconSend = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11.5 21 4l-7.5 17-2.4-6.6L3 11.5Z" />
    <path d="M21 4 11.1 14.4" />
  </svg>
);

// Ústní zkoušení: zkoušející se ptá nahlas (volitelně), žák odpovídá hlasem nebo textem, na konci dostane hodnocení.
export function OralExam({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [topic, setTopic] = useState("");
  const [started, setStarted] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speak, setSpeak] = useState(false);
  const [error, setError] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const stop = useRef<(() => void) | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const canListen = typeof window !== "undefined" && !!speechRecognition();

  useEffect(() => () => { stop.current?.(); window.speechSynthesis?.cancel(); }, []);

  // Nová zpráva se posune do zobrazení.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  function say(s: string) {
    if (!speak || !window.speechSynthesis) return;
    const lang = SPEECH_LANG[locale] ?? "cs-CZ";
    const u = new SpeechSynthesisUtterance(s);
    u.lang = lang;
    u.voice = pickVoice(lang);
    u.pitch = 0.8; // nižší tón působí mužsky a klidněji
    u.rate = 0.95; // o něco pomaleji, srozumitelněji a přátelštěji
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  async function ask(history: Msg[]) {
    setBusy(true);
    setError("");
    const r = await proFetch<{ reply: string }>("/api/pro/ai", { mode: "oral", locale, topic, messages: history });
    setBusy(false);
    if (!r.ok) return setError(errorText(t, r.error));
    setMsgs([...history, { role: "assistant", content: r.data.reply }]);
    say(r.data.reply);
  }

  async function start(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setStarted(true);
    setMsgs([]);
    setVerdict(null);
    await ask([]);
  }

  async function answer(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(next);
    setText("");
    await ask(next);
  }

  async function finish() {
    if (busy) return;
    stop.current?.();
    window.speechSynthesis?.cancel();
    setBusy(true);
    setError("");
    const r = await proFetch<Verdict>("/api/pro/ai", { mode: "oral", locale, topic, finish: true, messages: msgs });
    setBusy(false);
    if (r.ok) setVerdict(r.data);
    else setError(errorText(t, r.error));
  }

  function mic() {
    if (listening) return stop.current?.();
    setListening(true);
    stop.current = listenOnce(SPEECH_LANG[locale] ?? "cs-CZ", (s) => setText((x) => (x ? x + " " : "") + s), () => setListening(false));
    if (!stop.current) setListening(false);
  }

  const studentTurns = msgs.filter((m) => m.role === "user").length;

  if (!started) {
    return (
      <form onSubmit={start} className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-[linear-gradient(160deg,rgba(18,26,56,0.96),rgba(11,16,36,0.96))] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <ExaminerAvatar />
          <p className="text-sm text-[#cfc8e4]">{t.oralIntro}</p>
        </div>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={120} placeholder={t.oralTopic} className="rounded-2xl border-2 border-[#6a63ad] bg-[rgba(8,10,28,0.7)] px-4 py-3 text-sm text-white placeholder:text-[#9d96bf] focus:border-[var(--accent-green)] focus:outline-none" />
        <label className="flex items-center gap-2 text-sm text-[#cfc8e4]">
          <input type="checkbox" checked={speak} onChange={(e) => setSpeak(e.target.checked)} className="accent-[#6ee7ff]" /> {t.oralSpeak}
        </label>
        <button type="submit" disabled={!topic.trim()} className="btn-bouncy btn-cta btn-primary btn-lg w-fit font-bold disabled:opacity-50">
          {t.oralStart}
        </button>
      </form>
    );
  }

  return (
    <div className="grid gap-4">
      <div ref={logRef} className="relative grid h-[min(60vh,30rem)] content-start gap-4 overflow-y-auto rounded-[1.75rem] border border-white/10 bg-[linear-gradient(160deg,rgba(18,26,56,0.96),rgba(11,16,36,0.96))] p-4 sm:p-5" aria-live="polite">
        <span className="pill w-fit border-[#6ee7ff] bg-transparent px-3 py-1 text-xs font-bold text-[#6ee7ff]">{topic}</span>
        {msgs.map((m, i) => (
          <ChatBubble key={i} role={m.role}>
            {m.content}
          </ChatBubble>
        ))}
        {busy && <TypingDots label={t.thinking} />}
      </div>
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      {verdict ? (
        <section className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-[linear-gradient(160deg,rgba(18,26,56,0.96),rgba(11,16,36,0.96))] p-5 sm:p-6">
          <p className="gradient-text w-fit rounded-xl px-3 text-4xl font-extrabold tabular-nums">{verdict.score}/10</p>
          {verdict.right.length > 0 && (
            <div>
              <p className="text-sm font-bold text-[var(--accent-green)]">{t.oralRight}</p>
              <ul className="list-disc pl-5 text-sm text-[#e6e2f5]">{verdict.right.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          )}
          {verdict.missing.length > 0 && (
            <div>
              <p className="text-sm font-bold text-[#ff5d73]">{t.oralMissing}</p>
              <ul className="list-disc pl-5 text-sm text-[#e6e2f5]">{verdict.missing.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          )}
          {verdict.advice && <p className="text-sm text-[#cfc8e4]">{verdict.advice}</p>}
          <button type="button" onClick={() => { setStarted(false); setVerdict(null); }} className="btn-bouncy btn-secondary btn-lg mt-1 w-fit">
            {t.oralAgain}
          </button>
        </section>
      ) : (
        <>
          <form onSubmit={answer} className="flex items-center gap-2 rounded-2xl border-2 border-[#6a63ad] bg-[rgba(8,10,28,0.7)] p-1.5 pl-4 focus-within:border-[var(--accent-green)]">
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder={t.oralAnswer} className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white placeholder:text-[#9d96bf] focus:outline-none" />
            {canListen && (
              <button type="button" onClick={mic} aria-pressed={listening} aria-label={t.pronSpeak} title={t.pronSpeak} className={`btn-bouncy grid h-10 w-10 shrink-0 place-items-center rounded-full ${listening ? "bg-[#ff5d73] text-white" : "bg-[rgba(110,231,255,0.15)] text-[#6ee7ff]"}`}>
                <IconMic />
              </button>
            )}
            <button type="submit" disabled={busy || !text.trim()} aria-label={t.send} title={t.send} className="btn-bouncy btn-cta btn-primary grid h-10 w-10 shrink-0 place-items-center rounded-xl disabled:opacity-50">
              <IconSend />
            </button>
          </form>
          <button type="button" onClick={() => void finish()} disabled={busy || studentTurns === 0} className="btn-bouncy btn-secondary btn-lg w-fit disabled:opacity-50">
            {t.oralFinish}
          </button>
        </>
      )}
    </div>
  );
}
