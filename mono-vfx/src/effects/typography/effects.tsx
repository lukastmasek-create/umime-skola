import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage, EffectProps} from '../../core/Stage';
import {CamKey} from '../../core/CameraRig';
import {camFrom, fadeIn, sweepEnv, makeWarp} from '../../core/kit';
import {seg, smootherstep, springStep, easeInOutCubic, impulse, lerp, clamp} from '../../core/Timeline';
import {makeRng} from '../../core/DeterministicRandom';
import {makeMaterial} from '../../materials/presets';
import {buildWord, bandMaterial, capGeometry, lineSpans, Word} from '../../geometry/text';
import {simulate} from '../../physics/RigidSim';
import {Cut, Streak} from '../katana/slice';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const V2 = (x: number, y: number) => new THREE.Vector2(x, y);
const lines = (portrait: boolean, w: string, split: number) => (portrait ? [w.slice(0, split), w.slice(split)] : [w]);
const chromeP = (rough = 0.04) => { const m = makeMaterial('chrome'); m.roughness = rough; return m; };

/* ───────── 41 Typography Slash ───────── */
export const D41 = 16;
export const TypographySlash: React.FC<EffectProps> = (props) => {
  const portrait = props.orientation === 'portrait';
  const word = useMemo(() => buildWord(lines(portrait, 'PRECISION', 5), {size: 1.0, depth: 0.34, bevel: 0.03}), [portrait]);
  const ang = THREE.MathUtils.degToRad(64), n = V2(Math.cos(ang + Math.PI / 2), Math.sin(ang + Math.PI / 2));
  const D1 = -0.55 * (portrait ? 0.7 : 1.2), D2 = 0.55 * (portrait ? 0.7 : 1.2);
  const cuts = useMemo<Cut[]>(() => [D1, D2].map((d, i) => ({n: V(n.x, n.y, 0), d, t: 5.0 + i * 0.22, dir: V(-n.y, n.x, 0)})), [D1, D2, n.x, n.y]);
  const base = useMemo(() => chromeP(), []);
  const inner = useMemo(() => { const m = makeMaterial('brushedAluminum'); m.color = new THREE.Color(0xc8ccd4); m.roughness = 0.22; m.emissive = new THREE.Color(0.0, 0.0, 0.0); return m; }, []);
  const bands = useMemo(() => [[-1e3, D1], [D1, D2], [D2, 1e3]].map(([lo, hi]) => bandMaterial(base, n, lo - 1e-4, hi + 1e-4)), [base, D1, D2, n]);
  const rings = useMemo(() => word.letters.flatMap((l) => l.rings), [word]);
  const caps = useMemo(() => [D1, D2].map((d) => ({lo: capGeometry(lineSpans(rings, n, d), n, d, -word.depth / 2, word.depth / 2, false), hi: capGeometry(lineSpans(rings, n, d), n, d, -word.depth / 2, word.depth / 2, true)})), [rings, D1, D2, n, word]);
  const scale = portrait ? 1.0 : 1.0;
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -(word.height / 2 + 0.9), exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 8, -0.9, 0.6, 0.3, D41),
      shakes: cuts.map((c) => ({t: c.t + 0.02, amp: 0.03, decay: 12})),
      camera: camFrom([[0, [-2.0, 0.6, 12], [0, 0, 0]], [4.2, [-0.6, 0.4, 9.0], [0, 0, 0]], [5.2, [0.2, 0.2, 8.4], [0, 0, 0]], [8.0, [0.5, 0.3, 4.6], [0.2, 0, 0], 34, 1.5], [11.0, [-2.2, 0.2, 2.6], [-0.5, 0, 0], 40, 1.5], [14, [1.2, 0.5, 8.0], [0, 0, 0]], [16, [0.0, 0.4, 9.6], [0, 0, 0]]], portrait ? 2.4 : 1.0),
    }}
      render={(t) => {
        const open = (c: number) => springStep(t - (cuts[c].t + 0.6), 2.4, 0.8);
        const off = [-0.5 * open(0) * 1.0, 0.0 + 0.04 * open(0) - 0.04 * open(1), 0.5 * open(1) * 1.0];
        const rot = [0.07 * open(0), 0, -0.07 * open(1)];
        const glow = (c: number) => (t < cuts[c].t + 0.3 ? 0 : 1.4 * Math.exp(-(t - cuts[c].t - 0.3) * 0.8));
        inner.emissive.setRGB(0.15 * glow(0), 0.4 * glow(0), 1.0 * glow(0));
        return (
          <group scale={scale}>
            {bands.map((bm, i) => (
              <group key={i} position={[n.x * off[i], n.y * off[i], 0]} rotation={[0, 0, rot[i]]}>
                <mesh geometry={word.geo} material={bm} />
                {i === 1 && <mesh geometry={caps[0].hi} material={inner} />}
                {i === 1 && <mesh geometry={caps[1].lo} material={inner} />}
                {i === 0 && <mesh geometry={caps[0].lo} material={inner} />}
                {i === 2 && <mesh geometry={caps[1].hi} material={inner} />}
              </group>
            ))}
            {cuts.map((c, i) => <Streak key={i} t={t} cut={c} length={word.width * 1.4 + 3} tail={5} z={1.4} tint={[0.8, 1.2, 1.8]} />)}
          </group>
        );
      }} />
  );
};

