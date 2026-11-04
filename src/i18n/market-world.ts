import { withFallbacks } from "./config";
import type { Locale } from "./config";
import type { StallKey } from "@/lib/market-worlds";
import { getMarketText } from "./market";

// Texty jednotlivých světů obchodu (stánky, obchodníci, interaktivní věci) a odemykání dalších světů.
// Pirátský přístav bere texty z market.ts, ostatní světy jsou tady.

export type StallText = { name: string; npc: string; hello: string[] };
export type WorldText = {
  title: string;
  subtitle: string;
  stalls: Record<StallKey, StallText>;
  fireLabel: string;
  boom: string;
  talk: Record<string, { label: string; lines: string[] }>;
};
export type UnlockText = { title: string; text: string; button: string; needLevel: string; needPoints: string; done: string; locked: string };

const space: Record<Locale, WorldText> = {
  ...withFallbacks({
  cs: {
    title: "Vesmírná stanice",
    subtitle: "Promenáda na oběžné dráze: roboti, mimozemšťané a astronauti ti prodají vesmírné zboží za body z učení.",
    stalls: {
      avatary: { name: "Převlékárna", npc: "Admirál Hvězdička", hello: ["Pozor, kadete! Skafandr ti padne jako ulitý.", "Nový kostým pro novou misi?"] },
      tituly: { name: "Hvězdná kancelář", npc: "Robot Bip-7", hello: ["Bip bup! Zapíšu ti titul do hvězdného katalogu.", "Zpracovávám tvou žádost… hotovo!"] },
      ramecky: { name: "Dílna rámců", npc: "Inženýrka Matka", hello: ["Rámeček z kosmické oceli, odolá i meteoritům!", "Dej mi chvilku a seřídím ti ho."] },
      pozadi: { name: "Galerie mlhovin", npc: "Zorgla z Alfy", hello: ["Zbarvím ti pozadí do mlhoviny, kterou jsi ještě neviděl.", "Zogli! Vyber si hvězdnou oblohu."] },
      mazlicci: { name: "Biokoutek", npc: "Doktorka Pipetka", hello: ["Mazlíček pro tvou základnu? Tenhle blob je roztomilý.", "Doplňky pro vesmírná zvířátka mám všechny."] },
      lod: { name: "Dok raket", npc: "Raketoplán", hello: ["Stavby pro tvé město se vyrábějí v doku raket."] },
    },
    fireLabel: "Vyslat sondu",
    boom: "BZZZ!",
    talk: {
      pet: { label: "Pohladit blob", lines: ["Blub! Blub!", "Pip pip!", "Jsem tvůj nový kamarád!", "Mlask! Nemáš nějakou hvězdu?"] },
      bot: { label: "Promluvit s robotem", lines: ["Bip bup, uklízím!", "Prach ve vesmíru neexistuje… ale já ho najdu.", "Čistota je půl mise!"] },
    },
  },
  en: {
    title: "Space station",
    subtitle: "A promenade in orbit: robots, aliens and astronauts sell space goods for the points you earn from learning.",
    stalls: {
      avatary: { name: "Changing room", npc: "Admiral Starlet", hello: ["Attention, cadet! That spacesuit fits like a glove.", "A new costume for a new mission?"] },
      tituly: { name: "Star office", npc: "Robot Bip-7", hello: ["Beep boop! I'll write your title into the star catalogue.", "Processing your request… done!"] },
      ramecky: { name: "Frame workshop", npc: "Engineer Mother", hello: ["A frame of space steel, it survives even meteorites!", "Give me a moment and I'll tune it for you."] },
      pozadi: { name: "Nebula gallery", npc: "Zorgla of Alpha", hello: ["I'll paint your background in a nebula you've never seen.", "Zogli! Pick your starry sky."] },
      mazlicci: { name: "Bio corner", npc: "Doctor Pipette", hello: ["A pet for your base? This blob is adorable.", "I have accessories for every space pet."] },
      lod: { name: "Rocket dock", npc: "Space shuttle", hello: ["Buildings for your city are made in the rocket dock."] },
    },
    fireLabel: "Launch a probe",
    boom: "BZZZ!",
    talk: {
      pet: { label: "Pet the blob", lines: ["Blub! Blub!", "Peep peep!", "I'm your new friend!", "Yum! Got any stars?"] },
      bot: { label: "Talk to the robot", lines: ["Beep boop, cleaning!", "There's no dust in space… but I'll find it.", "Cleanliness is half the mission!"] },
    },
  },
  de: {
    title: "Raumstation",
    subtitle: "Eine Promenade im Orbit: Roboter, Außerirdische und Astronauten verkaufen dir Weltraumwaren für deine Lernpunkte.",
    stalls: {
      avatary: { name: "Umkleide", npc: "Admiral Sternchen", hello: ["Achtung, Kadett! Der Raumanzug sitzt wie angegossen.", "Ein neues Kostüm für eine neue Mission?"] },
      tituly: { name: "Sternenbüro", npc: "Roboter Bip-7", hello: ["Bip bup! Ich trage deinen Titel in den Sternenkatalog ein.", "Verarbeite deine Anfrage… fertig!"] },
      ramecky: { name: "Rahmenwerkstatt", npc: "Ingenieurin Mutter", hello: ["Ein Rahmen aus Weltraumstahl, übersteht sogar Meteoriten!", "Gib mir einen Moment, ich stelle ihn ein."] },
      pozadi: { name: "Nebelgalerie", npc: "Zorgla von Alpha", hello: ["Ich färbe deinen Hintergrund in einen Nebel, den du noch nie gesehen hast.", "Zogli! Such dir den Sternenhimmel aus."] },
      mazlicci: { name: "Bio-Ecke", npc: "Doktorin Pipette", hello: ["Ein Haustier für deine Basis? Dieser Blob ist niedlich.", "Zubehör für alle Weltraumtiere habe ich da."] },
      lod: { name: "Raketendock", npc: "Raumfähre", hello: ["Gebäude für deine Stadt entstehen im Raketendock."] },
    },
    fireLabel: "Sonde starten",
    boom: "BZZZ!",
    talk: {
      pet: { label: "Blob streicheln", lines: ["Blub! Blub!", "Piep piep!", "Ich bin dein neuer Freund!", "Mampf! Hast du einen Stern?"] },
      bot: { label: "Mit dem Roboter reden", lines: ["Bip bup, ich putze!", "Im All gibt es keinen Staub… aber ich finde ihn.", "Sauberkeit ist die halbe Mission!"] },
    },
  },
  ru: {
    title: "Космическая станция",
    subtitle: "Променад на орбите: роботы, пришельцы и астронавты продают космические товары за баллы.",
    stalls: {
      avatary: { name: "Раздевалка", npc: "Адмирал Звёздочка", hello: ["Внимание, кадет! Скафандр сидит как влитой.", "Новый костюм для новой миссии?"] },
      tituly: { name: "Звёздная канцелярия", npc: "Робот Бип-7", hello: ["Бип буп! Впишу звание в звёздный каталог.", "Обрабатываю запрос… готово!"] },
      ramecky: { name: "Мастерская рамок", npc: "Инженер Мать", hello: ["Рамка из космической стали выдержит даже метеориты!", "Минутку, и я её настрою."] },
      pozadi: { name: "Галерея туманностей", npc: "Зорлга с Альфы", hello: ["Раскрашу твой фон туманностью, какой ты ещё не видел.", "Зогли! Выбери звёздное небо."] },
      mazlicci: { name: "Биоуголок", npc: "Доктор Пипетка", hello: ["Питомец для базы? Этот блоб очарователен.", "Аксессуары для космических зверей у меня есть."] },
      lod: { name: "Док ракет", npc: "Шаттл", hello: ["Постройки для твоего города делают в доке ракет."] },
    },
    fireLabel: "Запустить зонд",
    boom: "БЗЗЗ!",
    talk: {
      pet: { label: "Погладить блоба", lines: ["Блаб! Блаб!", "Пип пип!", "Я твой новый друг!", "Ням! Звёздочки не найдётся?"] },
      bot: { label: "Поговорить с роботом", lines: ["Бип буп, убираю!", "В космосе нет пыли… но я найду.", "Чистота — половина миссии!"] },
    },
  },
}),
  uk: {
    title: "Космічна станція",
    subtitle: "Прогулянка на орбіті: роботи, прибульці й астронавти продають космічні товари за бали з навчання.",
    stalls: {
      avatary: { name: "Перевдягальня", npc: "Адмірал Зірочка", hello: ["Увага, кадете! Скафандр сидить як влитий.", "Новий костюм для нової місії?"] },
      tituly: { name: "Зоряна канцелярія", npc: "Робот Біп-7", hello: ["Біп буп! Впишу твоє звання в зоряний каталог.", "Обробляю твій запит… готово!"] },
      ramecky: { name: "Майстерня рамок", npc: "Інженерка Мати", hello: ["Рамка з космічної сталі витримає навіть метеорити!", "Дай мені хвилинку, і я її налаштую."] },
      pozadi: { name: "Галерея туманностей", npc: "Зорґла з Альфи", hello: ["Пофарбую твій фон у туманність, якої ти ще не бачив.", "Зоґлі! Вибери зоряне небо."] },
      mazlicci: { name: "Біокуточок", npc: "Докторка Піпетка", hello: ["Улюбленець для твоєї бази? Цей блоб миленький.", "Аксесуари для космічних звірів у мене є всі."] },
      lod: { name: "Док ракет", npc: "Космічний човник", hello: ["Будівлі для твого міста виготовляють у доку ракет."] },
    },
    fireLabel: "Запустити зонд",
    boom: "БЗЗЗ!",
    talk: {
      pet: { label: "Погладити блоба", lines: ["Блуб! Блуб!", "Піп-піп!", "Я твій новий друг!", "Ням! Зірочки не знайдеться?"] },
      bot: { label: "Поговорити з роботом", lines: ["Біп буп, прибираю!", "У космосі немає пилу… але я його знайду.", "Чистота — половина місії!"] },
    },
  },
  ja: {
    title: "宇宙ステーション",
    subtitle: "軌道上の遊歩道です。ロボット、宇宙人、宇宙飛行士たちが、学習で貯めたポイントで宇宙グッズを売っています。",
    stalls: {
      avatary: { name: "着替え室", npc: "アドミラル・ホシノコ", hello: ["気をつけて、カデットさん！宇宙服がぴったりですよ。", "新しいミッションには、新しい衣装はいかがですか？"] },
      tituly: { name: "星の事務所", npc: "ロボット ビップ7", hello: ["ビップ・ブップ！称号を星のカタログに記録しますね。", "リクエストを処理中… 完了！"] },
      ramecky: { name: "フレーム工房", npc: "技師のマザー", hello: ["宇宙鋼のフレームです。隕石にも耐えますよ！", "少しお待ちください。調整しますね。"] },
      pozadi: { name: "星雲ギャラリー", npc: "アルファのゾルグラ", hello: ["まだ見たことのない星雲で背景を塗ってあげますよ。", "ゾグリ！星空を選んでね。"] },
      mazlicci: { name: "バイオコーナー", npc: "ドクターピペット", hello: ["基地で飼うペットをお探しですか？このブロブはかわいいですよ。", "宇宙の動物たちのアクセサリーなら、すべてそろっていますよ。"] },
      lod: { name: "ロケットドック", npc: "スペースシャトル", hello: ["街に置く建物はロケットドックで作られています。"] },
    },
    fireLabel: "探査機を打ち上げる",
    boom: "ビーーッ！",
    talk: {
      pet: { label: "ブロブをなでる", lines: ["ブルブル！ブルブル！", "ピップ！", "ぼくはきみの新しい友だちだよ！", "もぐもぐ！星はないかな？"] },
      bot: { label: "ロボットに話しかける", lines: ["ビップ・ブップ、お掃除中です！", "宇宙にはホコリがないはずですが… 探してみます。", "清潔さはミッションの半分です！"] },
    },
  },
  es: {
    title: "Estación espacial",
    subtitle: "Un paseo en órbita: robots, extraterrestres y astronautas te venden artículos espaciales por los puntos que ganas aprendiendo.",
    stalls: {
      avatary: { name: "Vestuario", npc: "Almirante Estrellita", hello: ["¡Atención, cadete! Ese traje espacial te queda como anillo al dedo.", "¿Un disfraz nuevo para una nueva misión?"] },
      tituly: { name: "Oficina estelar", npc: "Robot Bip-7", hello: ["¡Bip bup! Escribiré tu título en el catálogo estelar.", "¡Procesando tu solicitud… listo!"] },
      ramecky: { name: "Taller de marcos", npc: "Ingeniera Madre", hello: ["¡Un marco de acero espacial que resiste incluso los meteoritos!", "Dame un momento y lo ajusto para ti."] },
      pozadi: { name: "Galería de nebulosas", npc: "Zorgla de Alfa", hello: ["Pintaré tu fondo con una nebulosa que nunca has visto.", "¡Zogli! Elige tu cielo estrellado."] },
      mazlicci: { name: "Rincón bio", npc: "Doctora Pipeta", hello: ["¿Una mascota para tu base? Este blob es adorable.", "Tengo accesorios para todas las mascotas espaciales."] },
      lod: { name: "Muelle de cohetes", npc: "Transbordador espacial", hello: ["Los edificios para tu ciudad se construyen en el muelle de cohetes."] },
    },
    fireLabel: "Lanzar una sonda",
    boom: "¡BZZZ!",
    talk: {
      pet: { label: "Acariciar al blob", lines: ["¡Blub! ¡Blub!", "¡Pip pip!", "¡Soy tu nuevo amigo!", "¡Ñam! ¿No tendrás alguna estrella?"] },
      bot: { label: "Hablar con el robot", lines: ["¡Bip bup, limpiando!", "En el espacio no hay polvo… pero lo encontraré.", "¡La limpieza es la mitad de la misión!"] },
    },
  },
  fr: {
    title: "Station spatiale",
    subtitle: "Une promenade en orbite : des robots, des extraterrestres et des astronautes vendent des articles spatiaux contre les points que tu gagnes en apprenant.",
    stalls: {
      avatary: { name: "Cabine d'essayage", npc: "Amiral Étoilette", hello: ["Attention, cadet ! Cette combinaison spatiale te va comme un gant.", "Un nouveau costume pour une nouvelle mission ?"] },
      tituly: { name: "Bureau des étoiles", npc: "Robot Bip-7", hello: ["Bip boup ! J'inscris ton titre dans le catalogue des étoiles.", "Je traite ta demande… terminé !"] },
      ramecky: { name: "Atelier des cadres", npc: "Ingénieure Mère", hello: ["Un cadre en acier spatial, il résiste même aux météorites !", "Donne-moi un instant, je le règle pour toi."] },
      pozadi: { name: "Galerie des nébuleuses", npc: "Zorgla d'Alpha", hello: ["Je vais peindre ton fond dans une nébuleuse que tu n'as jamais vue.", "Zogli ! Choisis ton ciel étoilé."] },
      mazlicci: { name: "Coin bio", npc: "Docteure Pipette", hello: ["Un animal de compagnie pour ta base ? Ce blob est adorable.", "J'ai des accessoires pour tous les animaux de l'espace."] },
      lod: { name: "Dock des fusées", npc: "Navette spatiale", hello: ["Les bâtiments pour ta ville se construisent au dock des fusées."] },
    },
    fireLabel: "Lancer une sonde",
    boom: "BZZZ !",
    talk: {
      pet: { label: "Caresser le blob", lines: ["Blub ! Blub !", "Pip pip !", "Je suis ton nouvel ami !", "Miam ! Tu n'aurais pas une étoile ?"] },
      bot: { label: "Parler au robot", lines: ["Bip boup, je nettoie !", "Il n'y a pas de poussière dans l'espace… mais je vais en trouver.", "La propreté, c'est la moitié de la mission !"] },
    },
  },
};


