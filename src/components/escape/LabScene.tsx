"use client";

import type { Hotspot } from "@/lib/escape/types";
import labArt from "../../../public/escape/lab/lab.json";

const INK = "#16132b";

// Vyrenderovaná místnost (umime-art/scripts/lab.py). Výřezy přepisují jen ty části scény, které se
// po vyřešení hádanky změní; souřadnice jsou v jednotkách SVG a jsou v lab.json. Kreslená SVG scéna
// pod obrázky zůstává jako záloha, kdyby se obrázky nenačetly.
const ART = "/escape/lab";
type ArtPatch = { file: string; x: number; y: number; w: number; h: number };
const ART_STATES = labArt.states as Record<string, ArtPatch[]>;

function Periodic() {
  const cells = [];
  const colors = ["#ffd4a8", "#bfe3ff", "#c8f0c0", "#ffc2d6", "#e3d4ff"];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 10; col++) {
      if (row === 2 && col === 6) continue;
      cells.push(
        <rect
          key={`${row}-${col}`}
          x={78 + col * 17.4}
          y={96 + row * 21}
          width="15"
          height="18"
          rx="2"
          fill={colors[(row + col) % colors.length]}
          stroke={INK}
          strokeWidth="1"
        />,
      );
    }
  }
  return <>{cells}</>;
}

