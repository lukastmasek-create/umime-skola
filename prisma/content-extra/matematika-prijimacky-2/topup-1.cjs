// Doplňující otázky (matematika – přijímačky 2) – aby každý kurz měl dost otázek pro losování ve hrách.
module.exports = {
  extra: {
    "mat-p-zaporna-cisla": [
      [1,"Kolik je −3 + 7?","4",["−4","10","−10"],"−3 + 7 = 4."],
      [1,"Kolik je −5 − 2?","−7",["−3","7","3"],"−5 − 2 = −7."],
      [2,"Kolik je (−4) · (−3)?","12",["−12","7","−7"],"Mínus krát mínus je plus."],
      [2,"Kolik je 12 : (−4)?","−3",["3","−8","8"],"Mínus, protože dělíme kladné záporným."],
      [3,"Kolik je −2 · 5 + 8?","−2",["18","2","−18"],"−10 + 8 = −2."],
      [3,"Které číslo je největší?","2",["−1","−5","0"],"Kladné je větší než záporné."]
    ],
    "mat-p-mocniny": [
      [2,"Kolik je 10⁻²?","0,01",["0,1","100","−100"],"10⁻² = 1/100."],
      [3,"Kolik je √(2⁶)?","8",["6","4","12"],"√64 = 8."],
      [3,"Kolik je 5² · 5³?","3125",["625","125","25"],"5⁵ = 3125."]
    ],
    "mat-p-vyrazy": [
      [1,"Zjednoduš: 2x + 3x","5x",["6x","5x²","x"],"Sečteme koeficienty."],
      [1,"Hodnota výrazu 2x + 1 pro x = 3 je:","7",["6","5","8"],"2·3 + 1 = 7."],
      [2,"Vyjádři (a + b)² bez závorek.","a² + 2ab + b²",["a² + b²","a² − b²","2a + 2b"],"Vzorec pro druhou mocninu součtu."],
      [2,"Zjednoduš: 3(x − 2) + 4","3x − 2",["3x + 2","3x + 4","x − 2"],"3x − 6 + 4 = 3x − 2."],
      [3,"Rozlož na součin: x² − 9","(x − 3)(x + 3)",["(x − 9)(x + 1)","(x − 3)²","(x + 3)²"],"Rozdíl čtverců."],
      [3,"Řeš rovnici 2x − 5 = 7","x = 6",["x = 1","x = 12","x = −1"],"2x = 12, x = 6."]
    ],
    "mat-p-kombinatorika": [
      [1,"Kolik je dvojic z čísel 1, 2, 3, pokud pořadí nezáleží?","3",["6","2","9"],"12, 13, 23."],
      [1,"Kolik je všech pořadí tří různých předmětů?","6",["3","9","12"],"3! = 6."],
      [2,"Kolik různých dvojic (pořadí rozhodující) lze vytvořit z 4 osob?","12",["6","8","16"],"4 · 3 = 12."],
      [2,"Kolik různých pětimístných čísel lze vytvořit z 5 různých číslic?","120",["25","5","60"],"5! = 120."],
      [3,"Kolika způsoby lze vybrat 2 osoby z 5, pořadí nerozhoduje?","10",["20","5","25"],"C(5,2) = 10."],
      [3,"Kolik trojic lze vybrat z 4 osob (pořadí nerozhoduje)?","4",["6","12","24"],"C(4,3) = 4."]
    ],
    "mat-p-desetinna-cisla": [
      [1,"Kolik je 0,5 + 0,25?","0,75",["0,30","0,55","0,8"],"0,50 + 0,25 = 0,75."],
      [1,"Kolik je 2,4 · 10?","24",["2,40","0,24","240"],"Posunem desetinnou čárku."],
      [2,"Kolik je 7,2 : 0,4?","18",["1,8","0,18","28"],"72 : 4 = 18."],
      [2,"Zaokrouhli 3,46 na desetiny.","3,5",["3,4","3,0","4,0"],"Setiny 6 ≥ 5, takže 3,4|6 → 3,5."],
      [3,"Převeď 3/8 na desetinné číslo.","0,375",["0,38","0,83","3,8"],"3 : 8 = 0,375."],
      [3,"Kolik je 1,2² ?","1,44",["2,4","1,2","0,144"],"1,2 · 1,2 = 1,44."]
    ],
    "mat-p-kruh-valec": [
      [1,"Vzorec pro obvod kruhu je:","o = 2πr",["o = πr²","o = 4r","o = r²"],"Obvod = 2πr."],
      [1,"Vzorec pro obsah kruhu je:","S = πr²",["S = 2πr","S = 4r²","S = r²/2"],"Obsah = πr²."],
      [2,"Kolik je obsah kruhu s poloměrem 2 cm (π ≈ 3,14)?","12,56 cm²",["6,28 cm²","4 cm²","3,14 cm²"],"π · 4 = 12,56."],
      [2,"Objem válce s r = 1 m a v = 2 m (π ≈ 3,14) je:","6,28 m³",["3,14 m³","12,56 m³","2 m³"],"V = πr²v = 3,14 · 2 = 6,28."],
      [3,"Povrch válce s r = 1 a v = 1 (π ≈ 3,14) je:","12,56",["6,28","3,14","9,42"],"S = 2πr² + 2πrv = 2π + 2π = 4π ≈ 12,56."],
      [3,"Co je kružnice?","množina bodů stejně vzdálených od středu",["útvar se třemi rohy","přímka","mnohoúhelník se 4 stranami"],"Kružnice je množina bodů se stejnou vzdáleností od středu."]
    ]
  }
};
