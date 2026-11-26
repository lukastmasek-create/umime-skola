// Run from the repository with node tools/arena/build-arcade-art.mjs.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { Color, Matrix3, Vector3 } from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { makeModel } from "./arcade-models.mjs";

const publicDir = fileURLToPath(new URL("../../public/", import.meta.url));
const modelsDir = join(publicDir, "game-models");
const spritesDir = join(publicDir, "game-sprites");

// The texture-free GLB exporter only needs FileReader for the binary buffer.
globalThis.FileReader ??= class {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
};

const light = new Vector3(-.48, .65, .68).normalize();

function renderSprite(object, width, height, bounds) {
  object.updateMatrixWorld(true);
  const triangles = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  object.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const { index, attributes: { position, normal } } = mesh.geometry;
    const normalMatrix = new Matrix3().getNormalMatrix(mesh.matrixWorld);
    const color = mesh.material.color;
    const count = index?.count ?? position.count;
    for (let i = 0; i < count; i += 3) {
      const vertices = [];
      const surfaceNormal = new Vector3();
      for (let corner = 0; corner < 3; corner++) {
        const n = index ? index.getX(i + corner) : i + corner;
        const v = new Vector3().fromBufferAttribute(position, n).applyMatrix4(mesh.matrixWorld);
        vertices.push(v);
        surfaceNormal.add(new Vector3().fromBufferAttribute(normal, n).applyNormalMatrix(normalMatrix));
      }
      const [a, b, c] = vertices;
      const front = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      if (front <= 1e-7) continue;
      for (const v of vertices) {
        minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
        minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
      }
      const intensity = .48 + .62 * Math.max(0, surfaceNormal.normalize().dot(light));
      const fill = color.clone().multiplyScalar(intensity);
      if (intensity > .87) fill.lerp(new Color("#fff0d9"), (intensity - .87) * .24);
      triangles.push({ vertices, depth: a.z + b.z + c.z, fill: `#${fill.getHexString()}` });
    }
  });
  if (!triangles.length) throw new Error(`Empty sprite for ${object.name}`);

  const [left, top, right, bottom] = bounds;
  const scaleX = width * (right - left) / (100 * (maxX - minX));
  const scaleY = height * (bottom - top) / (100 * (maxY - minY));
  const x = (v) => (width * left / 100 + (v.x - minX) * scaleX).toFixed(2);
  const y = (v) => (height * top / 100 + (maxY - v.y) * scaleY).toFixed(2);
  const polygons = triangles.sort((a, b) => a.depth - b.depth).map(({ vertices, fill }) => {
    const points = vertices.map((v) => `${x(v)},${y(v)}`).join(" ");
    return `<polygon points="${points}" fill="${fill}" stroke="${fill}" stroke-width=".42" stroke-linejoin="round"/>`;
  });
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${polygons.join("")}</svg>`);
}

// Keep the existing atlas coordinates and sprite footprint so rendered pieces
// stay aligned with canvas movement, board cells and collision detection.
function spriteFor(game, group, frame) {
  if (game === "space") {
    if (group === "lod") return ["lod", frame, [15, 8, 85, 91]];
    if (group === "bonusy") return [`bonus_${frame}`, "", [5, 5, 95, 95]];
    if (group === "bossove" || group === "mimozemstane") {
      const type = frame.split("_")[0];
      const bounds = group === "bossove" ? [10, 9, 90, 86] : {
        chobotnice: [22, 15, 78, 82], krab: [5, 15, 95, 73],
        kyklop: [15, 8, 85, 80], ufo: [14, 23, 86, 64],
      }[type];
      return [`mimozemstan_${type}`, frame, bounds];
    }
  } else if (game === "pacman") {
    if (group === "pac") return ["pac", frame, [5, 5, { zavrena: 95, pootevrena: 92, otevrena: 86 }[frame], 95]];
    if (group === "duchove") {
      const type = frame === "jen_oci" ? "vystraseny" : frame.split("_")[0];
      return [`duch_${type}`, frame, frame === "jen_oci" ? [25, 31, 75, 56] : [8, 8, 92, 97]];
    }
  } else if (game === "snake" && frame !== "jidlo") {
    const bounds = {
      hlava: [0, 3, 100, 98], telo: [0, 5, 100, 95], ocas: [3, 5, 100, 95], zatacka: [5, 5, 100, 100],
    };
    return [frame, "", bounds[frame] ?? [10, 10, 90, 90]];
  } else if (game === "breakout") {
    return [group === "cihly" || group === "odpovedi" ? `cihla_${frame}` : frame, "", [0, 0, 100, 100]];
  } else if (game === "tetris") {
    return [frame.startsWith("drahokam_") ? frame : `kostka_${frame}`, "", [3, 3, 97, 97]];
  } else if (game === "mole") {
    if (group === "kladivo") return ["kladivo", "", [20, 13, 80, 84]];
    if (group === "krtek") return ["krtek", frame, [8, 39, 92, 100]];
  } else if (game === "ninja") {
    if (group === "cepel") return ["cepel", "", [20, 20, 80, 80]];
    const [fruit, pose] = frame.split("_");
    const bounds = pose === "cele" ? { ananas: [18, 3, 82, 95], kiwi: [11, 15, 89, 85] }[fruit] : null;
    return [fruit, pose, bounds ?? [5, 5, 95, 95]];
  }
  return null;
}

const exporter = new GLTFExporter();
for (const game of (await readdir(modelsDir)).sort()) {
  const dir = join(modelsDir, game);
  for (const filename of (await readdir(dir)).sort()) {
    if (!filename.endsWith(".glb")) continue;
    const name = filename.slice(0, -4);
    const data = await exporter.parseAsync(makeModel(game, name), { binary: true });
    await writeFile(join(dir, filename), Buffer.from(data));
  }
}

for (const game of (await readdir(spritesDir)).sort()) {
  const metaPath = join(spritesDir, game, `${game}.json`);
  const { groups } = JSON.parse(await readFile(metaPath, "utf8"));
  for (const [group, { file, cell: [width, height], cols, frames }] of Object.entries(groups)) {
    const entries = Object.entries(frames).map(([frame, position]) => [spriteFor(game, group, frame), position]);
    if (entries.every(([sprite]) => sprite === null)) continue;
    const path = join(dirname(metaPath), file);
    const old = await readFile(path);
    const rows = 1 + Math.max(...entries.map(([, [, y]]) => y));
    const cells = await Promise.all(entries.map(async ([sprite, [col, row]]) => {
      const left = col * width, top = row * height;
      const input = sprite
        ? await sharp(renderSprite(makeModel(game, sprite[0], sprite[1]), width, height, sprite[2])).png().toBuffer()
        : await sharp(old).extract({ left, top, width, height }).png().toBuffer();
      return { input, left, top };
    }));
    const atlas = await sharp({
      create: { width: cols * width, height: rows * height, channels: 4, background: "#00000000" },
    }).composite(cells).webp({ lossless: entries.some(([sprite]) => !sprite), quality: 90, alphaQuality: 100 }).toBuffer();
    await writeFile(path, atlas);
  }
}
