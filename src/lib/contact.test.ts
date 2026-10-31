import assert from "node:assert/strict";
import { test } from "node:test";
import { CONTACT_CATEGORIES, TOPICS, topicFromQuery, topicsOf, validateContact } from "./contact.ts";
import { getContactText } from "../i18n/contact.ts";

const ok = { name: "Jana Nováková", email: "Jana@Example.cz", message: "Ve cvičení 3 je špatně výsledek." };

test("každá kategorie má aspoň jedno téma a každé téma texty ve všech jazycích", () => {
  for (const c of CONTACT_CATEGORIES) assert.ok(topicsOf(c).length > 0, c);
  assert.equal(new Set(TOPICS.map((t) => t.id)).size, TOPICS.length);
  for (const loc of ["cs", "en", "de", "ru"] as const) {
    const t = getContactText(loc);
    for (const c of CONTACT_CATEGORIES) assert.ok(t.categories[c]?.title && t.categories[c]?.hint, `${loc}: ${c}`);
    for (const topic of TOPICS) {
      assert.ok(t.topics[topic.id]?.title && t.topics[topic.id]?.placeholder, `${loc}: ${topic.id}`);
      for (const f of topic.fields) assert.ok(t.fields[f.key], `${loc}: pole ${f.key}`);
    }
  }
});

test("platná zpráva projde a vyčistí se", () => {
  const r = validateContact({ ...ok, topic: "content-error", details: { where: "  Matematika 5,  zlomky ", url: "https://example.cz/kurz", junk: "x" } });
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.data.category, "support");
  assert.equal(r.data.email, "jana@example.cz");
  assert.deepEqual(r.data.details, { where: "Matematika 5, zlomky", url: "https://example.cz/kurz" });
});

test("chyby: téma, jméno, e-mail, krátká zpráva, povinné a špatné pole", () => {
  assert.deepEqual(validateContact({ ...ok, topic: "nope" }), { ok: false, error: "topic" });
  assert.deepEqual(validateContact({ ...ok, topic: "account", name: " " }), { ok: false, error: "name" });
  assert.deepEqual(validateContact({ ...ok, topic: "account", email: "jana@" }), { ok: false, error: "email" });
  assert.deepEqual(validateContact({ ...ok, topic: "account", message: "ahoj" }), { ok: false, error: "message-short" });
  assert.deepEqual(validateContact({ ...ok, topic: "add-school", details: { schoolName: "ZŠ Lipová" } }), { ok: false, error: "field:city" });
  assert.deepEqual(validateContact({ ...ok, topic: "site-error", details: { url: "javascript:alert(1)" } }), { ok: false, error: "field:url" });
  assert.deepEqual(validateContact({ ...ok, topic: "account", details: { accountEmail: "nic" } }), { ok: false, error: "field:accountEmail" });
  assert.deepEqual(validateContact(null), { ok: false, error: "topic" });
});

test("přidání školy a partnerství projdou s povinnými poli", () => {
  const school = validateContact({ ...ok, topic: "add-school", details: { schoolName: "ZŠ Lipová", city: "Brno", izo: "102345678" } });
  assert.ok(school.ok && school.data.category === "school");
  const inf = validateContact({ ...ok, topic: "influencer", details: { profile: "@jana_uci" } });
  assert.ok(inf.ok && inf.data.category === "partner");
});

test("téma z odkazu", () => {
  assert.deepEqual(topicFromQuery("add-school"), { category: "school", topic: "add-school" });
  assert.deepEqual(topicFromQuery("school"), { category: "school", topic: "add-school" });
  assert.deepEqual(topicFromQuery("partner"), { category: "partner", topic: null });
  assert.deepEqual(topicFromQuery("xyz"), { category: null, topic: null });
  assert.deepEqual(topicFromQuery(undefined), { category: null, topic: null });
});
