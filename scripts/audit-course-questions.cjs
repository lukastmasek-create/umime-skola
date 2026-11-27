// Audit all authored course questions without connecting to the production database.
const fs = require('node:fs');
const path = require('node:path');
const contentDir = path.join(__dirname, '..', 'prisma', 'content');
const extraDir = path.join(__dirname, '..', 'prisma', 'content-extra');
const courses = [];
const errors = [];
const review = [];
const subjects = new Set(['CESTINA','LITERATURA','ANGLICTINA','NEMCINA','RUSTINA','MATEMATIKA','DEJEPIS','ZEMEPIS','PRIRODOPIS','FYZIKA','CHEMIE','OBCANKA','HUDEBKA','FRANCOUZSTINA','SPANELSTINA']);
for (const file of fs.readdirSync(contentDir).filter(f => f.endsWith('.cjs')).sort()) {
  const data = require(path.join(contentDir, file));
  const dir = path.join(extraDir, file.slice(0, -4));
  const extra = {};
  if (fs.existsSync(dir)) for (const part of fs.readdirSync(dir).filter(f => f.endsWith('.cjs')).sort()) {
    for (const [slug, qs] of Object.entries(require(path.join(dir, part)).extra || {})) (extra[slug] ||= []).push(...qs);
  }
  for (const slug of Object.keys(extra)) if (!data.courses.some(c => c.slug === slug)) errors.push(`${file}: unknown extra course ${slug}`);
  for (const course of data.courses) {
    const subject = course.subject || data.subject;
    if (!subjects.has(subject)) errors.push(`${course.slug}: unknown subject ${subject}`);
    const qs = [...course.qs, ...(extra[course.slug] || [])];
    const counts = [1,2,3,4,5].map(d => qs.filter(q => q[0] === d).length);
    const prompts = new Set();
    for (const [index, q] of qs.entries()) {
      const [difficulty, prompt, correct, wrong, explanation] = q;
      const at = `${course.slug} #${index + 1}`;
      if (![1,2,3,4,5].includes(difficulty)) errors.push(`${at}: invalid difficulty`);
      if (![prompt, correct, explanation].every(x => typeof x === 'string' && x.trim())) errors.push(`${at}: empty text`);
      if (!Array.isArray(wrong) || wrong.length !== 3 || new Set([correct,...wrong].map(x => String(x).trim())).size !== 4) errors.push(`${at}: invalid answer options`);
      else if (new Set([correct,...wrong].map(x => String(x).trim().toLocaleLowerCase('cs'))).size !== 4) review.push(`${at}: answers differ only in capitalization (check intent)`);
      const key = String(prompt).trim().toLocaleLowerCase('cs').replace(/\s+/g, ' ');
      if (prompts.has(key)) errors.push(`${at}: duplicate prompt`);
      prompts.add(key);
      if (/\(rozšíření \d+\)$/.test(prompt) || /^Kurz „.*“ se zaměřuje na uvedené téma\.$/.test(explanation)) errors.push(`${at}: course-title placeholder`);
    }
    courses.push({slug: course.slug, title: course.title, subject, count: qs.length, difficulty: counts});
  }
}
const summary = {courses: courses.length, questions: courses.reduce((n,c) => n+c.count,0), under20: courses.filter(c => c.count < 20).length, missingDifficulty: courses.filter(c => c.difficulty.some(n => n === 0)).length, errors, review, coursesNeedingAttention: courses.filter(c => c.count < 20 || c.difficulty.some(n => n === 0))};
console.log(JSON.stringify(summary, null, 2));
if (errors.length) process.exitCode = 1;
