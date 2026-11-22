#!/usr/bin/env node
// Arena: WebP umění pro „Hrát společně“ (pozadí-náhrady pro WebGL a znaky režimů).
// Použití: node tools/arena/build-art.mjs   → public/arena/*.webp
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public", "arena");
mkdirSync(OUT, { recursive: true });

export const ACCENTS = {
  neutral: ["#5a6cff", "#ff8a6b"],
  QUIZ: ["#29a3ff", "#8fd0ff"],
  RACE: ["#17a864", "#7ee0b0"],
  GOLD: ["#ffc933", "#ff8a1f"],
  STREAK: ["#ff5a3c", "#ffc933"],
  SURVIVAL: ["#8a5cff", "#c9a8ff"],
  TEAMS: ["#ff5a8a", "#29a3ff"],
};

// Pozadí 960×540: tmavý přechod, dvě zářící skvrny, jemná mřížka teček.
function poster([a, b]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d0b24"/><stop offset="1" stop-color="#171338"/></linearGradient>
    <radialGradient id="g1" cx="22%" cy="28%" r="55%"><stop offset="0" stop-color="${a}" stop-opacity=".62"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="82%" cy="78%" r="52%"><stop offset="0" stop-color="${b}" stop-opacity=".5"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="16" cy="16" r="1.3" fill="#fff" opacity=".10"/></pattern>
  </defs>
  <rect width="960" height="540" fill="url(#bg)"/><rect width="960" height="540" fill="url(#g1)"/><rect width="960" height="540" fill="url(#g2)"/><rect width="960" height="540" fill="url(#dots)"/>
</svg>`;
}

const defs = (id, [a, b]) => `<defs>
  <linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient>
  <radialGradient id="${id}h" cx="30%" cy="22%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <radialGradient id="${id}s" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>`;

// Znaky režimů 512×512, bez obrysu, světlo shora zleva, stín pod předmětem.
const EMBLEMS = {
  QUIZ: (id, c) => `${defs(id, c)}<ellipse cx="256" cy="452" rx="150" ry="22" fill="url(#${id}s)"/>
    <rect x="86" y="70" width="340" height="340" rx="64" fill="url(#${id}f)"/><rect x="86" y="70" width="340" height="340" rx="64" fill="url(#${id}h)"/>
    <text x="256" y="320" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="250" fill="#fff">?</text>`,
  RACE: (id, c) => `${defs(id, c)}<ellipse cx="256" cy="452" rx="160" ry="22" fill="url(#${id}s)"/>
    <rect x="120" y="60" width="26" height="380" rx="13" fill="#e8e2ff"/>
    <path d="M146 80 H400 V270 H146Z" fill="url(#${id}f)"/><path d="M146 80 H400 V270 H146Z" fill="url(#${id}h)"/>
    ${Array.from({ length: 24 }, (_, i) => { const r = Math.floor(i / 6), q = i % 6; return (r + q) % 2 ? `<rect x="${146 + q * 42.3}" y="${80 + r * 47.5}" width="42.3" height="47.5" fill="#14132a" opacity=".85"/>` : ""; }).join("")}`,
  GOLD: (id, c) => `${defs(id, c)}<ellipse cx="256" cy="456" rx="170" ry="24" fill="url(#${id}s)"/>
    <path d="M76 250 Q76 120 256 120 Q436 120 436 250Z" fill="url(#${id}f)"/><rect x="76" y="240" width="360" height="190" rx="22" fill="${c[0]}"/>
    <rect x="76" y="240" width="360" height="190" rx="22" fill="url(#${id}h)"/><rect x="76" y="232" width="360" height="30" fill="#14132a" opacity=".35"/>
    <rect x="224" y="262" width="64" height="78" rx="14" fill="#fff3b0"/><circle cx="256" cy="296" r="10" fill="#14132a"/>
    <circle cx="150" cy="150" r="34" fill="#ffe066"/><circle cx="360" cy="116" r="24" fill="#ffe066"/>`,
  STREAK: (id, c) => `${defs(id, c)}<ellipse cx="256" cy="458" rx="120" ry="20" fill="url(#${id}s)"/>
    <path d="M256 40 C300 120 410 170 400 300 C392 400 320 448 256 448 C190 448 112 400 112 304 C112 240 160 200 190 150 C200 200 230 220 240 200 C250 160 230 100 256 40Z" fill="url(#${id}f)"/>
    <path d="M256 190 C290 250 340 280 332 340 C326 400 290 420 256 420 C220 420 186 396 186 340 C186 290 230 260 256 190Z" fill="#fff3b0" opacity=".9"/>`,
  SURVIVAL: (id, c) => `${defs(id, c)}<ellipse cx="256" cy="456" rx="150" ry="22" fill="url(#${id}s)"/>
    <path d="M256 440 C60 310 40 190 120 130 C180 86 236 112 256 168 C276 112 332 86 392 130 C472 190 452 310 256 440Z" fill="url(#${id}f)"/>
    <path d="M256 440 C60 310 40 190 120 130 C180 86 236 112 256 168 C276 112 332 86 392 130 C472 190 452 310 256 440Z" fill="url(#${id}h)"/>`,
  TEAMS: (id, c) => `${defs(id, c)}<ellipse cx="256" cy="456" rx="190" ry="22" fill="url(#${id}s)"/>
    <path d="M60 90 H236 V270 Q236 380 148 430 Q60 380 60 270Z" fill="${c[0]}"/><path d="M60 90 H236 V270 Q236 380 148 430 Q60 380 60 270Z" fill="url(#${id}h)"/>
    <path d="M276 90 H452 V270 Q452 380 364 430 Q276 380 276 270Z" fill="${c[1]}"/><path d="M276 90 H452 V270 Q452 380 364 430 Q276 380 276 270Z" fill="url(#${id}h)"/>
    <text x="148" y="300" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="130" fill="#fff">A</text>
    <text x="364" y="300" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="130" fill="#14132a">B</text>`,
};

const webp = { quality: 82, effort: 6, alphaQuality: 100, smartSubsample: true };
for (const [k, pal] of Object.entries(ACCENTS)) {
  const buf = await sharp(Buffer.from(poster(pal))).webp(webp).toBuffer();
  await sharp(buf).toFile(join(OUT, `poster-${k.toLowerCase()}.webp`));
}
for (const [k, fn] of Object.entries(EMBLEMS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${fn(k.toLowerCase(), ACCENTS[k])}</svg>`;
  await sharp(Buffer.from(svg)).webp({ ...webp, quality: 90 }).toFile(join(OUT, `emblem-${k.toLowerCase()}.webp`));
}
console.log("arena art ok");
