import * as THREE from 'three';

export type StudioName = 'darkCinematic' | 'highContrastMetallic' | 'softProduct' | 'glassShowcase' | 'rimLit';

interface Box { pos: [number, number, number]; size: [number, number]; intensity: number; color?: number; }
const PRESETS: Record<StudioName, {boxes: Box[]; ambient: number}> = {
  // long narrow strip softboxes -> crisp, shape-revealing reflections on polished surfaces
  darkCinematic: {
    ambient: 0.004,
    boxes: [
      {pos: [-7, 1, 2], size: [0.9, 9], intensity: 26},
      {pos: [7.5, 0.5, -1], size: [0.5, 10], intensity: 34, color: 0xffe9d2},
      {pos: [0, 8, 0], size: [9, 1.2], intensity: 14},
      {pos: [0, 2, -8], size: [14, 0.25], intensity: 40, color: 0xcfe3ff},
      {pos: [3, -2, 7], size: [1.6, 5], intensity: 6},
      {pos: [0, 1.5, 9], size: [12, 7], intensity: 1.4},
      {pos: [-4.5, 5, 5], size: [3, 3], intensity: 5},
    ],
  },
  highContrastMetallic: {ambient: 0.01, boxes: [
    {pos: [-6, 2, 3], size: [3, 8], intensity: 22}, {pos: [6, 3, -2], size: [2, 8], intensity: 28}, {pos: [0, 8, 2], size: [8, 4], intensity: 10}]},
  softProduct: {ambient: 0.35, boxes: [{pos: [0, 8, 3], size: [12, 8], intensity: 9}, {pos: [-8, 2, 2], size: [5, 8], intensity: 6}, {pos: [8, 2, 2], size: [5, 8], intensity: 6}]},
  glassShowcase: {ambient: 0.05, boxes: [{pos: [-7, 0, 0], size: [1.2, 10], intensity: 18}, {pos: [7, 0, 0], size: [1.2, 10], intensity: 18}, {pos: [0, 0, -9], size: [12, 8], intensity: 12}, {pos: [0, 9, 0], size: [10, 10], intensity: 8}]},
  rimLit: {ambient: 0.002, boxes: [{pos: [-6, 1, -6], size: [0.6, 10], intensity: 45, color: 0xcfe3ff}, {pos: [6, 1, -6], size: [0.6, 10], intensity: 45, color: 0xffd9b0}, {pos: [0, 7, -3], size: [8, 1], intensity: 12}]},
};

/** Procedural HDRI: a dark room with emissive softboxes baked to a PMREM texture. */
export function buildStudioEnvironment(renderer: THREE.WebGLRenderer, name: StudioName, size: number): THREE.Texture {
  const scene = new THREE.Scene();
  const p = PRESETS[name];
  scene.background = new THREE.Color(p.ambient, p.ambient, p.ambient * 1.1);
  for (const b of p.boxes) {
    const mat = new THREE.MeshBasicMaterial({color: new THREE.Color(b.color ?? 0xffffff).multiplyScalar(b.intensity), side: THREE.DoubleSide, toneMapped: false});
    const m = new THREE.Mesh(new THREE.PlaneGeometry(b.size[0], b.size[1]), mat);
    m.position.set(...b.pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  }
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(scene, 0.01, 0.1, 100);
  // fromScene's internal cube resolution is fixed; `size` kept for API symmetry / future use
  void size;
  pm.dispose();
  scene.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
  return rt.texture;
}
