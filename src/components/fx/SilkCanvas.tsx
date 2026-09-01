"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uIntensity;
  uniform float uTint;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = r * p * 2.0 + vec2(3.1);
      a *= 0.55;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.055;
    vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    vec2 m = uMouse * 0.4;

    vec2 q = vec2(fbm(p * 1.35 + t), fbm(p * 1.35 - t * 0.7 + 4.7));
    vec2 warp = p * 1.6 + q * 1.45 + m * fbm(p * 2.0 - t) * 0.65;

    float band1 = fbm(warp + vec2(t * 0.5, 0.0));
    float band2 = fbm(warp * 1.8 - vec2(0.0, t * 0.35) + 2.3);
    float band3 = fbm(warp * 0.6 + vec2(3.3 - t * 0.2));

    vec3 cream = vec3(0.86, 0.852, 0.842);

    vec3 col;
    if (uTint < 0.5) {
      // Aurora — soft pastel (dashboard / calm)
      vec3 lav   = vec3(0.647, 0.706, 0.988);
      vec3 sky   = vec3(0.490, 0.827, 0.988);
      vec3 peach = vec3(0.992, 0.729, 0.455);
      vec3 mint  = vec3(0.431, 0.906, 0.718);
      vec3 blue  = vec3(0.000, 0.290, 0.780);
      col = cream;
      col = mix(col, mix(lav, sky, band2), smoothstep(0.34, 0.86, band1) * 0.74 * uIntensity);
      col = mix(col, peach, smoothstep(0.55, 0.96, band3) * 0.48 * uIntensity);
      col = mix(col, mint, smoothstep(0.62, 0.98, band2) * 0.38 * uIntensity);
      col = mix(col, blue, smoothstep(0.80, 1.02, band1 * band2 * 2.1) * 0.20 * uIntensity);
    } else {
      // Liquid Amethyst — vivid violet / indigo / magenta flow (hero)
      vec3 vio   = vec3(0.420, 0.270, 0.880);
      vec3 ind   = vec3(0.290, 0.380, 0.980);
      vec3 mag   = vec3(0.780, 0.360, 0.980);
      vec3 lil   = vec3(0.620, 0.520, 1.000);
      vec3 pink  = vec3(0.980, 0.560, 0.860);
      col = mix(vec3(0.972, 0.968, 0.992), lil, 0.18);
      col = mix(col, mix(vio, ind, band2), smoothstep(0.30, 0.92, band1) * 0.72 * uIntensity);
      col = mix(col, mag, smoothstep(0.52, 0.98, band3) * 0.42 * uIntensity);
      col = mix(col, pink, smoothstep(0.66, 1.0, band2) * 0.26 * uIntensity);
      col = mix(col, vio, smoothstep(0.82, 1.05, band1 * band3 * 2.2) * 0.30 * uIntensity);
    }

    float md = length(uv - (uMouse * 0.5 + 0.5));
    vec3 glow = (uTint < 0.5) ? vec3(0.0, 0.290, 0.780) : vec3(0.520, 0.320, 1.0);
    col += glow * exp(-md * 6.5) * 0.07 * uIntensity;

    float vig = smoothstep(1.25, 0.32, length((uv - 0.5) * vec2(1.15, 1.35)));
    col = mix(cream, col, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function SilkPlane({
  intensity,
  speed,
  tint,
  isVisible,
}: {
  intensity: number;
  speed: number;
  tint: "aurora" | "purple";
  isVisible: boolean;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const target = useRef(new THREE.Vector2(0, 0));
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: intensity },
      uTint: { value: tint === "purple" ? 1 : 0 },
    }),
    [intensity, tint]
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    if (!isVisible) return; // 0 CPU/GPU calculation when tab or element is hidden
    const u = mat.current?.uniforms as
      | {
          uTime: { value: number };
          uMouse: { value: THREE.Vector2 };
          uRes: { value: THREE.Vector2 };
        }
      | undefined;
    if (!u) return;
    mouse.current.lerp(target.current, 0.045);
    u.uTime.value = state.clock.elapsedTime * speed;
    u.uMouse.value.copy(mouse.current);
    u.uRes.value.set(size.width * viewport.dpr, size.height * viewport.dpr);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function SilkCanvas({
  intensity = 1,
  speed = 1,
  tint = "aurora",
  className = "",
}: {
  intensity?: number;
  speed?: number;
  tint?: "aurora" | "purple";
  className?: string;
}) {
  const [ok, setOk] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setOk(!reduced);

    // Pause rendering when tab is hidden (saves CPU & battery)
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // IntersectionObserver to pause when out of viewport
    let observer: IntersectionObserver | null = null;
    if (containerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) setIsVisible(entry.isIntersecting && !document.hidden);
        },
        { threshold: 0.05 }
      );
      observer.observe(containerRef.current);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (observer) observer.disconnect();
    };
  }, []);

  if (!ok)
    return <div ref={containerRef} className={`absolute inset-0 ${className}`} aria-hidden />;

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`} aria-hidden>
      <Canvas
        dpr={[1, 1.25]}
        frameloop={isVisible ? "always" : "never"}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 1] }}
        style={{ position: "absolute", inset: 0 }}
      >
        <SilkPlane intensity={intensity} speed={speed} tint={tint} isVisible={isVisible} />
      </Canvas>
    </div>
  );
}
