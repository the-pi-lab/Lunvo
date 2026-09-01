"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Environment, Float, ContactShadows } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import type { StoryState } from "./storyState";

function Dust({ story, count }: { story: React.MutableRefObject<StoryState>; count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 4 + Math.random() * 6;
      pos[i * 3] = Math.cos(angle) * radius * 0.7;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = Math.sin(angle) * radius * 0.3 - 1.5;
      seed[i] = Math.random() * Math.PI * 2;
    }
    return { pos, seed };
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    const converge = story.current.dustConverge;
    for (let i = 0; i < count; i++) {
      const x = data.pos[i * 3]! * (1 - converge * 0.7);
      const y = data.pos[i * 3 + 1]! + Math.sin(t * 0.2 + data.seed[i]!) * 0.1;
      const z = data.pos[i * 3 + 2]!;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.04 + Math.sin(t + i) * 0.01);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial color="#E8E0F0" transparent opacity={0.35} roughness={0.8} />
    </instancedMesh>
  );
}

function Document({ story }: { story: React.MutableRefObject<StoryState> }) {
  const group = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!group.current) return;
    const s = story.current;
    group.current.rotation.y = s.docTilt * 0.15;
    group.current.rotation.x = s.docTilt * 0.08;
    group.current.scale.setScalar(0.9 + s.docScale * 0.12);
    if (scanRef.current) {
      scanRef.current.visible = s.scan > 0.05 && s.scan < 0.95;
      scanRef.current.position.y = -1.2 + s.scan * 2.4;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <RoundedBox args={[1.9, 2.6, 0.06]} radius={0.08} smoothness={4}>
        <meshPhysicalMaterial
          color="white"
          transparent
          opacity={0.92}
          roughness={0.12}
          metalness={0.02}
          clearcoat={1}
          clearcoatRoughness={0.15}
          transmission={0.12}
          thickness={0.4}
          ior={1.45}
        />
      </RoundedBox>
      <mesh ref={scanRef} position={[0, 0, 0.04]}>
        <planeGeometry args={[1.7, 0.02]} />
        <meshBasicMaterial color="#004AC6" transparent opacity={0.7} />
      </mesh>
      {/* inner content lines */}
      <group position={[0, 0, 0.031]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0, 0.85 - i * 0.32, 0]}>
            <planeGeometry args={[1.5 - (i === 0 ? 0 : 0.2), 0.04]} />
            <meshBasicMaterial
              color={i === 0 ? "#004AC6" : "#E8E0F0"}
              transparent
              opacity={i === 0 ? 0.9 : 0.5}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Helix({ story }: { story: React.MutableRefObject<StoryState> }) {
  const group = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 40; i++) {
      const t = i / 40;
      const a = t * Math.PI * 4;
      const y = -1.2 + t * 2.4;
      arr.push([Math.cos(a) * 0.45, y, Math.sin(a) * 0.45]);
      arr.push([Math.cos(a + Math.PI) * 0.45, y, Math.sin(a + Math.PI) * 0.45]);
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    group.current.visible = story.current.helix > 0.05;
    group.current.rotation.y = state.clock.elapsedTime * 0.4;
    group.current.scale.setScalar(0.5 + story.current.helix * 0.5);
  });

  return (
    <group ref={group} position={[1.8, 0, -0.5]}>
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#004AC6" : "#7C3AED"}
            emissive={i % 2 === 0 ? "#004AC6" : "#7C3AED"}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig({ story }: { story: React.MutableRefObject<StoryState> }) {
  useFrame((state) => {
    const s = story.current;
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, s.camX, 0.06);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, s.camY, 0.06);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, s.camZ, 0.06);
    cam.lookAt(s.tX, s.tY, 0);
  });
  return null;
}

export default function AuroraFilm({
  story,
  shardCount,
}: {
  story: React.MutableRefObject<StoryState>;
  shardCount: number;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 38 }}
        dpr={[1, 1.25]}
        frameloop={isVisible ? "always" : "never"}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={1.1} />
          <directionalLight position={[-5, 2, 3]} intensity={0.4} color="#A5B4FC" />
          <CameraRig story={story} />
          <Dust story={story} count={shardCount} />
          <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.4}>
            <Document story={story} />
          </Float>
          <Helix story={story} />
          <ContactShadows
            position={[0, -1.8, 0]}
            opacity={0.18}
            scale={5}
            blur={2.2}
            far={4}
            color="#004AC6"
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
