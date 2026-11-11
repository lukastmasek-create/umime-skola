"use client";

import type { ReactNode } from "react";
import { useReveal } from "./useReveal";
import { tiltLeave, tiltMove } from "./cardTilt";

// Položka seznamu s kartou: postupný vjezd při scrollu a 3D náklon za kurzorem.
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

  return (
    <li ref={ref} className={`gc-item${shown ? " is-in" : ""}`} style={{ ["--i" as string]: index % 6 }}>
      <div
        className={`gcard gcard-live gcard-hover ${className}`}
        style={accent ? { ["--ga" as string]: accent } : undefined}
        onPointerMove={tiltMove}
        onPointerLeave={tiltLeave}
      >
        <span className="gcard-glow" aria-hidden="true" />
        {children}
      </div>
    </li>
  );
}
