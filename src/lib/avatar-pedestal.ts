// Podstavec pod 3D avatarem v profilu podle tématu postavy (sprity 24 snímků z umime-art/blender/profil.py).
export type PedestalTheme = "vesmir" | "more" | "les" | "hrad" | "kouzla" | "pohadka";

const THEME: Record<string, PedestalTheme> = {
  astronaut: "vesmir", alien: "vesmir", robot: "vesmir", cosmic: "vesmir", "robot-dino": "vesmir", pilot: "vesmir", inventor: "vesmir", kosmonautka: "vesmir", robopes: "vesmir",
  pirate: "more", captain: "more", "sea-wolf": "more", mermaid: "more", diver: "more", octopus: "more", sailor: "more", penguin: "more", piratka: "more", zralok: "more",
  fox: "les", owl: "les", frog: "les", ranger: "les", fairy: "les", elf: "les", koala: "les", panda: "les", capybara: "les", llama: "les", explorer: "les", archaeologist: "les", skritek: "les", veverka: "les",
  king: "hrad", knight: "hrad", princess: "hrad", dwarf: "hrad", founder: "hrad", dragon: "hrad", princ: "hrad", carodejnice: "kouzla",
  "star-wanderer": "vesmir", "coral-guardian": "more", "forest-spirit": "les", blacksmith: "hrad", "moon-witch": "kouzla",
  wizard: "kouzla", unicorn: "kouzla", phoenix: "kouzla", ghost: "kouzla", vampire: "kouzla", mummy: "kouzla", pumpkin: "kouzla", winter: "kouzla", yeti: "kouzla", ninja: "kouzla",
};

export const pedestalTheme = (avatar: string | null | undefined): PedestalTheme => (avatar && THEME[avatar]) || "pohadka";
export const pedestalUrl = (avatar: string | null | undefined) => {
  const t = pedestalTheme(avatar);
  return t === "pohadka" ? "/home/profil/podstavec.webp" : `/home/profil/podstavec-${t}.webp`;
};
