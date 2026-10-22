import Image from "next/image";
import { getAvatar } from "@/lib/avatars";
import { getAvatarStills } from "@/lib/avatars3d";
import { AvatarFrame } from "@/components/AvatarFrame";
import type { FrameId } from "@/lib/cosmetics";

const INK = "#16132b";

function AvatarBase({
  id,
  size = 40,
  locked = false,
}: {
  id: string | null | undefined;
  size?: number;
  locked?: boolean;
}) {
  const a = getAvatar(id);
  const filter = locked ? "grayscale(1) opacity(0.45)" : undefined;

  // Avatary s 3D postavou mají portrét vyrenderovaný z modelu; kolečko, barva a obrys zůstávají.
  const stills = getAvatarStills(a.id);
  if (stills) {
    return (
      <span
        aria-hidden
        className="inline-block shrink-0 overflow-hidden rounded-full"
        style={{ width: size, height: size, background: a.bg, border: `${Math.max(1, size / 32)}px solid ${INK}`, filter }}
      >
        <Image src={stills.portrait} alt="" width={size} height={size} unoptimized className="block h-full w-full" />
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-hidden
      style={{ filter, flexShrink: 0 }}
    >
      <circle cx="32" cy="32" r="31" fill={a.bg} stroke={INK} strokeWidth="2" />

      {a.ears === "cat" && (
        <>
          <polygon points="14,26 16,8 29,18" fill={a.skin} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <polygon points="50,26 48,8 35,18" fill={a.skin} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </>
      )}
      {a.ears === "fox" && (
        <>
          <polygon points="13,28 14,5 30,18" fill={a.skin} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <polygon points="51,28 50,5 34,18" fill={a.skin} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </>
      )}
      {a.ears === "bear" && (
        <>
          <circle cx="16" cy="18" r="7" fill={a.skin} stroke={INK} strokeWidth="2" />
          <circle cx="48" cy="18" r="7" fill={a.skin} stroke={INK} strokeWidth="2" />
        </>
      )}
      {a.ears === "horns" && (
        <>
          <polygon points="17,22 12,6 27,16" fill="#ffd24d" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <polygon points="47,22 52,6 37,16" fill="#ffd24d" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </>
      )}
      {a.ears === "hair" && (
        <>
          <polygon points="18,24 20,8 27,19" fill="#5b3a1a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <polygon points="27,18 32,4 38,18" fill="#5b3a1a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <polygon points="37,19 44,8 46,24" fill="#5b3a1a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </>
      )}
      {a.ears === "antenna" && (
        <>
          <line x1="32" y1="14" x2="32" y2="5" stroke={INK} strokeWidth="2" />
          <circle cx="32" cy="5" r="3.5" fill="#ff5a3c" stroke={INK} strokeWidth="2" />
        </>
      )}

      {a.head === "box" && <rect x="12" y="15" width="40" height="38" rx="9" fill={a.skin} stroke={INK} strokeWidth="2" />}
      {a.head === "round" && <circle cx="32" cy="35" r="21" fill={a.skin} stroke={INK} strokeWidth="2" />}
      {a.head === "ghost" && (
        <path
          d="M12 54 V34 a20 20 0 0 1 40 0 V54 l-7 -5 l-6.5 5 l-6.5 -5 l-6.5 5 l-6.5 -5 z"
          fill={a.skin}
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}

      {a.ears === "band" && (
        <>
          <rect x="11" y="24" width="42" height="8" rx="2" fill="#e5484d" stroke={INK} strokeWidth="2" />
          <polygon points="53,28 61,22 59,32" fill="#e5484d" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </>
      )}
      {a.ears === "crown" && (
        <polygon
          points="17,19 20,6 27,14 32,4 37,14 44,6 47,19"
          fill="#ffc933"
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}

      {a.eyes === "dots" && (
        <>
          <circle cx="25" cy="35" r="2.8" fill={INK} />
          <circle cx="39" cy="35" r="2.8" fill={INK} />
        </>
      )}
      {a.eyes === "big" && (
        <>
          <circle cx="25" cy="34" r="5.5" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="39" cy="34" r="5.5" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="26" cy="35" r="2.3" fill={INK} />
          <circle cx="38" cy="35" r="2.3" fill={INK} />
        </>
      )}
      {a.eyes === "visor" && (
        <>
          <rect x="18" y="29" width="28" height="10" rx="5" fill={INK} />
          <circle cx="25" cy="34" r="2.6" fill="#22d3ee" />
          <circle cx="39" cy="34" r="2.6" fill="#22d3ee" />
        </>
      )}
      {a.eyes === "goggles" && (
        <>
          <rect x="11" y="31" width="42" height="5" rx="2" fill={INK} />
          <circle cx="24" cy="34" r="7.5" fill="#bff3ff" stroke={INK} strokeWidth="2.4" />
          <circle cx="40" cy="34" r="7.5" fill="#bff3ff" stroke={INK} strokeWidth="2.4" />
          <circle cx="25" cy="35" r="2.4" fill={INK} />
          <circle cx="39" cy="35" r="2.4" fill={INK} />
        </>
      )}
      {a.eyes === "one" && (
        <>
          <circle cx="32" cy="33" r="8" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="33" cy="34" r="3.4" fill={INK} />
        </>
      )}
      {a.eyes === "sleepy" && (
        <>
          <path d="M20 35 q5 -5 10 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M34 35 q5 -5 10 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}

      {a.mouth === "smile" && <path d="M25 44 q7 7 14 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />}
      {a.mouth === "open" && <ellipse cx="32" cy="46" rx="4" ry="4.5" fill={INK} />}
      {a.mouth === "flat" && <line x1="26" y1="46" x2="38" y2="46" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />}
      {a.mouth === "cat" && (
        <path d="M24 44 q4 5 8 0 q4 5 8 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {a.mouth === "teeth" && (
        <>
          <rect x="24" y="43" width="16" height="7" rx="2" fill="#fff" stroke={INK} strokeWidth="2" />
          <line x1="29" y1="43" x2="29" y2="50" stroke={INK} strokeWidth="1.5" />
          <line x1="35" y1="43" x2="35" y2="50" stroke={INK} strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
}

// Avatar s volitelným rámečkem z obchodu. Bez rámečku se vykreslí beze změny.
export function Avatar({
  frame,
  ...props
}: {
  id: string | null | undefined;
  size?: number;
  locked?: boolean;
  frame?: FrameId | null;
}) {
  if (!frame) return <AvatarBase {...props} />;
  const size = props.size ?? 40;
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <AvatarBase {...props} />
      <AvatarFrame id={frame} size={size} />
    </span>
  );
}
