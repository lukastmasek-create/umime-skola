"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Gamepad2, Flame, Users, Play, Trophy, RotateCcw, ShoppingBag, CalendarCheck } from "lucide-react";
import { DitherBg } from "@/components/DitherBg";
import type { HomeLobbyText } from "@/i18n/home-lobby";

type TabKey = "play" | "challenge" | "together";
type Card = { key: string; href: string; emoji: string; grad: string };

// Zbývá do půlnoci (denní výzva se mění o půlnoci); před načtením prázdné, ať nedojde k nesouladu při hydrataci.
function useUntilMidnight() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      const s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      const p = (n: number) => String(n).padStart(2, "0");
      setT(`${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// Ostrůvek, který mění tvar: klid, časovač do konce dne, podíl dne.
function Island({ left, endsIn, promo }: { left: string; endsIn: string; promo: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % 3), 3500);
    return () => clearInterval(id);
  }, []);
  const pct = (() => {
    if (!left) return 0;
    const [h, m, sec] = left.split(":").map(Number);
    return Math.round(100 - ((h * 3600 + m * 60 + sec) / 86400) * 100);
  })();
  return (
    <div className="lobby-island" data-s={i} aria-live="off">
      {i === 0 && <span>⚡ Umíme</span>}
      {i === 1 && <span><i className="lobby-live" /> {endsIn} <b>{left || "--:--:--"}</b></span>}
      {i === 2 && (<>
        <span><i className="lobby-live" /> <b>{promo}</b></span>
        <span className="lobby-bar"><i style={{ width: `${pct}%` }} /></span>
      </>)}
    </div>
  );
}

export function HomeLobby({ locale, t }: { locale: string; t: HomeLobbyText }) {
  const [tab, setTab] = useState<TabKey>("play");
  const left = useUntilMidnight();
  const dock = useRef<HTMLDivElement>(null);
  const dockMove = (e: React.PointerEvent) => {
    const kids = dock.current?.children;
    if (!kids || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (const el of Array.from(kids) as HTMLElement[]) {
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      el.style.transform = `translateY(${-Math.max(0, 1 - d / 120) * 8}px) scale(${1 + Math.max(0, 1 - d / 120) * 0.14})`;
    }
  };
  const dockReset = () => {
    const kids = dock.current?.children;
    if (kids) for (const el of Array.from(kids) as HTMLElement[]) el.style.transform = "";
  };
  const l = `/${locale}`;

  const cards: Record<TabKey, Card[]> = {
    play: [
      { key: "farm", href: `${l}/stale-hry/farma`, emoji: "🌱", grad: "from-[#2fae6d] to-[#0c3b2c]" },
      { key: "city", href: `${l}/stale-hry/mesto`, emoji: "🏙️", grad: "from-[#3b5bff] to-[#0e1a5c]" },
      { key: "economy", href: `${l}/stale-hry/ekonomika`, emoji: "💰", grad: "from-[#e0584a] to-[#5a1f2b]" },
      { key: "pets", href: `${l}/stale-hry/mazlicci`, emoji: "🐾", grad: "from-[#7b3dff] to-[#1a0d4d]" },
    ],
    challenge: [
      { key: "daily", href: `${l}/denni-kviz`, emoji: "🧠", grad: "from-[#3b5bff] to-[#0e1a5c]" },
      { key: "escape", href: `${l}/unikovky`, emoji: "🗝️", grad: "from-[#1ec5ff] to-[#0a2b4d]" },
      { key: "review", href: `${l}/opakovani`, emoji: "🔁", grad: "from-[#f2a35e] to-[#7a2a2a]" },
      { key: "boards", href: `${l}/zebricky`, emoji: "🏆", grad: "from-[#ffc933] to-[#7a4a0a]" },
    ],
    together: [
      { key: "together", href: `${l}/hrat-spolecne`, emoji: "👥", grad: "from-[#e0584a] to-[#5a1f2b]" },
      { key: "boards", href: `${l}/zebricky`, emoji: "🏆", grad: "from-[#ffc933] to-[#7a4a0a]" },
      { key: "shop", href: `${l}/obchod`, emoji: "🛍️", grad: "from-[#7b3dff] to-[#1a0d4d]" },
      { key: "escape", href: `${l}/unikovky`, emoji: "🗝️", grad: "from-[#1ec5ff] to-[#0a2b4d]" },
    ],
  };

  const tabs: [TabKey, string, typeof Gamepad2][] = [
    ["play", t.tabs.play, Gamepad2],
    ["challenge", t.tabs.challenge, Flame],
    ["together", t.tabs.together, Users],
  ];
  const quick: Record<string, { href: string; Icon: typeof Gamepad2 }> = {
    daily: { href: `${l}/denni-kviz`, Icon: CalendarCheck },
    boards: { href: `${l}/zebricky`, Icon: Trophy },
    review: { href: `${l}/opakovani`, Icon: RotateCcw },
    shop: { href: `${l}/obchod`, Icon: ShoppingBag },
  };

  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6" aria-labelledby="lobby-title">
      <div className="lobby-shell">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="lobby-title" className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
            {t.title}
          </h2>
          <div className="hidden md:block"><Island left={left} endsIn={t.endsIn} promo={t.promoTitle} /></div>
          <div role="tablist" aria-label={t.title} className="lobby-tabs">
            {tabs.map(([k, label, Icon]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="lobby-tab">
                {tab === k && <motion.span layoutId="lobby-pill" className="lobby-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative flex items-center gap-1.5">
                  <Icon aria-hidden className="h-4 w-4" /> {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_1.6fr]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lobby-promo"
          >
            <DitherBg dot="rgba(255,235,220,0.28)" />
            <span className="lobby-promo-glow" aria-hidden />
            <p className="relative text-xs font-bold uppercase tracking-widest text-[#ffd9cc]">{t.promoTag}</p>
            <h3 className="relative mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
              {t.promoTitle}
            </h3>
            <p className="relative mt-2 max-w-sm text-sm text-white/80">{t.promoText}</p>
            <p className="relative mt-4 font-mono text-sm text-white/85" aria-live="off">
              {t.endsIn} <span className="lobby-clock">{left || "--:--:--"}</span>
            </p>
            <Link href={`${l}/denni-kviz`} className="btn-bouncy btn-dot lobby-cta relative mt-5">
              <Play aria-hidden className="h-4 w-4" /> {t.promoCta}
            </Link>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.ul
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="grid grid-cols-2 gap-3"
            >
              {cards[tab].map((c, i) => (
                <motion.li key={c.key + i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link href={c.href} className={`lobby-card bg-gradient-to-br ${c.grad}`}>
                    <span aria-hidden className="lobby-emoji">{c.emoji}</span>
                    <span className="lobby-play" aria-hidden><Play className="h-4 w-4" /></span>
                    <span className="relative mt-auto block">
                      <span className="block text-lg font-bold leading-tight">{t.games[c.key].name}</span>
                      <span className="block text-xs text-white/75">{t.games[c.key].tag}</span>
                    </span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>

        <div ref={dock} onPointerMove={dockMove} onPointerLeave={dockReset} className="mt-4 flex flex-wrap gap-2">
          {t.quick.map(({ key, label }) => {
            const { href, Icon } = quick[key];
            return (
              <Link key={key} href={href} className="lobby-chip">
                <Icon aria-hidden className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
