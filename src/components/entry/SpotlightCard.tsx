"use client";

import { useRef } from "react";

export default function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={`group relative overflow-hidden rounded-[20px] bg-white border border-black/[0.06] p-6 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[20px]"
        style={{
          background: `radial-gradient(600px circle at var(--mx) var(--my), rgba(0,74,198,0.08), transparent 40%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
