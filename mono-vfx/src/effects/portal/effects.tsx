import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage, EffectProps} from '../../core/Stage';
import {camFrom, fadeIn, sweepEnv} from '../../core/kit';
import {easeInOutCubic, seg, smootherstep, springStep, lerp, smoothstep, easeOutCubic, clamp} from '../../core/Timeline';
import {makeRng} from '../../core/DeterministicRandom';
import {makeMaterial} from '../../materials/presets';
import {Instances} from '../../core/Instances';
import {CamKey} from '../../core/CameraRig';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const Q0 = new THREE.Quaternion();

/** Shared "other world" sky used by mirror/portal effects: dusk gradient, sun disc, grid horizon. */
const SKY_GLSL = `
vec3 otherWorld(vec3 d){
  d = normalize(d);
  float h = d.y;
  vec3 top = vec3(0.02,0.02,0.10), mid = vec3(0.45,0.12,0.40), low = vec3(1.0,0.50,0.28);
  vec3 c = mix(low, mid, smoothstep(0.0,0.25,h)); c = mix(c, top, smoothstep(0.2,0.8,h));
  vec3 sunDir = normalize(vec3(0.15,0.12,-1.0));
  float sd = max(dot(d,sunDir),0.0);
  c += vec3(1.6,0.9,0.5)*pow(sd,260.0)*1.4 + vec3(1.0,0.4,0.3)*pow(sd,14.0)*0.28;
  if(h < 0.0){
    vec2 g = d.xz/(-h+1e-3)*1.2; vec2 gl = abs(fract(g-0.5)-0.5)/fwidth(g);
    float line = 1.0 - min(min(gl.x,gl.y),1.0);
    c = mix(vec3(0.03,0.01,0.06), vec3(1.0,0.35,0.6), line*0.9*exp(-(-h)*-3.0)) * mix(1.0,0.2,smoothstep(0.0,0.3,-h));
    c += low*0.15*exp(h*18.0);
  }
  return c;
}`;
const portalMat = (kind: 'mirror' | 'ring') => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
  uniforms: {uT: {value: 0}, uMix: {value: 0}, uRip: {value: 0}, uAlpha: {value: 1}},
  vertexShader: 'varying vec3 vW; varying vec2 vUv; void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
  fragmentShader: `uniform float uT; uniform float uMix; uniform float uRip; uniform float uAlpha; varying vec3 vW; varying vec2 vUv;
  ${SKY_GLSL}
  void main(){
    vec2 p = vUv*2.0-1.0; float r = length(p); if(r>1.0) discard;
    float wave = sin(r*${kind === 'mirror' ? '26.0' : '18.0'} - uT*5.0)*exp(-r*1.4)*uRip;
    vec3 view = normalize(vW - cameraPosition);
    vec3 d = view + vec3(p*wave*0.35, 0.0);
    vec3 world = otherWorld(d);
    vec3 refl = vec3(0.02,0.025,0.03) + vec3(0.7,0.75,0.85)*smoothstep(0.55,0.9,0.5+0.5*sin(p.x*3.0+wave*6.0)) * 0.35 + 0.05*vec3(smoothstep(0.0,1.0,1.0-r));
    vec3 col = mix(refl, world, uMix);
    col += vec3(1.0,0.8,0.6)*smoothstep(0.86,1.0,r)*0.6*uMix;
    gl_FragColor = vec4(col, uAlpha*smoothstep(1.0,0.97,r));
  }`,
});

