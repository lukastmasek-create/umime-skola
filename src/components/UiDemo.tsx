"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Progress from "@radix-ui/react-progress";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { motion } from "motion/react";
import { toast, Toaster } from "sonner";
import confetti from "canvas-confetti";
import { Gift, Gamepad2, Trophy, Star, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type Game = { id: string; name: string; tag: string; kind: "action" | "classic"; progress: number };

const GAMES: Game[] = [
  { id: "bingo", name: "Bingo", tag: "Odpovídej a škrtej políčka", kind: "classic", progress: 80 },
  { id: "blesk", name: "Blesk", tag: "Rychlé kolo na čas", kind: "action", progress: 45 },
  { id: "pexeso", name: "Pexeso", tag: "Najdi dvojice karet", kind: "classic", progress: 10 },
  { id: "poklad", name: "Poklad", tag: "Kopej a najdi poklad", kind: "action", progress: 100 },
];

const card = "rounded-[var(--radius-card)] border-2 border-[var(--edge)] bg-[var(--surface)] shadow-[0_4px_0_var(--shadow-ink)]";

function GameCard({ game, index }: { game: Game; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className={clsx(card, "flex flex-col gap-3 p-4")}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={twMerge(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            game.kind === "action" ? "bg-[rgba(124,108,255,0.18)]" : "bg-[rgba(34,197,94,0.16)]",
          )}
        >
          <Gamepad2 aria-hidden className="h-6 w-6" />
        </span>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button type="button" className="rounded-full p-1 text-[var(--faint)] hover:text-[var(--foreground)]" aria-label={`Info: ${game.name}`}>
              <Star aria-hidden className="h-5 w-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content sideOffset={6} className="rounded-lg bg-[var(--edge)] px-3 py-1.5 text-xs text-white">
              {game.kind === "action" ? "Akční hra" : "Klasická hra"}
              <Tooltip.Arrow className="fill-[var(--edge)]" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
      <div>
        <h3 className="font-bold">{game.name}</h3>
        <p className="text-sm text-[var(--muted)]">{game.tag}</p>
      </div>
      <Progress.Root value={game.progress} className="relative h-3 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
        <Progress.Indicator
          className="h-full rounded-full bg-[var(--brand-500)] transition-transform duration-500"
          style={{ transform: `translateX(-${100 - game.progress}%)` }}
        />
      </Progress.Root>
      <span className="font-mono text-xs text-[var(--muted)]">{game.progress} %</span>
    </motion.div>
  );
}

export function UiDemo() {
  const [filter, setFilter] = useState<"all" | Game["kind"]>("all");
  const [listRef] = useAutoAnimate<HTMLUListElement>();
  const shown = GAMES.filter((g) => filter === "all" || g.kind === filter);

  function celebrate() {
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    toast.success("Odměna vyzvednuta: +50 bodů");
  }

  return (
    <Tooltip.Provider delayDuration={150}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-2">
          <p className="pill w-fit gap-1.5 bg-[var(--accent-yellow)] px-3 py-1 text-[#16132b]">
            <Sparkles aria-hidden className="h-3.5 w-3.5" /> Ukázka knihoven
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Nové UI komponenty
          </h1>
          <p className="max-w-2xl text-[var(--muted)]">
            Záložky, progress, tooltipy, animace seznamu, toasty, konfety a ikony na jedné stránce.
          </p>
        </header>

        <Tabs.Root defaultValue="hry" className="flex flex-col gap-6">
          <Tabs.List className="flex flex-wrap gap-2" aria-label="Sekce">
            {[
              { v: "hry", label: "Hry", icon: Gamepad2 },
              { v: "odmeny", label: "Odměny", icon: Gift },
              { v: "profil", label: "Profil", icon: Trophy },
            ].map(({ v, label, icon: Icon }) => (
              <Tabs.Trigger
                key={v}
                value={v}
                className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-4 py-2 text-sm font-bold data-[state=active]:bg-[var(--brand-500)] data-[state=active]:text-white"
              >
                <Icon aria-hidden className="h-4 w-4" /> {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="hry" className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtr her">
              {(["all", "action", "classic"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={clsx(
                    "rounded-full border-2 border-[var(--edge)] px-3 py-1 text-xs font-bold",
                    filter === f ? "bg-[var(--edge)] text-white" : "bg-[var(--surface)]",
                  )}
                >
                  {f === "all" ? "Všechny" : f === "action" ? "Akční" : "Klasické"}
                </button>
              ))}
            </div>
            <ul ref={listRef} className="grid gap-4 sm:grid-cols-2">
              {shown.map((g, i) => (
                <li key={g.id}>
                  <GameCard game={g} index={i} />
                </li>
              ))}
            </ul>
          </Tabs.Content>

          <Tabs.Content value="odmeny" className="flex flex-col gap-4">
            <div className={clsx(card, "flex flex-wrap items-center justify-between gap-4 p-5")}>
              <div>
                <h2 className="font-bold">Denní výzva splněna</h2>
                <p className="text-sm text-[var(--muted)]">Odměna čeká na vyzvednutí.</p>
              </div>
              <button type="button" onClick={celebrate} className="btn-bouncy btn-primary btn-lg">
                <Gift aria-hidden className="h-5 w-5" /> Vyzvednout
              </button>
            </div>
          </Tabs.Content>

          <Tabs.Content value="profil" className="flex flex-col gap-4">
            <div className={clsx(card, "flex flex-col gap-3 p-5")}>
              <h2 className="font-bold">Celkový postup</h2>
              <Progress.Root value={62} className="relative h-4 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
                <Progress.Indicator
                  className="h-full rounded-full transition-transform duration-500"
                  style={{ background: "linear-gradient(90deg, var(--brand-500), var(--accent-green))", transform: "translateX(-38%)" }}
                />
              </Progress.Root>
              <span className="text-sm text-[var(--muted)]">62 % do dalšího levelu</span>
            </div>
          </Tabs.Content>
        </Tabs.Root>

        <Toaster position="bottom-center" richColors />
      </div>
    </Tooltip.Provider>
  );
}
