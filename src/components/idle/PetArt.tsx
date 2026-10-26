import type { SpeciesId } from "@/lib/idle/pets";

const INK = "#16132b";

type Look = { skin: string; belly: string; accent: string };

const LOOKS: Record<SpeciesId, Look> = {
  cat: { skin: "#ffb26b", belly: "#ffe3c4", accent: "#ff8a4a" },
  dog: { skin: "#d9a066", belly: "#f6e1c3", accent: "#8a5a2b" },
  bunny: { skin: "#f5f2f7", belly: "#ffffff", accent: "#ffb3c7" },
  fox: { skin: "#ff8a3d", belly: "#fff1de", accent: "#3a2a22" },
  dragon: { skin: "#44c27a", belly: "#b8f0cd", accent: "#ffd24d" },
  hamster: { skin: "#f0b878", belly: "#fff3e0", accent: "#ffb3a0" },
  panda: { skin: "#fbfbfb", belly: "#ffffff", accent: "#2a2a35" },
  penguin: { skin: "#34406b", belly: "#ffffff", accent: "#ffb020" },
  frog: { skin: "#6fcf5a", belly: "#d6f5b8", accent: "#ff7a8f" },
  unicorn: { skin: "#fff0fa", belly: "#ffffff", accent: "#c9a8ff" },
  robot: { skin: "#b9c7d8", belly: "#e6edf5", accent: "#ff5a3c" },
};

export type PetMood = "happy" | "ok" | "sad" | "hungry";

