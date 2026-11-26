import type { Locale } from "./config";

// Texty herních přechodů mezi sekcemi úvodní stránky: level banner, tipy, bublina, mince a zvuk.
export type HomeTransText = {
  level: string;
  tip: string;
  tips: string[];
  hello: string;
  coins: string;
  coinPick: string;
  soundOn: string;
  soundOff: string;
};

const cs: HomeTransText = {
  level: "Level",
  tip: "Tip",
  tips: [
    "Krátké opakování každý den funguje líp než dlouhé šprtání.",
    "Chyba není prohra. Přečti si vysvětlení a zkus to znovu.",
    "Nejdřív lehčí úroveň, pak těžší. Mozek se rozehřeje.",
    "Učivo vysvětli někomu jinému a zapamatuješ si ho napořád.",
    "Pauza po 25 minutách pomáhá soustředění.",
  ],
  hello: "Ahoj!",
  coins: "Mince",
  coinPick: "Sebrat minci",
  soundOn: "Zapnout zvuky",
  soundOff: "Vypnout zvuky",
};

const en: HomeTransText = {
  level: "Level",
  tip: "Tip",
  tips: [
    "A short review every day beats one long cram session.",
    "A mistake is not a loss. Read the explanation and try again.",
    "Start with an easier level, then go harder. Warm up your brain.",
    "Explain a topic to someone else and you will remember it for good.",
    "A break after 25 minutes helps you focus.",
  ],
  hello: "Hi!",
  coins: "Coins",
  coinPick: "Collect coin",
  soundOn: "Turn sound on",
  soundOff: "Turn sound off",
};

const de: HomeTransText = {
  level: "Level",
  tip: "Tipp",
  tips: [
    "Jeden Tag kurz wiederholen bringt mehr als einmal lange pauken.",
    "Ein Fehler ist keine Niederlage. Lies die Erklärung und versuch es nochmal.",
    "Erst die leichtere Stufe, dann die schwerere. So wärmt sich das Gehirn auf.",
    "Erkläre den Stoff jemand anderem und du merkst ihn dir für immer.",
    "Eine Pause nach 25 Minuten hilft beim Konzentrieren.",
  ],
  hello: "Hallo!",
  coins: "Münzen",
  coinPick: "Münze einsammeln",
  soundOn: "Ton einschalten",
  soundOff: "Ton ausschalten",
};

const ru: HomeTransText = {
  level: "Уровень",
  tip: "Совет",
  tips: [
    "Короткое повторение каждый день лучше долгой зубрёжки.",
    "Ошибка — не поражение. Прочитай объяснение и попробуй снова.",
    "Сначала уровень полегче, потом сложнее. Мозг разогреется.",
    "Объясни тему другому — и запомнишь её навсегда.",
    "Перерыв через 25 минут помогает сосредоточиться.",
  ],
  hello: "Привет!",
  coins: "Монеты",
  coinPick: "Собрать монету",
  soundOn: "Включить звук",
  soundOff: "Выключить звук",
};

const uk: HomeTransText = {
  level: "Рівень",
  tip: "Порада",
  tips: [
    "Коротке повторення щодня краще за довге зубріння.",
    "Помилка — не поразка. Прочитай пояснення і спробуй ще раз.",
    "Спершу легший рівень, потім складніший. Мозок розігріється.",
    "Поясни тему комусь іншому — і запам'ятаєш її назавжди.",
    "Перерва через 25 хвилин допомагає зосередитися.",
  ],
  hello: "Привіт!",
  coins: "Монети",
  coinPick: "Зібрати монету",
  soundOn: "Увімкнути звук",
  soundOff: "Вимкнути звук",
};

const ja: HomeTransText = {
  level: "レベル",
  tip: "ヒント",
  tips: [
    "長時間の詰め込みより、毎日の短い復習が効果的です。",
    "まちがいは負けではありません。解説を読んでもう一度挑戦しよう。",
    "まずはやさしいレベルから、次にむずかしいレベルへ。頭のウォーミングアップ。",
    "ほかの人に説明すると、ずっと覚えていられます。",
    "25分ごとの休憩が集中力を助けます。",
  ],
  hello: "こんにちは！",
  coins: "コイン",
  coinPick: "コインを集める",
  soundOn: "サウンドをオン",
  soundOff: "サウンドをオフ",
};

const es: HomeTransText = {
  level: "Nivel",
  tip: "Consejo",
  tips: [
    "Un repaso corto cada día funciona mejor que un atracón largo.",
    "Un error no es una derrota. Lee la explicación y vuelve a intentarlo.",
    "Primero un nivel más fácil, luego uno más difícil. Calienta el cerebro.",
    "Explica el tema a otra persona y lo recordarás para siempre.",
    "Una pausa cada 25 minutos ayuda a concentrarse.",
  ],
  hello: "¡Hola!",
  coins: "Monedas",
  coinPick: "Recoger moneda",
  soundOn: "Activar sonido",
  soundOff: "Desactivar sonido",
};

const fr: HomeTransText = {
  level: "Niveau",
  tip: "Astuce",
  tips: [
    "Une courte révision chaque jour vaut mieux qu'un long bachotage.",
    "Une erreur n'est pas un échec. Lis l'explication et réessaie.",
    "D'abord un niveau plus facile, puis plus difficile. Le cerveau s'échauffe.",
    "Explique la leçon à quelqu'un d'autre et tu la retiendras pour toujours.",
    "Une pause toutes les 25 minutes aide à se concentrer.",
  ],
  hello: "Salut !",
  coins: "Pièces",
  coinPick: "Ramasser la pièce",
  soundOn: "Activer le son",
  soundOff: "Couper le son",
};

const TEXT: Record<Locale, HomeTransText> = { cs, en, de, ru, uk, ja, es, fr };

export function getHomeTransText(locale: Locale): HomeTransText {
  return TEXT[locale] ?? en;
}
