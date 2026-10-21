import type { SpeciesId } from "@/lib/idle/pets";

const INK = "#16132b";

type Look = { skin: string; belly: string; accent: string };

const LOOKS: Record<SpeciesId, Look> = {
  cat: { skin: "#ffb26b", belly: "#ffe3c4", accent: "#ff8a4a" },
  dog: { skin: "#d9a066", belly: "#f6e1c3", accent: "#8a5a2b" },
  bunny: { skin: "#f5f2f7", belly: "#ffffff", accent: "#ffb3c7" },
  fox: { skin: "#ff8a3d", belly: "#fff1de", accent: "#3a2a22" },
  dragon: { skin: "#44c27a", belly: "#b8f0cd", accent: "#ffd24d" },
};

export type PetMood = "happy" | "ok" | "sad" | "hungry";

export function PetArt({
  species,
  stage,
  mood,
  maxed = false,
  size = 200,
}: {
  species: SpeciesId;
  stage: 1 | 2 | 3;
  mood: PetMood;
  maxed?: boolean;
  size?: number;
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
          {species === "cat" && (
            <path d="M32 58 L44 60 M32 64 L44 63 M88 58 L76 60 M88 64 L76 63" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          )}
          <circle cx="40" cy="62" r="4.2" fill="#ff9eb0" opacity="0.5" />
          <circle cx="80" cy="62" r="4.2" fill="#ff9eb0" opacity="0.5" />
          {eyes}
          {species !== "dog" && <ellipse cx="60" cy="58" rx="3.2" ry="2.3" fill={species === "bunny" ? "#ff8aa5" : INK} />}
          {species === "dog" && <ellipse cx="60" cy="58" rx="4.4" ry="3" fill={INK} />}
          {mouth}
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
