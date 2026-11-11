"use client";

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { HANG_COLORS, HangIcon } from "./HangDecor";

const TAG_ICONS = ["search", "pulse", "check", "bug", "flag"] as const;

// Zavěšené štítky: dají se chytit myší/prstem a rozhoupat; při silném zatažení se nit přetrhne
// a štítek spadne. Za chvíli se shora vrátí (přebírá ho zpět CSS animace).
type Mode = "held" | "swing" | "free";
type S = {
  mode: Mode; el: HTMLElement; sway: HTMLElement; tag: HTMLElement;
  px: number; py: number; L: number; th: number; w: number;
  lastPx: number; lastPy: number; lastPt: number; pvx: number; pvy: number;
  tx: number; ty: number; vx: number; vy: number; spin: number; spinV: number; age: number;
};

const G = 1800; // px/s² (kyvadlo)
const DAMP = 1.5;
const TEAR = 110; // o kolik px za délku nitě se musí zatáhnout, aby se přetrhla

export function HangTags({ tags }: { tags: string[] }) {
  const states = useRef<Map<number, S>>(new Map());
  const raf = useRef(0);
  const last = useRef(0);

  const release = (i: number, s: S, delay: string) => {
    s.el.classList.remove("is-held", "is-swing", "is-free");
    s.el.style.removeProperty("transform");
    s.el.style.removeProperty("opacity");
    s.el.style.removeProperty("--tn");
    s.sway.style.removeProperty("transform");
    s.tag.style.removeProperty("transform");
    s.el.style.setProperty("--d", delay);
    states.current.delete(i);
  };

  const step = (i: number, s: S, dt: number) => {
    if (s.mode === "swing") {
      s.w += (-(G / s.L) * Math.sin(s.th) - DAMP * s.w) * dt;
      s.th += s.w * dt;
    } else if (s.mode === "free") {
      s.age += dt;
      s.vy += 2400 * dt;
      s.tx += s.vx * dt;
      s.ty += s.vy * dt;
      s.spin += s.spinV * dt;
    }
  };

  const frame = (t: number) => {
    const real = Math.min(0.25, (t - (last.current || t)) / 1000); // reálný čas; fyzika se dělí na krátké kroky
    last.current = t;
    states.current.forEach((s, i) => {
      if (s.mode === "held") return;
      for (let n = Math.ceil(real / 0.008), dt = real / Math.max(1, n); n > 0; n--) step(i, s, dt);
      if (s.mode === "swing") {
        s.sway.style.transform = `rotate(${s.th}rad)`;
        if (Math.abs(s.th) < 0.02 && Math.abs(s.w) < 0.06) release(i, s, "-5s"); // klidná fáze cyklu
      } else {
        s.el.style.transform = `translate(${s.tx}px, ${s.ty}px)`;
        s.tag.style.transform = `translateX(-50%) rotate(calc(var(--tr, 0deg) + ${s.spin}rad))`;
        if (s.age > 0.8) s.el.style.opacity = String(Math.max(0, 1 - (s.age - 0.8) / 0.5));
        if (s.age > 1.4 || s.ty > 560) release(i, s, "0s"); // spadl: znovu přilétne shora
      }
    });
    if (states.current.size) raf.current = requestAnimationFrame(frame);
    else { raf.current = 0; last.current = 0; }
  };
  const kick = () => { if (!raf.current) raf.current = requestAnimationFrame(frame); };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const down = (i: number) => (e: RPE<HTMLElement>) => {
    const el = e.currentTarget.closest(".hang-str") as HTMLElement | null;
    if (!el || states.current.get(i)?.mode === "free") return;
    const sway = el.querySelector(".hang-sway") as HTMLElement;
    const tag = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    // právě přilétá nebo padá: nejde chytit (měří se vlastní posun, takže nenaklonění panelu nevadí)
    if (Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).f) > 8) return;
    const m = new DOMMatrixReadOnly(getComputedStyle(sway).transform);
    const th = Math.atan2(m.b, m.a);
    let s = states.current.get(i);
    if (!s) {
      s = {
        mode: "held", el, sway, tag, px: r.left + 0.5, py: r.top, L: r.height + 20, th, w: 0,
        lastPx: e.clientX, lastPy: e.clientY, lastPt: e.timeStamp, pvx: 0, pvy: 0,
        tx: 0, ty: 0, vx: 0, vy: 0, spin: 0, spinV: 0, age: 0,
      };
      states.current.set(i, s);
      sway.style.transform = `rotate(${th}rad)`;
    }
    s.mode = "held"; s.w = 0;
    el.classList.remove("is-swing");
    el.classList.add("is-held");
    tag.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const move = (i: number) => (e: RPE<HTMLElement>) => {
    const s = states.current.get(i);
    if (!s || s.mode !== "held") return;
    const dx = e.clientX - s.px, dy = e.clientY - s.py;
    const dist = Math.hypot(dx, dy);
    let th = Math.atan2(-dx, dy);
    while (th - s.th > Math.PI) th -= 2 * Math.PI;
    while (th - s.th < -Math.PI) th += 2 * Math.PI;
    const dtp = Math.max(0.001, (e.timeStamp - s.lastPt) / 1000);
    s.w = s.w * 0.6 + ((th - s.th) / dtp) * 0.4;
    s.pvx = s.pvx * 0.6 + ((e.clientX - s.lastPx) / dtp) * 0.4;
    s.pvy = s.pvy * 0.6 + ((e.clientY - s.lastPy) / dtp) * 0.4;
    s.lastPx = e.clientX; s.lastPy = e.clientY; s.lastPt = e.timeStamp;
    s.th = th;
    s.sway.style.transform = `rotate(${th}rad)`;
    const tn = Math.max(0, Math.min(1, (dist - s.L) / TEAR));
    s.el.style.setProperty("--tn", String(tn));
    if (tn >= 1) { // přetrženo
      s.mode = "free";
      s.vx = Math.max(-1800, Math.min(1800, s.pvx));
      s.vy = Math.max(-1800, Math.min(1800, s.pvy));
      s.spinV = Math.max(-8, Math.min(8, s.w * 0.6 + s.pvx / 400));
      s.el.classList.remove("is-held");
      s.el.classList.add("is-free");
      s.tag.releasePointerCapture?.(e.pointerId);
      burst(e.clientX, e.clientY, getComputedStyle(s.el).getPropertyValue("--tc").trim() || "#ffc933");
      kick();
    }
  };

  const up = (i: number) => (e: RPE<HTMLElement>) => {
    const s = states.current.get(i);
    if (!s || s.mode !== "held") return;
    s.mode = "swing";
    s.w = Math.max(-9, Math.min(9, s.w));
    s.el.classList.remove("is-held");
    s.el.classList.add("is-swing");
    s.el.style.setProperty("--tn", "0");
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    kick();
  };

  return (
    <div className="hang-tags">
      <svg width="0" height="0" className="hang-defs" aria-hidden focusable="false">
        <defs>
          <filter id="hang-rough" x="-6%" y="-12%" width="112%" height="128%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d" />
            <feMorphology in="d" operator="dilate" radius="1.2" result="o" />
            <feFlood floodColor="#0a0918" />
            <feComposite in2="o" operator="in" result="ink" />
            <feMerge><feMergeNode in="ink" /><feMergeNode in="d" /></feMerge>
          </filter>
          {/* propletený provaz: dva prameny se střídavě překrývají; vzor se opakuje po šesti pixelech */}
          <pattern id="hang-rope" width="8" height="6" patternUnits="userSpaceOnUse">
            {[-6, 0, 6].map((o) => (
              <g key={o} transform={`translate(0 ${o})`} strokeLinecap="round" fill="none">
                <path d="M-2 10L10 2" stroke="#14132a" strokeWidth="4.6" />
                <path d="M-2 7L10 -1" stroke="#14132a" strokeWidth="4.6" />
                <path d="M-2 10L10 2" stroke="#a37a45" strokeWidth="3" />
                <path d="M-2 7L10 -1" stroke="#dcb77c" strokeWidth="3" />
                <path d="M-2 6.3L10 -1.7" stroke="#f6e4bb" strokeWidth="0.9" opacity=".85" />
              </g>
            ))}
          </pattern>
        </defs>
      </svg>
      {tags.map((tag, i) => (
        <div key={tag} className={`hang-str hang-str-${i + 1}`} style={{ ["--tc" as string]: HANG_COLORS[i % HANG_COLORS.length] }}>
          <div className="hang-sway">
            <svg className="hang-rope" width="8" height="100%" aria-hidden focusable="false"><rect width="8" height="100%" fill="url(#hang-rope)" /></svg>
            <span className="hang-tag" onPointerDown={down(i)} onPointerMove={move(i)} onPointerUp={up(i)} onPointerCancel={up(i)}>
              <TagCard text={tag} kind={TAG_ICONS[i % TAG_ICONS.length]} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Jeden štítek nakreslený celý v SVG: nerovně vystřižená karta, tři tóny, očko na nit a ikona v čtverečku.
function TagCard({ text, kind }: { text: string; kind: (typeof TAG_ICONS)[number] }) {
  const t = useRef<SVGTextElement>(null);
  const [tw, setTw] = useState(() => text.length * 8.4);
  useLayoutEffect(() => {
    const w = t.current?.getComputedTextLength?.();
    if (w && Math.abs(w - tw) > 0.5) setTw(w);
  }, [text, tw]);
  const W = Math.ceil(tw) + 58, H = 50, c = W / 2;
  return (
    <svg className="hang-card" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label={text} role="img">
      <rect x="6" y="10" width={W - 6} height="36" rx="11" fill="#000" opacity=".5" />
      <g filter="url(#hang-rough)">
        <rect x="3" y="6" width={W - 6} height="36" rx="11" style={{ fill: "color-mix(in srgb, var(--tc) 17%, #141329)" }} stroke="rgba(244,239,227,.8)" strokeWidth="2" />
        <path d={`M5 17a11 11 0 0 1 11-9h${W - 32}a11 11 0 0 1 11 9z`} fill="#fff" opacity=".1" />
        <path d={`M3 31H${W - 3}A11 11 0 0 1 ${W - 14} 42H14A11 11 0 0 1 3 31Z`} fill="#000" opacity=".25" />
        <rect x="9" y="12" width="26" height="26" rx="8" style={{ fill: "var(--tc)" }} stroke="rgba(244,239,227,.85)" strokeWidth="2" />
        <path d="M11 20a8 8 0 0 1 8-6h8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".5" />
        <HangIcon kind={kind} size={18} x={13} y={16} style={{ color: "#14132a" }} />
        <text ref={t} x="43" y="29.5" fontSize="14" fontWeight="800" fill="#f4f3ff" fontFamily="var(--font-heading), system-ui, sans-serif">{text}</text>
        <circle cx={c} cy="7" r="5" fill="#f4efe3" stroke="#14132a" strokeWidth="1.6" />
        <circle cx={c} cy="7" r="2" fill="#14132a" />
      </g>
    </svg>
  );
}

// Při utržení se rozlétnou malé SVG hvězdičky v barvě štítku.
function burst(x: number, y: number, color: string) {
  const ns = "http://www.w3.org/2000/svg";
  for (let i = 0; i < 14; i++) {
    const size = 8 + Math.random() * 12;
    const sv = document.createElementNS(ns, "svg");
    sv.setAttribute("viewBox", "0 0 24 24");
    sv.setAttribute("width", String(size)); sv.setAttribute("height", String(size));
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", "M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z");
    p.setAttribute("fill", i % 3 ? color : "#fff");
    sv.appendChild(p);
    Object.assign(sv.style, { position: "fixed", left: `${x}px`, top: `${y}px`, pointerEvents: "none", zIndex: "9999" });
    document.body.appendChild(sv);
    const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 100;
    sv.animate(
      [
        { transform: "translate(-50%,-50%) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + 50}px) scale(0.1) rotate(${Math.random() * 360}deg)`, opacity: 0 },
      ],
      { duration: 600 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.3,1)" },
    ).onfinish = () => sv.remove();
  }
}
