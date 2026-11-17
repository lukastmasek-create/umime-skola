import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Card3D, CARD_D, CARD_H, CARD_W} from './Card3D';
import {faceTexture, drawPlayerFace, FL_H, FL_W, PLAYER} from '../assets/faces';
import {HEROES, Hero} from '../assets/content';
import {useFonts} from '../assets/fonts';
import {drawIcon} from '../assets/icons';

/** local (logical px) → card-local 3D coords */
export const lp = (lx: number, ly: number, w = CARD_W, h = CARD_H): [number, number] => [(lx / FL_W - 0.5) * w, (0.5 - ly / FL_H) * h];

/** Floating Spotify player: glass-backed card + a real 3D play button that depresses. */
export const Player3D: React.FC<{hero?: Hero['key']; press?: number; progress?: number; playing?: boolean; opacity?: number; faceFront?: THREE.Texture} & React.ComponentProps<'group'>> = ({hero = 'daft', press = 0, progress = 0.05, playing = true, opacity = 1, faceFront, children, ...rest}) => {
  useFonts();
  const q = Math.round(progress * 400) / 400;
  const front = faceFront ?? faceTexture(`player-${hero}-${q}-${playing ? 1 : 0}`, (g) => drawPlayerFace(g, HEROES[hero], q, {showPlay: false}));
  const [bx, by] = lp(195, PLAYER.ctrlY);
  const R = (PLAYER.playR / FL_W) * CARD_W;
  const btn = useMemo(() => ({
    body: new THREE.CylinderGeometry(R, R * 1.02, 0.022, 64), mat: new THREE.MeshPhysicalMaterial({color: '#ffffff', roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2}),
    green: new THREE.MeshPhysicalMaterial({color: '#1DB954', roughness: 0.2, metalness: 0, clearcoat: 1, emissive: '#1DB954', emissiveIntensity: 0.45, envMapIntensity: 1.3}),
  }), [R]);
  const icoTex = useMemo(() => faceTexture(`play-icon-${playing ? 1 : 0}`, (g) => { drawIcon(g, playing ? 'pause' : 'play', 24, 24, 80, '#000'); }, 128, 128), [playing]);
  const lift = 0.014 - press * 0.011;
  return (
    <Card3D front={front} edge={HEROES[hero].accent} opacity={opacity} {...rest} emissive={0.6}>
      <group position={[bx, by, CARD_D / 2 + lift + 0.011]}>
        <mesh geometry={btn.body} material={btn.green} rotation={[Math.PI / 2, 0, 0]} />
        <mesh position={[0, 0, 0.0115]} rotation={[0, 0, 0]}><planeGeometry args={[R * 1.1, R * 1.1]} /><meshBasicMaterial map={icoTex} transparent toneMapped={false} /></mesh>
      </group>
      {children}
    </Card3D>
  );
};
export const PLAYER_BAR = (() => { const [x0, y] = lp(24, PLAYER.barY + 2); const [x1] = lp(366, PLAYER.barY + 2); return {x0, x1, y}; })();
