"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const fadeSlide = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.06 },
  },
};

export const staggerChild = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      variants={fadeSlide}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
