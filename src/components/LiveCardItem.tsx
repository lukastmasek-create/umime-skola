"use client";

import type { PointerEvent, ReactNode } from "react";
import { useReveal } from "./useReveal";

// Položka seznamu s kartou: postupný vjezd při scrollu a světlo za kurzorem.
// Vjezd běží na <li>, hover na vnitřní kartě, aby se transformace nepralaly.
export default function LiveCardItem({
  index,
  accent,
  className = "",
  children,
}: {
  index: number;
  accent?: string;
  className?: string;
  children: ReactNode;
}) {
  const { ref, shown } = useReveal<HTMLLIElement>();

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <li ref={ref} className={`gc-item${shown ? " is-in" : ""}`} style={{ ["--i" as string]: index % 6 }}>
      <div
        className={`gcard gcard-live gcard-hover ${className}`}
        style={accent ? { ["--ga" as string]: accent } : undefined}
        onPointerMove={onMove}
      >
        <span className="gcard-glow" aria-hidden="true" />
        {children}
      </div>
    </li>
  );
}
