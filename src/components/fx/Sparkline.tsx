"use client";

import { motion } from "framer-motion";

function smoothPath(data: number[], w: number, h: number): string {
  if (data.length < 2) return "";
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / span) * (h * 0.82) - h * 0.09,
  }));
  const first = pts[0]!;
  let d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1]!;
    const p1 = pts[i]!;
    const mx = (p0.x + p1.x) / 2;
    d += ` C ${mx.toFixed(1)} ${p0.y.toFixed(1)}, ${mx.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(
      1
    )} ${p1.y.toFixed(1)}`;
  }
  return d;
}

export default function Sparkline({
  data,
  width = 260,
  height = 64,
  stroke = "rgb(var(--primary))",
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
}) {
  const d = smoothPath(data, width, height);
  const area = `${d} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.16" />
          <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#spark-fill)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      />
    </svg>
  );
}
