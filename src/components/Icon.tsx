import type { CSSProperties } from "react";
import { iconParts } from "@/lib/icons";

// Hravé ikony (nálepky s pohupováním) z public/ikony/<název>.webp (zdroj: <název>.svg, převod viz docs/ICONS_WEBP.md).
// Názvy: kategorie obchodu (cat-*), suroviny (wood, gold, ...), budovy (windmill, ...), předměty (matematika, ...),
// dlaždice her (farm, city, ...) a sekce škol (zakladni, stredni, prijimacky, maturita).
// Obal drží velikost (třída/style), uvnitř je stín (CSS), pohupující se tělo a třpytky; animace jsou v globals.css.
// `alt` jen u ikony, která nese informaci; jinak je dekorativní. `fluid`: velikost určuje jen className.
export function Icon({ name, size = 48, className = "", style, alt, fluid = false }: { name: string; size?: number; className?: string; style?: CSSProperties; alt?: string; fluid?: boolean }) {
  const p = iconParts(name);
  const a11y = alt ? ({ role: "img", "aria-label": alt } as const) : ({ "aria-hidden": true } as const);
  return (
    <span {...a11y} className={`ik inline-block select-none ${className}`} style={fluid ? style : { width: size, height: size, ...style }}>
      {p.shadow && <i className="ik-sh" style={p.shadow} />}
      <span className={p.bob ? "ik-bob ik-b" : "ik-bob"}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.body} alt="" loading="lazy" decoding="async" draggable={false} />
        {p.sparkles.map((s) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={s.src} className="ik-tw" src={s.src} alt="" loading="lazy" decoding="async" draggable={false} style={s.style as CSSProperties} />
        ))}
      </span>
    </span>
  );
}
