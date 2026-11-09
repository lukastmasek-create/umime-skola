"use client";

import { useState } from "react";
import NumberFlow from "@number-flow/react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { Home, BarChart3, ArrowLeftRight, Wallet, Layers, Bell, SlidersHorizontal, ArrowUpRight, ArrowUp, ArrowDown, ListFilter, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

const NAV = [
  { label: "Přehled", icon: Home },
  { label: "Analýzy", icon: BarChart3 },
  { label: "Převody", icon: ArrowLeftRight },
  { label: "Platby", icon: Wallet },
  { label: "Plán", icon: Layers },
  { label: "Karty", icon: Layers },
];

const BUDGET = [
  { m: "Čvn", fix: 2400, osobni: 1800, invest: 900, uspory: 600 },
  { m: "Čvc", fix: 2400, osobni: 2200, invest: 500, uspory: 400 },
  { m: "Srp", fix: 2400, osobni: 900, invest: 300, uspory: 500 },
  { m: "Zář", fix: 2400, osobni: 2000, invest: 700, uspory: 800 },
  { m: "Říj", fix: 2400, osobni: 1100, invest: 400, uspory: 300 },
  { m: "Lis", fix: 2400, osobni: 1500, invest: 600, uspory: 500 },
];

const SERIES = [
  { key: "fix", name: "Fixní náklady", color: "#e8f1ff" },
  { key: "osobni", name: "Osobní výdaje", color: "#9aa3b5" },
  { key: "invest", name: "Investice", color: "#5d6577" },
  { key: "uspory", name: "Úspory", color: "#3a404d" },
];

const TX = [
  { name: "Předplatné cloudu", date: "8. 11. · 19:15", amount: -26.99, kind: "spending" },
  { name: "Nákup v obchodě", date: "6. 11. · 18:23", amount: -438.54, kind: "spending" },
  { name: "Kavárna", date: "6. 11. · 10:03", amount: -20.9, kind: "spending" },
  { name: "Převod od zákazníka", date: "3. 11. · 11:55", amount: -49.89, kind: "spending" },
  { name: "Mzda", date: "1. 11. · 16:47", amount: 3563, kind: "income" },
];

const CARD = "rounded-[24px] border border-white/5 bg-[#16181f] text-white";

function Arrow() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:-rotate-12">
      <ArrowUpRight aria-hidden className="h-4 w-4" />
    </span>
  );
}

function Spark() {
  const bars = [4, 6, 5, 8, 7, 10, 9, 12, 14, 13, 18, 22, 20, 26, 30];
  return (
    <div className="flex h-12 items-end gap-[3px]" aria-hidden>
      {bars.map((h, i) => (
        <span key={i} className="w-[3px] rounded-full bg-[#1a1d26]" style={{ height: h }} />
      ))}
    </div>
  );
}

