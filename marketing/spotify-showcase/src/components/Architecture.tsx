import React from "react";

export const Architecture: React.FC = () => {
  const pillars = Array.from({ length: 24 }, (_, i) => {
    const z = 10 - i * 4.2;
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (5.1 + (i % 3) * 0.3);
    const height = 6.4 + (i % 4) * 0.85;

    return { i, x, z, side, height };
  });

  return (
    <group>
      {pillars.map((p) => (
        <group key={p.i} position={[p.x, 0, p.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.18, p.height, 1.1]} />
            <meshStandardMaterial
              color="#07100b"
              roughness={0.34}
              metalness={0.48}
              envMapIntensity={0.72}
            />
          </mesh>

          <mesh position={[-p.side * 0.108, 0.35, 0]}>
            <boxGeometry args={[0.025, p.height * 0.7, 0.055]} />
            <meshBasicMaterial
              color="#1DB954"
              transparent
              opacity={0.34}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={`beam-${i}`}
          position={[0, 5.4 + (i % 2) * 0.2, 4 - i * 10]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[11.2, 0.12, 0.4]} />
          <meshStandardMaterial
            color="#08120c"
            roughness={0.28}
            metalness={0.6}
            envMapIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};
