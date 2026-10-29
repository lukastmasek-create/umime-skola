"use client";

import type { ReactNode } from "react";
import type { Doll, Pick, Slot } from "@/lib/dress";

export type Mood = "happy" | "sad" | "neutral";
export type Worn = Partial<Record<Slot, Pick>>;

const GREY = "#9aa0ac";
const GREY_DARK = "#7d8391";
const INK = "#2b2236";

// Varianta 0 je „správný“ kus. Další varianty (po špatné odpovědi) mění barvu, takže oblečení vypadá jinak.
function Piece({ slot, worn, children }: { slot: Slot; worn: Worn; children: ReactNode }) {
  const pick = worn[slot];
  if (pick === undefined) return null;
  const deg = pick.h * 360 + pick.v * 70;
  return (
    <g key={`${slot}-${pick.v}-${pick.h}`} className="doll-pop" style={deg ? { filter: `hue-rotate(${deg}deg) saturate(1.15)` } : undefined}>
      {children}
    </g>
  );
}

function HairBack({ kind, c }: { kind: Doll["hair"]["kind"]; c: string }) {
  const dark = "rgba(0,0,0,0.14)";
  switch (kind) {
    case "long":
      return <path d="M64 72 Q58 22 100 24 Q142 22 136 72 L144 178 Q100 194 56 178 Z" fill={c} />;
    case "bob":
      return <path d="M64 70 Q60 24 100 26 Q140 24 136 70 L138 112 Q100 124 62 112 Z" fill={c} />;
    case "pony":
      return (
        <g>
          <path d="M126 46 Q172 40 166 112 Q166 150 148 168 Q150 120 126 84 Z" fill={c} />
          <path d="M126 46 Q150 60 150 100" stroke={dark} strokeWidth="3" fill="none" />
        </g>
      );
    case "bun":
      return <circle cx="100" cy="26" r="17" fill={c} />;
    case "curly":
      return (
        <g fill={c}>
          {[
            [58, 66, 15],
            [52, 92, 15],
            [56, 120, 14],
            [142, 66, 15],
            [148, 92, 15],
            [144, 120, 14],
            [72, 38, 16],
            [100, 28, 17],
            [128, 38, 16],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} />
          ))}
        </g>
      );
    case "braids":
      return (
        <g fill={c}>
          <path d="M64 70 Q60 26 100 26 Q140 26 136 70 L134 96 L66 96 Z" />
          {[0, 1].map((side) => {
            const x = side ? 144 : 56;
            return (
              <g key={side}>
                {[96, 120, 144, 168].map((y, i) => (
                  <ellipse key={y} cx={x + (i % 2 ? 3 : -3) * (side ? -1 : 1)} cy={y} rx="9" ry="13" />
                ))}
                <circle cx={x} cy={184} r="6" fill="#ff5d73" />
              </g>
            );
          })}
        </g>
      );
  }
}

