import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

// Pixelová sada pro „arkádový“ vzhled: ikony z bitmap, scéna s hvězdami a trávou, nadpis stránky a karta.
// Bez stavu, funguje na serveru i na klientovi. Styly jsou v globals.css pod `.px-skin`.

const BITMAPS = {
  star: ["...#...", "...#...", "#######", ".#####.", "..###..", ".##.##.", ".#...#."],
  heart: [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."],
  hourglass: ["#######", ".#####.", "..###..", "...#...", "..###..", ".#####.", "#######"],
  door: [".####.", "#....#", "#....#", "#...##", "#....#", "#....#", "#....#", "######"],
  sword: ["......#", ".....##", "....##.", "#..##..", ".###...", "..#....", ".#.#..."],
  lock: ["..###..", ".#...#.", ".#...#.", "#######", "###.###", "###.###", "#######", "#######"],
  plus: ["..#..", "..#..", "#####", "..#..", "..#.."],
  book: ["#####.", "#...##", "#.#.#.", "#...#.", "#.#.#.", "#####."],
  chest: [".######.", "#......#", "########", "#..##..#", "#..##..#", "########"],
} as const;

export type PxIconName = keyof typeof BITMAPS;

/** Ikona z bitmapy; barvu bere z `currentColor`, jedna buňka = `scale` pixelů. */
export function PxIcon({ name, scale = 3, className = "" }: { name: PxIconName; scale?: number; className?: string }) {
  const rows = BITMAPS[name];
  const w = rows[0].length;
  const rects: ReactNode[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      if (row[x] !== "#") {
        x++;
        continue;
      }
      const start = x;
      while (x < w && row[x] === "#") x++;
      rects.push(<rect key={`${y}-${start}`} x={start} y={y} width={x - start} height={1} />);
    }
  });
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${w} ${rows.length}`}
      width={w * scale}
      height={rows.length * scale}
      shapeRendering="crispEdges"
      fill="currentColor"
      className={`px-icon ${className}`}
    >
      {rects}
    </svg>
  );
}

/** Řada ikon (např. hvězdy obtížnosti), prázdné jsou ztlumené. Přístupný popis dává `label`. */
export function PxRow({ icon, value, max, label, scale = 2, className = "" }: { icon: PxIconName; value: number; max: number; label: string; scale?: number; className?: string }) {
  return (
    <span role="img" aria-label={label} title={label} className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? "px-on" : "px-off"}>
          <PxIcon name={icon} scale={scale} />
        </span>
      ))}
    </span>
  );
}

/** Celá šířka: noční obloha s mrkajícími hvězdami nahoře a pruhem trávy a hlíny dole. */
export function PxStage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-skin px-stage ${className}`}>
      <span aria-hidden className="px-sky" />
      <div className="px-stage-in">{children}</div>
      <span aria-hidden className="px-ground" />
    </div>
  );
}

/** Hlavička stránky: pixelový nadpis, podtitul a volitelná poznámka. */
export function PxHeader({ title, subtitle, eyebrow }: { title: string; subtitle?: string; eyebrow?: string }) {
  return (
    <header className="mb-8 flex flex-col gap-3">
      {eyebrow && <p className="px-eyebrow">{eyebrow}</p>}
      <h1 className="px-title text-3xl sm:text-5xl">{title}</h1>
      {subtitle && <p className="px-sub max-w-2xl text-base sm:text-lg">{subtitle}</p>}
    </header>
  );
}

/** Karta s pixelovým rámem. S `href` je to odkaz se zvednutím při najetí. Barva `accent` obarví horní pruh. */
export function PxCard({
  href,
  accent,
  num,
  icon,
  title,
  text,
  action,
  children,
}: {
  href: string;
  accent: string;
  num?: number;
  icon: ReactNode;
  title: string;
  text?: string;
  action?: string;
  children?: ReactNode;
}) {
  return (
    <Link href={href} className="px-box px-box-hover px-card" style={{ ["--ac" as string]: accent } as CSSProperties}>
      <span className="px-card-top" aria-hidden>
        {num != null && <span className="px-card-num">{String(num).padStart(2, "0")}</span>}
      </span>
      <span className="px-slot px-card-icon">{icon}</span>
      <span className="px-card-title">{title}</span>
      {text && <span className="px-card-text">{text}</span>}
      {children}
      <span className="px-btn px-btn-green px-card-go">{action ?? "▶"}</span>
    </Link>
  );
}
