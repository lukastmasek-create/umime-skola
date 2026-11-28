const extra = [];
const add = (difficulty, expression, right, solution, wrong, explanation) => extra.push([difficulty, `Jaká je hodnota x v rovnici ${expression} = ${right}?`, String(solution), wrong.map(String), explanation]);
for (const [x,a] of [[4,9],[7,6],[12,5],[16,8]]) {
  add(1,`x + ${a}`,x+a,x,[x+a,a,x+2*a],`Od obou stran odečteme ${a}; vyjde x = ${x}.`);
}
for (const [x,a] of [[11,3],[14,6],[18,5],[22,9]]) {
  add(2,`x - ${a}`,x-a,x,[x-a,a,x+a],`K oběma stranám přičteme ${a}; vyjde x = ${x}.`);
}
for (const [x,a] of [[6,4],[8,3],[9,5],[12,6]]) {
  add(3,`${a}x`,x*a,x,[x*a,a,x+a],`Obě strany vydělíme číslem ${a}; vyjde x = ${x}.`);
}
for (const [x,a,b] of [[3,4,5],[5,3,7],[7,2,9],[4,6,11]]) {
  add(4,`${a}x + ${b}`,a*x+b,x,[a*x+b,x+b,x+1],`Odečteme ${b} a vydělíme ${a}; vyjde x = ${x}.`);
}
for (const [x,a,b] of [[6,3,4],[8,5,7],[10,2,3],[12,4,9]]) {
  add(5,`${a}(x - ${b})`,a*(x-b),x,[x-b,x+b,x+1],`Obě strany vydělíme ${a} a poté přičteme ${b}; x = ${x}.`);
}
module.exports = {extra:{'mat-rovnice':extra}};
