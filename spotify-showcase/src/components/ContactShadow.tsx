import React, {useMemo} from 'react';
import * as THREE from 'three';
const tex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!;
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128); r.addColorStop(0, 'rgba(0,0,0,1)'); r.addColorStop(0.45, 'rgba(0,0,0,.55)'); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 256, 256); t = new THREE.CanvasTexture(c); return t;
  };
})();
/** Soft blob shadow lying on the floor plane (y = floor). */
export const ContactShadow: React.FC<{y: number; w: number; d: number; opacity?: number; position?: [number, number, number]; rotY?: number}> = ({y, w, d, opacity = 0.7, position = [0, 0, 0], rotY = 0}) => {
  const m = useMemo(() => new THREE.MeshBasicMaterial({map: tex(), transparent: true, depthWrite: false, opacity}), [opacity]);
  m.opacity = opacity;
  return <mesh position={[position[0], y, position[2]]} rotation={[-Math.PI / 2, 0, rotY]} material={m} renderOrder={-1}><planeGeometry args={[w, d]} /></mesh>;
};
