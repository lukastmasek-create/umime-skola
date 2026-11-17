import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

const StudioEnvironment: React.FC = () => {
  const { gl, scene } = useThree();

  useLayoutEffect(() => {
    const previous = scene.environment;

    const pmrem = new THREE.PMREMGenerator(gl);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color("#030504");

    const addPanel = (
      color: string,
      intensity: number,
      position: [number, number, number],
      scale: [number, number],
      rotation: [number, number, number]
    ) => {
      const geometry = new THREE.PlaneGeometry(scale[0], scale[1]);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position[0], position[1], position[2]);
      mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
      envScene.add(mesh);
    };

    // HDR-like studio lightformers by direct color multiplication.
    addPanel("#ffffff", 4.0, [0, 8, 0], [10, 8], [-Math.PI / 2, 0, 0]);
    addPanel("#1DB954", 2.6, [-7, 2, 1], [8, 7], [0, Math.PI / 2, 0]);
    addPanel("#dfffe9", 2.0, [7, 1, -1], [8, 7], [0, -Math.PI / 2, 0]);
    addPanel("#07150d", 1.2, [0, 2, -8], [10, 6], [0, 0, 0]);
    addPanel("#020302", 0.8, [0, -5, 0], [8, 8], [Math.PI / 2, 0, 0]);

    const env = pmrem.fromScene(envScene, 0.04).texture;

    scene.environment = env;
    (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity =
      1.05;

    envScene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();

      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });

    return () => {
      scene.environment = previous;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
};

export const StudioLighting: React.FC<{ frame: number }> = ({ frame }) => {
  const sweep = Math.sin(frame * 0.015) * 7;
  const sweep2 = Math.cos(frame * 0.011) * 5;

  return (
    <>
      <color attach="background" args={["#030504"]} />
      <fogExp2 attach="fog" args={["#050705", 0.0165]} />

      <StudioEnvironment />

      <ambientLight intensity={0.16} color="#dfffe9" />

      <directionalLight
        position={[6, 9, 8]}
        intensity={3.0}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={0.1}
        shadow-camera-far={80}
        shadow-bias={-0.00015}
      />

      <spotLight
        position={[-6, 5, 5]}
        angle={0.52}
        penumbra={0.9}
        intensity={65}
        distance={45}
        color="#1DB954"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <pointLight position={[4, -1, 2]} intensity={14} color="#0e8138" />
      <pointLight position={[0, 3, -18]} intensity={26} color="#1DB954" />
      <pointLight position={[0, 3, -48]} intensity={20} color="#0b8f3b" />

      <pointLight
        position={[sweep, 2.6, 4.5]}
        intensity={26}
        color="#33ff88"
        distance={18}
      />

      <pointLight
        position={[sweep2, 1.8, -30]}
        intensity={20}
        color="#1DB954"
        distance={22}
      />

      <Ground />
      <Backdrop frame={frame} />
    </>
  );
};

const Ground: React.FC = () => {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -3.25, -40]}
      receiveShadow
    >
      <planeGeometry args={[120, 180, 1, 1]} />
      <meshStandardMaterial
        color="#040604"
        roughness={0.38}
        metalness={0.52}
        envMapIntensity={0.75}
      />
    </mesh>
  );
};

const Backdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGreen: { value: new THREE.Color("#1DB954") },
    }),
    []
  );

  useLayoutEffect(() => {
    uniforms.uTime.value = frame / 60;
  }, [frame, uniforms]);

  return (
    <>
      <mesh position={[0, 2, -98]} scale={[100, 100, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 uGreen;

            void main() {
              vec2 p = vUv * 2.0 - 1.0;
              p.x *= 0.72;
              float r = length(p);
              float halo = smoothstep(1.08, 0.0, r);
              float bands = 0.5 + 0.5 * sin(
                p.y * 8.0 +
                sin(p.x * 4.0 + uTime * 0.15) * 1.4 -
                uTime * 0.18
              );

              vec3 col = mix(vec3(0.004, 0.009, 0.006), uGreen, halo * 0.16);
              col += uGreen * smoothstep(0.98, 0.0, r) * 0.05;
              col += uGreen * bands * 0.012;

              gl_FragColor = vec4(col, 1.0);
            }
          `}
        />
      </mesh>

      <Dust frame={frame} />
    </>
  );
};

const Dust: React.FC<{ frame: number }> = ({ frame }) => {
  const count = 620;

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const a = Math.sin(i * 127.1) * 43758.5453;
      const b = Math.sin(i * 311.7) * 43758.5453;
      const c = Math.sin(i * 74.7 + 2.1) * 43758.5453;

      const rx = a - Math.floor(a);
      const ry = b - Math.floor(b);
      const rz = c - Math.floor(c);

      positions[i * 3 + 0] = -8 + rx * 16;
      positions[i * 3 + 1] = -2.8 + ry * 9;
      positions[i * 3 + 2] = 8 - rz * 104;

      seeds[i] = ry;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return geo;
  }, []);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useLayoutEffect(() => {
    uniforms.uTime.value = frame / 60;
  }, [frame, uniforms]);

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          attribute float aSeed;
          uniform float uTime;
          varying float vAlpha;

          void main() {
            vec3 p = position;
            p.y += sin(uTime * 0.4 + aSeed * 6.283 + position.z * 0.1) * 0.24;
            p.x += cos(uTime * 0.25 + aSeed * 6.283) * 0.13;

            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = (2.0 + 5.0 * aSeed) * (300.0 / max(1.0, -mv.z));
            gl_Position = projectionMatrix * mv;

            vAlpha = smoothstep(90.0, 6.0, -mv.z) * (0.18 + 0.82 * aSeed);
          }
        `}
        fragmentShader={`
          varying float vAlpha;

          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
            vec3 col = mix(vec3(0.07, 0.25, 0.13), vec3(0.45, 1.0, 0.62), vAlpha);
            gl_FragColor = vec4(col, alpha * 0.32);
          }
        `}
      />
    </points>
  );
};
