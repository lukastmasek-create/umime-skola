// Doplňující otázky (matematika – přijímačky 2) – cíl: 30 otázek na kurz.
module.exports = {
  extra: {
    "mat-p-zaporna-cisla": [
      [1,"Kolik je 5 − 8?","−3",["3","−13","13"],"5 − 8 = −3."],
      [1,"Kolik je −6 + 2?","−4",["4","−8","8"],"−4."],
      [2,"Kolik je (−2) · 7?","−14",["14","−9","9"],"Mínus krát plus = mínus."],
      [2,"Kolik je −20 : 4?","−5",["5","−16","16"],"−5."],
      [3,"Kolik je |−9|?","9",["−9","0","−1"],"Absolutní hodnota."],
      [3,"Které číslo je menší: −7, −3?","−7",["−3","nelze určit","stejné"],"−7 < −3."],
      [4,"Kolik je −3 · (−4) · (−1)?","−12",["12","−7","7"],"Tři záporná → výsledek záporný."],
      [4,"Kolik je −15 + 9 − 4?","−10",["10","−20","−8"],"−15 + 9 = −6, −6 − 4 = −10."],
      [5,"Kolik je (−1)⁵?","−1",["1","5","−5"],"Lichá mocnina záporného čísla je záporná."]
    ],
    "mat-p-mocniny": [
      [1,"Kolik je 4²?","16",["8","6","12"],"4·4 = 16."],
      [3,"Kolik je 5⁰?","1",["0","5","nelze určit"],"Každé nenulové číslo na nultou je 1."],
      [3,"Kolik je 3⁻¹?","1/3",["3","−3","−1/3"],"3⁻¹ = 1/3."],
      [4,"Kolik je √(0,25)?","0,5",["0,05","0,25","2,5"],"0,5² = 0,25."],
      [4,"Kolik je 2³ · 2²?","32",["16","8","64"],"2⁵ = 32."],
      [5,"Kolik je (2²)³?","64",["32","8","16"],"2⁶ = 64."],
      [5,"Kolik je ∛27?","3",["9","27","2"],"3³ = 27."]
    ],
    "mat-p-vyrazy": [
      [1,"Zjednoduš: 4a − a","3a",["5a","4","3"],"4a − a = 3a."],
      [1,"Hodnota výrazu 3x − 2 pro x = 4 je:","10",["14","12","8"],"3·4 − 2 = 10."],
      [2,"Zjednoduš: 2(x + 3) − x","x + 6",["x + 3","3x + 6","2x + 3"],"2x + 6 − x = x + 6."],
      [2,"Roznásob: (a + 2)(a − 2)","a² − 4",["a² + 4","a² − 2","a² + 2a − 4"],"Rozdíl čtverců."],
      [3,"Řeš: 3x + 4 = 19","x = 5",["x = 6","x = 7","x = 4"],"3x = 15, x = 5."],
      [3,"Řeš: x/2 = 7","x = 14",["x = 3,5","x = 9","x = 7/2"],"x = 2·7."],
      [4,"Zjednoduš: (x + 1)² − x²","2x + 1",["2x² + 1","x + 1","1"],"x² + 2x + 1 − x²."],
      [4,"Rozlož: x² + 5x","x(x + 5)",["x(x − 5)","(x + 5)²","x² (5 + x)"],"Vytknutí x."],
      [5,"Rozlož: x² − 4x + 4","(x − 2)²",["(x + 2)²","(x − 4)²","(x − 2)(x + 2)"],"Druhá mocnina rozdílu."]
    ],
    "mat-p-kombinatorika": [
      [1,"Kolik způsobů lze uspořádat 4 různé knihy na polici?","24",["4","12","16"],"4! = 24."],
      [1,"Kolik je možností výběru 1 ze 6 osob?","6",["1","12","36"],"6."],
      [2,"Kolik je kombinací 2 ze 4 (pořadí nerozhoduje)?","6",["8","12","4"],"C(4,2) = 6."],
      [2,"Kolik různých dvojciferných čísel lze sestavit z číslic 1, 2, 3 bez opakování?","6",["9","3","12"],"3·2 = 6."],
      [3,"Kolik různých trojic lze vytvořit z 5 osob (pořadí nerozhoduje)?","10",["15","20","60"],"C(5,3) = 10."],
      [3,"Kolik různých pořadí má 3 různé barvy?","6",["3","9","12"],"3! = 6."],
      [4,"Kolik různých SPZ z 2 písmen a 2 číslic (bez opakování písmen) lze vytvořit z 4 písmen a 4 číslic?","144",["36","24","72"],"4·3·4·3 = 144."],
      [5,"Kolik různých slov (bez ohledu na smysl) lze z písmen 'AB' vytvořit?","2",["1","4","3"],"AB, BA."]
    ],
    "mat-p-desetinna-cisla": [
      [1,"Kolik je 1,5 + 2,3?","3,8",["3,5","4,8","2,8"],"3,8."],
      [1,"Kolik je 5,0 − 1,2?","3,8",["4,2","3,2","3,9"],"3,8."],
      [2,"Kolik je 0,3 · 4?","1,2",["1,4","0,12","12"],"1,2."],
      [2,"Kolik je 6 : 0,5?","12",["3","1,2","30"],"12."],
      [3,"Zaokrouhli 7,849 na desetiny.","7,8",["7,9","8,0","7,85"],"0,049 → 7,8."],
      [3,"Převeď 0,75 na zlomek.","3/4",["7/5","75/10","3/5"],"3/4."],
      [4,"Kolik je 2,5 · 0,4?","1",["0,1","10","0,01"],"1."],
      [4,"Kolik je 0,2 : 0,04?","5",["0,5","50","0,05"],"5."],
      [5,"Kolik je 1,3 · 1,3?","1,69",["1,6","2,6","1,33"],"1,69."]
    ],
    "mat-p-kruh-valec": [
      [1,"Co je poloměr?","vzdálenost od středu ke kružnici",["průměr","tětiva","tečna"],"Poloměr r."],
      [1,"Průměr kružnice je:","dvojnásobek poloměru",["poloměr","polovina poloměru","čtyřnásobek"],"d = 2r."],
      [2,"Obvod kruhu s poloměrem 3 cm (π ≈ 3,14) je:","18,84 cm",["9,42 cm","28,26 cm","3,14 cm"],"2π · 3."],
      [2,"Obsah kruhu s průměrem 10 cm (π ≈ 3,14) je:","78,5 cm²",["31,4 cm²","157 cm²","314 cm²"],"π · 5²."],
      [3,"Objem válce s r = 2 cm a v = 5 cm (π ≈ 3,14) je:","62,8 cm³",["31,4 cm³","125,6 cm³","10 cm³"],"π · 4 · 5."],
      [3,"Plášť válce s r = 1 m a v = 3 m (π ≈ 3,14) je:","18,84 m²",["9,42 m²","6,28 m²","3,14 m²"],"2πr·v = 2·3,14·3."],
      [4,"Co je tětiva kružnice?","úsečka spojující dva body kružnice",["přímka procházející středem","tečna","oblouk"],"Tětiva."],
      [4,"Co je tečna kružnice?","přímka, která kružnici dotýká v jednom bodě",["přímka procházející středem","tětiva","průměr"],"Tečna."],
      [5,"Povrch koule o poloměru 1 (π ≈ 3,14) je:","12,56",["6,28","3,14","4,19"],"4πr²."]
    ]
  }
};
