"use client";

import { useRef } from "react";

export default function TiltCard({
  children,
  className = "",
  max = 5,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.transition = "transform 80ms linear";
    el.style.transform = `perspective(1100px) rotateX(${(0.5 - py) * max * 2}deg) rotateY(${
      (px - 0.5) * max * 2
    }deg) translateZ(0)`;
    if (glare.current) {
      glare.current.style.opacity = "1";
      glare.current.style.background = `radial-gradient(480px circle at ${px * 100}% ${
        py * 100
      }%, rgba(255,255,255,0.55), transparent 45%)`;
    }
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg)";
    if (glare.current) glare.current.style.opacity = "0";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative will-change-transform ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        ref={glare}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-500"
      />
      {children}
    </div>
  );
}
