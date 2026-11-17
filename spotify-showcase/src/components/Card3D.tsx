import React, {useMemo} from 'react';
import * as THREE from 'three';
import {bevelSlab, roundedPlane} from './geo';
import {darkMetal, glassBody, glassSheen} from '../materials';

export const CARD_W = 1.0, CARD_H = 1.42, CARD_D = 0.05;

export type CardProps = {
  front: THREE.Texture; back?: THREE.Texture | null;
  w?: number; h?: number; depth?: number; radius?: number;
  edge?: string;          // metal colour of the substrate (catches coloured light)
  opacity?: number;       // fade (0..1)
  glass?: number;         // protective glass strength
  inset?: number;
  emissive?: number;      // face self-illumination (keeps type readable)
  backEmissive?: number;
  children?: React.ReactNode;
} & Omit<React.ComponentProps<'group'>, 'children'>;

/** Physical card: dark metal substrate, front art, protective glass (+ fresnel sheen), bevelled edge. */
export const Card3D: React.FC<CardProps> = ({front, back = null, w = CARD_W, h = CARD_H, depth = CARD_D, radius = 0.075, inset = 0.03, edge = '#2a2d2f', opacity = 1, glass = 1, emissive = 0.55, backEmissive = 0.55, children, ...rest}) => {
  const geo = useMemo(() => ({
    sub: bevelSlab(w, h, depth, radius, Math.min(0.012, depth * 0.3)),
    face: roundedPlane(w - inset, h - inset, Math.max(0.004, radius - inset / 2), 28),
    glass: bevelSlab(w - 0.012, h - 0.012, 0.01, radius - 0.006, 0.0035, 28),
  }), [w, h, depth, radius, inset]);
  const mats = useMemo(() => {
    const sub = new THREE.MeshPhysicalMaterial({color: edge, metalness: 1, roughness: 0.28, clearcoat: 0.4, clearcoatRoughness: 0.25, envMapIntensity: 1.4});
    const mkFace = (t: THREE.Texture) => new THREE.MeshStandardMaterial({map: t, roughness: 0.55, metalness: 0, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: emissive, envMapIntensity: 0.4});
    return {sub, front: mkFace(front), back: back ? mkFace(back) : null, backMetal: darkMetal('#4a5256'), glass: glassBody('#d8ecff', 0.075), sheen: glassSheen(1)};
  }, [front, back, edge, emissive]);
  const o = opacity; const fade = o < 0.999;
  for (const m of [mats.sub, mats.front, mats.back, mats.backMetal, mats.glass, mats.sheen]) if (m) { m.transparent = fade || m === mats.glass || m === mats.sheen; m.opacity = m === mats.glass ? 0.075 * o : m === mats.sheen ? o : o; m.depthWrite = !fade && m !== mats.glass && m !== mats.sheen; m.needsUpdate = false; }
  if (mats.back) mats.back.emissiveIntensity = backEmissive; mats.front.emissiveIntensity = emissive;
  const z = depth / 2;
  return (
    <group {...rest} visible={o > 0.004 && rest.visible !== false}>
      <mesh geometry={geo.sub} material={mats.sub} />
      <mesh geometry={geo.face} material={mats.front} position={[0, 0, z + 0.0015]} />
      {mats.back ? <mesh geometry={geo.face} material={mats.back} position={[0, 0, -z - 0.0015]} rotation={[0, Math.PI, 0]} /> : <mesh geometry={geo.face} material={mats.backMetal} position={[0, 0, -z - 0.0015]} rotation={[0, Math.PI, 0]} />}
      {glass > 0 && (<>
        <mesh geometry={geo.glass} material={mats.glass} position={[0, 0, z + 0.007]} renderOrder={4} />
        <mesh geometry={geo.face} material={mats.sheen} position={[0, 0, z + 0.0125]} renderOrder={5} />
        {mats.back && <mesh geometry={geo.face} material={mats.sheen} position={[0, 0, -z - 0.0125]} rotation={[0, Math.PI, 0]} renderOrder={5} />}
      </>)}
      {children}
    </group>
  );
};
