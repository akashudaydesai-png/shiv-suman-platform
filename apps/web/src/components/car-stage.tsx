"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

function CarModel() {
  return (
    <group rotation={[0.08, -0.45, 0]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[3.2, 0.7, 1.35]} />
        <meshStandardMaterial color="#00796f" metalness={0.15} roughness={0.45} />
      </mesh>
      <mesh position={[0.15, 0.78, 0]}>
        <boxGeometry args={[1.65, 0.65, 1.05]} />
        <meshStandardMaterial color="#0f8f77" metalness={0.12} roughness={0.35} />
      </mesh>
      {[-1.05, 1.05].map((x) =>
        [-0.68, 0.68].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.28, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.22, 32]} />
            <meshStandardMaterial color="#14211f" roughness={0.55} />
          </mesh>
        ))
      )}
      <mesh position={[1.75, 0.18, 0]}>
        <boxGeometry args={[0.12, 0.24, 0.82]} />
        <meshStandardMaterial color="#ff8a00" emissive="#ff8a00" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export function CarStage() {
  return (
    <div className="h-[360px] w-full rounded-md border border-brand-teal/20 bg-white">
      <Canvas camera={{ position: [4.2, 2.2, 4.2], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight intensity={1.4} position={[4, 5, 4]} />
        <CarModel />
        <OrbitControls autoRotate autoRotateSpeed={2.2} enablePan={false} />
      </Canvas>
    </div>
  );
}
