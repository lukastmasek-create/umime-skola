import type { Locale } from "./config";
import type { EconomyEvent, SituationId } from "@/lib/idle/economy";

// Texty sekce Práce, směn, kariéry a zaměstnanců. Zástupné znaky {n}, {t}, {max} doplní UI.
export type WorkText = {
  energy: string;
  eduReq: string;
  energyNeed: string;
  passive: string;
  rank: string;
  pointsTo: string;
  topRank: string;
  shiftTitle: string;
  shiftIntro: string;
  shiftStart: string;
  shiftStep: string;
  shiftPerf: string;
  shiftNext: string;
  careerTitle: string;
  promo: string;
  promoChance: string;
  wait: string;
  raise: string;
  lead: string;
  leadOn: string;
  leadOff: string;
  leadLocked: string;
  leadNote: string;
  rest: string;
  vacation: string;
  vacationLeft: string;
  sick: string;
  crisis: string;
  warned: string;
  bonus: string;
  staffTitle: string;
  staffHint: string;
  hire: string;
  fire: string;
  staffCount: string;
  situations: Record<SituationId, { text: string; choices: [string, string, string] }>;
  events: Record<EconomyEvent, string>;
  errors: Record<string, string>;
};

const cs: WorkText = {
  energy: "Energie {n} / 100",
  eduReq: "Vzdělání {n}",
  energyNeed: "Na směnu potřebuješ aspoň {n} energie.",
  passive: "Pasivní plat",
  rank: "Stupeň {n} z 5",
  pointsTo: "{n} / {max} bodů do dalšího stupně",
  topRank: "Nejvyšší stupeň",
  shiftTitle: "Směna",
  shiftIntro: "Tři rozhodnutí. Lepší výkon znamená vyšší výplatu a víc bodů.",
  shiftStart: "Začít směnu",
  shiftStep: "Situace {n} z 3",
  shiftPerf: "Výkon {n} %",
  shiftNext: "Další směna za {t}",
  careerTitle: "Kariéra a plat",
  promo: "Požádat o povýšení",
  promoChance: "Šance {n} %",
  wait: "Počkej {t}",
  raise: "Vyjednat zvýšení platu",
  lead: "Vedoucí směny",
  leadOn: "Zrušit vedení",
  leadOff: "Přihlásit se na vedení",
  leadLocked: "Od stupně 4",
  leadNote: "+5 % za směnu, o 10 energie víc.",
  rest: "Vynechat směnu a doplnit energii",
  vacation: "Vzít si den volna",
  vacationLeft: "Dovolené zbývá {n} za 30 dní",
  sick: "Jsi nemocný, ještě {t}. Bez platu.",
  crisis: "Krize v oboru: od {t} na 7 dní o 10 % nižší plat.",
  warned: "Varování: další špatné směny mohou stát práci.",
  bonus: "Prémie dnes: {n}",
  staffTitle: "Zaměstnanci",
  staffHint: "Nábor {n} · roční mzda {w} · nejvýš {max} na firmu",
  hire: "Najmout",
  fire: "Propustit",
  staffCount: "{n} / {max}",
  situations: {
    delivery: { text: "Přišla dodávka a tři palety jsou špatně označené.", choices: ["Zkontrolovat všechny", "Přeřadit podle štítků", "Přenechat kolegovi"] },
    customer: { text: "Zákazník chce vrátit zboží bez účtenky.", choices: ["Odmítnout podle pravidel", "Domluvit se a nabídnout slevu", "Ať to vyřeší šéf"] },
    queue: { text: "Fronta u pokladny roste a lidé netrpělivě čekají.", choices: ["Otevřít další pokladnu", "Pomoct jen u nejdelší fronty", "Počkat, až se to uklidní"] },
    tools: { text: "Vozík se rozbil a zboží leží na chodbě.", choices: ["Provizorně přelepit", "Opravit vozík pořádně", "Nechat to být"] },
    colleague: { text: "Kolega se propadá do rozpisu a potřebuje pomoc.", choices: ["Odmítnout, máš své úkoly", "Poradit a pokračovat", "Zaskočit, i když to zdrží"] },
    spill: { text: "Na podlaze je rozlitá káva a nikdo se k tomu nehlásí.", choices: ["Dát varovnou ceduli", "Uklidit hned a nahlásit", "Přejít to"] },
  },
  events: {
    "shift-started": "Směna začala.",
    "shift-step": "Rozhodnutí přijato.",
    "shift-done": "Směna hotová, výplata {n}.",
    sick: "Jsi nemocný. Směna se nekoná.",
    "crisis-warning": "Varování: v oboru přijde krize, plat na týden klesne.",
    promoted: "Povýšení schváleno!",
    "promo-rejected": "Žádost zamítnuta. Zkus to za hodinu.",
    raised: "Plat vyjednán výš!",
    "raise-rejected": "Vyjednání se nepovedlo. Další pokus za týden.",
    warned: "Varování: další špatné směny mohou stát práci.",
    fired: "Dostal jsi výpověď.",
    vacation: "Dovolená začala. Plat běží na polovinu.",
    rested: "Odpočinul sis. Energie je plná.",
  },
  errors: {
    sick: "Jsi nemocný.",
    vacation: "Jsi na dovolené.",
    "low-energy": "Nemáš dost energie na směnu. Odpočiň si.",
    "no-shift": "Teď neběží žádná směna.",
  },
};

