"use client";

import { Icon } from "@/components/Icon";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Gamepad2, Flame, Users, Play, Trophy, RotateCcw, ShoppingBag } from "lucide-react";
import { DitherBg } from "@/components/DitherBg";
import { PixelIcon } from "@/components/HomePixelArt";
import type { HomeLobbyText } from "@/i18n/home-lobby";

type TabKey = "play" | "challenge" | "together";
type Card = { key: string; href: string; icon: string; grad: string };

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

export function HomeLobby({ locale, t }: { locale: string; t: HomeLobbyText }) {
  const [tab, setTab] = useState<TabKey>("play");
  const left = useUntilMidnight();
  const reduceMotion = useReducedMotion();
  const l = `/${locale}`;

  const cards: Record<TabKey, Card[]> = {
    play: [
      { key: "farm", href: `${l}/stale-hry/farma`, icon: "farm", grad: "from-[#2fae6d] to-[#0c3b2c]" },
      { key: "city", href: `${l}/stale-hry/mesto`, icon: "city", grad: "from-[#3b5bff] to-[#0e1a5c]" },
      { key: "economy", href: `${l}/stale-hry/ekonomika`, icon: "economy", grad: "from-[#e0584a] to-[#5a1f2b]" },
      { key: "pets", href: `${l}/stale-hry/mazlicci`, icon: "pets", grad: "from-[#7b3dff] to-[#1a0d4d]" },
    ],
    challenge: [
      { key: "escape", href: `${l}/unikovky`, icon: "escape", grad: "from-[#1ec5ff] to-[#0a2b4d]" },
      { key: "review", href: `${l}/opakovani`, icon: "review", grad: "from-[#f2a35e] to-[#7a2a2a]" },
      { key: "boards", href: `${l}/zebricky`, icon: "boards", grad: "from-[#ffc933] to-[#7a4a0a]" },
    ],
    together: [
      { key: "together", href: `${l}/hrat-spolecne`, icon: "together", grad: "from-[#e0584a] to-[#5a1f2b]" },
      { key: "boards", href: `${l}/zebricky`, icon: "boards", grad: "from-[#ffc933] to-[#7a4a0a]" },
      { key: "shop", href: `${l}/obchod`, icon: "shop-bag", grad: "from-[#7b3dff] to-[#1a0d4d]" },
      { key: "escape", href: `${l}/unikovky`, icon: "escape", grad: "from-[#1ec5ff] to-[#0a2b4d]" },
    ],
  };

  const tabs: [TabKey, string, typeof Gamepad2][] = [
    ["play", t.tabs.play, Gamepad2],
    ["challenge", t.tabs.challenge, Flame],
    ["together", t.tabs.together, Users],
  ];
  const quick: Record<string, { href: string; Icon: typeof Gamepad2 }> = {
    boards: { href: `${l}/zebricky`, Icon: Trophy },
    review: { href: `${l}/opakovani`, Icon: RotateCcw },
    shop: { href: `${l}/obchod`, Icon: ShoppingBag },
  };

  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6" aria-labelledby="lobby-title">
      <div className="lobby-shell">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="hp-head">
            <PixelIcon kind="pad" />
            <h2 id="lobby-title" className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
              {t.title}
            </h2>
          </div>
          <div role="tablist" aria-label={t.title} className="lobby-tabs">
            {tabs.map(([k, label, Icon]) => (
              <button key={k} type="button" role="tab" id={`lobby-tab-${k}`} aria-controls="lobby-panel" aria-selected={tab === k} tabIndex={tab === k ? 0 : -1} onKeyDown={(event) => {
                const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
                if (!keys.includes(event.key)) return;
                event.preventDefault();
                const index = tabs.findIndex(([key]) => key === k);
                const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
                setTab(tabs[next][0]);
                document.getElementById(`lobby-tab-${tabs[next][0]}`)?.focus();
              }} onClick={() => setTab(k)} className="lobby-tab">
                {tab === k && <motion.span layoutId="lobby-pill" className="lobby-pill" transition={{ duration: reduceMotion ? 0 : 0.15 }} />}
                <span className="relative flex items-center gap-1.5">
                  <Icon aria-hidden className="h-4 w-4" /> {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_1.6fr]">
          <motion.div
            initial={false}
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
              id="lobby-panel" role="tabpanel" aria-labelledby={`lobby-tab-${tab}`}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.15 }}
              className="grid grid-cols-2 gap-3"
            >
              {cards[tab].map((c, i) => (
                <motion.li key={c.key + i} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.15 }}>
                  <Link href={c.href} className={`lobby-card bg-gradient-to-br ${c.grad}`}>
                    <Icon name={c.icon} size={84} className="lobby-emoji" />
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

        <div className="mt-4 flex flex-wrap gap-2">
          {t.quick.filter(({ key }) => key !== "daily").map(({ key, label }) => {
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
