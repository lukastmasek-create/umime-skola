import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { AVATARS } from "./avatars.ts";
import { getAvatarModel, getAvatarStills } from "./avatars3d.ts";

// Každý avatar, který má v public/avatars-3d model, musí být v registru, jinak se kreslí jen 2D SVG.
test("avatary s 3D modelem na disku jsou zaregistrované", () => {
  for (const a of AVATARS) {
    const onDisk = existsSync(new URL(`../../public/avatars-3d/${a.id}.glb`, import.meta.url));
    if (onDisk) {
      assert.ok(getAvatarModel(a.id), `${a.id}: model je na disku, ale není v MODELS`);
      assert.ok(getAvatarStills(a.id), `${a.id}: chybí rendery v MODELS`);
    }
  }
});
