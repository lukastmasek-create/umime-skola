import { withFallbacks } from "./config";
import type { Locale } from "./config";

// Texty vzhledové části Nastavení (motiv, akcentní barva).
export type SettingsLookText = {
  themes: string;
  themesHint: string;
  accent: string;
  accentHint: string;
  customColor: string;
  fontStyleHint: string;
  fontSizeHint: string;
  group: string;
};

const texts = withFallbacks<SettingsLookText>({
  cs: {
    themes: "Motiv",
    themesHint: "Vyber si styl nebo si uprav vlastní motiv.",
    accent: "Akcentní barva",
    accentHint: "Použij systémovou nebo vlastní akcentní barvu.",
    customColor: "Vlastní barva",
    fontStyleHint: "Hravé písmo pro nadpisy, nebo klasické.",
    fontSizeHint: "Zvětší nebo zmenší text na celé stránce.",
    group: "Obecné",
  },
  en: {
    themes: "Themes",
    themesHint: "Choose your style or customize your theme.",
    accent: "Accent Colors",
    accentHint: "Use system or custom accent colors.",
    customColor: "Custom Color",
    fontStyleHint: "Playful headings or a classic look.",
    fontSizeHint: "Makes text on the whole site bigger or smaller.",
    group: "General",
  },
  de: {
    themes: "Designs",
    themesHint: "Wähle deinen Stil oder passe dein Design an.",
    accent: "Akzentfarben",
    accentHint: "System- oder eigene Akzentfarbe verwenden.",
    customColor: "Eigene Farbe",
    fontStyleHint: "Verspielte Überschriften oder klassisch.",
    fontSizeHint: "Macht den Text auf der ganzen Seite größer oder kleiner.",
    group: "Allgemein",
  },
  ru: {
    themes: "Темы",
    themesHint: "Выбери стиль или настрой тему.",
    accent: "Акцентные цвета",
    accentHint: "Системный или свой акцентный цвет.",
    customColor: "Свой цвет",
    fontStyleHint: "Игривые заголовки или классика.",
    fontSizeHint: "Увеличивает или уменьшает текст на всём сайте.",
    group: "Общие",
  },
});
export const getSettingsLookText = (locale: Locale) => texts[locale];
