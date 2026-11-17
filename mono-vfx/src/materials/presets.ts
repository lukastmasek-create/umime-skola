import * as THREE from 'three';
import {makeRng} from '../core/DeterministicRandom';

export type MaterialName = 'obsidian' | 'chrome' | 'brushedAluminum' | 'glass' | 'frostedGlass' | 'mercury' | 'ceramic' | 'stone' | 'emissive';

export const makeMaterial = (name: MaterialName, opts: {color?: THREE.ColorRepresentation} = {}): THREE.MeshPhysicalMaterial => {
  const m = new THREE.MeshPhysicalMaterial();
  switch (name) {
    case 'obsidian':
      Object.assign(m, {color: new THREE.Color(0x040405), metalness: 0, roughness: 0.045, clearcoat: 1, clearcoatRoughness: 0.025, ior: 1.52, specularIntensity: 1, envMapIntensity: 1.5});
      break;
    case 'chrome':
      Object.assign(m, {color: new THREE.Color(opts.color ?? 0xffffff), metalness: 1, roughness: 0.035, envMapIntensity: 1.3});
      break;
    case 'brushedAluminum':
      Object.assign(m, {color: new THREE.Color(0xc8cbd0), metalness: 1, roughness: 0.32, anisotropy: 0.8, envMapIntensity: 1.1});
      break;
    case 'glass':
      Object.assign(m, {color: new THREE.Color(0xffffff), metalness: 0, roughness: 0.02, transmission: 1, thickness: 1.2, ior: 1.5, attenuationColor: new THREE.Color(0xbfe8e0), attenuationDistance: 3, envMapIntensity: 1.2});
      break;
    case 'frostedGlass':
      Object.assign(m, {color: new THREE.Color(0xffffff), roughness: 0.45, transmission: 0.9, thickness: 1, ior: 1.5});
      break;
    case 'mercury':
      Object.assign(m, {color: new THREE.Color(0xe8eaee), metalness: 1, roughness: 0.012, envMapIntensity: 1.5});
      break;
    case 'ceramic':
      Object.assign(m, {color: new THREE.Color(opts.color ?? 0xeeeae2), roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.1});
      break;
    case 'stone':
      Object.assign(m, {color: new THREE.Color(opts.color ?? 0x2a2a2c), roughness: 0.2, clearcoat: 0.6});
      break;
    case 'emissive':
      Object.assign(m, {color: new THREE.Color(0x000000), emissive: new THREE.Color(opts.color ?? 0xffa060), emissiveIntensity: 3});
      break;
  }
  return m;
};

/** Mahogany-banded obsidian interior (flow banding + conchoidal ripples). Deterministic canvas texture. */
export const makeObsidianInterior = (seed = 11, size = 1024): THREE.CanvasTexture => {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const rng = makeRng(seed);
  g.fillStyle = '#070506';
  g.fillRect(0, 0, size, size);
  // flowing mahogany bands
  for (let i = 0; i < 260; i++) {
    const y0 = rng.range(0, size), amp = rng.range(6, 60), fr = rng.range(0.003, 0.012), ph = rng.range(0, 6.28);
    const w = rng.range(0.6, 7), a = rng.range(0.03, 0.22);
    const hue = rng.range(8, 24), lit = rng.range(8, 26);
    g.strokeStyle = `hsla(${hue}, 70%, ${lit}%, ${a})`;
    g.lineWidth = w;
    g.beginPath();
    for (let x = 0; x <= size; x += 8) {
      const y = y0 + Math.sin(x * fr + ph) * amp + Math.sin(x * fr * 2.7 + ph * 1.3) * amp * 0.25;
      x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
  }
  // conchoidal rings
  for (let i = 0; i < 5; i++) {
    const cx = rng.range(0.2, 0.8) * size, cy = rng.range(0.2, 0.8) * size;
    for (let r = 20; r < size * 0.7; r += rng.range(10, 26)) {
      g.strokeStyle = `rgba(150,70,30,${rng.range(0.01, 0.05)})`;
      g.lineWidth = rng.range(1, 3);
      g.beginPath(); g.arc(cx, cy, r, 0, 6.283); g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
