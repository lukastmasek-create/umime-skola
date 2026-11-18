// Vrstvy ilustrovaných ikon z public/ikony (generuje tools/icons/build-webp.mjs, viz docs/ICONS_WEBP.md).
// Ikona = tělo (<název>.webp) + třpytky (<název>.tw<N>.webp) + stín kreslený v CSS. Pohupování a třpyt
// dělá CSS (třídy .ik-* v globals.css), takže se respektuje prefers-reduced-motion.
// Modul je bez Reactu, aby ho šlo použít i pro řetězce HTML (iconHtml) a v ověřovacím skriptu.
import { ICON_MANIFEST } from "./icon-manifest";

export type IconPart = { src: string; style: Record<string, string> };
export type IconParts = {
  body: string;
  bob: boolean;
  shadow: Record<string, string> | null;
  sparkles: IconPart[];
};

const pct = (n: number) => `${n}%`;

export function iconParts(name: string): IconParts {
  const e = ICON_MANIFEST[name];
  // Ponechané SVG (složená animace) nebo neznámý název: jen samotný obrázek, jako dřív.
  if (!e) return { body: `/ikony/${name}.webp`, bob: false, shadow: null, sparkles: [] };
  if (e.v) return { body: `/ikony/${name}.svg`, bob: false, shadow: null, sparkles: [] };
  const s = e.s;
  return {
    body: `/ikony/${name}.webp`,
    bob: !!e.b,
    shadow: s
      ? { left: pct(s[0]), top: pct(s[1]), width: pct(s[2]), height: pct(s[3]), background: `radial-gradient(closest-side, rgba(0,0,0,${s[4]}), rgba(0,0,0,0))` }
      : null,
    sparkles: (e.t ?? []).map((t, i) => ({
      src: `/ikony/${name}.tw${i + 1}.webp`,
      style: { left: pct(t[0]), top: pct(t[1]), width: pct(t[2]), height: pct(t[2]), animationDelay: `${t[3]}s`, "--o": String(t[4]) },
    })),
  };
}

/** Zda ikona kreslí SVG (výjimka z převodu na WebP). */
export const iconIsVector = (name: string) => !!ICON_MANIFEST[name]?.v;

const css = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => `${k.startsWith("--") ? k : k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}:${v}`).join(";");

/** Stejné DOM jako komponenta Icon, jako řetězec (pro innerHTML mimo React). Dekorativní, bez alt. */
export function iconHtml(name: string, size: number): string {
  const p = iconParts(name);
  const img = (src: string, style = "", cls = "") => `<img${cls ? ` class="${cls}"` : ""} src="${src}" alt="" loading="lazy" decoding="async" draggable="false"${style ? ` style="${style}"` : ""}>`;
  return (
    `<span class="ik inline-block select-none" aria-hidden="true" style="width:${size}px;height:${size}px">` +
    (p.shadow ? `<i class="ik-sh" style="${css(p.shadow)}"></i>` : "") +
    `<span class="ik-bob${p.bob ? " ik-b" : ""}">` +
    img(p.body) +
    p.sparkles.map((s) => img(s.src, css(s.style), "ik-tw")).join("") +
    `</span></span>`
  );
}
