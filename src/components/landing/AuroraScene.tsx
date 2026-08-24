"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

/** A frosted pastel glass panel drifting in space. */
function GlassPanel({
  position,
  rotation,
  size = [1.6, 2.2],
  color = "#A5B4FC",
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  size?: [number, number];
  color?: string;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.z = rotation[2] + Math.sin(t * 0.3) * 0.08;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={mesh} position={position} rotation={rotation}>
        <boxGeometry args={[size[0], size[1], 0.06]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.45}
          roughness={0.15}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.55}
          thickness={0.6}
          ior={1.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
}

/** Soft pastel orb. */
function Orb({
  position,
  color,
  radius = 0.35,
}: {
  position: [number, number, number];
  color: string;
  radius?: number;
}) {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={2}>
      <mesh position={position}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
    </Float>
  );
}

function SceneRig() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const { pointer } = state;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      pointer.x * 0.25,
      0.05
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -pointer.y * 0.15,
      0.05
    );
  });

  return (
    <group ref={group}>
      <GlassPanel position={[-2.6, 0.4, -1]} rotation={[0.1, 0.5, -0.15]} color="#A5B4FC" />
      <GlassPanel
        position={[2.7, -0.3, -1.4]}
        rotation={[-0.05, -0.55, 0.12]}
        size={[1.4, 1.9]}
        color="#7DD3FC"
      />
      <GlassPanel
        position={[0.4, 1.7, -2.4]}
        rotation={[0.15, 0.1, 0.35]}
        size={[1.1, 1.5]}
        color="#FDBA74"
      />
      <GlassPanel
        position={[-0.8, -1.8, -2]}
        rotation={[0.08, 0.3, -0.28]}
        size={[1.2, 1.6]}
        color="#6EE7B7"
      />

      <Orb position={[3.4, 1.8, -0.5]} color="#F9A8D4" radius={0.28} />
      <Orb position={[-3.4, -1.5, -0.6]} color="#FDBA74" radius={0.32} />
      <Orb position={[1.6, -1.4, 0.2]} color="#A5B4FC" radius={0.22} />
      <Orb position={[-1.7, 2, -1.2]} color="#6EE7B7" radius={0.2} />
    </group>
  );
}

export default function AuroraScene() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[4, 6, 5]} intensity={1.4} color="#FFFFFF" />
          <directionalLight position={[-5, -3, 4]} intensity={0.6} color="#A5B4FC" />
          <pointLight position={[0, 0, 3]} intensity={0.5} color="#FDBA74" />

          <SceneRig />

          <Environment preset="city" />
          <ContactShadows
            position={[0, -3.2, 0]}
            opacity={0.18}
            scale={12}
            blur={2.6}
            far={5}
            color="#004AC6"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
