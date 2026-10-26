// 3D mazlíčci z Blenderu (umime-art/scripts/pets.py): public/pets/<druh>.glb s animacemi
// "klid" (smyčka), "jedeni", "hrani" a "radost" (jednou), výrazy podle nálady a kotvami pro doplňky.
// Statické rendery public/pets/<druh>-<nálada>.webp slouží jako náhled a záloha bez WebGL.
import type { PetMood } from "@/components/idle/PetArt";
import type { SpeciesId } from "@/lib/idle/pets";

export type PetAction = "feed" | "play" | "joy";

// Druhy, které mají 3D model z Blenderu. Ostatní se kreslí jen 2D (PetArt).
export const PETS_WITH_3D: ReadonlySet<string> = new Set(["cat", "dog", "bunny", "fox", "dragon"]);

export function petModel(species: SpeciesId): string {
  return `/pets/${species}.glb`;
}

export function petStill(species: SpeciesId, mood: PetMood): string {
  return `/pets/${species}-${mood}.webp`;
}

export function petAccessoryModel(ref: string): string {
  return `/pets/accessories/${ref}.glb`;
}

// Kam se který doplněk z obchodu připíná (prázdné objekty v modelu mazlíčka).
export const PET_ACCESSORY_ANCHOR: Record<string, string> = {
  party: "kotva_hlava",
  crown: "kotva_hlava",
  bow: "kotva_ucho",
  flower: "kotva_ucho",
  glasses: "kotva_oci",
  scarf: "kotva_krk",
};
