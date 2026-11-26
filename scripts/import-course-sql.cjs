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

    for (const name of courseFiles) {
      const sql = fs.readFileSync(path.join(sqlDir, name), "utf8");
      const results = await client.query(sql);
      const statements = Array.isArray(results) ? results : [results];
      const questionInsert = statements.at(-1);
      insertedQuestions += Number(questionInsert?.rowCount ?? 0);
      console.log(`Applied ${name}`);
    }

    const total = await client.query('SELECT COUNT(*)::int AS count FROM "Question"');
    console.log(`New question rows inserted: ${insertedQuestions}`);
    console.log(`Total questions in database: ${total.rows[0].count}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Course question import failed:", error.message);
  process.exitCode = 1;
});