const forest: Record<Locale, WorldText> = {
  ...withFallbacks({
  cs: {
    title: "Pohádkový les",
    subtitle: "Mýtina plná světlušek: víly, hajní a lesní řemeslníci ti prodají kouzelné zboží za body z učení.",
    stalls: {
      avatary: { name: "Lesní krejčovna", npc: "Víla Lupínka", hello: ["Listové šaty ti sednou jako ulité!", "Pojď, ušiju ti něco z mechu a lupínků."] },
      tituly: { name: "Hájenka", npc: "Hajný Mechomil", hello: ["Zapíšu ti titul do lesní kroniky.", "Kdo se učí, toho les ctí."] },
      ramecky: { name: "Řezbářská dílna", npc: "Řezbář Šiška", hello: ["Rámeček z větvičky, vyřezávaný ručně!", "Dřevo voní, jen si přivoň."] },
      pozadi: { name: "Světluščí galerie", npc: "Malířka Světluška", hello: ["Namaluji ti pozadí zářící jako světlušky.", "Vyber si barvy lesa."] },
      mazlicci: { name: "Bylinkářství", npc: "Bylinkářka Meduňka", hello: ["Pro mazlíčka mám bylinky i ozdoby.", "Ten králíček je můj nejlepší zákazník."] },
      lod: { name: "Domek v koruně", npc: "Domek", hello: ["Stavby pro tvé město vznikají v domku na stromě."] },
    },
    fireLabel: "Mávnout kouzelnou hůlkou",
    boom: "ŠIM!",
    talk: {
      kralik: { label: "Pohladit králíčka", lines: ["Čich, čich… mrkev?", "Hop hop!", "Tady je krásně, že?"] },
      kocka: { label: "Pohladit kočku", lines: ["Mňau!", "Prrr… škrábej za uchem.", "Mňau mňau!"] },
    },
  },
  en: {
    title: "Fairy forest",
    subtitle: "A glade full of fireflies: fairies, rangers and forest crafters sell you magical goods for learning points.",
    stalls: {
      avatary: { name: "Forest tailor", npc: "Fairy Petal", hello: ["Leaf dresses fit like a dream!", "Come, I'll sew you something from moss and petals."] },
      tituly: { name: "Ranger's lodge", npc: "Ranger Mossy", hello: ["I'll write your title in the forest chronicle.", "The forest honours those who learn."] },
      ramecky: { name: "Carver's workshop", npc: "Carver Pinecone", hello: ["A twig frame, carved by hand!", "Smell the wood, it's lovely."] },
      pozadi: { name: "Firefly gallery", npc: "Painter Glimmer", hello: ["I'll paint you a background that glows like fireflies.", "Pick the colours of the forest."] },
      mazlicci: { name: "Herbalist", npc: "Herbalist Melissa", hello: ["I have herbs and trinkets for your pet.", "This bunny is my best customer."] },
      lod: { name: "Treehouse", npc: "Treehouse", hello: ["Buildings for your city are made in the treehouse."] },
    },
    fireLabel: "Wave the magic wand",
    boom: "SHIM!",
    talk: {
      kralik: { label: "Pet the bunny", lines: ["Sniff, sniff… carrot?", "Hop hop!", "It's lovely here, isn't it?"] },
      kocka: { label: "Pet the cat", lines: ["Meow!", "Purr… scratch behind my ear.", "Meow meow!"] },
    },
  },
  de: {
    title: "Märchenwald",
    subtitle: "Eine Lichtung voller Glühwürmchen: Feen, Förster und Waldhandwerker verkaufen dir Zauberwaren für deine Lernpunkte.",
    stalls: {
      avatary: { name: "Waldschneiderei", npc: "Fee Blütenblatt", hello: ["Blätterkleider sitzen wie angegossen!", "Komm, ich nähe dir etwas aus Moos und Blüten."] },
      tituly: { name: "Försterhaus", npc: "Förster Moosmann", hello: ["Ich schreibe deinen Titel in die Waldchronik.", "Der Wald ehrt, wer lernt."] },
      ramecky: { name: "Schnitzwerkstatt", npc: "Schnitzer Zapfen", hello: ["Ein Zweigrahmen, von Hand geschnitzt!", "Riech mal am Holz, wie das duftet."] },
      pozadi: { name: "Glühwürmchen-Galerie", npc: "Malerin Glimmer", hello: ["Ich male dir einen Hintergrund, der wie Glühwürmchen leuchtet.", "Such dir die Farben des Waldes aus."] },
      mazlicci: { name: "Kräuterladen", npc: "Kräuterfrau Melisse", hello: ["Für dein Haustier habe ich Kräuter und Schmuck.", "Dieses Häschen ist mein bester Kunde."] },
      lod: { name: "Baumhaus", npc: "Baumhaus", hello: ["Gebäude für deine Stadt entstehen im Baumhaus."] },
    },
    fireLabel: "Zauberstab schwingen",
    boom: "SCHIMM!",
    talk: {
      kralik: { label: "Häschen streicheln", lines: ["Schnuppern… Karotte?", "Hopp hopp!", "Hier ist es schön, oder?"] },
      kocka: { label: "Katze streicheln", lines: ["Miau!", "Schnurr… kraul mich hinterm Ohr.", "Miau miau!"] },
    },
  },
  ru: {
    title: "Сказочный лес",
    subtitle: "Поляна, полная светлячков: феи, лесники и лесные мастера продают волшебные товары за баллы.",
    stalls: {
      avatary: { name: "Лесная швейная", npc: "Фея Лепесток", hello: ["Платья из листьев сидят как влитые!", "Иди, сошью тебе что-нибудь из мха и лепестков."] },
      tituly: { name: "Сторожка", npc: "Лесник Мшистый", hello: ["Запишу звание в лесную летопись.", "Лес чтит тех, кто учится."] },
      ramecky: { name: "Резная мастерская", npc: "Резчик Шишка", hello: ["Рамка из веточки, вырезана вручную!", "Понюхай, как пахнет дерево."] },
      pozadi: { name: "Галерея светлячков", npc: "Художница Светлячок", hello: ["Нарисую фон, который светится, как светлячки.", "Выбери краски леса."] },
      mazlicci: { name: "Травница", npc: "Травница Мелисса", hello: ["Для питомца у меня есть травы и украшения.", "Этот кролик — мой лучший покупатель."] },
      lod: { name: "Домик на дереве", npc: "Домик", hello: ["Постройки для твоего города делают в домике на дереве."] },
    },
    fireLabel: "Взмахнуть волшебной палочкой",
    boom: "ШИМ!",
    talk: {
      kralik: { label: "Погладить кролика", lines: ["Ню-ню… морковка?", "Прыг-скок!", "Здесь красиво, правда?"] },
      kocka: { label: "Погладить кошку", lines: ["Мяу!", "Мур… почеши за ушком.", "Мяу мяу!"] },
    },
  },
}),
  uk: {
    title: "Казковий ліс",
    subtitle: "Галявина, повна світлячків: феї, лісники та лісові майстри продають тобі чарівні товари за бали з навчання.",
    stalls: {
      avatary: { name: "Лісова кравчиня", npc: "Фея Пелюстка", hello: ["Сукні з листя сидять, як ціла мрія!", "Ходи, пошию тобі щось із моху та пелюсток."] },
      tituly: { name: "Сторожка", npc: "Лісник Мохомил", hello: ["Запишу твоє звання в лісову літопис.", "Ліс шанує тих, хто вчиться."] },
      ramecky: { name: "Майстерня різьбярів", npc: "Різьбяр Шишка", hello: ["Рамка з гілочки, вирізана вручну!", "Відчуй запах дерева, як гарно пахне."] },
      pozadi: { name: "Галерея світлячків", npc: "Художниця Світлячок", hello: ["Намалюю тобі фон, що сяє, як світлячки.", "Вибери кольори лісу."] },
      mazlicci: { name: "Травознавство", npc: "Травниця Меліса", hello: ["Для улюбленця маю трави й прикраси.", "Цей кролик — мій найкращий клієнт."] },
      lod: { name: "Будиночок на дереві", npc: "Будиночок", hello: ["Будівлі для твого міста виростають у будиночку на дереві."] },
    },
    fireLabel: "Махнути чарівною паличкою",
    boom: "ШИМ!",
    talk: {
      kralik: { label: "Погладити кролика", lines: ["Нюх-нюх… морквинка?", "Скік-скік!", "Тут гарно, правда?"] },
      kocka: { label: "Погладити кішку", lines: ["Мяу!", "Мур… почеши за вушком.", "Мяу-мяу!"] },
    },
  },
  ja: {
    title: "おとぎの森",
    subtitle: "ホタルでいっぱいの空き地です。妖精、森の番人、森の職人たちが、学習ポイントで魔法のアイテムを売っています。",
    stalls: {
      avatary: { name: "森の仕立て屋", npc: "妖精ペタル", hello: ["葉っぱのドレス、ぴったりですよ！", "おいで、こけと花びらで何か作ってあげる。"] },
      tituly: { name: "番人の小屋", npc: "森の番人モスィー", hello: ["あなたの称号を森の年代記に記しておきますね。", "森は学ぶ者を敬うのです。"] },
      ramecky: { name: "彫刻工房", npc: "彫刻師のマツボックリ", hello: ["小枝でできたフレームを、手彫りで作りましたよ！", "木のいい香りでしょう？"] },
      pozadi: { name: "ホタルのギャラリー", npc: "画家のグリマー", hello: ["ホタルのように光る背景を描いてあげますよ。", "森の色を選んでください。"] },
      mazlicci: { name: "薬草店", npc: "薬草師のメリッサ", hello: ["ペットのための薬草と飾りがありますよ。", "このウサギは私の一番のお客さまなの。"] },
      lod: { name: "木の上の家", npc: "木の家", hello: ["街に置く建物は、木の上の家で作られています。"] },
    },
    fireLabel: "魔法の杖を振る",
    boom: "シュピン！",
    talk: {
      kralik: { label: "ウサギをなでる", lines: ["クンクン…にんじん？", "ぴょんぴょん！", "ここは素敵でしょう？"] },
      kocka: { label: "ねこをなでる", lines: ["にゃあ！", "ゴロゴロ…耳の後ろをかいて。", "にゃーにゃー！"] },
    },
  },
  es: {
    title: "Bosque de cuento",
    subtitle: "Un claro lleno de luciérnagas: hadas, guardabosques y artesanos del bosque te venden objetos mágicos por tus puntos de aprendizaje.",
    stalls: {
      avatary: { name: "Sastrería del bosque", npc: "Hada Pétalo", hello: ["¡Los vestidos de hojas te sientan de maravilla!", "Ven, te coseré algo de musgo y pétalos."] },
      tituly: { name: "Casa del guardabosques", npc: "Guardabosques Musgoso", hello: ["Escribiré tu título en la crónica del bosque.", "El bosque honra a quien aprende."] },
      ramecky: { name: "Taller del tallista", npc: "Tallista Piñacona", hello: ["¡Un marco de ramita, tallado a mano!", "Huele la madera, qué bien huele."] },
      pozadi: { name: "Galería de luciérnagas", npc: "Pintora Destello", hello: ["Te pintaré un fondo que brille como las luciérnagas.", "Elige los colores del bosque."] },
      mazlicci: { name: "Herbolario", npc: "Herborista Melisa", hello: ["Tengo hierbas y adornos para tu mascota.", "Este conejito es mi mejor cliente."] },
      lod: { name: "Casa del árbol", npc: "Casa del árbol", hello: ["Los edificios para tu ciudad se construyen en la casa del árbol."] },
    },
    fireLabel: "Agitar la varita mágica",
    boom: "¡ZAS!",
    talk: {
      kralik: { label: "Acariciar al conejito", lines: ["¿Snif, snif… una zanahoria?", "¡Hop hop!", "Se está muy bien aquí, ¿verdad?"] },
      kocka: { label: "Acariciar al gato", lines: ["¡Miau!", "Prrr… rásscame detrás de la oreja.", "¡Miau miau!"] },
    },
  },
  fr: {
    title: "Forêt enchantée",
    subtitle: "Une clairière pleine de lucioles : fées, gardes forestiers et artisans des bois te vendent des objets magiques contre tes points d'apprentissage.",
    stalls: {
      avatary: { name: "Tailleur de la forêt", npc: "Fée Pétale", hello: ["Les robes de feuilles te vont à merveille !", "Viens, je vais te coudre quelque chose de mousse et de pétales."] },
      tituly: { name: "Maison du garde", npc: "Garde Mousseux", hello: ["J'inscrirai ton titre dans la chronique de la forêt.", "La forêt honore ceux qui apprennent."] },
      ramecky: { name: "Atelier du sculpteur", npc: "Sculpteur Pomme-de-pin", hello: ["Un cadre en brindille, sculpté à la main !", "Sens le bois, comme il sent bon."] },
      pozadi: { name: "Galerie des lucioles", npc: "Peintre Scintille", hello: ["Je te peindrai un fond qui brille comme des lucioles.", "Choisis les couleurs de la forêt."] },
      mazlicci: { name: "Herboristerie", npc: "Herboriste Mélisse", hello: ["J'ai des herbes et des breloques pour ton animal.", "Ce lapin est mon meilleur client."] },
      lod: { name: "Cabane dans l'arbre", npc: "Cabane", hello: ["Les bâtiments pour ta ville se construisent dans la cabane dans l'arbre."] },
    },
    fireLabel: "Agiter la baguette magique",
    boom: "CHIM !",
    talk: {
      kralik: { label: "Caresser le lapin", lines: ["Snif snif… une carotte ?", "Hop hop !", "C'est joli ici, n'est-ce pas ?"] },
      kocka: { label: "Caresser le chat", lines: ["Miaou !", "Purr… gratte-moi derrière l'oreille.", "Miaou miaou !"] },
    },
  },
};

