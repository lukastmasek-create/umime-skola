"use client";

import { motion } from "motion/react";
import { Home, Users, GraduationCap, BookOpen, Video, CalendarCheck, CreditCard, Library, FileText, Search, Bell, Settings, ChevronDown, Sparkles } from "lucide-react";
import { clsx } from "clsx";

// Rozložení podle návrhu „SkillSet" (LMS dashboard): levý panel, horní lišta, banner, mřížky karet a pravý sloupec.
const NAV = [
  { label: "Home", icon: Home },
  { label: "Students", icon: Users },
  { label: "Teachers", icon: GraduationCap },
  { label: "Courses", icon: BookOpen },
  { label: "Live Class", icon: Video },
  { label: "Attendance", icon: CalendarCheck },
  { label: "Payments", icon: CreditCard },
  { label: "Library", icon: Library },
  { label: "Reports", icon: FileText },
];

const POPULAR = [
  { t: "The book is an essenti…", bg: "from-[#c9e7ff] to-[#a9c7ff]", emoji: "📘" },
  { t: "The book is an essenti…", bg: "from-[#ffd7c2] to-[#ffb3d1]", emoji: "📕" },
  { t: "The book is an essenti…", bg: "from-[#d5c8ff] to-[#c3b1ff]", emoji: "📗" },
  { t: "The book is an essenti…", bg: "from-[#ffe2b8] to-[#ffc89a]", emoji: "☕" },
];

const ONGOING = [
  { t: "The book is an essenti…", bg: "from-[#e4d8ff] to-[#c9b6ff]", emoji: "📐" },
  { t: "The book is an essenti…", bg: "from-[#ffc2d9] to-[#ff9fc6]", emoji: "📚" },
  { t: "The book is an essenti…", bg: "from-[#c4f2ff] to-[#94e0ff]", emoji: "📓" },
  { t: "The book is an essenti…", bg: "from-[#ffe9a6] to-[#ffd36b]", emoji: "🧪" },
];

const ACHIEVEMENTS = [
  { t: "Gross green", p: 72, c: "#7c5cff" },
  { t: "Feed a child", p: 52, c: "#ff7aa8" },
  { t: "Go quality", p: 60, c: "#ffb84d" },
  { t: "Kitchen box", p: 48, c: "#4dd4ff" },
];

const BEST = [
  { t: "Stone green", p: "$7", c: "#ffd7e8" },
  { t: "Mesh rating", p: "$9", c: "#d9ccff" },
  { t: "Ibi quality", p: "$5", c: "#c4f2ff" },
];

const panel = "rounded-2xl bg-white shadow-[0_4px_18px_rgba(90,70,160,0.08)]";