/* ───────── 42 Chrome Typography ───────── */
export const D42 = 16;
export const ChromeTypography: React.FC<EffectProps> = (props) => {
  const portrait = props.orientation === 'portrait';
  const word = useMemo(() => buildWord(lines(portrait, 'CHROME', 3), {size: 1.15, depth: 0.55, bevel: 0.07, bevelSegs: 6}), [portrait]);
  const mat = useMemo(() => chromeP(0.025), []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -(word.height / 2 + 0.7), vignette: 0.8,
      exposure: (t) => smootherstep(seg(t, 0.4, 5.0)), envRotation: (t) => -1.3 + 3.0 * smootherstep(seg(t, 1, 11)) + 0.3 * seg(t, 11, 16),
      camera: camFrom([[0, [-2.4, 0.3, 11], [0, 0, 0]], [4, [-3.2, 0.4, 5.6], [-1.6, 0, 0]], [8.0, [1.6, 0.5, 3.6], [1.0, 0, 0], 34, 1.4], [11.5, [3.8, 0.9, 5.4], [0.2, 0, 0], 32, 1.4], [16, [-1.0, 0.7, 10], [0, 0, 0]]], portrait ? 2.5 : 1),
    }}
      render={(t) => {
        const rise = smootherstep(seg(t, 0.5, 5.5));
        return <mesh geometry={word.geo} material={mat} position={[0, (1 - rise) * -0.6, 0]} rotation={[0, (1 - rise) * 0.35, 0]} />;
      }} />
  );
};

/* ───────── 43 Typography Assembly ───────── */
export const D43 = 17;
export const TypographyAssembly: React.FC<EffectProps> = (props) => {
  const portrait = props.orientation === 'portrait';
  const word = useMemo(() => buildWord(lines(portrait, 'MOTION', 3), {size: 1.15, depth: 0.5, bevel: 0.04}), [portrait]);
  const F = 4, ang = 0.5, n = V2(Math.cos(ang), Math.sin(ang));
  const frags = useMemo(() => {
    const r = makeRng(43), base = chromeP(0.05); base.side = THREE.DoubleSide;
    const L: {geo: THREE.BufferGeometry; mat: THREE.Material; pivot: THREE.Vector3; start: THREE.Vector3; q0: THREE.Quaternion; delay: number; dur: number}[] = [];
    word.letters.forEach((l, li) => {
      let lo = Infinity, hi = -Infinity;
      for (const p of [l.box.min, l.box.max, V(l.box.min.x, l.box.max.y, 0), V(l.box.max.x, l.box.min.y, 0)]) { const s = p.x * n.x + p.y * n.y; lo = Math.min(lo, s); hi = Math.max(hi, s); }
      for (let f = 0; f < F; f++) {
        const a = lo + ((hi - lo) * f) / F, b = lo + ((hi - lo) * (f + 1)) / F;
        L.push({geo: l.geo, mat: bandMaterial(base, n, f === 0 ? -1e3 : a, f === F - 1 ? 1e3 : b), pivot: l.center.clone(), start: V(r.range(-1, 1), r.range(-1, 1), r.range(-0.4, 1)).normalize().multiplyScalar(r.range(4, 8)), q0: new THREE.Quaternion().setFromEuler(new THREE.Euler(r.range(-3, 3), r.range(-3, 3), r.range(-3, 3))), delay: 1.5 + li * 0.35 + f * 0.25 + r.range(0, 0.6), dur: r.range(2.4, 3.2)});
      }
    });
    return L;
  }, [word]);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -(word.height / 2 + 0.7), exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 9, -0.9, 0.5, 0.2, D43) + 1.5 * smootherstep(seg(t, 12, 15)),
      camera: camFrom([[0, [-2.2, 0.6, 12], [0, 0, 0]], [4, [-1.0, 0.5, 9.5], [0, 0, 0]], [8, [2.4, 0.6, 8.0], [0, 0, 0]], [11, [0.6, 0.3, 6.6], [0, 0, 0]], [17, [-0.6, 0.4, 9.2], [0, 0, 0]]], portrait ? 2.5 : 1),
    }}
      render={(t) => (
        <group>
          {frags.map((f, i) => {
            const u = seg(t, f.delay, f.delay + f.dur), e = u * u * u * 0.6 + smootherstep(u) * 0.4;
            const pos = f.start.clone().multiplyScalar(1 - e);
            const q = f.q0.clone().slerp(new THREE.Quaternion(), smootherstep(u));
            const k = springStep(t - f.delay - f.dur, 30, 0.3) - 1; if (u >= 1) pos.z += 0.03 * k;
            return <group key={i} position={f.pivot.clone().add(pos)} quaternion={q}><mesh geometry={f.geo} material={f.mat} position={f.pivot.clone().multiplyScalar(-1)} /></group>;
          })}
        </group>
      )} />
  );
};

