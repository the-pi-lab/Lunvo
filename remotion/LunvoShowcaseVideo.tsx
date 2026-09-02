import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

export const LunvoShowcaseVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#06060C",
        color: "#FFFFFF",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        overflow: "hidden",
      }}
    >
      {/* Background Ambient Glows */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "20%",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(236,72,153,0.15) 50%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "10%",
          width: "50%",
          height: "50%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(147,51,234,0.1) 50%, transparent 70%)",
          filter: "blur(140px)",
        }}
      />

      {/* Top Persistent Logo Watermark */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 64,
          display: "flex",
          alignItems: "center",
          gap: 16,
          zIndex: 50,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 22,
            boxShadow: "0 8px 24px rgba(124,58,237,0.5)",
          }}
        >
          L
        </div>
        <span style={{ fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px" }}>LUNVO 2.0</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "2px",
            padding: "4px 12px",
            borderRadius: 99,
            backgroundColor: "rgba(139,92,246,0.15)",
            color: "#C4B5FD",
            border: "1px solid rgba(139,92,246,0.3)",
          }}
        >
          Autonomous LinkedIn OS
        </span>
      </div>

      {/* ========================================================================= */}
      {/* ACT 1: HOOK & INTRO (Frames 0 - 360 | 0s - 12s) */}
      {/* ========================================================================= */}
      <Sequence from={0} durationInFrames={360}>
        <SceneIntro />
      </Sequence>

      {/* ========================================================================= */}
      {/* ACT 2: 3-AGENT COLLABORATIVE STUDIO (Frames 360 - 900 | 12s - 30s) */}
      {/* ========================================================================= */}
      <Sequence from={360} durationInFrames={540}>
        <SceneStudio />
      </Sequence>

      {/* ========================================================================= */}
      {/* ACT 3: VISUAL WORKFLOW NODE ENGINE (Frames 900 - 1440 | 30s - 48s) */}
      {/* ========================================================================= */}
      <Sequence from={900} durationInFrames={540}>
        <SceneWorkflow />
      </Sequence>

      {/* ========================================================================= */}
      {/* ACT 4: 100% REAL YOUTUBE REPURPOSE & CAROUSEL (Frames 1440 - 1860 | 48s - 62s) */}
      {/* ========================================================================= */}
      <Sequence from={1440} durationInFrames={420}>
        <SceneRepurpose />
      </Sequence>

      {/* ========================================================================= */}
      {/* ACT 5: 24/7 AUTOPILOT & DISTRIBUTION HUB (Frames 1860 - 2250 | 62s - 75s) */}
      {/* ========================================================================= */}
      <Sequence from={1860} durationInFrames={390}>
        <SceneDistribution />
      </Sequence>

      {/* ========================================================================= */}
      {/* ACT 6: GRAND FINALE / OUTRO CTA (Frames 2250 - 2550 | 75s - 85s) */}
      {/* ========================================================================= */}
      <Sequence from={2250} durationInFrames={300}>
        <SceneOutro />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------------- */
