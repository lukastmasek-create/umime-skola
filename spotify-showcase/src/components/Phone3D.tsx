import React, {useMemo} from 'react';
import * as THREE from 'three';
import {bevelSlab, roundedPlane} from './geo';
import {blackGlass, glassSheen, titanium, darkMetal} from '../materials';

export const PW = 0.72, PH = 1.56, PD = 0.082;
export const SW = 0.68, SH = 1.52; // screen size (ratio matches UI texture 1224x2736)
const RADIUS = 0.115;

export const Phone3D: React.FC<{screen: THREE.Texture; brightness?: number; screenOpacity?: number; sheen?: number; frameColor?: string} & React.ComponentProps<'group'>> = ({screen, brightness = 1, screenOpacity = 1, sheen = 1, frameColor = '#44484c', children, ...rest}) => {
  const g = useMemo(() => ({
    body: bevelSlab(PW, PH, PD, RADIUS, 0.012),
    glass: roundedPlane(PW - 0.012, PH - 0.012, RADIUS - 0.007, 40),
    screen: roundedPlane(SW, SH, RADIUS - 0.014, 40),
    back: roundedPlane(PW - 0.02, PH - 0.02, RADIUS - 0.01, 40),
    island: bevelSlab(0.2, 0.066, 0.002, 0.033, 0.0006),
    lensBase: bevelSlab(0.34, 0.34, 0.012, 0.075, 0.003),
  }), []);
  const m = useMemo(() => ({
    ti: titanium(frameColor), glass: blackGlass(), back: new THREE.MeshPhysicalMaterial({color: '#15181a', metalness: 0.25, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.18, envMapIntensity: 1.1}),
    sheen: glassSheen(1), lens: darkMetal('#0a0c0d'), glassDark: new THREE.MeshPhysicalMaterial({color: '#010202', roughness: 0.05, metalness: 0, clearcoat: 1, ior: 1.6, envMapIntensity: 2.2}),
  }), [frameColor]);
  const scr = useMemo(() => new THREE.MeshBasicMaterial({map: screen, toneMapped: false}), [screen]);
  scr.color.setScalar(brightness); scr.transparent = screenOpacity < 1; scr.opacity = screenOpacity;
  m.sheen.opacity = sheen;
  const z = PD / 2;
  return (
    <group {...rest}>
      <mesh geometry={g.body} material={m.ti} castShadow />
      {/* front glass + screen + reflective sheen */}
      <mesh geometry={g.glass} material={m.glass} position={[0, 0, z + 0.0012]} />
      <mesh geometry={g.screen} material={scr} position={[0, 0, z + 0.0022]} />
      <mesh geometry={g.glass} material={m.sheen} position={[0, 0, z + 0.0034]} renderOrder={5} />
      {/* back glass + camera island */}
      <mesh geometry={g.back} material={m.back} position={[0, 0, -z - 0.0012]} rotation={[0, Math.PI, 0]} />
      <group position={[-0.17, 0.57, -z - 0.002]} rotation={[0, Math.PI, 0]}>
        <mesh geometry={g.lensBase} material={m.ti} position={[0, 0, 0.006]} />
        {[[-0.075, 0.075], [-0.075, -0.075], [0.075, 0]].map(([x, y], i) => (
          <group key={i} position={[x, y, 0.014]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={m.ti}><cylinderGeometry args={[0.056, 0.058, 0.014, 48]} /></mesh>
            <mesh position={[0, 0, 0.0075]} rotation={[Math.PI / 2, 0, 0]} material={m.glassDark}><cylinderGeometry args={[0.044, 0.044, 0.003, 48]} /></mesh>
          </group>
        ))}
      </group>
      {/* side buttons */}
      <mesh position={[PW / 2 + 0.002, 0.25, 0]} material={m.ti}><boxGeometry args={[0.008, 0.16, 0.022]} /></mesh>
      <mesh position={[-PW / 2 - 0.002, 0.34, 0]} material={m.ti}><boxGeometry args={[0.008, 0.08, 0.022]} /></mesh>
      <mesh position={[-PW / 2 - 0.002, 0.2, 0]} material={m.ti}><boxGeometry args={[0.008, 0.08, 0.022]} /></mesh>
      {children}
    </group>
  );
};
