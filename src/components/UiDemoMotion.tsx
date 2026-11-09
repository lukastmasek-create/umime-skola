"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useInView } from "react-intersection-observer";
import Tilt from "react-parallax-tilt";
import { RoughNotation } from "react-rough-notation";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { useDropzone } from "react-dropzone";
import Lenis from "lenis";
import { autoUpdate, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { toast } from "sonner";
import { Upload, Gamepad2, Trophy, Star } from "lucide-react";
import { clsx } from "clsx";

const card = "rounded-[var(--radius-card)] border-2 border-[var(--edge)] bg-[var(--surface)] shadow-[0_4px_0_var(--shadow-ink)]";
const popup = "z-50 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] p-3 text-sm shadow-[0_4px_0_var(--shadow-ink)]";

// ---------- Pohyb ----------

// Posuvný podtržítko pod záložkou: layoutId z motion přelétne mezi položkami.
const SEGMENTS = ["Denně", "Týdně", "Celkem"] as const;
function SlidingSegments() {
  const [active, setActive] = useState<(typeof SEGMENTS)[number]>("Denně");
  return (
    <div className="flex gap-1 rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)] p-1" role="tablist" aria-label="Období">
      {SEGMENTS.map((s) => (
        <button
          key={s}
          type="button"
          role="tab"
          aria-selected={active === s}
          onClick={() => setActive(s)}
          className="relative rounded-full px-4 py-1.5 text-sm font-bold"
        >
          {active === s && (
            <motion.span layoutId="segment-pill" className="absolute inset-0 rounded-full bg-[var(--brand-500)]" transition={{ type: "spring", stiffness: 500, damping: 36 }} />
          )}
          <span className={clsx("relative", active === s && "text-white")}>{s}</span>
        </button>
      ))}
    </div>
  );
}

// Karta, která jemně reaguje na kurzor (pružina, ne skok).
function GlowCard() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 25 });
  const sy = useSpring(y, { stiffness: 200, damping: 25 });
  const bg = useTransform([sx, sy], ([a, b]) => `radial-gradient(circle at ${50 + Number(a) * 0.3}% ${50 + Number(b) * 0.3}%, rgba(124,108,255,0.35), transparent 60%)`);
  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set(e.clientX - r.left - r.width / 2);
        y.set(e.clientY - r.top - r.height / 2);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ backgroundImage: bg }}
      className={clsx(card, "flex h-32 items-center justify-center p-4 text-sm font-semibold")}
    >
      Pohni myší po kartě (motion, useSpring)
    </motion.div>
  );
}

// Karty, které se po jedné rozsvítí a na najetí se mírně zvětší.
const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const ITEM = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
function StaggerList() {
  const items = [
    { t: "Bingo", icon: Gamepad2 },
    { t: "Pexeso", icon: Trophy },
    { t: "Poklad", icon: Star },
  ];
  return (
    <motion.ul variants={STAGGER} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-3">
      {items.map(({ t, icon: Icon }) => (
        <motion.li key={t} variants={ITEM} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className={clsx(card, "flex items-center gap-3 p-4 font-bold")}>
          <Icon aria-hidden className="h-5 w-5" /> {t}
        </motion.li>
      ))}
    </motion.ul>
  );
}

// Zvýraznění textu, které se "namaluje", když se dostane do výřezu (rough-notation).
function InkHighlight() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.6 });
  return (
    <p ref={ref} className="text-base leading-relaxed">
      Učení je nejrychlejší, když ho děláš <RoughNotation type="highlight" show={inView} color="#ffc933" animationDuration={900} multiline>každý den</RoughNotation> a
      vidíš svůj <RoughNotation type="underline" show={inView} color="#ff5a3c" animationDelay={600} animationDuration={800}>postup</RoughNotation>.
    </p>
  );
}

// Plynulé rolování v kontejneru (Lenis).
function SmoothScroll() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!wrapRef.current || !contentRef.current) return;
    const lenis = new Lenis({ wrapper: wrapRef.current, content: contentRef.current, duration: 1.1, lerp: 0.1 });
    let frame = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
  return (
    <div ref={wrapRef} className="h-40 overflow-hidden rounded-xl border-2 border-[var(--edge)]">
      <div ref={contentRef} className="flex flex-col gap-2 p-3">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm">
            Plynulý řádek {i + 1} (Lenis)
          </div>
        ))}
      </div>
    </div>
  );
}

