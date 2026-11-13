import type { ShapeId } from "@/lib/animator/model";
import { CatSprite } from "@/components/scratch/ScratchIcons";

// Kreslené tvary v kresleném stylu webu: tmavý obrys, ploché barvy. Střed je v (0, 0), zhruba 40 px do každé strany.
const INK = "#16132b";
const stroke = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function starPath(outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / 5 - Math.PI / 2;
    pts.push(`${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}
const STAR = starPath(40, 18);

export function ShapeArt({ shape, color }: { shape: ShapeId; color: string }) {
  switch (shape) {
    case "cat":
      // Kočka je kreslená v měřítku ~1.4, aby seděla do stejné velikosti jako ostatní tvary.
      return (
        <g transform="scale(1.4)">
          <CatSprite pose={0} />
        </g>
      );
    case "star":
      return <path d={STAR} fill={color} {...stroke} />;
    case "heart":
      return (
        <path
          d="M0 34C-44 4-30-38 0-14 30-38 44 4 0 34z"
          fill={color}
          {...stroke}
        />
      );
    case "sun":
      return (
        <g>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return (
              <path
                key={i}
                d={`M${(Math.cos(a) * 30).toFixed(2)} ${(Math.sin(a) * 30).toFixed(2)}L${(Math.cos(a) * 42).toFixed(2)} ${(Math.sin(a) * 42).toFixed(2)}`}
                {...stroke}
                strokeWidth={4}
              />
            );
          })}
          <circle r="24" fill={color} {...stroke} />
          <circle cx="-8" cy="-8" r="5" fill="#fffaf0" opacity={0.7} />
        </g>
      );
    case "ball":
      return (
        <g>
          <circle r="34" fill={color} {...stroke} />
          <path d="M-22 -4C-16-20-4-26 6-26" fill="none" stroke="#fffaf0" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
        </g>
      );
  }
}

// Malá ikona tvaru do výběru.
export function ShapeIcon({ shape, color, size = 40 }: { shape: ShapeId; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" aria-hidden focusable="false">
      <ShapeArt shape={shape} color={color} />
    </svg>
  );
}