const castle: Record<Locale, WorldText> = {
  ...withFallbacks({
  cs: {
    title: "Hrad a tržiště",
    subtitle: "Středověké tržiště pod hradbami: krejčí, král, kovář i sokolník prodávají zboží za body z učení.",
    stalls: {
      avatary: { name: "Krejčovství", npc: "Krejčí Jehlička", hello: ["Kostým pro rytíře i princeznu, jak si přeješ!", "Změřím tě a ušiju do zítřka."] },
      tituly: { name: "Královská kancelář", npc: "Král Koruna", hello: ["Jménem koruny ti propůjčuji titul!", "Kdo se učí, toho si král váží."] },
      ramecky: { name: "Kovárna", npc: "Kovář Důlek", hello: ["Rámeček z oceli, vykutý v ohni!", "Bum, bum! Tohle vydrží i dračí dech."] },
      pozadi: { name: "Tkalcovna", npc: "Tkadlena Příze", hello: ["Utkám ti pozadí z nejlepších nití.", "Prohlédni si moje gobelíny."] },
      mazlicci: { name: "Sokolna", npc: "Sokolník Pírko", hello: ["Pro mazlíčka mám ozdoby jako pro šlechtice.", "Sokol nesmí na ruku každému."] },
      lod: { name: "Hradní věž", npc: "Věž", hello: ["Stavby pro tvé město vznikají v hradní huti."] },
    },
    fireLabel: "Vystřelit z katapultu",
    boom: "BUM!",
    talk: {
      pes: { label: "Pohladit psa", lines: ["Haf haf!", "Hlídám tržiště!", "Máš pro mě kost?"] },
      slepice: { label: "Promluvit se slepicí", lines: ["Kokodák!", "Dnes snesu zlaté vejce.", "Kdák kdák!"] },
    },
  },
  en: {
    title: "Castle and market",
    subtitle: "A medieval market under the castle walls: the tailor, the king, the blacksmith and the falconer sell goods for learning points.",
    stalls: {
      avatary: { name: "Tailor", npc: "Tailor Needle", hello: ["A costume for a knight or a princess, as you wish!", "I'll measure you and sew it by tomorrow."] },
      tituly: { name: "Royal office", npc: "King Crown", hello: ["By the crown I grant you this title!", "The king values those who learn."] },
      ramecky: { name: "Smithy", npc: "Smith Dent", hello: ["A steel frame, forged in fire!", "Bang, bang! It even survives dragon breath."] },
      pozadi: { name: "Weaver", npc: "Weaver Thread", hello: ["I'll weave you a background from the finest threads.", "Have a look at my tapestries."] },
      mazlicci: { name: "Falconry", npc: "Falconer Feather", hello: ["I have noble trinkets for your pet.", "The falcon doesn't land on everyone's hand."] },
      lod: { name: "Castle tower", npc: "Tower", hello: ["Buildings for your city are made in the castle works."] },
    },
    fireLabel: "Fire the catapult",
    boom: "BOOM!",
    talk: {
      pes: { label: "Pet the dog", lines: ["Woof woof!", "I guard the market!", "Got a bone for me?"] },
      slepice: { label: "Talk to the hen", lines: ["Bawk!", "Today I lay a golden egg.", "Cluck cluck!"] },
    },
  },
  de: {
    title: "Burg und Markt",
    subtitle: "Ein mittelalterlicher Markt unter den Burgmauern: Schneider, König, Schmied und Falkner verkaufen Waren für deine Lernpunkte.",
    stalls: {
      avatary: { name: "Schneiderei", npc: "Schneider Nadel", hello: ["Ein Kostüm für Ritter oder Prinzessin, wie du willst!", "Ich messe dich aus und nähe es bis morgen."] },
      tituly: { name: "Königliches Büro", npc: "König Krone", hello: ["Im Namen der Krone verleihe ich dir diesen Titel!", "Der König schätzt, wer lernt."] },
      ramecky: { name: "Schmiede", npc: "Schmied Beule", hello: ["Ein Stahlrahmen, im Feuer geschmiedet!", "Bumm, bumm! Hält sogar Drachenatem aus."] },
      pozadi: { name: "Weberei", npc: "Weberin Faden", hello: ["Ich webe dir einen Hintergrund aus feinsten Fäden.", "Sieh dir meine Wandteppiche an."] },
      mazlicci: { name: "Falknerei", npc: "Falkner Feder", hello: ["Für dein Haustier habe ich edlen Schmuck.", "Der Falke setzt sich nicht auf jede Hand."] },
      lod: { name: "Burgturm", npc: "Turm", hello: ["Gebäude für deine Stadt entstehen in der Burghütte."] },
    },
    fireLabel: "Katapult abfeuern",
    boom: "BUMM!",
    talk: {
      pes: { label: "Hund streicheln", lines: ["Wau wau!", "Ich bewache den Markt!", "Hast du einen Knochen für mich?"] },
      slepice: { label: "Mit dem Huhn reden", lines: ["Gack!", "Heute lege ich ein goldenes Ei.", "Gack gack!"] },
    },
  },
  ru: {
    title: "Замок и рынок",
    subtitle: "Средневековый рынок под стенами замка: портной, король, кузнец и сокольник продают товары за баллы.",
    stalls: {
      avatary: { name: "Портняжная", npc: "Портной Иголка", hello: ["Костюм для рыцаря или принцессы — как пожелаешь!", "Сниму мерки и сошью к завтрашнему дню."] },
      tituly: { name: "Королевская канцелярия", npc: "Король Корона", hello: ["Именем короны жалую тебе звание!", "Король ценит тех, кто учится."] },
      ramecky: { name: "Кузница", npc: "Кузнец Вмятина", hello: ["Стальная рамка, выкованная в огне!", "Бум, бум! Выдержит даже дыхание дракона."] },
      pozadi: { name: "Ткацкая", npc: "Ткачиха Пряжа", hello: ["Выткаю тебе фон из лучших нитей.", "Взгляни на мои гобелены."] },
      mazlicci: { name: "Соколиный двор", npc: "Сокольник Перо", hello: ["Для питомца у меня благородные украшения.", "Сокол садится не на каждую руку."] },
      lod: { name: "Башня замка", npc: "Башня", hello: ["Постройки для твоего города делают в замковой мастерской."] },
    },
    fireLabel: "Выстрелить из катапульты",
    boom: "БУМ!",
    talk: {
      pes: { label: "Погладить пса", lines: ["Гав-гав!", "Я охраняю рынок!", "Косточка для меня есть?"] },
      slepice: { label: "Поговорить с курицей", lines: ["Ко-ко!", "Сегодня снесу золотое яйцо.", "Куд-кудах!"] },
    },
  },
}),
  uk: {
    title: "Замок і ярмарок",
    subtitle: "Середньовічний ярмарок під стінами замку: кравець, король, коваль і соколятник продають товари за бали з навчання.",
    stalls: {
      avatary: { name: "Кравецтво", npc: "Кравець Голочка", hello: ["Костюм для лицаря чи принцеси, як забажаєш!", "Зніму мірку й пошию до завтра."] },
      tituly: { name: "Королівська канцелярія", npc: "Король Корона", hello: ["Іменем корони надаю тобі це звання!", "Король цінує тих, хто вчиться."] },
      ramecky: { name: "Кузня", npc: "Коваль Вм'ятина", hello: ["Рамка зі сталі, викована у вогні!", "Бум, бум! Витримає навіть подих дракона."] },
      pozadi: { name: "Ткацька", npc: "Ткаля Пряжа", hello: ["Витку тобі фон із найкращих ниток.", "Поглянь на мої гобелени."] },
      mazlicci: { name: "Соколина", npc: "Соколятник Пір'їнка", hello: ["Для улюбленця маю благородні прикраси.", "Сокіл сідає не на кожну руку."] },
      lod: { name: "Замкова вежа", npc: "Вежа", hello: ["Будівлі для твого міста виготовляють у замковій майстерні."] },
    },
    fireLabel: "Вистрелити з катапульти",
    boom: "БУМ!",
    talk: {
      pes: { label: "Погладити пса", lines: ["Гав-гав!", "Я охороняю ярмарок!", "Маєш для мене кісточку?"] },
      slepice: { label: "Поговорити з куркою", lines: ["Ко-ко!", "Сьогодні знесу золоте яйце.", "Кудах-кудах!"] },
    },
  },
  ja: {
    title: "お城と市場",
    subtitle: "城壁の下に広がる中世の市場です。仕立て屋、王さま、鍛冶屋、鷹匠が、学習ポイントで商品を売っています。",
    stalls: {
      avatary: { name: "仕立て屋", npc: "仕立て屋のハリ", hello: ["騎士でもお姫さまでも、お好みの衣装をご用意しますよ！", "採寸して、明日までに仕立てておきますね。"] },
      tituly: { name: "王室の事務所", npc: "王様のクラウン", hello: ["王冠の名において、この称号を授けましょう！", "王様は学ぶ者を大切にしますよ。"] },
      ramecky: { name: "鍛冶屋", npc: "鍛冶屋のデント", hello: ["炎で鍛えた鋼のフレームです！", "カンカン！ドラゴンの吐息にも耐えますよ。"] },
      pozadi: { name: "機織り小屋", npc: "機織りのスレッド", hello: ["最高級の糸で背景を織ってあげますよ。", "私のタペストリーを見ていってください。"] },
      mazlicci: { name: "鷹狩り小屋", npc: "鷹匠のフェザー", hello: ["ペットのための高貴な飾りがありますよ。", "鷹はだれの腕にでもとまるわけではないんです。"] },
      lod: { name: "お城の塔", npc: "塔", hello: ["街に置く建物は、お城の工房で作られています。"] },
    },
    fireLabel: "投石器を発射する",
    boom: "ドーン！",
    talk: {
      pes: { label: "犬をなでる", lines: ["ワンワン！", "市場を守っているんだ！", "ぼくにほねはあるかな？"] },
      slepice: { label: "ニワトリに話しかける", lines: ["コッコッ！", "今日は金のたまごを産むわよ。", "コッ、コッコー！"] },
    },
  },
  es: {
    title: "Castillo y mercado",
    subtitle: "Un mercado medieval bajo las murallas del castillo: el sastre, el rey, el herrero y el halconero venden artículos por tus puntos de aprendizaje.",
    stalls: {
      avatary: { name: "Sastrería", npc: "Sastre Aguja", hello: ["¡Un disfraz de caballero o de princesa, como quieras!", "Te tomaré medidas y te lo coso para mañana."] },
      tituly: { name: "Oficina real", npc: "Rey Corona", hello: ["¡En nombre de la corona te concedo este título!", "El rey valora a quien aprende."] },
      ramecky: { name: "Herrería", npc: "Herrero Abolladura", hello: ["¡Un marco de acero, forjado al fuego!", "¡Pum, pum! Aguanta incluso el aliento de un dragón."] },
      pozadi: { name: "Tejeduría", npc: "Tejedora Hilo", hello: ["Te tejeré un fondo con los mejores hilos.", "Echa un vistazo tranquilo a mis tapices."] },
      mazlicci: { name: "Halconería", npc: "Halconero Pluma", hello: ["Para tu mascota tengo adornos de nobles.", "El halcón no se posa en cualquier mano."] },
      lod: { name: "Torre del castillo", npc: "Torre", hello: ["Los edificios para tu ciudad se construyen en el taller del castillo."] },
    },
    fireLabel: "Disparar la catapulta",
    boom: "¡BUM!",
    talk: {
      pes: { label: "Acariciar al perro", lines: ["¡Guau guau!", "¡Vigilo el mercado!", "¿Tienes un hueso para mí?"] },
      slepice: { label: "Hablar con la gallina", lines: ["¡Cocorocó!", "Hoy pondré un huevo de oro.", "¡Cloc cloc!"] },
    },
  },
  fr: {
    title: "Château et marché",
    subtitle: "Un marché médiéval au pied des remparts : le tailleur, le roi, le forgeron et le fauconnier vendent des articles contre tes points d'apprentissage.",
    stalls: {
      avatary: { name: "Tailleur", npc: "Tailleur Aiguille", hello: ["Un costume de chevalier ou de princesse, comme tu le souhaites !", "Je prends tes mesures et je te coud ça d'ici demain."] },
      tituly: { name: "Bureau royal", npc: "Roi Couronne", hello: ["Au nom de la couronne, je t'accorde ce titre !", "Le roi estime ceux qui apprennent."] },
      ramecky: { name: "Forge", npc: "Forgeron Bosse", hello: ["Un cadre en acier, forgé au feu !", "Dong, dong ! Il résiste même au souffle d'un dragon."] },
      pozadi: { name: "Tissage", npc: "Tisseuse Fil", hello: ["Je te tisserai un fond avec les plus beaux fils.", "Jette un œil à mes tapisseries."] },
      mazlicci: { name: "Fauconnerie", npc: "Fauconnier Plume", hello: ["J'ai des parures dignes d'un noble pour ton animal.", "Le faucon ne se pose pas sur n'importe quelle main."] },
      lod: { name: "Tour du château", npc: "Tour", hello: ["Les bâtiments pour ta ville se construisent dans les ateliers du château."] },
    },
    fireLabel: "Tirer la catapulte",
    boom: "BOUM !",
    talk: {
      pes: { label: "Caresser le chien", lines: ["Ouaf ouaf !", "Je garde le marché !", "Tu as un os pour moi ?"] },
      slepice: { label: "Parler à la poule", lines: ["Cot cot !", "Aujourd'hui, je pondrai un œuf d'or.", "Cot cot cot !"] },
    },
  },
};

