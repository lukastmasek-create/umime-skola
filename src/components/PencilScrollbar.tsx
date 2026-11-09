"use client";

import { useEffect, useRef } from "react";

// Vlastní posuvník ve tvaru tužky. Nativní posuvník se schová třídou na <html> (viz globals.css),
// tužka jen zobrazuje polohu a jde za ni táhnout. Kolečko, klávesnice i dotyk dál řeší prohlížeč,
// takže se posouvá stejně jako dřív. Na dotykových zařízeních se nic nemění (zůstává nativní posuvník).
//
// Při jízdě dolů tužka píše (hrot zanechá šedou čáru), při jízdě nahoru guma čáru maže.
const THUMB_W = 16;
const THUMB_H = 96;
const TRACK_W = 40;
// Tužka je otočená hrotem nahoru. Hrot je kousek od horního okraje obrázku (průhledný okraj 24 z 288 px).
const TIP_Y = THUMB_H * (24 / 288);

export function PencilScrollbar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) return;

    const html = document.documentElement;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    const canvas = trailRef.current;
    if (!track || !thumb || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    html.classList.add("pencil-scroll");

    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const travel = () => Math.max(0, track.clientHeight - THUMB_H);

    // Stopa grafitu: hrot se pohybuje po stopě, guma ji maže. Stopa vede od horního okraje
    // až po hrot (při jízdě dolů) nebo po gumu (při jízdě nahoru).
    const drawTrail = (head: number) => {
      const dpr = window.devicePixelRatio || 1;
      const w = track.clientWidth;
      const h = track.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (head <= 0) return;

      const cx = w / 2;
      ctx.strokeStyle = "rgba(38, 38, 48, 0.82)";
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      // Mírně kolísavá čára, jako když píše ruka
      for (let y = 0; y <= head; y += 2) {
        const x = cx + Math.sin(y * 0.31) * 2.2 + Math.sin(y * 0.077) * 1.4;
        if (y === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const render = () => {
      const max = maxScroll();
      track.toggleAttribute("data-hidden", max <= 0);
      const progress = max > 0 ? window.scrollY / max : 0;
      const top = progress * travel();
      // Otočení o 180° kolem středu: hrot je nahoře
      thumb.style.transform = `translate3d(0, ${top}px, 0) rotate(180deg)`;

      // Stopa končí u hrotu: při jízdě dolů přibývá (píše se), nahoru ubývá (guma maže)
      drawTrail(top + TIP_Y);
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
      <canvas ref={trailRef} className="pencil-trail" />
      <div
        ref={thumbRef}
        className="pencil-thumb"
        style={{ width: THUMB_W, height: THUMB_H, left: (TRACK_W - THUMB_W) / 2 }}
      />
    </div>
  );
}
