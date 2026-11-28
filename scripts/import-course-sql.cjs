const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing DATABASE_URL GitHub Actions secret.");
}

const sqlDir = path.join(__dirname, "..", "prisma", "sql");
const subjectFiles = fs.readdirSync(sqlDir)
  .filter((name) => /^subject-.*\.sql$/.test(name))
  .sort();
const courseFiles = fs.readdirSync(sqlDir)
  .filter((name) => /^courses-.*\.sql$/.test(name))
  .sort();

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  let insertedQuestions = 0;

  try {
    // Add any newer enum values before inserting course rows that use them.
    for (const name of subjectFiles) {
      const sql = fs.readFileSync(path.join(sqlDir, name), "utf8");
      await client.query(sql);
      console.log(`Applied ${name}`);
    }

    await client.query("BEGIN");
    try {
      await client.query("SELECT pg_advisory_xact_lock(734505964)");
      const before = await countCoursesWithQuestions(client);
      // Remove only title-guessing placeholders from the former bulk generator.
      const removed = await client.query(`
        DELETE FROM "Question" AS q
        USING "Course" AS c
        WHERE q."courseId" = c."id"
          AND q."explanation" = 'Kurz „' || c."title" || '“ se zaměřuje na uvedené téma.'
          AND q."options" @> ARRAY[c."title"]::text[]
          AND q."prompt" ~ '^(Kterému tématu se věnuje kurz|Co je hlavním zaměřením kurzu|Který název nejlépe popisuje obsah kurzu|Do kterého kurzu patří učivo|Co si procvičíš v kurzu|Který kurz se zabývá tématem|Jaké učivo označuje název|Který popis odpovídá kurzu) „'
      `);
      console.log(`Removed placeholder questions: ${removed.rowCount}`);

      for (const name of courseFiles) {
        const sql = fs.readFileSync(path.join(sqlDir, name), "utf8");
        const results = await client.query(sql);
        const statements = Array.isArray(results) ? results : [results];
        const questionInsert = statements.at(-1);
        insertedQuestions += Number(questionInsert?.rowCount ?? 0);
        console.log(`Applied ${name}`);
      }

      const after = await countCoursesWithQuestions(client);
      if (after === 0 || after < before) throw new Error(`Published courses with questions would drop from ${before} to ${after}.`);
      const total = await client.query('SELECT COUNT(*)::int AS count FROM "Question"');
      await client.query("COMMIT");
      console.log(`New question rows inserted: ${insertedQuestions}`);
      console.log(`Published courses with questions: ${after}`);
      console.log(`Total questions in database: ${total.rows[0].count}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } finally {
    await client.end();
  }
}

async function countCoursesWithQuestions(client) {
  const result = await client.query(`
    SELECT COUNT(*)::int AS count FROM "Course" AS c
    WHERE c."published" AND EXISTS (SELECT 1 FROM "Question" AS q WHERE q."courseId" = c."id")
  `);
  return result.rows[0].count;
}

main().catch((error) => {
  console.error("Course question import failed:", error.message);
  process.exitCode = 1;
});