/* SCENE 1: INTRO & HOOK                                                     */
/* ------------------------------------------------------------------------- */
const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14 } });
  const scale = interpolate(titleSpring, [0, 1], [0.85, 1]);
  const opacity = interpolate(frame, [0, 20, 330, 360], [0, 1, 1, 0]);

  const badgeSpring = spring({ frame: frame - 40, fps });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `scale(${scale})`,
        textAlign: "center",
        padding: "0 100px",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 24px",
          borderRadius: 99,
          backgroundColor: "rgba(139,92,246,0.15)",
          border: "1px solid rgba(139,92,246,0.35)",
          color: "#DDD6FE",
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 32,
        }}
      >
        <span>✨</span>
        <span>The Autonomous LinkedIn Growth Engine</span>
      </div>

      <h1
        style={{
          fontSize: 84,
          fontWeight: 900,
          letterSpacing: "-2px",
          lineHeight: 1.1,
          margin: 0,
          color: "#FFFFFF",
        }}
      >
        Introduces{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #A78BFA 0%, #F472B6 50%, #FBBF24 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          LUNVO AI
        </span>
      </h1>

      <p
        style={{
          fontSize: 32,
          color: "#94A3B8",
          maxWidth: 900,
          lineHeight: 1.4,
          marginTop: 28,
          fontWeight: 500,
        }}
      >
        Turn raw, unstructured ideas into viral thought leadership in seconds.
      </p>

      {frame > 120 && (
        <div
          style={{
            marginTop: 48,
            padding: "20px 48px",
            borderRadius: 24,
            backgroundColor: "#FFFFFF",
            color: "#09090B",
            fontSize: 38,
            fontWeight: 900,
            boxShadow: "0 0 80px rgba(255,255,255,0.45)",
            transform: `scale(${badgeSpring})`,
          }}
        >
          9x Higher Engagement • Zero Unofficial APIs
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------------- */
/* SCENE 2: 3-AGENT COLLABORATIVE STUDIO                                     */
/* ------------------------------------------------------------------------- */
const SceneStudio: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({ frame, fps, config: { damping: 15 } });
  const cardScale = interpolate(cardSpring, [0, 1], [0.8, 1]);
  const opacity = interpolate(frame, [0, 20, 510, 540], [0, 1, 1, 0]);

  // Score tickers
  const criticScore = Math.min(
    94,
    Math.round(interpolate(frame, [60, 300], [38, 94], { extrapolateRight: "clamp" }))
  );
  const humanScore = Math.min(
    98,
    Math.round(interpolate(frame, [90, 340], [52, 98], { extrapolateRight: "clamp" }))
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        padding: "0 140px",
        perspective: 1200,
      }}
    >
      {/* Floating Input Pill */}
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          padding: "20px 32px",
          borderRadius: 24,
          backgroundColor: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: "rgba(124,58,237,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            💡
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                color: "#A1A1AA",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Input Topic / Seed Thought
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF", marginTop: 4 }}>
              Why simple code beats complex microservices in 2026
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "12px 28px",
            borderRadius: 16,
            backgroundColor: "#7C3AED",
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: 800,
            boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
          }}
        >
          ⚡ 3 Agents Collaborating
        </div>
      </div>

      {/* 3D Elevated Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          padding: 44,
          borderRadius: 36,
          backgroundColor: "#FFFFFF",
          color: "#18181B",
          boxShadow: "0 35px 90px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.2)",
          transform: `scale(${cardScale}) rotateX(6deg)`,
          transition: "all 0.2s ease",
        }}
      >
        {/* Header Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #E4E4E7",
            paddingBottom: 24,
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#10B981",
                boxShadow: "0 0 12px #10B981",
              }}
            />
            <span style={{ fontSize: 18, fontWeight: 800, color: "#27272A" }}>
              Scout & Writer Autonomous Studio
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                padding: "8px 20px",
                borderRadius: 99,
                backgroundColor: "#F3E8FF",
                color: "#6B21A8",
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              Critic Viral Score: {criticScore}/100
            </div>
            <div
              style={{
                padding: "8px 20px",
                borderRadius: 99,
                backgroundColor: "#D1FAE5",
                color: "#065F46",
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              Human Rating: {humanScore}%
            </div>
          </div>
        </div>

        {/* Content Body Preview */}
        <div
          style={{
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 24,
            padding: 32,
            fontSize: 22,
            lineHeight: 1.6,
            color: "#334155",
            fontWeight: 500,
          }}
        >
          <p style={{ margin: 0, fontWeight: 800, color: "#0F172A", fontSize: 26 }}>
            Most engineering teams don&apos;t have a scaling problem. They have a complexity
            addiction.
          </p>
          <p style={{ margin: "16px 0 0 0" }}>
            We spent 6 months splitting our monolith into 14 microservices. Latency 3x&apos;d,
            onboarding took weeks. Last month we collapsed it back into a clean modular monolith:
            build times dropped from 25m to 70s.
          </p>
        </div>

        {/* Triple Metric Grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24 }}
        >
          <div style={{ backgroundColor: "#F4F4F5", padding: "18px 24px", borderRadius: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#71717A" }}>Hook Virality</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#7C3AED", marginTop: 4 }}>
              96% High
            </div>
          </div>
          <div style={{ backgroundColor: "#F4F4F5", padding: "18px 24px", borderRadius: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#71717A" }}>Technical Depth</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#2563EB", marginTop: 4 }}>
              Senior Eng
            </div>
          </div>
          <div style={{ backgroundColor: "#F4F4F5", padding: "18px 24px", borderRadius: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#71717A" }}>
              AI Detector Bypass
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#059669", marginTop: 4 }}>
              98% Human
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------------- */
/* SCENE 3: VISUAL WORKFLOW NODE ENGINE                                      */
/* ------------------------------------------------------------------------- */
const SceneWorkflow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 20, 510, 540], [0, 1, 1, 0]);

  // Sequential illumination of 4 nodes
  const node1Active = frame > 40;
  const node2Active = frame > 120;
  const node3Active = frame > 200;
  const node4Active = frame > 280;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        padding: "0 120px",
      }}
    >
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontSize: 56, fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
          Autonomous Visual Workflow Engine
        </h2>
        <p style={{ fontSize: 24, color: "#94A3B8", marginTop: 12 }}>
          n8n-style graphs connecting AI Agents, Voice DNA & Webhook queues
        </p>
      </div>

      {/* Connected 4 Node Flow */}
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 28,
        }}
      >
        <NodeCard
          icon="⚡"
          step="01"
          title="RSS/Idea Trigger"
          desc="Auto-scrape topics"
          color="#8B5CF6"
          active={node1Active}
        />
        <NodeCard
          icon="🎯"
          step="02"
          title="Scout Agent"
          desc="5 Viral Hooks"
          color="#EC4899"
          active={node2Active}
        />
        <NodeCard
          icon="✍️"
          step="03"
          title="Writer & Critic"
          desc="Voice DNA match"
          color="#3B82F6"
          active={node3Active}
        />
        <NodeCard
          icon="🚀"
          step="04"
          title="Webhook Out"
          desc="Make / Zapier / N8N"
          color="#10B981"
          active={node4Active}
        />
      </div>

      {/* Bottom Status Bar */}
      <div
        style={{
          marginTop: 48,
          padding: "16px 36px",
          borderRadius: 20,
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 18,
          color: "#E2E8F0",
        }}
      >
        <span style={{ color: "#10B981" }}>✓</span>
        <span>Pipeline Execution Complete: 4 nodes evaluated in 1.4s (HTTP 200 OK)</span>
      </div>
    </AbsoluteFill>
  );
};

