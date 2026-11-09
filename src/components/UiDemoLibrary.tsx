"use client";

import { motion } from "motion/react";
import NumberFlow from "@number-flow/react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Home, Gamepad2, Gift, BookOpen, PieChart as PieIcon, ShoppingBag, MessageSquare, Search, ShoppingCart, Bell, Play, X, ChevronRight, Plus, Flame } from "lucide-react";
import { clsx } from "clsx";

// Knihovna her v tmavě bordó barvě. Názvy a obsah jsou naše (vzdělávací hry), vzhled je inspirovaný návrhem.
const RAIL = [Home, Gamepad2, Gift, BookOpen, PieIcon, ShoppingBag, MessageSquare];

const UPDATES = [
  { title: "Osmisměrka", sub: "Nová sada slov pro 6. třídu", emoji: "🔤" },
  { title: "Pexeso", sub: "Přidáno 40 nových karet", emoji: "🃏" },
  { title: "Blesk", sub: "Režim pro dvojice", emoji: "⚡" },
];

const CAROUSEL = [
  { title: "Bingo", tag: "Škrtej správné odpovědi", grad: "from-[#5a1f2b] to-[#2a0f16]", emoji: "🎯" },
  { title: "Kvíz", tag: "Testy z celého kurzu", grad: "from-[#e0584a] to-[#6a1d24]", emoji: "🧠" },
  { title: "Sibenice", tag: "Hádej slovo písmeno po písmenu", grad: "from-[#f2a35e] to-[#7a2a2a]", emoji: "🔠" },
];

const DOWNLOADS = [
  { title: "Matematika 6. třída", meta: "Procvičování · 12 lekcí", pct: 62, size: "265 MB z 1,2 GB" },
];

const FRIENDS = [
  { n: "Adéla", color: "#ff8a6b", online: true, status: "Hraje Bingo" },
  { n: "Bořek", color: "#ffd24d", online: true, status: "Online" },
  { n: "Cecílie", color: "#f7a6d0", online: false, status: "Offline" },
  { n: "Dan", color: "#8ea2ff", online: true, status: "Hraje Pexeso" },
  { n: "Eva", color: "#7ee2a8", online: false, status: "Offline" },
];

const STATS = [
  { label: "Matematika", value: 2340, color: "#e0584a", emoji: "➗" },
  { label: "Čeština", value: 5420, color: "#ffd24d", emoji: "📚" },
  { label: "Angličtina", value: 4580, color: "#8ea2ff", emoji: "🇬🇧" },
];
const DONUT = STATS.map((s) => ({ name: s.label, value: s.value }));

const CARD = "rounded-3xl bg-[#4a1a22]/60";

