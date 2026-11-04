import { withFallbacks } from "./config";
import type { Locale } from "./config";

export type GlobeText = {
  hint: string;
  label: string;
  /** Země (nebo místo) spojené s předmětem na globu. */
  places: Record<string, string>;
  openCourses: string;
  continueCourse: string;
  startCourse: string;
  progress: string; // {done} {total}
  noCourses: string;
  review: string; // {n}
  guest: string;
  drag: string;
  zoomIn: string;
  zoomOut: string;
  resetView: string;
};

const cs: GlobeText = {
  hint: "Roztoč globus a klikni na předmět, nebo si ho vyber ze seznamu.",
  label: "Globus předmětů",
  places: {
    cestina: "Česko",
    literatura: "Irsko",
    anglictina: "Velká Británie",
    nemcina: "Německo",
    rustina: "Rusko",
    matematika: "Řecko",
    dejepis: "Itálie",
    zemepis: "Nepál",
    prirodopis: "Brazílie",
    fyzika: "USA",
    chemie: "Čína",
    obcanka: "Indie",
    hudebka: "Austrálie",
    francouzstina: "Francie",
  },
  openCourses: "Všechny kurzy",
  continueCourse: "Pokračovat: {title}",
  startCourse: "Začít: {title}",
  progress: "Hotovo {done} z {total} kurzů",
  noCourses: "Kurzy tu zatím nejsou.",
  review: "{n} k opakování",
  guest: "Po přihlášení uvidíš svůj postup.",
  drag: "Táhni a otáčej, kolečko nebo ± přiblíží",
  zoomIn: "Přiblížit",
  zoomOut: "Oddálit",
  resetView: "Obnovit pohled (dvojklik)",
};

const en: GlobeText = {
  hint: "Spin the globe and click a subject, or pick one from the list.",
  label: "Subject globe",
  places: {
    cestina: "Czechia",
    literatura: "Ireland",
    anglictina: "United Kingdom",
    nemcina: "Germany",
    rustina: "Russia",
    matematika: "Greece",
    dejepis: "Italy",
    zemepis: "Nepal",
    prirodopis: "Brazil",
    fyzika: "USA",
    chemie: "China",
    obcanka: "India",
    hudebka: "Australia",
    francouzstina: "France",
  },
  openCourses: "All courses",
  continueCourse: "Continue: {title}",
  startCourse: "Start: {title}",
  progress: "{done} of {total} courses done",
  noCourses: "No courses here yet.",
  review: "{n} to review",
  guest: "Sign in to see your progress.",
  drag: "Drag to rotate, wheel or ± to zoom",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetView: "Reset view (double click)",
};

const de: GlobeText = {
  hint: "Dreh den Globus und klicke ein Fach an, oder wähle eines aus der Liste.",
  label: "Fächer-Globus",
  places: {
    cestina: "Tschechien",
    literatura: "Irland",
    anglictina: "Vereinigtes Königreich",
    nemcina: "Deutschland",
    rustina: "Russland",
    matematika: "Griechenland",
    dejepis: "Italien",
    zemepis: "Nepal",
    prirodopis: "Brasilien",
    fyzika: "USA",
    chemie: "China",
    obcanka: "Indien",
    hudebka: "Australien",
    francouzstina: "Frankreich",
  },
  openCourses: "Alle Kurse",
  continueCourse: "Weiter: {title}",
  startCourse: "Starten: {title}",
  progress: "{done} von {total} Kursen geschafft",
  noCourses: "Hier gibt es noch keine Kurse.",
  review: "{n} zu wiederholen",
  guest: "Melde dich an, um deinen Fortschritt zu sehen.",
  drag: "Ziehen zum Drehen, Rad oder ± zum Zoomen",
  zoomIn: "Vergrößern",
  zoomOut: "Verkleinern",
  resetView: "Ansicht zurücksetzen (Doppelklick)",
};

const ru: GlobeText = {
  hint: "Покрути глобус и нажми на предмет или выбери его из списка.",
  label: "Глобус предметов",
  places: {
    cestina: "Чехия",
    literatura: "Ирландия",
    anglictina: "Великобритания",
    nemcina: "Германия",
    rustina: "Россия",
    matematika: "Греция",
    dejepis: "Италия",
    zemepis: "Непал",
    prirodopis: "Бразилия",
    fyzika: "США",
    chemie: "Китай",
    obcanka: "Индия",
    hudebka: "Австралия",
    francouzstina: "Франция",
  },
  openCourses: "Все курсы",
  continueCourse: "Продолжить: {title}",
  startCourse: "Начать: {title}",
  progress: "Пройдено курсов: {done} из {total}",
  noCourses: "Курсов пока нет.",
  review: "{n} на повторение",
  guest: "Войди, чтобы видеть свой прогресс.",
  drag: "Тяни, чтобы вращать, колесо или ± — масштаб",
  zoomIn: "Приблизить",
  zoomOut: "Отдалить",
  resetView: "Сбросить вид (двойной щелчок)",
};

