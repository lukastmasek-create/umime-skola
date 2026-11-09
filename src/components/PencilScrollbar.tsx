"use client";

import { useEffect, useRef } from "react";

// Vlastní posuvník ve tvaru tužky. Nativní posuvník se schová třídou na <html> (viz globals.css),
// tužka jen zobrazuje polohu a jde za ni táhnout. Kolečko, klávesnice i dotyk dál řeší prohlížeč,
// takže se posouvá stejně jako dřív. Na dotykových zařízeních se nic nemění (zůstává nativní posuvník).
const THUMB_H = 72;
const TRACK_W = 16;

export function PencilScrollbar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) return;

    const html = document.documentElement;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    html.classList.add("pencil-scroll");

    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const travel = () => Math.max(0, track.clientHeight - THUMB_H);

    const render = () => {
      const max = maxScroll();
      track.toggleAttribute("data-hidden", max <= 0);
      const progress = max > 0 ? window.scrollY / max : 0;
      thumb.style.transform = `translate3d(0, ${progress * travel()}px, 0)`;
    };

    let frame = 0;
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          render();
        });
      }
    };

    // Táhnutí jezdce: přepočet pohybu myši na posun stránky
    let drag: { startY: number; startScroll: number } | null = null;
    const onThumbDown = (e: PointerEvent) => {
      e.preventDefault();
      thumb.setPointerCapture(e.pointerId);
      thumb.setAttribute("data-dragging", "");
      drag = { startY: e.clientY, startScroll: window.scrollY };
    };
    const onThumbMove = (e: PointerEvent) => {
      if (!drag) return;
      const ratio = travel() > 0 ? maxScroll() / travel() : 0;
      window.scrollTo({ top: drag.startScroll + (e.clientY - drag.startY) * ratio, behavior: "auto" });
    };
    const onThumbUp = (e: PointerEvent) => {
      drag = null;
      thumb.removeAttribute("data-dragging");
      if (thumb.hasPointerCapture(e.pointerId)) thumb.releasePointerCapture(e.pointerId);
    };

    // Klik na dráhu vedle jezdce posune o stránku, stejně jako nativní posuvník
    const onTrackDown = (e: PointerEvent) => {
      if (e.target === thumb) return;
      const thumbTop = thumb.getBoundingClientRect().top;
      const dir = e.clientY < thumbTop ? -1 : 1;
      window.scrollBy({ top: dir * window.innerHeight * 0.9, behavior: "smooth" });
    };

    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    thumb.addEventListener("pointerdown", onThumbDown);
    thumb.addEventListener("pointermove", onThumbMove);
    thumb.addEventListener("pointerup", onThumbUp);
    thumb.addEventListener("pointercancel", onThumbUp);
    track.addEventListener("pointerdown", onTrackDown);

    return () => {
      html.classList.remove("pencil-scroll");
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      thumb.removeEventListener("pointerdown", onThumbDown);
      thumb.removeEventListener("pointermove", onThumbMove);
      thumb.removeEventListener("pointerup", onThumbUp);
      thumb.removeEventListener("pointercancel", onThumbUp);
      track.removeEventListener("pointerdown", onTrackDown);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={trackRef} className="pencil-track" style={{ width: TRACK_W }} aria-hidden="true">
      <div ref={thumbRef} className="pencil-thumb" style={{ height: THUMB_H }} />
    </div>
  );
}
