import type { SpeciesId } from "@/lib/idle/pets";
import { darken, lighten } from "@/lib/color";

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
        <ellipse cx="49" cy="52" rx="4.6" ry="5" fill={INK} />
        <ellipse cx="71" cy="52" rx="4.6" ry="5" fill={INK} />
        <circle cx="50.6" cy="50" r="1.8" fill="#fff" />
        <circle cx="72.6" cy="50" r="1.8" fill="#fff" />
        <circle cx="47.6" cy="54.2" r="0.9" fill="#fff" opacity="0.8" />
        <circle cx="69.6" cy="54.2" r="0.9" fill="#fff" opacity="0.8" />
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
        <polygon points="42,35 43,23 52,31" fill="#ffb3c7" />
        <polygon points="78,35 77,23 68,31" fill="#ffb3c7" />
      </>
    ),
    dog: (
      <>
        <ellipse cx="38" cy="48" rx="9" ry="17" fill={look.accent} {...stroke} transform="rotate(14 38 48)" />
        <ellipse cx="82" cy="48" rx="9" ry="17" fill={look.accent} {...stroke} transform="rotate(-14 82 48)" />
        <ellipse cx="37" cy="52" rx="4" ry="10" fill={lighten(look.accent, 0.25)} transform="rotate(14 37 52)" />
        <ellipse cx="83" cy="52" rx="4" ry="10" fill={lighten(look.accent, 0.25)} transform="rotate(-14 83 52)" />
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
        <polygon points="37,28 37,14 47,22" fill={look.accent} />
        <polygon points="83,28 83,14 73,22" fill={look.accent} />
        <polygon points="41,38 41,24 50,31" fill="#ffd0b0" />
        <polygon points="79,38 79,24 70,31" fill="#ffd0b0" />
      </>
    ),
    dragon: (
      <>
        <polygon points="42,36 37,10 55,28" fill={look.accent} {...stroke} />
        <polygon points="78,36 83,10 65,28" fill={look.accent} {...stroke} />
        <path d="M41 28 L39 16 M79 28 L81 16" stroke={darken(look.accent, 0.3)} strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <polygon points="52,28 56,12 62,28" fill="#2fa066" {...stroke} />
        <polygon points="62,28 66,14 70,30" fill="#2fa066" {...stroke} />
      </>
    ),
    hamster: (
      <>
        <circle cx="40" cy="34" r="10" fill={look.skin} {...stroke} />
        <circle cx="80" cy="34" r="10" fill={look.skin} {...stroke} />
        <circle cx="41" cy="35" r="5" fill={look.accent} />
        <circle cx="79" cy="35" r="5" fill={look.accent} />
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
        <polygon points="40,36 42,20 54,32" fill="#ffc4ec" />
        <polygon points="80,36 78,20 66,32" fill="#ffc4ec" />
        <polygon points="51,33 60,0 69,33" fill="#ffd24d" {...stroke} />
        <path d="M54.5 25 L65 19.5 M56.5 15 L63.5 11" stroke="#ff9d3d" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    robot: (
      <>
        <rect x="58" y="10" width="4" height="20" fill="#6a7385" stroke={INK} strokeWidth="2" />
        <circle cx="60" cy="9" r="5" fill={look.accent} stroke={INK} strokeWidth="2.2" />
        <rect x="29" y="44" width="10" height="16" rx="3" fill="#8f9bad" {...stroke} />
        <rect x="81" y="44" width="10" height="16" rx="3" fill="#8f9bad" {...stroke} />
        <circle cx="34" cy="52" r="2" fill={look.accent} stroke={INK} strokeWidth="1.2" />
        <circle cx="86" cy="52" r="2" fill={look.accent} stroke={INK} strokeWidth="1.2" />
      </>
    ),
  }[species];

  const tailShade = darken(look.skin, 0.18);
  const behind = {
    cat: (
      <>
        <path d="M80 98 Q112 94 104 64" fill="none" stroke={INK} strokeWidth="12.5" strokeLinecap="round" />
        <path d="M80 98 Q112 94 104 64" fill="none" stroke={look.skin} strokeWidth="9" strokeLinecap="round" />
        <path d="M107 80 Q108 72 104 64" fill="none" stroke={look.accent} strokeWidth="9" strokeLinecap="round" />
      </>
    ),
    dog: (
      <>
        <path d="M82 96 Q108 92 106 72" fill="none" stroke={INK} strokeWidth="11.5" strokeLinecap="round" />
        <path d="M82 96 Q108 92 106 72" fill="none" stroke={look.skin} strokeWidth="8" strokeLinecap="round" />
        <path d="M106 82 Q107 77 106 72" fill="none" stroke={look.belly} strokeWidth="8" strokeLinecap="round" />
      </>
    ),
    bunny: (
      <>
        <circle cx="87" cy="98" r="9" fill="#fff" stroke={INK} strokeWidth="2.5" />
        <path d="M84 94 Q88 92 91 95 M83 99 Q87 97 91 100" fill="none" stroke="#e3dce8" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
    fox: (
      <>
        <path d="M80 98 Q116 96 108 64" fill="none" stroke={INK} strokeWidth="18.5" strokeLinecap="round" />
        <path d="M80 98 Q116 96 108 64" fill="none" stroke={look.skin} strokeWidth="14" strokeLinecap="round" />
        <path d="M108 78 Q109 70 108 64" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
        <path d="M92 94 Q104 92 107 80" fill="none" stroke={darken(look.skin, 0.12)} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
    dragon: (
      <>
        <path d="M80 98 Q114 100 108 76" fill="none" stroke={INK} strokeWidth="14.5" strokeLinecap="round" />
        <path d="M80 98 Q114 100 108 76" fill="none" stroke={look.skin} strokeWidth="10" strokeLinecap="round" />
        <polygon points="107,70 114,76 108,81" fill={look.accent} {...stroke} />
        <polygon points="42,74 12,58 14,80 40,90" fill="#2fa066" {...stroke} />
        <polygon points="78,74 108,58 106,80 80,90" fill="#2fa066" {...stroke} />
        <path d="M40 76 L16 62 M40 84 L16 76 M80 76 L104 62 M80 84 L104 76" stroke={darken("#2fa066", 0.3)} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </>
    ),
    hamster: (
      <circle cx="86" cy="98" r="6" fill={look.skin} stroke={INK} strokeWidth="2.5" />
    ),
    panda: (
      <circle cx="87" cy="98" r="7" fill={look.accent} stroke={INK} strokeWidth="2.5" />
    ),
    penguin: (
      <>
        <polygon points="38,80 12,94 18,104 38,98" fill={look.skin} {...stroke} />
        <polygon points="82,80 108,94 102,104 82,98" fill={look.skin} {...stroke} />
      </>
    ),
    frog: (
      <>
        <ellipse cx="35" cy="102" rx="12" ry="8" fill={tailShade} {...stroke} transform="rotate(-18 35 102)" />
        <ellipse cx="85" cy="102" rx="12" ry="8" fill={tailShade} {...stroke} transform="rotate(18 85 102)" />
      </>
    ),
    unicorn: (
      <>
        <path d="M80 94 Q112 96 106 70" fill="none" stroke={INK} strokeWidth="16.5" strokeLinecap="round" />
        <path d="M80 94 Q112 96 106 70" fill="none" stroke="#ff9ed8" strokeWidth="12" strokeLinecap="round" />
        <path d="M100 88 Q108 84 106 72" fill="none" stroke="#c9a8ff" strokeWidth="6" strokeLinecap="round" />
      </>
    ),
    robot: (
      <>
        <path d="M82 96 L102 92 L106 72" fill="none" stroke={INK} strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M82 96 L102 92 L106 72" fill="none" stroke="#6a7385" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="106" cy="71" r="4" fill={look.accent} stroke={INK} strokeWidth="2" />
      </>
    ),
  }[species];

  const pawFill = species === "penguin" ? look.accent : species === "fox" ? look.accent : species === "panda" ? look.accent : species === "unicorn" ? "#c9a8ff" : look.skin;
  const gid = `pet-${species}`;
  const hasHeadHat = accessory === "crown" || accessory === "party" || accessory === "halo" || accessory === "headphones";

  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-hidden style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`${gid}-body`} cx="38%" cy="28%" r="85%">
          <stop offset="0" stopColor={lighten(look.skin, 0.38)} />
          <stop offset="0.55" stopColor={look.skin} />
          <stop offset="1" stopColor={darken(look.skin, 0.2)} />
        </radialGradient>
        <radialGradient id={`${gid}-belly`} cx="50%" cy="35%" r="75%">
          <stop offset="0" stopColor={lighten(look.belly, 0.4)} />
          <stop offset="1" stopColor={darken(look.belly, 0.08)} />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="112" rx="32" ry="5.5" fill="rgba(0,0,0,0.2)" />
      <ellipse cx="60" cy="112" rx="20" ry="3" fill="rgba(0,0,0,0.12)" />
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
          <ellipse cx="60" cy="88" rx="28" ry="22" fill={`url(#${gid}-body)`} {...stroke} />
          <ellipse cx="60" cy="92" rx="16" ry="14" fill={`url(#${gid}-belly)`} />
          {species === "robot" && (
            <>
              <rect x="50" y="85" width="20" height="14" rx="4" fill="#2b3447" stroke={INK} strokeWidth="1.6" />
              <circle cx="56" cy="92" r="2.4" fill="#5eead4" />
              <circle cx="64" cy="92" r="2.4" fill={look.accent} />
              <path d="M36 80 L36 96 M84 80 L84 96" stroke="#8f9bad" strokeWidth="1.4" strokeLinecap="round" />
            </>
          )}
          {species === "dragon" && (
            <path d="M48 82 Q60 86 72 82 M46 89 Q60 94 74 89 M48 96 Q60 101 72 96" fill="none" stroke={darken(look.belly, 0.2)} strokeWidth="1.6" strokeLinecap="round" />
          )}
          {species === "cat" && (
            <path d="M34 82 L40 85 M33 90 L39 91 M86 82 L80 85 M87 90 L81 91" fill="none" stroke={look.accent} strokeWidth="2.2" strokeLinecap="round" />
          )}
          {species === "fox" && (
            <path d="M52 100 Q60 95 68 100" fill="none" stroke={darken(look.belly, 0.12)} strokeWidth="1.6" strokeLinecap="round" />
          )}
          {species === "frog" && (
            <>
              <circle cx="42" cy="82" r="3" fill={darken(look.skin, 0.18)} />
              <circle cx="78" cy="86" r="2.4" fill={darken(look.skin, 0.18)} />
              <circle cx="72" cy="78" r="1.8" fill={darken(look.skin, 0.18)} />
            </>
          )}
          {species === "unicorn" && (
            <path d="M48 84 L50 88 L47 90 M70 84 L72 88 L69 90" fill="none" stroke="#e8c9ff" strokeWidth="1.6" strokeLinecap="round" />
          )}
          {/* packy */}
          <ellipse cx="46" cy="108" rx="9" ry="5.5" fill={pawFill} {...stroke} />
          <ellipse cx="74" cy="108" rx="9" ry="5.5" fill={pawFill} {...stroke} />
          <path d="M43 106.5 L43 110 M47 106 L47 110.4 M71 106.5 L71 110 M75 106 L75 110.4" stroke={INK} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
          {ears}
          {/* hlava */}
          <circle cx="60" cy="52" r="26" fill={`url(#${gid}-body)`} {...stroke} />
          <ellipse cx="50" cy="35" rx="9" ry="4.5" fill="#fff" opacity="0.22" transform="rotate(-24 50 35)" />
          {species === "fox" && (
            <path d="M34 58 Q60 82 86 58 Q74 70 60 70 Q46 70 34 58 Z" fill={look.belly} />
          )}
          {species === "dog" && (
            <>
              <ellipse cx="60" cy="63" rx="12" ry="8" fill={look.belly} />
              <ellipse cx="72" cy="46" rx="8" ry="9" fill={look.accent} opacity="0.85" transform="rotate(12 72 46)" />
            </>
          )}
          {species === "dragon" && (
            <>
              <ellipse cx="60" cy="64" rx="12" ry="8" fill={look.belly} opacity="0.7" />
              <circle cx="55" cy="64" r="1.6" fill={INK} />
              <circle cx="65" cy="64" r="1.6" fill={INK} />
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
              <polygon points="53,60 67,60 60,71" fill={look.accent} {...stroke} />
              <path d="M54 63 L66 63" stroke={darken(look.accent, 0.25)} strokeWidth="1.4" strokeLinecap="round" />
            </>
          )}
          {species === "robot" && (
            <>
              <rect x="38" y="40" width="44" height="24" rx="8" fill="#bfe8ff" stroke={INK} strokeWidth="1.8" />
              <path d="M42 45 Q46 42 54 42" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <rect x="48" y="70" width="24" height="5" rx="2" fill="#6a7385" />
              <path d="M54 70 L54 75 M60 70 L60 75 M66 70 L66 75" stroke={INK} strokeWidth="1" />
              <circle cx="40" cy="32" r="1.8" fill="#8f9bad" stroke={INK} strokeWidth="1" />
              <circle cx="80" cy="32" r="1.8" fill="#8f9bad" stroke={INK} strokeWidth="1" />
            </>
          )}
          {species === "hamster" && (
            <>
              <ellipse cx="60" cy="62" rx="15" ry="11" fill={look.belly} />
              <circle cx="60" cy="66" r="2" fill={look.accent} />
              <path d="M55 36 Q60 31 65 36" fill="none" stroke={look.accent} strokeWidth="2.6" strokeLinecap="round" />
            </>
          )}
          {species === "cat" && (
            <>
              <path d="M54 32 L55 38 M60 31 L60 38 M66 32 L65 38" fill="none" stroke={look.accent} strokeWidth="2.4" strokeLinecap="round" />
              <ellipse cx="60" cy="64" rx="10" ry="7" fill={look.belly} />
              <path d="M32 58 L44 60 M32 64 L44 63 M88 58 L76 60 M88 64 L76 63" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
            </>
          )}
          {species === "bunny" && (
            <>
              <ellipse cx="60" cy="63" rx="11" ry="7.5" fill={look.belly} />
              <path d="M34 60 L45 61 M34 66 L45 65 M86 60 L75 61 M86 66 L75 65" fill="none" stroke="#c9bfd0" strokeWidth="1.4" strokeLinecap="round" />
            </>
          )}
          {species === "frog" && (
            <>
              <ellipse cx="60" cy="63" rx="17" ry="10" fill={look.belly} opacity="0.8" />
              <circle cx="52" cy="40" r="2" fill={darken(look.skin, 0.18)} />
              <circle cx="68" cy="42" r="1.6" fill={darken(look.skin, 0.18)} />
            </>
          )}
          {species === "unicorn" && (
            <>
              <path d="M36 40 Q34 52 38 64 Q32 56 32 46 Z" fill="#ff9ed8" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
              <path d="M84 40 Q86 52 82 64 Q88 56 88 46 Z" fill="#c9a8ff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
              <path d="M48 32 Q54 40 62 33 Q70 41 74 32" fill="#ff9ed8" stroke={INK} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            </>
          )}
          <circle cx="40" cy="62" r="4.6" fill="#ff9eb0" opacity="0.5" />
          <circle cx="80" cy="62" r="4.6" fill="#ff9eb0" opacity="0.5" />
          {eyes}
          {species !== "dog" && <ellipse cx="60" cy="58" rx="3.2" ry="2.3" fill={species === "bunny" ? "#ff8aa5" : INK} />}
          {species === "dog" && <ellipse cx="60" cy="58" rx="4.4" ry="3" fill={INK} />}
          <ellipse cx="59" cy="57" rx="1.1" ry="0.7" fill="#fff" opacity="0.7" />
          {mouth}
          {species === "bunny" && mood !== "hungry" && (
            <rect x="57" y="65" width="6" height="5" rx="1.2" fill="#fff" stroke={INK} strokeWidth="1.4" />
          )}
          {species === "dog" && mood === "happy" && (
            <path d="M56 67 Q60 76 64 67 Z" fill="#ff7a8f" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
          )}
          {species === "dog" && (
            <>
              <path d="M44 77 Q60 86 76 77 L76 81 Q60 90 44 81 Z" fill="#e5484d" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
              <circle cx="60" cy="87" r="3.2" fill="#ffd24d" stroke={INK} strokeWidth="1.6" />
            </>
          )}
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
              <path d="M39 49 L34 47 M81 49 L86 47" stroke="#16132b" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M42 48 L47 48 M66 48 L71 48" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
            </>
          )}
          {accessory === "bow" && (
            <g transform="translate(5 1)">
              <path d="M40 30 L27 21 L27 39 Z" fill="#ff7aa8" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M40 30 L53 21 L53 39 Z" fill="#ff7aa8" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M36 27 L31 25 M44 27 L49 25" stroke="#ffd1e2" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="40" cy="30" r="4.2" fill="#ffd1e2" stroke={INK} strokeWidth="2" />
            </g>
          )}
          {accessory === "flower" && (
            <g transform="translate(75 31)">
              {[0, 72, 144, 216, 288].map((deg) => (
                <ellipse key={deg} cx="0" cy="-6" rx="4.4" ry="5.8" fill="#ff8fb8" stroke={INK} strokeWidth="1.6" transform={`rotate(${deg})`} />
              ))}
              <circle r="4" fill="#ffd24d" stroke={INK} strokeWidth="1.6" />
            </g>
          )}
          {accessory === "party" && (
            <>
              <path d="M46 36 L62 4 L77 36 Z" fill="#7c6cff" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M51 27 L70 21 M55 17 L67 13" stroke="#ffd24d" strokeWidth="3" strokeLinecap="round" />
              <circle cx="62" cy="4" r="4.2" fill="#ff5d73" stroke={INK} strokeWidth="2" />
            </>
          )}
          {accessory === "crown" && (
            <>
              <path d="M44 35 L45 16 L52 24 L60 10 L68 24 L75 16 L76 35 Z" fill="#ffd24d" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M45 31 L76 31" stroke={INK} strokeWidth="1.6" />
              <circle cx="52" cy="27" r="2.2" fill="#e5484d" />
              <circle cx="60" cy="25" r="2.4" fill="#3b82f6" />
              <circle cx="68" cy="27" r="2.2" fill="#2fb344" />
            </>
          )}
          {accessory === "halo" && (
            <>
              <ellipse cx="60" cy="19" rx="17" ry="5.5" fill="none" stroke="#fff3b0" strokeWidth="7" opacity="0.5" />
              <ellipse cx="60" cy="19" rx="16" ry="5" fill="none" stroke="#ffd24d" strokeWidth="4" />
            </>
          )}
          {accessory === "headphones" && (
            <>
              <path d="M34 52 Q34 20 60 20 Q86 20 86 52" fill="none" stroke={INK} strokeWidth="6.5" strokeLinecap="round" />
              <path d="M34 52 Q34 20 60 20 Q86 20 86 52" fill="none" stroke="#3a3560" strokeWidth="3.4" strokeLinecap="round" />
              <rect x="28" y="46" width="12" height="17" rx="5" fill="#7c6cff" stroke={INK} strokeWidth="2.2" />
              <rect x="80" y="46" width="12" height="17" rx="5" fill="#7c6cff" stroke={INK} strokeWidth="2.2" />
            </>
          )}
          {mood === "hungry" && <text x="86" y="30" fontSize="18">🍖</text>}
          {mood === "sad" && <text x="82" y="46" fontSize="14">💧</text>}
          {mood === "happy" && <text x="84" y="26" fontSize="14">💖</text>}
          {maxed && !hasHeadHat ? (
            <g>
              <path d="M48 31 L49 18 L54 23 L60 13 L66 23 L71 18 L72 31 Z" fill="#ffd24d" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
              <circle cx="60" cy="25" r="2" fill="#e5484d" />
            </g>
          ) : stage === 3 ? (
            <text x="84" y="20" fontSize="14">✨</text>
          ) : null}
        </g>
      </g>
    </svg>
  );
}
