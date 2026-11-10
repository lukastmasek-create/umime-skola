import test from "node:test";
import assert from "node:assert/strict";
import { buildStudentMail, buildTeacherMail, cronAuthorized, parseNotifyPrefs, studentReminderDue, teacherSummaryDue } from "./reminders.ts";

const now = new Date("2026-11-10T12:00:00Z");
const at = (h: number) => new Date(now.getTime() + h * 3600_000);

test("parseNotifyPrefs je výchozí vypnuté", () => {
  assert.deepEqual(parseNotifyPrefs(null), { deadline: false });
  assert.deepEqual(parseNotifyPrefs({ deadline: "true" }), { deadline: false });
  assert.deepEqual(parseNotifyPrefs({ deadline: true }), { deadline: true });
});
test("studentReminderDue jen den před termínem", () => {
  assert.equal(studentReminderDue(null, now), false);
  assert.equal(studentReminderDue(at(23), now), true);
  assert.equal(studentReminderDue(at(25), now), false);
  assert.equal(studentReminderDue(at(-1), now), false);
});
test("teacherSummaryDue jen den po termínu", () => {
  assert.equal(teacherSummaryDue(at(-1), now), true);
  assert.equal(teacherSummaryDue(at(-30), now), false);
  assert.equal(teacherSummaryDue(at(2), now), false);
});
test("e-mail nenese zalomení v předmětu", () => {
  const m = buildStudentMail({ title: "A\r\nBcc: x@y.cz", teamName: "3.A", dueAt: at(5), url: "https://x/y", settingsUrl: "https://x/s" });
  assert.equal(/[\r\n]/.test(m.subject), false);
  const t = buildTeacherMail({ title: "T", teamName: "3.A", dueAt: at(-1), done: 3, total: 10, url: "https://x/y", settingsUrl: "https://x/s" });
  assert.match(t.subject, /3 z 10/);
});
test("cronAuthorized vyžaduje shodný dlouhý secret", () => {
  const secret = "s".repeat(20);
  assert.equal(cronAuthorized(secret, `Bearer ${secret}`), true);
  assert.equal(cronAuthorized(secret, "Bearer nope"), false);
  assert.equal(cronAuthorized(undefined, "Bearer undefined"), false);
  assert.equal(cronAuthorized("short", "Bearer short"), false);
  assert.equal(cronAuthorized(secret, null), false);
});
