"use client";

import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Progress from "@radix-ui/react-progress";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { motion } from "motion/react";
import { toast, Toaster } from "sonner";
import confetti from "canvas-confetti";
import useEmblaCarousel from "embla-carousel-react";
import { Drawer } from "vaul";
import { Command } from "cmdk";
import { useInView } from "react-intersection-observer";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from "@tanstack/react-table";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Gift, Gamepad2, Trophy, Star, Sparkles, Search, GripVertical, ChartColumn, Table2, ListOrdered, Settings, Volume2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react";
import { FormsTab, AnimationsTab, DataTab, ControlsTab } from "./UiDemoMore";

type Game = { id: string; name: string; tag: string; kind: "action" | "classic"; progress: number };

const GAMES: Game[] = [
  { id: "bingo", name: "Bingo", tag: "Odpovídej a škrtej políčka", kind: "classic", progress: 80 },
  { id: "blesk", name: "Blesk", tag: "Rychlé kolo na čas", kind: "action", progress: 45 },
  { id: "pexeso", name: "Pexeso", tag: "Najdi dvojice karet", kind: "classic", progress: 10 },
  { id: "poklad", name: "Poklad", tag: "Kopej a najdi poklad", kind: "action", progress: 100 },
  { id: "obrana", name: "Obrana", tag: "Braň základnu správnými odpověďmi", kind: "action", progress: 30 },
  { id: "osmismerka", name: "Osmisměrka", tag: "Najdi slova v mřížce písmen", kind: "classic", progress: 60 },
];

const WEEK_XP = [
  { den: "Po", xp: 120 },
  { den: "Út", xp: 80 },
  { den: "St", xp: 150 },
  { den: "Čt", xp: 60 },
  { den: "Pá", xp: 190 },
  { den: "So", xp: 210 },
  { den: "Ne", xp: 40 },
];

type Result = { zak: string; hra: string; body: number; cas: number };
const RESULTS: Result[] = [
  { zak: "Adéla", hra: "Bingo", body: 42, cas: 310 },
  { zak: "Bořek", hra: "Blesk", body: 55, cas: 180 },
  { zak: "Cecílie", hra: "Pexeso", body: 30, cas: 420 },
  { zak: "Dan", hra: "Poklad", body: 61, cas: 205 },
  { zak: "Eva", hra: "Obrana", body: 48, cas: 260 },
];
const helper = createColumnHelper<Result>();
const RESULT_COLUMNS = [
  helper.accessor("zak", { header: "Žák", cell: (i) => i.getValue() }),
  helper.accessor("hra", { header: "Hra", cell: (i) => i.getValue() }),
  helper.accessor("body", { header: "Body", cell: (i) => i.getValue() }),
  helper.accessor("cas", { header: "Čas (s)", cell: (i) => i.getValue() }),
];

const card = "rounded-[var(--radius-card)] border-2 border-[var(--edge)] bg-[var(--surface)] shadow-[0_4px_0_var(--shadow-ink)]";
const sectionTitle = "flex items-center gap-2 text-lg font-bold";

function GameCard({ game, index }: { game: Game; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className={clsx(card, "flex h-full flex-col gap-3 p-4")}
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
      <div className="mt-auto flex flex-col gap-1.5">
        <Progress.Root value={game.progress} className="relative h-3 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
          <Progress.Indicator
            className="h-full rounded-full bg-[var(--brand-500)] transition-transform duration-500"
            style={{ transform: `translateX(-${100 - game.progress}%)` }}
          />
        </Progress.Root>
        <span className="font-mono text-xs text-[var(--muted)]">{game.progress} %</span>
      </div>
    </motion.div>
  );
}

