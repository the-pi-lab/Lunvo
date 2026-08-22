"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import PageTransition from "@/components/motion/PageTransition";

export default function DashboardTemplate({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <PageTransition>{children}</PageTransition>
    </MotionConfig>
  );
}
