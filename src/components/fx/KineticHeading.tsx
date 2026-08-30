"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const TagComponent = Tag as "h1" | "h2" | "p";

  return (
    <TagComponent className={className}>
      {lines.map((tokens, li) => (
        <span key={li} className="block leading-tight">
          {tokens.map((token, ti) => (
            <span key={ti} className={token.em ? emClassName : undefined}>
              {token.t.split(" ").map((word, wi, arr) => {
                const delay = li * 0.15 + ti * 0.25 + wi * 0.04;
                return (
                  <span key={wi} className="inline-block overflow-hidden align-baseline">
                    <motion.span
                      className="inline-block will-change-transform"
                      initial={mounted ? { y: "100%", opacity: 0 } : false}
                      animate={{ y: "0%", opacity: 1 }}
                      transition={{ duration: 0.7, ease: EASE, delay }}
                    >
                      <span className={token.em ? emClassName : "text-zinc-900"}>{word}</span>
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
    </TagComponent>
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