function GamesTab() {
  const [filter, setFilter] = useState<"all" | Game["kind"]>("all");
  const [listRef] = useAutoAnimate<HTMLUListElement>();
  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true });
  const shown = GAMES.filter((g) => filter === "all" || g.kind === filter);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className={sectionTitle}>
          <Gamepad2 aria-hidden className="h-5 w-5" /> Doporučené hry (karusel)
        </h2>
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-4">
            {GAMES.slice(0, 4).map((g, i) => (
              <div key={g.id} className="min-w-0 flex-[0_0_78%] sm:flex-[0_0_42%] lg:flex-[0_0_30%]">
                <GameCard game={g} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={sectionTitle}>Všechny hry</h2>
          <div className="flex gap-2" role="group" aria-label="Filtr her">
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
        </div>
        <ul ref={listRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((g, i) => (
            <li key={g.id}>
              <GameCard game={g} index={i} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatsTab() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data: RESULTS,
    columns: RESULT_COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <div className="flex flex-col gap-8">
      <section ref={ref} className={clsx(card, "flex flex-col gap-3 p-5 transition-all duration-500", inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>
        <h2 className={sectionTitle}>
          <ChartColumn aria-hidden className="h-5 w-5" /> Body za týden (graf)
        </h2>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEK_XP}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
              <XAxis dataKey="den" stroke="var(--muted)" />
              <YAxis stroke="var(--muted)" />
              <ChartTooltip />
              <Bar dataKey="xp" fill="#3248f0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={clsx(card, "flex flex-col gap-3 p-5")}>
        <h2 className={sectionTitle}>
          <Table2 aria-hidden className="h-5 w-5" /> Výsledky (tabulka, klik na záhlaví řadí)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b-2 border-[var(--border-soft)] text-left">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="py-2 pr-4 font-bold">
                      <button type="button" onClick={h.column.getToggleSortingHandler()} className="hover:underline">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? ""}
                      </button>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border-soft)]">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-2 pr-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SortableRow({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className={clsx(card, "flex items-center gap-3 px-4 py-3", isDragging && "opacity-70")}
    >
      <button type="button" {...attributes} {...listeners} aria-label={`Přesunout: ${label}`} className="cursor-grab touch-none text-[var(--faint)] active:cursor-grabbing">
        <GripVertical aria-hidden className="h-5 w-5" />
      </button>
      <span className="font-bold">{label}</span>
    </li>
  );
}

function OrderTab() {
  const [items, setItems] = useState(["Bingo", "Blesk", "Pexeso", "Poklad", "Obrana"]);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems((prev) => arrayMove(prev, prev.indexOf(String(active.id)), prev.indexOf(String(over.id))));
  }

  return (
    <div className="flex max-w-md flex-col gap-4">
      <h2 className={sectionTitle}>
        <ListOrdered aria-hidden className="h-5 w-5" /> Oblíbené hry (přetáhni)
      </h2>
      <p className="text-sm text-[var(--muted)]">Myší nebo klávesnicí (Tab, pak šipky a Mezerník) změníš pořadí.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {items.map((name) => (
              <SortableRow key={name} id={name} label={name} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function RewardsTab() {
  function celebrate() {
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    toast.success("Odměna vyzvednuta: +50 bodů");
  }
  return (
    <div className="flex flex-col gap-4">
      <div className={clsx(card, "flex flex-wrap items-center justify-between gap-4 p-5")}>
        <div>
          <h2 className="font-bold">Denní výzva splněna</h2>
          <p className="text-sm text-[var(--muted)]">Odměna čeká na vyzvednutí.</p>
        </div>
        <button type="button" onClick={celebrate} className="btn-bouncy btn-primary btn-lg">
          <Gift aria-hidden className="h-5 w-5" /> Vyzvednout
        </button>
      </div>

      <Drawer.Root>
        <Drawer.Trigger asChild>
          <button type="button" className="btn-bouncy btn-secondary btn-lg w-fit">
            <Trophy aria-hidden className="h-5 w-5" /> Zobrazit odměny (šuplík)
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 flex max-h-[80vh] flex-col gap-3 rounded-t-[20px] border-2 border-b-0 border-[var(--edge)] bg-[var(--surface)] p-6 outline-none">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-[var(--border-soft)]" aria-hidden />
            <Drawer.Title className="text-lg font-bold">Odměny za týden</Drawer.Title>
            <Drawer.Description className="text-sm text-[var(--muted)]">Tažením dolů šuplík zavřeš. Splněné odměny se přičtou k bodům.</Drawer.Description>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="rounded-xl bg-[var(--surface-muted)] px-4 py-2">Bronzová truhla · +30 bodů</li>
              <li className="rounded-xl bg-[var(--surface-muted)] px-4 py-2">Stříbrná truhla · +80 bodů</li>
            </ul>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

function ProfileTab() {
  return (
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
  );
}

function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Command.Dialog open={open} onOpenChange={onOpenChange} label="Rychlé hledání" className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24">
      <div className="w-full max-w-lg overflow-hidden rounded-[var(--radius-card)] border-2 border-[var(--edge)] bg-[var(--surface)] shadow-[0_6px_0_var(--shadow-ink)]">
        <div className="flex items-center gap-2 border-b-2 border-[var(--border-soft)] px-4">
          <Search aria-hidden className="h-4 w-4 text-[var(--faint)]" />
          <Command.Input placeholder="Hledej hru nebo sekci…" className="w-full bg-transparent py-3 text-sm outline-none" />
        </div>
        <Command.List className="max-h-72 overflow-y-auto p-2">
          <Command.Empty className="p-4 text-sm text-[var(--muted)]">Nic jsme nenašli.</Command.Empty>
          <Command.Group heading="Hry" className="text-xs font-bold text-[var(--faint)]">
            {GAMES.map((g) => (
              <Command.Item
                key={g.id}
                value={g.name}
                onSelect={() => {
                  onOpenChange(false);
                  toast(`Otevírám hru: ${g.name}`);
                }}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-[var(--foreground)] data-[selected=true]:bg-[var(--surface-muted)]"
              >
                {g.name}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}

export function UiDemo() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <NuqsAdapter>
    <Tooltip.Provider delayDuration={150}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="pill w-fit gap-1.5 bg-[var(--accent-yellow)] px-3 py-1 text-[#16132b]">
              <Sparkles aria-hidden className="h-3.5 w-3.5" /> Ukázka knihoven
            </p>
            <button type="button" onClick={() => setPaletteOpen(true)} className="pill gap-2 bg-[var(--surface)] px-3 py-1.5 text-xs font-bold">
              <Search aria-hidden className="h-3.5 w-3.5" /> Hledat <kbd className="font-mono text-[var(--faint)]">Ctrl K</kbd>
            </button>
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Nové UI komponenty
          </h1>
          <p className="max-w-2xl text-[var(--muted)]">
            Karusel, tabulka, graf, přetahování, šuplík, hledání, animace a toasty. Všechno na jedné stránce, na které můžeš zkoušet.
          </p>
        </header>

        <Tabs.Root defaultValue="hry" className="flex flex-col gap-6">
          <Tabs.List className="flex flex-wrap gap-2" aria-label="Sekce">
            {[
              { v: "hry", label: "Hry", icon: Gamepad2 },
              { v: "statistiky", label: "Statistiky", icon: ChartColumn },
              { v: "poradi", label: "Pořadí", icon: ListOrdered },
              { v: "odmeny", label: "Odměny", icon: Gift },
              { v: "profil", label: "Profil", icon: Trophy },
              { v: "formulare", label: "Formuláře", icon: Settings },
              { v: "animace", label: "Animace", icon: Sparkles },
              { v: "data", label: "Data", icon: Table2 },
              { v: "ovladani", label: "Ovládání", icon: Volume2 },
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

          <Tabs.Content value="hry"><GamesTab /></Tabs.Content>
          <Tabs.Content value="statistiky"><StatsTab /></Tabs.Content>
          <Tabs.Content value="poradi"><OrderTab /></Tabs.Content>
          <Tabs.Content value="odmeny"><RewardsTab /></Tabs.Content>
          <Tabs.Content value="profil"><ProfileTab /></Tabs.Content>
          <Tabs.Content value="formulare"><FormsTab /></Tabs.Content>
          <Tabs.Content value="animace"><AnimationsTab /></Tabs.Content>
          <Tabs.Content value="data"><DataTab /></Tabs.Content>
          <Tabs.Content value="ovladani"><ControlsTab /></Tabs.Content>
        </Tabs.Root>

        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        <Toaster position="bottom-center" richColors />
      </div>
    </Tooltip.Provider>
    </NuqsAdapter>
    </QueryClientProvider>
  );
}