const uk: GlobeText = {
  hint: "Крути глобус і клацни на предмет або обери його зі списку.",
  label: "Глобус предметів",
  places: {
    cestina: "Чехія",
    literatura: "Ірландія",
    anglictina: "Велика Британія",
    nemcina: "Німеччина",
    rustina: "Росія",
    matematika: "Греція",
    dejepis: "Італія",
    zemepis: "Непал",
    prirodopis: "Бразилія",
    fyzika: "США",
    chemie: "Китай",
    obcanka: "Індія",
    hudebka: "Австралія",
    francouzstina: "Франція",
  },
  openCourses: "Усі курси",
  continueCourse: "Продовжити: {title}",
  startCourse: "Почати: {title}",
  progress: "Пройдено курсів: {done} з {total}",
  noCourses: "Курсів тут поки немає.",
  review: "{n} для повторення",
  guest: "Увійди, щоб бачити свій прогрес.",
  drag: "Тягни, щоб обертати, колесо або ± для масштабу",
  zoomIn: "Наблизити",
  zoomOut: "Віддалити",
  resetView: "Скинути вигляд (подвійний клік)",
};

const ja: GlobeText = {
  hint: "地球儀を回して教科をクリックするか、リストから選んでください。",
  label: "教科の地球儀",
  places: {
    cestina: "チェコ",
    literatura: "アイルランド",
    anglictina: "イギリス",
    nemcina: "ドイツ",
    rustina: "ロシア",
    matematika: "ギリシャ",
    dejepis: "イタリア",
    zemepis: "ネパール",
    prirodopis: "ブラジル",
    fyzika: "アメリカ",
    chemie: "中国",
    obcanka: "インド",
    hudebka: "オーストラリア",
    francouzstina: "フランス",
  },
  openCourses: "すべてのコース",
  continueCourse: "続きから: {title}",
  startCourse: "はじめる: {title}",
  progress: "{total} コース中 {done} コースが完了",
  noCourses: "ここにはまだコースがありません。",
  review: "復習が {n} 件",
  guest: "ログインすると、学習の進み具合が見られます。",
  drag: "ドラッグで回転、ホイールか ± でズーム",
  zoomIn: "拡大",
  zoomOut: "縮小",
  resetView: "表示をリセット（ダブルクリック）",
};

const es: GlobeText = {
  hint: "Gira el globo y haz clic en una asignatura, o elige una de la lista.",
  label: "Globo de asignaturas",
  places: {
    cestina: "República Checa",
    literatura: "Irlanda",
    anglictina: "Reino Unido",
    nemcina: "Alemania",
    rustina: "Rusia",
    matematika: "Grecia",
    dejepis: "Italia",
    zemepis: "Nepal",
    prirodopis: "Brasil",
    fyzika: "EE. UU.",
    chemie: "China",
    obcanka: "India",
    hudebka: "Australia",
    francouzstina: "Francia",
  },
  openCourses: "Todos los cursos",
  continueCourse: "Continuar: {title}",
  startCourse: "Empezar: {title}",
  progress: "{done} de {total} cursos completados",
  noCourses: "Todavía no hay cursos aquí.",
  review: "{n} para repasar",
  guest: "Inicia sesión para ver tu progreso.",
  drag: "Arrastra para girar, rueda o ± para hacer zoom",
  zoomIn: "Acercar",
  zoomOut: "Alejar",
  resetView: "Restablecer vista (doble clic)",
};

const fr: GlobeText = {
  hint: "Fais tourner le globe et clique sur une matière, ou choisis-en une dans la liste.",
  label: "Globe des matières",
  places: {
    cestina: "Tchéquie",
    literatura: "Irlande",
    anglictina: "Royaume-Uni",
    nemcina: "Allemagne",
    rustina: "Russie",
    matematika: "Grèce",
    dejepis: "Italie",
    zemepis: "Népal",
    prirodopis: "Brésil",
    fyzika: "États-Unis",
    chemie: "Chine",
    obcanka: "Inde",
    hudebka: "Australie",
    francouzstina: "France",
  },
  openCourses: "Tous les cours",
  continueCourse: "Continuer : {title}",
  startCourse: "Commencer : {title}",
  progress: "{done} cours sur {total} terminés",
  noCourses: "Pas encore de cours ici.",
  review: "{n} à revoir",
  guest: "Connecte-toi pour voir ta progression.",
  drag: "Fais glisser pour tourner, molette ou ± pour zoomer",
  zoomIn: "Zoomer",
  zoomOut: "Dézoomer",
  resetView: "Réinitialiser la vue (double-clic)",
};

const texts: Record<Locale, GlobeText> = { ...withFallbacks({ cs, en, de, ru }), uk, ja, es, fr };

export function getGlobeText(locale: Locale): GlobeText {
  return texts[locale];
}