export function LabScene({
  hotspots,
  solved,
  used,
  danger,
  selectedItem,
  onHotspot,
}: {
  hotspots: Hotspot[];
  solved: string[];
  used: string[];
  danger: number;
  selectedItem: string | null;
  onHotspot: (hotspot: Hotspot) => void;
}) {
  const computerSolved = solved.includes("computer");
  const doorSolved = solved.includes("door");
  const cabinetSolved = solved.includes("cabinet");
  const ventUsed = used.includes("vent");
  // Poslední výřez vyhrává, proto je pořadí důležité (počítač a dveře před reaktorem).
  const activeStates = [
    cabinetSolved && "cabinet_open",
    ventUsed && "vent_used",
    computerSolved && "pc_on",
    doorSolved && "door_open",
    !doorSolved && danger >= 70 && "reactor_crit",
    !doorSolved && danger >= 40 && danger < 70 && "reactor_warn",
  ].filter((key): key is string => Boolean(key));
  const glow = 0.35 + danger / 160;
  const pulse = Math.max(0.35, 1.6 - danger / 70);

  return (
    <svg viewBox="0 0 800 450" className="block h-auto w-full" role="img" aria-label="Laboratoř">
      <rect x="0" y="0" width="800" height="450" fill="#dbe6f0" />
      <rect x="0" y="385" width="800" height="65" fill="#b9a98a" />
      <line x1="0" y1="385" x2="800" y2="385" stroke={INK} strokeWidth="3" />
      {[100, 230, 360, 490, 620, 750].map((x) => (
        <line key={x} x1={x} y1="385" x2={x - 30} y2="450" stroke="#9c8c6d" strokeWidth="2" />
      ))}

      <rect x="70" y="70" width="190" height="140" rx="6" fill="#fffaf0" stroke={INK} strokeWidth="3" />
      <text x="165" y="88" textAnchor="middle" fontSize="11" fontWeight="700" fill={INK}>
        PERIODICKÁ TABULKA
      </text>
      <Periodic />
      <rect
        x={78 + 6 * 17.4}
        y={96 + 2 * 21}
        width="15"
        height="18"
        rx="2"
        fill="none"
        stroke="#ff5a3c"
        strokeWidth="2"
        strokeDasharray="3 2"
      />

      <rect x="300" y="110" width="130" height="190" rx="6" fill="#8b5e3c" stroke={INK} strokeWidth="3" />
      <line x1="365" y1="110" x2="365" y2="300" stroke={INK} strokeWidth="3" />
      <rect x="312" y="124" width="46" height="70" rx="3" fill="#d6b48a" stroke={INK} strokeWidth="2" />
      <rect x="372" y="124" width="46" height="70" rx="3" fill="#d6b48a" stroke={INK} strokeWidth="2" />
      {cabinetSolved ? (
        <>
          <circle cx="352" cy="230" r="8" fill="#17a864" stroke={INK} strokeWidth="2" />
          <circle cx="378" cy="230" r="8" fill="#17a864" stroke={INK} strokeWidth="2" />
        </>
      ) : (
        <circle cx="365" cy="230" r="10" fill="#ffc933" stroke={INK} strokeWidth="2" />
      )}
      <polygon points="324,110 334,92 344,110" fill="#7ee0b0" stroke={INK} strokeWidth="2" />
      <polygon points="386,110 398,88 410,110" fill="#ff8a6b" stroke={INK} strokeWidth="2" />

      <rect x="80" y="320" width="210" height="14" rx="3" fill="#a0714d" stroke={INK} strokeWidth="3" />
      <rect x="90" y="334" width="190" height="52" fill="#8b5e3c" stroke={INK} strokeWidth="3" />
      <rect x="125" y="344" width="120" height="30" rx="3" fill="#a0714d" stroke={INK} strokeWidth="2" />
      <circle cx="185" cy="359" r="4" fill="#ffc933" stroke={INK} strokeWidth="1.5" />
      <polygon points="100,320 116,288 132,320" fill="#bfe3ff" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="196" y="298" width="26" height="22" rx="3" fill="#c8f0c0" stroke={INK} strokeWidth="2.5" />
      <rect x="238" y="292" width="14" height="28" rx="3" fill="#ffc2d6" stroke={INK} strokeWidth="2.5" />

      <rect x="470" y="20" width="120" height="70" rx="6" fill="#cfd8e3" stroke={INK} strokeWidth="3" />
      {[34, 46, 58, 70].map((y) => (
        <line key={y} x1="480" y1={y} x2="580" y2={y} stroke={INK} strokeWidth="2" />
      ))}
      {!ventUsed && <rect x="520" y="64" width="26" height="18" rx="2" fill="#fff" stroke={INK} strokeWidth="2" />}

      <rect x="470" y="330" width="120" height="22" rx="3" fill="#a0714d" stroke={INK} strokeWidth="3" />
      <rect x="480" y="255" width="100" height="70" rx="6" fill="#1c1b33" stroke={INK} strokeWidth="3" />
      <rect x="488" y="263" width="84" height="54" rx="3" fill={computerSolved ? "#0f5132" : "#0e1a3a"} />
      {[272, 284, 296, 308].map((y, i) => (
        <rect key={y} x="494" y={y} width={computerSolved ? 60 - i * 6 : 40 - i * 6} height="4" rx="2" fill="#7ee0b0" />
      ))}

      <rect x="640" y="120" width="120" height="270" rx="6" fill="#6b7a8f" stroke={INK} strokeWidth="3" />
      <rect x="652" y="132" width="96" height="246" rx="3" fill="#8794a8" stroke={INK} strokeWidth="2" />
      <rect x="660" y="228" width="30" height="46" rx="4" fill="#1c1b33" stroke={INK} strokeWidth="2" />
      <circle cx="675" cy="240" r="5" fill={doorSolved ? "#3ddc97" : computerSolved ? "#ffc933" : "#ff5a3c"} />
      <circle cx="745" cy="250" r="6" fill="#ffc933" stroke={INK} strokeWidth="2" />

      <rect x="598" y="230" width="34" height="90" rx="8" fill="#2f8f6b" stroke={INK} strokeWidth="3" />
      <circle cx="615" cy="222" r="16" fill="#9be15d" stroke={INK} strokeWidth="3" opacity={glow}>
        <animate attributeName="opacity" values={`${glow};1;${glow}`} dur={`${pulse}s`} repeatCount="indefinite" />
      </circle>

      <rect x="320" y="352" width="60" height="34" rx="8" fill="#8fd0ff" stroke={INK} strokeWidth="3" />
      <rect x="326" y="324" width="48" height="32" rx="8" fill="#d9e2ee" stroke={INK} strokeWidth="3" />
      <circle cx="340" cy="338" r="4" fill={INK} />
      <circle cx="360" cy="338" r="4" fill={INK} />
      <line x1="350" y1="324" x2="350" y2="310" stroke={INK} strokeWidth="3" />
      <circle cx="350" cy="308" r="5" fill="#ff5a3c" stroke={INK} strokeWidth="2" />

      <image href={`${ART}/bg.webp`} x="0" y="0" width="800" height="450" preserveAspectRatio="none" />
      {activeStates.flatMap((key) =>
        (ART_STATES[key] ?? []).map((patch) => (
          <image
            key={patch.file}
            href={`${ART}/${patch.file}`}
            x={patch.x}
            y={patch.y}
            width={patch.w}
            height={patch.h}
            preserveAspectRatio="none"
          />
        )),
      )}

      {danger > 40 && <rect x="0" y="0" width="800" height="450" fill="#ff2d2d" opacity={(danger - 40) / 400} />}

      {hotspots.map((h) => {
        const done = h.kind === "puzzle" && solved.includes(h.puzzleId);
        const isUsed = h.kind === "use" && used.includes(h.id);
        const showPulse = !done && !isUsed && h.kind !== "examine";
        return (
          <g
            key={h.id}
            role="button"
            tabIndex={0}
            aria-label={h.label}
            onClick={() => onHotspot(h)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onHotspot(h)}
            className="cursor-pointer outline-none [&_rect.hit]:hover:stroke-[#ffc933] [&_rect.hit]:focus:stroke-[#ffc933]"
          >
            <title>{h.label}</title>
            <rect
              className="hit"
              x={h.x}
              y={h.y}
              width={h.w}
              height={h.h}
              rx="8"
              fill="transparent"
              stroke="transparent"
              strokeWidth="4"
              strokeDasharray="8 6"
            />
            {showPulse && (
              <circle cx={h.x + h.w - 10} cy={h.y + 10} r="6" fill="#ffc933" stroke={INK} strokeWidth="2">
                <animate attributeName="r" values="5;8;5" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
            {done && (
              <text x={h.x + h.w - 10} y={h.y + 16} textAnchor="middle" fontSize="16" fill="#17a864" fontWeight="800">
                ✓
              </text>
            )}
          </g>
        );
      })}
      {selectedItem && <text x="14" y="438" fontSize="12" fontWeight="700" fill={INK} opacity="0.7">▶</text>}
    </svg>
  );
}