export function BankTab() {
  const [filter, setFilter] = useState<"all" | "income" | "spending">("all");
  const rows = TX.filter((t) => filter === "all" || t.kind === filter);

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#0b0c10] p-3 text-white sm:p-5">
      {/* Horní navigace */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1 rounded-full bg-[#16181f] p-1" aria-label="Hlavní navigace">
          {NAV.map(({ label, icon: Icon }, i) => (
            <span
              key={label}
              className={clsx(
                "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium",
                i === 0 ? "bg-white text-black" : "text-white/70",
              )}
            >
              <Icon aria-hidden className="h-4 w-4" /> {label}
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16181f]"><Bell aria-hidden className="h-4 w-4" /></span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16181f]"><SlidersHorizontal aria-hidden className="h-4 w-4" /></span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ffb199] to-[#7aa2ff] text-xs font-bold text-black">AN</span>
        </div>
      </header>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.15fr_1fr_1fr]">
        {/* Levý sloupec: malé karty a rozpočet */}
        <div className="flex flex-col gap-3 lg:col-span-1">
          <div className="grid grid-cols-2 gap-3">
            <div className={clsx(CARD, "p-4")}>
              <p className="text-xs text-white/60">Příjmy</p>
              <p className="mt-2 text-xl font-semibold"><NumberFlow value={4820} />,00 Kč</p>
              <span className="mt-2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/10 px-2 py-0.5 text-xs"><ArrowUp aria-hidden className="h-3 w-3" /> 10 %</span>
            </div>
            <div className={clsx(CARD, "p-4")}>
              <p className="text-xs text-white/60">Výdaje</p>
              <p className="mt-2 text-xl font-semibold"><NumberFlow value={2310} />,00 Kč</p>
              <span className="mt-2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/10 px-2 py-0.5 text-xs"><ArrowDown aria-hidden className="h-3 w-3" /> 2 %</span>
            </div>
          </div>
          <div className={clsx(CARD, "flex flex-col gap-4 p-4")}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">Rozpočet</p>
              <Arrow />
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BUDGET} barCategoryGap="22%">
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "#8a90a2", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8a90a2", fontSize: 11 }} tickFormatter={(v) => `${v / 1000}K`} width={36} />
                  <ChartTooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "#0b0c10", border: "1px solid #262a36", borderRadius: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "#8a90a2" }} />
                  {SERIES.map((s, i) => (
                    <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={s.color} radius={i === SERIES.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Prostřední sloupec: zůstatek, cíle */}
        <div className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#7fb4ff] via-[#e4f0ff] to-[#7fb4ff] p-5 text-[#0b0c10]">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Celkový zůstatek</p>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white"><ArrowUpRight aria-hidden className="h-4 w-4" /></span>
            </div>
            <p className="mt-8 text-4xl font-semibold tracking-tight tabular-nums">
              <NumberFlow value={25230} /><span className="text-2xl text-black/50">,00 Kč</span>
            </p>
            <div className="mt-5 flex items-end justify-between gap-3">
              <div className="flex gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold whitespace-nowrap"><ArrowUp aria-hidden className="mr-1 inline h-3 w-3" /> 10 %</span>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold whitespace-nowrap">+ 2 780,00 Kč</span>
              </div>
              <div className="text-[#0b0c10]"><Spark /></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={clsx(CARD, "relative flex flex-col gap-6 overflow-hidden p-4")}>
              <div className="absolute inset-y-0 left-0 w-1/2 bg-white/5" aria-hidden />
              <div className="relative flex items-center justify-between">
                <p className="font-semibold">Můj cíl</p>
                <Arrow />
              </div>
              <p className="relative text-2xl font-semibold"><NumberFlow value={1700} /> <span className="text-sm text-white/50">/ 3 400 Kč</span></p>
            </div>
            <div className={clsx(CARD, "flex flex-col gap-6 p-4")}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">Úspory</p>
                <Arrow />
              </div>
              <p className="whitespace-nowrap text-xl font-semibold"><NumberFlow value={1364} />,00 Kč</p>
            </div>
          </div>
          <div className={clsx(CARD, "flex flex-col gap-4 p-4")}>
            <p className="font-semibold">Převést peníze</p>
            <div className="flex items-center gap-2">
              {["LN", "PK", "JV"].map((i) => (
                <span key={i} className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#5d6577] to-[#20242e] text-xs font-bold">{i}</span>
              ))}
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><RefreshCw aria-hidden className="h-4 w-4" /></span>
            </div>
          </div>
        </div>

        {/* Pravý sloupec: historie a karta */}
        <div className="flex flex-col gap-3">
          <div className={clsx(CARD, "flex flex-col gap-4 p-4")}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">Historie transakcí</p>
              <Arrow />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div role="tablist" aria-label="Filtr transakcí" className="flex gap-1 rounded-full bg-[#0b0c10] p-1 text-sm">
                {([["all", "Vše"], ["income", "Příjmy"], ["spending", "Výdaje"]] as const).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    role="tab"
                    aria-selected={filter === k}
                    onClick={() => setFilter(k)}
                    className={clsx("rounded-full px-3 py-1.5 font-medium", filter === k ? "bg-white text-black" : "text-white/60")}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="flex items-center gap-1 text-sm text-white/70"><ListFilter aria-hidden className="h-4 w-4" /> Filtr</span>
            </div>
            <ul className="flex flex-col">
              {rows.map((t) => (
                <li key={t.name} className="flex items-center justify-between gap-3 border-b border-white/5 py-3 last:border-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b0c10] text-xs font-bold text-white/70">{t.name.slice(0, 2).toUpperCase()}</span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.name}</p>
                      <p className="text-xs text-white/50">{t.date}</p>
                    </div>
                  </div>
                  <p className={clsx("shrink-0 font-semibold tabular-nums", t.amount > 0 ? "text-[#7ee2a8]" : "text-white")}>
                    {t.amount > 0 ? "+" : "−"}
                    {Math.abs(t.amount).toLocaleString("cs-CZ", { minimumFractionDigits: 2 })} Kč
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative flex min-h-44 flex-col justify-between overflow-hidden rounded-[24px] bg-gradient-to-br from-[#2b3350] via-[#1a1e2c] to-[#0b0c10] p-5">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold italic tracking-wide">VISA</span>
              <Arrow />
            </div>
            <p className="text-3xl font-semibold tabular-nums">
              <NumberFlow value={1476} /><span className="text-xl text-white/50">,00 Kč</span>
            </p>
            <div className="flex gap-2 text-xs">
              <span className="rounded-full bg-white/10 px-3 py-1">*7954</span>
              <span className="rounded-full bg-white/10 px-3 py-1">05/27</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
