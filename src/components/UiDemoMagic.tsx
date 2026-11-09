"use client";

import { useRef, useState } from "react";
import { clsx } from "clsx";
import { Sparkles, Gamepad2, BookOpen, Star, Trophy, Brain } from "lucide-react";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { Meteors } from "@/components/ui/meteors";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import { DiaTextReveal } from "@/components/ui/dia-text-reveal";
import { Ripple } from "@/components/ui/ripple";
import { HexagonPattern } from "@/components/ui/hexagon-pattern";
import { DitherField } from "@/components/ui/dither-field";

const card = "relative flex min-h-44 flex-col gap-3 overflow-hidden rounded-[var(--radius-card)] border-2 border-[var(--edge)] bg-[var(--surface)] p-5 shadow-[0_4px_0_var(--shadow-ink)]";
const label = "text-sm font-bold";

// Náhled deseti komponent z Magic UI (shadcn registr). Každá má vlastní kartu.
function BeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const toRef2 = useRef<HTMLDivElement>(null);
  const node = "flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]";
  return (
    <div ref={containerRef} className="relative flex h-full min-h-32 items-center justify-between">
      <div ref={fromRef} className={node}><BookOpen aria-hidden className="h-4 w-4" /></div>
      <div ref={toRef} className={node}><Brain aria-hidden className="h-4 w-4" /></div>
      <div ref={toRef2} className={node}><Trophy aria-hidden className="h-4 w-4" /></div>
      <AnimatedBeam containerRef={containerRef} fromRef={fromRef} toRef={toRef} />
      <AnimatedBeam containerRef={containerRef} fromRef={toRef} toRef={toRef2} curvature={-40} />
    </div>
  );
}

export function MagicTab() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <div className="flex flex-col gap-5">
      <SmoothCursor />
      <div className="grid gap-5 md:grid-cols-2">
        <div className={card}>
          <p className={label}>Smooth cursor</p>
          <p className="text-sm text-[var(--muted)]">Kurzor se plynule zpožďuje za myší. Pohni myší po stránce.</p>
        </div>

        <div className={card}>
          <p className={label}>Animated beam (spojnice)</p>
          <BeamDemo />
        </div>

        <div className={clsx(card, "items-center justify-center")}>
          <Meteors number={18} />
          <p className={label}>Meteors</p>
          <p className="text-sm text-[var(--muted)]">Padající meteority v pozadí.</p>
        </div>

        <div className={card}>
          <p className={label}>Animated theme toggler</p>
          <div className="flex items-center gap-3">
            <AnimatedThemeToggler theme={theme} onThemeChange={setTheme} className="rounded-full border-2 border-[var(--edge)] p-2" />
            <span className="text-sm text-[var(--muted)]">Aktuálně: {theme === "light" ? "světlý" : "tmavý"}</span>
          </div>
        </div>

        <div className={card}>
          <p className={label}>Typing animation</p>
          <TypingAnimation className="text-2xl font-extrabold" loop words={["Učíme se hrou.", "Procvičuj každý den.", "Vyhrávej s přáteli."]} />
        </div>

        <div className={card}>
          <p className={label}>Line shadow text</p>
          <LineShadowText className="text-4xl font-extrabold" shadowColor="#7c86ff">Učení</LineShadowText>
        </div>

        <div className={card}>
          <p className={label}>Dia text reveal</p>
          <DiaTextReveal text="Hraj a uč se" className="text-2xl font-extrabold" colors={["#ff8a6b", "#7c86ff", "#7ee2a8"]} />
        </div>

        <div className={clsx(card, "items-center justify-center")}>
          <Ripple />
          <p className="relative z-10 flex items-center gap-2 text-sm font-bold"><Star aria-hidden className="h-4 w-4" /> Ripple</p>
        </div>

        <div className={clsx(card, "items-center justify-center")}>
          <HexagonPattern className="absolute inset-0 h-full w-full fill-[var(--brand-500)]/15 stroke-[var(--brand-500)]/40" />
          <p className="relative z-10 flex items-center gap-2 text-sm font-bold"><Gamepad2 aria-hidden className="h-4 w-4" /> Hexagon pattern</p>
        </div>

        <div className={clsx(card, "md:col-span-2")}>
          <p className={label}>Dither field</p>
          <div className="relative h-40 overflow-hidden rounded-xl border-2 border-[var(--edge)]">
            <DitherField pattern="aurora" color={["#7c86ff", "#ff8a6b", "#7ee2a8"]} className="absolute inset-0 h-full w-full" />
            <p className="absolute inset-0 flex items-center justify-center gap-2 text-lg font-extrabold text-white drop-shadow">
              <Sparkles aria-hidden className="h-5 w-5" /> Dither field
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
