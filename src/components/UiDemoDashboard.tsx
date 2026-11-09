"use client";

import { motion } from "motion/react";
import NumberFlow from "@number-flow/react";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, Tooltip as ChartTooltip } from "recharts";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Tilt from "react-parallax-tilt";
import { Folder, Clock, BarChart3, Layers, Activity, Target, Moon } from "lucide-react";
import { clsx } from "clsx";

// Tmavá scéna s plovoucími kartami: inspirace hlavní stránkou z Dribbble (vlastní data a texty).
const WEEK = [
  { den: "Po", h: 28 },
  { den: "Út", h: 44 },
  { den: "St", h: 36 },
  { den: "Čt", h: 58 },
  { den: "Pá", h: 82 },
  { den: "So", h: 20 },
  { den: "Ne", h: 12 },
];

const STATS = [
  { label: "Projekty", sub: "Dokončeno", value: 182, icon: Folder, tint: "bg-[#ffe9d6]" },
  { label: "Celkem hodin", sub: "Tento rok", value: 912, icon: Clock, tint: "bg-[#e4e2ff]" },
  { label: "Průměrné skóre", sub: "Ze všech kvízů", value: 81, icon: BarChart3, tint: "bg-[#f6dcff]", suffix: " %" },
  { label: "Celkem lekcí", sub: "Od začátku", value: 1345, icon: Layers, tint: "bg-[#d9f7e3]" },
];

const TODAY = [
  { t: "2:30", title: "Procvičování", range: "2:30–3:00", tone: "bg-[#e9f1ff]" },
  { t: "3:00", title: "Test z matematiky", range: "3:00–4:00", tone: "bg-[#fff6c2]" },
  { t: "4:00", title: "Pauza a čtení", range: "4:00–5:00", tone: "bg-[#eafbef]" },
];

function FloatingCard({ className, delay, children }: { className: string; delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
      className={clsx("absolute rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)]", className)}
    >
      {children}
    </motion.div>
  );
}

function Ring({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-white">
      <div className="h-14 w-14">
        <CircularProgressbar value={value} text={`${value} %`} styles={buildStyles({ pathColor: color, textColor: "#fff", trailColor: "rgba(255,255,255,0.12)", textSize: "26px" })} />
      </div>
      <span className="text-[11px] uppercase tracking-wide text-white/60">{label}</span>
    </div>
  );
}

