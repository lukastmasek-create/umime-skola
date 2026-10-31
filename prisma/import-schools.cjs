// Naplní tabulku School skutečnými školami, aby je žáci v Nastavení jen vybrali.
//
//   node prisma/import-schools.cjs skoly.csv                 # CSV: název;obec (hlavička se přeskočí)
//   node prisma/import-schools.cjs vrejcelk.xml              # XML z Rejstříku škol MŠMT (open data)
//   node prisma/import-schools.cjs data.xml --name-tag=SkolaPlnyNazev --city-tag=MistoAdresa3
//
// Z XML se berou dvojice tagů pro název a obec v rámci jednoho záznamu (výchozí tagy lze přepsat parametry,
// pokud MŠMT strukturu změní). Duplicity (stejný název a obec) se přeskočí, existující školy zůstanou.
const fs = require("node:fs");
const { PrismaClient } = require("@prisma/client");

// DATABASE_URL z prostředí, případně z .env v kořeni projektu
if (!process.env.DATABASE_URL && fs.existsSync(".env")) {
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const opt = (k, d) => (args.find((a) => a.startsWith(`--${k}=`)) || "").split("=")[1] || d;
if (!file) {
  console.error("Použití: node prisma/import-schools.cjs <soubor.csv|soubor.xml> [--name-tag=…] [--city-tag=…] [--record-tag=…]");
  process.exit(1);
}

const clean = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, " ").trim();
const text = fs.readFileSync(file, "utf8");
let rows = [];
if (/\.xml$/i.test(file)) {
  const rec = opt("record-tag", "SkolaZarizeni");
  const nameTag = opt("name-tag", "SkolaPlnyNazev");
  const cityTag = opt("city-tag", "MistoAdresa3");
  const grab = (block, tag) => (block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`)) || [])[1];
  for (const m of text.matchAll(new RegExp(`<${rec}[\\s>][\\s\\S]*?</${rec}>`, "g"))) {
    const name = grab(m[0], nameTag);
    if (name) rows.push({ name: clean(name).slice(0, 80), city: clean(grab(m[0], cityTag) || "").slice(0, 60) });
  }
} else {
  for (const line of text.split(/\r?\n/).slice(1)) {
    const [name, city = ""] = line.split(/[;\t]/);
    if (name && name.trim().length >= 3) rows.push({ name: clean(name).slice(0, 80), city: clean(city).slice(0, 60) });
  }
}
const seen = new Set();
rows = rows.filter((r) => r.name.length >= 3 && !seen.has(`${r.name}|${r.city}`.toLowerCase()) && seen.add(`${r.name}|${r.city}`.toLowerCase()));
console.log(`Načteno ${rows.length} škol, ukládám…`);

const prisma = new PrismaClient();
(async () => {
  let added = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const res = await prisma.school.createMany({ data: rows.slice(i, i + 500), skipDuplicates: true });
    added += res.count;
  }
  console.log(`Přidáno ${added} nových škol.`);
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
