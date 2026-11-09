"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import NumberFlow from "@number-flow/react";
import { Trophy, Gamepad2, Users, Star, Send, Smile, Zap, Gift, Crown, Puzzle } from "lucide-react";
import { clsx } from "clsx";

// Tmavé herní lobby se záložkami, turnajem, výsledky a chatem. Mechaniky jsou vzdělávací (kvízy, hádanky).
const SIDE = [
  { label: "Kvíz", emoji: "🧠" },
  { label: "Bingo", emoji: "🎯" },
  { label: "Pexeso", emoji: "🃏" },
  { label: "Osmisměrka", emoji: "🔤" },
  { label: "Blesk", emoji: "⚡" },
];

const TICKER = [
  { who: "Adéla", what: "Blesk", score: "3 ⭐" },
  { who: "Bořek", what: "Pexeso", score: "2 ⭐" },
  { who: "Cecílie", what: "Bingo", score: "3 ⭐" },
  { who: "Dan", what: "Osmisměrka", score: "1 ⭐" },
  { who: "Eva", what: "Kvíz", score: "3 ⭐" },
];

const GAMES = [
  { name: "Blesk", tag: "Rychlé kolo na čas", players: 142, grad: "from-[#3b5bff] to-[#0e1a5c]", emoji: "⚡" },
  { name: "Bingo", tag: "Škrtej správné odpovědi", players: 37, grad: "from-[#7b3dff] to-[#1a0d4d]", emoji: "🎯" },
  { name: "Pexeso", tag: "Najdi dvojice karet", players: 68, grad: "from-[#1ec5ff] to-[#0a2b4d]", emoji: "🃏" },
];

const CHAT = [
  { user: "Aleksandr", time: "06:10", text: "Tak to je dobrý, 3 hvězdičky v kole za sebou!", color: "#7aa2ff" },
  { user: "Runner", time: "06:12", text: "Jo, Pexeso mám taky, nejlepší čas 42 s.", color: "#ffb36b" },
  { user: "TechnoBomg", time: "06:13", text: "Pojďte do Blesku, dnes je tam bonusový kolo.", color: "#7ee2a8" },
  { user: "Cuplinkov", time: "06:13", text: "Mám dnes 50 bodů navíc za výzvu.", color: "#c49bff" },
];

// Odpočet turnaje (do konce dne), aktualizuje se každou sekundu.
function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const d = Math.floor(left / 86400);
  const h = String(Math.floor((left % 86400) / 3600)).padStart(2, "0");
  const m = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");
  return { d, time: `${h}:${m}:${s}` };
}