function HairFront({ kind, c }: { kind: Doll["hair"]["kind"]; c: string }) {
  if (kind === "bob") {
    return <path d="M67 74 Q64 34 100 34 Q136 34 133 74 Q120 52 100 54 Q80 52 67 74 Z M67 74 L66 96 Q70 80 74 76 Z" fill={c} />;
  }
  if (kind === "curly") {
    return (
      <g fill={c}>
        {[
          [78, 48, 12],
          [92, 44, 12],
          [108, 44, 12],
          [122, 48, 12],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
    );
  }
  return <path d="M68 74 Q66 36 100 36 Q134 36 132 74 Q118 52 100 56 Q82 52 68 74 Z" fill={c} />;
}

function Outfit({ doll, kind, c }: { doll: Doll; kind: Doll["outfit"]["kind"]; c: [string, string] }) {
  const [a, b] = c;
  switch (kind) {
    case "gown":
      return (
        <g>
          <path d="M84 188 Q100 194 116 188 L156 338 Q100 356 44 338 Z" fill={a} />
          <path d="M60 300 Q100 322 140 300 L156 338 Q100 356 44 338 Z" fill={b} opacity="0.55" />
          <path d="M80 116 Q100 108 120 116 L117 190 Q100 198 83 190 Z" fill={a} />
          <path d="M82 188 Q100 196 118 188 L118 198 Q100 206 82 198 Z" fill={b} />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={74 + i * 17} cy={322 - (i === 1 || i === 2 ? 4 : 0)} r="3" fill="#fff" opacity="0.8" />
          ))}
          <path d="M80 118 Q100 128 120 118" stroke={b} strokeWidth="5" fill="none" />
        </g>
      );
    case "sport":
      return (
        <g>
          <path d="M80 118 Q100 110 120 118 L118 176 Q100 182 82 176 Z" fill={a} />
          <path d="M80 140 L120 140 L119 150 L81 150 Z" fill={b} />
          <path d="M80 190 L120 190 L123 256 L102 256 L100 234 L98 256 L77 256 Z" fill={a} />
          <path d="M80 200 L120 200" stroke={b} strokeWidth="4" />
          <path d="M78 330 H98 M102 330 H122" stroke={b} strokeWidth="9" />
        </g>
      );
    case "rock":
      return (
        <g>
          <path d="M79 116 Q100 108 121 116 L119 178 Q100 184 81 178 Z" fill={a} />
          <path d="M100 128 l4 10 11 1 -8 7 3 11 -10 -6 -10 6 3 -11 -8 -7 11 -1 z" fill={b} />
          <path d="M82 184 L118 184 L130 252 L70 252 Z" fill={b} />
          <path d="M78 205 H122 M74 228 H126 M92 184 L88 252 M108 184 L112 252" stroke={a} strokeWidth="3" opacity="0.7" />
          <path d="M80 300 Q100 310 120 300" stroke={a} strokeWidth="4" fill="none" opacity="0.8" />
        </g>
      );
    case "fairy":
      return (
        <g>
          <path d="M84 118 Q100 110 116 118 L112 178 L128 280 L114 262 L100 292 L86 262 L72 280 L88 178 Z" fill={a} />
          <path d="M72 280 L86 262 L100 292 L114 262 L128 280 L100 300 Z" fill={b} opacity="0.85" />
          <path d="M92 150 q8 -10 16 0 q-8 10 -16 0z M90 196 q10 -12 20 0 q-10 12 -20 0z" fill={b} />
        </g>
      );
    case "chef":
      return (
        <g>
          <path d="M80 196 L120 196 L122 342 L102 342 L100 240 L98 342 L78 342 Z" fill={b} />
          <path d="M82 214 H119 M81 244 H120 M80 274 H121 M80 304 H122" stroke="#fff" strokeWidth="5" opacity="0.7" />
          <path d="M92 196 V342 M108 196 V342" stroke="#fff" strokeWidth="0" />
          <path d="M76 114 Q100 106 124 114 L126 206 L74 206 Z" fill={a} />
          <path d="M100 118 V206" stroke="#d6d9e4" strokeWidth="2" />
          {[134, 154, 174, 194].map((y) => (
            <circle key={y} cx="94" cy={y} r="3" fill={b} />
          ))}
          <path d="M76 114 L60 200 M124 114 L140 200" stroke={a} strokeWidth="14" strokeLinecap="round" />
        </g>
      );
    case "astro":
      return (
        <g>
          <path d="M82 196 L118 196 L120 344 L102 344 L100 238 L98 344 L80 344 Z" fill={a} stroke="#d4d9ef" strokeWidth="1.5" />
          <path d="M76 114 Q100 106 124 114 L126 208 L74 208 Z" fill={a} stroke="#d4d9ef" strokeWidth="1.5" />
          <path d="M76 114 L62 204 M124 114 L138 204" stroke={a} strokeWidth="15" strokeLinecap="round" />
          <circle cx="108" cy="140" r="9" fill={b} />
          <path d="M78 196 H122" stroke={b} strokeWidth="7" />
          <rect x="88" y="150" width="24" height="16" rx="3" fill={doll.accessory.c[1]} opacity="0.9" />
          <path d="M62 190 H64 M138 190 H136" stroke={b} strokeWidth="8" />
        </g>
      );
  }
}

function FairyWings({ c }: { c: [string, string] }) {
  return (
    <g opacity="0.85">
      <path d="M96 128 Q40 70 36 140 Q40 190 96 170 Z" fill="#bff3ff" stroke="#8fd9ee" strokeWidth="2" />
      <path d="M104 128 Q160 70 164 140 Q160 190 104 170 Z" fill="#bff3ff" stroke="#8fd9ee" strokeWidth="2" />
      <path d="M96 172 Q52 182 56 224 Q82 220 96 180 Z" fill="#d8f8ff" stroke="#8fd9ee" strokeWidth="2" />
      <path d="M104 172 Q148 182 144 224 Q118 220 104 180 Z" fill="#d8f8ff" stroke="#8fd9ee" strokeWidth="2" />
      <circle cx="64" cy="136" r="5" fill={c[1]} opacity="0.7" />
      <circle cx="136" cy="136" r="5" fill={c[1]} opacity="0.7" />
    </g>
  );
}

