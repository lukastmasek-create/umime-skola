// Card faces (1024x1454) drawn at 390x554 logical units – album plates, playlist plates, player.
import * as THREE from 'three';
import {FONT} from './fonts';
import {drawIcon, drawSpotifyMark} from './icons';
import {HEROES, PLAYLISTS, GREEN, Hero} from './content';
import {getHeroArt, getPlArt, rr, txt} from '../components/SpotifyUI';

type Ctx = CanvasRenderingContext2D;
export const FACE_W = 1024, FACE_H = 1454, FL_W = 390, FL_H = (FACE_H / FACE_W) * 390;
const K = FACE_W / FL_W;

function base(g: Ctx, tint: string) {
  g.scale(K, K);
  const bg = g.createLinearGradient(0, 0, 0, FL_H); bg.addColorStop(0, '#15191a'); bg.addColorStop(1, '#070909');
  g.fillStyle = bg; g.fillRect(0, 0, FL_W, FL_H);
  const gl = g.createRadialGradient(FL_W / 2, FL_H, 0, FL_W / 2, FL_H, FL_W * 0.95); gl.addColorStop(0, tint + '55'); gl.addColorStop(1, tint + '00'); g.fillStyle = gl; g.fillRect(0, 0, FL_W, FL_H);
}
function art(g: Ctx, c: CanvasImageSource) { g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 20; g.shadowOffsetY = 8; g.fillStyle = '#000'; rr(g, 24, 24, 342, 342, 10); g.fill(); g.restore(); g.save(); rr(g, 24, 24, 342, 342, 10); g.clip(); g.drawImage(c, 24, 24, 342, 342); g.restore(); }

export function drawAlbumFace(g: Ctx, hero: Hero, year: string) {
  g.save(); base(g, hero.light); art(g, getHeroArt(hero.key));
  txt(g, hero.album, 24, 408, hero.album.length > 20 ? 21 : 26, 800, '#fff', 'left', 342);
  txt(g, hero.artist, 24, 436, 16, 600, 'rgba(255,255,255,.78)');
  txt(g, `Album • ${year}`, 24, 462, 12.5, 500, 'rgba(255,255,255,.5)');
  g.fillStyle = hero.light; rr(g, 24, 482, 28, 3, 1.5); g.fill();
  drawSpotifyMark(g, 346, 512, 14, GREEN, '#000'); txt(g, 'Spotify', 24, 520, 13, 800, 'rgba(255,255,255,.88)');
  g.restore();
}
export function drawPlaylistFace(g: Ctx, key: string) {
  const pl = PLAYLISTS.find((p) => p.key === key)!;
  g.save(); base(g, GREEN); art(g, getPlArt(key));
  txt(g, pl.name, 24, 410, 30, 800, '#fff', 'left', 342);
  // wrap description in 2 lines
  g.font = `500 15px ${FONT}`; const words = pl.desc.split(' '); let l1 = '', l2 = '';
  for (const w of words) { if (g.measureText(l1 + ' ' + w).width < 300 && !l2) l1 = (l1 + ' ' + w).trim(); else l2 = (l2 + ' ' + w).trim(); }
  txt(g, l1, 24, 436, 15, 500, 'rgba(255,255,255,.68)'); if (l2) txt(g, l2, 24, 456, 15, 500, 'rgba(255,255,255,.68)', 'left', 300);
  drawSpotifyMark(g, 33, 497, 9, GREEN, '#000'); txt(g, pl.meta, 50, 502, 12.5, 600, 'rgba(255,255,255,.6)');
  g.fillStyle = GREEN; g.beginPath(); g.arc(338, 497, 24, 0, 7); g.fill(); drawIcon(g, 'play', 327, 486, 22, '#000');
  g.restore();
}
/** Player layout (logical units) – shared with the 3D Player so the button & progress bar line up. */
export const PLAYER = {artY: 24, titleY: 404, barY: 458, ctrlY: 516, playR: 27};
export function drawPlayerFace(g: Ctx, hero: Hero, progress: number, o: {showPlay?: boolean; playing?: boolean} = {}) {
  g.save(); base(g, hero.light); art(g, getHeroArt(hero.key));
  txt(g, hero.track, 24, PLAYER.titleY, 24, 800, '#fff', 'left', 296); txt(g, hero.artist, 24, PLAYER.titleY + 26, 15, 500, 'rgba(255,255,255,.72)');
  drawIcon(g, 'heart', 330, PLAYER.titleY - 18, 28, GREEN);
  const by = PLAYER.barY;
  g.fillStyle = 'rgba(255,255,255,.22)'; rr(g, 24, by, 342, 4, 2); g.fill();
  if (progress > 0) { g.fillStyle = '#fff'; rr(g, 24, by, Math.max(4, 342 * progress), 4, 2); g.fill(); }
  const total = hero.dur.split(':').map(Number), secs = total[0] * 60 + total[1], cur = Math.floor(secs * progress);
  txt(g, `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, '0')}`, 24, by + 20, 11, 500, 'rgba(255,255,255,.62)'); txt(g, hero.dur, 366, by + 20, 11, 500, 'rgba(255,255,255,.62)', 'right');
  const cy = PLAYER.ctrlY;
  drawIcon(g, 'shuffle', 24, cy - 12, 24, GREEN, 2); drawIcon(g, 'prev', 106, cy - 14, 28, '#fff'); drawIcon(g, 'next', 256, cy - 14, 28, '#fff'); drawIcon(g, 'repeat', 342, cy - 12, 24, 'rgba(255,255,255,.75)', 2);
  if (o.showPlay !== false) { g.fillStyle = '#fff'; g.beginPath(); g.arc(195, cy, PLAYER.playR, 0, 7); g.fill(); drawIcon(g, o.playing ? 'pause' : 'play', 195 - 12, cy - 12, 24, '#000'); }
  else { g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.arc(195, cy, PLAYER.playR + 2, 0, 7); g.fill(); }
  g.restore();
}

const cache = new Map<string, THREE.CanvasTexture>();
export function faceTexture(key: string, draw: (g: Ctx) => void, w = FACE_W, h = FACE_H) {
  let t = cache.get(key);
  if (!t) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
    t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; t.minFilter = THREE.LinearMipmapLinearFilter; cache.set(key, t);
  }
  return t;
}
const YEAR: Record<string, string> = {weeknd: '2020', daft: '2013', billie: '2024', travis: '2023'};
export const albumFaceTex = (k: Hero['key']) => faceTexture('album-' + k, (g) => drawAlbumFace(g, HEROES[k], YEAR[k]));
export const playlistFaceTex = (k: string) => faceTexture('pl-' + k, (g) => drawPlaylistFace(g, k));
export const heroArtTex = (k: Hero['key']) => faceTexture('art-' + k, (g) => g.drawImage(getHeroArt(k, 768), 0, 0, 768, 768), 768, 768);
