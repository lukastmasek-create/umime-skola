import { withFallbacks } from "./config";
import type { Locale } from "./config";

export type AnimatorText = {
  nav: string;
  title: string;
  subtitle: string;
  play: string;
  pause: string;
  loop: string;
  addObject: string;
  deleteObject: string;
  objectName: string;
  shape: string;
  color: string;
  timeline: string;
  duration: string;
  addKey: string;
  deleteKey: string;
  keyHint: string;
  ease: string;
  easings: Record<"linear" | "ease" | "bounce", string>;
  props: Record<"x" | "y" | "rot" | "scale" | "opacity", string>;
  shapes: Record<"cat" | "star" | "heart" | "sun" | "ball", string>;
  stageLabel: string;
  noObject: string;
  saved: string;
  reset: string;
  resetConfirm: string;
  howTitle: string;
  howSteps: string[];
};

const CS: AnimatorText = {
  nav: "Animátor",
  title: "Animátor",
  subtitle: "Nakresli pohyb po klíčových snímcích. Vyber postavu, přetáhni ji na jevišti, ulož klíč a pusť to.",
  play: "Přehrát",
  pause: "Pauza",
  loop: "Dokola",
  addObject: "Přidat postavu",
  deleteObject: "Smazat postavu",
  objectName: "Jméno",
  shape: "Tvar",
  color: "Barva",
  timeline: "Časová osa",
  duration: "Délka",
  addKey: "Uložit klíč",
  deleteKey: "Smazat klíč",
  keyHint: "Klíč je snímek, kde má postava danou polohu. Mezi klíči se pohyb dopočítá sám.",
  ease: "Jak se dojíždí",
  easings: { linear: "rovnoměrně", ease: "měkce", bounce: "odskočí" },
  props: { x: "x", y: "y", rot: "natočení °", scale: "velikost", opacity: "viditelnost" },
  shapes: { cat: "kočka", star: "hvězda", heart: "srdce", sun: "slunce", ball: "míček" },
  stageLabel: "Jeviště animátoru",
  noObject: "Přidej postavu a začni animovat.",
  saved: "Uloženo ve tvém prohlížeči",
  reset: "Začít znovu",
  resetConfirm: "Opravdu zahodit celou animaci?",
  howTitle: "Jak na to",
  howSteps: [
    "Vyber postavu a přesuň čas na časové ose.",
    "Postavu posuň, otoč nebo zvětši na jevišti, nebo ji nastav v panelu.",
    "Klikni na „Uložit klíč“. Opakuj v jiném čase.",
    "Přehraj a koukni, jak se to hýbe.",
  ],
};

const EN: AnimatorText = {
  nav: "Animator",
  title: "Animator",
  subtitle: "Draw movement with keyframes. Pick a character, move it on the stage, save a key and press play.",
  play: "Play",
  pause: "Pause",
  loop: "Loop",
  addObject: "Add character",
  deleteObject: "Delete character",
  objectName: "Name",
  shape: "Shape",
  color: "Color",
  timeline: "Timeline",
  duration: "Length",
  addKey: "Save key",
  deleteKey: "Delete key",
  keyHint: "A key is a frame where the character has a given pose. Movement between keys is filled in for you.",
  ease: "How it arrives",
  easings: { linear: "steady", ease: "smooth", bounce: "bounces" },
  props: { x: "x", y: "y", rot: "rotation °", scale: "size", opacity: "visibility" },
  shapes: { cat: "cat", star: "star", heart: "heart", sun: "sun", ball: "ball" },
  stageLabel: "Animator stage",
  noObject: "Add a character and start animating.",
  saved: "Saved in your browser",
  reset: "Start over",
  resetConfirm: "Really throw away the whole animation?",
  howTitle: "How it works",
  howSteps: [
    "Pick a character and move the time on the timeline.",
    "Drag, turn or resize it on the stage, or set values in the panel.",
    "Press “Save key”. Repeat at a different time.",
    "Press play and watch it move.",
  ],
};

const TEXT = withFallbacks({ cs: CS, en: EN, de: EN, ru: EN });

export function getAnimatorText(locale: Locale): AnimatorText {
  return TEXT[locale];
}