export function LobbyTab() {
  const { d, time } = useCountdown(86400 + 4 * 3600 + 17 * 60 + 9);
  const [tab, setTab] = useState<"hry" | "zebricky" | "turnaje">("hry");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(CHAT);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { user: "Ty", time: "06:20", text, color: "#ff8a6b" }]);
    setDraft("");
  };

  return (
    <div className="grid overflow-hidden rounded-[24px] bg-[#0b1024] text-white lg:grid-cols-[72px_1fr_280px]">
      {/* Levý pruh s hrami */}
      <aside className="hidden flex-col items-center gap-3 border-r border-white/5 bg-[#0d1430] py-4 lg:flex" aria-label="Hry">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3b5bff] text-lg shadow-[0_0_20px_rgba(59,91,255,0.5)]">🏠</span>
        {SIDE.map((g) => (
          <button key={g.label} type="button" className="flex w-14 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold text-white/70 transition-colors hover:bg-white/5 hover:text-white">
            <span className="text-xl" aria-hidden>{g.emoji}</span>
            {g.label}
          </button>
        ))}
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Horní lišta */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b5bff] to-[#1ec5ff] text-sm font-extrabold">U</span>
            <span className="text-sm font-extrabold tracking-tight">Učíme se hrou</span>
          </div>
          <nav className="flex gap-1 rounded-full bg-white/5 p-1 text-sm" role="tablist" aria-label="Sekce lobby">
            {([["hry", "Hry", Gamepad2], ["zebricky", "Žebříčky", Crown], ["turnaje", "Turnaje", Trophy]] as const).map(([k, label, Icon]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={clsx("flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold", tab === k ? "bg-[#3b5bff] text-white" : "text-white/60")}
              >
                <Icon aria-hidden className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 font-bold"><Star aria-hidden className="h-3.5 w-3.5 text-[#ffd24d]" /> <NumberFlow value={1240} /></span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#ffb199] to-[#7aa2ff] text-xs font-bold text-black">AN</span>
          </div>
        </header>

        {/* Pás s výsledky */}
        <div className="flex gap-2 overflow-x-auto border-b border-white/5 px-4 py-2 text-xs" aria-label="Poslední výsledky">
          {TICKER.map((t) => (
            <span key={t.who + t.what} className="flex shrink-0 items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5">
              <span className="font-bold text-[#8ea2ff]">{t.who}</span> {t.what} <span className="text-[#ffd24d]">{t.score}</span>
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-4 p-4">
          {/* Turnaj */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d2c8a] via-[#2a1f7a] to-[#0d1430] p-5"
          >
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#1ec5ff]/30 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#8ea2ff]">Turnaj týdne</p>
                <h3 className="mt-1 text-3xl font-extrabold tracking-tight">Zimní kvízový turnaj</h3>
                <p className="mt-2 text-sm text-white/70">Pravidla účasti najdeš v nápovědě. Vyhrává nejvíc správných odpovědí.</p>
              </div>
              <div className="flex flex-col items-start gap-3">
                <p className="font-mono text-sm text-white/80">{d === 1 ? "1 den" : `${d} dny`} | {time}</p>
                <button type="button" className="btn-bouncy flex items-center gap-2 rounded-xl border-2 border-[#0a0f24] bg-[#3b5bff] px-5 py-2.5 text-sm font-bold shadow-[0_4px_0_#0a0f24]">
                  <Trophy aria-hidden className="h-4 w-4" /> Přejít na turnaj
                </button>
              </div>
            </div>
          </motion.section>

          {/* Promo karty */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#121a38] p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ffd24d]/15"><Zap aria-hidden className="h-5 w-5 text-[#ffd24d]" /></span>
              <div>
                <p className="font-bold">Denní výzvy</p>
                <p className="text-xs text-white/60">Každý den nová výzva. Splň ji a získej body navíc.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#121a38] p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7ee2a8]/15"><Gift aria-hidden className="h-5 w-5 text-[#7ee2a8]" /></span>
              <div>
                <p className="font-bold">Bonus za učení</p>
                <p className="text-xs text-white/60">Týdenní bonusy za pravidelné procvičování.</p>
              </div>
            </div>
          </div>

          {/* Karty her */}
          <div className="grid gap-3 md:grid-cols-3">
            {GAMES.map((g, i) => (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                whileHover={{ y: -4 }}
                className={clsx("relative flex min-h-44 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-4", g.grad)}
              >
                <span className="flex w-fit items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-xs font-semibold"><Users aria-hidden className="h-3 w-3" /> {g.players}</span>
                <span aria-hidden className="absolute right-3 top-6 text-6xl opacity-90 drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)]">{g.emoji}</span>
                <div className="relative">
                  <p className="text-lg font-bold">{g.name}</p>
                  <p className="text-xs text-white/70">{g.tag}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat */}
      <aside className="flex flex-col border-t border-white/5 bg-[#0d1430] lg:border-l lg:border-t-0">
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-bold"><Puzzle aria-hidden className="h-4 w-4 text-[#8ea2ff]" /> Chat třídy</p>
          <span className="text-xs text-white/60"><Smile aria-hidden className="mr-1 inline h-3.5 w-3.5" />784 online</span>
        </div>
        <ul className="flex max-h-96 flex-col gap-3 overflow-y-auto p-4 lg:max-h-none lg:flex-1" aria-live="polite">
          {messages.map((m, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black" style={{ background: m.color }}>{m.user.slice(0, 2).toUpperCase()}</span>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs"><span className="font-bold" style={{ color: m.color }}>{m.user}</span><span className="text-white/40">{m.time}</span></p>
                <p className="text-sm text-white/85">{m.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <form
          className="flex items-center gap-2 border-t border-white/5 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label className="sr-only" htmlFor="lobby-msg">Zpráva</label>
          <input id="lobby-msg" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Napiš zprávu…" className="min-w-0 flex-1 rounded-xl bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-[#3b5bff]" />
          <button type="submit" aria-label="Odeslat" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3b5bff]"><Send aria-hidden className="h-4 w-4" /></button>
        </form>
      </aside>
    </div>
  );
}