const sea: Record<Locale, WorldText> = {
  ...withFallbacks({
  cs: {
    title: "Podmořské město",
    subtitle: "Perleťové město na mořském dně: mořské panny, potápěči a mágové ti prodají mořské zboží za body z učení.",
    stalls: {
      avatary: { name: "Mušlová převlékárna", npc: "Mořská panna Perla", hello: ["Ploutve nebo skafandr? Vyber si!", "Mušle ti sluší, věř mi."] },
      tituly: { name: "Perlová kancelář", npc: "Kapitán Hlubina", hello: ["Zapíšu ti titul do lodního deníku hlubin.", "Bublinky, bublinky… hotovo!"] },
      ramecky: { name: "Korálová dílna", npc: "Perlař Perlík", hello: ["Rámeček z korálu a perel, jedinečný!", "Perla k perle se skvěle hodí."] },
      pozadi: { name: "Galerie medúz", npc: "Mág Mušle", hello: ["Vyčaruji ti pozadí z mořských světel.", "Medúzy tě rády osvětlí."] },
      mazlicci: { name: "Akvárium", npc: "Delfínka", hello: ["Pro tvého mazlíčka mám ozdoby z moře.", "Ryby jsou moje nejlepší kamarádky."] },
      lod: { name: "Ponorka", npc: "Ponorka", hello: ["Stavby pro tvé město se vyrábějí v ponorkovém doku."] },
    },
    fireLabel: "Vypustit bublinu",
    boom: "BLUB!",
    talk: {
      ryba: { label: "Promluvit s rybkou", lines: ["Bublub!", "Plav se mnou!", "Mám hlad, máš krmení?"] },
      krab: { label: "Promluvit s krabem", lines: ["Klap klap!", "Bokem se jde nejlíp.", "Pozor na mé kleště!"] },
    },
  },
  en: {
    title: "Underwater city",
    subtitle: "A pearly city on the seabed: mermaids, divers and mages sell sea goods for your learning points.",
    stalls: {
      avatary: { name: "Shell dressing room", npc: "Mermaid Pearl", hello: ["Fins or a diving suit? Your pick!", "Shells suit you, trust me."] },
      tituly: { name: "Pearl office", npc: "Captain Deep", hello: ["I'll write your title in the deep-sea logbook.", "Bubbles, bubbles… done!"] },
      ramecky: { name: "Coral workshop", npc: "Pearl smith Perlie", hello: ["A frame of coral and pearls, one of a kind!", "Pearl to pearl, a perfect match."] },
      pozadi: { name: "Jellyfish gallery", npc: "Mage Mussel", hello: ["I'll conjure a background from sea lights.", "The jellyfish love to light you up."] },
      mazlicci: { name: "Aquarium", npc: "Dolphina", hello: ["I have sea trinkets for your pet.", "Fish are my best friends."] },
      lod: { name: "Submarine", npc: "Submarine", hello: ["Buildings for your city are made in the submarine dock."] },
    },
    fireLabel: "Release a bubble",
    boom: "BLUB!",
    talk: {
      ryba: { label: "Talk to the fish", lines: ["Blubble!", "Swim with me!", "I'm hungry, got any food?"] },
      krab: { label: "Talk to the crab", lines: ["Click clack!", "Sideways is the best way.", "Mind my claws!"] },
    },
  },
  de: {
    title: "Unterwasserstadt",
    subtitle: "Eine perlmuttfarbene Stadt auf dem Meeresgrund: Meerjungfrauen, Taucher und Magier verkaufen dir Meereswaren für deine Lernpunkte.",
    stalls: {
      avatary: { name: "Muschel-Umkleide", npc: "Meerjungfrau Perle", hello: ["Flossen oder Taucheranzug? Such dir was aus!", "Muscheln stehen dir, glaub mir."] },
      tituly: { name: "Perlenbüro", npc: "Kapitän Tiefe", hello: ["Ich trage deinen Titel ins Tiefsee-Logbuch ein.", "Blubb, blubb… fertig!"] },
      ramecky: { name: "Korallenwerkstatt", npc: "Perlmeister Perli", hello: ["Ein Rahmen aus Koralle und Perlen, ein Unikat!", "Perle zu Perle, passt perfekt."] },
      pozadi: { name: "Quallen-Galerie", npc: "Magier Muschel", hello: ["Ich zaubere dir einen Hintergrund aus Meereslichtern.", "Die Quallen leuchten dich gern an."] },
      mazlicci: { name: "Aquarium", npc: "Delfina", hello: ["Für dein Haustier habe ich Meeresschmuck.", "Fische sind meine besten Freunde."] },
      lod: { name: "U-Boot", npc: "U-Boot", hello: ["Gebäude für deine Stadt entstehen im U-Boot-Dock."] },
    },
    fireLabel: "Blase aufsteigen lassen",
    boom: "BLUBB!",
    talk: {
      ryba: { label: "Mit dem Fisch reden", lines: ["Blubber!", "Schwimm mit mir!", "Ich habe Hunger, hast du Futter?"] },
      krab: { label: "Mit der Krabbe reden", lines: ["Klack klack!", "Seitwärts geht es am besten.", "Vorsicht, meine Scheren!"] },
    },
  },
  ru: {
    title: "Подводный город",
    subtitle: "Жемчужный город на морском дне: русалки, водолазы и маги продают морские товары за баллы.",
    stalls: {
      avatary: { name: "Раковинная раздевалка", npc: "Русалка Жемчужинка", hello: ["Плавники или скафандр? Выбирай!", "Ракушки тебе к лицу, поверь."] },
      tituly: { name: "Жемчужная канцелярия", npc: "Капитан Глубина", hello: ["Запишу звание в судовой журнал глубин.", "Пузырьки, пузырьки… готово!"] },
      ramecky: { name: "Коралловая мастерская", npc: "Жемчужник Перлик", hello: ["Рамка из кораллов и жемчуга, единственная!", "Жемчужинка к жемчужинке — идеально."] },
      pozadi: { name: "Галерея медуз", npc: "Маг Ракушка", hello: ["Наколдую фон из морских огней.", "Медузы с радостью тебя осветят."] },
      mazlicci: { name: "Аквариум", npc: "Дельфинка", hello: ["Для питомца у меня морские украшения.", "Рыбки — мои лучшие подружки."] },
      lod: { name: "Подлодка", npc: "Подлодка", hello: ["Постройки для твоего города делают в доке подлодок."] },
    },
    fireLabel: "Выпустить пузырь",
    boom: "БУЛЬК!",
    talk: {
      ryba: { label: "Поговорить с рыбкой", lines: ["Бульк-бульк!", "Плыви со мной!", "Я голодна, есть корм?"] },
      krab: { label: "Поговорить с крабом", lines: ["Клац-клац!", "Боком ходить лучше всего.", "Осторожно, мои клешни!"] },
    },
  },
}),
  uk: {
    title: "Підводне місто",
    subtitle: "Перлинне місто на морському дні: русалки, водолази й маги продають морські товари за бали з навчання.",
    stalls: {
      avatary: { name: "Раковинна роздягальня", npc: "Русалка Перлинка", hello: ["Ласти чи скафандр? Вибирай!", "Раковини тобі личать, повір мені."] },
      tituly: { name: "Перлова канцелярія", npc: "Капітан Глибина", hello: ["Запишу твоє звання в корабельний журнал глибин.", "Бульк-бульк… готово!"] },
      ramecky: { name: "Коралова майстерня", npc: "Перляр Перлик", hello: ["Рамка з коралів і перлин, неповторна!", "Перлина до перлини — ідеально пасують."] },
      pozadi: { name: "Галерея медуз", npc: "Маг Мушля", hello: ["Зачарую для тебе фон із морських вогнів.", "Медузи з радістю тебе освітлять."] },
      mazlicci: { name: "Акваріум", npc: "Дельфінка", hello: ["Для твого улюбленця маю морські прикраси.", "Рибки — мої найкращі подружки."] },
      lod: { name: "Підводний човен", npc: "Підводний човен", hello: ["Будівлі для твого міста виготовляють у доці підводних човнів."] },
    },
    fireLabel: "Випустити бульбашку",
    boom: "БУЛЬК!",
    talk: {
      ryba: { label: "Поговорити з рибкою", lines: ["Бульбуль!", "Плинь зі мною!", "Я голодна, є корм?"] },
      krab: { label: "Поговорити з крабом", lines: ["Клац-клац!", "Боком ходити найкраще.", "Обережно, мої клешні!"] },
    },
  },
  ja: {
    title: "海底の街",
    subtitle: "海底にある真珠色の街です。人魚、ダイバー、魔法使いたちが、学習ポイントで海のグッズを売っています。",
    stalls: {
      avatary: { name: "貝殻の着替え室", npc: "人魚のパール", hello: ["ひれにする？それとも潜水服？好きなほうを選んでね！", "貝殻、似合うと思うよ。ほんとだって。"] },
      tituly: { name: "真珠の事務所", npc: "キャプテン・ディープ", hello: ["称号を深海の航海日誌に書いておきますね。", "ブクブク、ブクブク… 完了！"] },
      ramecky: { name: "サンゴ工房", npc: "真珠職人のパーリー", hello: ["サンゴと真珠でできた、世界に一つのフレームです！", "真珠は真珠と並ぶと、ぴったりですね。"] },
      pozadi: { name: "クラゲのギャラリー", npc: "魔法使いのマッスル", hello: ["海の光で背景を作り出しますよ。", "クラゲたちがよろこんであなたを照らしてくれますよ。"] },
      mazlicci: { name: "水族館", npc: "イルカのドルフィナ", hello: ["ペットのための海の飾りがありますよ。", "お魚はわたしの一番の友だちなの。"] },
      lod: { name: "潜水艦", npc: "潜水艦", hello: ["街に置く建物は、潜水艦のドックで作られています。"] },
    },
    fireLabel: "泡を放つ",
    boom: "ブクッ！",
    talk: {
      ryba: { label: "お魚に話しかける", lines: ["ブクブク！", "一緒に泳ごうよ！", "おなかがすいたの。えさはある？"] },
      krab: { label: "カニに話しかける", lines: ["カチャカチャ！", "横歩きがいちばんなんだ。", "はさみに気をつけてね！"] },
    },
  },
  es: {
    title: "Ciudad submarina",
    subtitle: "Una ciudad nacarada en el fondo del mar: sirenas, buzos y magos te venden artículos marinos por tus puntos de aprendizaje.",
    stalls: {
      avatary: { name: "Vestuario de conchas", npc: "Sirena Perla", hello: ["¿Aletas o traje de buceo? ¡Tú eliges!", "Las conchas te quedan bien, confía en mí."] },
      tituly: { name: "Oficina de perlas", npc: "Capitán Profundo", hello: ["Escribiré tu título en el diario de las profundidades.", "¡Burbujas, burbujas… listo!"] },
      ramecky: { name: "Taller de coral", npc: "Perlero Perlito", hello: ["¡Un marco de coral y perlas, único!", "Perla con perla, combinan a la perfección."] },
      pozadi: { name: "Galería de medusas", npc: "Mago Concha", hello: ["Conjuraré un fondo con luces del mar.", "Las medusas estarán encantadas de iluminarte."] },
      mazlicci: { name: "Acuario", npc: "Delfina", hello: ["Para tu mascota tengo adornos del mar.", "Los peces son mis mejores amigos."] },
      lod: { name: "Submarino", npc: "Submarino", hello: ["Los edificios para tu ciudad se construyen en el muelle del submarino."] },
    },
    fireLabel: "Soltar una burbuja",
    boom: "¡BLUB!",
    talk: {
      ryba: { label: "Hablar con el pez", lines: ["¡Blubblub!", "¡Nada conmigo!", "Tengo hambre, ¿tienes comida?"] },
      krab: { label: "Hablar con el cangrejo", lines: ["¡Clic clac!", "Lo mejor es andar de lado.", "¡Cuidado con mis pinzas!"] },
    },
  },
  fr: {
    title: "Ville sous-marine",
    subtitle: "Une cité nacrée au fond de la mer : sirènes, plongeurs et mages te vendent des articles marins contre tes points d'apprentissage.",
    stalls: {
      avatary: { name: "Vestiaire aux coquillages", npc: "Sirène Perle", hello: ["Des palmes ou une combinaison ? À toi de choisir !", "Les coquillages te vont bien, crois-moi."] },
      tituly: { name: "Bureau des perles", npc: "Capitaine Abysse", hello: ["J'inscris ton titre dans le journal des abysses.", "Bulles, bulles… c'est fait !"] },
      ramecky: { name: "Atelier de corail", npc: "Perlier Perlin", hello: ["Un cadre en corail et en perles, unique au monde !", "Perle à perle, ça va à merveille."] },
      pozadi: { name: "Galerie des méduses", npc: "Mage Coquille", hello: ["Je vais faire surgir un fond fait de lumières marines.", "Les méduses adorent t'illuminer."] },
      mazlicci: { name: "Aquarium", npc: "Dauphine", hello: ["J'ai des breloques marines pour ton animal.", "Les poissons sont mes meilleurs amis."] },
      lod: { name: "Sous-marin", npc: "Sous-marin", hello: ["Les bâtiments pour ta ville se construisent dans le dock du sous-marin."] },
    },
    fireLabel: "Lâcher une bulle",
    boom: "BLOUP !",
    talk: {
      ryba: { label: "Parler au poisson", lines: ["Blub blub !", "Nage avec moi !", "J'ai faim, tu as à manger ?"] },
      krab: { label: "Parler au crabe", lines: ["Clac clac !", "Marcher de côté, c'est le mieux.", "Attention à mes pinces !"] },
    },
  },
};

