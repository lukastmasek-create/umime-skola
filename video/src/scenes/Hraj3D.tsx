import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Center, Text3D } from "@react-three/drei";
import font from "three/examples/fonts/helvetiker_bold.typeface.json";
import { C } from "../theme";

const LETTERS = "HRAJ.".split("");
const COLORS = [C.coral, C.yellow, C.green, C.blue, C.yellow];

// 3D písmena, každé přilétne z jiné strany; kamera proletí skrz.
export const Hraj3D = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const camZ = interpolate(f, [0, 120, 170], [14, 9, -2], {
    easing: ease,
    extrapolateRight: "clamp",
  });
  const camX = interpolate(f, [0, 210], [-3, 2]);

  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [camX, 0.6, camZ], fov: 40 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[6, 8, 8]} intensity={2.4} />
        <pointLight position={[-6, -2, 4]} intensity={60} color={C.brand} />
        <Center>
          {LETTERS.map((ch, i) => {
            const t = interpolate(f, [i * 7, i * 7 + 40], [0, 1], {
              easing: ease,
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const dir = i % 2 ? 1 : -1;
            return (
              <group
                key={i}
                position={[i * 2.1 - 4.2, (1 - t) * dir * 8, (1 - t) * -12]}
                rotation={[(1 - t) * 3 * dir, (1 - t) * 4, Math.sin((f + i * 12) / 30) * 0.06]}
              >
                <Text3D
                  font={font as never}
                  size={2.2}
                  height={0.9}
                  bevelEnabled
                  bevelSize={0.05}
                  bevelThickness={0.06}
                  curveSegments={10}
                >
                  {ch}
                  <meshStandardMaterial color={COLORS[i]} roughness={0.35} metalness={0.1} />
                </Text3D>
              </group>
            );
          })}
        </Center>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