function Shoe({ kind, c }: { kind: Doll["shoes"]["kind"]; c: [string, string] }) {
  const [a, b] = c;
  // vlevá bota; pravá se zrcadlí
  switch (kind) {
    case "heels":
      return (
        <g>
          <path d="M82 346 L98 346 L98 358 L80 358 Q75 356 82 346 Z" fill={a} />
          <rect x="93" y="358" width="4" height="12" rx="1" fill={a} />
          <path d="M82 348 H98" stroke={b} strokeWidth="2" />
        </g>
      );
    case "sneaker":
      return (
        <g>
          <path d="M78 346 L98 346 L98 362 Q82 366 74 362 Q74 352 78 346 Z" fill={a} stroke="#c8ccd8" strokeWidth="1" />
          <rect x="73" y="361" width="26" height="5" rx="2.5" fill={b} />
          <path d="M82 350 L92 352 M82 355 L92 357" stroke={b} strokeWidth="2" />
        </g>
      );
    case "boots":
      return (
        <g>
          <path d="M82 306 L98 306 L98 362 L70 362 Q70 352 82 348 Z" fill={a} />
          <rect x="70" y="360" width="30" height="6" rx="3" fill={b} />
          <path d="M82 316 H98 M82 328 H98" stroke={b} strokeWidth="2.5" />
        </g>
      );
    case "ballet":
      return (
        <g>
          <ellipse cx="88" cy="356" rx="12" ry="6.5" fill={a} />
          <path d="M82 346 Q92 352 98 346 M84 350 L96 358 M96 350 L84 358" stroke={b} strokeWidth="2" fill="none" />
        </g>
      );
    case "clog":
      return (
        <g>
          <path d="M76 346 L98 346 L98 364 L72 364 Q70 352 76 346 Z" fill={a} />
          <rect x="72" y="362" width="28" height="6" rx="2" fill={b} />
          <circle cx="86" cy="353" r="2.5" fill={b} />
        </g>
      );
    case "moon":
      return (
        <g>
          <path d="M82 312 L98 312 L98 366 L68 366 Q68 354 82 350 Z" fill={a} />
          <rect x="66" y="360" width="34" height="10" rx="5" fill={b} />
          <rect x="82" y="312" width="16" height="8" fill={b} />
        </g>
      );
  }
}

function Accessory({ kind, c }: { kind: Doll["accessory"]["kind"]; c: [string, string] }) {
  const [a, b] = c;
  switch (kind) {
    case "necklace":
      return (
        <g>
          <path d="M84 112 Q100 140 116 112" stroke={a} strokeWidth="2.5" fill="none" />
          <circle cx="100" cy="132" r="6" fill={b} stroke={a} strokeWidth="2" />
          <circle cx="92" cy="127" r="2" fill={a} />
          <circle cx="108" cy="127" r="2" fill={a} />
        </g>
      );
    case "glasses":
      return (
        <g>
          <rect x="76" y="64" width="22" height="16" rx="5" fill={b} opacity="0.55" stroke={a} strokeWidth="3" />
          <rect x="102" y="64" width="22" height="16" rx="5" fill={b} opacity="0.55" stroke={a} strokeWidth="3" />
          <path d="M98 70 H102 M76 68 L68 64 M124 68 L132 64" stroke={a} strokeWidth="3" />
        </g>
      );
    case "wand":
      return (
        <g>
          <path d="M134 214 L152 140" stroke={a} strokeWidth="4" strokeLinecap="round" />
          <path d="M153 120 l5 12 13 1 -10 8 4 13 -12 -7 -12 7 4 -13 -10 -8 13 -1 z" fill={b} stroke="#e0b800" strokeWidth="1.5" />
        </g>
      );
    case "bag":
      return (
        <g>
          <path d="M56 196 Q66 176 76 196" stroke={a} strokeWidth="3" fill="none" />
          <rect x="50" y="196" width="32" height="26" rx="5" fill={b} stroke={a} strokeWidth="2" />
        </g>
      );
    case "ladle":
      return (
        <g>
          <path d="M138 210 L146 140" stroke={b} strokeWidth="5" strokeLinecap="round" />
          <circle cx="147" cy="132" r="11" fill={a} stroke="#8a909c" strokeWidth="2" />
        </g>
      );
    case "star":
      return (
        <g>
          <path d="M88 128 l3.5 8 9 .8 -6.8 6 2.1 8.8 -7.8 -4.7 -7.8 4.7 2.1 -8.8 -6.8 -6 9 -.8 z" fill={a} stroke={b} strokeWidth="1.5" transform="translate(12 -2)" />
        </g>
      );
  }
}

