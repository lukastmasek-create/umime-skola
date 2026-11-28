// Parametry jsou záměrně konkrétní příklady, nikoli náhodné otázky při importu.
const extra = [];
const add = (difficulty, prompt, answer, wrong, explanation) => extra.push([difficulty, prompt, String(answer), wrong.map(String), explanation]);
for (const [base, percent] of [[200,5],[350,10],[640,25],[900,40]]) {
  const value = base * percent / 100;
  add(1, `Kolik je ${percent} % z ${base} Kč?`, `${value} Kč`, [`${base-percent} Kč`,`${percent} Kč`,`${base+value} Kč`], `${percent} % z ${base} Kč je ${base} · ${percent}/100 = ${value} Kč.`);
}
for (const [price, percent] of [[240,25],[750,20],[1200,15],[360,50]]) {
  const saving = price * percent / 100;
  add(2, `Jaká je sleva ${percent} % z ceny ${price} Kč?`, `${saving} Kč`, [`${price} Kč`,`${percent} Kč`,`${price+saving} Kč`], `Sleva je ${price} · ${percent}/100 = ${saving} Kč.`);
}
for (const [price, percent] of [[800,10],[320,25],[1500,20],[480,50]]) {
  const result = price * (100-percent)/100;
  add(3, `Jaká je konečná cena po slevě ${percent} % z ${price} Kč?`, `${result} Kč`, [`${price+percent} Kč`,`${price} Kč`,`${price+price*percent/100} Kč`], `Po slevě zaplatíme ${100-percent} % z ${price} Kč, tedy ${result} Kč.`);
}
for (const [price, percent] of [[400,10],[600,25],[1200,5],[800,15]]) {
  const result = price * (100+percent)/100;
  add(4, `Kolik stojí výrobek původně za ${price} Kč po zdražení o ${percent} %?`, `${result} Kč`, [`${price} Kč`,`${price*percent/100} Kč`,`${price-price*percent/100} Kč`], `Po zdražení zaplatíme ${100+percent} % z ${price} Kč, tedy ${result} Kč.`);
}
for (const [before,after] of [[200,250],[400,300],[500,600],[800,1000]]) {
  const change = Math.abs(after-before)/before*100;
  const direction = after>before?'zdražení':'zlevnění';
  const distractors = [change/2,change*2,Math.abs(after-before)/after*100].map(x => `${Number(x.toFixed(2)).toString().replace('.',',')} %`);
  add(5, `O kolik procent jde o ${direction}, jestliže se cena změní z ${before} Kč na ${after} Kč?`, `${change} %`, distractors, `Rozdíl ${Math.abs(after-before)} Kč dělíme původní cenou ${before} Kč: ${change} %.`);
}
module.exports = {extra:{'mat-procenta-v-praxi':extra}};
