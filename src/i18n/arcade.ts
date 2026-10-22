import type { Locale } from "./config";
import type { GameSlug } from "@/lib/games";

// Texty retro her. `action` je popisek tlačítka (střelba, skok…), `upgradeAction` název vylepšení rychlosti hráče.
export type ArcadeText = {
  title: string;
  intro: string;
  controls: string;
  action: string;
  upgradeAction: string;
};

export type ArcadeSlug = Exclude<GameSlug, "space-invaders" | "super-mario">;

const T: Record<ArcadeSlug, Record<Locale, ArcadeText>> = {
  "pac-man": {
    cs: {
      title: "Pac-Man kvíz",
      intro: "Projdi bludiště a sněz správnou odpověď. Špatná odpověď ubere život, duchům se vyhýbej. Žlutá pilulka je na chvíli zneškodní!",
      controls: "šipky nebo W A S D, na telefonu táhni prstem nebo používej tlačítka",
      action: "Start",
      upgradeAction: "Rychlost Pac-Mana",
    },
    en: {
      title: "Pac-Man Quiz",
      intro: "Run through the maze and eat the right answer. A wrong one costs a life, so avoid the ghosts. A power pill makes them harmless for a while!",
      controls: "arrow keys or W A S D, on a phone swipe or use the buttons",
      action: "Go",
      upgradeAction: "Pac-Man speed",
    },
    de: {
      title: "Pac-Man-Quiz",
      intro: "Lauf durch das Labyrinth und friss die richtige Antwort. Eine falsche kostet ein Leben, weiche den Geistern aus. Eine Power-Pille macht sie kurz harmlos!",
      controls: "Pfeiltasten oder W A S D, am Handy wischen oder die Tasten benutzen",
      action: "Los",
      upgradeAction: "Pac-Man-Tempo",
    },
    ru: {
      title: "Квиз Пакман",
      intro: "Пройди лабиринт и съешь правильный ответ. Неверный отнимает жизнь, избегай призраков. Энергетическая таблетка ненадолго делает их безвредными!",
      controls: "стрелки или W A S D, на телефоне свайп или кнопки",
      action: "Вперёд",
      upgradeAction: "Скорость Пакмана",
    },
  },
  snake: {
    cs: {
      title: "Hadí kvíz",
      intro: "Had má sníst správné jablko s odpovědí. Špatné jablko ubere život. Had po každé správné odpovědi roste a zrychluje, hra končí až ztratou všech životů. Pozor, ať se nekousneš do ocasu!",
      controls: "šipky nebo W A S D, na telefonu táhni prstem nebo používej tlačítka",
      action: "Start",
      upgradeAction: "Rychlost hada",
    },
    en: {
      title: "Snake Quiz",
      intro: "Eat the apple with the right answer. A wrong apple costs a life. The snake grows and speeds up after every right answer, and the game only ends when you lose all lives. Careful not to bite your own tail!",
      controls: "arrow keys or W A S D, on a phone swipe or use the buttons",
      action: "Go",
      upgradeAction: "Snake speed",
    },
    de: {
      title: "Schlangen-Quiz",
      intro: "Friss den Apfel mit der richtigen Antwort. Ein falscher Apfel kostet ein Leben. Die Schlange wächst und wird nach jeder richtigen Antwort schneller, das Spiel endet erst, wenn alle Leben weg sind. Beiß dir nicht in den Schwanz!",
      controls: "Pfeiltasten oder W A S D, am Handy wischen oder die Tasten benutzen",
      action: "Los",
      upgradeAction: "Schlangentempo",
    },
    ru: {
      title: "Квиз Змейка",
      intro: "Съешь яблоко с правильным ответом. Неверное яблоко отнимает жизнь. Змейка растёт и ускоряется после каждого верного ответа, а игра заканчивается, только когда кончатся жизни. Не укуси себя за хвост!",
      controls: "стрелки или W A S D, на телефоне свайп или кнопки",
      action: "Вперёд",
      upgradeAction: "Скорость змейки",
    },
  },
  breakout: {
    cs: {
      title: "Cihlový kvíz",
      intro: "Odrážej míček pálkou a rozbij blok se správnou odpovědí. Špatný blok ubere život, stejně jako míček, který propadne.",
      controls: "← → nebo A D, na telefonu táhni prstem po hřišti",
      action: "Vypustit míček",
      upgradeAction: "Šířka pálky",
    },
    en: {
      title: "Brick Quiz",
      intro: "Bounce the ball with the paddle and break the block with the right answer. A wrong block costs a life, and so does dropping the ball.",
      controls: "← → or A D, on a phone drag your finger across the field",
      action: "Launch ball",
      upgradeAction: "Paddle width",
    },
    de: {
      title: "Ziegel-Quiz",
      intro: "Lenke den Ball mit dem Schläger und zerstöre den Block mit der richtigen Antwort. Ein falscher Block kostet ein Leben, ebenso ein verlorener Ball.",
      controls: "← → oder A D, am Handy mit dem Finger über das Spielfeld ziehen",
      action: "Ball starten",
      upgradeAction: "Schlägerbreite",
    },
    ru: {
      title: "Квиз Кирпичи",
      intro: "Отбивай мяч ракеткой и разбей блок с правильным ответом. Неверный блок отнимает жизнь, как и упавший мяч.",
      controls: "← → или A D, на телефоне води пальцем по полю",
      action: "Запустить мяч",
      upgradeAction: "Ширина ракетки",
    },
  },
  tetris: {
    cs: {
      title: "Kostkový kvíz",
      intro: "Dole v hromadě svítí drahokamy a vedle nich jsou odpovědi. Skládej padající kostky a vymaž řádek se správným drahokamem. Vymazat špatný řádek přidá nepořádek, nenech věž dorůst nahoru!",
      controls: "← → pohyb, ↑ otočit, ↓ zrychlit, mezerník shodit",
      action: "Shodit",
      upgradeAction: "Ovládání kostek",
    },
    en: {
      title: "Block Quiz",
      intro: "Gems glow in the stack with answers next to them. Stack the falling blocks and clear the row with the right gem. Clearing a wrong row adds mess, so don't let the tower reach the top!",
      controls: "← → move, ↑ rotate, ↓ speed up, space drop",
      action: "Drop",
      upgradeAction: "Block control",
    },
    de: {
      title: "Blöcke-Quiz",
      intro: "Im Haufen leuchten Edelsteine, daneben stehen die Antworten. Staple die fallenden Blöcke und räume die Reihe mit dem richtigen Edelstein. Eine falsche Reihe macht Unordnung, lass den Turm nicht bis oben wachsen!",
      controls: "← → bewegen, ↑ drehen, ↓ schneller, Leertaste fallen lassen",
      action: "Fallen",
      upgradeAction: "Blocksteuerung",
    },
    ru: {
      title: "Квиз Блоки",
      intro: "В куче светятся самоцветы, рядом ответы. Складывай падающие блоки и убери ряд с правильным самоцветом. Неверный ряд добавляет мусор, не дай башне дорасти до верха!",
      controls: "← → движение, ↑ повернуть, ↓ ускорить, пробел — сбросить",
      action: "Сбросить",
      upgradeAction: "Управление блоками",
    },
  },
  kong: {
    cs: {
      title: "Kong kvíz",
      intro: "Vylez po žebřících nahoru a vyskoč pod blok se správnou odpovědí, tak do něj narazíš hlavou. Skákej přes valící se sudy, špatný blok ubere život.",
      controls: "← → pohyb, ↑ ↓ žebřík, mezerník skok; na telefonu tlačítka",
      action: "Skok",
      upgradeAction: "Rychlost šplhání",
    },
    en: {
      title: "Kong Quiz",
      intro: "Climb the ladders to the top and jump up to bump the block with the right answer. Jump over rolling barrels, a wrong block costs a life.",
      controls: "← → move, ↑ ↓ ladder, space jump; on a phone use the buttons",
      action: "Jump",
      upgradeAction: "Climbing speed",
    },
    de: {
      title: "Kong-Quiz",
      intro: "Klettere über die Leitern nach oben und springe gegen den Block mit der richtigen Antwort. Spring über rollende Fässer, ein falscher Block kostet ein Leben.",
      controls: "← → bewegen, ↑ ↓ Leiter, Leertaste springen; am Handy die Tasten benutzen",
      action: "Springen",
      upgradeAction: "Klettertempo",
    },
    ru: {
      title: "Квиз Конг",
      intro: "Поднимайся по лестницам и подпрыгни, чтобы ударить головой блок с правильным ответом. Перепрыгивай катящиеся бочки, неверный блок отнимает жизнь.",
      controls: "← → движение, ↑ ↓ лестница, пробел — прыжок; на телефоне кнопки",
      action: "Прыжок",
      upgradeAction: "Скорость лазания",
    },
  },
  stonozka: {
    cs: {
      title: "Stonožkový kvíz",
      intro: "Stonožka se plazí dolů a každý článek nese odpověď. Zastřel ten správný! Špatný článek se promění v houbu a stonožku rozdělí na dvě. Sestřel pavouka, ten na chvíli rozsvítí správný článek, a pozor, ať tě nic nesekne.",
      controls: "šipky nebo W A S D pohyb, mezerník střelba; na telefonu tlačítka",
      action: "Střelba",
      upgradeAction: "Rychlost střelby",
    },
    en: {
      title: "Centipede Quiz",
      intro: "The centipede crawls down and each segment carries an answer. Shoot the right one! A wrong segment turns into a mushroom and splits the centipede in two. Shoot the spider to light up the right segment for a moment, and watch out for bites.",
      controls: "arrows or W A S D to move, space to shoot; on a phone use the buttons",
      action: "Shoot",
      upgradeAction: "Firing speed",
    },
    de: {
      title: "Tausendfüßler-Quiz",
      intro: "Der Tausendfüßler kriecht nach unten, jedes Glied trägt eine Antwort. Schieß auf das richtige! Ein falsches Glied wird zum Pilz und teilt ihn in zwei. Triff die Spinne, sie lässt das richtige Glied kurz aufleuchten, und pass auf, dass dich nichts erwischt.",
      controls: "Pfeile oder W A S D bewegen, Leertaste schießen; am Handy die Tasten benutzen",
      action: "Schießen",
      upgradeAction: "Feuerrate",
    },
    ru: {
      title: "Квиз Сороконожка",
      intro: "Сороконожка ползёт вниз, и каждый сегмент несёт ответ. Попади в правильный! Неверный сегмент превращается в гриб и делит сороконожку надвое. Подстрели паука, он ненадолго подсветит правильный сегмент, и берегись укусов.",
      controls: "стрелки или W A S D — движение, пробел — выстрел; на телефоне кнопки",
      action: "Огонь",
      upgradeAction: "Скорострельность",
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
