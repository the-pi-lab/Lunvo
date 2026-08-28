"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export interface KineticToken {
  t: string;
  em?: boolean;
}

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export default function KineticHeading({
  lines,
  className = "",
  as: Tag = "h1",
  emClassName = "italic text-primary",
}: {
  lines: KineticToken[][];
  className?: string;
  as?: "h1" | "h2" | "p";
  emClassName?: string;
}) {
  const MotionTag = motion[Tag] as typeof motion.h1;

  return (
    <MotionTag className={className} style={{ perspective: 800 }}>
      {lines.map((tokens, li) => (
        <span key={li} className="block">
          {tokens.map((token, ti) => (
            <span key={ti} className={token.em ? emClassName : undefined}>
              {token.t.split(" ").map((word, wi, arr) => {
                const delay = li * 0.18 + ti * 0.32 + wi * 0.055;
                return (
                  <span
                    key={wi}
                    className="inline-block overflow-hidden pb-[0.09em] -mb-[0.09em] align-bottom"
                  >
                    <motion.span
                      className="inline-block will-change-transform"
                      initial={{ y: "115%", filter: "blur(10px)", opacity: 0 }}
                      animate={{ y: "0%", filter: "blur(0px)", opacity: 1 }}
                      transition={{ duration: 0.95, ease: EASE, delay }}
                    >
                      {word}
                    </motion.span>
                    {wi < arr.length - 1 ? <span>&nbsp;</span> : null}
                  </span>
                );
              })}
              {ti < tokens.length - 1 ? <span>&nbsp;</span> : null}
            </span>
          ))}
        </span>
      ))}
    </MotionTag>
  );
}

export function KineticStagger({
  children,
  className,
  delay = 0.5,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const kineticEase = EASE;
