import { ECO_EMOJI } from "./eco-icon-list";

/**
 * Ikony her (Ekonomika, Město, Farma, Základna, Mazlíčci, Výzvy).
 *
 * Kreslí je Fluent Emoji (Color) od Microsoftu, licence MIT, viz
 * public/icons/eco/LICENSE.txt. Každá ikona je samostatný soubor v
 * public/icons/eco, takže se stáhne až ve chvíli, kdy se někde zobrazí.
 *
 * Klíčem je původní emoji znak (bez variačního selektoru U+FE0F), takže
 * `<Ico e="🍎" />` i `<EmojiText>` fungují nad stávajícími daty a překlady.
 * Znak bez ikony se vykreslí jako text, nic nezmizí.
 */

const norm = (e: string) => e.replace(/️/g, "");
const KNOWN = new Set(ECO_EMOJI);

/** Název souboru: kódové body znaku oddělené pomlčkou. */
const codeOf = (e: string) =>
  Array.from(norm(e))
    .map((ch) => ch.codePointAt(0)!.toString(16))
    .join("-");

/** Adresa souboru s ikonou, nebo null, když pro znak žádná není. */
export function iconUrl(e: string): string | null {
  return KNOWN.has(norm(e)) ? `/icons/eco/${codeOf(e)}.svg` : null;
}

export function hasIcon(e: string): boolean {
  return KNOWN.has(norm(e));
}

/**
 * Jedna ikona. Se `x`/`y` se kreslí uvnitř jiného `<svg>` (např. v obrázku mazlíčka),
 * jinak jako běžný řádkový obrázek, který sedí na účaří textu.
 */
export function Ico({ e, size = "1.2em", className = "", x, y }: { e: string; size?: number | string; className?: string; x?: number; y?: number }) {
  const url = iconUrl(e);
  if (!url) return <span aria-hidden>{e}</span>;
  if (x !== undefined && y !== undefined) {
    return <image href={url} x={x} y={y} width={size} height={size} aria-hidden="true" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading="lazy"
      decoding="async"
      width={typeof size === "number" ? size : undefined}
      style={{ width: size, height: size }}
      className={`eco-ico inline-block shrink-0 align-[-0.25em] ${className}`}
    />
  );
}

// Pro texty z překladů: nahradí v řetězci všechny známé emoji ikonami.
const SPLIT = new RegExp(
  `(${[...ECO_EMOJI]
    .sort((a, b) => b.length - a.length)
    .map((k) => {
      const [first, ...rest] = Array.from(k);
      return [first, ...rest].map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\uFE0F?");
    })
    .join("|")})\\uFE0F?`,
  "u",
);

export function EmojiText({ text }: { text: string }) {
  const parts = text.split(SPLIT);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <Ico key={i} e={part} /> : part))}
    </>
  );
}

/** Seznam všech znaků s ikonou (pro náhledy a testy). */
export const ALL: string[] = ECO_EMOJI;
