import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BG_HEX, BRAND, TILE_SEQUENCE } from '../brand';
import { StoryShot } from '../story';
import { HypePostFX } from '../postfx/HypePostFX';

const PARTICLE_COUNT = 1200;

const ParticleField: React.FC<{ burstMode: boolean; localFrame: number }> = ({ burstMode, localFrame }) => {
  const frame = useCurrentFrame();
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = random(`p-ang-${i}`) * Math.PI * 2;
      const radius = 0.4 + random(`p-rad-${i}`) * 8.5;
      const z = (random(`p-z-${i}`) - 0.5) * 8;
      const speed = 0.2 + random(`p-spd-${i}`) * 0.8;
      const scale = 0.04 + random(`p-scl-${i}`) * 0.11;
      const colorHex = TILE_SEQUENCE[i % TILE_SEQUENCE.length].fill;
      return { angle, radius, z, speed, scale, colorHex, seed: i };
    });
  }, []);

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 0.22), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.1 }), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    const burstProgress = burstMode
      ? interpolate(localFrame, [0, 18], [0.05, 1.35], {
          easing: Easing.out(Easing.exp),
          extrapolateRight: 'clamp',
        })
      : 1;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      const t = frame * 0.015 * p.speed;
      const r = p.radius * burstProgress;
      const x = Math.cos(p.angle + t * 0.4) * r;
      const y = Math.sin(p.angle + t * 0.4) * r + Math.sin(t + p.seed) * 0.35;
      const z = p.z + Math.cos(t * 0.8 + p.seed) * 0.4;

      dummy.position.set(x, y, z);
      dummy.rotation.set(t * 1.5 + p.seed, t * 1.1, p.angle);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      color.set(p.colorHex);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [frame, localFrame, burstMode, particles]);

  return <instancedMesh ref={meshRef} args={[geometry, material, PARTICLE_COUNT]} />;
};

const Tile3DCluster: React.FC<{ active: boolean; localFrame: number }> = ({ active, localFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tileGeo = useMemo(() => new THREE.BoxGeometry(1.35, 1.35, 0.32), []);
  const lipGeo = useMemo(() => new THREE.BoxGeometry(1.35, 1.35, 0.18), []);

  if (!active) return null;

  const pop = spring({ fps, frame: localFrame, config: { damping: 12, stiffness: 200 } });

  const positions: [number, number, number][] = [
    [-1.6, 2.2, -1.2],
    [1.6, 2.2, -1.0],
    [-1.6, -2.2, -1.0],
    [1.6, -2.2, -1.2],
  ];

  return (
    <group scale={pop}>
      {TILE_SEQUENCE.map((tile, idx) => {
        const [px, py, pz] = positions[idx];
        const rotY = Math.sin(frame * 0.04 + idx) * 0.45;
        const rotX = Math.cos(frame * 0.03 + idx) * 0.25;
        const rotZ = idx === 1 ? 0.21 : 0;
        return (
          <group key={tile.name} position={[px, py, pz]} rotation={[rotX, rotY, rotZ]}>
            <mesh geometry={tileGeo} position={[0, 0.08, 0.08]}>
              <meshStandardMaterial color={tile.fill} roughness={0.25} />
            </mesh>
            <mesh geometry={lipGeo} position={[0, -0.08, -0.08]}>
              <meshStandardMaterial color={tile.lip} roughness={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const Extruded3DPortal: React.FC<{ active: boolean; localFrame: number; dur: number }> = ({
  active,
  localFrame,
  dur,
}) => {
  const ringGeo = useMemo(() => new THREE.TorusGeometry(2.1, 0.18, 16, 48), []);
  if (!active) return null;

  const dollyZ = interpolate(localFrame, [0, dur], [-3.5, 4.2], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateRight: 'clamp',
  });

  return (
    <group position={[0, 0, dollyZ]}>
      {[0, 1, 2, 3].map((i) => {
        const tile = TILE_SEQUENCE[i];
        return (
          <mesh
            key={i}
            geometry={ringGeo}
            position={[0, 0, -i * 1.4]}
            rotation={[0, 0, localFrame * 0.03 * (i % 2 === 0 ? 1 : -1)]}
          >
            <meshStandardMaterial color={tile.fill} emissive={tile.fill} emissiveIntensity={0.35} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
};

export const ThreeStage: React.FC<{
  shot: StoryShot;
  localFrame: number;
  transitionProgress: number;
}> = ({ shot, localFrame, transitionProgress }) => {
  const bgHex = BG_HEX[shot.bg];
  const showTiles =
    shot.scene === 'feature-beat' ||
    shot.scene === 'logo-reveal-dark' ||
    shot.scene === 'logo-reveal-light' ||
    shot.scene === 'player-filmstrip' ||
    shot.scene === 'end-card';

  const isExtrude = shot.scene === 'extrude-3d';

  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 540, height: 960, transform: 'scale(2)', transformOrigin: '0 0' }}>
      <ThreeCanvas
        width={540}
        height={960}
        dpr={1}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 7], fov: 50 }}
      >
        <color attach="background" args={[bgHex]} />
        <ambientLight intensity={0.85} />
        <directionalLight position={[5, 8, 6]} intensity={1.4} color="#ffffff" />
        <directionalLight position={[-6, -4, 4]} intensity={0.7} color={BRAND.coral} />

        <ParticleField burstMode={shot.scene === 'dot-burst'} localFrame={localFrame} />
        <Tile3DCluster active={showTiles} localFrame={localFrame} />
        <Extruded3DPortal active={isExtrude} localFrame={localFrame} dur={shot.dur} />

        <HypePostFX
          transitionMode={shot.transitionIn}
          transitionProgress={transitionProgress}
          shakeOnHit={shot.shakeOnHit}
          localFrame={localFrame}
        />
      </ThreeCanvas>
    </div>
  );
};
