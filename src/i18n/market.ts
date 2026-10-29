import type { Locale } from "./config";
import type { StallKey, WorldId } from "@/lib/market-worlds";

export type MarketText = {
  title: string;
  subtitle: string;
  worlds: Record<WorldId, string>;
  worldHint: string; // {level} {points}
  soon: string;
  locked: string;
  stalls: Record<StallKey, { name: string; npc: string; hello: string[] }>;
  owned: string; // {n} {total}
  open: string;
  close: string;
  points: string;
  loginHint: string;
  login: string;
  classic: string;
  deal: string;
  gift: string;
  giftEmail: string;
  giftSend: string;
  cancel: string;
  newItem: string;
  boughtToast: string; // {name}
  night: string;
  day: string;
  cannon: string;
  boom: string;
  parrotLabel: string;
  parrot: string[];
};

const cs: MarketText = {
  title: "Pirátský přístav",
  subtitle: "Klikni na stánek nebo obchodníka a vyber si zboží za body z učení. Koupené věci se objeví na pultě.",
  worlds: { pirate: "Pirátský přístav", space: "Vesmírná stanice", forest: "Pohádkový les", castle: "Hrad a tržiště", sea: "Podmořské město" },
  worldHint: "Odemkne se na úrovni {level} a za {points} bodů",
  soon: "Připravujeme",
  locked: "Zamčeno",
  stalls: {
    avatary: { name: "Kostýmy", npc: "Kapitán Rudovous", hello: ["Ahoj, námořníku! Který kostým ti padne?", "Pro správného piráta je tu vždycky nová čepice!"] },
    tituly: { name: "Námořní kancelář", npc: "Kvartýrmistryně Dora", hello: ["Titul se píše do lodního deníku. Který chceš?", "Tady dostaneš jméno, které se ponese po sedmi mořích."] },
    ramecky: { name: "Dílna kormidla", npc: "Tesař Kolík", hello: ["Rámeček ti zasadím jako kormidlo do dubu!", "Dobré dřevo a zlatý lem, to je moje."] },
    pozadi: { name: "Plachtárna", npc: "Plachtařka Jehla", hello: ["Plachtu na pozadí ti ušiju na míru.", "Vyber si barvu moře, kterou ti ušiju."] },
    mazlicci: { name: "Zvířecí kout", npc: "Chovatel Hubert", hello: ["Papoušek se ti nabízí! Má rád doplňky.", "Pro mazlíčky mám ty nejlepší čepice a šály."] },
    lod: { name: "Loděnice", npc: "Maják a loď", hello: ["Stavby do tvého města se vyrábí v loděnici."] },
  },
  owned: "Máš {n} z {total}",
  open: "Otevřít stánek",
  close: "Zavřít",
  points: "Tvoje body",
  loginHint: "Nakupovat můžeš po přihlášení, prohlížet si přístav můžeš už teď.",
  login: "Přihlásit se",
  classic: "Klasický seznam zboží",
  deal: "Sleva dne",
  gift: "Darovat",
  giftEmail: "E-mail kamaráda",
  giftSend: "Poslat dárek",
  cancel: "Zrušit",
  newItem: "Nové",
  boughtToast: "{name} je na pultě!",
  night: "Zapnout noc",
  day: "Zapnout den",
  cannon: "Vystřelit z kanónu",
  boom: "BUM!",
  parrotLabel: "Promluvit s papouškem",
  parrot: ["Arrr! Zlato, zlato!", "Kdo je tu nový? Arrr!", "Pozor na kraby!", "Kapitán má vždycky pravdu!", "Pěkný kousek!"],
};

const en: MarketText = {
  title: "Pirate harbour",
  subtitle: "Click a stall or a trader and pick goods with the points you earn from learning. What you buy appears on the counter.",
  worlds: { pirate: "Pirate harbour", space: "Space station", forest: "Fairy forest", castle: "Castle and market", sea: "Underwater city" },
  worldHint: "Unlocks at level {level} and for {points} points",
  soon: "Coming soon",
  locked: "Locked",
  stalls: {
    avatary: { name: "Costumes", npc: "Captain Redbeard", hello: ["Ahoy, sailor! Which costume suits you?", "A real pirate always needs a new hat!"] },
    tituly: { name: "Navy office", npc: "Quartermaster Dora", hello: ["Titles go into the ship's log. Which one do you want?", "Here you get a name that sails the seven seas."] },
    ramecky: { name: "Wheel workshop", npc: "Carpenter Peg", hello: ["I'll set your frame like a ship's wheel in oak!", "Good wood and a golden rim, that's my trade."] },
    pozadi: { name: "Sailmaker", npc: "Sailmaker Needle", hello: ["I'll sew a sail for your background to measure.", "Pick the colour of the sea and I'll stitch it."] },
    mazlicci: { name: "Animal corner", npc: "Keeper Hubert", hello: ["The parrot is offering himself! He loves accessories.", "I've got the best hats and scarves for pets."] },
    lod: { name: "Shipyard", npc: "Lighthouse and ship", hello: ["Buildings for your city are made in the shipyard."] },
  },
  owned: "You have {n} of {total}",
  open: "Open stall",
  close: "Close",
  points: "Your points",
  loginHint: "Log in to buy things; you can look around the harbour right now.",
  login: "Log in",
  classic: "Classic item list",
  deal: "Deal of the day",
  gift: "Gift",
  giftEmail: "Friend's e-mail",
  giftSend: "Send gift",
  cancel: "Cancel",
  newItem: "New",
  boughtToast: "{name} is on the counter!",
  night: "Switch to night",
  day: "Switch to day",
  cannon: "Fire the cannon",
  boom: "BOOM!",
  parrotLabel: "Talk to the parrot",
  parrot: ["Arrr! Gold, gold!", "Who is new here? Arrr!", "Beware of crabs!", "The captain is always right!", "Nice catch!"],
};

