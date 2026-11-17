import * as THREE from 'three';

/** Fresnel glass: dark tinted body, strong env reflection, bright grazing-angle rim. Robust in software GL. */
export const makeGlass = (opts: {tint?: number; opacity?: number; rim?: [number, number, number]; rimPower?: number; env?: number} = {}) => {
  const m = new THREE.MeshPhysicalMaterial({
    color: opts.tint ?? 0x2a6a60, metalness: 0, roughness: 0.015, ior: 1.55, specularIntensity: 1, envMapIntensity: opts.env ?? 3.0,
    clearcoat: 1, clearcoatRoughness: 0.01, transparent: true, opacity: opts.opacity ?? 0.34, depthWrite: false, side: THREE.DoubleSide,
  });
  const rim = opts.rim ?? [0.55, 0.9, 0.85], rp = (opts.rimPower ?? 3).toFixed(2);
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      { float fr = pow(1.0 - clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0), ${rp});
        totalEmissiveRadiance += vec3(${rim.map((x) => x.toFixed(3)).join(',')}) * fr * 0.9; }`);
  };
  return m;
};
