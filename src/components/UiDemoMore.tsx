"use client";

import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import * as Accordion from "@radix-ui/react-accordion";
import * as RSwitch from "@radix-ui/react-switch";
import * as Slider from "@radix-ui/react-slider";
import * as Select from "@radix-ui/react-select";
import * as Avatar from "@radix-ui/react-avatar";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Switch } from "@headlessui/react";
import { cva } from "class-variance-authority";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { useSpring, animated } from "@react-spring/web";
import { Lottie } from "lottie-react";
import CountUp from "react-countup";
import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { useQueryState, parseAsInteger } from "nuqs";
import { Virtuoso } from "react-virtuoso";
import Markdown from "react-markdown";
import { Swiper, SwiperSlide } from "swiper/react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useHotkeys } from "react-hotkeys-hook";
import { useCounter, useMediaQuery, useToggle } from "usehooks-ts";
import { Howl } from "howler";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Gift, Star, Bell, Settings, Volume2, Plus, Minus, Sparkles } from "lucide-react";
import { clsx } from "clsx";

const card = "rounded-[var(--radius-card)] border-2 border-[var(--edge)] bg-[var(--surface)] shadow-[0_4px_0_var(--shadow-ink)]";
const sectionTitle = "flex items-center gap-2 text-lg font-bold";
const inputCls = "w-full rounded-lg border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)]";
const selectItem = "cursor-pointer rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-[var(--surface-muted)]";
const popup = "z-50 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] p-1 shadow-[0_4px_0_var(--shadow-ink)]";

// Varianty tlačítek přes class-variance-authority.
const button = cva("btn-bouncy inline-flex items-center gap-2 rounded-full border-2 border-[var(--edge)] px-4 py-2 text-sm font-bold", {
  variants: {
    tone: {
      primary: "bg-[var(--brand-500)] text-white",
      ghost: "bg-[var(--surface)] text-[var(--foreground)]",
      success: "bg-[var(--accent-green)] text-white",
    },
  },
  defaultVariants: { tone: "ghost" },
});

const HRY = ["bingo", "blesk", "pexeso"] as const;

// ---------- Formuláře ----------
const formSchema = z.object({
  jmeno: z.string().min(2, "Zadej aspoň 2 znaky"),
  vek: z.number().min(6, "Nejmladší je 6 let").max(15, "Nejstarší je 15 let"),
  hra: z.enum(HRY),
});
type FormValues = z.infer<typeof formSchema>;