/* ───────── 21 Black Hole Collapse ───────── */
export const D21 = 17;
const BH = V(2.6, 0.2, 0);
export const BlackHoleCollapse: React.FC<EffectProps> = (props) => {
  const uni = useMemo(() => ({uK: {value: 0}, uS: {value: BH.clone()}, uC: {value: V(-0.6, 0, 0)}}), []);
  const gem = useMemo(() => {
    const m = makeMaterial('chrome');
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uK = uni.uK; sh.uniforms.uS = uni.uS; sh.uniforms.uC = uni.uC;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uK; uniform vec3 uS; uniform vec3 uC;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          { vec3 a = normalize(uS - uC); vec3 rel = position - (uC - vec3(0.0)); float h = dot(rel, a); vec3 perp = rel - a*h;
            float near = h + 1.6; float s = uK;
            float h2 = h + s*near*near*0.55; vec3 perp2 = perp / (1.0 + s*max(near,0.0)*1.6);
            transformed = uC + a*h2 + perp2;
            objectNormal = normalize(objectNormal + a*s*0.3); }`);
    };
    return m;
  }, [uni]);
  const disk = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: {uT: {value: 0}, uA: {value: 0}},
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
    fragmentShader: `uniform float uT; uniform float uA; varying vec2 vUv;
      void main(){ vec2 p=vUv*2.0-1.0; float r=length(p); if(r>1.0||r<0.34) discard; float an=atan(p.y,p.x);
        float band = 0.5+0.5*sin(an*6.0 - uT*3.0 + r*28.0); float f = smoothstep(0.34,0.42,r)*smoothstep(1.0,0.5,r);
        float dop = 0.55+0.45*cos(an+0.5);
        vec3 c = mix(vec3(1.0,0.35,0.08), vec3(1.0,0.85,0.55), smoothstep(0.7,0.36,r)) * (0.4+band*0.9) * dop * f;
        gl_FragColor = vec4(c*uA, f*uA); }`,
  }), []);
  const debris = useMemo(() => {
    const r = makeRng(2121);
    return Array.from({length: 260}, () => ({a: r.range(0, Math.PI * 2), rad: r.range(0.9, 4.2), sp: r.range(0.4, 1.6), y: r.range(-0.15, 0.15), s: r.range(0.02, 0.07)}));
  }, []);
  const box = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const dm = useMemo(() => makeMaterial('chrome'), []);
  const blackM = useMemo(() => new THREE.MeshBasicMaterial({color: 0x000000}), []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: null, exposure: (t) => fadeIn(t) * (1 - 0.0 * t), envRotation: (t) => sweepEnv(t, 0.3, 6, -0.9, 0.5, 0.2, D21) + 0.25 * Math.pow(seg(t, 8, 13), 2) * 6,
      camera: camFrom([[0, [-1.0, 1.2, 10], [0.8, 0, 0]], [4, [0.2, 0.9, 8.4], [1.0, 0, 0]], [7, [1.4, 0.7, 7.4], [1.6, 0.1, 0]], [10, [2.2, 0.8, 5.8], [2.2, 0.1, 0]], [12.6, [2.6, 0.3, 3.2], [2.6, 0.2, 0], 36, 1.4], [14.2, [0, 0.2, 0.5], [0, 0, -10], 60, 1.4], [17, [0.4, 0.5, 6.0], [0, 0, -4], 34, 1.6]], 1.7),
    }}
      render={(t) => {
        const appear = smootherstep(seg(t, 2.4, 4.8)), pull = smootherstep(seg(t, 5.4, 10.6)), gone = smootherstep(seg(t, 10.0, 11.4));
        uni.uK.value = pull * 1.0;
        uni.uC.value.set(-0.6 - pull * 0.4, 0, 0);
        disk.uniforms.uT.value = t; disk.uniforms.uA.value = appear * (1 - smootherstep(seg(t, 12.2, 13.2)));
        const collapse = smootherstep(seg(t, 11.0, 13.4));
        const born = smootherstep(seg(t, 13.2, 15.0));
        return (
          <group>
            <group visible={gone < 0.999} scale={1 - gone * 0.9} position={[-0.6 - pull * 0.4, 0, 0].map((v, i) => v * (1 - gone) + (i === 0 ? BH.x * gone : 0)) as [number, number, number]}>
              <mesh material={gem} rotation={[0.4, t * 0.15, 0.2]}><icosahedronGeometry args={[1.0, 1]} /></mesh>
              <mesh material={gem} rotation={[0.9, -t * 0.2, 0.3]} scale={0.55}><octahedronGeometry args={[1, 0]} /></mesh>
            </group>
            <group position={BH} scale={appear * (1 - collapse * 0.0)}>
              <mesh material={blackM}><sphereGeometry args={[0.52, 48, 32]} /></mesh>
              <mesh rotation={[-1.25, 0.2, 0.0]} scale={[2.9, 2.9, 1]}><planeGeometry /><primitive object={disk} attach="material" /></mesh>
              <mesh rotation={[0, 0, 0]} scale={[1.18, 1.18, 1]}><ringGeometry args={[0.46, 0.5, 96]} /><meshBasicMaterial color={new THREE.Color(1.6, 0.7, 0.25)} toneMapped={false} transparent opacity={0.55 * appear} side={THREE.DoubleSide} /></mesh>
            </group>
            <Instances count={debris.length} geometry={box} material={dm} t={t} fill={(i, tt, m) => {
              const d = debris[i], k = smootherstep(seg(tt, 6.0, 11.5));
              const rad = d.rad * (1 - 0.82 * k) , a = d.a + tt * d.sp * (0.4 + 2.2 * k);
              const p = V(BH.x + Math.cos(a) * rad * 0.9, d.y * rad + Math.sin(a) * rad * 0.15, Math.sin(a) * rad * 0.9);
              if (tt < 5.4 || tt > 12.6) return false;
              const sc = d.s * (1 - 0.6 * k); return m.compose(p, Q0, V(sc, sc, sc));
            }} />
            {/* new environment emerges */}
            <group visible={born > 0.001} position={[0, 0, -8]} scale={born}>
              {[0, 1, 2, 3, 4].map((i) => <mesh key={i} material={dm} rotation={[Math.PI / 2 + i * 0.12, 0, i * 0.5 + t * 0.1]} position={[0, 0, -i * 1.6]}><torusGeometry args={[1.2 + i * 0.5, 0.06, 20, 96]} /></mesh>)}
              <mesh material={dm}><sphereGeometry args={[0.8, 64, 48]} /></mesh>
              <pointLight position={[0, 2, 3]} intensity={30} color={0xffd0a0} distance={20} />
            </group>
          </group>
        );
      }} />
  );
};

/* ───────── 22 Wormhole Flight ───────── */
export const D22 = 19;
const tunnelPath = (s: number) => V(Math.sin(s * 0.11) * 3.2 + Math.sin(s * 0.047) * 2.0, Math.cos(s * 0.083) * 2.4, -s);
export const WormholeFlight: React.FC<EffectProps> = (props) => {
  const N = 110, TR = 140;
  const ringGeo = useMemo(() => new THREE.TorusGeometry(2.1, 0.12, 12, 64), []);
  const dark = useMemo(() => { const m = makeMaterial('brushedAluminum'); m.color = new THREE.Color(0x15171b); m.roughness = 0.22; return m; }, []);
  const chrome = useMemo(() => makeMaterial('chrome'), []);
  const trailGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const glowA = useMemo(() => new THREE.MeshBasicMaterial({color: new THREE.Color(0.5, 1.4, 2.4), toneMapped: false}), []);
  const glowB = useMemo(() => new THREE.MeshBasicMaterial({color: new THREE.Color(2.4, 1.1, 0.4), toneMapped: false}), []);
  const trails = useMemo(() => { const r = makeRng(22); return Array.from({length: TR}, () => ({s: r.range(0, 330), a: r.range(0, Math.PI * 2), rad: r.range(1.2, 1.9), len: r.range(3, 14), w: r.range(0.012, 0.03), sp: r.range(0.5, 1.6)})); }, []);
  const prog = (t: number) => { // travelled distance: accelerates hard
    const a = smootherstep(seg(t, 2.0, 15.0)); return 4 + t * 2.0 + 150 * a * a * a + 14 * Math.pow(seg(t, 12, 17), 2);
  };
  const frame = (s: number) => { const c = tunnelPath(s), c2 = tunnelPath(s + 0.5); const T = c2.clone().sub(c).normalize(); return {c, T, q: new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), T)}; };
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: null, exposure: (t) => fadeIn(t, 1.6), envRotation: (t) => sweepEnv(t, 0.3, 8, -0.9, 0.9, 0.2, D22), vignette: 0.8,
      camera: () => { const keys: CamKey[] = []; for (let i = 0; i <= 76; i++) { const t = (i / 76) * D22, s = prog(t), f = frame(s), l = frame(s + 6); keys.push({t, pos: f.c.toArray() as [number, number, number], target: l.c.toArray() as [number, number, number], fov: 34 + 32 * smootherstep(seg(t, 4, 14)) - 22 * smootherstep(seg(t, 16, 19)), roll: 0.16 * Math.sin(t * 0.45) * smootherstep(seg(t, 3, 9))}); } return keys; },
      shakes: [{t: 8, amp: 0.01, decay: 0.4}, {t: 12, amp: 0.02, decay: 0.3}],
    }}
      render={(t) => {
        const s0 = prog(t);
        return (
          <group>
            <Instances count={N} geometry={ringGeo} material={dark} t={t} fill={(i, _t, m) => {
              const s = Math.floor(s0 / 4) * 4 + (i - 8) * 4, f = frame(s), sc = 1 + 0.18 * Math.sin(s * 0.21);
              return m.compose(f.c, f.q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), s * 0.05)), V(sc, sc, sc));
            }} />
            <Instances count={Math.floor(N / 3)} geometry={ringGeo} material={chrome} t={t} fill={(i, _t, m) => {
              const s = Math.floor(s0 / 12) * 12 + (i - 3) * 12 + 2, f = frame(s);
              return m.compose(f.c, f.q, V(1.18, 1.18, 3.0));
            }} />
            {[glowA, glowB].map((gm, k) => (
              <Instances key={k} count={TR / 2} geometry={trailGeo} material={gm} t={t} fill={(i, _t, m) => {
                const d = trails[i + k * (TR / 2)];
                const s = ((d.s - s0 * (0.12 * d.sp) + 1e5) % 330) + s0 - 20, f = frame(s);
                const right = V(1, 0, 0).applyQuaternion(f.q), up = V(0, 1, 0).applyQuaternion(f.q);
                const p = f.c.clone().addScaledVector(right, Math.cos(d.a) * d.rad).addScaledVector(up, Math.sin(d.a) * d.rad);
                return m.compose(p, f.q, V(d.w, d.w, d.len * (0.5 + smootherstep(seg(t, 3, 13)) * 1.8)));
              }} />
            ))}
            {/* exit chamber */}
            <group position={tunnelPath(prog(D22) + 30)}>
              <mesh material={chrome}><sphereGeometry args={[1.3, 64, 48]} /></mesh>
              {[1.9, 2.6, 3.4].map((r, i) => <mesh key={i} material={chrome} rotation={[Math.PI / 2 + i * 0.35, 0, i]}><torusGeometry args={[r, 0.05, 16, 96]} /></mesh>)}
              <pointLight intensity={60} color={0xffd0a0} distance={30} position={[0, 3, 4]} />
            </group>
          </group>
        );
      }} />
  );
};

/* ───────── 23 Mirror Portal ───────── */
export const D23 = 15;
export const MirrorPortal: React.FC<EffectProps> = (props) => {
  const mat = useMemo(() => portalMat('mirror'), []);
  const frameM = useMemo(() => makeMaterial('chrome'), []);
  const worldSphere = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, toneMapped: false, depthWrite: false,
    vertexShader: 'varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader: `varying vec3 vW; ${SKY_GLSL} void main(){ gl_FragColor = vec4(otherWorld(normalize(vW - cameraPosition)),1.0);} `,
  }), []);
  const wm = useMemo(() => makeMaterial('chrome', {color: 0xf2e6ff}), []);
  return (
    <Stage {...props} spec={{
      env: 'darkCinematic', floorY: null, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 7, -0.9, 0.4, 0.2, D23),
      camera: camFrom([[0, [-1.6, 0.7, 8.6], [0, 0, 0]], [4, [-0.6, 0.4, 6.8], [0, 0, 0]], [7.5, [0.2, 0.2, 4.6], [0, 0, 0]], [9.6, [0, 0, 1.8], [0, 0, -4], 38, 1.4], [11, [0, 0, -1.2], [0, 0, -9], 46, 1.4], [13, [0, 0.2, -6], [0, 0.3, -14], 40, 1.4], [15, [0.4, 0.4, -8], [0, 0.2, -15], 36, 1.4]], 1.7),
    }}
      render={(t) => {
        mat.uniforms.uT.value = t;
        mat.uniforms.uRip.value = 0.2 + 1.2 * smootherstep(seg(t, 3.0, 6.5)) * (1 - 0.6 * smootherstep(seg(t, 9.5, 11)));
        mat.uniforms.uMix.value = smootherstep(seg(t, 5.0, 8.4));
        return (
          <group>
            <group rotation={[0, 0.25 * (1 - smootherstep(seg(t, 4, 8.5))), 0]}>
              <mesh material={frameM}><torusGeometry args={[1.45, 0.1, 32, 128]} /></mesh>
              <mesh material={frameM} scale={[1, 1, 1]}><torusGeometry args={[1.58, 0.025, 16, 128]} /></mesh>
              <mesh scale={[2.9, 2.9, 1]} material={mat}><planeGeometry /></mesh>
            </group>
            <mesh position={[0, 0, -24]} material={worldSphere}><sphereGeometry args={[40, 48, 32]} /></mesh>
            <group position={[0, 0, -14]}>{[0, 1, 2, 3].map((i) => <mesh key={i} material={wm} position={[Math.sin(i * 2) * 2.2, Math.cos(i * 1.7) * 0.9 + 0.5, -i * 0.8]}><icosahedronGeometry args={[0.45 + i * 0.1, 2]} /></mesh>)}</group>
          </group>
        );
      }} />
  );
};

/* ───────── 24 Folding Reality ───────── */
export const D24 = 17;
export const FoldingReality: React.FC<EffectProps> = (props) => {
  const N = props.quality === 'preview' ? 90 : 170;
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d')!;
    g.fillStyle = '#0b0c10'; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i <= 16; i++) { g.fillStyle = i % 4 === 0 ? '#7fd4ff' : '#1c2230'; g.fillRect(i * 64 - (i % 4 === 0 ? 3 : 1), 0, i % 4 === 0 ? 6 : 2, 1024); g.fillRect(0, i * 64 - (i % 4 === 0 ? 3 : 1), 1024, i % 4 === 0 ? 6 : 2); }
    const t2 = new THREE.CanvasTexture(c); t2.colorSpace = THREE.SRGBColorSpace; t2.anisotropy = 8; return t2;
  }, []);
  const mat = useMemo(() => { const m = makeMaterial('brushedAluminum'); m.color = new THREE.Color(0x8a93a0); m.map = tex; m.emissiveMap = tex; m.emissive = new THREE.Color(0.1, 0.16, 0.22); m.side = THREE.DoubleSide; m.roughness = 0.2; m.metalness = 0.85; return m; }, [tex]);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: null, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 8, -0.9, 0.7, 0.2, D24),
      camera: camFrom([[0, [-1, 5.5, 11], [0, 0, 0]], [4, [0, 4.2, 9], [0, 0, 0]], [7, [4.6, 3.4, 7.6], [0, 0.6, 0]], [10, [-1.2, 2.2, 7.0], [0, 1.4, 0]], [13, [-4.6, 3.8, 6.4], [0, 0.8, 0]], [17, [0.6, 3.8, 10.5], [0, 0.4, 0]]], 1.6),
    }}
      render={(t) => {
        const a1 = easeInOutCubic(seg(t, 3.5, 7.5)) * Math.PI * 0.97, a2 = easeInOutCubic(seg(t, 5.0, 9.0)) * Math.PI * 0.93, a3 = easeInOutCubic(seg(t, 6.5, 10.5)) * Math.PI * 0.55;
        const reopen = easeInOutCubic(seg(t, 11.2, 15.4));
        const A1 = a1 * (1 - reopen * 0.92), A2 = a2 * (1 - reopen) + reopen * -Math.PI * 0.5, A3 = a3 * (1 - reopen) + reopen * Math.PI * 0.5;
        const geo = (() => {
          const S = 7, pos: number[] = [], uv: number[] = [], idx: number[] = [];
          // fold lines: x = -1.4 (angle A1), z = 0.9 (angle A2), x+z = 1.6 (angle A3) -- applied in order to points beyond them
          const fold = (p: THREE.Vector3, point: THREE.Vector3, axis: THREE.Vector3, normal: THREE.Vector3, ang: number) => {
            if (p.clone().sub(point).dot(normal) <= 0) return;
            p.sub(point).applyAxisAngle(axis, ang).add(point);
          };
          for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
            const u = i / N, v = j / N, p = V((u - 0.5) * S, 0, (v - 0.5) * S);
            // process folds from innermost-last so stacking is consistent
            fold(p, V(1.4, 0, 0), V(0, 0, 1), V(1, 0, 0), -A1);
            fold(p, V(0, 0, 0.9), V(1, 0, 0), V(0, 0, 1), A2);
            fold(p, V(-1.2, 0, -1.2), V(1, 0, -1).normalize(), V(-1, 0, -1).normalize(), A3);
            pos.push(p.x, p.y, p.z); uv.push(u * 2, v * 2);
          }
          for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const a = i + j * (N + 1), b = a + 1, c = a + N + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
          return g;
        })();
        return <mesh geometry={geo} material={mat} frustumCulled={false} />;
      }} />
  );
};

/* ───────── 25 Portal Ring ───────── */
export const D25 = 17;
export const PortalRing: React.FC<EffectProps> = (props) => {
  const SEG = 12, R = 1.6;
  const seeds = useMemo(() => { const r = makeRng(25); return Array.from({length: SEG}, () => ({start: V(r.range(-1, 1), r.range(-1, 1), r.range(-1, 1)).normalize().multiplyScalar(r.range(4, 8)), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(r.range(-3, 3), r.range(-3, 3), r.range(-3, 3))), delay: r.range(0, 2.4)})); }, []);
  const arcGeo = useMemo(() => new THREE.TorusGeometry(R, 0.17, 6, 20, (Math.PI * 2) / SEG - 0.05), []);
  const inlayGeo = useMemo(() => new THREE.TorusGeometry(R, 0.06, 8, 20, (Math.PI * 2) / SEG - 0.22), []);
  const metal = useMemo(() => makeMaterial('chrome'), []);
  const dark = useMemo(() => { const m = makeMaterial('brushedAluminum'); m.color = new THREE.Color(0x14161a); return m; }, []);
  const lights = useMemo(() => Array.from({length: SEG}, () => new THREE.MeshBasicMaterial({color: new THREE.Color(0, 0, 0), toneMapped: false})), []);
  const portal = useMemo(() => portalMat('ring'), []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: null, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 8, -0.9, 0.6, 0.2, D25),
      camera: camFrom([[0, [-2.4, 1.0, 9.5], [0, 0, 0]], [5, [-1.2, 0.8, 7.8], [0, 0, 0]], [8.5, [1.2, 0.5, 6.0], [0, 0, 0]], [11, [0.2, 0.1, 3.4], [0, 0, -2], 36, 1.4], [13, [0, 0, 0.6], [0, 0, -7], 52, 1.4], [15, [0, 0, -3.5], [0, 0, -10], 40, 1.4], [17, [0.3, 0.2, -5], [0, 0, -11], 36, 1.4]], 1.7),
    }}
      render={(t) => {
        const head = ((t - 7.0) * 1.6) % (Math.PI * 2);
        const ctr = smootherstep(seg(t, 8.0, 11.0)), ripple = ctr * (1 - 0.3 * smootherstep(seg(t, 13, 15)));
        portal.uniforms.uT.value = t; portal.uniforms.uRip.value = ripple * 1.2; portal.uniforms.uMix.value = ctr; portal.uniforms.uAlpha.value = ctr;
        return (
          <group rotation={[0, 0.0, t * 0.0]}>
            {seeds.map((s, i) => {
              const a0 = (i / SEG) * Math.PI * 2, u = seg(t, 1.2 + s.delay, 4.6 + s.delay), e = u * u * (3 - 2 * u);
              const p = s.start.clone().lerp(V(0, 0, 0), e), qq = s.q.clone().slerp(Q0, smootherstep(u));
              const lock = springStep(t - (4.6 + s.delay), 26, 0.3) - 1, snap = u >= 1 ? 0.03 * lock : 0;
              const ang = (a0 + Math.PI / SEG) - head, d = Math.abs(((ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
              const glow = t > 7 ? Math.exp(-Math.pow(d * 1.1, 2)) * 3.0 * ctr + 0.0 : 0;
              lights[i].color.setRGB(0.1 * glow + 0.02, 0.55 * glow, 1.0 * glow);
              const ex = easeOutCubic(seg(t, 4.0 + s.delay, 7.0)) * 0; void ex;
              return (
                <group key={i} position={p} quaternion={qq}>
                  <group rotation={[0, 0, a0]} position={[0, 0, snap]}>
                    <mesh geometry={arcGeo} material={i % 2 ? metal : dark} />
                    <mesh geometry={inlayGeo} material={lights[i]} position={[0, 0, 0.115]} rotation={[0, 0, 0.085]} />
                  </group>
                </group>
              );
            })}
            <mesh scale={[R * 2 - 0.2, R * 2 - 0.2, 1]} material={portal} visible={ctr > 0.001}><planeGeometry /></mesh>
          </group>
        );
      }} />
  );
};
void lerp; void smoothstep; void clamp;
