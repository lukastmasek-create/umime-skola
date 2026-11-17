import * as THREE from "three";
import { useEffect, useMemo } from "react";

export type TrackKind = "blinding" | "getlucky" | "birds" | "fein";
export type PlaylistKind =
  | "today"
  | "rapcaviar"
  | "mint"
  | "discover"
  | "release";

export type ScreenKind = "intro" | "blinding" | "getlucky" | "home";

export type TrackInfo = {
  kind: TrackKind;
  artist: string;
  title: string;
  album: string;
  duration: string;
  elapsed: string;
  accent: string;
};

export const TRACKS: Record<TrackKind, TrackInfo> = {
  blinding: {
    kind: "blinding",
    artist: "The Weeknd",
    title: "Blinding Lights",
    album: "After Hours",
    duration: "3:20",
    elapsed: "2:18",
    accent: "#c1121f",
  },
  getlucky: {
    kind: "getlucky",
    artist: "Daft Punk",
    title: "Get Lucky",
    album: "Random Access Memories",
    duration: "6:09",
    elapsed: "3:12",
    accent: "#d8b44d",
  },
  birds: {
    kind: "birds",
    artist: "Billie Eilish",
    title: "BIRDS OF A FEATHER",
    album: "HIT ME HARD AND SOFT",
    duration: "3:30",
    elapsed: "1:46",
    accent: "#6fb8ff",
  },
  fein: {
    kind: "fein",
    artist: "Travis Scott",
    title: "FE!N",
    album: "UTOPIA",
    duration: "3:11",
    elapsed: "1:21",
    accent: "#ff6a2a",
  },
};

export const PLAYLISTS: Record<
  PlaylistKind,
  { kind: PlaylistKind; title: string; subtitle: string; accent: string }
> = {
  today: {
    kind: "today",
    title: "Today's Top Hits",
    subtitle: "The hottest 50. Updated daily.",
    accent: "#1DB954",
  },
  rapcaviar: {
    kind: "rapcaviar",
    title: "RapCaviar",
    subtitle: "New music from hip-hop's biggest stars.",
    accent: "#e63946",
  },
  mint: {
    kind: "mint",
    title: "mint",
    subtitle: "The softest chill, fresh every week.",
    accent: "#92ffd0",
  },
  discover: {
    kind: "discover",
    title: "Discover Weekly",
    subtitle: "Your weekly mixtape of fresh music.",
    accent: "#9b7bff",
  },
  release: {
    kind: "release",
    title: "Release Radar",
    subtitle: "Catch all the latest music from artists you follow.",
    accent: "#1DB954",
  },
};

const FONT = 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif';
const TAU = Math.PI * 2;

const fract = (x: number) => x - Math.floor(x);
const rand = (seed: number) => fract(Math.sin(seed * 127.1 + 311.7) * 43758.5453);

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function setFont(
  ctx: CanvasRenderingContext2D,
  size: number,
  weight: number | string = 700,
  style = "normal"
) {
  ctx.font = `${style} ${weight} ${size}px ${FONT}`;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  weight: number | string = 700,
  minSize = 22
) {
  let size = startSize;
  setFont(ctx, size, weight);
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2;
    setFont(ctx, size, weight);
  }
  return size;
}

function grain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount = 0.05,
  seed = 1
) {
  for (let i = 0; i < 520; i++) {
    const x = rand(seed + i * 1.1) * width;
    const y = rand(seed + i * 2.7) * height;
    const a = rand(seed + i * 0.7) * amount;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(x, y, 1.2, 1.2);
  }
}

function vignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength = 0.55
) {
  const g = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.05,
    width / 2,
    height / 2,
    width * 0.72
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.72, `rgba(0,0,0,${strength * 0.12})`);
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}

export const drawSpotifyMark = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  green = "#1DB954",
  black = "#050705",
  filledCircle = true
) => {
  ctx.save();

  if (filledCircle) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.fillStyle = green;
    ctx.fill();
  }

  ctx.strokeStyle = black;
  ctx.lineWidth = radius * 0.12;
  ctx.lineCap = "round";

  for (let i = 0; i < 3; i++) {
    const y = cy - radius * 0.24 + i * radius * 0.235;
    const half = radius * (0.63 - i * 0.075);

    ctx.beginPath();
    ctx.moveTo(cx - half, y + radius * 0.025);
    ctx.quadraticCurveTo(cx, y - radius * 0.18, cx + half, y + radius * 0.025);
    ctx.stroke();
  }

  ctx.restore();
};

