// Trh nad uživatelským obchodem: řada animovaných stánků (umime-art/blender/obchod.py) na dlažbě,
// nad nimi houpavé vlaječky a lampiony. Čisté CSS, zdobí hlavičku obchodu.

const STALLS = ["mince", "truhla", "poklad", "truhla", "mince"] as const;

export function MarketBanner() {
  return (
    <div aria-hidden className="market-banner relative mb-6 overflow-hidden rounded-3xl border-2 border-[var(--edge)] shadow-[0_4px_0_var(--shadow-ink)]">
      <div className="market-bunting absolute inset-x-0 top-0 z-10 flex justify-around px-2">
        {Array.from({ length: 22 }, (_, i) => (
          <span key={i} className="market-flag block h-5 w-4 sm:h-7 sm:w-5" style={{ background: ["#ff5a7a", "#ffd23a", "#4ad0ff", "#7dff8a", "#c9a8ff"][i % 5], animationDelay: `${-(i % 7) * 0.35}s` }} />
        ))}
      </div>
      <div className="relative flex items-end justify-around px-2 pb-3 pt-10 sm:px-6 sm:pt-14">
        {STALLS.map((name, i) => (
          <span
            key={i}
            className={`globe-sprite block aspect-square w-[22%] drop-shadow-[0_6px_6px_rgba(0,0,0,0.35)] sm:w-[19%] ${i === 1 || i === 3 ? "-mb-1 scale-90" : ""} ${i === 2 ? "scale-110" : ""} ${i > 2 ? "max-sm:hidden" : ""}`}
            style={{ backgroundImage: `url(/home/obchod/stanek-${name}.webp)`, animationDelay: `${-i * 0.43}s` }}
          />
        ))}
      </div>
      <div className="market-cobbles absolute inset-x-0 bottom-0 h-6" />
    </div>
  );
}
