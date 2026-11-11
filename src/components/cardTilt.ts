import type { PointerEvent } from "react";

// Sdílený 3D náklon karet (žáci, učitelé): jen pro myš. Nastaví CSS proměnné, které čte .gcard-live
// (--rx/--ry náklon, --px/--py paralaxa ilustrace, --mx/--my poloha kurzoru).
export function tiltMove(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
  if (e.pointerType !== "mouse") return;
  const px = ((e.clientX - r.left) / r.width - 0.5) * 2;
  const py = ((e.clientY - r.top) / r.height - 0.5) * 2;
  const k = Math.min(1, 380 / r.width); // široké karty se nakloní míň, jinak působí převrácené
  el.style.setProperty("--rx", `${(-py * 5 * k).toFixed(2)}deg`);
  el.style.setProperty("--ry", `${(px * 6 * k).toFixed(2)}deg`);
  el.style.setProperty("--px", px.toFixed(3));
  el.style.setProperty("--py", py.toFixed(3));
}

export function tiltLeave(e: PointerEvent<HTMLElement>) {
  ["--rx", "--ry", "--px", "--py"].forEach((p) => e.currentTarget.style.removeProperty(p));
}
