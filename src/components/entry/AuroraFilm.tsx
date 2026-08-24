"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Environment } from "@react-three/drei";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";
import type { StoryState } from "./storyState";

/* ------------------------------------------------------------------ */
/* Shards — InstancedMesh, one draw call                               */
/* ------------------------------------------------------------------ */

const SHARD_COLOR_GREY = new THREE.Color("#D8D4E0");
const SHARD_COLOR_BLUE = new THREE.Color("#004AC6");

function Shards({ story, count }: { story: React.MutableRefObject<StoryState>; count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  const data = useMemo(() => {
    const chaos = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 2);
    const scales = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // chaos: wide flattened sphere
      const r = 2.2 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      chaos[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      chaos[i * 3 + 1] = r * Math.sin(phi) * 0.75;
      chaos[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi) * 0.5 - 1;

      // target: tight funnel column toward Scout panel (left side)
      const t = Math.random();
      target[i * 3] = -2.2 + (Math.random() - 0.5) * (0.9 - t * 0.6);
      target[i * 3 + 1] = -1.6 + t * 3.4;
      target[i * 3 + 2] = -1 + (Math.random() - 0.5) * (0.8 - t * 0.5);

      seeds[i * 2] = Math.random() * Math.PI * 2;
      seeds[i * 2 + 1] = 0.5 + Math.random();
      scales[i] = 0.5 + Math.random() * 0.9;

      colors[i * 3] = SHARD_COLOR_GREY.r;
      colors[i * 3 + 1] = SHARD_COLOR_GREY.g;
      colors[i * 3 + 2] = SHARD_COLOR_GREY.b;
    }
    return { chaos, target, seeds, scales, colors };
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!mesh.current) return;
    const s = story.current;
    const t = state.clock.elapsedTime;
    const c = s.converge;
    const pulse = s.pulse;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const cx = data.chaos[i3]!;
      const cy = data.chaos[i3 + 1]!;
      const cz = data.chaos[i3 + 2]!;
      const tx = data.target[i3]!;
      const ty = data.target[i3 + 1]!;
      const tz = data.target[i3 + 2]!;

      // chaos -> funnel, with organic per-shard lag
      const lag = 0.75 + data.seeds[i * 2 + 1]! * 0.25;
      const k = Math.min(1, c * lag);
      const e = k * k * (3 - 2 * k); // smoothstep

      let x = cx + (tx - cx) * e;
      let y = cy + (ty - cy) * e;
      let z = cz + (tz - cz) * e;

      // idle drift (fades as converged)
      const drift = (1 - e) * 0.6 + 0.08;
      x += Math.sin(t * data.seeds[i * 2]! * 0.7 + i) * 0.12 * drift;
      y += Math.cos(t * data.seeds[i * 2 + 1]! * 0.6 + i * 0.7) * 0.12 * drift;
      z += Math.sin(t * 0.4 + i) * 0.08 * drift;

      dummy.position.set(x, y, z);
      dummy.rotation.set(
        t * 0.3 * data.scales[i]! + data.seeds[i * 2]!,
        t * 0.25 * data.scales[i]!,
        0
      );
      const sc = data.scales[i]! * (0.85 + 0.15 * Math.sin(t + i));
      dummy.scale.setScalar(sc);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);

      // grey -> brand blue pulse
      if (pulse > 0) {
        const w = 0.5 + 0.5 * Math.sin(t * 2.2 + i * 0.35);
        const k2 = pulse * (0.35 + 0.65 * w);
        tmpColor.copy(SHARD_COLOR_GREY).lerp(SHARD_COLOR_BLUE, k2);
        mesh.current.setColorAt(i, tmpColor);
      }
    }

    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor && pulse > 0) {
      mesh.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} key={count}>
      <tetrahedronGeometry args={[0.075]} />
      <meshStandardMaterial roughness={0.35} metalness={0.15} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* Agent panel — frosted glass slab with a live canvas face            */
