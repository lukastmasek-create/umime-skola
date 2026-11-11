// Hravé SVG ikony (nálepky s pohupováním) z public/ikony/<název>.svg.
// Názvy: kategorie obchodu (cat-*), suroviny (wood, gold, ...), budovy (windmill, ...), předměty (matematika, ...),
// dlaždice her (farm, city, ...) a sekce škol (zakladni, stredni, prijimacky, maturita).
export function Icon({ name, size = 48, className = "", style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/ikony/${name}.svg`} alt="" aria-hidden width={size} height={size} loading="lazy" decoding="async" draggable={false} className={`inline-block select-none ${className}`} style={{ width: size, height: size, ...style }} />
  );
}
