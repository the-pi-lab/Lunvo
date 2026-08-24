"use client";

/**
 * Story state — a single mutable object that the GSAP master timeline
 * tweens, and the R3F useFrame loop reads. Zero React re-renders.
 */
export interface StoryState {
  converge: number; // 0..1  shards chaos -> beam
  panel1: number; //   0..1  Scout materialize
  panel2: number; //   0..1  Writer materialize
  panel3: number; //   0..1  Critic materialize
  scan: number; //     0..1  scan-line position on Scout
  helix: number; //    0..1  DNA helix reveal
  typing: number; //   0..1  typed post on Writer
  ring: number; //     0..1  score ring sweep
  score: number; //    0..94 counter
  pulse: number; //    0..1  grey -> brand-blue shard pulse
  formation: number; // 0..1  final formation
  mockup: number; //   0..1  dashboard mockup fade
  camX: number;
  camY: number;
  camZ: number;
  tX: number;
  tY: number;
}

export function createStoryState(): StoryState {
  return {
    converge: 0,
    panel1: 0,
    panel2: 0,
    panel3: 0,
    scan: 0,
    helix: 0,
    typing: 0,
    ring: 0,
    score: 0,
    pulse: 0,
    formation: 0,
    mockup: 0,
    camX: 0,
    camY: 0,
    camZ: 7.2,
    tX: 0,
    tY: 0,
  };
}
