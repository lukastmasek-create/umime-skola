"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useRef, useState } from "react";

// Číslo, které se napočítá, až vjede do pohledu. Nula se naopak odpočítá z 99 („0 reklam“).
// Bez JS, při omezení pohybu i s vypnutými animacemi ukazuje rovnou cílovou hodnotu.
function motionOff() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "off";
}

export function HomeCountUp({ value, className, delay = 0 }: { value: number; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || motionOff()) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // už je vidět: nepřeskakovat
    setShown(value === 0 ? 99 : 0);
    setArmed(true);
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        timer = window.setTimeout(() => {
          setShown(value);
          el.classList.add("is-done");
        }, delay);
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  return (
    <span ref={ref} className={`hp-count${armed ? " is-armed" : ""}${className ? ` ${className}` : ""}`}>
      <NumberFlow
        value={shown}
        trend={value === 0 ? -1 : 1}
        spinTiming={{ duration: 1100, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        transformTiming={{ duration: 700, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      />
    </span>
  );
}