export function LibraryTab() {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#2a0f16] p-3 text-white sm:p-4">
      <div className="grid gap-3 lg:grid-cols-[64px_1fr_76px]">
        {/* Levá lišta */}
        <aside className="hidden flex-col items-center justify-between gap-4 rounded-3xl bg-[#3a1520] py-5 lg:flex" aria-label="Hlavní nabídka">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0584a] text-sm font-extrabold">N</span>
          <div className="flex flex-col gap-5">
            {RAIL.map((Icon, i) => (
              <Icon key={i} aria-hidden className={clsx("h-5 w-5", i === 0 ? "text-[#e0584a]" : "text-white/60")} />
            ))}
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-white/30 text-white/70"><Plus aria-hidden className="h-4 w-4" /></span>
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          {/* Horní řádek */}
          <header className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg text-white/70">Dobrý večer, <span className="font-bold text-white">NIKITIN</span></p>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 rounded-full bg-[#3a1520] px-4 py-2 text-sm text-white/50">
                <Search aria-hidden className="h-4 w-4" />
                <input placeholder="Hledat" className="w-32 bg-transparent text-white outline-none placeholder:text-white/40" />
              </label>
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#3a1520]"><ShoppingCart aria-hidden className="h-4 w-4" /></span>
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#3a1520]">
                <Bell aria-hidden className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e0584a]" />
              </span>
            </div>
          </header>

          <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
            <div className="flex flex-col gap-4">
              {/* Hrdinská karta */}
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f29a82] via-[#d8584b] to-[#7a1f2a] p-6 text-white"
              >
                <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#ffd0b8]/40 blur-2xl" />
                <div className="relative flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-[#fff1c2] px-3 py-1 text-xs font-bold text-[#5a1f1f]"><Flame aria-hidden className="h-3.5 w-3.5" /> Populární</span>
                </div>
                <h2 className="relative mt-6 text-4xl font-extrabold tracking-tight">Pexeso</h2>
                <p className="relative mt-3 max-w-sm text-sm text-white/85">
                  Najdi dvojice karet a procvičuj slovní zásobu i paměť. Hra je vhodná pro 2. až 5. třídu.
                </p>
                <div className="relative mt-6 flex flex-wrap items-center gap-3">
                  <button type="button" className="btn-bouncy flex items-center gap-2 rounded-full border-2 border-[#3a0f16] bg-white px-5 py-2 text-sm font-bold text-[#3a0f16] shadow-[0_4px_0_#3a0f16]">
                    <Play aria-hidden className="h-4 w-4" /> Hrát
                  </button>
                  <span className="rounded-full bg-black/20 px-3 py-1.5 text-xs font-semibold">+53 hodnocení</span>
                </div>
              </motion.section>

              {/* Karusel her */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Nové hry</h3>
                  <span className="text-sm text-white/50">Zobrazit vše</span>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {CAROUSEL.map((g, i) => (
                    <motion.div
                      key={g.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ y: -4, rotate: i === 1 ? 0 : -0.5 }}
                      className={clsx("relative flex min-h-44 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-4", g.grad)}
                    >
                      <span aria-hidden className="absolute right-3 top-4 text-5xl drop-shadow-[0_6px_10px_rgba(0,0,0,0.4)]">{g.emoji}</span>
                      <button type="button" aria-label={`Spustit ${g.title}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0584a]"><Play aria-hidden className="h-4 w-4" /></button>
                      <div>
                        <p className="text-lg font-bold">{g.title}</p>
                        <p className="text-xs text-white/75">{g.tag}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Stahování */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Poslední stahování</h3>
                  <span className="text-sm text-white/50">Zobrazit vše</span>
                </div>
                {DOWNLOADS.map((d) => (
                  <div key={d.title} className="flex flex-wrap items-center gap-4 rounded-3xl bg-gradient-to-r from-[#e0584a] to-[#3a1520] p-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl">📐</span>
                    <div className="min-w-[10rem] flex-1">
                      <p className="font-bold">{d.title}</p>
                      <span className="mt-1 inline-block rounded-full bg-black/25 px-2.5 py-0.5 text-xs">{d.meta}</span>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-bold tabular-nums">{d.pct} %</p>
                      <p className="text-xs text-white/70">{d.size}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" aria-label="Pokračovat" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#e0584a]"><Play aria-hidden className="h-4 w-4" /></button>
                      <button type="button" aria-label="Zrušit" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3a1520]"><X aria-hidden className="h-4 w-4" /></button>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/30" role="progressbar" aria-valuenow={d.pct} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full rounded-full bg-white" style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </section>
            </div>

            <div className="flex flex-col gap-4">
              {/* Aktualizace */}
              <div className="flex flex-col gap-2">
                {UPDATES.map((u) => (
                  <div key={u.title} className={clsx(CARD, "flex items-center gap-3 p-3")}>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2a0f16] text-xl" aria-hidden>{u.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{u.title}</p>
                      <p className="truncate text-xs text-white/60">{u.sub}</p>
                    </div>
                    <ChevronRight aria-hidden className="h-4 w-4 text-white/60" />
                  </div>
                ))}
              </div>

              {/* Statistika */}
              <section className={clsx(CARD, "flex flex-col gap-4 p-5")}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Tvoje statistika</h3>
                  <ChevronRight aria-hidden className="h-4 w-4" />
                </div>
                <div className="relative mx-auto h-56 w-full max-w-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={DONUT} dataKey="value" innerRadius="66%" outerRadius="92%" paddingAngle={4} stroke="none" isAnimationActive>
                        {STATS.map((s) => (
                          <Cell key={s.label} fill={s.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-xs text-white/60">Celkem hodin</p>
                    <p className="text-2xl font-extrabold tabular-nums"><NumberFlow value={12340} />h</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  {STATS.map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-1">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full text-lg" style={{ background: s.color }} aria-hidden>{s.emoji}</span>
                      <span className="font-bold tabular-nums">{s.value.toLocaleString("cs-CZ")} h</span>
                      <span className="text-[11px] text-white/60">{s.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Pravý pruh přátel */}
        <aside className="hidden flex-col items-center gap-4 rounded-3xl bg-[#3a1520] py-4 lg:flex" aria-label="Přátelé">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#ffb199] to-[#7aa2ff] text-xs font-bold text-black">AN</span>
          <div className="flex flex-col items-center gap-3">
            {FRIENDS.map((f) => (
              <span key={f.n} title={`${f.n}: ${f.status}`} className="relative">
                <span className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-black" style={{ background: f.color }}>{f.n.slice(0, 2).toUpperCase()}</span>
                <span className={clsx("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#3a1520]", f.online ? "bg-[#7ee2a8]" : "bg-white/30")} />
              </span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
