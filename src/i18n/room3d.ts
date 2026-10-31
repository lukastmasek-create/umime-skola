import type { Locale } from "./config";

// Texty živého 3D pokoje: co nábytek dělá a akce po kliknutí.
export type Room3dText = {
  hint: string;
  perkXpTest: string; // {n}
  perkXpGame: string; // {n}
  perkEndless: string; // {n}
  perkDaily: string; // {n}
  use: Record<string, string>;
  usedToday: string;
  go: Record<string, string>;
  notPlaced: string;
  bonuses: string;
  gained: string; // {n}
  view2d: string;
  view3d: string;
};

const cs: Room3dText = {
  hint: "Klikni na nábytek a avatar k němu dojde. Tažením otočíš pokoj, kolečkem přiblížíš.",
  perkXpTest: "+{n} % XP v testech",
  perkXpGame: "+{n} % XP ve hrách",
  perkEndless: "nekonečné hry o {n} % rychlejší",
  perkDaily: "+{n} bodů denně",
  use: { aquarium: "Nakrmit rybičky", plant: "Zalít květinu", rocketbed: "Vyspat se", guitar: "Zahrát na kytaru", piano: "Zahrát na piano", telescope: "Pozorovat hvězdy", sofa: "Odpočinout si" },
  usedToday: "Dnes už hotovo, zítra zase.",
  go: { desk: "Učit se v kurzech", bookshelf: "Číst materiály", trophy: "Podívat se na žebříčky", arcade: "Hrát nekonečné hry", globe: "Otevřít mapu" },
  notPlaced: "Postav ho do pokoje a bude ti pomáhat.",
  bonuses: "Bonusy z pokoje",
  gained: "+{n} bodů!",
  view2d: "🖼️ 2D",
  view3d: "🧊 3D",
};
const en: Room3dText = {
  hint: "Click furniture and your avatar walks over. Drag to turn the room, scroll to zoom.",
  perkXpTest: "+{n}% XP in tests",
  perkXpGame: "+{n}% XP in games",
  perkEndless: "endless games {n}% faster",
  perkDaily: "+{n} points a day",
  use: { aquarium: "Feed the fish", plant: "Water the plant", rocketbed: "Take a nap", guitar: "Play the guitar", piano: "Play the piano", telescope: "Watch the stars", sofa: "Have a rest" },
  usedToday: "Done for today, come back tomorrow.",
  go: { desk: "Study in courses", bookshelf: "Read materials", trophy: "See the leaderboards", arcade: "Play endless games", globe: "Open the map" },
  notPlaced: "Put it in your room and it will help you.",
  bonuses: "Room bonuses",
  gained: "+{n} points!",
  view2d: "🖼️ 2D",
  view3d: "🧊 3D",
};
const de: Room3dText = {
  hint: "Klicke auf ein Möbelstück, dann geht dein Avatar hin. Ziehen dreht den Raum, Mausrad zoomt.",
  perkXpTest: "+{n} % XP in Tests",
  perkXpGame: "+{n} % XP in Spielen",
  perkEndless: "Endlosspiele {n} % schneller",
  perkDaily: "+{n} Punkte pro Tag",
  use: { aquarium: "Fische füttern", plant: "Pflanze gießen", rocketbed: "Ein Nickerchen machen", guitar: "Gitarre spielen", piano: "Klavier spielen", telescope: "Sterne beobachten", sofa: "Ausruhen" },
  usedToday: "Heute schon erledigt, morgen wieder.",
  go: { desk: "In Kursen lernen", bookshelf: "Materialien lesen", trophy: "Bestenlisten ansehen", arcade: "Endlosspiele spielen", globe: "Karte öffnen" },
  notPlaced: "Stell es in dein Zimmer, dann hilft es dir.",
  bonuses: "Zimmerboni",
  gained: "+{n} Punkte!",
  view2d: "🖼️ 2D",
  view3d: "🧊 3D",
};
const ru: Room3dText = {
  hint: "Нажми на мебель, и аватар подойдёт к ней. Перетаскивай, чтобы повернуть комнату, колесом приближай.",
  perkXpTest: "+{n} % XP в тестах",
  perkXpGame: "+{n} % XP в играх",
  perkEndless: "бесконечные игры на {n} % быстрее",
  perkDaily: "+{n} баллов в день",
  use: { aquarium: "Покормить рыбок", plant: "Полить цветок", rocketbed: "Вздремнуть", guitar: "Сыграть на гитаре", piano: "Сыграть на пианино", telescope: "Смотреть на звёзды", sofa: "Отдохнуть" },
  usedToday: "На сегодня всё, приходи завтра.",
  go: { desk: "Учиться в курсах", bookshelf: "Читать материалы", trophy: "Посмотреть рейтинги", arcade: "Играть в бесконечные игры", globe: "Открыть карту" },
  notPlaced: "Поставь это в комнату, и оно будет помогать.",
  bonuses: "Бонусы комнаты",
  gained: "+{n} баллов!",
  view2d: "🖼️ 2D",
  view3d: "🧊 3D",
};
const texts: Record<Locale, Room3dText> = { cs, en, de, ru };
export const getRoom3dText = (locale: Locale) => texts[locale];
