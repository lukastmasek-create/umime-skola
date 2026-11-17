import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';

function box(w: number, h: number, c: string, i: number) {
  const col = new THREE.Color(c).multiplyScalar(i);
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: col, side: THREE.DoubleSide, toneMapped: false}));
}
/** Studio reflection environment: softboxes + strips. Authored once, deterministic. */
export function makeStudioEnv(gl: THREE.WebGLRenderer, greenRim = 1) {
  const s = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.MeshBasicMaterial({color: '#050706', side: THREE.BackSide}));
  s.add(room);
  const top = box(12, 7, '#ffffff', 3.0); top.position.set(0, 9, 1); top.rotation.x = Math.PI / 2; s.add(top);
  const left = box(1.6, 12, '#f4f8ff', 3.2); left.position.set(-9, 1, 3); left.rotation.y = Math.PI / 2; s.add(left);
  const rim = box(1.2, 12, '#1DB954', 9 * greenRim); rim.position.set(9, 1, -4); rim.rotation.y = -Math.PI / 2; s.add(rim);
  const rim2 = box(0.8, 10, '#d8ffe8', 4); rim2.position.set(6, 1, -9); rim2.rotation.y = -Math.PI / 4 * 3; s.add(rim2);
  const back = box(18, 6, '#9fb4a8', 0.9); back.position.set(0, 2, -14); s.add(back);
  const fill = box(7, 4, '#fff4e6', 1.1); fill.position.set(2, 0.5, 12); fill.rotation.y = Math.PI; s.add(fill);
  const floor = box(40, 40, '#1b211e', 0.35); floor.rotation.x = -Math.PI / 2; floor.position.y = -6; s.add(floor);
  const pm = new THREE.PMREMGenerator(gl);
  const rt = pm.fromScene(s, 0.035, 0.1, 100);
  pm.dispose();
  return rt.texture;
}

export const StudioEnvironment: React.FC<{intensity?: number; rotationY?: number; rotationX?: number; greenRim?: number}> = ({intensity = 1, rotationY = 0, rotationX = 0, greenRim = 1}) => {
  const {gl, scene} = useThree();
  const env = useMemo(() => makeStudioEnv(gl, greenRim), [gl, greenRim]);
  // set synchronously during render so the very first frame is lit
  scene.environment = env;
  scene.environmentIntensity = intensity;
  scene.environmentRotation.set(rotationX, rotationY, 0);
  scene.backgroundIntensity = 1;
  return null;
};
