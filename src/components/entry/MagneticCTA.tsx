"use client";

import { useRef, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

/**
 * Magnetic button with a rotating conic-gradient border ring.
 * Pulls gently toward the cursor; springs back on leave.
 */
export default function MagneticCTA({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  const wrap = useRef<HTMLButtonElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = wrap.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
    if (inner.current) {
      inner.current.style.transform = `translate(${dx * 0.06}px, ${dy * 0.08}px)`;
    }
  };

  const handleLeave = () => {
    const el = wrap.current;
    if (!el) return;
    el.style.transition = "transform 500ms cubic-bezier(0.22, 1.4, 0.36, 1)";
    if (inner.current)
      inner.current.style.transition = "transform 500ms cubic-bezier(0.22, 1.4, 0.36, 1)";
    el.style.transform = "translate(0, 0)";
    if (inner.current) inner.current.style.transform = "translate(0, 0)";
    setTimeout(() => {
      if (el) el.style.transition = "";
      if (inner.current) inner.current.style.transition = "";
    }, 500);
  };

  return (
    <button
      ref={wrap}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      disabled={disabled}
      className="group relative inline-flex rounded-[18px] p-[1.5px] overflow-hidden disabled:opacity-70"
      style={{ willChange: "transform" }}
    >
      {/* rotating conic ring */}
      <span className="conic-ring absolute inset-[-100%]" aria-hidden />
      {/* solid core */}
      <span
        ref={inner}
        className="relative inline-flex items-center gap-3 rounded-[17px] bg-white px-10 py-4.5 text-lg font-bold text-on-background"
        style={{ willChange: "transform" }}
      >
        {children}
        <ArrowRight className="h-5 w-5 text-primary transition-transform duration-300 group-hover:translate-x-1.5" />
      </span>
    </button>
  );
}