export function MotionTab() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={clsx(card, "flex flex-col gap-4 p-5")}>
        <h3 className="font-bold">Přelétající zvýraznění (motion layoutId)</h3>
        <SlidingSegments />
        <h3 className="pt-2 font-bold">Karty s nástupem (motion stagger)</h3>
        <StaggerList />
      </div>
      <div className={clsx(card, "flex flex-col gap-4 p-5")}>
        <h3 className="font-bold">Světlo za kurzorem (motion)</h3>
        <GlowCard />
        <h3 className="font-bold">Naklápění karty (react-parallax-tilt)</h3>
        <Tilt glareEnable glareMaxOpacity={0.15} scale={1.02} className="rounded-[var(--radius-card)]">
          <div className={clsx(card, "p-4 text-sm font-semibold")}>Najeď myší nebo se dotkni karty</div>
        </Tilt>
      </div>
      <div className={clsx(card, "flex flex-col gap-3 p-5")}>
        <h3 className="font-bold">Podtržení tahem štětce (react-rough-notation)</h3>
        <InkHighlight />
      </div>
      <div className={clsx(card, "flex flex-col gap-3 p-5")}>
        <h3 className="font-bold">Plynulé rolování (Lenis)</h3>
        <SmoothScroll />
      </div>
    </div>
  );
}

// ---------- Další open-source ----------

function FloatingExample() {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "dialog" });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-bold">Plovoucí panel (@floating-ui/react)</h3>
      <button ref={(el) => refs.setReference(el)} type="button" {...getReferenceProps()} className="w-fit rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-4 py-2 text-sm font-bold">
        {open ? "Zavřít" : "Otevřít nabídku"}
      </button>
      {open && (
        <div ref={(el) => refs.setFloating(el)} style={floatingStyles} {...getFloatingProps()} className={clsx(popup, "w-56")}>
          Panel se ukotví k tlačítku a přeskočí na druhou stranu, když se nevejde.
        </div>
      )}
    </div>
  );
}

function ProgressExample() {
  const [pct, setPct] = useState(45);
  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-20">
        <CircularProgressbar
          value={pct}
          text={`${pct} %`}
          styles={buildStyles({ pathColor: "#3248f0", textColor: "currentColor", trailColor: "rgba(127,127,127,0.2)", pathTransitionDuration: 0.6 })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-bold">Kruhový postup (react-circular-progressbar)</h3>
        <button type="button" onClick={() => setPct((p) => (p >= 100 ? 0 : Math.min(100, p + 20)))} className="w-fit text-sm font-bold text-[var(--brand-600)] underline">
          Přidat postup
        </button>
      </div>
    </div>
  );
}

function SkeletonExample() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-bold">Načítání (react-loading-skeleton)</h3>
      {loaded ? (
        <p className="text-sm">Data jsou tady. Skeleton zmizel.</p>
      ) : (
        <Skeleton count={2} baseColor="var(--surface-muted)" highlightColor="rgba(255,255,255,0.3)" />
      )}
    </div>
  );
}

function ScrollExample() {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-bold">Rolování s vlastním posuvníkem (Radix ScrollArea)</h3>
      <ScrollArea.Root className="h-36 overflow-hidden rounded-xl border-2 border-[var(--edge)]">
        <ScrollArea.Viewport className="h-full w-full p-3">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="mb-2 rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm">
              Hra číslo {i + 1}
            </div>
          ))}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" className="flex w-2.5 touch-none select-none p-0.5">
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-[var(--brand-500)]" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}

function DropExample() {
  const [files, setFiles] = useState<string[]>([]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (accepted) => {
      setFiles(accepted.map((f) => f.name));
      toast.success(`Nahráno: ${accepted.length} soubor(ů)`);
    },
  });
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-bold">Nahrání přetažením (react-dropzone)</h3>
      <div
        {...getRootProps()}
        className={clsx(
          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-5 text-center text-sm transition-colors",
          isDragActive ? "border-[var(--brand-500)] bg-[var(--surface-muted)]" : "border-[var(--border-soft)]",
        )}
      >
        <input {...getInputProps()} />
        <Upload aria-hidden className="h-6 w-6" />
        {isDragActive ? "Pusť obrázek sem" : "Přetáhni obrázek sem nebo klikni"}
        {files.length > 0 && <span className="text-xs text-[var(--muted)]">{files.join(", ")}</span>}
      </div>
    </div>
  );
}

export function MoreOssTab() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={clsx(card, "flex flex-col gap-4 p-5")}>
        <FloatingExample />
        <ProgressExample />
      </div>
      <div className={clsx(card, "flex flex-col gap-4 p-5")}>
        <SkeletonExample />
        <ScrollExample />
      </div>
      <div className={clsx(card, "p-5 md:col-span-2")}>
        <DropExample />
      </div>
    </div>
  );
}


