// Spotify interface drawn as crisp canvas vector UI (logical 390pt width, scaled up).
import {FONT} from '../assets/fonts';
import {drawIcon, drawSpotifyMark, IconName} from '../assets/icons';
import {HEROES, PLAYLISTS, GREEN, BLACK, WHITE, Hero} from '../assets/content';
import {heroArt, playlistArt} from '../assets/art';

type Ctx = CanvasRenderingContext2D;
export const UI_W = 1224, UI_H = 2736;
export const LW = 390; // logical width
export const LH = (UI_H / UI_W) * LW; // ≈ 871.7

const artCache = new Map<string, HTMLCanvasElement>();
export const getHeroArt = (k: Hero['key'], s = 768) => { const id = `h${k}${s}`; if (!artCache.has(id)) artCache.set(id, heroArt(k, s)); return artCache.get(id)!; };
export const getPlArt = (k: string, s = 768) => { const id = `p${k}${s}`; if (!artCache.has(id)) artCache.set(id, playlistArt(k, s)); return artCache.get(id)!; };

export function rr(g: Ctx, x: number, y: number, w: number, h: number, r: number) { g.beginPath(); g.roundRect(x, y, w, h, r); }
export function txt(g: Ctx, s: string, x: number, y: number, size: number, weight: number, color: string, align: CanvasTextAlign = 'left', maxW?: number) {
  g.font = `${weight} ${size}px ${FONT}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic';
  if (maxW) { let t = s; while (g.measureText(t).width > maxW && t.length > 1) t = t.slice(0, -1); if (t !== s) t = t.trimEnd() + '…'; g.fillText(t, x, y); } else g.fillText(s, x, y);
}
function img(g: Ctx, c: CanvasImageSource, x: number, y: number, w: number, h: number, r: number) {
  g.save(); rr(g, x, y, w, h, r); g.clip(); g.drawImage(c, x, y, w, h); g.restore();
}
function statusBar(g: Ctx, light = true) {
  const c = light ? '#fff' : '#000';
  txt(g, '9:41', 36, 31, 15.5, 700, c, 'center');
  g.fillStyle = '#000'; rr(g, LW / 2 - 56, 11, 112, 33, 16.5); g.fill();
  // signal / wifi / battery
  for (let i = 0; i < 4; i++) { g.fillStyle = c; rr(g, 296 + i * 5, 27 - i * 2.4, 3.2, 4 + i * 2.4, 1); g.fill(); }
  g.strokeStyle = c; g.lineWidth = 1.2; g.globalAlpha = 0.55; rr(g, 340, 20, 25, 12, 3.6); g.stroke(); g.globalAlpha = 1;
  g.fillStyle = c; rr(g, 341.8, 21.8, 19, 8.4, 2); g.fill(); g.globalAlpha = 0.55; rr(g, 366, 24, 1.8, 4.4, 1); g.fill(); g.globalAlpha = 1;
}
function bottomNav(g: Ctx, active: 'home' | 'search' | 'library') {
  const y0 = LH - 92;
  const gr = g.createLinearGradient(0, y0 - 30, 0, y0 + 14); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.94)');
  g.fillStyle = gr; g.fillRect(0, y0 - 30, LW, LH - y0 + 30);
  g.fillStyle = 'rgba(0,0,0,.94)'; g.fillRect(0, y0 + 14, LW, LH);
  const items: [IconName, string, number, string][] = [['home', 'Home', 52, 'home'], ['search', 'Search', 146, 'search'], ['library', 'Your Library', 240, 'library']];
  items.forEach(([ic, label, cx, id]) => {
    const on = id === active; const col = on ? '#fff' : 'rgba(255,255,255,.6)';
    drawIcon(g, on && ic === 'home' ? 'home' : ic === 'home' ? 'homeO' : ic, cx - 13, y0 + 22, 26, col, 2.1);
    txt(g, label, cx, y0 + 62, 10.5, on ? 700 : 500, col, 'center');
  });
  drawIcon(g, 'plus', 316 - 13, y0 + 22, 26, 'rgba(255,255,255,.6)');
  txt(g, 'Create', 330, y0 + 62, 10.5, 500, 'rgba(255,255,255,.6)', 'center');
  g.fillStyle = 'rgba(255,255,255,.9)'; rr(g, LW / 2 - 67, LH - 11, 134, 5, 2.5); g.fill();
}
function miniPlayer(g: Ctx, y: number, hero: Hero, progress: number) {
  g.fillStyle = '#4a1a22'; rr(g, 8, y, LW - 16, 56, 7); g.fill();
  const tint = g.createLinearGradient(8, 0, LW, 0); tint.addColorStop(0, hero.accent + 'aa'); tint.addColorStop(1, hero.accent + '55'); g.fillStyle = tint; rr(g, 8, y, LW - 16, 56, 7); g.fill();
  img(g, getHeroArt(hero.key, 256), 16, y + 7, 42, 42, 4);
  txt(g, hero.track, 68, y + 25, 13.5, 700, '#fff', 'left', 190); txt(g, hero.artist, 68, y + 43, 12, 500, 'rgba(255,255,255,.75)');
  drawIcon(g, 'device', 248, y + 16, 24, 'rgba(255,255,255,.9)', 1.6); drawIcon(g, 'play', 300, y + 14, 28, '#fff');
  g.fillStyle = 'rgba(255,255,255,.28)'; rr(g, 16, y + 51, LW - 32, 2, 1); g.fill(); g.fillStyle = '#fff'; rr(g, 16, y + 51, (LW - 32) * progress, 2, 1); g.fill();
}

export function drawHome(g: Ctx, o: {scroll?: number} = {}) {
  g.save(); g.scale(UI_W / LW, UI_W / LW);
  const bg = g.createLinearGradient(0, 0, 0, 360); bg.addColorStop(0, '#16382a'); bg.addColorStop(1, '#0a0a0a');
  g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, LW, LH); g.fillStyle = bg; g.fillRect(0, 0, LW, 360);
  statusBar(g);
  // avatar + chips
  g.fillStyle = '#7a5af8'; g.beginPath(); g.arc(34, 76, 17, 0, 7); g.fill(); txt(g, 'M', 34, 82, 16, 800, '#fff', 'center');
  [['All', 44, true], ['Music', 64, false], ['Podcasts', 86, false]].forEach(([l, w, on], i) => {
    const x = [62, 114, 186][i]; g.fillStyle = on ? GREEN : 'rgba(255,255,255,.12)'; rr(g, x, 58, w as number, 34, 17); g.fill(); txt(g, l as string, x + (w as number) / 2, 80, 13.5, 600, on ? '#000' : '#fff', 'center');
  });
  // recents grid
  const tiles: [string, () => HTMLCanvasElement][] = [
    ['Blinding Lights', () => getHeroArt('weeknd', 192)], ["Today's Top Hits", () => getPlArt('top', 192)], ['Get Lucky', () => getHeroArt('daft', 192)], ['RapCaviar', () => getPlArt('rap', 192)],
    ['Discover Weekly', () => getPlArt('discover', 192)], ['BIRDS OF A FEATHER', () => getHeroArt('billie', 192)],
  ];
  tiles.forEach(([t, a], i) => {
    const x = 12 + (i % 2) * 190, y = 108 + Math.floor(i / 2) * 60;
    g.fillStyle = 'rgba(255,255,255,.1)'; rr(g, x, y, 178, 52, 5); g.fill(); img(g, a(), x, y, 52, 52, 5); txt(g, t, x + 62, y + 31, 12.5, 700, '#fff', 'left', 108);
  });
  txt(g, 'Made for you', 16, 318, 22, 800, '#fff');
  const row: [string, string, () => HTMLCanvasElement][] = [['Discover Weekly', 'Your weekly mixtape', () => getPlArt('discover')], ['Release Radar', 'Catch all the latest', () => getPlArt('radar')], ['mint', 'Dance & electronic', () => getPlArt('mint')]];
  row.forEach(([t, d, a], i) => { const x = 16 + i * 124; img(g, a(), x, 334, 112, 112, 6); txt(g, t, x, 466, 13, 700, '#fff', 'left', 108); txt(g, d, x, 482, 12, 500, 'rgba(255,255,255,.62)', 'left', 108); });
  txt(g, 'Popular albums', 16, 522, 22, 800, '#fff');
  (['weeknd', 'daft', 'billie', 'travis'] as const).forEach((k, i) => { const x = 16 + i * 116; if (i < 3) { img(g, getHeroArt(k), x, 538, 96, 96, 6); txt(g, HEROES[k].album, x, 652, 12.5, 700, '#fff', 'left', 104); txt(g, HEROES[k].artist, x, 667, 12, 500, 'rgba(255,255,255,.62)', 'left', 104); } });
  miniPlayer(g, LH - 160, HEROES.weeknd, 0.42);
  bottomNav(g, 'home');
  g.restore();
}

export type NPParts = {bg?: boolean; header?: boolean; art?: boolean; artHole?: boolean; title?: boolean; progress?: boolean; controls?: boolean; play?: boolean; volume?: boolean; status?: boolean};
export type NPOpts = {hero: Hero; progress: number; playing?: boolean; liked?: boolean; parts?: NPParts};
/** Now Playing, drawable in separable depth layers (parts) so the 3D scene can float them apart. */
export function drawNowPlaying(g: Ctx, o: NPOpts) {
  const {hero, progress} = o;
  const P: Required<NPParts> = {bg: true, header: true, art: true, artHole: false, title: true, progress: true, controls: true, play: true, volume: true, status: true, ...o.parts};
  g.save(); g.scale(UI_W / LW, UI_W / LW);
  if (P.bg) {
    g.fillStyle = BLACK; g.fillRect(0, 0, LW, LH);
    const bg = g.createLinearGradient(0, 0, 0, LH * 0.85); bg.addColorStop(0, hero.accent); bg.addColorStop(0.55, hero.accent + '44'); bg.addColorStop(1, '#00000000');
    g.globalAlpha = 0.85; g.fillStyle = bg; g.fillRect(0, 0, LW, LH); g.globalAlpha = 1;
    const dim = g.createLinearGradient(0, 0, 0, LH); dim.addColorStop(0, 'rgba(0,0,0,.35)'); dim.addColorStop(0.6, 'rgba(0,0,0,.55)'); dim.addColorStop(1, 'rgba(0,0,0,.92)'); g.fillStyle = dim; g.fillRect(0, 0, LW, LH);
  }
  if (P.status) statusBar(g);
  if (P.header) {
    drawIcon(g, 'chevDown', 18, 64, 26, '#fff', 2.2);
    txt(g, 'PLAYING FROM PLAYLIST', LW / 2, 72, 10, 700, 'rgba(255,255,255,.75)', 'center'); txt(g, "Today's Top Hits", LW / 2, 88, 13, 700, '#fff', 'center');
    drawIcon(g, 'more', 346, 64, 26, '#fff');
  }
  const ax = 24, ay = 128, as = LW - 48;
  if (P.art) {
    g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 32; g.shadowOffsetY = 14; g.fillStyle = '#000'; rr(g, ax, ay, as, as, 8); g.fill(); g.restore();
    img(g, getHeroArt(hero.key), ax, ay, as, as, 8);
  }
  if (P.artHole) { g.fillStyle = 'rgba(0,0,0,.6)'; rr(g, ax, ay, as, as, 8); g.fill(); g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1; rr(g, ax + .5, ay + .5, as - 1, as - 1, 8); g.stroke(); }
  const ty = ay + as + 50;
  if (P.title) {
    txt(g, hero.track, 24, ty, 24, 800, '#fff', 'left', 290); txt(g, hero.artist, 24, ty + 26, 16, 500, 'rgba(255,255,255,.72)');
    drawIcon(g, 'heart', 330, ty - 14, 30, o.liked === false ? 'rgba(255,255,255,.7)' : GREEN);
  }
  const by = ty + 64;
  if (P.progress) {
    g.fillStyle = 'rgba(255,255,255,.28)'; rr(g, 24, by, 342, 5, 2.5); g.fill();
    g.fillStyle = '#fff'; rr(g, 24, by, Math.max(5, 342 * progress), 5, 2.5); g.fill();
    g.beginPath(); g.arc(24 + 342 * progress, by + 2.5, 7, 0, 7); g.fill();
    const total = hero.dur.split(':').map(Number), secs = total[0] * 60 + total[1], cur = Math.floor(secs * progress);
    txt(g, `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, '0')}`, 24, by + 26, 11.5, 500, 'rgba(255,255,255,.7)'); txt(g, `-${Math.floor((secs - cur) / 60)}:${String((secs - cur) % 60).padStart(2, '0')}`, 366, by + 26, 11.5, 500, 'rgba(255,255,255,.7)', 'right');
  }
  const cy = by + 78;
  if (P.controls) { drawIcon(g, 'shuffle', 24, cy - 13, 26, GREEN, 2); drawIcon(g, 'prev', 100, cy - 16, 32, '#fff'); drawIcon(g, 'next', 258, cy - 16, 32, '#fff'); drawIcon(g, 'repeat', 340, cy - 13, 26, 'rgba(255,255,255,.75)', 2); }
  if (P.play) { g.fillStyle = '#fff'; g.beginPath(); g.arc(LW / 2, cy, 33, 0, 7); g.fill(); drawIcon(g, o.playing ? 'pause' : 'play', LW / 2 - 15, cy - 15, 30, '#000'); }
  const vy = cy + 62;
  if (P.volume) {
    drawIcon(g, 'volume', 24, vy - 12, 24, 'rgba(255,255,255,.85)', 1.8);
    g.fillStyle = 'rgba(255,255,255,.28)'; rr(g, 60, vy - 2, 250, 4, 2); g.fill(); g.fillStyle = '#fff'; rr(g, 60, vy - 2, 160, 4, 2); g.fill(); g.beginPath(); g.arc(220, vy, 6, 0, 7); g.fill();
    drawIcon(g, 'device', 330, vy - 12, 24, 'rgba(255,255,255,.85)', 1.6);
    g.fillStyle = 'rgba(255,255,255,.9)'; rr(g, LW / 2 - 67, LH - 11, 134, 5, 2.5); g.fill();
  }
  g.restore();
}
/** Layout of the Now Playing play button in screen-fraction coords (for 3D button placement). */
export const NP_LAYOUT = (() => {
  const as = LW - 48, ay = 128, ty = ay + as + 50, by = ty + 64, cy = by + 78;
  return {playX: 0.5, playY: cy / LH, playR: 33 / LW, titleY: ty / LH, barY: by / LH, ctrlY: cy / LH};
})();

export function drawLibrary(g: Ctx) {
  g.save(); g.scale(UI_W / LW, UI_W / LW);
  g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, LW, LH); statusBar(g);
  g.fillStyle = '#7a5af8'; g.beginPath(); g.arc(34, 76, 17, 0, 7); g.fill(); txt(g, 'M', 34, 82, 16, 800, '#fff', 'center');
  txt(g, 'Your Library', 62, 83, 22, 800, '#fff'); drawIcon(g, 'search', 306, 64, 24, '#fff'); drawIcon(g, 'plus', 342, 64, 24, '#fff');
  [['Playlists', 82, true], ['Artists', 70, false], ['Albums', 74, false]].forEach(([l, w, on], i) => { const x = [16, 106, 186][i]; g.fillStyle = on ? GREEN : 'rgba(255,255,255,.12)'; rr(g, x, 108, w as number, 32, 16); g.fill(); txt(g, l as string, x + (w as number) / 2, 129, 13, 600, on ? '#000' : '#fff', 'center'); });
  const rows: [string, string, () => HTMLCanvasElement][] = [
    ['Liked Songs', 'Playlist • 312 songs', () => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d')!; const gr = x.createLinearGradient(0, 0, 128, 128); gr.addColorStop(0, '#4b2ed8'); gr.addColorStop(1, '#a6b8ff'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); drawIcon(x, 'heart', 36, 36, 56, '#fff'); return c; }],
    ["Today's Top Hits", 'Playlist • Spotify', () => getPlArt('top', 192)], ['RapCaviar', 'Playlist • Spotify', () => getPlArt('rap', 192)], ['Discover Weekly', 'Playlist • Spotify', () => getPlArt('discover', 192)],
    ['Release Radar', 'Playlist • Spotify', () => getPlArt('radar', 192)], ['mint', 'Playlist • Spotify', () => getPlArt('mint', 192)], ['After Hours', 'Album • The Weeknd', () => getHeroArt('weeknd', 192)],
    ['Random Access Memories', 'Album • Daft Punk', () => getHeroArt('daft', 192)], ['UTOPIA', 'Album • Travis Scott', () => getHeroArt('travis', 192)],
  ];
  rows.forEach(([t, d, a], i) => { const y = 160 + i * 68; img(g, a(), 16, y, 58, 58, 4); txt(g, t, 86, y + 26, 15, 700, '#fff', 'left', 270); txt(g, d, 86, y + 46, 13, 500, 'rgba(255,255,255,.6)'); });
  miniPlayer(g, LH - 160, HEROES.weeknd, 0.42); bottomNav(g, 'library'); g.restore();
}
export function drawSearch(g: Ctx) {
  g.save(); g.scale(UI_W / LW, UI_W / LW);
  g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, LW, LH); statusBar(g);
  txt(g, 'Search', 16, 92, 28, 800, '#fff');
  g.fillStyle = '#fff'; rr(g, 16, 112, 358, 46, 6); g.fill(); drawIcon(g, 'search', 26, 123, 24, '#000', 2); txt(g, 'What do you want to listen to?', 62, 141, 15, 600, '#555');
  txt(g, 'Browse all', 16, 200, 17, 800, '#fff');
  const tiles: [string, string][] = [['Pop', '#e13300'], ['Hip-Hop', '#bc5900'], ['Rock', '#e91429'], ['Dance/Electronic', '#0d73ec'], ['Latin', '#8d67ab'], ['Podcasts', '#477d95'], ['Made For You', '#1e3264'], ['Charts', '#8d67ab'], ['New Releases', '#e8115b'], ['Mood', '#ba5d07']];
  tiles.forEach(([t, c], i) => { const x = 16 + (i % 2) * 182, y = 218 + Math.floor(i / 2) * 106; g.fillStyle = c; rr(g, x, y, 170, 92, 8); g.fill(); txt(g, t, x + 12, y + 30, 16, 800, '#fff', 'left', 140); g.save(); g.translate(x + 132, y + 62); g.rotate(0.38); g.fillStyle = 'rgba(0,0,0,.28)'; rr(g, 0, 0, 46, 46, 5); g.fill(); g.restore(); });
  bottomNav(g, 'search'); g.restore();
}
export function drawAlbum(g: Ctx, hero: Hero = HEROES.daft, tracks: string[] = ['Give Life Back to Music', 'The Game of Love', 'Giorgio by Moroder', 'Within', 'Instant Crush', 'Lose Yourself to Dance', 'Touch', 'Get Lucky', 'Beyond', 'Motherboard']) {
  g.save(); g.scale(UI_W / LW, UI_W / LW);
  g.fillStyle = BLACK; g.fillRect(0, 0, LW, LH);
  const bg = g.createLinearGradient(0, 0, 0, 380); bg.addColorStop(0, hero.accent); bg.addColorStop(1, '#0a0a0a'); g.globalAlpha = 0.8; g.fillStyle = bg; g.fillRect(0, 0, LW, 420); g.globalAlpha = 1;
  statusBar(g); drawIcon(g, 'chevDown', 18, 60, 26, '#fff'); g.save(); g.translate(18, 76); g.restore();
  g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30; g.shadowOffsetY = 12; img(g, getHeroArt(hero.key), 95, 92, 200, 200, 4); g.restore();
  txt(g, hero.album, 16, 332, 22, 800, '#fff', 'left', 358); txt(g, `Album • ${hero.artist} • 2013`.replace('2013', hero.key === 'daft' ? '2013' : hero.key === 'weeknd' ? '2020' : hero.key === 'billie' ? '2024' : '2023'), 16, 354, 13, 500, 'rgba(255,255,255,.7)');
  drawIcon(g, 'heart', 16, 372, 26, 'rgba(255,255,255,.7)'); drawIcon(g, 'download', 56, 372, 26, 'rgba(255,255,255,.7)'); drawIcon(g, 'more', 94, 372, 26, 'rgba(255,255,255,.7)');
  drawIcon(g, 'shuffle', 282, 372, 26, GREEN, 2); g.fillStyle = GREEN; g.beginPath(); g.arc(342, 386, 26, 0, 7); g.fill(); drawIcon(g, 'play', 331, 375, 22, '#000');
  tracks.forEach((t, i) => { const y = 440 + i * 46; const on = t === hero.track; txt(g, t, 16, y + 18, 15, 700, on ? GREEN : '#fff', 'left', 300); txt(g, hero.artist, 16, y + 36, 12.5, 500, 'rgba(255,255,255,.6)'); drawIcon(g, 'more', 346, y + 6, 24, 'rgba(255,255,255,.6)'); });
  bottomNav(g, 'library'); g.restore();
}
/** Splash screen used for the opening macro shot (logo illuminating). */
export function drawSplash(g: Ctx, glow = 1) {
  g.save(); g.fillStyle = '#000'; g.fillRect(0, 0, UI_W, UI_H);
  const rad = g.createRadialGradient(UI_W / 2, UI_H / 2, 0, UI_W / 2, UI_H / 2, UI_W * 0.9); rad.addColorStop(0, `rgba(29,185,84,${0.18 * glow})`); rad.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rad; g.fillRect(0, 0, UI_W, UI_H);
  drawSpotifyMark(g, UI_W / 2, UI_H / 2, UI_W * 0.17, GREEN, '#000');
  g.restore();
}
