import type { Locale } from "./config";
import type { ClassicSlug, GameSlug } from "@/lib/games";

// Texty retro her. `action` je popisek tlačítka (střelba, skok…), `upgradeAction` název vylepšení rychlosti hráče.
export type ArcadeText = {
  title: string;
  intro: string;
  controls: string;
  action: string;
  upgradeAction: string;
};

export type ArcadeSlug = Exclude<GameSlug, "space-invaders" | ClassicSlug>;

const T: Record<ArcadeSlug, Record<Locale, ArcadeText>> = {
  "pac-man": {
    cs: {
      title: "Labyrint duchů",
      intro: "Projdi bludiště a sněz správnou odpověď. Špatná odpověď ubere život, duchům se vyhýbej. Žlutá pilulka je na chvíli zneškodní!",
      controls: "šipky nebo W A S D, na telefonu táhni prstem nebo používej tlačítka",
      action: "Start",
      upgradeAction: "Rychlost hrdiny",
    },
    en: {
      title: "Ghost Labyrinth",
      intro: "Run through the maze and eat the right answer. A wrong one costs a life, so avoid the ghosts. A power pill makes them harmless for a while!",
      controls: "arrow keys or W A S D, on a phone swipe or use the buttons",
      action: "Go",
      upgradeAction: "Hero speed",
    },
    de: {
      title: "Geisterlabyrinth",
      intro: "Lauf durch das Labyrinth und friss die richtige Antwort. Eine falsche kostet ein Leben, weiche den Geistern aus. Eine Power-Pille macht sie kurz harmlos!",
      controls: "Pfeiltasten oder W A S D, am Handy wischen oder die Tasten benutzen",
      action: "Los",
      upgradeAction: "Heldentempo",
    },
    ru: {
      title: "Лабиринт призраков",
      intro: "Пройди лабиринт и съешь правильный ответ. Неверный отнимает жизнь, избегай призраков. Энергетическая таблетка ненадолго делает их безвредными!",
      controls: "стрелки или W A S D, на телефоне свайп или кнопки",
      action: "Вперёд",
      upgradeAction: "Скорость героя",
    },
  },
  snake: {
    cs: {
      title: "Had z džungle",
      intro: "Had má sníst správné jablko s odpovědí. Špatné jablko ubere život. Had po každé správné odpovědi roste a zrychluje, hra končí až ztratou všech životů. Pozor, ať se nekousneš do ocasu!",
      controls: "šipky nebo W A S D, na telefonu táhni prstem nebo používej tlačítka",
      action: "Start",
      upgradeAction: "Rychlost hada",
    },
    en: {
      title: "Jungle Snake",
      intro: "Eat the apple with the right answer. A wrong apple costs a life. The snake grows and speeds up after every right answer, and the game only ends when you lose all lives. Careful not to bite your own tail!",
      controls: "arrow keys or W A S D, on a phone swipe or use the buttons",
      action: "Go",
      upgradeAction: "Snake speed",
    },
    de: {
      title: "Dschungelschlange",
      intro: "Friss den Apfel mit der richtigen Antwort. Ein falscher Apfel kostet ein Leben. Die Schlange wächst und wird nach jeder richtigen Antwort schneller, das Spiel endet erst, wenn alle Leben weg sind. Beiß dir nicht in den Schwanz!",
      controls: "Pfeiltasten oder W A S D, am Handy wischen oder die Tasten benutzen",
      action: "Los",
      upgradeAction: "Schlangentempo",
    },
    ru: {
      title: "Змея из джунглей",
      intro: "Съешь яблоко с правильным ответом. Неверное яблоко отнимает жизнь. Змейка растёт и ускоряется после каждого верного ответа, а игра заканчивается, только когда кончатся жизни. Не укуси себя за хвост!",
      controls: "стрелки или W A S D, на телефоне свайп или кнопки",
      action: "Вперёд",
      upgradeAction: "Скорость змейки",
    },
  },
  breakout: {
    cs: {
      title: "Průlom hradeb",
      intro: "Odrážej míček pálkou a rozbij blok se správnou odpovědí. Špatný blok ubere život, stejně jako míček, který propadne.",
      controls: "← → nebo A D, na telefonu táhni prstem po hřišti",
      action: "Vypustit míček",
      upgradeAction: "Šířka pálky",
    },
    en: {
      title: "Wall Breaker",
      intro: "Bounce the ball with the paddle and break the block with the right answer. A wrong block costs a life, and so does dropping the ball.",
      controls: "← → or A D, on a phone drag your finger across the field",
      action: "Launch ball",
      upgradeAction: "Paddle width",
    },
    de: {
      title: "Mauerbrecher",
      intro: "Lenke den Ball mit dem Schläger und zerstöre den Block mit der richtigen Antwort. Ein falscher Block kostet ein Leben, ebenso ein verlorener Ball.",
      controls: "← → oder A D, am Handy mit dem Finger über das Spielfeld ziehen",
      action: "Ball starten",
      upgradeAction: "Schlägerbreite",
    },
    ru: {
      title: "Пролом стены",
      intro: "Отбивай мяч ракеткой и разбей блок с правильным ответом. Неверный блок отнимает жизнь, как и упавший мяч.",
      controls: "← → или A D, на телефоне води пальцем по полю",
      action: "Запустить мяч",
      upgradeAction: "Ширина ракетки",
    },
  },
  tetris: {
    cs: {
      title: "Pád bloků",
      intro: "Dole jsou čtyři plochy s odpověďmi. Pohybuj padající kostkou, otoč ji a shoď ji na plochu se správnou odpovědí. Zóna, na kterou kostka dopadne, svítí. Špatná plocha ubere život a zavře se.",
      controls: "← → posun, ↑ otočit, ↓ zrychlit, mezerník shodit",
      action: "Shodit",
      upgradeAction: "Ovládání kostek",
    },
    en: {
      title: "Falling Blocks",
      intro: "Four landing pads with answers wait at the bottom. Move and rotate the falling block and drop it on the pad with the right answer. The pad below the block glows. A wrong pad costs a life and closes.",
      controls: "← → move, ↑ rotate, ↓ speed up, space drop",
      action: "Drop",
      upgradeAction: "Block control",
    },
    de: {
      title: "Fallende Blöcke",
      intro: "Unten warten vier Landeflächen mit Antworten. Bewege und drehe den fallenden Block und wirf ihn auf die Fläche mit der richtigen Antwort. Die Fläche unter dem Block leuchtet. Eine falsche Fläche kostet ein Leben und schließt sich.",
      controls: "← → bewegen, ↑ drehen, ↓ schneller, Leertaste fallen lassen",
      action: "Fallen",
      upgradeAction: "Blocksteuerung",
    },
    ru: {
      title: "Падающие блоки",
      intro: "Внизу четыре площадки с ответами. Двигай и поворачивай падающий блок и сбрось его на площадку с правильным ответом. Площадка под блоком подсвечивается. Неверная отнимает жизнь и закрывается.",
      controls: "← → движение, ↑ повернуть, ↓ ускорить, пробел — сбросить",
      action: "Сбросить",
      upgradeAction: "Управление блоками",
    },
  },
  kong: {
    cs: {
      title: "Výstup na sopku",
      intro: "Vylez po žebřících nahoru a vyskoč pod blok se správnou odpovědí, tak do něj narazíš hlavou. Skákej přes valící se sudy, špatný blok ubere život.",
      controls: "← → pohyb, ↑ ↓ žebřík, mezerník skok; na telefonu tlačítka",
      action: "Skok",
      upgradeAction: "Rychlost šplhání",
    },
    en: {
      title: "Volcano Climb",
      intro: "Climb the ladders to the top and jump up to bump the block with the right answer. Jump over rolling barrels, a wrong block costs a life.",
      controls: "← → move, ↑ ↓ ladder, space jump; on a phone use the buttons",
      action: "Jump",
      upgradeAction: "Climbing speed",
    },
    de: {
      title: "Vulkanaufstieg",
      intro: "Klettere über die Leitern nach oben und springe gegen den Block mit der richtigen Antwort. Spring über rollende Fässer, ein falscher Block kostet ein Leben.",
      controls: "← → bewegen, ↑ ↓ Leiter, Leertaste springen; am Handy die Tasten benutzen",
      action: "Springen",
      upgradeAction: "Klettertempo",
    },
    ru: {
      title: "Подъём на вулкан",
      intro: "Поднимайся по лестницам и подпрыгни, чтобы ударить головой блок с правильным ответом. Перепрыгивай катящиеся бочки, неверный блок отнимает жизнь.",
      controls: "← → движение, ↑ ↓ лестница, пробел — прыжок; на телефоне кнопки",
      action: "Прыжок",
      upgradeAction: "Скорость лазания",
    },
  },
  flappy: {
    cs: {
      title: "Let přes útesy",
      intro: "Ptáček letí kolem čtyř průletů a u každého je odpověď. Proleť tím správným! Špatný průlet ubere život, stejně jako náraz do zdi nebo země.",
      controls: "mezerník, ↑ nebo klepnutí = mávnutí křídly",
      action: "Mávnout",
      upgradeAction: "Síla křídel",
    },
    en: {
      title: "Cliff Flight",
      intro: "The bird flies past four gaps, each with an answer. Fly through the right one! A wrong gap costs a life, and so does hitting a wall or the ground.",
      controls: "space, ↑ or tap to flap",
      action: "Flap",
      upgradeAction: "Wing power",
    },
    de: {
      title: "Klippenflug",
      intro: "Der Vogel fliegt an vier Lücken vorbei, jede mit einer Antwort. Flieg durch die richtige! Eine falsche Lücke kostet ein Leben, ebenso ein Aufprall an Wand oder Boden.",
      controls: "Leertaste, ↑ oder Tippen zum Flattern",
      action: "Flattern",
      upgradeAction: "Flügelkraft",
    },
    ru: {
      title: "Полёт над скалами",
      intro: "Птичка летит мимо четырёх проходов, у каждого ответ. Пролети через правильный! Неверный проход отнимает жизнь, как и удар о стену или землю.",
      controls: "пробел, ↑ или касание — взмах крыльями",
      action: "Взмах",
      upgradeAction: "Сила крыльев",
    },
  },
  mole: {
    cs: {
      title: "Lov krtků",
      intro: "Z děr vykukují krtci a každý drží cedulku s odpovědí. Klepni kladivem na toho se správnou! Špatný krtek ubere život a na chvíli se schová.",
      controls: "← → vybrat díru, mezerník = klepnout; na telefonu klepni na krtka",
      action: "Klepnout",
      upgradeAction: "Rychlost kladiva",
    },
    en: {
      title: "Mole Hunt",
      intro: "Moles pop out of the holes, each holding a sign with an answer. Whack the one with the right answer! A wrong mole costs a life and hides for a while.",
      controls: "← → pick a hole, space to whack; on a phone tap the mole",
      action: "Whack",
      upgradeAction: "Hammer speed",
    },
    de: {
      title: "Maulwurfjagd",
      intro: "Maulwürfe schauen aus den Löchern, jeder hält ein Schild mit einer Antwort. Hau auf den mit der richtigen! Ein falscher Maulwurf kostet ein Leben und versteckt sich kurz.",
      controls: "← → Loch wählen, Leertaste hauen; am Handy den Maulwurf antippen",
      action: "Hauen",
      upgradeAction: "Hammertempo",
    },
    ru: {
      title: "Охота на кротов",
      intro: "Из нор выглядывают кроты, у каждого табличка с ответом. Ударь молотком того, у кого правильный! Неверный крот отнимает жизнь и ненадолго прячется.",
      controls: "← → выбрать нору, пробел — удар; на телефоне коснись крота",
      action: "Удар",
      upgradeAction: "Скорость молотка",
    },
  },
  ninja: {
    cs: {
      title: "Stínový bojovník",
      intro: "Odpovědi vyletují vzduchem jako ovoce. Švihni po té správné a rozkrojíš ji! Špatnou neřež, ubere život. Propadlé ovoce nevadí, vyletí znovu.",
      controls: "táhni prstem nebo myší; klávesnicí šipky a mezerník = seknutí",
      action: "Sekat",
      upgradeAction: "Rychlost čepele",
    },
    en: {
      title: "Shadow Warrior",
      intro: "Answers fly through the air like fruit. Slash the right one to cut it in half! Don't cut a wrong one, it costs a life. Dropped fruit doesn't matter, it launches again.",
      controls: "drag with a finger or mouse; on a keyboard arrows and space to slash",
      action: "Slash",
      upgradeAction: "Blade speed",
    },
    de: {
      title: "Schattenkrieger",
      intro: "Antworten fliegen wie Obst durch die Luft. Schlitz die richtige auf! Eine falsche nicht, das kostet ein Leben. Heruntergefallenes Obst ist egal, es fliegt wieder los.",
      controls: "mit Finger oder Maus ziehen; Tastatur: Pfeile und Leertaste zum Schlitzen",
      action: "Schlitzen",
      upgradeAction: "Klingentempo",
    },
    ru: {
      title: "Теневой воин",
      intro: "Ответы летят по воздуху, как фрукты. Разрежь правильный! Неверный не трогай, он отнимает жизнь. Упавший фрукт не страшен, он взлетит снова.",
      controls: "проведи пальцем или мышью; на клавиатуре стрелки и пробел — удар",
      action: "Удар",
      upgradeAction: "Скорость клинка",
    },
  },
};

export function getArcadeText(game: ArcadeSlug, locale: Locale): ArcadeText {
  return T[game][locale];
}

export const ARCADE_SLUGS = Object.keys(T) as ArcadeSlug[];

export function isArcadeSlug(slug: string): slug is ArcadeSlug {
  return slug in T;
}
