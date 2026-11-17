import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import * as THREE from 'three';
import { easeInOut } from './MotionSystem';

export type CamKey = { f: number; pos: [number, number, number]; target: [number, number, number]; fov: number; ease?: (t: number) => number };

export function sampleRig(keys: CamKey[], frame: number) {
  const f = Math.min(Math.max(frame, keys[0].f), keys[keys.length - 1].f);
  let i = 0;
  while (i < keys.length - 2 && f > keys[i + 1].f) i++;
  const a = keys[i], b = keys[i + 1];
  const raw = (f - a.f) / Math.max(1, b.f - a.f);
  const t = (b.ease ?? easeInOut)(raw);
  const v = (x: [number, number, number]) => new THREE.Vector3(...x);
  return { pos: v(a.pos).lerp(v(b.pos), t), target: v(a.target).lerp(v(b.target), t), fov: a.fov + (b.fov - a.fov) * t };
}

export const CameraRig: React.FC<{ keys: CamKey[]; frame: number }> = ({ keys, frame }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const { pos, target, fov } = sampleRig(keys, frame);
  useLayoutEffect(() => {
    camera.position.copy(pos);
    camera.fov = fov;
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  });
  return null;
};

// ---- framing helper: aim camera at a point on the screen plane (css px of the 1920x1080 page) ----
export const SCREEN_Z = 0.0875;
export const px2world = (x: number, y: number): [number, number, number] => [(x / 1920 - 0.5) * 3.2, (0.5 - y / 1080) * 1.8, SCREEN_Z];

/** Camera looking at px point (cx,cy) showing `visW` css-px of page width, with yaw/pitch (deg) offset from screen normal. */
export function frameScreen(cx: number, cy: number, visW: number, aspect: number, yawDeg = 0, pitchDeg = 0, fov = 22, f = 0, ease?: (t: number) => number): CamKey {
  const target = px2world(cx, cy);
  const worldW = (visW / 1920) * 3.2;
  const d = worldW / (2 * Math.tan((fov * Math.PI) / 360) * aspect);
  const yaw = (yawDeg * Math.PI) / 180, pitch = (pitchDeg * Math.PI) / 180;
  const pos: [number, number, number] = [
    target[0] + d * Math.sin(yaw) * Math.cos(pitch),
    target[1] + d * Math.sin(pitch),
    target[2] + d * Math.cos(yaw) * Math.cos(pitch),
  ];
  return { f, pos, target, fov, ease };
}