const en: WorkText = {
  energy: "Energy {n} / 100",
  eduReq: "Education {n}",
  energyNeed: "A shift needs at least {n} energy.",
  passive: "Passive pay",
  rank: "Rank {n} of 5",
  pointsTo: "{n} / {max} points to the next rank",
  topRank: "Top rank",
  shiftTitle: "Shift",
  shiftIntro: "Three decisions. Better performance means higher pay and more points.",
  shiftStart: "Start shift",
  shiftStep: "Situation {n} of 3",
  shiftPerf: "Performance {n} %",
  shiftNext: "Next shift in {t}",
  careerTitle: "Career and pay",
  promo: "Ask for a promotion",
  promoChance: "Chance {n} %",
  wait: "Wait {t}",
  raise: "Negotiate a raise",
  lead: "Shift lead",
  leadOn: "Give up lead",
  leadOff: "Apply to lead shifts",
  leadLocked: "From rank 4",
  leadNote: "+5 % per shift, 10 more energy.",
  rest: "Skip shift and recharge",
  vacation: "Take a day off",
  vacationLeft: "{n} days off left in 30 days",
  sick: "You are sick for {t} more. No pay.",
  crisis: "Industry crisis from {t}: pay 10 % lower for 7 days.",
  warned: "Warning: more bad shifts could cost you the job.",
  bonus: "Bonus today: {n}",
  staffTitle: "Employees",
  staffHint: "Hiring {n} · annual wage {w} · max {max} per company",
  hire: "Hire",
  fire: "Let go",
  staffCount: "{n} / {max}",
  situations: {
    delivery: { text: "A delivery came and three pallets are labelled wrong.", choices: ["Check all of them", "Re-sort by labels", "Hand it to a colleague"] },
    customer: { text: "A customer wants to return goods without a receipt.", choices: ["Refuse by the rules", "Agree and offer a discount", "Let the boss handle it"] },
    queue: { text: "The checkout queue keeps growing and people are getting impatient.", choices: ["Open another till", "Help only the longest line", "Wait until it calms down"] },
    tools: { text: "The trolley broke and goods are lying in the corridor.", choices: ["Patch it up for now", "Repair the trolley properly", "Leave it be"] },
    colleague: { text: "A colleague is falling behind on the rota and needs help.", choices: ["Refuse, you have your own tasks", "Give advice and carry on", "Step in, even though it costs you time"] },
    spill: { text: "Coffee is spilled on the floor and nobody owns up to it.", choices: ["Put up a warning sign", "Clean it up now and report it", "Walk past it"] },
  },
  events: {
    "shift-started": "Shift started.",
    "shift-step": "Decision made.",
    "shift-done": "Shift done, pay {n}.",
    sick: "You are sick. No shift today.",
    "crisis-warning": "Warning: an industry crisis is coming, pay drops for a week.",
    promoted: "Promotion approved!",
    "promo-rejected": "Request declined. Try again in an hour.",
    raised: "Pay raise negotiated!",
    "raise-rejected": "The negotiation failed. Next try in a week.",
    warned: "Warning: more bad shifts could cost you the job.",
    fired: "You have been let go.",
    vacation: "Holiday started. Pay is at half rate.",
    rested: "You rested. Energy is full.",
  },
  errors: {
    sick: "You are sick.",
    vacation: "You are on holiday.",
    "low-energy": "Not enough energy for a shift. Rest first.",
    "no-shift": "No shift is running.",
  },
};

