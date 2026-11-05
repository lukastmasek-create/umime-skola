import assert from "node:assert/strict";
import { test } from "node:test";
import { validateContact } from "./contact.ts";
import { buildSupportMail } from "./contact-mail-format.ts";

const when = new Date("2026-11-05T10:00:00.000Z");

test("e-mail podpory: předmět, Reply-To a údaje ze zprávy", () => {
  const r = validateContact({
    name: "Jana Nováková",
    email: "Jana@Example.cz",
    message: "Ve cvičení 3 je špatně výsledek.",
    topic: "content-error",
    details: { where: "Matematika 5, zlomky", url: "https://example.cz/kurz" },
  });
  assert.ok(r.ok);
  if (!r.ok) return;
  const mail = buildSupportMail(r.data, "clx123", when);
  assert.equal(mail.subject, "[Učíme se hrou] Podpora: Chyba v učivu — Jana Nováková");
  assert.equal(mail.replyTo, "jana@example.cz");
  assert.match(mail.text, /ID zprávy: clx123/);
  assert.match(mail.text, /Od: Jana Nováková <jana@example\.cz>/);
  assert.match(mail.text, /Kde je chyba \(předmět, kurz, lekce\): Matematika 5, zlomky/);
  assert.match(mail.text, /Ve cvičení 3 je špatně výsledek\./);
  assert.match(mail.text, /2026-11-05T10:00:00\.000Z/);
});

test("předmět nikdy neobsahuje zalomení řádku ani se nevejde mimo limit", () => {
  const r = validateContact({
    name: "Jana",
    email: "jana@example.cz",
    message: "Dlouhá zpráva pro test předmětu.",
    topic: "account",
    details: {},
  });
  assert.ok(r.ok);
  if (!r.ok) return;
  const injected = { ...r.data, name: "Eva\r\nBcc: ukradeni@example.com " + "x".repeat(200) };
  const mail = buildSupportMail(injected, "id1", when);
  assert.doesNotMatch(mail.subject, /[\r\n]/);
  assert.ok(mail.subject.length <= 150);
});
