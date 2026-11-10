"use client";

import "./UiDemoBank.css";
import { useEffect, useRef, useState, type ComponentType } from "react";
import NumberFlow from "@number-flow/react";
import confetti from "canvas-confetti";
import Tilt from "react-parallax-tilt";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { Home, BarChart3, ArrowLeftRight, Wallet, Layers, Bell, SlidersHorizontal, ArrowUpRight, ArrowUp, ArrowDown, ListFilter, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

type Icon = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

/** Data pro banku. Bez nich se ukáže původní ukázka, se skutečnými daty (ze hry) se vykreslí stejný vzhled. */
export type BankData = {
  locale: string;
  currency: string;
  /** zobrazit haléře (ukázka ano, hra ne) */
  cents: boolean;
  avatar: string;
  nav: { label: string; icon: Icon; active?: boolean; onClick?: () => void }[];
  labels: { income: string; expenses: string; budget: string; balance: string; goal: string; extra: string; quick: string; history: string; filterAll: string; filterIncome: string; filterSpend: string; filterBtn: string; empty: string };
  income: { value: number; note: string };
  expenses: { value: number; note: string };
  chart: { data: Record<string, string | number>[]; series: { key: string; name: string; color: string }[]; xKey: string; cellColors?: string[]; stacked: boolean };
  balance: { value: number; pills: string[] };
  goal: { value: number; target: number; targetText: string };
  extra: { value: number };
  quick: { label: string; initials: string; onClick?: () => void }[] | null;
  tx: { id: string; name: string; date: string; amount: number; kind: "income" | "spending" }[];
  card: { brand: string; value: number; chips: string[] };
  /** zvýší se po akci, která přidala peníze: spustí oslavu */
  celebrate?: number;
};

const DEMO_NAV = [
  { label: "Přehled", icon: Home, active: true },
  { label: "Analýzy", icon: BarChart3 },
  { label: "Převody", icon: ArrowLeftRight },
  { label: "Platby", icon: Wallet },
  { label: "Plán", icon: Layers },
  { label: "Karty", icon: Layers },
];

const DEMO: BankData = {
  locale: "cs-CZ",
  currency: "Kč",
  cents: true,
  avatar: "AN",
  nav: DEMO_NAV,
  labels: { income: "Příjmy", expenses: "Výdaje", budget: "Rozpočet", balance: "Celkový zůstatek", goal: "Můj cíl", extra: "Úspory", quick: "Převést peníze", history: "Historie transakcí", filterAll: "Vše", filterIncome: "Příjmy", filterSpend: "Výdaje", filterBtn: "Filtr", empty: "" },
  income: { value: 4820, note: "10 %" },
  expenses: { value: 2310, note: "2 %" },
  chart: {
    xKey: "m",
    stacked: true,
    data: [
      { m: "Čvn", fix: 2400, osobni: 1800, invest: 900, uspory: 600 },
      { m: "Čvc", fix: 2400, osobni: 2200, invest: 500, uspory: 400 },
      { m: "Srp", fix: 2400, osobni: 900, invest: 300, uspory: 500 },
      { m: "Zář", fix: 2400, osobni: 2000, invest: 700, uspory: 800 },
      { m: "Říj", fix: 2400, osobni: 1100, invest: 400, uspory: 300 },
      { m: "Lis", fix: 2400, osobni: 1500, invest: 600, uspory: 500 },
    ],
    series: [
      { key: "fix", name: "Fixní náklady", color: "#e8f1ff" },
      { key: "osobni", name: "Osobní výdaje", color: "#9aa3b5" },
      { key: "invest", name: "Investice", color: "#5d6577" },
      { key: "uspory", name: "Úspory", color: "#3a404d" },
    ],
  },
  balance: { value: 25230, pills: ["↑ 10 %", "+ 2 780,00 Kč"] },
  goal: { value: 1700, target: 3400, targetText: "/ 3 400 Kč" },
  extra: { value: 1364 },
  quick: [
    { label: "LN", initials: "LN" },
    { label: "PK", initials: "PK" },
    { label: "JV", initials: "JV" },
  ],
  tx: [
    { id: "1", name: "Předplatné cloudu", date: "8. 11. · 19:15", amount: -26.99, kind: "spending" },
    { id: "2", name: "Nákup v obchodě", date: "6. 11. · 18:23", amount: -438.54, kind: "spending" },
    { id: "3", name: "Kavárna", date: "6. 11. · 10:03", amount: -20.9, kind: "spending" },
    { id: "4", name: "Převod od zákazníka", date: "3. 11. · 11:55", amount: -49.89, kind: "spending" },
    { id: "5", name: "Mzda", date: "1. 11. · 16:47", amount: 3563, kind: "income" },
  ],
  card: { brand: "VISA", value: 1476, chips: ["*7954", "05/27"] },
};

const CARD = "bk-glow rounded-[24px] border border-white/5 bg-[#16181f]/90 text-white";

function Arrow() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:-rotate-12">
      <ArrowUpRight aria-hidden className="h-4 w-4" />
    </span>
  );
}

