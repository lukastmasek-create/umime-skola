// Vlastní akcentní barva: přepíše značkové barvy přímo na <html>.
// Stejnou logiku opakuje THEME_INIT_SCRIPT, aby barva nepoblikla při načtení.
export const ACCENT_PRESETS = ["#1f2347", "#f0413a", "#22a84a", "#2f86f0", "#a855f7"] as const;
export const DEFAULT_ACCENT = "#4146f8";

export function normalizeHex(input: string): string | null {
  const v = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(v)) return `#${v.toLowerCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(v)) return `#${v.split("").map((c) => c + c).join("").toLowerCase()}`;
  return null;
}

export function applyAccent(hex: string | null) {
  const s = document.documentElement.style;
  const keys = ["--brand-500", "--brand-600", "--brand-700", "--brand-50", "--brand-100"];
  if (!hex) {
    keys.forEach((k) => s.removeProperty(k));
    return;
  }
  s.setProperty("--brand-500", hex);
  s.setProperty("--brand-600", `color-mix(in srgb, ${hex} 80%, black)`);
  s.setProperty("--brand-700", `color-mix(in srgb, ${hex} 60%, black)`);
  s.setProperty("--brand-50", `color-mix(in srgb, ${hex} 12%, var(--surface))`);
  s.setProperty("--brand-100", `color-mix(in srgb, ${hex} 24%, var(--surface))`);
}
