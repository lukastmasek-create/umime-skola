import * as THREE from 'three';
export const titanium = (color = '#4a4d51') => new THREE.MeshPhysicalMaterial({color, metalness: 1, roughness: 0.3, clearcoat: 0.25, clearcoatRoughness: 0.35, envMapIntensity: 1.35});
export const blackGlass = () => new THREE.MeshPhysicalMaterial({color: '#020303', metalness: 0, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03, ior: 1.52, envMapIntensity: 1.2});
export const darkMetal = (c = '#0e1011') => new THREE.MeshPhysicalMaterial({color: c, metalness: 0.9, roughness: 0.38, clearcoat: 0.3, envMapIntensity: 1.1});
/** Glass overlay: reflective (additive specular only) – never fully transparent edges. */
export const glassSheen = (opacity = 1) => new THREE.MeshPhysicalMaterial({color: '#000000', metalness: 0, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, ior: 1.52, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, envMapIntensity: 1.5});
/** Edge glass: tinted translucent bevel with strong fresnel look. */
export const glassBody = (tint = '#cfe9ff', opacity = 0.2) => new THREE.MeshPhysicalMaterial({color: tint, metalness: 0.0, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.02, ior: 1.5, transparent: true, opacity, envMapIntensity: 1.8, depthWrite: false, side: THREE.FrontSide});
export const acrylic = (color = '#1DB954', opacity = 0.55) => new THREE.MeshPhysicalMaterial({color, metalness: 0, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.05, ior: 1.49, transparent: true, opacity, side: THREE.DoubleSide, envMapIntensity: 1.6, emissive: color, emissiveIntensity: 0.12, depthWrite: false});
