// Doplňkové kurzy: slugy kurzů ze souborů prisma/content/*doplnky*.cjs.
// Databáze o doplňkovosti kurzu nic neví, proto je seznam tady. Když přidáš nový
// doplňkový kurz do některého z těchto souborů, doplň jeho slug sem.
const SUPPLEMENTARY_SLUGS = [
  // Angličtina
  "aj-3-school-subjects", "aj-4-months", "aj-4-transport", "aj-5-shops", "aj-5-wild-animals",
  "aj-6-health", "aj-6-nature", "aj-7-feelings", "aj-7-environment", "aj-8-jobs-advanced",
  "aj-9-idioms", "aj-9-phrasal-verbs-2",
  // Čeština
  "cj-p-frazemy", "cj-p-prislovi", "cj-p-zkratky-znacky", "cj-p-cizi-slova",
  // Dějepis
  "dej-p-letopocty-cesko", "dej-p-letopocty-svet", "dej-p-osobnosti-cesko", "dej-p-osobnosti-svet",
  "dej-p-pojmy", "dej-p-starovek", "dej-p-stredovek-pojmy",
  // Literatura
  "lit-p-literarni-pojmy", "lit-p-hrdinove-a-autori",
  // Matematika (1. stupeň až 9. třída)
  "mat-1-scitani-do-10", "mat-1-odcitani-do-10", "mat-1-porovnavani-cisel",
  "mat-2-nasobilka-3-4", "mat-2-scitani-pres-desitku", "mat-2-odcitani-pres-desitku",
  "mat-3-deleni-nasobilkou", "mat-3-nasobeni-jednocifernym", "mat-3-zaokrouhlovani",
  "mat-4-pisemne-scitani-odcitani", "mat-4-nasobeni-deleni-10-100",
  "mat-5-desetinna-scitani-odcitani", "mat-5-nasobeni-deleni-desetinnych-10",
  "mat-6-zaporna-cisla-pocitani", "mat-7-procenta-vypocty",
  "mat-8-pythagorova-veta-vypocty", "mat-8-kruh-vypocty",
  "mat-9-linearni-funkce-vypocty", "mat-9-soustavy-rovnic-vypocty",
  // Němčina
  "nj-4-schulfaecher", "nj-4-freizeit", "nj-5-stadt", "nj-5-berufe", "nj-6-gesundheit", "nj-6-natur",
  // Přírodopis
  "prir-p-trida-zivocichu", "prir-p-plody", "prir-p-organy", "prir-p-vitaminy",
  "prir-p-ekologie-pojmy", "prir-p-horniny",
  // Ruština
  "rj-4-shkolnye-predmety", "rj-4-hobbi", "rj-5-gorod", "rj-5-professii-nah", "rj-6-zdorove", "rj-6-priroda",
  // Zeměpis
  "zem-p-hlavni-mesta-evropy-1", "zem-p-hlavni-mesta-evropy-2", "zem-p-hlavni-mesta-sveta",
  "zem-p-nejvyssi-hory", "zem-p-reky-more", "zem-p-vlajky-a-statni-symboly",
];

const SUPPLEMENTARY = new Set(SUPPLEMENTARY_SLUGS);

export function isSupplementaryCourse(slug: string): boolean {
  return SUPPLEMENTARY.has(slug);
}

// Porovnání bez velkých písmen a bez diakritiky: „Frazémy“ najde „frazemy“.
export function normalizeSearchText(text: string): string {
  return text
    .toLocaleLowerCase("cs")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}