const unlock: Record<Locale, UnlockText> = {
  ...withFallbacks({
  cs: { title: "Odemknout svět", text: "Svět „{name}“ se odemkne na úrovni {level} a stojí {points} bodů.", button: "Odemknout za {points} ⭐", needLevel: "Chybí ti úroveň {level}", needPoints: "Chybí ti {n} bodů", done: "Svět je odemčený!", locked: "Zamčeno" },
  en: { title: "Unlock world", text: "The world “{name}” unlocks at level {level} and costs {points} points.", button: "Unlock for {points} ⭐", needLevel: "You need level {level}", needPoints: "You need {n} more points", done: "World unlocked!", locked: "Locked" },
  de: { title: "Welt freischalten", text: "Die Welt „{name}“ wird ab Level {level} freigeschaltet und kostet {points} Punkte.", button: "Für {points} ⭐ freischalten", needLevel: "Dir fehlt Level {level}", needPoints: "Dir fehlen {n} Punkte", done: "Welt freigeschaltet!", locked: "Gesperrt" },
  ru: { title: "Открыть мир", text: "Мир «{name}» откроется на уровне {level} и стоит {points} баллов.", button: "Открыть за {points} ⭐", needLevel: "Нужен уровень {level}", needPoints: "Не хватает {n} баллов", done: "Мир открыт!", locked: "Закрыто" },
}),
  uk: { title: "Відкрити світ", text: "Світ «{name}» відкривається на рівні {level} і коштує {points} балів.", button: "Відкрити за {points} ⭐", needLevel: "Бракує рівня {level}", needPoints: "Бракує {n} балів", done: "Світ відкрито!", locked: "Заблоковано" },
  ja: { title: "ワールドを解放", text: "ワールド「{name}」はレベル{level}で解放され、{points}ポイントかかります。", button: "{points} ⭐で解放", needLevel: "レベル{level}が必要です", needPoints: "あと{n}ポイント必要です", done: "ワールドを解放しました！", locked: "ロック中" },
  es: { title: "Desbloquear mundo", text: "El mundo «{name}» se desbloquea en el nivel {level} y cuesta {points} puntos.", button: "Desbloquear por {points} ⭐", needLevel: "Te falta el nivel {level}", needPoints: "Te faltan {n} puntos", done: "¡Mundo desbloqueado!", locked: "Bloqueado" },
  fr: { title: "Débloquer le monde", text: "Le monde « {name} » se débloque au niveau {level} et coûte {points} points.", button: "Débloquer pour {points} ⭐", needLevel: "Il te faut le niveau {level}", needPoints: "Il te manque {n} points", done: "Monde débloqué !", locked: "Verrouillé" },
};

