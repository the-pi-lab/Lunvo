"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

import SmoothScroll from "@/components/entry/SmoothScroll";
import AuroraFilm from "@/components/entry/AuroraFilm";
import LogoMarquee from "@/components/entry/LogoMarquee";
import MagneticCTA from "@/components/entry/MagneticCTA";
import { createStoryState } from "@/components/entry/storyState";
import {
  ChapterBlock,
  SplitWords,
  ScoreRing,
  ProgressRail,
  FinalCTA,
  FlashOverlay,
} from "@/components/entry/ChapterOverlays";

const AuroraFilmDynamic = dynamic(() => import("@/components/entry/AuroraFilm"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

/* Chapter copy — huge, minimal, one line each */
const COPY = {
  ch1: "Every idea starts as chaos.",
  ch2: "SCOUT finds the angle nobody sees.",
  ch3: "WRITER clones your voice.",
  ch4: "CRITIC gives no mercy.",
};

const BG_SHIFTS = ["#FBFAF9", "#F5F3FC", "#EFF6FD", "#FDF6EC", "#FBFAF9"];

export default function EntryPage() {
  const router = useRouter();
  const story = useRef<ReturnType<typeof createStoryState>>(createStoryState());

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const filmWrapRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const railFillRef = useRef<HTMLDivElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);

  const chapterRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const ringSvgRef = useRef<SVGSVGElement | null>(null);
  const ringScoreElRef = useRef<HTMLElement | null>(null);
  const finalCtaRef = useRef<HTMLDivElement | null>(null);
  const heroBadgeRef = useRef<HTMLDivElement | null>(null);
  const heroBrandRef = useRef<HTMLDivElement | null>(null);
  const scrollHintRef = useRef<HTMLDivElement | null>(null);

  const shardCount = useMemo(() => {
    if (typeof window === "undefined") return 1200;
    return window.innerWidth < 768 ? 450 : 1200;
  }, []);

  /* register helpers passed to overlay components */
  const registerChapter = (chapter: number, el: HTMLDivElement | null) => {
    if (el) chapterRefs.current.set(chapter, el);
    else chapterRefs.current.delete(chapter);
  };
  const registerRing = (el: SVGSVGElement | null) => {
    ringSvgRef.current = el;
    if (el) {
      ringScoreElRef.current = el.parentElement?.querySelector("[data-ring-score]") ?? null;
    }
  };

  /* Enter the studio */
  const enter = () => {
    const flash = flashRef.current;
    if (flash) {
      gsap.to(flash, {
        opacity: 1,
        duration: 0.45,
        ease: "power2.in",
        onComplete: () => router.push("/dashboard"),
      });
    } else {
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = sectionRef.current;
    if (!section || reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const s = story.current;
    const C = 2 * Math.PI * 104; // ring circumference

    /* ---------- MASTER TIMELINE ---------- */
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
      onUpdate: (self) => {
        if (railFillRef.current) {
          railFillRef.current.style.transform = `scaleY(${self.progress})`;
        }
      },
    });

    /* ===== CH1 — Chaos (0 -> 2) ===== */
    tl.to(story, { camZ: 6.4, duration: 2 }, 0);

    const ch1 = chapterRefs.current.get(1);
    if (ch1) {
      const words = ch1.querySelectorAll(".kinetic-word");
      tl.fromTo(
        words,
        { yPercent: 115 },
        { yPercent: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" },
        0.15
      );
      tl.to(words, { yPercent: -115, duration: 0.4, stagger: 0.03, ease: "power2.in" }, 1.55);
    }
    if (heroBadgeRef.current) {
      tl.fromTo(
        heroBadgeRef.current,
        { opacity: 0, y: -14 },
        { opacity: 1, y: 0, duration: 0.35 },
        0.05
      );
      tl.to(heroBadgeRef.current, { opacity: 0, duration: 0.3 }, 1.6);
    }
    if (heroBrandRef.current) {
      tl.to(heroBrandRef.current, { opacity: 0, duration: 0.3 }, 1.7);
    }
    if (scrollHintRef.current) {
      tl.fromTo(scrollHintRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.7);
      tl.to(scrollHintRef.current, { opacity: 0, duration: 0.25 }, 1.65);
    }

    /* ===== CH2 — Scout (2 -> 4) ===== */
    tl.to(story, { converge: 1, duration: 1.2, ease: "power2.inOut" }, 2.0);
    tl.to(story, { camX: -1.2, camZ: 6.0, tX: -1.4, duration: 1.0 }, 2.0);
    tl.to(story, { panel1: 1, duration: 0.6, ease: "power2.out" }, 3.0);
    tl.to(story, { scan: 1, duration: 0.9, ease: "power1.inOut" }, 3.3);

    const ch2 = chapterRefs.current.get(2);
    if (ch2) {
      const words = ch2.querySelectorAll(".kinetic-word");
      tl.fromTo(
        words,
        { yPercent: 115 },
        { yPercent: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" },
        2.35
      );
      tl.to(ch2, { opacity: 0, y: -30, duration: 0.3 }, 3.75);
      tl.set(ch2, { y: 0 }, 3.8);
    }

    /* ===== CH3 — Writer (4 -> 6) ===== */
    tl.to(story, { camX: 1.2, tX: 1.6, duration: 1.0 }, 4.0);
    tl.to(story, { panel2: 1, duration: 0.6, ease: "power2.out" }, 4.2);
    tl.to(story, { helix: 1, duration: 0.7, ease: "power2.out" }, 4.5);
    tl.to(story, { typing: 1, duration: 1.1, ease: "none" }, 4.7);

    const ch3 = chapterRefs.current.get(3);
    if (ch3) {
      const words = ch3.querySelectorAll(".kinetic-word");
      tl.fromTo(
        words,
        { yPercent: 115 },
        { yPercent: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" },
        4.35
      );
      tl.to(ch3, { opacity: 0, y: -30, duration: 0.3 }, 5.75);
      tl.set(ch3, { y: 0 }, 5.8);
    }

    /* ===== CH4 — Critic (6 -> 8) ===== */
    tl.to(story, { camX: -0.6, camZ: 5.2, tX: 0, tY: 0.1, duration: 1.0 }, 6.0);
    tl.to(story, { panel3: 1, duration: 0.6, ease: "power2.out" }, 6.1);
    tl.to(story, { helix: 0, duration: 0.4 }, 6.2);
    tl.to(story, { ring: 1, duration: 0.8, ease: "power2.inOut" }, 6.7);
    tl.to(story, { score: 94, duration: 0.8, ease: "power2.inOut" }, 6.7);
    tl.to(story, { pulse: 1, duration: 0.9 }, 7.2);

    const ch4 = chapterRefs.current.get(4);
    if (ch4) {
      const words = ch4.querySelectorAll(".kinetic-word");
      tl.fromTo(
        words,
        { yPercent: 115 },
        { yPercent: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" },
        6.35
      );
      tl.to(ch4, { opacity: 0, y: -30, duration: 0.3 }, 7.7);
      tl.set(ch4, { y: 0 }, 7.75);
    }

    /* ring DOM sync */
    tl.to(
      { v: 0 },
      {
        v: 1,
        duration: 0.8,
        ease: "power2.inOut",
        onUpdate: function () {
          const v = (this.targets()[0] as { v: number }).v;
          const svg = ringSvgRef.current;
          const circle = svg?.querySelector("[data-ring-circle]");
          if (circle) {
            (circle as SVGCircleElement).style.strokeDashoffset = String(C * (1 - v));
          }
        },
      },
      6.7
    );

    /* score counter -> window setter consumed by ScoreRing */
    tl.to(
      { v: 0 },
      {
        v: 94,
        duration: 0.8,
        ease: "power2.inOut",
        snap: { v: 1 },
        onUpdate: function () {
          const setter = (window as unknown as { __lunvoScoreSetter?: (v: number) => void })
            .__lunvoScoreSetter;
          if (setter) setter((this.targets()[0] as { v: number }).v);
        },
      },
      6.7
    );

    /* ===== CH5 — Studio (8 -> 10) ===== */
    tl.to(story, { camZ: 7.6, camX: 0, tX: 0, tY: 0, duration: 1.2, ease: "power1.inOut" }, 8.0);
    tl.to(story, { formation: 1, duration: 0.8, ease: "power2.inOut" }, 8.2);
    tl.to(story, { mockup: 1, duration: 0.6 }, 8.9);
    tl.to(story, { converge: 0.85, duration: 1.0 }, 8.4);

    if (finalCtaRef.current) {
      tl.fromTo(
        finalCtaRef.current,
        { opacity: 0, y: 40, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" },
        9.1
      );
    }

    /* background mood shifts per chapter */
    BG_SHIFTS.forEach((color, i) => {
      if (i === 0) return;
      tl.to(bgRef.current ?? {}, { backgroundColor: color, duration: 0.6 }, i * 2 - 0.3);
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <main className="relative bg-background">
      <SmoothScroll />

      {/* ===== THE FILM (500vh scroll stage, sticky screen) ===== */}
      <section ref={sectionRef} className="relative h-[520vh]">
        <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden">
          {/* animated bg tint */}
          <div ref={bgRef} className="absolute inset-0" style={{ backgroundColor: BG_SHIFTS[0] }} />

          {/* 3D film */}
          <div ref={filmWrapRef} className="absolute inset-0">
            <AuroraFilmDynamic story={story} shardCount={shardCount} />
          </div>

          {/* brand mark */}
          <div ref={heroBrandRef} className="absolute left-1/2 top-6 z-20 -translate-x-1/2">
            <div className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 !border-transparent">
              <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-gradient-to-br from-primary to-primary-container shadow-sm">
                <span className="text-sm font-bold text-on-primary">L</span>
              </div>
              <span className="font-serif text-lg italic text-on-background">LUNVO</span>
            </div>
          </div>

          {/* hero badge */}
          <div
            ref={heroBadgeRef}
            className="absolute left-1/2 top-24 z-20 -translate-x-1/2 opacity-0"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-4 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-primary/90">
              <Sparkles className="h-3 w-3" />
              The Open-Source LinkedIn OS
            </p>
          </div>

          {/* chapter text overlays */}
          <ChapterBlock chapter={1} kicker="Chapter 01 — Chaos" registerRef={registerChapter}>
            <SplitWords text={COPY.ch1} />
          </ChapterBlock>
          <ChapterBlock chapter={2} kicker="Chapter 02 — Scout" registerRef={registerChapter}>
            <SplitWords text={COPY.ch2} />
          </ChapterBlock>
          <ChapterBlock chapter={3} kicker="Chapter 03 — Writer" registerRef={registerChapter}>
            <SplitWords text={COPY.ch3} />
          </ChapterBlock>
          <ChapterBlock chapter={4} kicker="Chapter 04 — Critic" registerRef={registerChapter}>
            <SplitWords text={COPY.ch4} />
          </ChapterBlock>

          {/* critic ring */}
          <ScoreRing register={registerRing} />

          {/* final CTA */}
          <FinalCTA
            register={(el) => {
              finalCtaRef.current = el;
            }}
            onEnter={enter}
          />

          {/* scroll hint */}
          <div
            ref={scrollHintRef}
            className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 opacity-0"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-[0.5625rem] font-bold uppercase tracking-[0.3em] font-mono text-on-surface-variant/60">
                Scroll
              </span>
              <div className="h-10 w-[1.5px] overflow-hidden rounded-full bg-outline-variant/50">
                <div className="h-3 w-full animate-pulse rounded-full bg-primary" />
              </div>
            </div>
          </div>

          {/* progress rail */}
          <ProgressRail fillRef={railFillRef} />

          {/* flash overlay */}
          <FlashOverlay
            register={(el) => {
              flashRef.current = el;
            }}
          />
        </div>
      </section>

      {/* ===== AFTER THE FILM ===== */}
      <section className="relative z-10 bg-background">
        <LogoMarquee />

        {/* trust chips */}
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6 pb-14 text-xs font-semibold text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-secondary" /> No sign-up. No card.
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-tertiary" /> Runs on your machine
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> MIT licensed
          </span>
        </div>

        {/* final CTA */}
        <div className="px-6 pb-24 text-center">
          <MagneticCTA onClick={enter}>Enter the Studio</MagneticCTA>
          <p className="mt-5 text-[0.625rem] font-mono uppercase tracking-[0.3em] text-on-surface-variant/40">
            MIT Licensed · Built by THE Π LAB
          </p>
        </div>
      </section>
    </main>
  );
}
