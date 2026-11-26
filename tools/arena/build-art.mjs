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

const outlined = (body) => `<g stroke="#241b38" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;

// Silhouettes with a shared hard light and dark outline, readable at phone size.
const EMBLEMS = {
  QUIZ: outlined(`<path d="M31 31 83 21 98 34 98 91 45 105 31 90Z" fill="#387bc8"/>
    <path d="M31 31 83 21 83 81 31 92Z" fill="#83d5f8"/><path d="M83 21 98 34 98 91 83 81Z" fill="#2861a9"/>
    <path d="M31 92 83 81 98 91 45 105Z" fill="#fff0bb"/>
    <path d="m49 57 8-9 10 2 3 7-8 9v4m0 8h.1" fill="none" stroke="#173b74" stroke-width="6"/>`),
  RACE: outlined(`<path d="m29 101 7-76 8-4 4 8-8 73Z" fill="#ccecd6"/>
    <path d="M44 30 60 26 83 34 103 29 97 57 81 63 59 54 41 60Z" fill="#78e0b1"/>
    <path d="m60 26 15 5-3 13-14-5Zm-2 13-3 15-14 6 2-15Zm14 5 15 4 16-5-6 14-16 6-12-5Z" stroke="none" fill="#26766b"/>
    <path d="M19 73h10m7 12h18m6-12h13" stroke="#b3f5d7"/>`),
  GOLD: outlined(`<path d="m21 57 9-19 15-6 49 3 12 10 2 34-22 18-64-5Z" fill="#a6543c"/>
    <path d="m21 57 64 6 23-18-2 34-22 18 1-34Z" fill="#7a4256"/>
    <path d="m21 57 9-19 15-6 49 3 12 10-21 18Z" fill="#ee9761"/>
    <path d="m33 55 7-13 13-9h10L52 42l-8 15v37l-11-1Zm37 5 9-15 13-10 9 4-10 9-10 14v34l-11-1Z" fill="#ffd06a"/>
    <path d="m48 61 15 1v14l-15-1Z" fill="#ffe497"/><path d="M55 67v3" stroke-width="3"/>`),
  STREAK: outlined(`<path d="m65 17 27 18-15 22 17 8-36 44-16-14 9-24-21-6Z" fill="#be4b58"/>
    <path d="m65 17 16 10-22 34 18 8-35 26 9-24-21-6Z" fill="#ff9e62"/>
    <path d="m64 29-21 29 13-2" stroke="#ffe3a0" fill="none"/>
    <path d="M27 28v13m-7-6h13m72 46v12m-6-6h12" stroke="#ffca67" stroke-width="3"/>`),
  SURVIVAL: outlined(`<path d="M22 33 63 20 106 32 101 67 88 88 64 105 41 90 26 66Z" fill="#8b68cf"/>
    <path d="M22 33 63 20 64 105 41 90 26 66Z" fill="#bd9af4"/>
    <path d="m64 35 26 7-4 24-9 14-13 10-14-10-9-14-4-24Z" fill="#514080"/>
    <path d="M64 74 47 59l3-9 8-2 6 6 6-6 8 2 3 9Z" fill="#ffe5e5" stroke="none"/>`),
  TEAMS: outlined(`<path d="m45 39 38 62 7-5-36-63Z" fill="#8fb7fc"/><path d="m85 39-38 62-7-5 36-63Z" fill="#f5afbf"/>
    <path d="M38 26 16 42l5 31 14 8 5-17 17-14Z" fill="#f286a7"/>
    <path d="m88 26 22 16-5 31-14 8-5-17-17-14Z" fill="#77baff"/>
    <path d="m27 45 10 13m-11-3 13-10" stroke="#fff0d9" stroke-width="3"/>
    <path d="m88 46 14 8m-12 4 10-15" stroke="#e9f9ff" stroke-width="3"/>`),
};

const webp = { quality: 82, effort: 6, alphaQuality: 100, smartSubsample: true };
for (const [k, pal] of Object.entries(ACCENTS)) {
  const buf = await sharp(Buffer.from(poster(pal))).webp(webp).toBuffer();
  await sharp(buf).toFile(join(OUT, `poster-${k.toLowerCase()}.webp`));
}
for (const [k, art] of Object.entries(EMBLEMS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 128 128">
    <ellipse cx="64" cy="110" rx="43" ry="6" fill="#131023" opacity=".54"/>${art}</svg>`;
  await sharp(Buffer.from(svg)).webp({ ...webp, quality: 90 }).toFile(join(OUT, `emblem-${k.toLowerCase()}.webp`));
}
console.log("arena art ok");