export const drawIcon = (
  ctx: CanvasRenderingContext2D,
  name: string,
  cx: number,
  cy: number,
  size: number,
  color = "#F7F9F7",
  filled = false
) => {
  const s = size;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.075);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (name) {
    case "play": {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.22, cy - s * 0.38);
      ctx.lineTo(cx + s * 0.42, cy);
      ctx.lineTo(cx - s * 0.22, cy + s * 0.38);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case "pause": {
      roundRectPath(ctx, cx - s * 0.3, cy - s * 0.34, s * 0.18, s * 0.68, s * 0.03);
      ctx.fill();
      roundRectPath(ctx, cx + s * 0.12, cy - s * 0.34, s * 0.18, s * 0.68, s * 0.03);
      ctx.fill();
      break;
    }

    case "prev": {
      ctx.fillRect(cx - s * 0.36, cy - s * 0.32, s * 0.12, s * 0.64);
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.32, cy - s * 0.36);
      ctx.lineTo(cx - s * 0.12, cy);
      ctx.lineTo(cx + s * 0.32, cy + s * 0.36);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case "next": {
      ctx.fillRect(cx + s * 0.24, cy - s * 0.32, s * 0.12, s * 0.64);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.32, cy - s * 0.36);
      ctx.lineTo(cx + s * 0.12, cy);
      ctx.lineTo(cx - s * 0.32, cy + s * 0.36);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case "shuffle": {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.42, cy + s * 0.27);
      ctx.lineTo(cx - s * 0.08, cy + s * 0.27);
      ctx.lineTo(cx + s * 0.25, cy - s * 0.27);
      ctx.lineTo(cx + s * 0.42, cy - s * 0.27);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + s * 0.27, cy - s * 0.34);
      ctx.lineTo(cx + s * 0.43, cy - s * 0.27);
      ctx.lineTo(cx + s * 0.27, cy - s * 0.2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - s * 0.42, cy - s * 0.27);
      ctx.lineTo(cx - s * 0.13, cy - s * 0.27);
      ctx.lineTo(cx + s * 0.06, cy - s * 0.08);
      ctx.stroke();
      break;
    }

    case "repeat": {
      const r = s * 0.28;
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI * 0.18, Math.PI * 0.82, false);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI * 1.18, Math.PI * 1.82, false);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + r * 0.72, cy + r * 0.52);
      ctx.lineTo(cx + r * 1.02, cy + r * 0.25);
      ctx.lineTo(cx + r * 0.45, cy + r * 0.2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - r * 0.72, cy - r * 0.52);
      ctx.lineTo(cx - r * 1.02, cy - r * 0.25);
      ctx.lineTo(cx - r * 0.45, cy - r * 0.2);
      ctx.stroke();
      break;
    }

    case "heart": {
      ctx.beginPath();
      ctx.moveTo(cx, cy + s * 0.34);
      ctx.bezierCurveTo(
        cx - s * 0.52,
        cy + s * 0.01,
        cx - s * 0.3,
        cy - s * 0.38,
        cx,
        cy - s * 0.16
      );
      ctx.bezierCurveTo(
        cx + s * 0.3,
        cy - s * 0.38,
        cx + s * 0.52,
        cy + s * 0.01,
        cx,
        cy + s * 0.34
      );
      if (filled) ctx.fill();
      else ctx.stroke();
      break;
    }

    case "home": {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.42, cy + s * 0.02);
      ctx.lineTo(cx, cy - s * 0.38);
      ctx.lineTo(cx + s * 0.42, cy + s * 0.02);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.28, cy - s * 0.02);
      ctx.lineTo(cx - s * 0.28, cy + s * 0.36);
      ctx.lineTo(cx + s * 0.28, cy + s * 0.36);
      ctx.lineTo(cx + s * 0.28, cy - s * 0.02);
      ctx.stroke();
      break;
    }

    case "search": {
      ctx.beginPath();
      ctx.arc(cx - s * 0.08, cy - s * 0.08, s * 0.27, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.12, cy + s * 0.12);
      ctx.lineTo(cx + s * 0.38, cy + s * 0.38);
      ctx.stroke();
      break;
    }

    case "library": {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.32, cy - s * 0.35);
      ctx.lineTo(cx - s * 0.32, cy + s * 0.35);
      ctx.moveTo(cx - s * 0.08, cy - s * 0.35);
      ctx.lineTo(cx + s * 0.28, cy + s * 0.35);
      ctx.moveTo(cx + s * 0.18, cy - s * 0.35);
      ctx.lineTo(cx + s * 0.18, cy + s * 0.35);
      ctx.stroke();
      break;
    }

    case "more": {
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(cx + i * s * 0.22, cy, s * 0.06, 0, TAU);
        ctx.fill();
      }
      break;
    }

    case "chevronLeft": {
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.16, cy - s * 0.34);
      ctx.lineTo(cx - s * 0.2, cy);
      ctx.lineTo(cx + s * 0.16, cy + s * 0.34);
      ctx.stroke();
      break;
    }

    case "chevronDown": {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.3, cy - s * 0.1);
      ctx.lineTo(cx, cy + s * 0.2);
      ctx.lineTo(cx + s * 0.3, cy - s * 0.1);
      ctx.stroke();
      break;
    }

    case "volume": {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.42, cy - s * 0.13);
      ctx.lineTo(cx - s * 0.22, cy - s * 0.13);
      ctx.lineTo(cx + s * 0.02, cy - s * 0.34);
      ctx.lineTo(cx + s * 0.02, cy + s * 0.34);
      ctx.lineTo(cx - s * 0.22, cy + s * 0.13);
      ctx.lineTo(cx - s * 0.42, cy + s * 0.13);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx + s * 0.04, cy, s * 0.24, -Math.PI * 0.25, Math.PI * 0.25);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + s * 0.04, cy, s * 0.4, -Math.PI * 0.28, Math.PI * 0.28);
      ctx.stroke();
      break;
    }

    default:
      break;
  }

  ctx.restore();
};

