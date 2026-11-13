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
  effectsTitle: string;
  effectNames: Record<"trail" | "glow" | "shake" | "squash" | "shadow", string>;
  effectLearn: Record<"trail" | "glow" | "shake" | "squash" | "shadow", string>;
  intensity: string;
  templatesTitle: string;
  templateNames: Record<"jump" | "pendulum" | "bounce" | "spin", string>;
  templateLearn: Record<"jump" | "pendulum" | "bounce" | "spin", string>;
  learnTitle: string;
  learnEmpty: string;
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
  effectsTitle: "Efekty",
  effectNames: { trail: "stopa", glow: "záře", shake: "třes", squash: "protažení", shadow: "stín" },
  effectLearn: {
    trail: "Stopa ukazuje, kudy postava letěla. Čím jsou tečky dál od sebe, tím byla rychlejší.",
    glow: "Záře připomíná zdroj světla, třeba žárovku nebo slunce.",
    shake: "Třes je rychlé kmitání. Čím větší síla, tím větší vibrace.",
    squash: "Při rychlém pohybu se tvar natáhne. Ukazuje setrvačnost a pružnost.",
    shadow: "Stín na zemi: čím výš postava je, tím menší a světlejší stín má.",
  },
  intensity: "síla",
  templatesTitle: "Hotové součástky",
  templateNames: { jump: "skok s gravitací", pendulum: "kyvadlo", bounce: "odrazy míčku", spin: "rovnoměrné otáčení" },
  templateLearn: {
    jump: "Gravitace táhne dolů. Nahoru se pohyb zpomaluje, dolů zrychluje, takže vzlet a pád vypadají stejně.",
    pendulum: "Kyvadlo se na krajích zastaví a uprostřed je nejrychlejší. Pohyb se pořád opakuje dokola.",
    bounce: "Při každém dopadu se část energie ztratí, proto je každý odskok nižší než předchozí.",
    spin: "Rovnoměrný pohyb: za stejný čas se otočí vždy o stejný úhel.",
  },
  learnTitle: "Co se tady učíš",
  learnEmpty: "Zapni efekt nebo přidej hotovou součástku a uvidíš, co to ukazuje.",
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
  effectsTitle: "Effects",
  effectNames: { trail: "trail", glow: "glow", shake: "shake", squash: "stretch", shadow: "shadow" },
  effectLearn: {
    trail: "The trail shows where the character flew. The farther apart the dots, the faster it moved.",
    glow: "A glow looks like a light source, such as a bulb or the sun.",
    shake: "Shake is fast wobbling. The bigger the strength, the stronger the vibration.",
    squash: "A fast move stretches the shape. It shows inertia and elasticity.",
    shadow: "A shadow on the ground: the higher the character is, the smaller and lighter its shadow.",
  },
  intensity: "strength",
  templatesTitle: "Ready-made parts",
  templateNames: { jump: "jump with gravity", pendulum: "pendulum", bounce: "bouncing ball", spin: "steady spin" },
  templateLearn: {
    jump: "Gravity pulls down. Going up slows down, falling speeds up, so the jump up and the fall look alike.",
    pendulum: "A pendulum stops at the ends and is fastest in the middle. The motion repeats over and over.",
    bounce: "Each landing loses some energy, so every bounce is lower than the one before.",
    spin: "Steady motion: it turns the same angle in the same time every time.",
  },
  learnTitle: "What you learn here",
  learnEmpty: "Turn on an effect or add a ready-made part and you'll see what it shows.",
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
