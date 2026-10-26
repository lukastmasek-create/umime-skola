"use client";

import { useState } from "react";
import type { FrameId } from "@/lib/cosmetics";

// Rámeček se kreslí přes avatar. SVG je o pětinu větší než avatar, aby ozdoby mohly
// přesahovat přes okraj kolečka.
// Rámeček z Blenderu (obrázek 1,2× větší než avatar); když se nenačte, vykreslí se SVG.
// Doba jedné otáčky rámečku v sekundách: těžší ozdoby se točí pomaleji.
const SPIN_SECONDS: Record<FrameId, number> = { gold: 26, rainbow: 10, neon: 18, leaf: 22, stars: 14, fire: 12 };

export function AvatarFrame({ id, size }: { id: FrameId; size: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <FrameSvg id={id} size={size} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/cosmetics/frames/${id}.webp`}
      alt=""
      aria-hidden
      width={size * 1.2}
      height={size * 1.2}
      onError={() => setFailed(true)}
      data-frame={id}
      className="frame-spin pointer-events-none absolute max-w-none"
      style={{ left: -size * 0.1, top: -size * 0.1, width: size * 1.2, height: size * 1.2, animationDuration: `${SPIN_SECONDS[id]}s` }}
    />
  );
}

function FrameSvg({ id, size }: { id: FrameId; size: number }) {
  const pad = size * 0.1;
  const star = (cx: number, cy: number, r: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.45;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`);
    }
    return pts.join(" ");
  };

  return (
    <svg
      viewBox="-6 -6 76 76"
      width={size * 1.2}
      height={size * 1.2}
      aria-hidden
      data-frame={id}
      className="frame-spin pointer-events-none absolute"
      style={{ left: -pad, top: -pad, overflow: "visible", animationDuration: `${SPIN_SECONDS[id]}s` }}
    >
      <defs>
        <linearGradient id="fr-rainbow" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff5d73" />
          <stop offset="0.25" stopColor="#ffd24d" />
          <stop offset="0.5" stopColor="#3ddc97" />
          <stop offset="0.75" stopColor="#5ab8ff" />
          <stop offset="1" stopColor="#b66dff" />
        </linearGradient>
        <linearGradient id="fr-fire" x1="0" y1="64" x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff3d3d" />
          <stop offset="1" stopColor="#ffb347" />
        </linearGradient>
        <filter id="fr-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
      </defs>

      {id === "gold" && (
        <>
          <circle cx="32" cy="32" r="31" fill="none" stroke="#e0a91e" strokeWidth="5" />
          <circle cx="32" cy="32" r="31" fill="none" stroke="#ffe27a" strokeWidth="2" strokeDasharray="30 12" />
          <circle cx="32" cy="32" r="28.2" fill="none" stroke="#8a5d10" strokeWidth="0.8" />
        </>
      )}
      {id === "rainbow" && <circle cx="32" cy="32" r="31" fill="none" stroke="url(#fr-rainbow)" strokeWidth="5" />}
      {id === "neon" && (
        <>
          <circle cx="32" cy="32" r="31" fill="none" stroke="#25f4ff" strokeWidth="7" opacity="0.55" filter="url(#fr-glow)" />
          <circle cx="32" cy="32" r="31" fill="none" stroke="#c8fbff" strokeWidth="2.4" />
          <circle cx="32" cy="32" r="28.6" fill="none" stroke="#ff4fd8" strokeWidth="1.4" opacity="0.9" />
        </>
      )}
      {id === "leaf" && (
        <>
          <circle cx="32" cy="32" r="31" fill="none" stroke="#3f8f47" strokeWidth="4" />
          {[0, 90, 180, 270, 45, 225].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 32 32)`}>
              <ellipse cx="32" cy="-1" rx="5" ry="9" fill="#6fd05f" stroke="#2f7a3a" strokeWidth="1.4" />
              <line x1="32" y1="-8" x2="32" y2="6" stroke="#2f7a3a" strokeWidth="1" />
            </g>
          ))}
        </>
      )}
      {id === "stars" && (
        <>
          <circle cx="32" cy="32" r="31" fill="none" stroke="#6c5cff" strokeWidth="4" />
          <circle cx="32" cy="32" r="31" fill="none" stroke="#b8b0ff" strokeWidth="1.4" strokeDasharray="2 6" />
          {[[32, -2, 6], [66, 32, 5], [32, 66, 6], [-2, 32, 5], [55, 9, 4], [9, 55, 4]].map(([x, y, r], i) => (
            <polygon key={i} points={star(x, y, r)} fill="#ffd24d" stroke="#b9831a" strokeWidth="1" />
          ))}
        </>
      )}
      {id === "fire" && (
        <>
          <circle cx="32" cy="32" r="31" fill="none" stroke="url(#fr-fire)" strokeWidth="5" />
          {[-60, -30, 0, 30, 60].map((deg, i) => (
            <path
              key={deg}
              transform={`rotate(${deg} 32 32)`}
              d={`M${28 + (i % 2)} 2 Q32 ${-12 - (i % 2) * 4} ${36 - (i % 2)} 2 Z`}
              fill={i % 2 ? "#ff8a3d" : "#ffd24d"}
              stroke="#d94a1f"
              strokeWidth="0.8"
            />
          ))}
        </>
      )}
    </svg>
  );
}