export function DashboardTab() {
  return (
    <div className="relative isolate overflow-hidden rounded-[28px] bg-black p-4 text-white sm:p-6">
      {/* Barevné záře na pozadí */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(60%_80%_at_20%_100%,rgba(70,90,255,0.55),transparent_70%),radial-gradient(60%_80%_at_80%_100%,rgba(255,70,170,0.55),transparent_70%)]" />

      <header className="relative flex flex-wrap items-center justify-between gap-3">
        <span className="text-lg font-bold tracking-tight">Tracker</span>
        <nav className="flex flex-wrap gap-4 text-xs text-white/70" aria-label="Hlavní navigace">
          {["Přehled", "Projekty", "Klienti", "Úkoly", "Faktury"].map((n, i) => (
            <span key={n} className={clsx(i === 0 && "text-white font-bold")}>{n}</span>
          ))}
        </nav>
      </header>

      {/* Hero s jménem a plovoucími widgety */}
      <div className="relative mt-6 grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-white/60">Dobrý den,</p>
          <h3 className="text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">Adéla<br />Nováková</h3>
          <div className="flex gap-6 pt-2">
            <Ring value={12} label="Aktivita" color="#ffe14d" />
            <Ring value={34} label="Přesnost" color="#4de1ff" />
            <Ring value={56} label="Spánek" color="#ff6fc1" />
          </div>
        </div>
        <div className="relative h-44">
          <FloatingCard className="left-0 top-0 w-40 bg-white text-black" delay={0}>
            <p className="text-xs text-black/60">Tento týden</p>
            <p className="text-2xl font-extrabold"><NumberFlow value={293} />h</p>
          </FloatingCard>
          <FloatingCard className="right-0 top-6 w-36 bg-[#ffe14d] text-black" delay={0.6}>
            <p className="text-xs font-bold">Skupina</p>
            <p className="text-sm">Aleš a Kateřina</p>
          </FloatingCard>
          <FloatingCard className="bottom-0 left-10 w-44 bg-gradient-to-br from-[#ff3d8b] to-[#7a3cff] text-white" delay={1.2}>
            <p className="text-xs opacity-80">Příprava</p>
            <p className="text-lg font-bold">Nový kvíz</p>
          </FloatingCard>
        </div>
      </div>

      {/* Bílé statistické karty */}
      <div className="relative mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="flex flex-col gap-3 rounded-2xl bg-white p-4 text-black"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold">{s.label}</p>
                <p className="text-xs text-black/50">{s.sub}</p>
              </div>
              <span className={clsx("flex h-9 w-9 items-center justify-center rounded-xl", s.tint)}>
                <s.icon aria-hidden className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl font-extrabold tabular-nums">
              <NumberFlow value={s.value} />
              {s.suffix}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Spodní řada: graf, časová osa */}
      <div className="relative mt-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
        <Tilt glareEnable glareMaxOpacity={0.12} scale={1.01} className="rounded-2xl md:col-span-1">
          <div className="flex h-full flex-col gap-2 rounded-2xl bg-white p-4 text-black">
            <p className="text-sm font-bold">Hodiny za týden</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEK} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="den" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#777" }} />
                  <ChartTooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="h" radius={[8, 8, 8, 8]} isAnimationActive>
                    {WEEK.map((w) => (
                      <Cell key={w.den} fill={w.den === "Pá" ? "#ffe14d" : "#1c1c22"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Tilt>

        <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 text-black">
          <p className="text-sm font-bold">Dnes</p>
          {TODAY.map((row) => (
            <div key={row.title} className={clsx("flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold", row.tone)}>
              <span>{row.title}</span>
              <span className="text-xs font-normal text-black/60">{row.range}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-between gap-3 rounded-2xl bg-[#ffe14d] p-4 text-black">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Přesnost</p>
            <Target aria-hidden className="h-4 w-4" />
          </div>
          <p className="text-4xl font-extrabold tabular-nums"><NumberFlow value={34} />%</p>
          <p className="flex items-center gap-2 text-xs"><Activity aria-hidden className="h-3.5 w-3.5" /> Oproti minulému týdnu lepší</p>
          <p className="flex items-center gap-2 text-xs"><Moon aria-hidden className="h-3.5 w-3.5" /> Doporučený spánek: 8 h</p>
        </div>
      </div>
    </div>
  );
}

// Ceník se třemi tarify, prostřední zvýrazněný (inspirace screenshotem ceníku z návrhu).
const TIERS = [
  {
    name: "Jednotlivci",
    price: "0 Kč",
    per: "měsíčně",
    blurb: "Pro jednotlivce, kteří teprve začínají a chtějí jen to nejdůležitější.",
    cta: "Začít zdarma",
    features: ["1 uživatel", "Neomezené kvízy", "Denní výzvy", "Platby přes Stripe"],
    highlight: false,
  },
  {
    name: "Týmy",
    price: "120 Kč",
    per: "měsíčně / uživatel",
    blurb: "Doporučeno pro menší týmy, které chtějí zlepšit čas i výsledky.",
    cta: "Začít zkušební verzi",
    features: ["1 tým", "Plánování lekcí pro celý tým", "Společné sbírky úkolů", "Pokročilé formuláře"],
    highlight: true,
  },
  {
    name: "Škola",
    price: "15 000 Kč",
    per: "ročně",
    blurb: "Pro větší školy a organizace, které chtějí kontrolu, bezpečí a podporu.",
    cta: "Kontaktovat",
    features: ["Nadřazený tým a neomezené podtýmy", "Přehledy a analýzy", "Synchronizace s HRIS", "Podpora 24/7"],
    highlight: false,
  },
];

export function PricingTab() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h3 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Jednoduchý ceník<br />podle potřeb</h3>
        <p className="max-w-sm text-sm text-[var(--muted)]">Pokročilé funkce za rozumnou cenu. Pro jednotlivce zdarma, bez skrytých poplatků.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.name} className="relative pt-4">
            {t.highlight && (
              <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-full bg-[var(--edge)] px-3 py-1 text-xs font-semibold text-white">30 dní zdarma</span>
            )}
            <Tilt glareEnable={t.highlight} glareMaxOpacity={0.1} scale={1.01} className="h-full rounded-[var(--radius-card)]">
              <div
                className={clsx(
                  "flex h-full flex-col gap-4 rounded-[var(--radius-card)] border-2 border-[var(--edge)] p-5 shadow-[0_4px_0_var(--shadow-ink)]",
                  t.highlight ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)]",
                )}
              >
                <p className="text-sm font-semibold">{t.name}</p>
                <p className={clsx("text-xs", t.highlight ? "text-white/70" : "text-[var(--muted)]")}>Začíná na</p>
                <p className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tabular-nums">{t.price}</span>
                  <span className={clsx("text-xs", t.highlight ? "text-white/70" : "text-[var(--muted)]")}>{t.per}</span>
                </p>
                <p className={clsx("text-sm leading-relaxed", t.highlight ? "text-white/85" : "text-[var(--muted)]")}>{t.blurb}</p>
                <button
                  type="button"
                  className={clsx(
                    "btn-bouncy rounded-xl border-2 border-[var(--edge)] px-4 py-2.5 text-sm font-bold",
                    t.highlight ? "bg-white text-[var(--edge)]" : "bg-[var(--surface)] text-[var(--foreground)]",
                  )}
                >
                  {t.cta}
                </button>
                <div className="mt-2 border-t-2 border-[var(--border-soft)] pt-4">
                  <ul className="flex flex-col gap-2 text-sm">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span aria-hidden className="mt-0.5 text-[var(--accent-green)]">✓</span>
                        <span className={t.highlight ? "text-white" : ""}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Tilt>
          </div>
        ))}
      </div>
    </div>
  );
}
