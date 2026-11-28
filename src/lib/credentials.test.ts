import assert from "node:assert/strict";
import { test } from "node:test";
import { validNewPassword } from "./credentials";
import { sameOriginMutation } from "./request-origin";

test("UTF-8 password size is limited before bcrypt hashing", () => {
  assert.equal(validNewPassword("a".repeat(72)), true);
  assert.equal(validNewPassword("a".repeat(73)), false);
  assert.equal(validNewPassword("ž".repeat(36)), true);
  assert.equal(validNewPassword("ž".repeat(37)), false);
  assert.equal(validNewPassword("🦊".repeat(4)), false);
});

test("account mutations accept their own origin and reject other origins", () => {
  const request = (headers: Record<string, string>) => new Request("https://example.test/api/ucet/heslo", { method: "POST", headers });
  assert.equal(sameOriginMutation(request({ origin: "https://example.test" })), true);
  assert.equal(sameOriginMutation(request({ origin: "https://other.example.test" })), false);
  assert.equal(sameOriginMutation(request({ "sec-fetch-site": "cross-site" })), false);
});
