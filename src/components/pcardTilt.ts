import type { PointerEvent as RPE, MouseEvent as RME } from "react";

// 3D náklon karty za kurzorem, stejně jako u karet kategorií na homepage (TearCard).
// Vlastnosti se nastavují na .pcard-in, který CSS používá pro naklonění a paralaxu vrstev.
export function pcardTiltMove(e: RPE<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const card = e.currentTarget;
  const inner = card.querySelector<HTMLElement>(".pcard-in");
  if (!inner) return;
  const r = card.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
  inner.style.setProperty("--rx", `${(0.5 - py) * 14}deg`);
  inner.style.setProperty("--ry", `${(px - 0.5) * 16}deg`);
  inner.style.setProperty("--gx", `${px * 100}%`);
  inner.style.setProperty("--gy", `${py * 100}%`);
  inner.style.setProperty("--px", ((px - 0.5) * 2).toFixed(3));
  inner.style.setProperty("--py", ((py - 0.5) * 2).toFixed(3));
}

export function pcardTiltLeave(e: RME<HTMLElement>) {
  const inner = e.currentTarget.querySelector<HTMLElement>(".pcard-in");
  ["--rx", "--ry", "--gx", "--gy", "--px", "--py"].forEach((p) => inner?.style.removeProperty(p));
}