/* ───────── 44 Liquid Typography ───────── */
export const D44 = 17;
export const LiquidTypography: React.FC<EffectProps> = (props) => {
  const portrait = props.orientation === 'portrait';
  const word = useMemo(() => buildWord(lines(portrait, 'INFINITE', 4), {size: 1.0, depth: 0.5, bevel: 0.06, bevelSegs: 5}), [portrait]);
  const uni = useMemo(() => ({uT: {value: 0}, uAmp: {value: 0}, uClip: {value: 0}}), []);
  const mat = useMemo(() => {
    const m = makeMaterial('mercury');
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uT = uni.uT; sh.uniforms.uAmp = uni.uAmp; sh.uniforms.uClip = uni.uClip;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT; uniform float uAmp; varying float vWY;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          { float w = sin(position.x*3.1+uT*2.3)*cos(position.y*2.7-uT*1.9) + 0.6*sin(position.z*5.0+position.x*2.0+uT*3.1);
            transformed += normal * w * 0.075 * uAmp; }`)
        .replace('#include <project_vertex>', '#include <project_vertex>\nvWY = (modelMatrix * vec4(transformed, 1.0)).y;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uClip; varying float vWY;')
        .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n if (vWY < uClip) discard;');
    };
    return m;
  }, [uni]);
  const poolMat = useMemo(() => { const m = makeMaterial('mercury'); m.color = new THREE.Color(0xdfe3ea); return m; }, []);
  const N = 120, W = 16, Dp = 11;
  const letterX = useMemo(() => word.letters.map((l) => l.center), [word]);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: null, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 10, -0.9, 0.8, 0.3, D44),
      camera: camFrom([[0, [0, 2.8, 11], [0, 0.5, 0]], [5, [-1.6, 2.0, 9.2], [0, 0.9, 0]], [9, [2.4, 1.2, 7.4], [0, 1.1, 0]], [13, [-1.0, 0.9, 6.2], [0, 1.2, 0]], [17, [0.2, 1.8, 9.8], [0, 1.0, 0]]], portrait ? 2.5 : 1),
    }}
      render={(t) => {
        const rise = (i: number) => smootherstep(seg(t, 3.2 + i * 0.28, 7.0 + i * 0.28));
        const amp = 1 - smootherstep(seg(t, 8.6, 11.5));
        uni.uT.value = t; uni.uAmp.value = amp * (t > 3 ? 1 : 0);
        uni.uClip.value = 0;
        const poolGeo = (() => {
          const pos: number[] = [], idx: number[] = [];
          for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
            const x = (i / N - 0.5) * W, z = (j / N - 0.5) * Dp;
            let y = 0.05 * Math.sin(x * 1.3 + t * 1.4) * Math.cos(z * 1.1 - t * 1.1) * smootherstep(seg(t, 0, 2));
            letterX.forEach((c, k) => { const r = Math.hypot(x - c.x, z); const a = rise(k) * (1 - rise(k) * 0.0) * Math.max(0, 1 - 0.0); y += 0.09 * Math.sin(r * 5 - t * 4.5 + k) * Math.exp(-r * 0.55) * (a > 0.01 && a < 1 ? 1.0 : 0.25 * Math.exp(-Math.max(0, t - 8.5) * 0.5)); });
            pos.push(x, y, z);
          }
          for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const a = i + j * (N + 1), b = a + 1, c = a + N + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
          const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
        })();
        const h = word.height / 2 + 0.3;
        return (
          <group>
            <mesh geometry={poolGeo} material={poolMat} />
            {word.letters.map((l, i) => <mesh key={i} geometry={l.geo} material={mat} position={[0, h + 0.0 - (1 - rise(i)) * (word.height + 0.8), 0]} />)}
          </group>
        );
      }} />
  );
};

/* ───────── 45 Typography Explosion ───────── */
export const D45 = 17;
const FR = 14;
export const TypographyExplosion: React.FC<EffectProps> = (props) => {
  const portrait = props.orientation === 'portrait';
  const word = useMemo(() => buildWord(lines(portrait, 'IMPACT', 3), {size: 1.3, depth: 0.6, bevel: 0.04}), [portrait]);
  const warp = useMemo(() => makeWarp([[0, 1], [5.0, 1], [5.3, 0.12], [10.5, 0.1], [12.5, 0.5], [14, 1], [17, 1]]), []);
  const T0 = 5.0, SIM = warp(D45);
  const data = useMemo(() => {
    const r = makeRng(45);
    const frag: {li: number; seed: THREE.Vector3; seeds: THREE.Vector3[]; idx: number}[] = [];
    word.letters.forEach((l, li) => {
      const seeds = Array.from({length: FR}, () => V(lerp(l.box.min.x, l.box.max.x, r.next()), lerp(l.box.min.y, l.box.max.y, r.next()), lerp(-0.25, 0.25, r.next())));
      seeds.forEach((s, idx) => frag.push({li, seed: s, seeds, idx}));
    });
    const inits = frag.map((f) => {
      const dir = f.seed.clone().normalize();
      return {pos: f.seed.clone(), vel: dir.multiplyScalar(r.range(2.4, 5.2)).add(V(r.range(-1, 1), r.range(0.5, 2.0), r.range(0.5, 2.2))), angVel: V(r.range(-1, 1), r.range(-1, 1), r.range(-1, 1)).multiplyScalar(5), points: [V(-.2, -.2, -.15), V(.2, -.2, -.15), V(-.2, .2, -.15), V(.2, .2, -.15), V(-.2, -.2, .15), V(.2, -.2, .15), V(-.2, .2, .15), V(.2, .2, .15)], radius: 0.3, mass: 1, releaseAt: T0 + r.range(0, 0.06)};
    });
    const floorY = -(word.height / 2 + 0.7);
    const sim = simulate(inits, {duration: SIM, gravity: () => V(0, -6.5, 0), planes: [{n: V(0, 1, 0), d: floorY}], restitution: 0.3, friction: 0.5, angDrag: 0.3, sub: 4});
    return {frag, sim, floorY};
  }, [word, SIM]);
  const base = useMemo(() => { const m = chromeP(0.06); m.side = THREE.DoubleSide; return m; }, []);
  const fragMats = useMemo(() => data.frag.map((f) => {
    const m = base.clone(); const seeds = f.seeds;
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uSeeds = {value: seeds}; sh.uniforms.uIdx = {value: f.idx};
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLP = position;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vLP; uniform vec3 uSeeds[${FR}]; uniform int uIdx;`)
        .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
          { float bd = 1e9; int bi = 0; for (int k = 0; k < ${FR}; k++) { float d = distance(vLP, uSeeds[k]); if (d < bd) { bd = d; bi = k; } } if (bi != uIdx) discard; }`)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n if (!gl_FrontFacing) { totalEmissiveRadiance += vec3(1.0, 0.45, 0.12) * 1.1; }');
    };
    m.customProgramCacheKey = () => 'typo-frag';
    return m;
  }), [base, data]);
  const whole = useMemo(() => chromeP(0.04), []);
  const p = new THREE.Vector3(), q = new THREE.Quaternion();
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: data.floorY, exposure: (t) => fadeIn(t, 2.4) + 0.5 * (warp(t) >= T0 ? impulse(warp(t) - T0, 9) : 0), envRotation: (t) => sweepEnv(t, 0.3, 8, -0.9, 0.5, 0.3, D45),
      shakes: [{t: 5.0, amp: 0.05, decay: 8}],
      camera: camFrom([[0, [-2.0, 0.5, 12], [0, 0, 0]], [4.0, [-0.6, 0.3, 9.0], [0, 0, 0]], [5.6, [0.6, 0.4, 8.0], [0, 0, 0]], [8.0, [1.0, 0.2, 3.6], [0, 0, -1], 38, 1.5], [10.5, [-0.4, 0.0, 0.0], [0, 0, -4], 42, 1.5], [13, [-1.6, 0.6, 7.0], [0, -0.4, 0]], [17, [0.8, 0.7, 10.0], [0, -0.6, 0]]], portrait ? 2.4 : 1),
    }}
      render={(t) => {
        const S = warp(t);
        if (S < T0) return <mesh geometry={word.geo} material={whole} />;
        return (
          <group>
            {data.frag.map((f, i) => {
              data.sim.sample(i, S, p, q);
              return <group key={i} position={p.clone()} quaternion={q.clone()}><mesh geometry={word.letters[f.li].geo} material={fragMats[i]} position={f.seed.clone().multiplyScalar(-1)} /></group>;
            })}
          </group>
        );
      }} />
  );
};
void easeInOutCubic; void clamp; void ({} as Word) as unknown;
