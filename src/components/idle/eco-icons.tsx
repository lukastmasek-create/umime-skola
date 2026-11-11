import { ECO_BARE, ECO_ICON_SVG } from "./eco-icon-data";

/**
 * Ikony her (Ekonomika, Město, Farma, Základna, Mazlíčci, Výzvy).
 *
 * Vlastní sada: barevná dlaždice s přechodem a bílý duotónový symbol. Symboly jsou
 * z Lucide (ISC), chybějící (zvířata, plodiny) jsou nakreslené ve stejném stylu.
 * Data generuje tools/eco-icons/gen.py; tam se ikony i barvy upravují.
 *
 * Klíčem je původní emoji znak (bez variačního selektoru U+FE0F), takže
 * `<Ico e="🍎" />` i `<EmojiText>` fungují nad stávajícími daty a překlady.
 * Znak bez ikony se vykreslí jako text, nic nezmizí.
 */

const norm = (e: string) => e.replace(/️/g, "");
const KEYS = Object.keys(ECO_ICON_SVG);
const BARE = new Set(ECO_BARE);

export function hasIcon(e: string): boolean {
  return norm(e) in ECO_ICON_SVG;
}

/** Celé SVG ikony jako řetězec (pro canvas a další místa mimo React). */
export function iconSvg(e: string, size = 96): string | null {
  const inner = ECO_ICON_SVG[norm(e)];
  if (!inner) return null;
  const color = BARE.has(norm(e)) ? ' color="#1e1b4b"' : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}"${color}>${inner}</svg>`;
}

/**
 * Jedna ikona. Se `x`/`y` se kreslí uvnitř jiného `<svg>` (např. v obrázku mazlíčka),
 * jinak jako řádkový obrázek, který sedí na účaří textu.
 */
export function Ico({ e, size = "1.25em", className = "", x, y }: { e: string; size?: number | string; className?: string; x?: number; y?: number }) {
  const inner = ECO_ICON_SVG[norm(e)];
  if (!inner) return <span aria-hidden>{e}</span>;
  if (x !== undefined && y !== undefined) {
    return <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: inner }} />;
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={`eco-ico inline-block shrink-0 align-[-0.3em] ${className}`}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}

// Pro texty z překladů: nahradí v řetězci všechny známé emoji ikonami.
const SPLIT = new RegExp(
  `(${[...KEYS]
    .sort((a, b) => b.length - a.length)
    .map((k) => Array.from(k).map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\uFE0F?"))
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
export const ALL: string[] = KEYS;
