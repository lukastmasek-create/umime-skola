import Image from "next/image";
import { getAvatar } from "@/lib/avatars";
import { getAvatarStills } from "@/lib/avatars3d";
import { AvatarFrame } from "@/components/AvatarFrame";
import type { FrameId } from "@/lib/cosmetics";
import { darken, lighten } from "@/lib/color";

const INK = "#16132b";

function AvatarBase({
  id,
  size = 40,
  locked = false,
  icon,
}: {
  id: string | null | undefined;
  size?: number;
  locked?: boolean;
  icon?: string | null;
}) {
  const a = getAvatar(id);
  const filter = locked ? "grayscale(1) opacity(0.45)" : undefined;

  // Vlastní ikonka: snímek přebarvené postavy (src/lib/avatar-icon.ts).
  if (icon) {
    return (
      <span
        aria-hidden
        className="inline-block shrink-0 overflow-hidden rounded-full"
        style={{ width: size, height: size, background: a.bg, border: `${Math.max(1, size / 32)}px solid ${INK}`, filter }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" width={size} height={size} className="block h-full w-full" loading="lazy" />
      </span>
    );
  }

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

  const skinLight = lighten(a.skin, 0.4);
  const skinDark = darken(a.skin, 0.2);
  const inner = lighten(a.skin, 0.55);
  const gid = `av-${a.id}`;
  const animal = a.ears === "cat" || a.ears === "fox" || a.ears === "bear";
  const headPath =
    a.head === "box"
      ? "M21 15 H43 A9 9 0 0 1 52 24 V44 A9 9 0 0 1 43 53 H21 A9 9 0 0 1 12 44 V24 A9 9 0 0 1 21 15 Z"
      : a.head === "ghost"
        ? "M12 54 V34 a20 20 0 0 1 40 0 V54 l-7 -5 l-6.5 5 l-6.5 -5 l-6.5 5 l-6.5 -5 z"
        : "M12 34 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0 Z";
  const hasBody = a.head !== "ghost";
  const cloth = darken(a.bg, 0.45);

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-hidden
      style={{ filter, flexShrink: 0 }}
    >
      <defs>
        <clipPath id={`${gid}-disc`}>
          <circle cx="32" cy="32" r="31" />
        </clipPath>
        <clipPath id={`${gid}-head`}>
          <path d={headPath} />
        </clipPath>
        <radialGradient id={`${gid}-skin`} cx="38%" cy="30%" r="80%">
          <stop offset="0" stopColor={skinLight} />
          <stop offset="0.6" stopColor={a.skin} />
          <stop offset="1" stopColor={skinDark} />
        </radialGradient>
        <radialGradient id={`${gid}-bg`} cx="50%" cy="35%" r="70%">
          <stop offset="0" stopColor={lighten(a.bg, 0.45)} />
          <stop offset="1" stopColor={a.bg} />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill={`url(#${gid}-bg)`} />

      <g clipPath={`url(#${gid}-disc)`}>
        {/* ramena: vykukují zpoza hlavy, takže nic nevisí ve vzduchu */}
        {hasBody && (
          <>
            <path d="M5 66 Q6 51 21 49 H43 Q58 51 59 66 Z" fill={cloth} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <path d="M25 49 L32 57 L39 49" fill="none" stroke={lighten(cloth, 0.25)} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}

        {a.ears === "cat" && (
          <>
            <polygon points="12,31 14,9 31,20" fill={a.skin} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <polygon points="52,31 50,9 33,20" fill={a.skin} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <polygon points="16,26 17,14 26,20" fill="#ffb3c7" />
            <polygon points="48,26 47,14 38,20" fill="#ffb3c7" />
          </>
        )}
        {a.ears === "fox" && (
          <>
            <polygon points="12,33 13,8 31,21" fill={a.skin} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <polygon points="52,33 51,8 33,21" fill={a.skin} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <polygon points="15,27 15,14 24,20" fill={darken(a.skin, 0.55)} />
            <polygon points="49,27 49,14 40,20" fill={darken(a.skin, 0.55)} />
          </>
        )}
        {a.ears === "bear" && (
          <>
            <circle cx="16" cy="19" r="7.5" fill={a.skin} stroke={INK} strokeWidth="2" />
            <circle cx="48" cy="19" r="7.5" fill={a.skin} stroke={INK} strokeWidth="2" />
            <circle cx="16" cy="19" r="3.6" fill={inner} />
            <circle cx="48" cy="19" r="3.6" fill={inner} />
          </>
        )}
        {a.ears === "horns" && (
          <>
            <polygon points="17,26 13,9 29,19" fill="#ffd24d" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <polygon points="47,26 51,9 35,19" fill="#ffd24d" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <path d="M16 20 L15 13 M48 20 L49 13" stroke="#fff3b0" strokeWidth="1.6" strokeLinecap="round" />
          </>
        )}
        {a.ears === "hair" && (
          <>
            <polygon points="15,30 16,11 29,20" fill="#5b3a1a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <polygon points="24,22 32,6 40,22" fill="#5b3a1a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <polygon points="35,20 48,11 49,30" fill="#5b3a1a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          </>
        )}
        {a.ears === "antenna" && (
          <>
            <line x1="32" y1="20" x2="32" y2="8" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="32" cy="7" r="3.8" fill="#ff5a3c" stroke={INK} strokeWidth="2" />
            <circle cx="30.8" cy="5.8" r="1.1" fill="#fff" opacity="0.8" />
          </>
        )}

        <path d={headPath} fill={`url(#${gid}-skin)`} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="23" cy="23" rx="7" ry="3.4" fill="#fff" opacity="0.28" transform="rotate(-28 23 23)" />

        {a.head === "box" && (
          <>
            <circle cx="17" cy="20" r="1.4" fill={skinDark} stroke={INK} strokeWidth="0.8" />
            <circle cx="47" cy="20" r="1.4" fill={skinDark} stroke={INK} strokeWidth="0.8" />
            <circle cx="17" cy="48" r="1.4" fill={skinDark} stroke={INK} strokeWidth="0.8" />
            <circle cx="47" cy="48" r="1.4" fill={skinDark} stroke={INK} strokeWidth="0.8" />
          </>
        )}

        {animal && (
          <>
            <ellipse cx="32" cy="45" rx="10.5" ry="7.5" fill={inner} opacity="0.9" />
            <path d="M29.5 40 L34.5 40 L32 43.2 Z" fill={a.ears === "fox" ? INK : "#e6788f"} stroke={INK} strokeWidth="1" strokeLinejoin="round" />
          </>
        )}

        {/* čelenka a koruna sedí na hlavě, konce čelenky jsou připojené k uzlu */}
        {a.ears === "band" && (
          <>
            <g clipPath={`url(#${gid}-head)`}>
              <rect x="8" y="23" width="48" height="8" fill="#e5484d" />
              <line x1="8" y1="24.4" x2="56" y2="24.4" stroke="#ff8a8f" strokeWidth="1.2" />
            </g>
            <path d="M12 23 H52 M12 31 H52" stroke={INK} strokeWidth="2" clipPath={`url(#${gid}-head)`} />
            <polygon points="46,25 57,20 55,27 58,33 47,31" fill="#e5484d" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <circle cx="47" cy="27.5" r="3" fill="#c63a40" stroke={INK} strokeWidth="2" />
          </>
        )}
        {a.ears === "crown" && (
          <>
            <polygon
              points="17,24 18,9 25,16 32,6 39,16 46,9 47,24"
              fill="#ffc933"
              stroke={INK}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <line x1="17.5" y1="21" x2="46.5" y2="21" stroke={INK} strokeWidth="1.4" />
            <circle cx="32" cy="15" r="2" fill="#e5484d" stroke={INK} strokeWidth="0.8" />
            <circle cx="25" cy="18.5" r="1.3" fill="#3b82f6" />
            <circle cx="39" cy="18.5" r="1.3" fill="#2fb344" />
          </>
        )}

        {a.eyes === "dots" && (
          <>
            <ellipse cx="25" cy="35" rx="3" ry="3.4" fill={INK} />
            <ellipse cx="39" cy="35" rx="3" ry="3.4" fill={INK} />
            <circle cx="26" cy="33.8" r="1.1" fill="#fff" />
            <circle cx="40" cy="33.8" r="1.1" fill="#fff" />
          </>
        )}
        {a.eyes === "big" && (
          <>
            <circle cx="25" cy="34" r="5.8" fill="#fff" stroke={INK} strokeWidth="2" />
            <circle cx="39" cy="34" r="5.8" fill="#fff" stroke={INK} strokeWidth="2" />
            <circle cx="26" cy="35" r="2.8" fill={INK} />
            <circle cx="38" cy="35" r="2.8" fill={INK} />
            <circle cx="27" cy="33.8" r="1" fill="#fff" />
            <circle cx="39" cy="33.8" r="1" fill="#fff" />
          </>
        )}
        {a.eyes === "visor" && (
          <>
            <rect x="17" y="29" width="30" height="11" rx="5.5" fill={INK} />
            <circle cx="25" cy="34.5" r="2.8" fill="#22d3ee" />
            <circle cx="39" cy="34.5" r="2.8" fill="#22d3ee" />
            <path d="M20 31.5 H27" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          </>
        )}
        {a.eyes === "goggles" && (
          <>
            <rect x="12" y="31" width="40" height="5" rx="2" fill={INK} />
            <circle cx="24" cy="34" r="7.5" fill="#bff3ff" stroke={INK} strokeWidth="2.4" />
            <circle cx="40" cy="34" r="7.5" fill="#bff3ff" stroke={INK} strokeWidth="2.4" />
            <circle cx="25" cy="35" r="2.6" fill={INK} />
            <circle cx="39" cy="35" r="2.6" fill={INK} />
            <path d="M20 30.5 Q22 29 24.5 29.4" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
          </>
        )}
        {a.eyes === "one" && (
          <>
            <circle cx="32" cy="33" r="8" fill="#fff" stroke={INK} strokeWidth="2" />
            <circle cx="33" cy="34" r="3.8" fill={INK} />
            <circle cx="34.2" cy="32.6" r="1.2" fill="#fff" />
          </>
        )}
        {a.eyes === "sleepy" && (
          <>
            <path d="M20 35 q5 -5 10 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
            <path d="M34 35 q5 -5 10 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
          </>
        )}

        {a.eyes !== "visor" && a.eyes !== "goggles" && (
          <>
            <ellipse cx="17.5" cy="42" rx="3.6" ry="2.4" fill="#ff7d96" opacity="0.4" />
            <ellipse cx="46.5" cy="42" rx="3.6" ry="2.4" fill="#ff7d96" opacity="0.4" />
          </>
        )}

        {a.mouth === "smile" && <path d="M25 45 q7 7 14 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />}
        {a.mouth === "open" && (
          <>
            <ellipse cx="32" cy="47" rx="4.2" ry="4.7" fill={INK} />
            <ellipse cx="32" cy="49.2" rx="2.4" ry="1.7" fill="#ff7a8f" />
          </>
        )}
        {a.mouth === "flat" && <line x1="26" y1="47" x2="38" y2="47" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />}
        {a.mouth === "cat" && (
          <path d="M24 45 q4 5 8 0 q4 5 8 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {a.mouth === "teeth" && (
          <>
            <rect x="24" y="44" width="16" height="7" rx="2" fill="#fff" stroke={INK} strokeWidth="2" />
            <line x1="29" y1="44" x2="29" y2="51" stroke={INK} strokeWidth="1.5" />
            <line x1="35" y1="44" x2="35" y2="51" stroke={INK} strokeWidth="1.5" />
          </>
        )}
      </g>
      <circle cx="32" cy="32" r="31" fill="none" stroke={INK} strokeWidth="2" />
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
  icon?: string | null;
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