function Topper({ kind, c }: { kind: Doll["topper"]["kind"]; c: [string, string] }) {
  const [a, b] = c;
  switch (kind) {
    case "crown":
      return (
        <g>
          <path d="M72 44 L76 22 L88 36 L100 16 L112 36 L124 22 L128 44 Z" fill={a} stroke="#d4a700" strokeWidth="1.5" />
          <circle cx="100" cy="30" r="3.5" fill={b} />
          <circle cx="82" cy="38" r="2.5" fill={b} />
          <circle cx="118" cy="38" r="2.5" fill={b} />
        </g>
      );
    case "cap":
      return (
        <g>
          <path d="M68 52 Q68 22 100 22 Q132 22 132 52 Z" fill={a} />
          <path d="M126 50 Q154 50 150 58 L124 56 Z" fill={a} />
          <rect x="68" y="48" width="64" height="6" rx="3" fill={b} />
          <circle cx="100" cy="22" r="3" fill={b} />
        </g>
      );
    case "jacket":
      return (
        <g>
          <path d="M76 114 L62 204 M124 114 L138 204" stroke={a} strokeWidth="15" strokeLinecap="round" />
          <path d="M76 114 L90 114 L92 206 L74 206 Z" fill={a} />
          <path d="M124 114 L110 114 L108 206 L126 206 Z" fill={a} />
          <path d="M90 114 L98 140 L92 150 Z M110 114 L102 140 L108 150 Z" fill={b} />
          <circle cx="66" cy="172" r="2.5" fill={b} />
          <circle cx="134" cy="172" r="2.5" fill={b} />
          <path d="M76 196 H92 M108 196 H124" stroke={b} strokeWidth="2.5" />
        </g>
      );
    case "flowers":
      return (
        <g>
          {[
            [72, 46],
            [84, 36],
            [100, 32],
            [116, 36],
            [128, 46],
          ].map(([x, y], i) => (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((r) => (
                <ellipse key={r} cx={x} cy={y - 5} rx="3.2" ry="5" fill={i % 2 ? "#ffffff" : a} transform={`rotate(${r} ${x} ${y})`} />
              ))}
              <circle cx={x} cy={y} r="2.6" fill={b} />
            </g>
          ))}
        </g>
      );
    case "chefhat":
      return (
        <g>
          <path d="M72 46 Q56 40 64 24 Q70 8 88 14 Q100 2 114 14 Q134 8 138 26 Q146 42 128 46 L128 58 L72 58 Z" fill={a} stroke={b} strokeWidth="2" />
          <path d="M72 52 H128" stroke={b} strokeWidth="2" />
        </g>
      );
    case "helmet":
      return (
        <g>
          <circle cx="100" cy="70" r="46" fill={a} opacity="0.28" stroke="#ffffff" strokeWidth="3" />
          <path d="M70 40 Q84 24 104 24" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.8" strokeLinecap="round" />
          <rect x="62" y="104" width="76" height="12" rx="6" fill={b} />
          <circle cx="76" cy="110" r="3" fill="#fff" />
          <circle cx="124" cy="110" r="3" fill="#fff" />
        </g>
      );
  }
}

