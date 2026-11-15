import React, { forwardRef, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { useCurrentFrame } from 'remotion';
import { TransitionType } from '../story';

const FRAGMENT_SHADER = /* glsl */ `
uniform float uTime;
uniform float uTransitionProgress;
uniform int uTransitionMode;
uniform float uHitAberration;
uniform float uGrainIntensity;
uniform float uVignetteDarkness;
uniform vec2 uResolution;

float hash12(vec2 p) {
  vec3 p3  = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 sampleUv = uv;
  float p = clamp(uTransitionProgress, 0.0, 1.0);

  if (uTransitionMode == 1 && p > 0.001) {
    float shift = p * p * 0.18;
    vec4 acc = vec4(0.0);
    for (int i = 0; i < 6; i++) {
      float fi = float(i) / 5.0 - 0.5;
      acc += texture2D(inputBuffer, clamp(uv + vec2(fi * shift, 0.0), 0.0, 1.0));
    }
    outputColor = acc / 6.0;
    return;
  }

  if (uTransitionMode == 2 && p > 0.001) {
    vec2 dir = uv - vec2(0.5);
    vec4 acc = vec4(0.0);
    for (int i = 0; i < 6; i++) {
      float scale = 1.0 - float(i) * p * 0.045;
      acc += texture2D(inputBuffer, clamp(vec2(0.5) + dir * scale, 0.0, 1.0));
    }
    outputColor = acc / 6.0;
    return;
  }

  if (uTransitionMode == 3 && p > 0.001) {
    float stripe = fract(uv.y * 18.0);
    float offset = step(stripe, p) * p * 0.08;
    sampleUv.x = clamp(uv.x + offset, 0.0, 1.0);
  }

  float extraRgb = 0.0;
  if (uTransitionMode == 4 && p > 0.001) {
    float blockY = floor(uv.y * 24.0);
    float n = hash12(vec2(blockY, floor(uTime * 30.0)));
    if (n < p * 0.85) {
      sampleUv.x = fract(uv.x + (n - 0.5) * 0.22 * p);
    }
    extraRgb = p * 0.025;
  }

  float ca = uHitAberration + extraRgb + p * 0.006;
  vec2 caOffset = (sampleUv - vec2(0.5)) * ca;
  float r = texture2D(inputBuffer, clamp(sampleUv + caOffset, 0.0, 1.0)).r;
  float g = texture2D(inputBuffer, sampleUv).g;
  float b = texture2D(inputBuffer, clamp(sampleUv - caOffset, 0.0, 1.0)).b;
  vec3 col = vec3(r, g, b);

  if (uTransitionMode == 5 && p > 0.001) {
    float lineY = 1.0 - p;
    float dist = abs(uv.y - lineY);
    float beam = smoothstep(0.03, 0.0, dist);
    col = mix(col, vec3(1.0, 0.353, 0.235), beam);
  }

  if (uTransitionMode == 7 && p > 0.5) {
    col = mix(col, vec3(1.0, 0.353, 0.235), (p - 0.5) * 1.5);
  }

  float scanline = sin(uv.y * uResolution.y * 0.7) * 0.018;
  col -= scanline;

  float grain = (hash12(uv * uResolution + vec2(uTime * 71.7, uTime * 19.3)) - 0.5) * uGrainIntensity;
  col += grain;

  vec2 vigUv = uv * (1.0 - uv.yx);
  float vig = vigUv.x * vigUv.y * 15.0;
  vig = pow(clamp(vig, 0.0, 1.0), uVignetteDarkness);
  col *= mix(0.76, 1.0, vig);

  outputColor = vec4(col, inputColor.a);
}
`;

const MODE_MAP: Record<TransitionType, number> = {
  hard: 0,
  whip: 1,
  zoom: 2,
  stripes: 3,
  glitch: 4,
  laser: 5,
  shape: 6,
  flash: 7,
};

class HypeCustomEffectImpl extends Effect {
  constructor() {
    super('HypeCustomEffect', FRAGMENT_SHADER, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ['uTime', new Uniform(0)],
        ['uTransitionProgress', new Uniform(0)],
        ['uTransitionMode', new Uniform(0)],
        ['uHitAberration', new Uniform(0)],
        ['uGrainIntensity', new Uniform(0.045)],
        ['uVignetteDarkness', new Uniform(0.22)],
        ['uResolution', new Uniform(new Vector2(1080, 1920))],
      ]),
    });
  }
}

const HypeShaderPass = forwardRef<
  Effect,
  {
    frame: number;
    transitionMode: TransitionType;
    transitionProgress: number;
    hitAberration: number;
  }
>(({ frame, transitionMode, transitionProgress, hitAberration }, ref) => {
  const effect = useMemo(() => new HypeCustomEffectImpl(), []);

  effect.uniforms.get('uTime')!.value = frame / 30;
  effect.uniforms.get('uTransitionProgress')!.value = transitionProgress;
  effect.uniforms.get('uTransitionMode')!.value = MODE_MAP[transitionMode] ?? 0;
  effect.uniforms.get('uHitAberration')!.value = hitAberration;

  return <primitive ref={ref} object={effect} dispose={null} />;
});

HypeShaderPass.displayName = 'HypeShaderPass';

export const HypePostFX: React.FC<{
  transitionMode: TransitionType;
  transitionProgress: number;
  shakeOnHit?: boolean;
  localFrame: number;
}> = ({ transitionMode, transitionProgress, shakeOnHit, localFrame }) => {
  const frame = useCurrentFrame();
  const { gl, scene, camera, invalidate } = useThree();

  const hitAberration = shakeOnHit && localFrame < 6 ? (1 - localFrame / 6) * 0.018 : 0.002;

  useEffect(() => {
    const win = window as unknown as { post?: { kick?: () => void } };
    win.post = win.post || {};
    win.post.kick = () => {
      invalidate();
    };
  }, [frame, gl, scene, camera, invalidate]);

  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom intensity={0.45} luminanceThreshold={0.72} luminanceSmoothing={0.25} mipmapBlur />
      <HypeShaderPass
        frame={frame}
        transitionMode={transitionMode}
        transitionProgress={transitionProgress}
        hitAberration={hitAberration}
      />
    </EffectComposer>
  );
};
