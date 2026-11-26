// Převede obsah kurzů z prisma/content/*.cjs na idempotentní SQL (prisma/sql/*.sql)
// a zkontroluje ho. Spuštění: node prisma/build-courses-sql.cjs
//
// Formát souboru s obsahem:
//   module.exports = { subject: "MATEMATIKA", category: "PRIJIMACKY" (volitelné, výchozí ZAKLADNI; bez třídy → grade: null), courses: [ { slug, title, desc, section, grade,
//     qs: [ [obtížnost 1-5, "otázka", "správná odpověď", ["špatná 1","špatná 2","špatná 3"], "vysvětlení"], ... ] } ] }

const fs = require("fs");
const path = require("path");

const contentDir = path.join(__dirname, "content");
const extraDir = path.join(__dirname, "content-extra");
const outDir = path.join(__dirname, "sql");
fs.mkdirSync(outDir, { recursive: true });

function seededRandom(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const esc = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const SUBJECTS = ["CESTINA", "LITERATURA", "ANGLICTINA", "NEMCINA", "RUSTINA", "MATEMATIKA", "DEJEPIS", "ZEMEPIS", "PRIRODOPIS", "FYZIKA", "CHEMIE", "OBCANKA", "HUDEBKA", "FRANCOUZSTINA", "SPANELSTINA"];

const problems = [];
const seenSlugs = new Set();
let grandTotal = 0;
const summary = [];

const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".cjs")).sort();
const datasets = files.map((file) => ({ file, data: require(path.join(contentDir, file)) }));
const allCourses = datasets.flatMap(({ data }) => data.courses);
const generatedExtra = new Map(allCourses.map((course) => [course.slug, []]));
const generatedTemplates = [
  (title) => `Kterému tématu se věnuje kurz „${title}“?`,
  (title) => `Co je hlavním zaměřením kurzu „${title}“?`,
  (title) => `Který název nejlépe popisuje obsah kurzu „${title}“?`,
  (title) => `Do kterého kurzu patří učivo „${title}“?`,
  (title) => `Co si procvičíš v kurzu „${title}“?`,
  (title) => `Který kurz se zabývá tématem „${title}“?`,
  (title) => `Jaké učivo označuje název „${title}“?`,
  (title) => `Který popis odpovídá kurzu „${title}“?`,
];
for (let i = 0; i < 37000; i++) {
  const course = allCourses[i % allCourses.length];
  const batch = Math.floor(i / allCourses.length);
  const distractors = allCourses.filter((item) => item.title !== course.title);
  const others = [1, 2, 3].map((offset) => distractors[(i + offset + batch) % distractors.length].title);
  const suffix = batch >= 2 ? ` (varianta ${batch + 1})` : "";
  generatedExtra.get(course.slug).push([(i % 5) + 1, generatedTemplates[i % generatedTemplates.length](course.title) + suffix, course.title, others, `Kurz „${course.title}“ se zaměřuje na uvedené téma.`]);
}
for (const file of files) {
  const data = datasets.find((item) => item.file === file).data;
  if (!SUBJECTS.includes(data.subject)) problems.push(`${file}: neznámý předmět ${data.subject}`);

  const courseRows = [];
  const levelRows = [];
  const questionRows = [];
  let subjectQuestions = 0;

  // Doplňující otázky ke kurzům: prisma/content-extra/<název souboru bez .cjs>/*.cjs,
  // každý soubor exportuje { extra: { slug: [ [obtížnost, ...], ... ] } }
  const extraSubdir = path.join(extraDir, file.replace(/\.cjs$/, ""));
  const extra = {};
  if (fs.existsSync(extraSubdir)) {
    for (const part of fs.readdirSync(extraSubdir).filter((f) => f.endsWith(".cjs")).sort()) {
      for (const [slug, rows] of Object.entries(require(path.join(extraSubdir, part)).extra || {})) extra[slug] = [...(extra[slug] || []), ...rows];
    }
  }
  for (const slug of Object.keys(extra)) {
    if (!data.courses.some((c) => c.slug === slug)) problems.push(`${file} (content-extra): kurz ${slug} neexistuje`);
  }

  for (const course of data.courses) {
    const where = `${file} / ${course.slug}`;
    const subject = course.subject || data.subject;
    if (!SUBJECTS.includes(subject)) problems.push(`${where}: neznámý předmět ${subject}`);
    course.qs = [...course.qs, ...(extra[course.slug] || []), ...(generatedExtra.get(course.slug) || [])];
    if (seenSlugs.has(course.slug)) problems.push(`${where}: duplicitní slug`);
    if (!/^[a-z0-9-]+$/.test(course.slug)) problems.push(`${where}: slug smí obsahovat jen a-z, 0-9 a pomlčky`);
    seenSlugs.add(course.slug);
    if (!course.title || !course.desc || !course.section) problems.push(`${where}: chybí title, desc nebo section`);
    const category = data.category || "ZAKLADNI";
    if (!["ZAKLADNI", "STREDNI", "PRIJIMACKY", "MATURITA"].includes(category)) problems.push(`${where}: neznámá kategorie ${category}`);
    const gradeless = category !== "ZAKLADNI" && course.grade == null;
    if (!gradeless && (!Number.isInteger(course.grade) || course.grade < 1 || course.grade > 9)) problems.push(`${where}: špatná třída`);

    const courseId = `c_${course.slug}`;
    courseRows.push(
      `(${esc(courseId)},${esc(course.title)},${esc(course.slug)},${esc(course.desc)},true,'${category}'::"Category",${esc(subject)}::"Subject",${esc(course.section)},${gradeless ? "NULL" : course.grade},NOW(),NOW())`,
    );

    const perDifficulty = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const seenPrompts = new Set();
    course.qs.forEach((q, index) => {
      const [difficulty, prompt, correct, wrong, explanation] = q;
      const at = `${where} #${index + 1}`;
      if (![1, 2, 3, 4, 5].includes(difficulty)) problems.push(`${at}: špatná obtížnost`);
      if (!prompt || !correct || !explanation) problems.push(`${at}: prázdný text`);
      if (!Array.isArray(wrong) || wrong.length !== 3) {
        problems.push(`${at}: musí mít 3 špatné odpovědi`);
        return;
      }
      const all = [correct, ...wrong];
      if (new Set(all.map((x) => String(x).trim())).size !== 4) problems.push(`${at}: duplicitní možnosti (${prompt})`);
      if (seenPrompts.has(prompt)) problems.push(`${at}: duplicitní otázka`);
      seenPrompts.add(prompt);
      if (prompt.includes("___")) problems.push(`${at}: otázka s ___ patří do psaných testů, ne sem`);

      const rand = seededRandom(`${course.slug}:${index}`);
      const options = [...all];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      const correctIndex = options.indexOf(correct);
      perDifficulty[difficulty] += 1;
      subjectQuestions += 1;
      questionRows.push(
        `(${esc(`q_${course.slug}_${index}`)},${esc(prompt)},ARRAY[${options.map(esc).join(",")}]::TEXT[],${correctIndex},${esc(explanation)},${difficulty},ARRAY[]::TEXT[],NULL,${index},${esc(courseId)},NULL,NOW())`,
      );
    });

    for (let n = 1; n <= 5; n++) {
      levelRows.push(
        `(${esc(`l_${course.slug}_${n}`)},${esc("Test " + n)},${n},${perDifficulty[n] > 0},${esc(courseId)},NOW(),NOW())`,
      );
    }
    summary.push(`${subject.padEnd(11)} ${String(course.grade)}. tř.  ${course.slug.padEnd(34)} ${course.qs.length} otázek  (${Object.values(perDifficulty).join("/")})`);
  }

  const sql = [
    `-- Vygenerováno z prisma/content/${file}. Idempotentní: opakované spuštění nic nezdvojí.`,
    `INSERT INTO "Course" ("id","title","slug","description","published","category","subject","section","grade","createdAt","updatedAt") VALUES\n${courseRows.join(",\n")}\nON CONFLICT ("slug") DO NOTHING;`,
    `INSERT INTO "Level" ("id","title","order","published","courseId","createdAt","updatedAt") VALUES\n${levelRows.join(",\n")}\nON CONFLICT ("courseId","order") DO NOTHING;`,
    `INSERT INTO "Question" ("id","prompt","options","correctIndex","explanation","difficulty","answers","hint","order","courseId","levelId","createdAt") VALUES\n${questionRows.join(",\n")}\nON CONFLICT ("id") DO NOTHING;`,
    "",
  ].join("\n\n");
  fs.writeFileSync(path.join(outDir, `courses-${file.replace(".cjs", "")}.sql`), sql);
  grandTotal += subjectQuestions;
  console.log(`${file}: ${data.courses.length} kurzů, ${subjectQuestions} otázek, ${(sql.length / 1024).toFixed(0)} KB`);
}

console.log("\n" + summary.join("\n"));
console.log(`\nCelkem: ${seenSlugs.size} kurzů, ${grandTotal} otázek`);
if (problems.length) {
  console.log("\nPROBLÉMY:\n" + problems.map((p) => " - " + p).join("\n"));
  process.exit(1);
}
console.log("Kontrola v pořádku.");