export function LmsTab() {
  return (
    <div className="flex gap-4 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#f1ecff] via-[#fbf7ff] to-[#ffeef8] p-4 text-[#2a2540]">
      {/* Levý panel */}
      <aside className="hidden w-44 shrink-0 flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_4px_18px_rgba(90,70,160,0.08)] md:flex">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#ff7aa8] text-xs font-bold text-white">S</span>
            <span className="text-sm font-extrabold">SkillSet</span>
          </div>
          <nav className="flex flex-col gap-1 text-[13px]" aria-label="Hlavní navigace">
            {NAV.map(({ label, icon: Icon }) => {
              const active = label === "Library";
              return (
                <span key={label} className={clsx("relative flex items-center gap-2.5 rounded-lg px-2.5 py-2", active ? "bg-[#f1ecff] font-semibold text-[#5b3fe0]" : "text-[#6b6585]")}>
                  {active && <span className="absolute -left-4 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-[#7c5cff]" />}
                  <Icon aria-hidden className="h-4 w-4" /> {label}
                </span>
              );
            })}
          </nav>
        </div>
        <div className="rounded-xl bg-[#f6f3ff] p-3 text-center text-xs text-[#6b6585]">
          <p>Upgrade to Pro for more facilities</p>
          <button type="button" className="mt-2 w-full rounded-lg bg-[#2a2540] py-1.5 text-white">Upgrade</button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {/* Horní lišta */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <label className={clsx(panel, "flex items-center gap-2 px-3 py-2 text-sm text-[#8a85a6]")}>
            <Search aria-hidden className="h-4 w-4" />
            <input placeholder="Search" className="w-32 bg-transparent text-[#2a2540] outline-none placeholder:text-[#a8a3c0] [color-scheme:light]" />
          </label>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-[#ffe3ea] px-2.5 py-1 text-xs font-bold text-[#e0306a]"><span className="h-1.5 w-1.5 rounded-full bg-[#e0306a]" /> Live</span>
            <span className={clsx(panel, "flex h-9 w-9 items-center justify-center")}><Settings aria-hidden className="h-4 w-4" /></span>
            <span className={clsx(panel, "flex h-9 w-9 items-center justify-center")}><Bell aria-hidden className="h-4 w-4" /></span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#ffb199] to-[#7aa2ff] text-xs font-bold text-white">IM</span>
          </div>
        </header>

        {/* Banner */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex min-h-36 items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-[#6a5cff] via-[#8b7cff] to-[#b49cff] p-6 text-white"
        >
          <div className="relative z-10 flex max-w-sm flex-col gap-2">
            <h3 className="text-2xl font-extrabold">Hi, Ilham Muhammad Shidiq</h3>
            <p className="text-xs text-white/85">The library serves as a resource for knowledge seekers and avid readers alike.</p>
            <button type="button" className="mt-2 w-fit rounded-lg bg-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur hover:bg-white/30">Learn more</button>
          </div>
          <div aria-hidden className="relative flex items-end gap-2 pr-4 text-5xl">
            <span className="drop-shadow-[0_8px_10px_rgba(0,0,0,0.25)]">📚</span>
            <span className="-mb-2 drop-shadow-[0_8px_10px_rgba(0,0,0,0.25)]">🗂️</span>
            <span className="drop-shadow-[0_8px_10px_rgba(0,0,0,0.25)]">📖</span>
          </div>
        </motion.section>

        <div className="grid gap-4 xl:grid-cols-[1fr_200px]">
          <div className="flex min-w-0 flex-col gap-5">
            {[
              { title: "Popular", items: POPULAR },
              { title: "Ongoing", items: ONGOING },
            ].map((sec) => (
              <section key={sec.title} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold">{sec.title}</h4>
                  <span className="text-[10px] text-[#8a85a6]">View all</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {sec.items.map((b, i) => (
                    <motion.div key={i} whileHover={{ y: -3 }} className={clsx(panel, "flex flex-col gap-2 overflow-hidden p-2")}>
                      <div className={clsx("flex h-24 items-center justify-center rounded-xl bg-gradient-to-br text-4xl", b.bg)} aria-hidden>{b.emoji}</div>
                      <p className="truncate text-[11px] font-bold">{b.t}</p>
                      <p className="truncate text-[10px] text-[#8a85a6]">This is an example text for the card…</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Pravý sloupec */}
          <div className="flex flex-col gap-4">
            <section className={clsx(panel, "flex flex-col gap-3 p-3")}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold">Unlocks achievement</h4>
                <Sparkles aria-hidden className="h-3.5 w-3.5 text-[#7c5cff]" />
              </div>
              {ACHIEVEMENTS.map((a) => (
                <div key={a.t} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold">{a.t}</span>
                    <span className="text-[#8a85a6]">{a.p}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#efeaff]" role="progressbar" aria-valuenow={a.p} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full" style={{ width: `${a.p}%`, background: a.c }} />
                  </div>
                </div>
              ))}
            </section>
            <section className={clsx(panel, "flex flex-col gap-2 p-3")}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold">Best seller</h4>
                <ChevronDown aria-hidden className="h-3.5 w-3.5 text-[#8a85a6]" />
              </div>
              {BEST.map((b) => (
                <div key={b.t} className="flex items-center gap-2">
                  <span className="h-8 w-8 shrink-0 rounded-lg" style={{ background: b.c }} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold">{b.t}</p>
                    <p className="text-[10px] text-[#8a85a6]">{b.p}</p>
                  </div>
                  <button type="button" className="rounded-md bg-[#7c5cff] px-2 py-1 text-[10px] font-bold text-white">Buy</button>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
