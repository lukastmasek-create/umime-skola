"use client";

import Link from "next/link";
import type { PointerEvent } from "react";
import { useReveal } from "./useReveal";

type Props = {
  href: string;
  title: string;
  text: string;
  accent: string;
  coverHeight: number;
  bars: number[];
  hiBar: number;
  index: number;
};

// Karta pro žáky: postupné vyjetí při scrollu, rostoucí sloupečky
// a světlo, které sleduje kurzor. Vše se vypíná při prefers-reduced-motion.
export default function StudentFeatureCard({ href, title, text, accent, coverHeight, bars, hiBar, index }: Props) {
  const { ref, shown } = useReveal<HTMLLIElement>();

  function onMove(e: PointerEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <li
      ref={ref}
      className={`gc-item mb-6 break-inside-avoid${shown ? " is-in" : ""}`}
      // Zpoždění podle pořadí; ve sloupcích se tak vlna nese přirozeně.
      style={{ ["--i" as string]: index % 6 }}
    >
      <Link
        href={href}
        className="gcard gcard-live group block"
        style={{ ["--ga" as string]: accent }}
        onPointerMove={onMove}
      >
        <span className="gcard-glow" aria-hidden="true" />
        <div className="gcard-bars px-5 pt-5" style={{ height: coverHeight }} aria-hidden="true">
          {bars.map((h, n) => (
            <i
              key={n}
              className={n === hiBar ? "is-hi" : ""}
              style={{ height: `${h}%`, ["--n" as string]: n }}
            />
          ))}
        </div>
        <div className="flex items-end justify-between gap-3 p-5">
          <div className="flex flex-col gap-2">
            <h3 className="gcard-title text-lg leading-snug" style={{ fontFamily: "var(--font-heading)" }}>
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--muted)]">{text}</p>
          </div>
          <span aria-hidden="true" className="gcard-chip">→</span>
        </div>
      </Link>
    </li>
  );
}
