"use client";

import { useRef, type PointerEvent as RPE, type ReactNode } from "react";
import { PcardTape } from "./PcardArt";

// Obal panelu s 3D nakláněním jako u karet kategorií: vnitřek se za kurzorem naklání v perspektivě
// a vrstvy (odznak, štítky, zem, jiskry) se posouvají různě rychle (--px / --py), takže vzniká hloubka.
export function HangPanel({ children }: { children: ReactNode }) {
  const inner = useRef<HTMLDivElement>(null);

  const move = (e: RPE<HTMLDivElement>) => {
    const el = inner.current;
    if (!el || e.pointerType !== "mouse" || e.buttons) return; // při tažení štítku se nenaklání
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 7}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 9}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
    el.style.setProperty("--px", ((px - 0.5) * 2).toFixed(3));
    el.style.setProperty("--py", ((py - 0.5) * 2).toFixed(3));
  };
  const leave = () => {
    const el = inner.current;
    ["--rx", "--ry", "--gx", "--gy", "--px", "--py"].forEach((p) => el?.style.removeProperty(p));
  };

  return (
    <div className="hang-panel reveal mx-auto max-w-5xl">
      <div ref={inner} className="hang-in" onPointerMove={move} onPointerLeave={leave}>
        {children}
        <span className="hang-sheen" aria-hidden />
      </div>
      <PcardTape />
    </div>
  );
}
