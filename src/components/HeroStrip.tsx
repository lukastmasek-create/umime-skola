import type { CSSProperties } from "react";

// Animovaný pás snímků z Blenderu (public/home/<dir>/<name>.webp, snímky vedle sebe, čtvercové).
// Při omezeném pohybu se animace zastaví na prvním snímku (pravidlo .anim-strip v globals.css).
export function HeroStrip({
  src,
  frames,
  size,
  seconds = 4,
  className = "",
}: {
  src: string;
  frames: number;
  size: number;
  seconds?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`anim-strip hs-strip ${className}`}
      style={
        {
          width: size,
          height: size,
          backgroundImage: `url(${src})`,
          backgroundSize: `${size * frames}px ${size}px`,
          "--fw": `${size}px`,
          "--n": frames,
          animationTimingFunction: `steps(${frames})`,
          animationDuration: `${seconds}s`,
        } as CSSProperties
      }
    />
  );
}