export function getUnlockText(locale: Locale): UnlockText {
  return unlock[locale];
}

export function getWorldText(locale: Locale, world: string): WorldText {
  if (world === "space") return space[locale];
  if (world === "forest") return forest[locale];
  if (world === "castle") return castle[locale];
  if (world === "sea") return sea[locale];
  const m = getMarketText(locale);
  return {
    title: m.title,
    subtitle: m.subtitle,
    stalls: m.stalls,
    fireLabel: m.cannon,
    boom: m.boom,
    talk: { papousek: { label: m.parrotLabel, lines: m.parrot } },
  };
}

export type TownText = { tab: string; title: string; subtitle: string; walking: string; sheet: string; locked: string; talk: Record<string, { label: string; lines: string[] }> };
const town: Record<Locale, TownText> = {
  ...withFallbacks({
  cs: {
    tab: "Městečko",
    title: "Městečko",
    subtitle: "Začni procházkou po městečku. Po schodech dolů je pirátský přístav, na louce stojí raketa na vesmírnou stanici. Klikni na místo, kam chceš jít.",
    walking: "Jdeme…",
    sheet: "Raketa na vesmírnou stanici",
    locked: "zamčeno",
    talk: {
      knihovnice: { label: "Promluvit s knihovnicí", lines: ["Kdo čte, ten roste!", "Nové knížky jsou na polici u okna.", "Pšt! V knihovně se šeptá."] },
      pekar: { label: "Promluvit s pekařem", lines: ["Čerstvé rohlíky, ještě teplé!", "Za učení si zasloužíš koláč.", "Mňam, to voní!"] },
      kluk: { label: "Promluvit s klukem", lines: ["Hele, v přístavu je pravá loď!", "Až budu velký, poletím na stanici!", "Honem, ať nepromeškáme zábavu."] },
      kocka: { label: "Pohladit kočku", lines: ["Mňau!", "Prrr…", "Mňau mňau!"] },
    },
  },
  en: {
    tab: "Town",
    title: "Town",
    subtitle: "Start with a walk around town. Down the stairs is the pirate harbour, and on the meadow stands the rocket to the space station. Click where you want to go.",
    walking: "On our way…",
    sheet: "Rocket to the space station",
    locked: "locked",
    talk: {
      knihovnice: { label: "Talk to the librarian", lines: ["Who reads, grows!", "New books are on the shelf by the window.", "Shh! We whisper in the library."] },
      pekar: { label: "Talk to the baker", lines: ["Fresh rolls, still warm!", "You deserve a cake for learning.", "Yum, smells great!"] },
      kluk: { label: "Talk to the boy", lines: ["Look, there's a real ship in the harbour!", "When I grow up I'll fly to the station!", "Hurry, we'll miss the fun."] },
      kocka: { label: "Pet the cat", lines: ["Meow!", "Purr…", "Meow meow!"] },
    },
  },
  de: {
    tab: "Städtchen",
    title: "Städtchen",
    subtitle: "Beginne mit einem Spaziergang durchs Städtchen. Die Treppe hinunter liegt der Piratenhafen, auf der Wiese steht die Rakete zur Raumstation. Klicke, wohin du willst.",
    walking: "Wir gehen…",
    sheet: "Rakete zur Raumstation",
    locked: "gesperrt",
    talk: {
      knihovnice: { label: "Mit der Bibliothekarin sprechen", lines: ["Wer liest, wächst!", "Neue Bücher stehen im Regal am Fenster.", "Psst! In der Bibliothek flüstert man."] },
      pekar: { label: "Mit dem Bäcker sprechen", lines: ["Frische Brötchen, noch warm!", "Fürs Lernen verdienst du einen Kuchen.", "Mmm, wie das duftet!"] },
      kluk: { label: "Mit dem Jungen sprechen", lines: ["Schau, im Hafen liegt ein echtes Schiff!", "Wenn ich groß bin, fliege ich zur Station!", "Schnell, sonst verpassen wir den Spaß."] },
      kocka: { label: "Katze streicheln", lines: ["Miau!", "Schnurr…", "Miau miau!"] },
    },
  },
  ru: {
    tab: "Городок",
    title: "Городок",
    subtitle: "Начни с прогулки по городку. По лестнице вниз — пиратская гавань, а на лугу стоит ракета на космическую станцию. Нажми, куда хочешь пойти.",
    walking: "Идём…",
    sheet: "Ракета на космическую станцию",
    locked: "закрыто",
    talk: {
      knihovnice: { label: "Поговорить с библиотекарем", lines: ["Кто читает, тот растёт!", "Новые книги на полке у окна.", "Тсс! В библиотеке говорят шёпотом."] },
      pekar: { label: "Поговорить с пекарем", lines: ["Свежие булочки, ещё тёплые!", "За учёбу ты заслужил пирог.", "Ммм, как пахнет!"] },
      kluk: { label: "Поговорить с мальчиком", lines: ["Смотри, в гавани настоящий корабль!", "Вырасту — полечу на станцию!", "Скорее, а то пропустим веселье."] },
      kocka: { label: "Погладить кошку", lines: ["Мяу!", "Мур…", "Мяу мяу!"] },
    },
  },
}),
  uk: {
    tab: "Містечко",
    title: "Містечко",
    subtitle: "Почни з прогулянки містечком. Сходами вниз — піратська гавань, а на лузі стоїть ракета на космічну станцію. Клацни, куди хочеш піти.",
    walking: "Йдемо…",
    sheet: "Ракета на космічну станцію",
    locked: "заблоковано",
    talk: {
      knihovnice: { label: "Поговорити з бібліотекаркою", lines: ["Хто читає, той росте!", "Нові книжки на полиці біля вікна.", "Тсс! У бібліотеці шепочуться."] },
      pekar: { label: "Поговорити з пекарем", lines: ["Свіжі булочки, ще теплі!", "За навчання ти заслужив пиріг.", "Ммм, як пахне!"] },
      kluk: { label: "Поговорити з хлопчиком", lines: ["Дивись, у гавані справжній корабель!", "Коли виросту, полечу на станцію!", "Швидше, а то пропустимо веселощі."] },
      kocka: { label: "Погладити кішку", lines: ["Мяу!", "Мур…", "Мяу-мяу!"] },
    },
  },
  ja: {
    tab: "町",
    title: "町",
    subtitle: "まずは町を散歩してみましょう。階段を下りると海賊の港があり、草原には宇宙ステーションへのロケットが立っています。行きたい場所をクリックしてください。",
    walking: "移動中…",
    sheet: "宇宙ステーションへのロケット",
    locked: "ロック中",
    talk: {
      knihovnice: { label: "司書さんに話しかける", lines: ["読む人は育つのよ！", "新しい本は窓辺の棚にありますよ。", "しーっ！図書館では小声でね。"] },
      pekar: { label: "パン屋さんに話しかける", lines: ["焼きたてのロールパンですよ！", "勉強をがんばったご褒美に、ケーキはいかが？", "んー、いい匂い！"] },
      kluk: { label: "男の子に話しかける", lines: ["見て、港に本物の船があるよ！", "大きくなったら、ぼくもステーションまで飛んでいくんだ！", "急いで、楽しいことを逃しちゃうよ。"] },
      kocka: { label: "ねこをなでる", lines: ["にゃあ！", "ゴロゴロ…", "にゃーにゃー！"] },
    },
  },
  es: {
    tab: "Pueblo",
    title: "Pueblo",
    subtitle: "Empieza paseando por el pueblo. Bajando las escaleras está el puerto pirata, y en el prado se alza el cohete a la estación espacial. Haz clic donde quieras ir.",
    walking: "En camino…",
    sheet: "Cohete a la estación espacial",
    locked: "bloqueado",
    talk: {
      knihovnice: { label: "Hablar con la bibliotecaria", lines: ["¡Quien lee, crece!", "Los libros nuevos están en la estantería de la ventana.", "¡Chist! En la biblioteca se susurra."] },
      pekar: { label: "Hablar con el panadero", lines: ["¡Panecillos frescos, todavía calientes!", "Por aprender te mereces un pastel.", "¡Mmm, qué bien huele!"] },
      kluk: { label: "Hablar con el niño", lines: ["¡Mira, en el puerto hay un barco de verdad!", "¡Cuando sea mayor, volaré a la estación!", "Date prisa, que nos perdemos la diversión."] },
      kocka: { label: "Acariciar al gato", lines: ["¡Miau!", "Prrr…", "¡Miau miau!"] },
    },
  },
  fr: {
    tab: "Petite ville",
    title: "Petite ville",
    subtitle: "Commence par une balade en ville. En descendant l'escalier, il y a le port pirate, et dans la prairie se dresse la fusée vers la station spatiale. Clique à l'endroit où tu veux aller.",
    walking: "En chemin…",
    sheet: "Fusée vers la station spatiale",
    locked: "verrouillé",
    talk: {
      knihovnice: { label: "Parler à la bibliothécaire", lines: ["Qui lit, grandit !", "Les nouveaux livres sont sur l'étagère près de la fenêtre.", "Chut ! À la bibliothèque, on chuchote."] },
      pekar: { label: "Parler au boulanger", lines: ["Des petits pains frais, encore chauds !", "Pour avoir appris, tu mérites un gâteau.", "Mmm, ça sent si bon !"] },
      kluk: { label: "Parler au garçon", lines: ["Regarde, il y a un vrai bateau dans le port !", "Quand je serai grand, je m'envolerai vers la station !", "Vite, on va rater le spectacle."] },
      kocka: { label: "Caresser le chat", lines: ["Miaou !", "Purr…", "Miaou miaou !"] },
    },
  },
};
export function getTownText(locale: Locale): TownText {
  return town[locale];
}

export function getSkipText(locale: Locale): { skip: string; soundOn: string; soundOff: string } {
  return {
    ...withFallbacks({
    cs: { skip: "Přeskočit", soundOn: "Vypnout zvuky", soundOff: "Zapnout zvuky" },
    en: { skip: "Skip", soundOn: "Mute sounds", soundOff: "Unmute sounds" },
    de: { skip: "Überspringen", soundOn: "Ton ausschalten", soundOff: "Ton einschalten" },
    ru: { skip: "Пропустить", soundOn: "Выключить звук", soundOff: "Включить звук" },
  }),
    uk: { skip: "Пропустити", soundOn: "Вимкнути звуки", soundOff: "Увімкнути звуки" },
    ja: { skip: "スキップ", soundOn: "サウンドをオフ", soundOff: "サウンドをオン" },
    es: { skip: "Saltar", soundOn: "Silenciar sonidos", soundOff: "Activar sonidos" },
    fr: { skip: "Passer", soundOn: "Couper le son", soundOff: "Réactiver le son" },
  }[locale];
}