function drawAlbumCoverDesign(
  ctx: CanvasRenderingContext2D,
  kind: TrackKind,
  size: number
) {
  const s = size;

  if (kind === "blinding") {
    const bg = ctx.createLinearGradient(0, 0, s, s);
    bg.addColorStop(0, "#0a0204");
    bg.addColorStop(0.45, "#431019");
    bg.addColorStop(0.7, "#1b0308");
    bg.addColorStop(1, "#050004");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    const glow = ctx.createRadialGradient(
      s * 0.52,
      s * 0.55,
      s * 0.02,
      s * 0.52,
      s * 0.55,
      s * 0.62
    );
    glow.addColorStop(0, "rgba(255, 35, 55, 0.65)");
    glow.addColorStop(0.35, "rgba(148, 10, 22, 0.35)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, s, s);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 44; i++) {
      const y = s * (0.35 + i * 0.012) + Math.sin(i * 1.7) * s * 0.06;
      ctx.strokeStyle =
        i % 4 === 0
          ? "rgba(255,245,240,0.23)"
          : i % 3 === 0
            ? "rgba(255,38,64,0.25)"
            : "rgba(132,8,20,0.22)";
      ctx.lineWidth = 1 + rand(i + 5) * 3;
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, y);
      ctx.bezierCurveTo(
        s * 0.2,
        y - s * 0.2,
        s * 0.7,
        y + s * 0.22,
        s * 1.2,
        y - s * 0.04
      );
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.textAlign = "center";
    setFont(ctx, s * 0.038, 600);
    ctx.fillText("THE WEEKND", s / 2, s * 0.105);

    setFont(ctx, s * 0.086, 800);
    ctx.fillText("BLINDING", s / 2, s * 0.815);
    ctx.fillText("LIGHTS", s / 2, s * 0.9);

    setFont(ctx, s * 0.025, 500);
    ctx.fillStyle = "rgba(255,220,220,0.68)";
    ctx.fillText("AFTER HOURS", s / 2, s * 0.95);
  } else if (kind === "getlucky") {
    ctx.fillStyle = "#030303";
    ctx.fillRect(0, 0, s, s);

    const glow = ctx.createRadialGradient(
      s * 0.5,
      s * 0.45,
      s * 0.04,
      s * 0.5,
      s * 0.45,
      s * 0.55
    );
    glow.addColorStop(0, "rgba(238, 195, 92, 0.38)");
    glow.addColorStop(0.55, "rgba(96, 65, 13, 0.12)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, s, s);

    ctx.save();
    ctx.translate(s * 0.5, s * 0.45);
    const chrome = ctx.createLinearGradient(
      -s * 0.28,
      -s * 0.3,
      s * 0.28,
      s * 0.3
    );
    chrome.addColorStop(0, "#3d2e0b");
    chrome.addColorStop(0.22, "#f4d77d");
    chrome.addColorStop(0.42, "#fff2bc");
    chrome.addColorStop(0.64, "#9b7522");
    chrome.addColorStop(0.82, "#2b1b03");
    chrome.addColorStop(1, "#fce59a");

    ctx.fillStyle = chrome;
    roundRectPath(ctx, -s * 0.29, -s * 0.32, s * 0.58, s * 0.64, s * 0.18);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,240,180,0.55)";
    ctx.lineWidth = s * 0.012;
    roundRectPath(ctx, -s * 0.27, -s * 0.3, s * 0.54, s * 0.6, s * 0.16);
    ctx.stroke();

    ctx.fillStyle = "#030304";
    roundRectPath(ctx, -s * 0.23, -s * 0.11, s * 0.46, s * 0.14, s * 0.05);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    roundRectPath(ctx, -s * 0.21, -s * 0.09, s * 0.2, s * 0.025, s * 0.01);
    ctx.fill();

    ctx.strokeStyle = "rgba(20,15,5,0.8)";
    ctx.lineWidth = s * 0.012;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.18, s * 0.08 + i * s * 0.035);
      ctx.lineTo(s * 0.16, s * 0.08 + i * s * 0.035);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = "#f7e5a2";
    ctx.textAlign = "center";
    setFont(ctx, s * 0.045, 800);
    ctx.fillText("DAFT PUNK", s / 2, s * 0.105);

    setFont(ctx, s * 0.064, 800);
    ctx.fillText("GET LUCKY", s / 2, s * 0.83);

    setFont(ctx, s * 0.026, 500);
    ctx.fillStyle = "rgba(247,229,162,0.68)";
    ctx.fillText("RANDOM ACCESS MEMORIES", s / 2, s * 0.9);
  } else if (kind === "birds") {
    const bg = ctx.createLinearGradient(0, 0, 0, s);
    bg.addColorStop(0, "#041426");
    bg.addColorStop(0.45, "#0b2d4b");
    bg.addColorStop(0.76, "#0a1c33");
    bg.addColorStop(1, "#02050b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    const glow = ctx.createRadialGradient(
      s * 0.5,
      s * 0.42,
      s * 0.02,
      s * 0.5,
      s * 0.42,
      s * 0.55
    );
    glow.addColorStop(0, "rgba(88, 176, 255, 0.35)");
    glow.addColorStop(0.55, "rgba(25, 72, 130, 0.12)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, s, s);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 34; i++) {
      const x = s * (0.08 + rand(i + 91) * 0.84);
      const y = s * (0.12 + rand(i + 51) * 0.7);
      ctx.strokeStyle = `rgba(150,220,255,${0.04 + rand(i + 9) * 0.1})`;
      ctx.lineWidth = 1 + rand(i + 3) * 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(
        x + s * 0.07,
        y - s * 0.11,
        x + s * 0.18,
        y + s * 0.08,
        x + s * 0.24,
        y - s * 0.04
      );
      ctx.stroke();
    }
    ctx.restore();

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(240,248,255,0.92)";
    setFont(ctx, s * 0.036, 600);
    ctx.fillText("BILLIE EILISH", s / 2, s * 0.1);

    setFont(ctx, s * 0.06, 800);
    ctx.fillText("BIRDS OF", s / 2, s * 0.81);
    ctx.fillText("A FEATHER", s / 2, s * 0.88);

    setFont(ctx, s * 0.025, 500);
    ctx.fillStyle = "rgba(190,225,255,0.67)";
    ctx.fillText("HIT ME HARD AND SOFT", s / 2, s * 0.94);
  } else {
    ctx.fillStyle = "#050504";
    ctx.fillRect(0, 0, s, s);

    for (let i = 0; i < 2200; i++) {
      const x = rand(i * 1.7 + 10) * s;
      const y = rand(i * 2.3 + 20) * s;
      const a = 0.02 + rand(i * 0.4) * 0.07;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillRect(x, y, 1.3, 1.3);
    }

    const glow = ctx.createRadialGradient(
      s * 0.52,
      s * 0.48,
      s * 0.02,
      s * 0.52,
      s * 0.48,
      s * 0.58
    );
    glow.addColorStop(0, "rgba(255, 105, 44, 0.32)");
    glow.addColorStop(0.5, "rgba(104, 30, 9, 0.12)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, s, s);

    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(255,108,45,${0.12 + i * 0.04})`;
      ctx.lineWidth = s * 0.006;
      ctx.beginPath();
      ctx.arc(s * 0.5, s * 0.48, s * (0.1 + i * 0.065), 0, TAU);
      ctx.stroke();
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    setFont(ctx, s * 0.035, 600);
    ctx.fillText("TRAVIS SCOTT", s / 2, s * 0.1);

    setFont(ctx, s * 0.095, 800);
    ctx.fillText("UTOPIA", s / 2, s * 0.79);

    setFont(ctx, s * 0.12, 800);
    ctx.fillStyle = "rgba(255,106,42,0.9)";
    ctx.fillText("FE!N", s / 2, s * 0.9);
  }

  vignette(ctx, s, s, 0.46);
  grain(ctx, s, s, 0.045, kind === "fein" ? 33 : 17);
}

function drawPlaylistCoverDesign(
  ctx: CanvasRenderingContext2D,
  kind: PlaylistKind,
  size: number
) {
  const s = size;

  if (kind === "today") {
    const bg = ctx.createLinearGradient(0, s, s, 0);
    bg.addColorStop(0, "#07150d");
    bg.addColorStop(0.45, "#0f6e32");
    bg.addColorStop(0.75, "#1DB954");
    bg.addColorStop(1, "#d7ffe3");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.04 + i * 0.025})`;
      ctx.beginPath();
      ctx.arc(s * (0.25 + i * 0.15), s * (0.2 + (i % 3) * 0.2), s * (0.18 + i * 0.03), 0, TAU);
      ctx.fill();
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#050705";
    setFont(ctx, s * 0.055, 800);
    ctx.fillText("TODAY'S", s / 2, s * 0.72);
    ctx.fillStyle = "#F7F9F7";
    setFont(ctx, s * 0.115, 900);
    ctx.fillText("TOP HITS", s / 2, s * 0.88);
  } else if (kind === "rapcaviar") {
    ctx.fillStyle = "#080202";
    ctx.fillRect(0, 0, s, s);

    const g = ctx.createRadialGradient(
      s * 0.52,
      s * 0.5,
      s * 0.03,
      s * 0.52,
      s * 0.5,
      s * 0.66
    );
    g.addColorStop(0, "rgba(236, 41, 57, 0.52)");
    g.addColorStop(0.48, "rgba(106, 6, 12, 0.2)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);

    for (let i = 0; i < 32; i++) {
      const a = i * 0.84;
      const r = s * (0.12 + (i % 6) * 0.055);
      ctx.strokeStyle = `rgba(232,194,100,${0.24 - (i % 7) * 0.015})`;
      ctx.lineWidth = s * 0.008;
      ctx.beginPath();
      ctx.arc(s * 0.5, s * 0.48, r, a, a + 1.6);
      ctx.stroke();
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#f2d37c";
    setFont(ctx, s * 0.075, 900);
    ctx.fillText("RAP", s / 2, s * 0.52);
    ctx.fillStyle = "#f7f9f7";
    ctx.fillText("CAVIAR", s / 2, s * 0.64);
  } else if (kind === "mint") {
    const bg = ctx.createLinearGradient(0, 0, s, s);
    bg.addColorStop(0, "#e9fff6");
    bg.addColorStop(0.5, "#baffde");
    bg.addColorStop(1, "#61dfab");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    ctx.strokeStyle = "rgba(3,57,36,0.65)";
    ctx.lineWidth = s * 0.018;
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const x = (i / 80) * s;
      const y =
        s * 0.6 +
        Math.sin(i * 0.22) * s * 0.075 +
        Math.sin(i * 0.07) * s * 0.06;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = "#062b1c";
    ctx.textAlign = "center";
    setFont(ctx, s * 0.18, 800);
    ctx.fillText("mint", s / 2, s * 0.82);
  } else if (kind === "discover") {
    const bg = ctx.createLinearGradient(0, 0, s, s);
    bg.addColorStop(0, "#080818");
    bg.addColorStop(0.35, "#2b1766");
    bg.addColorStop(0.72, "#135b63");
    bg.addColorStop(1, "#07150d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 90; i++) {
      const x = rand(i * 2.2 + 5) * s;
      const y = rand(i * 1.6 + 7) * s;
      const r = 0.6 + rand(i + 4) * 2.2;
      ctx.fillStyle = `rgba(210,200,255,${0.12 + rand(i + 9) * 0.38})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = `rgba(164,140,255,${0.12 - i * 0.012})`;
      ctx.lineWidth = s * 0.01;
      ctx.beginPath();
      ctx.arc(s * 0.5, s * 0.48, s * (0.08 + i * 0.055), 0, TAU);
      ctx.stroke();
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#F7F9F7";
    setFont(ctx, s * 0.052, 700);
    ctx.fillText("DISCOVER", s / 2, s * 0.75);
    setFont(ctx, s * 0.086, 800);
    ctx.fillText("WEEKLY", s / 2, s * 0.86);
  } else {
    const bg = ctx.createRadialGradient(
      s * 0.5,
      s * 0.5,
      s * 0.02,
      s * 0.5,
      s * 0.5,
      s * 0.7
    );
    bg.addColorStop(0, "#67ffd5");
    bg.addColorStop(0.35, "#1DB954");
    bg.addColorStop(0.72, "#073f25");
    bg.addColorStop(1, "#020604");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    ctx.strokeStyle = "rgba(247,249,247,0.35)";
    for (let i = 0; i < 8; i++) {
      ctx.lineWidth = s * 0.006;
      ctx.beginPath();
      ctx.arc(s * 0.5, s * 0.5, s * (0.08 + i * 0.06), 0, TAU);
      ctx.stroke();
    }

    ctx.strokeStyle = "#F7F9F7";
    ctx.lineWidth = s * 0.012;
    ctx.beginPath();
    ctx.moveTo(s * 0.5, s * 0.5);
    ctx.lineTo(s * 0.68, s * 0.27);
    ctx.stroke();

    ctx.fillStyle = "#F7F9F7";
    ctx.textAlign = "center";
    setFont(ctx, s * 0.058, 800);
    ctx.fillText("RELEASE", s / 2, s * 0.74);
    ctx.fillText("RADAR", s / 2, s * 0.82);
  }

  vignette(ctx, s, s, 0.38);
  grain(ctx, s, s, 0.04, kind === "mint" ? 41 : 29);
}

export const drawCover = (
  ctx: CanvasRenderingContext2D,
  kind: TrackKind | PlaylistKind,
  x: number,
  y: number,
  size: number,
  playlist = false
) => {
  ctx.save();
  roundRectPath(ctx, x, y, size, size, size * 0.045);
  ctx.clip();
  ctx.translate(x, y);

  if (playlist) {
    drawPlaylistCoverDesign(ctx, kind as PlaylistKind, size);
  } else {
    drawAlbumCoverDesign(ctx, kind as TrackKind, size);
  }

  ctx.restore();
};

export const useCanvasTexture = (
  key: string,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
) => {
  const texture = useMemo(() => {
    const canvas = makeCanvas(width, height);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not create 2D canvas context");
    }

    draw(ctx, width, height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, width, height]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return texture;
};

function drawAlbumCardTexture(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  kind: TrackKind
) {
  ctx.clearRect(0, 0, w, h);

  roundRectPath(ctx, 0, 0, w, h, 64);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0d1711");
  bg.addColorStop(0.55, "#07100b");
  bg.addColorStop(1, "#040604");
  ctx.fillStyle = bg;
  ctx.fill();

  ctx.save();
  roundRectPath(ctx, 0, 0, w, h, 64);
  ctx.clip();

  const pad = 56;
  const art = w - pad * 2;
  const meta = TRACKS[kind];

  drawCover(ctx, kind, pad, pad, art, false);

  ctx.strokeStyle = "rgba(29,185,84,0.35)";
  ctx.lineWidth = 3;
  roundRectPath(ctx, pad, pad, art, art, 28);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#F7F9F7";
  fitFont(ctx, meta.title, w - pad * 2 - 120, 58, 800, 34);
  ctx.fillText(meta.title, pad, pad + art + 88);

  ctx.fillStyle = "rgba(247,249,247,0.62)";
  setFont(ctx, 34, 500);
  ctx.fillText(meta.artist, pad, pad + art + 142);

  ctx.fillStyle = "rgba(247,249,247,0.36)";
  setFont(ctx, 26, 500);
  ctx.fillText(meta.album, pad, pad + art + 186);

  ctx.fillStyle = "#1DB954";
  ctx.beginPath();
  ctx.arc(w - pad - 40, h - 78, 40, 0, TAU);
  ctx.fill();
  drawIcon(ctx, "play", w - pad - 40, h - 78, 42, "#050705");

  ctx.fillStyle = "rgba(247,249,247,0.1)";
  ctx.fillRect(pad, h - 38, w - pad * 2, 2);

  ctx.restore();
}

function drawPlaylistCardTexture(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  kind: PlaylistKind
) {
  ctx.clearRect(0, 0, w, h);

  roundRectPath(ctx, 0, 0, w, h, 64);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0d1711");
  bg.addColorStop(0.55, "#07100b");
  bg.addColorStop(1, "#040604");
  ctx.fillStyle = bg;
  ctx.fill();

  ctx.save();
  roundRectPath(ctx, 0, 0, w, h, 64);
  ctx.clip();

  const pad = 56;
  const art = w - pad * 2;
  const meta = PLAYLISTS[kind];

  drawCover(ctx, kind, pad, pad, art, true);

  ctx.strokeStyle = "rgba(29,185,84,0.38)";
  ctx.lineWidth = 3;
  roundRectPath(ctx, pad, pad, art, art, 28);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#F7F9F7";
  fitFont(ctx, meta.title, w - pad * 2, 58, 800, 32);
  ctx.fillText(meta.title, pad, pad + art + 88);

  ctx.fillStyle = "rgba(247,249,247,0.56)";
  fitFont(ctx, meta.subtitle, w - pad * 2, 29, 500, 22);
  ctx.fillText(meta.subtitle, pad, pad + art + 142);

  ctx.fillStyle = "#1DB954";
  ctx.beginPath();
  ctx.arc(w - pad - 40, h - 78, 40, 0, TAU);
  ctx.fill();
  drawIcon(ctx, "play", w - pad - 40, h - 78, 42, "#050705");

  ctx.restore();
}

export const useCoverTexture = (kind: TrackKind) => {
  return useCanvasTexture(`cover-${kind}`, 1024, 1024, (ctx, w) => {
    drawCover(ctx, kind, 0, 0, w, false);
  });
};

export const useAlbumCardTexture = (kind: TrackKind) => {
  return useCanvasTexture(`album-card-${kind}`, 1024, 1440, (ctx, w, h) => {
    drawAlbumCardTexture(ctx, w, h, kind);
  });
};

export const usePlaylistCardTexture = (kind: PlaylistKind) => {
  return useCanvasTexture(
    `playlist-card-${kind}`,
    1024,
    1440,
    (ctx, w, h) => {
      drawPlaylistCardTexture(ctx, w, h, kind);
    }
  );
};

function drawStatusBar(ctx: CanvasRenderingContext2D, w: number) {
  ctx.fillStyle = "#F7F9F7";
  ctx.textAlign = "left";
  setFont(ctx, 30, 600);
  ctx.fillText("9:41", 52, 58);

  const right = w - 52;

  // signal bars
  for (let i = 0; i < 4; i++) {
    const bh = 8 + i * 5;
    ctx.fillStyle = "rgba(247,249,247,0.9)";
    ctx.fillRect(right - 136 + i * 10, 44 - bh, 6, bh);
  }

  // wifi
  ctx.strokeStyle = "rgba(247,249,247,0.9)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(right - 70, 44, 14, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(right - 70, 47, 7, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // battery
  ctx.strokeStyle = "rgba(247,249,247,0.9)";
  ctx.lineWidth = 3;
  roundRectPath(ctx, right - 40, 28, 28, 14, 4);
  ctx.stroke();
  ctx.fillStyle = "rgba(247,249,247,0.9)";
  roundRectPath(ctx, right - 36, 31, 19, 8, 2);
  ctx.fill();
  ctx.fillRect(right - 10, 32, 3, 6);
}

function drawBottomNav(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "rgba(3,6,4,0.65)";
  ctx.fillRect(0, h - 190, w, 190);

  const y = h - 112;
  const items: Array<[string, string]> = [
    ["home", "Home"],
    ["search", "Search"],
    ["library", "Your Library"],
  ];

  items.forEach(([icon, label], i) => {
    const x = w * (0.2 + i * 0.3);
    drawIcon(ctx, icon, x, y - 12, 40, i === 0 ? "#F7F9F7" : "#8e9a91");
    ctx.fillStyle = i === 0 ? "#F7F9F7" : "#8e9a91";
    ctx.textAlign = "center";
    setFont(ctx, 22, i === 0 ? 700 : 500);
    ctx.fillText(label, x, y + 46);
  });
}

function drawNowPlayingPhone(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  kind: "blinding" | "getlucky"
) {
  const track = TRACKS[kind];

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0c1d13");
  bg.addColorStop(0.38, "#07110b");
  bg.addColorStop(1, "#030504");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(
    w * 0.5,
    h * 0.35,
    w * 0.02,
    w * 0.5,
    h * 0.35,
    w * 0.8
  );
  glow.addColorStop(0, "rgba(29,185,84,0.18)");
  glow.addColorStop(1, "rgba(29,185,84,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  drawStatusBar(ctx, w);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(247,249,247,0.7)";
  setFont(ctx, 24, 600);
  ctx.fillText("NOW PLAYING", w / 2, 150);

  drawIcon(ctx, "chevronDown", w / 2, 72, 34, "rgba(247,249,247,0.9)");

  drawIcon(ctx, "more", 960, 150, 38, "#F7F9F7");
  drawIcon(ctx, "chevronLeft", 150, 150, 38, "#F7F9F7");

  const artX = 90;
  const artY = 270;
  const artSize = 900;

  drawCover(ctx, kind, artX, artY, artSize, false);

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  roundRectPath(ctx, artX, artY, artSize, artSize, 34);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#F7F9F7";
  fitFont(ctx, track.title, 880, 58, 800, 38);
  ctx.fillText(track.title, 90, 1310);

  ctx.fillStyle = "rgba(247,249,247,0.58)";
  setFont(ctx, 38, 500);
  ctx.fillText(track.artist, 90, 1372);

  drawIcon(ctx, "heart", 940, 1260, 52, track.accent, true);

  const progress = 0.58;
  const barX = 90;
  const barY = 1470;
  const barW = 900;

  ctx.fillStyle = "rgba(247,249,247,0.2)";
  roundRectPath(ctx, barX, barY, barW, 8, 4);
  ctx.fill();

  ctx.fillStyle = "#1DB954";
  roundRectPath(ctx, barX, barY, barW * progress, 8, 4);
  ctx.fill();

  ctx.fillStyle = "#F7F9F7";
  ctx.beginPath();
  ctx.arc(barX + barW * progress, barY + 4, 9, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "rgba(247,249,247,0.48)";
  setFont(ctx, 24, 500);
  ctx.fillText(track.elapsed, barX, barY + 46);
  ctx.textAlign = "right";
  ctx.fillText(track.duration, barX + barW, barY + 46);

  drawIcon(ctx, "shuffle", 180, 1750, 50, "rgba(247,249,247,0.6)");
  drawIcon(ctx, "prev", 360, 1750, 62, "#F7F9F7");

  ctx.fillStyle = "#1DB954";
  ctx.beginPath();
  ctx.arc(540, 1750, 76, 0, TAU);
  ctx.fill();
  drawIcon(ctx, "pause", 540, 1750, 62, "#050705");

  drawIcon(ctx, "next", 720, 1750, 62, "#F7F9F7");
  drawIcon(ctx, "repeat", 900, 1750, 50, "rgba(247,249,247,0.6)");

  drawIcon(ctx, "volume", 142, 1905, 40, "rgba(247,249,247,0.58)");

  ctx.fillStyle = "rgba(247,249,247,0.18)";
  roundRectPath(ctx, 190, 1899, 700, 8, 4);
  ctx.fill();

  ctx.fillStyle = "rgba(247,249,247,0.56)";
  roundRectPath(ctx, 190, 1899, 410, 8, 4);
  ctx.fill();

  drawBottomNav(ctx, w, h);
}

function drawPhoneIntro(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const bg = ctx.createRadialGradient(
    w * 0.5,
    h * 0.44,
    w * 0.01,
    w * 0.5,
    h * 0.44,
    w * 0.9
  );
  bg.addColorStop(0, "#0a2415");
  bg.addColorStop(0.35, "#041008");
  bg.addColorStop(1, "#010201");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 22; i++) {
    ctx.strokeStyle = "#1DB954";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.44, i * 42, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  grain(ctx, w, h, 0.06, 13);
}

function drawHomeScreen(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0c1a12");
  bg.addColorStop(0.35, "#07100b");
  bg.addColorStop(1, "#030504");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  drawStatusBar(ctx, w);

  ctx.textAlign = "left";
  ctx.fillStyle = "#F7F9F7";
  setFont(ctx, 62, 800);
  ctx.fillText("Good evening", 60, 178);

  ctx.fillStyle = "rgba(247,249,247,0.56)";
  setFont(ctx, 26, 500);
  ctx.fillText("Pick up where you left off", 60, 220);

  const pad = 60;
  const gap = 26;
  const tile = (w - pad * 2 - gap) / 2;
  const startY = 272;

  const grid: Array<{
    kind: TrackKind | PlaylistKind;
    playlist: boolean;
    title: string;
    sub: string;
  }> = [
    {
      kind: "blinding",
      playlist: false,
      title: "Blinding Lights",
      sub: "The Weeknd",
    },
    {
      kind: "today",
      playlist: true,
      title: "Today's Top Hits",
      sub: "Playlist",
    },
    {
      kind: "rapcaviar",
      playlist: true,
      title: "RapCaviar",
      sub: "Playlist",
    },
    {
      kind: "getlucky",
      playlist: false,
      title: "Get Lucky",
      sub: "Daft Punk",
    },
  ];

  grid.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = pad + col * (tile + gap);
    const y = startY + row * (tile + 132);

    ctx.fillStyle = "rgba(255,255,255,0.055)";
    roundRectPath(ctx, x, y, tile, tile, 30);
    ctx.fill();

    drawCover(ctx, item.kind, x, y, tile, item.playlist);

    ctx.fillStyle = "#F7F9F7";
    fitFont(ctx, item.title, tile - 24, 30, 700, 20);
    ctx.fillText(item.title, x + 4, y + tile + 44);

    ctx.fillStyle = "rgba(247,249,247,0.5)";
    setFont(ctx, 24, 500);
    ctx.fillText(item.sub, x + 4, y + tile + 80);
  });

  ctx.fillStyle = "#F7F9F7";
  setFont(ctx, 42, 800);
  ctx.fillText("Made for you", 60, 1550);

  const mini = 286;
  const miniGap = 24;
  const miniY = 1600;

  const row: Array<{
    kind: PlaylistKind | TrackKind;
    playlist: boolean;
    title: string;
  }> = [
    { kind: "discover", playlist: true, title: "Discover Weekly" },
    { kind: "mint", playlist: true, title: "mint" },
    { kind: "birds", playlist: false, title: "BIRDS OF A FEATHER" },
  ];

  row.forEach((item, i) => {
    const x = 60 + i * (mini + miniGap);

    drawCover(ctx, item.kind, x, miniY, mini, item.playlist);

    ctx.fillStyle = "#F7F9F7";
    fitFont(ctx, item.title, mini, 25, 700, 18);
    ctx.fillText(item.title, x, miniY + mini + 38);
  });

  drawIcon(ctx, "more", w - 70, 160, 40, "#F7F9F7");

  drawBottomNav(ctx, w, h);
}

export const usePhoneTextures = (): Record<ScreenKind, THREE.Texture> => {
  const intro = useCanvasTexture("phone-intro", 1080, 2340, (ctx, w, h) => {
    drawPhoneIntro(ctx, w, h);
  });

  const blinding = useCanvasTexture(
    "phone-now-playing-blinding",
    1080,
    2340,
    (ctx, w, h) => {
      drawNowPlayingPhone(ctx, w, h, "blinding");
    }
  );

  const getlucky = useCanvasTexture(
    "phone-now-playing-getlucky",
    1080,
    2340,
    (ctx, w, h) => {
      drawNowPlayingPhone(ctx, w, h, "getlucky");
    }
  );

  const home = useCanvasTexture("phone-home", 1080, 2340, (ctx, w, h) => {
    drawHomeScreen(ctx, w, h);
  });

  return { intro, blinding, getlucky, home };
};

function drawNowPlayingOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  kind: "getlucky" | "blinding"
) {
  const track = TRACKS[kind];

  ctx.clearRect(0, 0, w, h);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(247,249,247,0.62)";
  setFont(ctx, 42, 600);
  ctx.fillText("NOW PLAYING", w / 2, 94);

  drawIcon(ctx, "chevronDown", w / 2, 162, 34, "rgba(247,249,247,0.75)");

  ctx.fillStyle = "#F7F9F7";
  ctx.textAlign = "left";
  fitFont(ctx, track.title, 1000, 84, 800, 48);
  ctx.fillText(track.title, 128, 1290);

  ctx.fillStyle = "rgba(247,249,247,0.56)";
  setFont(ctx, 46, 500);
  ctx.fillText(track.artist, 128, 1362);

  ctx.fillStyle = "rgba(247,249,247,0.44)";
  setFont(ctx, 30, 500);
  ctx.fillText(track.elapsed, 128, 1460);

  ctx.textAlign = "right";
  ctx.fillText(track.duration, w - 128, 1460);

  drawIcon(ctx, "shuffle", 430, 1740, 58, "rgba(247,249,247,0.55)");
  drawIcon(ctx, "prev", 630, 1740, 72, "#F7F9F7");
  drawIcon(ctx, "next", 906, 1740, 72, "#F7F9F7");
  drawIcon(ctx, "repeat", 1108, 1740, 58, "rgba(247,249,247,0.55)");

  drawIcon(ctx, "heart", 220, 1900, 56, track.accent, true);
  drawIcon(ctx, "more", w - 220, 1900, 56, "#F7F9F7");

  drawIcon(ctx, "volume", 170, 1992, 48, "rgba(247,249,247,0.58)");

  ctx.fillStyle = "rgba(247,249,247,0.18)";
  roundRectPath(ctx, 250, 1985, 980, 9, 4.5);
  ctx.fill();

  ctx.fillStyle = "rgba(247,249,247,0.58)";
  roundRectPath(ctx, 250, 1985, 600, 9, 4.5);
  ctx.fill();

  ctx.fillStyle = "#F7F9F7";
  ctx.beginPath();
  ctx.arc(850, 1989.5, 11, 0, TAU);
  ctx.fill();
}

export const useNowPlayingOverlayTexture = (
  kind: "getlucky" | "blinding" = "getlucky"
) => {
  return useCanvasTexture(
    `now-playing-overlay-${kind}`,
    1536,
    2048,
    (ctx, w, h) => {
      drawNowPlayingOverlay(ctx, w, h, kind);
    }
  );
};

export const useSpotifyLogoTexture = () => {
  return useCanvasTexture("spotify-logo", 1024, 1024, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    drawSpotifyMark(ctx, w / 2, h / 2, w * 0.45, "#1DB954", "#050705", true);
  });
};