export function PetArt({
  species,
  stage,
  mood,
  maxed = false,
  size = 200,
  accessory = null,
}: {
  species: SpeciesId;
  stage: 1 | 2 | 3;
  mood: PetMood;
  maxed?: boolean;
  size?: number;
  accessory?: string | null;
}) {
  const look = LOOKS[species];
  const scale = stage === 1 ? 0.78 : stage === 2 ? 0.9 : 1;
  const stroke = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

  const eyes =
    mood === "happy" ? (
      <>
        <path d="M44 52 Q49 45 54 52" fill="none" {...stroke} />
        <path d="M66 52 Q71 45 76 52" fill="none" {...stroke} />
      </>
    ) : (
      <>
        <circle cx="49" cy="52" r="4.2" fill={INK} />
        <circle cx="71" cy="52" r="4.2" fill={INK} />
        <circle cx="50.4" cy="50.6" r="1.4" fill="#fff" />
        <circle cx="72.4" cy="50.6" r="1.4" fill="#fff" />
        {mood === "sad" && (
          <>
            <path d="M42 44 L55 47" fill="none" {...stroke} />
            <path d="M78 44 L65 47" fill="none" {...stroke} />
          </>
        )}
      </>
    );

  const mouth =
    mood === "happy" ? (
      <path d="M52 62 Q60 71 68 62" fill="#ff7a8f" {...stroke} />
    ) : mood === "sad" ? (
      <path d="M53 67 Q60 60 67 67" fill="none" {...stroke} />
    ) : mood === "hungry" ? (
      <ellipse cx="60" cy="65" rx="5" ry="6" fill="#7a2638" {...stroke} />
    ) : (
      <path d="M54 64 Q60 67 66 64" fill="none" {...stroke} />
    );

  const ears = {
    cat: (
      <>
        <polygon points="38,40 40,16 56,32" fill={look.skin} {...stroke} />
        <polygon points="82,40 80,16 64,32" fill={look.skin} {...stroke} />
        <polygon points="42,34 43,23 51,31" fill="#ffb3c7" />
        <polygon points="78,34 77,23 69,31" fill="#ffb3c7" />
      </>
    ),
    dog: (
      <>
        <ellipse cx="38" cy="48" rx="9" ry="17" fill={look.accent} {...stroke} transform="rotate(14 38 48)" />
        <ellipse cx="82" cy="48" rx="9" ry="17" fill={look.accent} {...stroke} transform="rotate(-14 82 48)" />
      </>
    ),
    bunny: (
      <>
        <ellipse cx="47" cy="22" rx="8" ry="22" fill={look.skin} {...stroke} transform="rotate(-8 47 22)" />
        <ellipse cx="73" cy="22" rx="8" ry="22" fill={look.skin} {...stroke} transform="rotate(8 73 22)" />
        <ellipse cx="47" cy="24" rx="3.6" ry="15" fill={look.accent} transform="rotate(-8 47 24)" />
        <ellipse cx="73" cy="24" rx="3.6" ry="15" fill={look.accent} transform="rotate(8 73 24)" />
      </>
    ),
    fox: (
      <>
        <polygon points="37,42 37,14 56,31" fill={look.skin} {...stroke} />
        <polygon points="83,42 83,14 64,31" fill={look.skin} {...stroke} />
        <polygon points="37,26 37,14 46,21" fill={look.accent} />
        <polygon points="83,26 83,14 74,21" fill={look.accent} />
      </>
    ),
    dragon: (
      <>
        <polygon points="43,32 38,10 54,26" fill={look.accent} {...stroke} />
        <polygon points="77,32 82,10 66,26" fill={look.accent} {...stroke} />
      </>
    ),
    hamster: (
      <>
        <circle cx="40" cy="34" r="10" fill={look.skin} {...stroke} />
        <circle cx="80" cy="34" r="10" fill={look.skin} {...stroke} />
        <circle cx="40" cy="34" r="5" fill={look.accent} />
        <circle cx="80" cy="34" r="5" fill={look.accent} />
      </>
    ),
    panda: (
      <>
        <circle cx="40" cy="32" r="11" fill={look.accent} {...stroke} />
        <circle cx="80" cy="32" r="11" fill={look.accent} {...stroke} />
      </>
    ),
    penguin: <></>,
    frog: (
      <>
        <circle cx="45" cy="30" r="10" fill={look.skin} {...stroke} />
        <circle cx="75" cy="30" r="10" fill={look.skin} {...stroke} />
        <circle cx="45" cy="30" r="5.6" fill="#fff" stroke={INK} strokeWidth="2" />
        <circle cx="75" cy="30" r="5.6" fill="#fff" stroke={INK} strokeWidth="2" />
        <circle cx="46" cy="31" r="2.6" fill={INK} />
        <circle cx="74" cy="31" r="2.6" fill={INK} />
      </>
    ),
    unicorn: (
      <>
        <polygon points="40,40 42,18 56,32" fill={look.skin} {...stroke} />
        <polygon points="80,40 78,18 64,32" fill={look.skin} {...stroke} />
        <polygon points="54,30 60,0 66,30" fill="#ffd24d" {...stroke} />
        <path d="M56 22 L64 18 M56 14 L63 10" stroke="#ff9d3d" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
    robot: (
      <>
        <rect x="58" y="10" width="4" height="16" fill="#6a7385" stroke={INK} strokeWidth="2" />
        <circle cx="60" cy="9" r="5" fill={look.accent} stroke={INK} strokeWidth="2.2" />
        <rect x="30" y="44" width="8" height="16" rx="3" fill="#8f9bad" {...stroke} />
        <rect x="82" y="44" width="8" height="16" rx="3" fill="#8f9bad" {...stroke} />
      </>
    ),
  }[species];

  const behind = {
    cat: <path d="M86 98 Q112 90 104 66" fill="none" stroke={look.skin} strokeWidth="9" strokeLinecap="round" />,
    dog: <path d="M88 96 Q108 92 106 74" fill="none" stroke={look.skin} strokeWidth="8" strokeLinecap="round" />,
    bunny: <circle cx="90" cy="98" r="9" fill="#fff" stroke={INK} strokeWidth="2.5" />,
    fox: (
      <>
        <path d="M86 98 Q116 96 108 66" fill="none" stroke={look.skin} strokeWidth="14" strokeLinecap="round" />
        <path d="M108 66 Q106 74 103 79" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
      </>
    ),
    dragon: (
      <>
        <path d="M88 98 Q114 100 108 78" fill="none" stroke={look.skin} strokeWidth="10" strokeLinecap="round" />
        <polygon points="36,70 14,58 22,82" fill="#2fa066" {...stroke} />
        <polygon points="84,70 106,58 98,82" fill="#2fa066" {...stroke} />
      </>
    ),
    hamster: <circle cx="90" cy="98" r="6" fill={look.skin} stroke={INK} strokeWidth="2.5" />,
    panda: <circle cx="90" cy="98" r="7" fill={look.accent} stroke={INK} strokeWidth="2.5" />,
    penguin: (
      <>
        <polygon points="32,86 12,96 34,104" fill={look.skin} {...stroke} />
        <polygon points="88,86 108,96 86,104" fill={look.skin} {...stroke} />
      </>
    ),
    frog: <path d="M88 100 Q100 98 98 90" fill="none" stroke={look.skin} strokeWidth="6" strokeLinecap="round" />,
    unicorn: (
      <>
        <path d="M86 94 Q112 96 106 72" fill="none" stroke="#ff9ed8" strokeWidth="12" strokeLinecap="round" />
        <path d="M104 78 Q106 70 108 66" fill="none" stroke="#c9a8ff" strokeWidth="8" strokeLinecap="round" />
      </>
    ),
    robot: <path d="M88 96 L104 92 L108 74" fill="none" stroke="#6a7385" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />,
  }[species];

  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-hidden style={{ overflow: "visible" }}>
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="rgba(0,0,0,0.18)" />
      <g transform={`translate(60 110) scale(${scale}) translate(-60 -110)`}>
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -3; 0 0"
            dur="2.4s"
            repeatCount="indefinite"
          />
          {behind}
          {/* tělo */}
          <ellipse cx="60" cy="88" rx="28" ry="22" fill={look.skin} {...stroke} />
          <ellipse cx="60" cy="92" rx="16" ry="14" fill={look.belly} />
          {/* packy */}
          <ellipse cx="46" cy="108" rx="9" ry="5.5" fill={look.skin} {...stroke} />
          <ellipse cx="74" cy="108" rx="9" ry="5.5" fill={look.skin} {...stroke} />
          {ears}
          {/* hlava */}
          <circle cx="60" cy="52" r="26" fill={look.skin} {...stroke} />
          {species === "fox" && (
            <path d="M34 58 Q60 82 86 58 Q74 70 60 70 Q46 70 34 58 Z" fill={look.belly} />
          )}
          {species === "dog" && <ellipse cx="60" cy="63" rx="12" ry="8" fill={look.belly} />}
          {species === "dragon" && (
            <>
              <circle cx="51" cy="64" r="1.6" fill={INK} />
              <circle cx="69" cy="64" r="1.6" fill={INK} />
            </>
          )}
          {species === "panda" && (
            <>
              <ellipse cx="47" cy="52" rx="8" ry="10" fill={look.accent} transform="rotate(-12 47 52)" />
              <ellipse cx="73" cy="52" rx="8" ry="10" fill={look.accent} transform="rotate(12 73 52)" />
            </>
          )}
          {species === "penguin" && (
            <>
              <path d="M34 54 Q60 20 86 54 Q74 74 60 74 Q46 74 34 54 Z" fill={look.belly} />
              <polygon points="54,62 66,62 60,70" fill={look.accent} {...stroke} />
            </>
          )}
          {species === "robot" && (
            <>
              <rect x="38" y="40" width="44" height="24" rx="8" fill="#bfe8ff" />
              <rect x="48" y="70" width="24" height="5" rx="2" fill="#6a7385" />
            </>
          )}
          {species === "hamster" && <circle cx="60" cy="66" r="2" fill={look.accent} />}
          {species === "cat" && (
            <path d="M32 58 L44 60 M32 64 L44 63 M88 58 L76 60 M88 64 L76 63" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          )}
          <circle cx="40" cy="62" r="4.2" fill="#ff9eb0" opacity="0.5" />
          <circle cx="80" cy="62" r="4.2" fill="#ff9eb0" opacity="0.5" />
          {eyes}
          {species !== "dog" && <ellipse cx="60" cy="58" rx="3.2" ry="2.3" fill={species === "bunny" ? "#ff8aa5" : INK} />}
          {species === "dog" && <ellipse cx="60" cy="58" rx="4.4" ry="3" fill={INK} />}
          {mouth}
          {accessory === "scarf" && (
            <>
              <path d="M36 80 Q60 92 84 80 L83 90 Q60 101 37 90 Z" fill="#e5484d" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M40 84 L44 94 M52 88 L55 98 M66 88 L69 98 M78 84 L81 94" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <path d="M74 92 L86 108 L76 110 L70 98 Z" fill="#e5484d" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
            </>
          )}
          {accessory === "glasses" && (
            <>
              <rect x="39" y="45" width="18" height="12" rx="5" fill="#16132b" stroke="#16132b" strokeWidth="2" />
              <rect x="63" y="45" width="18" height="12" rx="5" fill="#16132b" stroke="#16132b" strokeWidth="2" />
              <path d="M57 49 L63 49" stroke="#16132b" strokeWidth="2.4" />
              <path d="M42 48 L47 48 M66 48 L71 48" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
            </>
          )}
          {accessory === "bow" && (
            <>
              <path d="M40 30 L28 22 L28 38 Z" fill="#ff7aa8" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M40 30 L52 22 L52 38 Z" fill="#ff7aa8" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
              <circle cx="40" cy="30" r="4.2" fill="#ffd1e2" stroke={INK} strokeWidth="2" />
            </>
          )}
          {accessory === "flower" && (
            <g transform="translate(80 29)">
              {[0, 72, 144, 216, 288].map((deg) => (
                <ellipse key={deg} cx="0" cy="-6" rx="4.2" ry="5.6" fill="#ff8fb8" stroke={INK} strokeWidth="1.6" transform={`rotate(${deg})`} />
              ))}
              <circle r="4" fill="#ffd24d" stroke={INK} strokeWidth="1.6" />
            </g>
          )}
          {accessory === "party" && (
            <>
              <path d="M47 33 L63 3 L75 33 Z" fill="#7c6cff" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M51 26 L69 20 M55 17 L66 13" stroke="#ffd24d" strokeWidth="3" strokeLinecap="round" />
              <circle cx="63" cy="3" r="4.2" fill="#ff5d73" stroke={INK} strokeWidth="2" />
            </>
          )}
          {accessory === "crown" && (
            <>
              <path d="M42 31 L44 14 L52 23 L60 10 L68 23 L76 14 L78 31 Z" fill="#ffd24d" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
              <circle cx="52" cy="26" r="2.2" fill="#e5484d" />
              <circle cx="60" cy="24" r="2.4" fill="#3b82f6" />
              <circle cx="68" cy="26" r="2.2" fill="#2fb344" />
            </>
          )}
          {accessory === "halo" && (
            <ellipse cx="60" cy="18" rx="16" ry="5" fill="none" stroke="#ffd24d" strokeWidth="4" />
          )}
          {accessory === "headphones" && (
            <>
              <path d="M34 52 Q34 20 60 20 Q86 20 86 52" fill="none" stroke="#16132b" strokeWidth="4" strokeLinecap="round" />
              <rect x="29" y="46" width="10" height="16" rx="4" fill="#7c6cff" stroke={INK} strokeWidth="2.2" />
              <rect x="81" y="46" width="10" height="16" rx="4" fill="#7c6cff" stroke={INK} strokeWidth="2.2" />
            </>
          )}
          {mood === "hungry" && <text x="86" y="30" fontSize="18">🍖</text>}
          {mood === "sad" && <text x="82" y="46" fontSize="14">💧</text>}
          {mood === "happy" && <text x="84" y="26" fontSize="14">💖</text>}
          {maxed ? (
            <text x="46" y="20" fontSize="24">👑</text>
          ) : stage === 3 ? (
            <text x="84" y="20" fontSize="14">✨</text>
          ) : null}
        </g>
      </g>
    </svg>
  );
}
