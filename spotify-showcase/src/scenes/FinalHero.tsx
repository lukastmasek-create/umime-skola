import React from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {Phone3D} from '../components/Phone3D';
import {Floor} from '../components/Studio';
import {ContactShadow} from '../components/ContactShadow';
import {useUITexture} from '../components/useUITexture';
import {drawHome, UI_H, UI_W} from '../components/SpotifyUI';
import {AlbumCard3D} from '../components/AlbumCard3D';
import {PlaylistCard3D} from '../components/PlaylistCard3D';
import {STUDIO} from '../film';
import {range, smoother, cinematic, dampedSpring, lerp, easeInOutQuart} from '../animation/motion';

export const FLOOR_Y = -0.98;
type CardDef = {kind: 'album' | 'pl'; id: string; end: [number, number, number]; ry: number; start: [number, number, number]; delay: number};
const CARDS: CardDef[] = [
  {kind: 'album', id: 'weeknd', end: [-1.3, 1.45, -4.6], ry: 0.4, start: [-2.6, 2.6, -7.5], delay: 0},
  {kind: 'pl', id: 'discover', end: [1.35, 2.0, -6.2], ry: -0.36, start: [2.8, 3.4, -9.0], delay: 14},
  {kind: 'album', id: 'daft', end: [-1.55, -0.2, -6.6], ry: 0.32, start: [-3.2, -1.2, -9.5], delay: 28},
  {kind: 'pl', id: 'top', end: [1.5, 0.1, -5.0], ry: -0.32, start: [3.2, -0.8, -8.5], delay: 40},
  {kind: 'album', id: 'billie', end: [-0.25, 2.95, -9.0], ry: 0.12, start: [-0.2, 4.6, -11.0], delay: 52},
  {kind: 'album', id: 'travis', end: [0.7, -0.9, -7.6], ry: -0.14, start: [0.9, -2.4, -10.5], delay: 62},
];
const HeroSet: React.FC<{f: number}> = ({f}) => {
  const tex = useUITexture(UI_W, UI_H, (g) => drawHome(g), 'home-final');
  const t = f - 1440;
  const rotY = lerp(-1.1, -0.42, cinematic(range(t, 0, 230)));
  const settle = 1 - dampedSpring(t - 230, 0.8, 0.9);
  const floatY = 0.035 * Math.sin(t / 70) * (1 - range(t, 200, 330));
  return (
    <group>
      <Phone3D screen={tex} position={[0, 0.02 + floatY, 0]} rotation={[0.03, rotY - 0.02 * settle, 0.012]} sheen={1} />
      {CARDS.map((c, i) => {
        const e = easeInOutQuart(range(t, 30 + c.delay, 210 + c.delay));
        const p = c.start.map((s, k) => lerp(s, c.end[k], e)) as [number, number, number];
        const bob = Math.sin((t + i * 37) / 90) * 0.03;
        const props = {position: [p[0], p[1] + bob, p[2]] as [number, number, number], rotation: [0, c.ry * e + (1 - e) * 0.6, 0] as [number, number, number], scale: 1};
        return c.kind === 'album' ? <AlbumCard3D key={i} hero={c.id as 'weeknd'} {...props} /> : <PlaylistCard3D key={i} playlist={c.id} {...props} />;
      })}
    </group>
  );
};

/** SHOT 07 — The Final Hero. Dark studio, phone floats on a glossy floor with a real mirrored reflection. */
export const FinalHero: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <group position={STUDIO}>
      <HeroSet f={f} />
      <group position={[0, 2 * FLOOR_Y, 0]} scale={[1, -1, 1]}><HeroSet f={f} /></group>
      <Floor y={FLOOR_Y} size={60} color="#020403" roughness={0.45} metalness={0.0} opacity={0.94} envI={0.1} spec={0.05} />
      <ContactShadow y={FLOOR_Y + 0.001} w={2.8} d={1.7} opacity={0.9} />
    </group>
  );
};