const NodeCard: React.FC<{
  icon: string;
  step: string;
  title: string;
  desc: string;
  color: string;
  active: boolean;
}> = ({ icon, step, title, desc, color, active }) => {
  return (
    <div
      style={{
        padding: 32,
        borderRadius: 28,
        backgroundColor: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
        border: `2px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
        boxShadow: active ? `0 0 40px ${color}40` : "none",
        textAlign: "center",
        transition: "all 0.3s ease",
        transform: active ? "scale(1.05)" : "scale(1)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: `${color}25`,
          color: color,
          fontSize: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px auto",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: color,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        STEP {step}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", marginTop: 6 }}>{title}</div>
      <div style={{ fontSize: 14, color: "#94A3B8", marginTop: 4 }}>{desc}</div>
    </div>
  );
};

/* ------------------------------------------------------------------------- */
/* SCENE 4: 100% REAL YOUTUBE REPURPOSE & PDF CAROUSEL                       */
/* ------------------------------------------------------------------------- */
const SceneRepurpose: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20, 390, 420], [0, 1, 1, 0]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        padding: "0 120px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontSize: 56, fontWeight: 900, margin: 0 }}>
          Multi-Format Repurposing & PDF Carousels
        </h2>
        <p style={{ fontSize: 24, color: "#94A3B8", marginTop: 12 }}>
          Turn YouTube videos into threads & 1080x1350 visual carousel slides
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 36,
          width: "100%",
          maxWidth: 1200,
        }}
      >
        {/* Left: YouTube */}
        <div
          style={{
            padding: 40,
            borderRadius: 32,
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ fontSize: 36 }}>▶️</div>
          <h3 style={{ fontSize: 28, fontWeight: 800, marginTop: 16 }}>
            100% Real YouTube Captions
          </h3>
          <p style={{ fontSize: 18, color: "#94A3B8", lineHeight: 1.5, marginTop: 12 }}>
            Extracts full spoken timedtext transcripts directly from video URLs. Zero API keys
            required.
          </p>
          <div
            style={{
              marginTop: 24,
              padding: "16px 20px",
              borderRadius: 16,
              backgroundColor: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.3)",
              fontSize: 16,
              color: "#DDD6FE",
              fontFamily: "monospace",
            }}
          >
            youtube.com/watch?v=... ➔ 1,840 words parsed
          </div>
        </div>

        {/* Right: PDF Carousel */}
        <div
          style={{
            padding: 40,
            borderRadius: 32,
            backgroundColor: "rgba(236,72,153,0.1)",
            border: "1px solid rgba(236,72,153,0.3)",
          }}
        >
          <div style={{ fontSize: 36 }}>📑</div>
          <h3 style={{ fontSize: 28, fontWeight: 800, marginTop: 16 }}>5-Slide PDF Carousels</h3>
          <p style={{ fontSize: 18, color: "#CBD5E1", lineHeight: 1.5, marginTop: 12 }}>
            Client-side 1080x1350 generation. Automatically formats your posts into swipeable
            high-converting carousels.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                Slide #{s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------------- */
/* SCENE 5: 24/7 AUTOPILOT & DISTRIBUTION SUITE                             */
/* ------------------------------------------------------------------------- */
const SceneDistribution: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20, 360, 390], [0, 1, 1, 0]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        padding: "0 120px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontSize: 56, fontWeight: 900, margin: 0 }}>
          Zero-Ban Distribution & 24/7 Autopilot
        </h2>
        <p style={{ fontSize: 24, color: "#94A3B8", marginTop: 12 }}>
          Control your growth pipeline from your phone or your IDE
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 28,
          width: "100%",
          maxWidth: 1200,
        }}
      >
        <div
          style={{
            padding: 36,
            borderRadius: 28,
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ fontSize: 40 }}>📱</div>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginTop: 16 }}>Telegram Remote Bot</h3>
          <p style={{ fontSize: 16, color: "#94A3B8", marginTop: 8, lineHeight: 1.5 }}>
            Review, edit, and approve viral drafts on the go directly from Telegram.
          </p>
        </div>

        <div
          style={{
            padding: 36,
            borderRadius: 28,
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ fontSize: 40 }}>⚡</div>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginTop: 16 }}>Webhook Queue</h3>
          <p style={{ fontSize: 16, color: "#94A3B8", marginTop: 8, lineHeight: 1.5 }}>
            Outbound webhooks to Zapier, Make & N8N with SSRF protection.
          </p>
        </div>

        <div
          style={{
            padding: 36,
            borderRadius: 28,
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ fontSize: 40 }}>🤖</div>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginTop: 16 }}>Cursor/Claude MCP</h3>
          <p style={{ fontSize: 16, color: "#94A3B8", marginTop: 8, lineHeight: 1.5 }}>
            Full Model Context Protocol suite to command LUNVO inside Cursor or Claude.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------------- */
/* SCENE 6: OUTRO CTA                                                        */
/* ------------------------------------------------------------------------- */
const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const orbSpring = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(frame, [0, 20], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 32,
          background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 52,
          fontWeight: 900,
          boxShadow: "0 0 100px rgba(124,58,237,0.7)",
          transform: `scale(${orbSpring})`,
          marginBottom: 36,
        }}
      >
        L
      </div>

      <h1 style={{ fontSize: 72, fontWeight: 900, letterSpacing: "-1.5px", margin: 0 }}>
        Turn Raw Ideas into Viral Authority
      </h1>

      <p style={{ fontSize: 28, color: "#A1A1AA", marginTop: 20, maxWidth: 800 }}>
        100% Free & Open-Source. Run locally or self-host anywhere.
      </p>

      <div style={{ display: "flex", gap: 24, marginTop: 44 }}>
        <div
          style={{
            padding: "20px 48px",
            borderRadius: 24,
            backgroundColor: "#FFFFFF",
            color: "#09090B",
            fontSize: 22,
            fontWeight: 800,
            boxShadow: "0 10px 40px rgba(255,255,255,0.3)",
          }}
        >
          github.com/the-pi-lab/Lunvo
        </div>
      </div>
    </AbsoluteFill>
  );
};