const de: MarketText = {
  title: "Piratenhafen",
  subtitle: "Klick auf einen Stand oder Händler und kauf mit deinen Lernpunkten ein. Was du kaufst, erscheint auf dem Tresen.",
  worlds: { pirate: "Piratenhafen", space: "Raumstation", forest: "Märchenwald", castle: "Burg und Markt", sea: "Unterwasserstadt" },
  worldHint: "Wird ab Level {level} und für {points} Punkte freigeschaltet",
  soon: "Bald verfügbar",
  locked: "Gesperrt",
  stalls: {
    avatary: { name: "Kostüme", npc: "Kapitän Rotbart", hello: ["Ahoi, Seemann! Welches Kostüm steht dir?", "Ein echter Pirat braucht immer einen neuen Hut!"] },
    tituly: { name: "Marinebüro", npc: "Quartiermeisterin Dora", hello: ["Titel kommen ins Logbuch. Welchen willst du?", "Hier bekommst du einen Namen für die sieben Meere."] },
    ramecky: { name: "Steuerrad-Werkstatt", npc: "Zimmermann Pflock", hello: ["Deinen Rahmen fasse ich wie ein Steuerrad aus Eiche!", "Gutes Holz und goldener Rand, das ist mein Handwerk."] },
    pozadi: { name: "Segelmacherei", npc: "Segelmacherin Nadel", hello: ["Ich nähe dir ein Segel als Hintergrund nach Maß.", "Such dir die Farbe des Meeres aus."] },
    mazlicci: { name: "Tierecke", npc: "Tierpfleger Hubert", hello: ["Der Papagei bietet sich an! Er liebt Zubehör.", "Für Haustiere habe ich die besten Hüte und Schals."] },
    lod: { name: "Werft", npc: "Leuchtturm und Schiff", hello: ["Gebäude für deine Stadt entstehen in der Werft."] },
  },
  owned: "Du hast {n} von {total}",
  open: "Stand öffnen",
  close: "Schließen",
  points: "Deine Punkte",
  loginHint: "Zum Kaufen musst du angemeldet sein; den Hafen kannst du schon ansehen.",
  login: "Anmelden",
  classic: "Klassische Liste",
  deal: "Angebot des Tages",
  gift: "Schenken",
  giftEmail: "E-Mail des Freundes",
  giftSend: "Geschenk senden",
  cancel: "Abbrechen",
  newItem: "Neu",
  boughtToast: "{name} liegt auf dem Tresen!",
  night: "Nacht einschalten",
  day: "Tag einschalten",
  cannon: "Kanone abfeuern",
  boom: "BUMM!",
  parrotLabel: "Mit dem Papagei sprechen",
  parrot: ["Arrr! Gold, Gold!", "Wer ist neu hier? Arrr!", "Vorsicht vor Krabben!", "Der Kapitän hat immer recht!", "Schönes Stück!"],
};

const ru: MarketText = {
  title: "Пиратская гавань",
  subtitle: "Нажми на прилавок или торговца и выбери товары за баллы. Купленное появится на прилавке.",
  worlds: { pirate: "Пиратская гавань", space: "Космическая станция", forest: "Сказочный лес", castle: "Замок и рынок", sea: "Подводный город" },
  worldHint: "Откроется на уровне {level} и за {points} баллов",
  soon: "Скоро",
  locked: "Закрыто",
  stalls: {
    avatary: { name: "Костюмы", npc: "Капитан Рыжебородый", hello: ["Эй, моряк! Какой костюм тебе к лицу?", "Настоящему пирату всегда нужна новая шляпа!"] },
    tituly: { name: "Морская канцелярия", npc: "Квартирмейстер Дора", hello: ["Звание вписывают в судовой журнал. Какое хочешь?", "Здесь дают имя для семи морей."] },
    ramecky: { name: "Мастерская штурвалов", npc: "Плотник Колышек", hello: ["Рамку сделаю, как штурвал из дуба!", "Хорошее дерево и золотая кайма, вот моё ремесло."] },
    pozadi: { name: "Парусная мастерская", npc: "Парусница Игла", hello: ["Сошью парус под фон по твоей мерке.", "Выбери цвет моря, и я сошью."] },
    mazlicci: { name: "Звериный уголок", npc: "Смотритель Хуберт", hello: ["Попугай сам предлагает себя! Он любит аксессуары.", "Для питомцев у меня лучшие шляпы и шарфы."] },
    lod: { name: "Верфь", npc: "Маяк и корабль", hello: ["Постройки для твоего города делают на верфи."] },
  },
  owned: "У тебя {n} из {total}",
  open: "Открыть прилавок",
  close: "Закрыть",
  points: "Твои баллы",
  loginHint: "Покупать можно после входа, а осмотреть гавань можно уже сейчас.",
  login: "Войти",
  classic: "Классический список",
  deal: "Скидка дня",
  gift: "Подарить",
  giftEmail: "E-mail друга",
  giftSend: "Отправить подарок",
  cancel: "Отмена",
  newItem: "Новое",
  boughtToast: "{name} на прилавке!",
  night: "Включить ночь",
  day: "Включить день",
  cannon: "Выстрелить из пушки",
  boom: "БАХ!",
  parrotLabel: "Поговорить с попугаем",
  parrot: ["Аррр! Золото, золото!", "Кто тут новенький? Аррр!", "Берегись крабов!", "Капитан всегда прав!", "Отличная вещь!"],
};

const texts: Record<Locale, MarketText> = { cs, en, de, ru };
export function getMarketText(locale: Locale): MarketText {
  return texts[locale];
}