/* ------------------------------------------------------------------ */

function useCanvasTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 680;
    return c;
  }, []);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [canvas]);

  useFrame(() => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw(ctx, canvas.width, canvas.height);
    texture.needsUpdate = true;
  });

  return texture;
}

function AgentPanel({
  position,
  rotation,
  color,
  story,
  index,
  face,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  story: React.MutableRefObject<StoryState>;
  index: 1 | 2 | 3;
  face?: (ctx: CanvasRenderingContext2D, w: number, h: number, s: StoryState) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const value =
    index === 1 ? story.current.panel1 : index === 2 ? story.current.panel2 : story.current.panel3;

  const tex = useCanvasTexture((ctx, w, h) => {
    if (!face) return;
    face(ctx, w, h, story.current);
  });

  useFrame((state) => {
    if (!group.current) return;
    const v =
      index === 1
        ? story.current.panel1
        : index === 2
          ? story.current.panel2
          : story.current.panel3;
    const t = state.clock.elapsedTime;
    group.current.visible = v > 0.01;
    const targetScale = 0.55 + 0.45 * v;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, targetScale, 0.12));
    group.current.position.y = position[1] + Math.sin(t * 0.8 + index) * 0.08;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      rotation[1] + Math.sin(t * 0.4 + index) * 0.06,
      0.08
    );
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={0.001}>
      {/* glass slab */}
      <RoundedBox args={[1.7, 2.3, 0.09]} radius={0.07} smoothness={6}>
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.32}
          roughness={0.12}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.08}
          side={THREE.DoubleSide}
        />
      </RoundedBox>
      {/* glowing rim */}
      <mesh position={[0, 0, 0.051]}>
        <ringGeometry args={[0, 0.001, 3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {/* live face */}
      {face && (
        <mesh position={[0, 0, 0.052]}>
          <planeGeometry args={[1.5, 1.98]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
      )}
      {/* scan line (Scout only) */}
      {index === 1 && <ScanLine story={story} />}
    </group>
  );
}

function ScanLine({ story }: { story: React.MutableRefObject<StoryState> }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    const s = story.current;
    ref.current.visible = s.panel1 > 0.5 && s.scan > 0.01 && s.scan < 0.99;
    ref.current.position.y = -1 + s.scan * 2;
  });
  return (
    <mesh ref={ref} position={[0, 0, 0.06]}>
      <planeGeometry args={[1.56, 0.035]} />
      <meshBasicMaterial color="#004AC6" transparent opacity={0.9} toneMapped={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* DNA Helix (Writer chapter)                                          */
/* ------------------------------------------------------------------ */

function Helix({ story }: { story: React.MutableRefObject<StoryState> }) {
  const group = useRef<THREE.Group>(null);
  const nodes = useMemo(() => {
    const arr: { pos: [number, number, number]; strand: 0 | 1 }[] = [];
    const N = 46;
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const angle = t * Math.PI * 4;
      const y = -1.4 + t * 2.8;
      arr.push({ pos: [Math.cos(angle) * 0.42, y, Math.sin(angle) * 0.42], strand: 0 });
      arr.push({
        pos: [Math.cos(angle + Math.PI) * 0.42, y, Math.sin(angle + Math.PI) * 0.42],
        strand: 1,
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const s = story.current;
    const t = state.clock.elapsedTime;
    group.current.visible = s.helix > 0.01;
    group.current.rotation.y = t * 0.6;
    group.current.scale.setScalar(0.4 + s.helix * 0.6);
    group.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.opacity = s.helix * 0.95;
      }
    });
  });

  return (
    <group ref={group} position={[2.6, 0.2, -0.6]}>
      {nodes.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial
            color={n.strand === 0 ? "#004AC6" : "#7C3AED"}
            emissive={n.strand === 0 ? "#004AC6" : "#7C3AED"}
            emissiveIntensity={0.35}
            transparent
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Camera rig — reads story cam fields                                 */
/* ------------------------------------------------------------------ */

function CameraRig({ story }: { story: React.MutableRefObject<StoryState> }) {
  useFrame((state) => {
    const s = story.current;
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, s.camX, 0.09);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, s.camY, 0.09);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, s.camZ, 0.09);
    cam.lookAt(s.tX, s.tY, 0);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Film                                                                */
/* ------------------------------------------------------------------ */

const DEMO_LINES = [
  "84 cold DMs. 3 replies.",
  "Here is what changed:",
  "I stopped pitching first.",
  "I listened instead.",
  "Replies tripled in 2 weeks.",
];

function WriterFace(ctx: CanvasRenderingContext2D, w: number, h: number, s: StoryState) {
  ctx.fillStyle = "rgba(251,250,249,0.92)";
  ctx.beginPath();
  ctx.roundRect(24, 24, w - 48, h - 48, 18);
  ctx.fill();

  ctx.fillStyle = "#004AC6";
  ctx.font = "bold 26px monospace";
  ctx.fillText("WRITER", 44, 74);

  ctx.fillStyle = "#1E1B16";
  ctx.font = "22px monospace";
  const total = DEMO_LINES.join("\n").length;
  const typed = Math.floor(s.typing * total);
  let consumed = 0;
  let y = 130;
  for (const line of DEMO_LINES) {
    const take = Math.max(0, Math.min(line.length, typed - consumed));
    if (take > 0) ctx.fillText(line.slice(0, take), 44, y);
    consumed += line.length;
    y += 44;
    if (consumed >= typed) break;
  }
  if (typed > 0 && typed < total) {
    ctx.fillRect(44, y - 26, 12, 24); // cursor block
  }
}

function ScoutFace(ctx: CanvasRenderingContext2D, w: number, h: number, s: StoryState) {
  ctx.fillStyle = "rgba(251,250,249,0.92)";
  ctx.beginPath();
  ctx.roundRect(24, 24, w - 48, h - 48, 18);
  ctx.fill();

  ctx.fillStyle = "#7C3AED";
  ctx.font = "bold 26px monospace";
  ctx.fillText("SCOUT", 44, 74);

  const hooks = ["DATA", "STORY", "CONTRARIAN"];
  hooks.forEach((hook, i) => {
    const reveal = Math.max(0, Math.min(1, (s.scan - 0.25 - i * 0.22) * 4));
    if (reveal <= 0) return;
    ctx.globalAlpha = reveal;
    ctx.fillStyle = "#1E1B16";
    ctx.font = "24px monospace";
    ctx.fillText(`> ${hook}`, 44, 140 + i * 52);
    ctx.globalAlpha = 1;
  });
}

export default function AuroraFilm({
  story,
  shardCount,
}: {
  story: React.MutableRefObject<StoryState>;
  shardCount: number;
}) {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.95} />
          <directionalLight position={[4, 6, 5]} intensity={1.5} />
          <directionalLight position={[-5, -3, 4]} intensity={0.55} color="#A5B4FC" />
          <pointLight position={[0, 0, 3.5]} intensity={18} color="#FDBA74" distance={12} />

          <CameraRig story={story} />
          <Shards story={story} count={shardCount} />

          <AgentPanel
            index={1}
            position={[-2.2, 0.1, -0.8]}
            rotation={[0, 0.28, 0]}
            color="#C7D2FE"
            story={story}
            face={ScoutFace}
          />
          <AgentPanel
            index={2}
            position={[2.4, 0, -0.9]}
            rotation={[0, -0.3, 0]}
            color="#BAE6FD"
            story={story}
            face={WriterFace}
          />
          <AgentPanel
            index={3}
            position={[0.1, 0.2, -2.2]}
            rotation={[0, 0.05, 0]}
            color="#FDBA74"
            story={story}
          />

          <Helix story={story} />

          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
