"use client";

import { useEffect, useRef, useState } from "react";

// Obsah se vykreslí (a načte data, obrázky a animace), až když se blíží k obrazovce. Když se od ní
// vzdálí, odpojí se a zůstane jen držák se stejnou výškou, takže se stránka nehýbe. Kotvy (id) zůstávají
// v HTML, odkazy na sekci tedy fungují i před vykreslením.
//
// Dva pozorovatele s hysterezí: vstup při 600 px pod/nad obrazovkou, odchod až při 1200 px. Bez toho by
// se obsah na hraně obrazovky stále zapínal a vypínal.

type Props = {
  children: React.ReactNode;
  /** Výška držáku, dokud obsah není vykreslený (odhad, aby se stránka při načtení nehýbala). */
  placeholderHeight?: number;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function LazyOnView({ children, placeholderHeight = 320, id, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setNear(true);
      return;
    }
    const enter = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true);
      },
      { rootMargin: "600px 0px" },
    );
    const leave = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) return;
        // Výšku zapamatuji ještě při vykreslených dětech, držák pak nemění velikost stránky.
        if (el.offsetHeight) setHeight(el.offsetHeight);
        setNear(false);
      },
      { rootMargin: "1200px 0px" },
    );
    enter.observe(el);
    leave.observe(el);
    return () => {
      enter.disconnect();
      leave.disconnect();
    };
  }, []);

  const minHeight = near ? style?.minHeight : height || placeholderHeight;

  return (
    <div ref={ref} id={id} className={className} style={{ ...style, minHeight }} aria-busy={!near}>
      {near ? children : null}
    </div>
  );
}
