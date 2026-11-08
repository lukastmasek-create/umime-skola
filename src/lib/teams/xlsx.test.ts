import assert from "node:assert/strict";
import test from "node:test";
import { buildXlsx, crc32, sheetXml } from "./xlsx.ts";

test("crc32 odpovídá známé hodnotě", () => {
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
});

test("sheetXml escapuje a rozlišuje čísla a texty", () => {
  const x = sheetXml([["a<b", 5, null, "x"]]);
  assert.match(x, /a&lt;b/);
  assert.match(x, /<c r="B1"><v>5<\/v><\/c>/);
  assert.match(x, /r="D1"/);
});

test("buildXlsx vyrobí zip s očekávanými soubory", () => {
  const z = buildXlsx([["Jméno", "Body"], ["Anna", 90]]);
  assert.equal(z[0], 0x50);
  assert.equal(z[1], 0x4b);
  const text = new TextDecoder().decode(z);
  for (const n of ["[Content_Types].xml", "xl/workbook.xml", "xl/worksheets/sheet1.xml"]) assert.ok(text.includes(n), n);
});