const noMotion = () =>
  typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "off";

/** Sloupečky vpravo dole: u skutečných dat jde o poslední vzorky zůstatku, v ukázce o pevný průběh. */
function Spark({ samples }: { samples: number[] }) {
  const base = [4, 6, 5, 8, 7, 10, 9, 12, 14, 13, 18, 22, 20, 26, 30];
  let bars = base;
  if (samples.length >= 2) {
    const lo = Math.min(...samples);
    const hi = Math.max(...samples);
    bars = samples.map((v) => 6 + (hi === lo ? 12 : ((v - lo) / (hi - lo)) * 26));
  }
  return (
    <div className="bk-spark flex h-12 items-end gap-[3px]" aria-hidden>
      {bars.map((h, i) => (
        <span key={i} className="w-[3px] rounded-full bg-[#1a1d26]" style={{ height: h }} />
      ))}
    </div>
  );
}

export function BankTab({ data }: { data?: BankData }) {
  const d = data ?? DEMO;
  const [filter, setFilter] = useState<"all" | "income" | "spending">("all");
  const rows = d.tx.filter((t) => filter === "all" || t.kind === filter);
  const root = useRef<HTMLDivElement>(null);
  const balanceCard = useRef<HTMLDivElement>(null);
  const balanceRef = useRef(d.balance.value);
  useEffect(() => {
    balanceRef.current = d.balance.value;
  });
  const [samples, setSamples] = useState<number[]>([]);
  const [popKey, setPopKey] = useState(0);
  const last = useRef(d.celebrate ?? 0);
  const compact = new Intl.NumberFormat(d.locale, { notation: "compact", maximumFractionDigits: 1 });
  const fmtAmount = (n: number) => `${n > 0 ? "+" : "−"}${Math.abs(n).toLocaleString(d.locale, d.cents ? { minimumFractionDigits: 2 } : { maximumFractionDigits: 0 })} ${d.currency}`;
  const flow = d.cents ? undefined : { maximumFractionDigits: 0 };
  const suffix = (n: string) => (d.cents ? `,00 ${d.currency}` : ` ${n}`);

  // Vzorky zůstatku pro sloupečky (jen u skutečných dat).
  useEffect(() => {
    if (!data) return;
    const push = () => setSamples((s) => [...s.slice(-14), balanceRef.current]);
    const first = window.setTimeout(push, 400);
    const id = window.setInterval(push, 4000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [data]);

  // Oslava: po akci, která přidala peníze, vyletí zlaté konfety z karty zůstatku a karta jednou poskočí.
  const celebrate = d.celebrate ?? 0;
  useEffect(() => {
    if (celebrate === last.current) return;
    last.current = celebrate;
    const t = window.setTimeout(() => {
      setPopKey((k) => k + 1);
      if (noMotion()) return;
      const r = balanceCard.current?.getBoundingClientRect();
      void confetti({
        particleCount: 46,
        spread: 75,
        startVelocity: 28,
        scalar: 0.9,
        colors: ["#ffd24d", "#ffb020", "#fff3b0", "#7fb4ff"],
        origin: r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.55) / window.innerHeight } : { x: 0.5, y: 0.5 },
        disableForReducedMotion: true,
      });
    }, 0);
    return () => window.clearTimeout(t);
  }, [celebrate]);

  // Světlo za kurzorem: jedna obsluha pro všechny karty, každá si dostane vlastní souřadnice.
  function glow(e: React.PointerEvent) {
    const el = (e.target as HTMLElement).closest<HTMLElement>(".bk-glow");
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  const goalPct = d.goal.target > 0 ? Math.min(100, Math.round((d.goal.value / d.goal.target) * 100)) : 0;
  const chart = d.chart;
  const step = (i: number) => ({ ["--i" as string]: i }) as React.CSSProperties;

  return (
    <div ref={root} onPointerMove={glow} className="relative overflow-hidden rounded-[28px] bg-[#0b0c10] p-3 text-white sm:p-5">
      <div className="bk-aurora" aria-hidden>
        <i />
        <i />
        <i />
      </div>

      <div className="relative">
        {/* Horní navigace */}
        <header className="bk-in flex flex-wrap items-center justify-between gap-3" style={step(0)}>
          <nav className="flex flex-wrap gap-1 rounded-full bg-[#16181f]/90 p-1" aria-label="Hlavní navigace">
            {d.nav.map(({ label, icon: Icon, active, onClick }) => {
              const cls = clsx("flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors", active ? "bg-white text-black" : "text-white/70", onClick && !active && "hover:bg-white/10 hover:text-white");
              return onClick ? (
                <button key={label} type="button" onClick={onClick} aria-current={active ? "page" : undefined} className={cls}>
                  <Icon aria-hidden className="h-4 w-4" /> {label}
                </button>
              ) : (
                <span key={label} className={cls}>
                  <Icon aria-hidden className="h-4 w-4" /> {label}
                </span>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            {!data && (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16181f]"><Bell aria-hidden className="h-4 w-4" /></span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16181f]"><SlidersHorizontal aria-hidden className="h-4 w-4" /></span>
              </>
            )}
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ffb199] to-[#7aa2ff] text-xs font-bold text-black">{d.avatar}</span>
          </div>
        </header>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.15fr_1fr_1fr]">
          {/* Levý sloupec: malé karty a rozpočet */}
          <div className="flex flex-col gap-3 lg:col-span-1">
            <div className="grid grid-cols-2 gap-3">
              <div className={clsx(CARD, "bk-in p-4")} style={step(1)}>
                <p className="text-xs text-white/60">{d.labels.income}</p>
                <p className="mt-2 text-xl font-semibold"><NumberFlow value={d.income.value} format={flow} />{suffix(d.currency)}</p>
                <span className="mt-2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/10 px-2 py-0.5 text-xs"><ArrowUp aria-hidden className="h-3 w-3" /> {d.income.note}</span>
              </div>
              <div className={clsx(CARD, "bk-in p-4")} style={step(2)}>
                <p className="text-xs text-white/60">{d.labels.expenses}</p>
                <p className="mt-2 text-xl font-semibold"><NumberFlow value={d.expenses.value} format={flow} />{suffix(d.currency)}</p>
                <span className="mt-2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/10 px-2 py-0.5 text-xs"><ArrowDown aria-hidden className="h-3 w-3" /> {d.expenses.note}</span>
              </div>
            </div>
            <div className={clsx(CARD, "bk-in flex flex-col gap-4 p-4")} style={step(3)}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{d.labels.budget}</p>
                <Arrow />
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart.data} barCategoryGap="22%">
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey={chart.xKey} tickLine={false} axisLine={false} tick={{ fill: "#8a90a2", fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8a90a2", fontSize: 11 }} tickFormatter={(v: number) => (chart.stacked ? `${v / 1000}K` : compact.format(v))} width={40} />
                    <ChartTooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "#0b0c10", border: "1px solid #262a36", borderRadius: 12 }} />
                    {chart.stacked && <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "#8a90a2" }} />}
                    {chart.series.map((s, i) => (
                      <Bar key={s.key} dataKey={s.key} name={s.name} stackId={chart.stacked ? "a" : undefined} fill={s.color} radius={chart.stacked ? (i === chart.series.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]) : [8, 8, 0, 0]}>
                        {chart.cellColors?.map((c, k) => <Cell key={k} fill={c} />)}
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Prostřední sloupec: zůstatek, cíle */}
          <div className="flex flex-col gap-3">
            <div key={popKey} ref={balanceCard} className={clsx("bk-in relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#7fb4ff] via-[#e4f0ff] to-[#7fb4ff] p-5 text-[#0b0c10]", popKey > 0 && "bk-pop")} style={step(2)}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{d.labels.balance}</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white"><ArrowUpRight aria-hidden className="h-4 w-4" /></span>
              </div>
              <p className="mt-8 text-4xl font-semibold tracking-tight tabular-nums">
                <NumberFlow value={d.balance.value} format={flow} /><span className="text-2xl text-black/50">{suffix(d.currency)}</span>
              </p>
              <div className="mt-5 flex items-end justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {d.balance.pills.map((p, i) => (
                    <span key={p} className={clsx("rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap", i === 0 ? "bg-white" : "bg-white/80")}>{p}</span>
                  ))}
                </div>
                <div className="text-[#0b0c10]"><Spark samples={samples} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className={clsx(CARD, "bk-in relative flex flex-col gap-6 overflow-hidden p-4")} style={step(3)}>
                <div className="absolute inset-y-0 left-0 bg-white/5 transition-[width] duration-700" style={{ width: data ? `${goalPct}%` : "50%" }} aria-hidden />
                <div className="relative flex items-center justify-between">
                  <p className="font-semibold">{d.labels.goal}</p>
                  <Arrow />
                </div>
                <p className="relative text-2xl font-semibold"><NumberFlow value={data ? goalPct : d.goal.value} format={data ? undefined : flow} suffix={data ? " %" : undefined} /> <span className="text-sm text-white/50">{data ? d.goal.targetText : d.goal.targetText}</span></p>
              </div>
              <div className={clsx(CARD, "bk-in flex flex-col gap-6 p-4")} style={step(4)}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{d.labels.extra}</p>
                  <Arrow />
                </div>
                <p className="whitespace-nowrap text-xl font-semibold"><NumberFlow value={d.extra.value} format={flow} />{suffix(d.currency)}</p>
              </div>
            </div>
            {d.quick && (
              <div className={clsx(CARD, "bk-in flex flex-col gap-4 p-4")} style={step(5)}>
                <p className="font-semibold">{d.labels.quick}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {d.quick.map((q) =>
                    q.onClick ? (
                      <button key={q.label} type="button" onClick={q.onClick} className="flex h-11 items-center justify-center rounded-full bg-gradient-to-br from-[#5d6577] to-[#20242e] px-4 text-xs font-bold transition-transform hover:-translate-y-0.5">{q.label}</button>
                    ) : (
                      <span key={q.label} className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#5d6577] to-[#20242e] text-xs font-bold">{q.initials}</span>
                    ),
                  )}
                  {!data && <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><RefreshCw aria-hidden className="h-4 w-4" /></span>}
                </div>
              </div>
            )}
          </div>

          {/* Pravý sloupec: historie a karta */}
          <div className="flex flex-col gap-3">
            <div className={clsx(CARD, "bk-in flex flex-col gap-4 p-4")} style={step(3)}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{d.labels.history}</p>
                <Arrow />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div role="tablist" aria-label={d.labels.history} className="flex gap-1 rounded-full bg-[#0b0c10] p-1 text-sm">
                  {([["all", d.labels.filterAll], ["income", d.labels.filterIncome], ["spending", d.labels.filterSpend]] as const).map(([k, label]) => (
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
                <span className="flex items-center gap-1 text-sm text-white/70"><ListFilter aria-hidden className="h-4 w-4" /> {d.labels.filterBtn}</span>
              </div>
              {rows.length === 0 ? (
                <p className="py-4 text-sm text-white/50">{d.labels.empty}</p>
              ) : (
                <ul className="flex flex-col">
                  {rows.map((t) => (
                    <li key={t.id} className="bk-in flex items-center justify-between gap-3 border-b border-white/5 py-3 last:border-0" style={step(0)}>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b0c10] text-xs font-bold text-white/70">{t.name.slice(0, 2).toUpperCase()}</span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{t.name}</p>
                          <p className="text-xs text-white/50">{t.date}</p>
                        </div>
                      </div>
                      <p className={clsx("shrink-0 font-semibold tabular-nums", t.amount > 0 ? "text-[#7ee2a8]" : "text-white")}>{fmtAmount(t.amount)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Tilt glareEnable glareMaxOpacity={0.18} glareBorderRadius="24px" tiltMaxAngleX={8} tiltMaxAngleY={8} scale={1.01} transitionSpeed={900} tiltEnable={!noMotion()} className="bk-in rounded-[24px]" style={step(5)}>
              <div className="relative flex min-h-44 flex-col justify-between overflow-hidden rounded-[24px] bg-gradient-to-br from-[#2b3350] via-[#1a1e2c] to-[#0b0c10] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold italic tracking-wide">{d.card.brand}</span>
                  <Arrow />
                </div>
                <p className="text-3xl font-semibold tabular-nums">
                  <NumberFlow value={d.card.value} format={flow} /><span className="text-xl text-white/50">{suffix(d.currency)}</span>
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {d.card.chips.map((c) => (
                    <span key={c} className="rounded-full bg-white/10 px-3 py-1">{c}</span>
                  ))}
                </div>
              </div>
            </Tilt>
          </div>
        </div>
      </div>
    </div>
  );
}