// Panenka v šedých kraťasech a sportovní podprsence; kusy oblečení přibývají podle `worn`.
export function DollSvg({ doll, worn, mood, className }: { doll: Doll; worn: Worn; mood: Mood; className?: string }) {
  const hasMakeup = worn.makeup !== undefined;
  const mouth = mood === "sad" ? "M91 91 Q100 83 109 91" : mood === "happy" ? "M90 85 Q100 97 110 85" : "M92 88 Q100 92 108 88";
  const lipHue = worn.makeup ? { filter: `hue-rotate(${worn.makeup.h * 360 + worn.makeup.v * 70}deg)` } : undefined;
  return (
    <svg viewBox="0 0 200 400" className={className} role="img" aria-hidden>
      <ellipse cx="100" cy="384" rx="60" ry="9" fill="rgba(0,0,0,0.16)" />
      <g className={mood === "sad" ? "doll-sad" : "doll-idle"}>
        {worn.outfit !== undefined && doll.outfit.kind === "fairy" && <FairyWings c={doll.outfit.c} />}
        {worn.hair !== undefined && (
          <Piece slot="hair" worn={worn}>
            <HairBack kind={doll.hair.kind} c={doll.hair.c} />
          </Piece>
        )}

        {/* tělo */}
        <g>
          <path d="M78 118 L64 204 M122 118 L136 204" stroke={doll.skin} strokeWidth="11" strokeLinecap="round" />
          <circle cx="63" cy="208" r="6.5" fill={doll.skin} />
          <circle cx="137" cy="208" r="6.5" fill={doll.skin} />
          <path d="M87 214 L90 350 M113 214 L110 350" stroke={doll.skin} strokeWidth="15" strokeLinecap="round" />
          <path d="M78 114 Q100 106 122 114 L118 152 Q113 178 116 200 L119 222 L81 222 L84 200 Q87 178 82 152 Z" fill={doll.skin} />
          <rect x="93" y="94" width="14" height="22" rx="6" fill={doll.skin} />
          {/* šedé spodní prádlo */}
          <path d="M82 126 Q100 118 118 126 L116 144 Q100 151 84 144 Z" fill={GREY} />
          <path d="M84 124 L82 116 M116 124 L118 116" stroke={GREY_DARK} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M81 200 L119 200 L123 238 L102 238 L100 224 L98 238 L77 238 Z" fill={GREY} />
          <path d="M81 204 H119" stroke={GREY_DARK} strokeWidth="3" />
        </g>

        <Piece slot="outfit" worn={worn}>
          <Outfit doll={doll} kind={doll.outfit.kind} c={doll.outfit.c} />
        </Piece>
        <Piece slot="shoes" worn={worn}>
          <Shoe kind={doll.shoes.kind} c={doll.shoes.c} />
          <g transform="translate(200 0) scale(-1 1)">
            <Shoe kind={doll.shoes.kind} c={doll.shoes.c} />
          </g>
        </Piece>
        <Piece slot="topper" worn={worn}>
          {doll.topper.kind === "jacket" ? <Topper kind="jacket" c={doll.topper.c} /> : null}
        </Piece>

        {/* hlava */}
        <ellipse cx="100" cy="72" rx="30" ry="33" fill={doll.skin} />
        <ellipse cx="70" cy="74" rx="4" ry="7" fill={doll.skin} />
        <ellipse cx="130" cy="74" rx="4" ry="7" fill={doll.skin} />
        <circle cx="82" cy="82" r="5.5" fill={hasMakeup ? doll.makeup.blush : "#ff9ab8"} opacity={hasMakeup ? 0.75 : 0.22} />
        <circle cx="118" cy="82" r="5.5" fill={hasMakeup ? doll.makeup.blush : "#ff9ab8"} opacity={hasMakeup ? 0.75 : 0.22} />
        {hasMakeup && (
          <g style={lipHue}>
            <ellipse cx="89" cy="66" rx="8" ry="4.5" fill={doll.makeup.shadow} opacity="0.65" />
            <ellipse cx="111" cy="66" rx="8" ry="4.5" fill={doll.makeup.shadow} opacity="0.65" />
          </g>
        )}
        <ellipse cx="89" cy="73" rx="3.6" ry={mood === "sad" ? 3.2 : 4.6} fill={INK} />
        <ellipse cx="111" cy="73" rx="3.6" ry={mood === "sad" ? 3.2 : 4.6} fill={INK} />
        <circle cx="90.4" cy="71.4" r="1.3" fill="#fff" />
        <circle cx="112.4" cy="71.4" r="1.3" fill="#fff" />
        {hasMakeup && <path d="M83 69 L79 66 M86 67 L84 63 M117 69 L121 66 M114 67 L116 63" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />}
        <path d={mood === "sad" ? "M83 63 L94 66 M117 63 L106 66" : "M83 64 Q89 61 95 64 M105 64 Q111 61 117 64"} stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M100 76 Q98 82 101 82" stroke="rgba(0,0,0,0.22)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d={mouth} stroke={hasMakeup ? doll.makeup.lips : "#b5524f"} strokeWidth={hasMakeup ? 4 : 2.6} fill="none" strokeLinecap="round" style={lipHue} />
        {mood === "sad" && <path d="M85 80 Q83 88 86 90 Q89 88 88 80 Z" fill="#7fd0ff" opacity="0.85" className="doll-tear" />}

        {worn.hair !== undefined && (
          <Piece slot="hair" worn={worn}>
            <HairFront kind={doll.hair.kind} c={doll.hair.c} />
          </Piece>
        )}
        <Piece slot="accessory" worn={worn}>
          <Accessory kind={doll.accessory.kind} c={doll.accessory.c} />
        </Piece>
        <Piece slot="topper" worn={worn}>
          {doll.topper.kind !== "jacket" ? <Topper kind={doll.topper.kind} c={doll.topper.c} /> : null}
        </Piece>
      </g>
    </svg>
  );
}
