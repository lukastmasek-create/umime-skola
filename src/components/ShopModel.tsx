// Animovaný 3D model z obchodu (vyrenderovaný v Blenderu, tools/blender/shop_models.py).
// Soubor public/shop-models/<id>.webp je smyčka, <id>.png první snímek pro lidi s vypnutými animacemi.
export function ShopModel({ id, size = 64, className = "" }: { id: string; size?: number; className?: string }) {
  return (
    <picture>
      <source media="(prefers-reduced-motion: reduce)" srcSet={`/shop-models/${id}.png`} />
      <img src={`/shop-models/${id}.webp`} alt="" aria-hidden width={size} height={size} loading="lazy" decoding="async" draggable={false} className={`inline-block select-none ${className}`} style={{ width: size, height: size }} />
    </picture>
  );
}