const de: WorkText = {
  energy: "Energie {n} / 100",
  eduReq: "Bildung {n}",
  energyNeed: "Für eine Schicht brauchst du mindestens {n} Energie.",
  passive: "Passives Gehalt",
  rank: "Rang {n} von 5",
  pointsTo: "{n} / {max} Punkte bis zum nächsten Rang",
  topRank: "Höchster Rang",
  shiftTitle: "Schicht",
  shiftIntro: "Drei Entscheidungen. Bessere Leistung bringt mehr Lohn und mehr Punkte.",
  shiftStart: "Schicht beginnen",
  shiftStep: "Situation {n} von 3",
  shiftPerf: "Leistung {n} %",
  shiftNext: "Nächste Schicht in {t}",
  careerTitle: "Karriere und Gehalt",
  promo: "Beförderung beantragen",
  promoChance: "Chance {n} %",
  wait: "Warte {t}",
  raise: "Gehaltserhöhung aushandeln",
  lead: "Schichtleitung",
  leadOn: "Leitung abgeben",
  leadOff: "Für Schichtleitung bewerben",
  leadLocked: "Ab Rang 4",
  leadNote: "+5 % pro Schicht, 10 Energie mehr.",
  rest: "Schicht auslassen und auftanken",
  vacation: "Einen Tag frei nehmen",
  vacationLeft: "{n} freie Tage in 30 Tagen übrig",
  sick: "Du bist noch {t} krank. Ohne Lohn.",
  crisis: "Branchenkrise ab {t}: 7 Tage lang 10 % weniger Lohn.",
  warned: "Warnung: weitere schlechte Schichten können deine Arbeit kosten.",
  bonus: "Bonus heute: {n}",
  staffTitle: "Mitarbeiter",
  staffHint: "Einstellen {n} · Lohn {w} pro Stunde · höchstens {max} je Firma",
  hire: "Einstellen",
  fire: "Entlassen",
  staffCount: "{n} / {max}",
  situations: {
    delivery: { text: "Eine Lieferung ist da und drei Paletten sind falsch beschriftet.", choices: ["Alle prüfen", "Nach Etiketten neu sortieren", "An einen Kollegen abgeben"] },
    customer: { text: "Ein Kunde will Ware ohne Kassenbon zurückgeben.", choices: ["Nach den Regeln ablehnen", "Einigen und Rabatt anbieten", "Der Chef soll es klären"] },
    queue: { text: "Die Kassenschlange wird länger und die Leute werden ungeduldig.", choices: ["Eine weitere Kasse öffnen", "Nur der längsten Schlange helfen", "Warten, bis es sich beruhigt"] },
    tools: { text: "Der Wagen ist kaputt und Ware liegt im Gang.", choices: ["Vorläufig notdürftig flicken", "Den Wagen richtig reparieren", "Einfach liegen lassen"] },
    colleague: { text: "Ein Kollege kommt im Dienstplan nicht mehr mit und braucht Hilfe.", choices: ["Ablehnen, du hast eigene Aufgaben", "Beraten und weitermachen", "Einspringen, auch wenn es dich aufhält"] },
    spill: { text: "Auf dem Boden ist Kaffee verschüttet und niemand meldet sich.", choices: ["Ein Warnschild aufstellen", "Sofort aufwischen und melden", "Einfach daran vorbeigehen"] },
  },
  events: {
    "shift-started": "Schicht begonnen.",
    "shift-step": "Entscheidung getroffen.",
    "shift-done": "Schicht beendet, Lohn {n}.",
    sick: "Du bist krank. Heute keine Schicht.",
    "crisis-warning": "Warnung: Eine Branchenkrise kommt, der Lohn sinkt eine Woche lang.",
    promoted: "Beförderung genehmigt!",
    "promo-rejected": "Antrag abgelehnt. Versuch es in einer Stunde noch einmal.",
    raised: "Gehaltserhöhung ausgehandelt!",
    "raise-rejected": "Die Verhandlung ist gescheitert. Nächster Versuch in einer Woche.",
    warned: "Warnung: weitere schlechte Schichten können deine Arbeit kosten.",
    fired: "Du wurdest entlassen.",
    vacation: "Urlaub hat begonnen. Der Lohn läuft zur Hälfte weiter.",
    rested: "Du hast dich erholt. Energie ist voll.",
  },
  errors: {
    sick: "Du bist krank.",
    vacation: "Du bist im Urlaub.",
    "low-energy": "Zu wenig Energie für eine Schicht. Erhol dich zuerst.",
    "no-shift": "Gerade läuft keine Schicht.",
  },
};

