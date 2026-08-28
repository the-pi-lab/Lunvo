"use client";

export interface StoryState {
  dustConverge: number;
  docScale: number;
  docTilt: number;
  hookReveal: number;
  scan: number;
  typing: number;
  helix: number;
  ring: number;
  score: number;
  pulse: number;
  formation: number;
  mockup: number;
  camX: number;
  camY: number;
  camZ: number;
  tX: number;
  tY: number;
}

export function createStoryState(): StoryState {
  return {
    dustConverge: 0,
    docScale: 0.88,
    docTilt: 0.18,
    hookReveal: 0,
    scan: 0,
    helix: 0,
    typing: 0,
    ring: 0,
    score: 0,
    pulse: 0,
    formation: 0,
    mockup: 0,
    camX: 0,
    camY: 0.2,
    camZ: 6.8,
    tX: 0,
    tY: 0,
  };
}