function FormExample() {
  const { register, handleSubmit, formState, reset, control } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { jmeno: "", vek: 10, hra: "bingo" },
  });
  const onSubmit = (v: FormValues) => {
    toast.success(`Uloženo: ${v.jmeno}, ${v.vek} let, hra ${v.hra}`);
    reset();
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={clsx(card, "flex max-w-md flex-col gap-4 p-5")} noValidate>
      <h3 className="font-bold">Přihlášení do soutěže</h3>
      <label className="flex flex-col gap-1 text-sm font-semibold" htmlFor="f-jmeno">
        Jméno
        <input id="f-jmeno" className={inputCls} {...register("jmeno")} />
        {formState.errors.jmeno && <span className="text-xs text-[var(--danger)]">{formState.errors.jmeno.message}</span>}
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold" htmlFor="f-vek">
        Věk
        <input id="f-vek" type="number" className={inputCls} {...register("vek", { valueAsNumber: true })} />
        {formState.errors.vek && <span className="text-xs text-[var(--danger)]">{formState.errors.vek.message}</span>}
      </label>
      <div className="flex flex-col gap-1 text-sm font-semibold">
        <span>Hra (Radix Select)</span>
        <Controller
          name="hra"
          control={control}
          render={({ field }) => (
            <Select.Root value={field.value} onValueChange={field.onChange}>
              <Select.Trigger className={clsx(inputCls, "flex items-center justify-between")}>
                <Select.Value />
                <Select.Icon aria-hidden>▾</Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content position="popper" sideOffset={4} className={popup}>
                  <Select.Viewport>
                    {HRY.map((h) => (
                      <Select.Item key={h} value={h} className={selectItem}>
                        <Select.ItemText>{h}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          )}
        />
      </div>
      <button type="submit" className={button({ tone: "primary" })}>
        Odeslat
      </button>
    </form>
  );
}

function PickersExample() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dark, setDark] = useState(false);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>(LEVELS[1]);
  const [volume, setVolume] = useState([60]);
  const [view, setView] = useState("list");
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={clsx(card, "flex flex-col gap-3 p-4")}>
        <h3 className="font-bold">Datum (react-day-picker + date-fns)</h3>
        <DayPicker mode="single" selected={date} onSelect={setDate} />
        <p className="text-sm text-[var(--muted)]">Vybráno: {date ? format(date, "d. M. yyyy", { locale: cs }) : "nic"}</p>
      </div>
      <div className={clsx(card, "flex flex-col gap-5 p-4")}>
        <div className="flex flex-col gap-2">
          <h3 className="font-bold">Úroveň (Headless UI Listbox)</h3>
          <Listbox value={level} onChange={setLevel}>
            <ListboxButton className={clsx(inputCls, "text-left")}>{level}</ListboxButton>
            <ListboxOptions anchor="bottom start" className={clsx(popup, "w-[var(--button-width)]")}>
              {LEVELS.map((l) => (
                <ListboxOption key={l} value={l} className={selectItem}>
                  {l}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Listbox>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">Tmavý režim (Headless UI Switch)</span>
          <Switch checked={dark} onChange={setDark} className="relative inline-flex h-6 w-11 items-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)] data-[checked]:bg-[var(--brand-500)]">
            <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-[var(--edge)] transition data-[checked]:translate-x-6" />
          </Switch>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Hlasitost: {volume[0]} % (Radix Slider)</span>
          <Slider.Root value={volume} onValueChange={setVolume} max={100} step={5} className="relative flex h-5 w-full touch-none select-none items-center">
            <Slider.Track className="relative h-2 grow rounded-full bg-[var(--surface-muted)]">
              <Slider.Range className="absolute h-full rounded-full bg-[var(--brand-500)]" />
            </Slider.Track>
            <Slider.Thumb aria-label="Hlasitost" className="block h-5 w-5 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)]" />
          </Slider.Root>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold">Zobrazení (Radix ToggleGroup)</span>
          <ToggleGroup.Root type="single" value={view} onValueChange={(v) => v && setView(v)} className="flex gap-1">
            {["list", "grid"].map((v) => (
              <ToggleGroup.Item key={v} value={v} className="rounded-full border-2 border-[var(--edge)] px-3 py-1 text-xs font-bold data-[state=on]:bg-[var(--edge)] data-[state=on]:text-white">
                {v === "list" ? "Seznam" : "Mřížka"}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>
      </div>
    </div>
  );
}
const LEVELS = ["Začátečník", "Pokročilý", "Expert"] as const;

function OverlaysExample() {
  return (
    <div className="flex flex-wrap gap-3">
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button type="button" className={button()}>
            <Bell aria-hidden className="h-4 w-4" /> Dialog (Radix)
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <Dialog.Content className={clsx(card, "fixed left-1/2 top-1/2 z-50 w-[min(90vw,380px)] -translate-x-1/2 -translate-y-1/2 p-5")}>
            <Dialog.Title className="mb-1 font-bold">Opravdu odebrat hru?</Dialog.Title>
            <Dialog.Description className="mb-4 text-sm text-[var(--muted)]">Rozehraný postup se ztratí.</Dialog.Description>
            <div className="flex justify-end gap-2">
              <Dialog.Close className={button()}>Zrušit</Dialog.Close>
              <Dialog.Close className={button({ tone: "primary" })}>Odebrat</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button type="button" className={button()}>
            <Settings aria-hidden className="h-4 w-4" /> Nabídka (Radix)
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content sideOffset={6} className={clsx(popup, "min-w-44")}>
            {["Upravit profil", "Nastavení hry", "Odhlásit"].map((item) => (
              <DropdownMenu.Item key={item} onSelect={() => toast(item)} className={selectItem}>
                {item}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Popover.Root>
        <Popover.Trigger asChild>
          <button type="button" className={button()}>
            <Sparkles aria-hidden className="h-4 w-4" /> Popover (Radix)
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content sideOffset={6} className={clsx(popup, "max-w-64 p-3 text-sm")}>
            Tip: opakováním hry zvedneš rekord a získáš víc hvězdiček.
            <Popover.Arrow className="fill-[var(--edge)]" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

function AccordionExample() {
  return (
    <Accordion.Root type="single" collapsible defaultValue="a" className={clsx(card, "divide-y-2 divide-[var(--border-soft)] overflow-hidden")}>
      {[
        ["a", "Jak získat body?", "Učením v kurzech a plněním denních výzev."],
        ["b", "Co jsou stálé hry?", "Hry, které běží pořád, i když nehraješ."],
      ].map(([v, q, a]) => (
        <Accordion.Item key={v} value={v} className="p-4">
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center justify-between text-left font-bold">
              {q} <span aria-hidden>▾</span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pt-2 text-sm text-[var(--muted)]">{a}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

function AvatarsExample() {
  return (
    <div className="flex items-center gap-3">
      {["AN", "BE", "CK"].map((initials, i) => (
        <Avatar.Root key={initials} className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]" style={{ marginLeft: i ? -10 : 0 }}>
          <Avatar.Fallback className="text-sm font-bold">{initials}</Avatar.Fallback>
        </Avatar.Root>
      ))}
      <span className="text-sm text-[var(--muted)]">Tři hráči v týmu (Radix Avatar)</span>
    </div>
  );
}

// ---------- Animace ----------
// Minimální Lottie animace: rotující modrý kruh (vložený přímo, bez stahování).
const SPIN = {
  v: "5.7.4", fr: 30, ip: 0, op: 60, w: 120, h: 120, nm: "spin", ddd: 0, assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: "c", sr: 1, ip: 0, op: 60, st: 0, bm: 0,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ t: 0, s: [0], i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } }, { t: 60, s: [360] }] },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr", nm: "g", it: [
            { ty: "el", nm: "e", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [70, 70] } },
            { ty: "st", nm: "s", c: { a: 0, k: [0.19, 0.28, 0.94, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 10 }, lc: 2, lj: 1 },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
    },
  ],
};

function AnimationsExample() {
  const [on, toggleOn] = useToggle(false);
  const spring = useSpring({ x: on ? 200 : 0, config: { tension: 170, friction: 16 } });
  const [n, setN] = useState(1240);
  const [count, setCount] = useState(0);
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={clsx(card, "flex flex-col gap-4 p-5")}>
        <h3 className="font-bold">Pružinová animace (react-spring)</h3>
        <animated.div
          className="h-10 w-10 rounded-xl border-2 border-[var(--edge)] bg-[var(--accent-500)]"
          style={{ transform: spring.x.to((x) => `translateX(${x}px)`) }}
        />
        <button type="button" onClick={toggleOn} className={button({ tone: "primary" })}>
          {on ? "Zpátky" : "Posunout"}
        </button>
      </div>
      <div className={clsx(card, "flex flex-col items-center gap-3 p-5")}>
        <h3 className="self-start font-bold">Lottie animace (lottie-react)</h3>
        <Lottie src={SPIN as never} loop className="h-28 w-28" />
      </div>
      <div className={clsx(card, "flex flex-col gap-3 p-5")}>
        <h3 className="font-bold">Počítání (react-countup)</h3>
        <p className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          <CountUp end={1240} duration={1.6} separator=" " /> <span className="text-base font-semibold text-[var(--muted)]">bodů</span>
        </p>
      </div>
      <div className={clsx(card, "flex flex-col gap-3 p-5")}>
        <h3 className="font-bold">Plynulá čísla (@number-flow/react)</h3>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setN((v) => v - 10)} className={button()} aria-label="Ubrat 10">
            <Minus aria-hidden className="h-4 w-4" />
          </button>
          <span className="text-3xl font-extrabold">
            <NumberFlow value={n} />
          </span>
          <button type="button" onClick={() => setN((v) => v + 10)} className={button()} aria-label="Přidat 10">
            <Plus aria-hidden className="h-4 w-4" />
          </button>
        </div>
        <button type="button" onClick={() => setCount((c) => c + 1)} className="w-fit text-sm font-bold text-[var(--brand-600)] underline">
          Počet kliknutí na tomto řádku: {count}
        </button>
      </div>
    </div>
  );
}

// ---------- Data ----------
type ScoreStore = { points: number; add: (n: number) => void };
const useScore = create<ScoreStore>((set) => ({ points: 0, add: (n) => set((s) => ({ points: s.points + n })) }));

const SAMPLE_MD = `## Denní výzva

Splň **tři kola** bez chyby a získej *bonus*:

- Bingo: 5 správných odpovědí
- Blesk: 60 sekund
`;

function DataExample() {
  const points = useScore((s) => s.points);
  const add = useScore((s) => s.add);
  const [q, setQ] = useQueryState("strana", parseAsInteger.withDefault(1));
  const { data, isPending } = useQuery({
    queryKey: ["zebricek"],
    queryFn: () => new Promise<{ jmeno: string; body: number }[]>((resolve) => setTimeout(() => resolve([{ jmeno: "Adéla", body: 320 }, { jmeno: "Bořek", body: 280 }, { jmeno: "Cecílie", body: 210 }]), 700)),
  });
  const rows = Array.from({ length: 400 }, (_, i) => `Položka ${i + 1}`);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={clsx(card, "flex flex-col gap-3 p-5")}>
        <h3 className="font-bold">Žebříček (TanStack Query)</h3>
        {isPending ? (
          <p className="text-sm text-[var(--muted)]">Načítám…</p>
        ) : (
          <ol className="flex flex-col gap-1 text-sm">
            {data?.map((r) => (
              <li key={r.jmeno} className="flex justify-between">
                <span>{r.jmeno}</span>
                <span className="font-mono">{r.body} b.</span>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className={clsx(card, "flex flex-col gap-3 p-5")}>
        <h3 className="font-bold">Body v paměti (zustand)</h3>
        <p className="text-sm">Aktuálně: <strong>{points}</strong> bodů</p>
        <button type="button" onClick={() => add(10)} className={button({ tone: "success" })}>
          Přidat 10 bodů
        </button>
      </div>
      <div className={clsx(card, "flex flex-col gap-3 p-5")}>
        <h3 className="font-bold">Stránka v adrese (nuqs)</h3>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setQ((p) => Math.max(1, p - 1))} className={button()}>‹</button>
          <span className="font-mono text-sm">strana = {q}</span>
          <button type="button" onClick={() => setQ((p) => p + 1)} className={button()}>›</button>
        </div>
      </div>
      <div className={clsx(card, "flex flex-col gap-3 p-5")}>
        <h3 className="font-bold">Dlouhý seznam (react-virtuoso, 400 položek)</h3>
        <Virtuoso
          style={{ height: 180 }}
          totalCount={rows.length}
          itemContent={(i) => <div className="border-b border-[var(--border-soft)] px-2 py-2 text-sm">{rows[i]}</div>}
        />
      </div>
      <div className={clsx(card, "flex flex-col gap-2 p-5 md:col-span-2")}>
        <h3 className="font-bold">Text s formátováním (react-markdown)</h3>
        <div className="prose-sm text-sm [&_li]:ml-5 [&_li]:list-disc">
          <Markdown>{SAMPLE_MD}</Markdown>
        </div>
      </div>
    </div>
  );
}

// ---------- Ovládání ----------
function beepUri() {
  const sr = 22050;
  const n = Math.floor(sr * 0.2);
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const s = Math.sin((2 * Math.PI * 660 * i) / sr) * Math.exp(-i / (sr * 0.06)) * 0.6;
    v.setInt16(44 + i * 2, Math.round(s * 32767), true);
  }
  let bin = "";
  for (const b of new Uint8Array(buf)) bin += String.fromCharCode(b);
  return "data:audio/wav;base64," + btoa(bin);
}

function ControlsExample() {
  const { count, increment, decrement, reset } = useCounter(0);
  const wide = useMediaQuery("(min-width: 640px)");
  const [sound, toggleSound] = useToggle(false);
  const howl = useMemo(() => new Howl({ src: [beepUri()], format: ["wav"], volume: 0.5 }), []);
  useHotkeys("g", () => toast("Klávesa G: otevřít hru"), []);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={clsx(card, "flex flex-col gap-3 p-5")}>
        <h3 className="font-bold">Počítadlo a klávesy (usehooks-ts, react-hotkeys-hook)</h3>
        <div className="flex items-center gap-3">
          <button type="button" onClick={decrement} className={button()}>−</button>
          <span className="font-mono text-lg">{count}</span>
          <button type="button" onClick={increment} className={button()}>+</button>
          <button type="button" onClick={reset} className="text-sm font-bold text-[var(--brand-600)] underline">Vynulovat</button>
        </div>
        <p className="text-sm text-[var(--muted)]">Stiskni klávesu G. Šířka okna: {wide ? "širší než 640 px" : "užší než 640 px"}</p>
      </div>
      <div className={clsx(card, "flex flex-col gap-3 p-5")}>
        <h3 className="font-bold">Zvuk (Howler) a ikony (Iconify)</h3>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => howl.play()} className={button({ tone: "primary" })}>
            <Volume2 aria-hidden className="h-4 w-4" /> Přehrát zvuk
          </button>
          <button type="button" onClick={toggleSound} className={button()}>
            <Icon icon={{ body: '<path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21z"/>', width: 24, height: 24 }} className="h-5 w-5" />
            {sound ? "Oblíbené: ano" : "Oblíbené: ne"}
          </button>
        </div>
      </div>
      <div className={clsx(card, "flex flex-col gap-3 p-5 md:col-span-2")}>
        <h3 className="font-bold">Karusel stránek (Swiper)</h3>
        <Swiper spaceBetween={12} slidesPerView={1.2} className="w-full">
          {["Základna", "Mazlíčci", "Farma", "Město", "Ekonomika"].map((name) => (
            <SwiperSlide key={name} style={{ height: 96 }} className="flex items-center justify-center rounded-xl border-2 border-[var(--edge)] bg-[var(--surface-muted)] font-bold">
              {name}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className={clsx(card, "flex flex-col gap-3 p-5 md:col-span-2")}>
        <h3 className="font-bold">Panely s posuvníkem (react-resizable-panels)</h3>
        <div className="h-44">
          <Group orientation="horizontal" className="h-full rounded-xl border-2 border-[var(--edge)]">
            <Panel defaultSize="35%" minSize="20%">
              <div className="flex h-full items-center justify-center text-sm font-bold">Seznam</div>
            </Panel>
            <Separator className="w-2 bg-[var(--border-soft)] hover:bg-[var(--brand-500)]" />
            <Panel minSize="30%">
              <div className="flex h-full items-center justify-center text-sm font-bold">Detail hry</div>
            </Panel>
          </Group>
        </div>
      </div>
    </div>
  );
}

export function FormsTab() {
  return (
    <div className="flex flex-col gap-5">
      <FormExample />
      <PickersExample />
      <OverlaysExample />
      <AccordionExample />
      <AvatarsExample />
    </div>
  );
}

export function AnimationsTab() {
  return <AnimationsExample />;
}

export function DataTab() {
  return <DataExample />;
}

export function ControlsTab() {
  return <ControlsExample />;
}

export { useScore };
