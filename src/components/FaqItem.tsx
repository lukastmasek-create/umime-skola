"use client";

import { useRef, type MouseEvent } from "react";
import { prefersReducedMotion } from "@/lib/motion";

// Položka FAQ: nativní <details> (funguje i bez JS, čtečky ji znají), jen s plynulou animací výšky.
// Při kliknutí se výška animuje přes Web Animations API, odpověď se zároveň prolne a šipka se otočí.
export function FaqItem({ q, a }: { q: string; a: string }) {
  const el = useRef<HTMLDetailsElement>(null);
  const body = useRef<HTMLParagraphElement>(null);
  const anim = useRef<Animation | null>(null);
  const fade = useRef<Animation | null>(null);

  const closedHeight = (d: HTMLDetailsElement, summary: HTMLElement) => {
    const cs = getComputedStyle(d);
    return summary.offsetHeight + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
  };

  const finish = (d: HTMLDetailsElement, open: boolean) => {
    if (!open) d.open = false;
    d.removeAttribute("data-closing");
    d.style.height = d.style.overflow = "";
    anim.current = fade.current = null;
  };

  const run = (d: HTMLDetailsElement, from: number, to: number, open: boolean) => {
    d.style.overflow = "hidden";
    d.style.height = `${from}px`;
    anim.current = d.animate({ height: [`${from}px`, `${to}px`] }, { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
    fade.current = body.current?.animate(
      open
        ? [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }]
        : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-6px)" }],
      { duration: open ? 380 : 220, delay: open ? 90 : 0, easing: "ease-out", fill: "both" },
    ) ?? null;
    anim.current.onfinish = () => finish(d, open);
    anim.current.oncancel = () => { anim.current = null; };
  };

  const onClick = (e: MouseEvent<HTMLElement>) => {
    const d = el.current;
    if (!d || prefersReducedMotion()) return;
    e.preventDefault();
    const summary = e.currentTarget;
    const from = d.offsetHeight;
    anim.current?.cancel();
    fade.current?.cancel();
    if (!d.open || d.hasAttribute("data-closing")) {
      d.removeAttribute("data-closing");
      d.open = true;
      const to = d.scrollHeight + parseFloat(getComputedStyle(d).borderTopWidth) * 2;
      run(d, from, Math.max(to, from), true);
    } else {
      d.setAttribute("data-closing", "");
      run(d, from, closedHeight(d, summary), false);
    }
  };

  return (
    <details ref={el} className="faq-item">
      <summary onClick={onClick}>
        <span>{q}</span>
        <svg className="faq-chev" viewBox="0 0 20 20" width="20" height="20" aria-hidden focusable="false">
          <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <p ref={body} className="faq-a">{a}</p>
    </details>
  );
}
