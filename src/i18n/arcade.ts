import { withFallbacks } from "./config";
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

export type ArcadeSlug = Exclude<GameSlug, "space-invaders" | "runner" | ClassicSlug>;

const T: Record<ArcadeSlug, Record<Locale, ArcadeText>> = {
  "pac-man": {
    ...withFallbacks({
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
    }),
    uk: {
      title: "Лабіринт привидів",
      intro: "Пройди лабіринт і з'їж правильну відповідь. Неправильна відповідь забирає життя, тож уникай привидів. Жовта таблетка на деякий час робить їх нешкідливими!",
      controls: "стрілки або W A S D, на телефоні проводь пальцем або користуйся кнопками",
      action: "Старт",
      upgradeAction: "Швидкість героя",
    },
    ja: {
      title: "ゴーストの迷宮",
      intro: "迷路を進んで正しい答えを食べよう。間違った答えを食べるとライフが1つ減るので、ゴーストは避けてね。パワーピルを食べると、しばらくの間ゴーストを無害にできるよ！",
      controls: "矢印キーまたは W A S D。スマホではスワイプかボタンを使ってください",
      action: "スタート",
      upgradeAction: "ヒーローの速さ",
    },
    es: {
      title: "Laberinto fantasma",
      intro: "Recorre el laberinto y come la respuesta correcta. Una respuesta mala te cuesta una vida, así que evita a los fantasmas. ¡Una píldora de poder los vuelve inofensivos por un rato!",
      controls: "flechas o W A S D; en el móvil desliza el dedo o usa los botones",
      action: "Empezar",
      upgradeAction: "Velocidad del héroe",
    },
    fr: {
      title: "Labyrinthe des fantômes",
      intro: "Traverse le labyrinthe et mange la bonne réponse. Une mauvaise réponse te coûte une vie, alors évite les fantômes. Une pilule énergie les rend inoffensifs pendant un moment !",
      controls: "flèches ou W A S D ; sur téléphone, glisse le doigt ou utilise les boutons",
      action: "Partir",
      upgradeAction: "Vitesse du héros",
    },
  },
  snake: {
    ...withFallbacks({
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
    }),
    uk: {
      title: "Змійка з джунглів",
      intro: "Змійка має з'їсти правильне яблуко з відповіддю. Неправильне яблуко забирає життя. Після кожної правильної відповіді змійка росте й прискорюється, а гра закінчується тільки тоді, коли втратиш усі життя. Стеж, щоб не вкусити себе за хвіст!",
      controls: "стрілки або W A S D; на телефоні проводь пальцем або користуйся кнопками",
      action: "Старт",
      upgradeAction: "Швидкість змійки",
    },
    ja: {
      title: "ジャングルのヘビ",
      intro: "正しい答えのりんごを食べよう。間違ったりんごを食べるとライフが1つ減ります。正解するたびにヘビは長くなって速くなり、ライフがすべてなくなるとゲーム終了です。自分のしっぽをかまないように気をつけてね！",
      controls: "矢印キーまたは W A S D。スマホではスワイプかボタンを使ってください",
      action: "スタート",
      upgradeAction: "ヘビの速さ",
    },
    es: {
      title: "Serpiente de la selva",
      intro: "Come la manzana con la respuesta correcta. Una manzana equivocada te cuesta una vida. La serpiente crece y acelera tras cada respuesta correcta, y el juego solo termina cuando pierdes todas las vidas. ¡Cuidado con morderte la cola!",
      controls: "flechas o W A S D; en el móvil desliza el dedo o usa los botones",
      action: "Empezar",
      upgradeAction: "Velocidad de la serpiente",
    },
    fr: {
      title: "Serpent de la jungle",
      intro: "Mange la pomme avec la bonne réponse. Une mauvaise pomme coûte une vie. Le serpent grandit et accélère après chaque bonne réponse, et la partie ne se termine que lorsque tu perds toutes tes vies. Attention à ne pas te mordre la queue !",
      controls: "flèches ou W A S D ; sur téléphone, glisse le doigt ou utilise les boutons",
      action: "Partir",
      upgradeAction: "Vitesse du serpent",
    },
  },
  breakout: {
    ...withFallbacks({
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
    }),
    uk: {
      title: "Пролом мурів",
      intro: "Відбивай м'ячик платформою і розбий блок із правильною відповіддю. Неправильний блок забирає життя, так само як м'ячик, що впаде.",
      controls: "← → або A D; на телефоні проводь пальцем по полю",
      action: "Запустити м'ячик",
      upgradeAction: "Ширина платформи",
    },
    ja: {
      title: "城壁クラッシャー",
      intro: "パドルでボールを跳ね返し、正しい答えのブロックを壊そう。間違ったブロックを壊すとライフが減り、ボールを落としてもライフが減ります。",
      controls: "← → または A D。スマホでは指で画面をなぞってください",
      action: "ボールを発射",
      upgradeAction: "パドルの幅",
    },
    es: {
      title: "Rompemuros",
      intro: "Rebota la pelota con la pala y rompe el bloque con la respuesta correcta. Un bloque equivocado te cuesta una vida, y también la pierdes si la pelota cae.",
      controls: "← → o A D; en el móvil arrastra el dedo por el campo",
      action: "Lanzar pelota",
      upgradeAction: "Ancho de la pala",
    },
    fr: {
      title: "Briseur de murs",
      intro: "Renvoie la balle avec la raquette et casse le bloc avec la bonne réponse. Un mauvais bloc coûte une vie, tout comme une balle qui tombe.",
      controls: "← → ou A D ; sur téléphone, fais glisser le doigt sur le terrain",
      action: "Lancer la balle",
      upgradeAction: "Largeur de la raquette",
    },
  },
  tetris: {
    ...withFallbacks({
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
    }),
    uk: {
      title: "Падіння блоків",
      intro: "Унизу чекають чотири майданчики з відповідями. Рухай і обертай блок, що падає, і скинь його на майданчик із правильною відповіддю. Майданчик під блоком світиться. Неправильний майданчик забирає життя і закривається.",
      controls: "← → рух, ↑ обертати, ↓ прискорити, пробіл — скинути",
      action: "Скинути",
      upgradeAction: "Керування блоками",
    },
    ja: {
      title: "落ちてくるブロック",
      intro: "下には答えの書かれた着地台が4つあります。落ちてくるブロックを動かし、回転させて、正しい答えの台に落としましょう。ブロックの真下の台が光ります。間違った台に落とすとライフが減り、その台は閉じてしまいます。",
      controls: "← → 移動、↑ 回転、↓ 速く落とす、スペース 落下",
      action: "落とす",
      upgradeAction: "ブロックの操作",
    },
    es: {
      title: "Caída de bloques",
      intro: "Abajo esperan cuatro plataformas con respuestas. Mueve y gira el bloque que cae y suéltalo sobre la plataforma con la respuesta correcta. La plataforma bajo el bloque brilla. Una plataforma equivocada te cuesta una vida y se cierra.",
      controls: "← → mover, ↑ girar, ↓ acelerar, espacio soltar",
      action: "Soltar",
      upgradeAction: "Control de bloques",
    },
    fr: {
      title: "Chute de blocs",
      intro: "Quatre plateformes portant des réponses t'attendent en bas. Déplace et tourne le bloc qui tombe, puis lâche-le sur la plateforme avec la bonne réponse. La plateforme sous le bloc s'illumine. Une mauvaise plateforme coûte une vie et se ferme.",
      controls: "← → déplacer, ↑ tourner, ↓ accélérer, espace lâcher",
      action: "Lâcher",
      upgradeAction: "Contrôle des blocs",
    },
  },
  mole: {
    ...withFallbacks({
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
    }),
    uk: {
      title: "Полювання на кротів",
      intro: "З нір визирають кроти, і кожен тримає табличку з відповіддю. Клацни молотком по тому, у кого правильна! Неправильний крот забирає життя і ненадовго ховається.",
      controls: "← → вибрати нору, пробіл — удар; на телефоні торкнись крота",
      action: "Ударити",
      upgradeAction: "Швидкість молотка",
    },
    ja: {
      title: "モグラたたき",
      intro: "穴からモグラが顔を出し、それぞれ答えの書かれた札を持っています。正しい答えのモグラをハンマーでたたこう！間違ったモグラをたたくとライフが減り、しばらく隠れてしまいます。",
      controls: "← → 穴を選ぶ、スペース たたく。スマホではモグラをタップ",
      action: "たたく",
      upgradeAction: "ハンマーの速さ",
    },
    es: {
      title: "Caza de topos",
      intro: "Los topos salen de los agujeros, y cada uno sostiene un cartel con una respuesta. ¡Golpea al que tiene la respuesta correcta! Un topo equivocado te cuesta una vida y se esconde un rato.",
      controls: "← → elegir agujero, espacio para golpear; en el móvil toca al topo",
      action: "Golpear",
      upgradeAction: "Velocidad del martillo",
    },
    fr: {
      title: "Chasse aux taupes",
      intro: "Des taupes sortent des trous, chacune tenant un panneau avec une réponse. Frappe celle qui a la bonne réponse ! Une mauvaise taupe coûte une vie et se cache un moment.",
      controls: "← → choisir un trou, espace pour frapper ; sur téléphone, touche la taupe",
      action: "Frapper",
      upgradeAction: "Vitesse du marteau",
    },
  },
  minesweeper: {
    ...withFallbacks({
      cs: {
        title: "Hledání min",
        intro: "Klepni na zakryté políčko a odpověz na otázku. Správná odpověď ho odkryje a ukáže, kolik min leží okolo. Špatná odpověď nic nestojí, přijde další otázka. Mina, kterou odhalíš, ubere život.",
        controls: "klepni nebo klikni na políčko, pak na odpověď",
        action: "Odkrýt",
        upgradeAction: "Rychlost prstu",
      },
      en: {
        title: "Minesweeper",
        intro: "Tap a hidden tile, then answer the question. A right answer reveals it and shows how many mines are around it. A wrong answer costs nothing, another question comes. Reveal a mine and you lose a life.",
        controls: "tap or click a tile, then an answer",
        action: "Reveal",
        upgradeAction: "Finger speed",
      },
      de: {
        title: "Minensucher",
        intro: "Tippe auf ein verdecktes Feld und beantworte die Frage. Eine richtige Antwort deckt es auf und zeigt, wie viele Minen daneben liegen. Eine falsche kostet nichts, es kommt eine neue Frage. Wenn du eine Mine aufdeckst, verlierst du ein Leben.",
        controls: "auf ein Feld tippen oder klicken, dann eine Antwort",
        action: "Aufdecken",
        upgradeAction: "Fingertempo",
      },
      ru: {
        title: "Сапёр",
        intro: "Нажми на закрытую клетку и ответь на вопрос. Верный ответ открывает клетку и показывает, сколько мин рядом. Неверный ответ ничего не стоит, придёт новый вопрос. Если откроешь мину, потеряешь жизнь.",
        controls: "нажми или кликни на клетку, затем на ответ",
        action: "Открыть",
        upgradeAction: "Скорость пальца",
      },
    }),
    uk: {
      title: "Сапер",
      intro: "Натисни закриту клітинку і відповідай на питання. Правильна відповідь відкриває клітинку і показує, скільки мін поруч. Неправильна нічого не коштує, прийде нове питання. Якщо відкриєш міну, втратиш життя.",
      controls: "натисни або клікни клітинку, потім відповідь",
      action: "Відкрити",
      upgradeAction: "Швидкість пальця",
    },
    ja: {
      title: "マインスイーパー",
      intro: "伏せられたマスをタップして、問題に答えよう。正解するとマスが開き、周りの地雷の数がわかる。不正解でもペナルティはなく、次の問題が出る。地雷を開いてしまうとライフが減るよ。",
      controls: "マスをタップかクリックして、次に答えを選ぶ",
      action: "開ける",
      upgradeAction: "指の速さ",
    },
    es: {
      title: "Buscaminas",
      intro: "Toca una casilla oculta y responde la pregunta. Una respuesta correcta la descubre y muestra cuántas minas hay alrededor. Una respuesta equivocada no cuesta nada, sale otra pregunta. Si descubres una mina, pierdes una vida.",
      controls: "toca o haz clic en una casilla y luego en una respuesta",
      action: "Descubrir",
      upgradeAction: "Velocidad del dedo",
    },
    fr: {
      title: "Démineur",
      intro: "Touche une case cachée puis réponds à la question. Une bonne réponse la révèle et indique combien de mines l'entourent. Une mauvaise réponse ne coûte rien, une autre question arrive. Si tu révèles une mine, tu perds une vie.",
      controls: "touche ou clique une case, puis une réponse",
      action: "Révéler",
      upgradeAction: "Vitesse du doigt",
    },
  },
  ninja: {
    ...withFallbacks({
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
    }),
    uk: {
      title: "Тіньовий воїн",
      intro: "Відповіді летять у повітрі, як фрукти. Розітни правильну, щоб розрізати її навпіл! Неправильну не чіпай, вона забирає життя. Фрукт, що впав, не страшний: він знову злетить.",
      controls: "проведи пальцем або мишею; на клавіатурі стрілки і пробіл — удар",
      action: "Удар",
      upgradeAction: "Швидкість леза",
    },
    ja: {
      title: "影の戦士",
      intro: "答えがフルーツのように宙を飛びます。正しい答えを切って真っ二つにしよう！間違った答えを切るとライフが減るので注意してね。落ちてしまったフルーツは気にしなくて大丈夫、また飛んできます。",
      controls: "指またはマウスでなぞる。キーボードは矢印キーとスペースで斬る",
      action: "斬る",
      upgradeAction: "刃の速さ",
    },
    es: {
      title: "Guerrero de las sombras",
      intro: "Las respuestas vuelan por el aire como frutas. ¡Corta la correcta para partirla por la mitad! No cortes una equivocada, te cuesta una vida. La fruta que cae no importa, vuelve a salir disparada.",
      controls: "arrastra con el dedo o el ratón; con teclado, flechas y espacio para cortar",
      action: "Cortar",
      upgradeAction: "Velocidad de la hoja",
    },
    fr: {
      title: "Guerrier de l'ombre",
      intro: "Les réponses fusent dans les airs comme des fruits. Tranche la bonne pour la couper en deux ! Ne tranche pas une mauvaise, elle coûte une vie. Un fruit tombé n'a pas d'importance, il repart dans les airs.",
      controls: "glisse avec le doigt ou la souris ; au clavier, flèches et espace pour trancher",
      action: "Trancher",
      upgradeAction: "Vitesse de la lame",
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
