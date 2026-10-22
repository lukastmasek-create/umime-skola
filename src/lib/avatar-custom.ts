// Úpravy vzhledu 3D avatarů. Modely z Blenderu mají pojmenované materiály a části,
// takže barvy a doplňky se hledají podle jmen (stejně pro všechny postavy).
// Uložené úpravy jsou u každého avataru zvlášť v ProfileStyle.custom (src/lib/cosmetics.ts).

export const SLOTS = ["head", "body", "arms", "tail", "topper", "eyes", "glow"] as const;
export type Slot = (typeof SLOTS)[number];

// Jméno materiálu v modelu → slot, který se přebarvuje.
export const SLOT_MATERIAL: Record<Slot, RegExp> = {
  head: /_hlava_mat$/,
  body: /_telo_mat$/,
  arms: /_ruka_(leva|prava)_mat$/,
  tail: /_ocas_mat$/,
  topper: /_antena_mat$/,
  eyes: /^Av_oko$/,
  glow: /^Av_(svit|astro_svit|dyne_svit)$/,
};

export const TOGGLES = ["whiskers", "tail", "topper", "crown", "earring", "extra"] as const;
export type Toggle = (typeof TOGGLES)[number];

// Jméno části modelu → doplněk, který jde skrýt.
export const TOGGLE_NODE: Record<Toggle, RegExp> = {
  whiskers: /_vous_/,
  tail: /_ocas_model$/,
  topper: /_antena_model$/,
  crown: /^koruna/,
  earring: /_nausnice$/,
  extra: /_(preska|zezlo.*|hvezda|hvezdice|banka|roztok|sklicko_.*|knoflik_\d)$/,
};

export const PATTERNS = ["none", "stripes", "dots", "checks", "belly"] as const;
export type Pattern = (typeof PATTERNS)[number];

export type AvatarCustom = {
  colors: Partial<Record<Slot, string>>;
  hidden: Toggle[];
  pattern: Pattern;
  patternColor: string;
};

export const EMPTY_CUSTOM: AvatarCustom = { colors: {}, hidden: [], pattern: "none", patternColor: "#ffffff" };

export const PALETTE = [
  "#ff5d73", "#ff9f43", "#ffd24d", "#7ee0b0", "#3ddc97", "#3fc1ff",
  "#5a6cff", "#a87bff", "#ff8fd0", "#8b5a2b", "#f4f1ea", "#9aa4b8", "#3a3f55", "#16132b",
];

const HEX = /^#[0-9a-fA-F]{6}$/;

export function isHex(v: unknown): v is string {
  return typeof v === "string" && HEX.test(v);
}

export function normalizeCustom(raw: unknown): AvatarCustom {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<AvatarCustom>;
  const colors: Partial<Record<Slot, string>> = {};
  for (const slot of SLOTS) {
    const v = (r.colors as Record<string, unknown> | undefined)?.[slot];
    if (isHex(v)) colors[slot] = v.toLowerCase();
  }
  const hidden = Array.isArray(r.hidden) ? TOGGLES.filter((t) => (r.hidden as unknown[]).includes(t)) : [];
  const pattern = PATTERNS.find((p) => p === r.pattern) ?? "none";
  return { colors, hidden: [...hidden], pattern, patternColor: isHex(r.patternColor) ? r.patternColor.toLowerCase() : "#ffffff" };
}

export function normalizeCustomMap(raw: unknown, avatarIds?: string[]): Record<string, AvatarCustom> {
  const out: Record<string, AvatarCustom> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (avatarIds && !avatarIds.includes(id)) continue;
    out[id] = normalizeCustom(value);
  }
  return out;
}

// Co model skutečně umí (zjistí se po načtení modelu).
export type AvatarParts = { slots: Slot[]; toggles: Toggle[] };
