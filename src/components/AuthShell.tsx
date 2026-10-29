"use client";

import type { ReactNode } from "react";

// Rámec přihlášení a registrace: vlevo maskot (hrdina z městečka, stejné 3D sprity z Blenderu), kolem plují
// ikony předmětů, formulář vpravo naběhne políčko po políčku. Maskot se raduje po úspěchu a kroutí hlavou
// při chybě; na telefonu zůstane jen malý maskot nad formulářem.

export type AuthMood = "idle" | "joy" | "oops";

const FLOATERS = ["cestina", "matematika", "anglictina", "zemepis", "fyzika", "chemie", "hudebka", "dejepis"];

export function AuthShell({ mood, greeting, children }: { mood: AuthMood; greeting: string; children: ReactNode }) {
  const sprite = mood === "joy" ? "hrdina-radost" : "hrdina-stoji";
  return (
    <div className="gradient-hero auth-stage relative flex min-h-[calc(100vh-140px)] items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {FLOATERS.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s}
            src={`/home/predmet-${s}.webp`}
            alt=""
            draggable={false}
            className="auth-float absolute hidden w-14 opacity-80 sm:block lg:w-20"
            style={{ left: `${[3, 13, 80, 90][i % 4] + (i > 3 ? 2 : 0)}%`, top: i < 4 ? `${8 + (i % 2) * 10}%` : `${74 + (i % 2) * 8}%`, ["--d" as string]: `${i * -1.1}s`, ["--r" as string]: `${(i % 2 ? 1 : -1) * (6 + i)}deg` }}
          />
        ))}
      </div>
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-4 md:flex-row md:items-end md:gap-8">
        <div className="flex shrink-0 flex-col items-center md:w-64">
          <p className="auth-bubble relative mb-2 max-w-[16rem] rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] px-4 py-2 text-center text-sm font-bold shadow-[0_4px_0_var(--shadow-ink)]">{greeting}</p>
          <div className={`auth-mascot ${mood === "oops" ? "auth-oops" : ""}`}>
            <span
              key={sprite}
              className="town-sprite block h-40 w-40 md:h-60 md:w-60"
              style={{ ["--n" as string]: 24, backgroundImage: `url(/home/mesto/${sprite}.webp)`, animationDuration: mood === "joy" ? "1.1s" : "3s" }}
            />
            <span aria-hidden className="auth-shadow" />
          </div>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
