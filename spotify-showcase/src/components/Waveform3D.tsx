import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {G} from '../timeline';
import {PLAYER_SCALE} from '../animation/gallery';
import {PLAYER_BAR} from './Player3D';
import {range, smooth, smoother, cinematic, clamp} from '../animation/motion';

const N = 420;
const bx0 = G[0] + PLAYER_BAR.x0 * PLAYER_SCALE, bx1 = G[0] + PLAYER_BAR.x1 * PLAYER_SCALE, by = G[1] + PLAYER_BAR.y * PLAYER_SCALE, bz = G[2] + 0.55 + 0.6 + 0.05;
/** Control points of the waveform path (world space): along the progress bar, out past the panel edge, then into the dark. */
export const WAVE_PTS: [number, number, number][] = [
  [bx0, by, bz], [bx0 + (bx1 - bx0) * 0.5, by, bz], [bx1, by, bz], [bx1 + 0.9, by - 0.12, bz - 0.35], [2.5, -0.5, -16.8], [2.3, 0.6, -20.2], [0.9, 1.0, -24.2], [-0.9, 0.5, -28.4], [-1.3, -0.3, -32.5], [-0.4, -0.45, -36.5], [0, 0, -41],
];
export const WAVE_CURVE = new THREE.CatmullRomCurve3(WAVE_PTS.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
export const WAVE_LEN = WAVE_CURVE.getLength();
const UP = new THREE.Vector3(0, 1, 0);
/** Head of the drawn-on line along the path (0..1): crawls along the bar, then accelerates into space. */
export const headProgress = (f: number) => (f < 1020 ? 0 : f < 1050 ? 0.033 * smooth(range(f, 1020, 1050)) : 0.033 + 0.967 * smoother(range(f, 1046, 1262)));

/** Sculptural waveform: instanced bars on a curve + a thin green spine that "draws on" from the progress bar. */
export const Waveform3D: React.FC<{frame: number; start: number; headEnd: number}> = ({frame, start, headEnd}) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const frames = useMemo(() => {
    const T: THREE.Vector3[] = [], P: THREE.Vector3[] = [], Bv: THREE.Vector3[] = [], Nv: THREE.Vector3[] = [];
    for (let i = 0; i < N; i++) {
      const u = (i + 0.5) / N;
      const p = WAVE_CURVE.getPointAt(u), t = WAVE_CURVE.getTangentAt(u).normalize();
      const b = new THREE.Vector3().crossVectors(t, UP).normalize(), n = new THREE.Vector3().crossVectors(b, t).normalize();
      P.push(p); T.push(t); Bv.push(b); Nv.push(n);
    }
    return {T, P, Bv, Nv};
  }, []);
  const spine = useMemo(() => new THREE.TubeGeometry(WAVE_CURVE, 600, 0.0045, 8, false), []);
  const mats = useMemo(() => ({
    bar: new THREE.MeshPhysicalMaterial({color: '#1DB954', metalness: 0.15, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, emissive: '#0a8f3a', emissiveIntensity: 0.55, envMapIntensity: 1.5}),
    line: new THREE.MeshBasicMaterial({color: '#4dff8f', toneMapped: false}),
  }), []);
  const head = headProgress(frame);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3();
  const beat = (frame % 30) / 30, pulse = 1 + 0.22 * Math.exp(-beat * 6);
  useLayoutEffect(() => {
    const im = mesh.current!;
    let visible = 0;
    for (let i = 0; i < N; i++) {
      const u = (i + 0.5) / N;
      const grow = smoother(clamp((head - u) / 0.07)) * smooth(range(u, 0.0, 0.1));    // each bar rises as the head passes it
      const env = 0.06 + 0.5 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 0.9);
      const wv = 0.55 + 0.3 * Math.sin(u * 62 - frame * 0.09) + 0.18 * Math.sin(u * 23 + frame * 0.05) + 0.1 * Math.sin(u * 131 - frame * 0.13);
      const h = Math.max(0.0001, 0.012 + env * wv * pulse * grow);
      q.setFromRotationMatrix(m.makeBasis(frames.T[i], frames.Nv[i], frames.Bv[i]));
      pos.copy(frames.P[i]); s.set(0.036, h, 0.016);
      if (grow <= 0.001) s.set(0.0001, 0.0001, 0.0001); else visible++;
      im.setMatrixAt(i, m.compose(pos, q, s));
    }
    im.instanceMatrix.needsUpdate = true;
    // spine drawRange (tube index order is along the path)
    const segs = 600, rad = 8, total = segs * rad * 6;
    spine.setDrawRange(0, Math.floor(clamp(head * 1.02 + 0.0001) * segs) * rad * 6);
    void total; void visible;
  }, [frame, head, frames, spine, pulse]);
  return (
    <group visible={frame >= start - 1}>
      <mesh geometry={spine} material={mats.line} />
      <instancedMesh ref={mesh} args={[undefined as unknown as THREE.BufferGeometry, mats.bar, N]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
    </group>
  );
};
