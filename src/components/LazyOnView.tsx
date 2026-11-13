"use client";

import { useEffect, useRef, useState } from "react";

// Obsah se vykreslí (a načte data, obrázky a animace), až když je kousek od obrazovky (250 px pod ni).
// Jakmile se jednou vykreslí, zůstane připojený. Dřív se při odchodu z obrazovky odpojoval a při návratu
// znovu vykresloval, což u plátna a WebGL znamenalo znovu vytvářet kontexty a načítat data a způsobovalo
// trhání při scrollu. Držák má výšku odhadu, dokud se obsah nevykreslí, takže se stránka nehýbe.
// Kotvy (id) zůstávají v HTML, odkazy na sekci tedy fungují i před vykreslením.

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

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === "undefined") {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "250px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  const minHeight = near ? style?.minHeight : placeholderHeight;

  return (
    <div ref={ref} id={id} className={className} style={{ ...style, minHeight }} aria-busy={!near}>
      {near ? children : null}
    </div>
  );
}