const ru: WorkText = {
  energy: "Энергия {n} / 100",
  eduReq: "Образование {n}",
  energyNeed: "Для смены нужно не меньше {n} энергии.",
  passive: "Пассивная зарплата",
  rank: "Уровень {n} из 5",
  pointsTo: "{n} / {max} очков до следующего уровня",
  topRank: "Высший уровень",
  shiftTitle: "Смена",
  shiftIntro: "Три решения. Лучший результат даёт больше денег и очков.",
  shiftStart: "Начать смену",
  shiftStep: "Ситуация {n} из 3",
  shiftPerf: "Результат {n} %",
  shiftNext: "Следующая смена через {t}",
  careerTitle: "Карьера и зарплата",
  promo: "Попросить повышение",
  promoChance: "Шанс {n} %",
  wait: "Подожди {t}",
  raise: "Договориться о прибавке",
  lead: "Старший смены",
  leadOn: "Отказаться от роли",
  leadOff: "Стать старшим смены",
  leadLocked: "С уровня 4",
  leadNote: "+5 % за смену, на 10 энергии больше.",
  rest: "Пропустить смену и отдохнуть",
  vacation: "Взять выходной",
  vacationLeft: "Осталось выходных за 30 дней: {n}",
  sick: "Ты болеешь ещё {t}. Без зарплаты.",
  crisis: "Кризис в отрасли с {t}: 7 дней зарплата на 10 % ниже.",
  warned: "Предупреждение: ещё несколько плохих смен могут стоить работы.",
  bonus: "Премия сегодня: {n}",
  staffTitle: "Сотрудники",
  staffHint: "Найм {n} · зарплата {w} в год · не больше {max} на компанию",
  hire: "Нанять",
  fire: "Уволить",
  staffCount: "{n} / {max}",
  situations: {
    delivery: { text: "Привезли поставку, и на трёх паллетах неправильные этикетки.", choices: ["Проверить все", "Пересортировать по этикеткам", "Передать коллеге"] },
    customer: { text: "Покупатель хочет вернуть товар без чека.", choices: ["Отказать по правилам", "Договориться и предложить скидку", "Пусть решает начальник"] },
    queue: { text: "Очередь на кассе растёт, люди нервничают.", choices: ["Открыть ещё одну кассу", "Помочь только самой длинной очереди", "Подождать, пока всё успокоится"] },
    tools: { text: "Тележка сломалась, товар лежит в коридоре.", choices: ["Временно подлатать", "Починить тележку как следует", "Оставить как есть"] },
    colleague: { text: "Коллега не справляется с графиком и просит помощи.", choices: ["Отказать, у тебя свои задачи", "Посоветовать и продолжить", "Подменить, даже если это задержит тебя"] },
    spill: { text: "На полу разлит кофе, и никто не признаётся.", choices: ["Поставить предупреждающий знак", "Убрать сразу и сообщить", "Пройти мимо"] },
  },
  events: {
    "shift-started": "Смена началась.",
    "shift-step": "Решение принято.",
    "shift-done": "Смена окончена, выплата {n}.",
    sick: "Ты болеешь. Сегодня смены нет.",
    "crisis-warning": "Предупреждение: в отрасли будет кризис, зарплата на неделю упадёт.",
    promoted: "Повышение одобрено!",
    "promo-rejected": "Заявку отклонили. Попробуй через час.",
    raised: "Прибавку к зарплате удалось выбить!",
    "raise-rejected": "Переговоры не удались. Следующая попытка через неделю.",
    warned: "Предупреждение: ещё несколько плохих смен могут стоить работы.",
    fired: "Тебя уволили.",
    vacation: "Выходной начался. Зарплата идёт вполовину.",
    rested: "Ты отдохнул. Энергия полная.",
  },
  errors: {
    sick: "Ты болеешь.",
    vacation: "Ты в отпуске.",
    "low-energy": "Не хватает энергии на смену. Сначала отдохни.",
    "no-shift": "Сейчас смена не идёт.",
  },
};

export function getEconomyWork(locale: Locale): WorkText {
  switch (locale) {
    case "cs":
      return cs;
    case "de":
      return de;
    case "ru":
      return ru;
    default:
      return en;
  }
}
