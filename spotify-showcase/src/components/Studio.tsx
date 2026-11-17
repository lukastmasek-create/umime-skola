import React from 'react';
import * as THREE from 'three';

export type LightRig = {key: number; fill: number; rim: number; rimColor?: string; keyColor?: string; accent?: number; accentColor?: string; accentPos?: [number, number, number]};
/** Constant 5-light rig (no shader recompiles); only intensities/colors change. Three-point + motivated accent. */
export const Lights: React.FC<{rig: LightRig; origin?: [number, number, number]}> = ({rig, origin = [0, 0, 0]}) => {
  const [ox, oy, oz] = origin;
  return (
    <group position={[ox, oy, oz]}>
      <directionalLight position={[-3.5, 6, 4]} intensity={rig.key} color={rig.keyColor ?? '#fff6ea'} />
      <directionalLight position={[5, 1.5, 5]} intensity={rig.fill} color="#cfe0ff" />
      <spotLight position={[4, 3, -5]} intensity={rig.rim} color={rig.rimColor ?? '#1DB954'} angle={0.6} penumbra={1} distance={30} decay={1.2} />
      <pointLight position={rig.accentPos ?? [0, 1, 3]} intensity={rig.accent ?? 0} color={rig.accentColor ?? '#ffffff'} distance={14} decay={1.6} />
      <hemisphereLight args={['#bcd0c4', '#020403', 0.08]} />
    </group>
  );
};

export const Floor: React.FC<{y: number; size?: number; color?: string; roughness?: number; metalness?: number; position?: [number, number, number]; opacity?: number; envI?: number; spec?: number}> = ({y, size = 60, color = '#0a0e0c', roughness = 0.2, metalness = 0.25, position = [0, 0, 0], opacity = 1, envI = 0.9, spec = 1}) => (
  <mesh position={[position[0], y, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[size, 96]} />
    <meshPhysicalMaterial transparent={opacity < 1} opacity={opacity} depthWrite={opacity >= 1} color={color} roughness={roughness} metalness={metalness} clearcoat={0} specularIntensity={spec} envMapIntensity={envI} />
  </mesh>
);
