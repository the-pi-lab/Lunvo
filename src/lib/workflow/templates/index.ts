/**
 * LUNVO 2.0 — 12 Production Prebuilt Workflow Templates
 * Ready-to-use n8n-style automation templates.
 */

import type { Workflow } from "../types";

export const PREBUILT_WORKFLOWS: Workflow[] = [
  // 1. RSS Tech Trends to Post
  {
    metadata: {
      id: "rss-tech-trends",
      name: "Daily Tech Trends to Viral Post",
      description:
        "Fetches top tech & AI news from Hacker News/RSS, extracts angles with Scout, drafts with Voice DNA, and saves to drafts.",
      icon: "Rss",
      category: "creation",
      version: "2.0.0",
      isPrebuilt: true,
      createdAt: "2026-08-31T00:00:00Z",
      updatedAt: "2026-08-31T00:00:00Z",
    },
    nodes: [
      {
        id: "node-1",
        type: "trigger_rss",
        position: { x: 50, y: 150 },
        data: { label: "Tech Trends RSS", query: "AI", limit: 5 },
      },
      {
        id: "node-2",
        type: "agent_scout",
        position: { x: 300, y: 150 },
        data: { label: "Scout Angle Extractor", temperature: 0.7 },
      },
      {
        id: "node-3",
        type: "voice_dna_transform",
        position: { x: 550, y: 150 },
        data: { label: "Apply Voice DNA" },
      },
      {
        id: "node-4",
        type: "agent_writer",
        position: { x: 800, y: 150 },
        data: { label: "Draft Writer", temperature: 0.75 },
      },
      {
        id: "node-5",
        type: "agent_critic",
        position: { x: 1050, y: 150 },
        data: { label: "Critic & Viral Score" },
      },
      {
        id: "node-6",
        type: "output_draft_store",
        position: { x: 1300, y: 150 },
        data: { label: "Save to Local Drafts" },
      },
    ],
    edges: [
      { id: "e1-2", source: "node-1", target: "node-2" },
      { id: "e2-3", source: "node-2", target: "node-3" },
      { id: "e3-4", source: "node-3", target: "node-4" },
      { id: "e4-5", source: "node-4", target: "node-5" },
      { id: "e5-6", source: "node-5", target: "node-6" },
    ],
  },

  // 2. YouTube Video Repurposer
  {
    metadata: {
      id: "youtube-repurposer",
      name: "YouTube Video / Notes to 3x Formats",
      description:
        "Extracts key insights from video transcripts or notes and generates 3 distinct high-engagement LinkedIn post variants.",
      icon: "Youtube",
      category: "repurpose",
      version: "2.0.0",
      isPrebuilt: true,
      createdAt: "2026-08-31T00:00:00Z",
      updatedAt: "2026-08-31T00:00:00Z",
    },
    nodes: [
      {
        id: "node-1",
        type: "trigger_youtube",
        position: { x: 50, y: 150 },
        data: { label: "YouTube URL / Transcript" },
      },
      {
        id: "node-2",
        type: "repurpose_transformer",
        position: { x: 320, y: 150 },
        data: { label: "Extract 3 Core Angles" },
      },
      {
        id: "node-3",
        type: "humanizer_filter",
        position: { x: 600, y: 150 },
        data: { label: "Anti-AI Slop Filter" },
      },
      {
        id: "node-4",
        type: "output_draft_store",
        position: { x: 880, y: 150 },
        data: { label: "Save All 3 Drafts" },
      },
    ],
    edges: [
      { id: "e1-2", source: "node-1", target: "node-2" },
      { id: "e2-3", source: "node-2", target: "node-3" },
      { id: "e3-4", source: "node-3", target: "node-4" },
    ],
  },

  // 3. Bullet Notes to Carousel PDF
  {
    metadata: {
      id: "bullet-notes-to-carousel",
      name: "Raw Notes to 5-Slide Carousel PDF",
      description:
        "Converts raw messy bullet points into an educational, high-retention 1080x1350 5-slide PDF carousel.",
      icon: "Layers",
      category: "creation",
      version: "2.0.0",
      isPrebuilt: true,
      createdAt: "2026-08-31T00:00:00Z",
      updatedAt: "2026-08-31T00:00:00Z",
    },
    nodes: [
      {
        id: "node-1",
        type: "trigger_manual",
        position: { x: 50, y: 150 },
        data: { label: "Raw Bullet Notes" },
      },
      {
        id: "node-2",
        type: "carousel_formatter",
        position: { x: 350, y: 150 },
        data: { label: "5-Slide Carousel Engine", slideCount: 5 },
      },
      {
        id: "node-3",
        type: "humanizer_filter",
        position: { x: 650, y: 150 },
        data: { label: "Cleanse Jargon" },
      },
      {
        id: "node-4",
        type: "output_draft_store",
        position: { x: 950, y: 150 },
        data: { label: "Save Carousel Project" },
      },
    ],
    edges: [
      { id: "e1-2", source: "node-1", target: "node-2" },
      { id: "e2-3", source: "node-2", target: "node-3" },
      { id: "e3-4", source: "node-3", target: "node-4" },
    ],
  },

  // 4. Automated Quality Gatekeeper Loop
  {
    metadata: {
      id: "quality-gatekeeper",
      name: "Self-Healing Quality Gatekeeper (Score >= 85)",
      description:
        "Writes a draft, audits it with Critic. If score < 85, sends critique feedback back to Writer for auto-refinement.",
      icon: "ShieldCheck",
      category: "quality",
      version: "2.0.0",
      isPrebuilt: true,
      createdAt: "2026-08-31T00:00:00Z",
      updatedAt: "2026-08-31T00:00:00Z",
    },
    nodes: [
      {
        id: "node-1",
        type: "trigger_manual",
        position: { x: 50, y: 150 },
        data: { label: "Post Topic" },
      },
      {
        id: "node-2",
        type: "agent_writer",
        position: { x: 300, y: 150 },
        data: { label: "Draft Writer" },
      },
      {
        id: "node-3",
        type: "agent_critic",
        position: { x: 550, y: 150 },
        data: { label: "Strict Critic Audit" },
      },
      {
        id: "node-4",
        type: "condition_gate",
        position: { x: 800, y: 150 },
        data: {
          label: "Score >= 85?",
          field: "critic_score",
          operator: "gte",
          threshold: 85,
          maxRetries: 2,
        },
      },
      {
        id: "node-5",
        type: "output_draft_store",
        position: { x: 1080, y: 150 },
        data: { label: "Save Approved Post" },
      },
    ],
    edges: [
      { id: "e1-2", source: "node-1", target: "node-2" },
      { id: "e2-3", source: "node-2", target: "node-3" },
      { id: "e3-4", source: "node-3", target: "node-4" },
      { id: "e4-5", source: "node-4", target: "node-5", label: "Passed (>= 85)" },
      { id: "e4-2", source: "node-4", target: "node-2", label: "Retry (< 85)" },
    ],
  },

  // 5. Voice DNA Cloner & Post Generator
  {
    metadata: {
      id: "voice-dna-cloner",
      name: "Voice DNA Tone Ingest & Post Generator",
      description:
        "Ingests raw sample writing, tunes cadence & vocabulary sliders, and writes new posts matching your exact rhythm.",
      icon: "Dna",
      category: "creation",
      version: "2.0.0",
      isPrebuilt: true,
      createdAt: "2026-08-31T00:00:00Z",
      updatedAt: "2026-08-31T00:00:00Z",
    },
    nodes: [
      {
        id: "node-1",
        type: "trigger_manual",
        position: { x: 50, y: 150 },
        data: { label: "Sample Text + New Topic" },
      },
      {
        id: "node-2",
        type: "voice_dna_transform",
        position: { x: 350, y: 150 },
        data: { label: "Extract & Apply Tone" },
      },
      {
        id: "node-3",
        type: "agent_writer",
        position: { x: 650, y: 150 },
        data: { label: "Voice-Cloned Writer" },
      },
      {
        id: "node-4",
        type: "output_draft_store",
        position: { x: 950, y: 150 },
        data: { label: "Save Tailored Draft" },
      },
    ],
    edges: [
      { id: "e1-2", source: "node-1", target: "node-2" },
      { id: "e2-3", source: "node-2", target: "node-3" },
      { id: "e3-4", source: "node-3", target: "node-4" },
    ],
  },

  // 6. GitHub Release to Announcement
  {
    metadata: {
      id: "github-release-announcer",
      name: "GitHub Release Tag to Launch Post",
      description:
        "Transforms technical git release notes and commit logs into developer-friendly LinkedIn product announcements.",
      icon: "GitBranch",
      category: "creation",
      version: "2.0.0",
      isPrebuilt: true,
      createdAt: "2026-08-31T00:00:00Z",
      updatedAt: "2026-08-31T00:00:00Z",
    },
    nodes: [
      {
        id: "node-1",
        type: "trigger_manual",
        position: { x: 50, y: 150 },
        data: { label: "Release Changelog" },
      },
      {
        id: "node-2",
        type: "agent_scout",
        position: { x: 350, y: 150 },
        data: { label: "Developer Angle Extractor" },
      },
      {
        id: "node-3",
        type: "agent_writer",
        position: { x: 650, y: 150 },
        data: { label: "Product Launch Writer" },
      },
      {
        id: "node-4",
        type: "output_draft_store",
        position: { x: 950, y: 150 },
        data: { label: "Save Launch Draft" },
      },
    ],
    edges: [
      { id: "e1-2", source: "node-1", target: "node-2" },
      { id: "e2-3", source: "node-2", target: "node-3" },
      { id: "e3-4", source: "node-3", target: "node-4" },
    ],
  },

  // 7. Contrarian Debate Starter
  {
    metadata: {
      id: "contrarian-debate-starter",
      name: "Contrarian Debate & High-Engagement Starter",
      description:
        "Finds counter-intuitive perspectives on popular industry beliefs to start viral comment-section discussions.",
      icon: "Flame",
      category: "creation",
      version: "2.0.0",
      isPrebuilt: true,
      createdAt: "2026-08-31T00:00:00Z",
      updatedAt: "2026-08-31T00:00:00Z",
    },
    nodes: [
      {
        id: "node-1",
        type: "trigger_manual",
        position: { x: 50, y: 150 },
        data: { label: "Industry Belief / Common Practice" },
      },
      {
        id: "node-2",
        type: "agent_scout",
        position: { x: 350, y: 150 },
        data: { label: "Contrarian Hook Finder" },
      },
      {
        id: "node-3",
        type: "agent_writer",
        position: { x: 650, y: 150 },
        data: { label: "Debate Opener Writer" },
      },
      {
        id: "node-4",
        type: "agent_critic",
        position: { x: 950, y: 150 },
        data: { label: "Engagement Check" },
      },
      {
        id: "node-5",
        type: "output_draft_store",
        position: { x: 1250, y: 150 },
        data: { label: "Save Discussion Post" },
      },
    ],
    edges: [
      { id: "e1-2", source: "node-1", target: "node-2" },
      { id: "e2-3", source: "node-2", target: "node-3" },
      { id: "e3-4", source: "node-3", target: "node-4" },
      { id: "e4-5", source: "node-4", target: "node-5" },
    ],
  },

  // 8. Twitter Thread to LinkedIn Article
  {
    metadata: {
      id: "twitter-to-linkedin-expander",
      name: "Twitter/X Thread to Long-Form LinkedIn Post",
      description:
        "Expands short punchy tweets into a structured, readable LinkedIn post with whitespace formatting.",
      icon: "Twitter",
      category: "repurpose",
      version: "2.0.0",
      isPrebuilt: true,
      createdAt: "2026-08-31T00:00:00Z",
      updatedAt: "2026-08-31T00:00:00Z",
    },
    nodes: [
      {
        id: "node-1",
        type: "trigger_manual",
        position: { x: 50, y: 150 },
        data: { label: "Twitter Thread Text" },
      },
      {
        id: "node-2",
        type: "repurpose_transformer",
        position: { x: 350, y: 150 },
        data: { label: "Thread Unroller & Structurer" },
      },
      {
        id: "node-3",
        type: "humanizer_filter",
        position: { x: 650, y: 150 },
        data: { label: "LinkedIn Spacing Polisher" },
      },
      {
        id: "node-4",
        type: "output_draft_store",
        position: { x: 950, y: 150 },
        data: { label: "Save Long-Form Post" },
      },
    ],
    edges: [
      { id: "e1-2", source: "node-1", target: "node-2" },
      { id: "e2-3", source: "node-2", target: "node-3" },
      { id: "e3-4", source: "node-3", target: "node-4" },
    ],
  },

  // 9. Morning Scheduled Dispatch
  {
    metadata: {
      id: "morning-scheduled-dispatch",
      name: "Morning Auto-Dispatch via Zapier/Make",
      description:
        "Scheduled daily at 8:00 AM: Fetches trending news, writes with Voice DNA, and fires outgoing webhook to Zapier/Buffer.",
      icon: "Clock",
      category: "scheduling",
      version: "2.0.0",
      isPrebuilt: true,
      createdAt: "2026-08-31T00:00:00Z",
      updatedAt: "2026-08-31T00:00:00Z",
    },
    nodes: [
      {
        id: "node-1",
        type: "trigger_schedule",
        position: { x: 50, y: 150 },
        data: { label: "Daily 08:00 AM Cron", timeOfDay: "08:00" },
      },
      {
        id: "node-2",
        type: "trigger_rss",
        position: { x: 300, y: 150 },
        data: { label: "Today's Top AI Trend", limit: 3 },
      },
      {
        id: "node-3",
        type: "agent_writer",
        position: { x: 550, y: 150 },
        data: { label: "Autonomous Writer" },
      },
      {
        id: "node-4",
        type: "output_webhook",
        position: { x: 800, y: 150 },
        data: { label: "Zapier/Make Webhook Dispatch", url: "https://hooks.zapier.com/..." },
      },
    ],
    edges: [
      { id: "e1-2", source: "node-1", target: "node-2" },
      { id: "e2-3", source: "node-2", target: "node-3" },
      { id: "e3-4", source: "node-3", target: "node-4" },
    ],
  },

  // 10. Telegram Remote Quick Capture
  {
    metadata: {
      id: "telegram-quick-capture",
      name: "Telegram Remote Quick Capture Flow",
      description:
        "Receives raw voice notes or prompts from your Telegram bot, formats into a LinkedIn post, and queues for review.",
      icon: "Send",
      category: "scheduling",
      version: "2.0.0",
      isPrebuilt: true,
      createdAt: "2026-08-31T00:00:00Z",
      updatedAt: "2026-08-31T00:00:00Z",
    },
    nodes: [
      {
        id: "node-1",
        type: "trigger_telegram",
        position: { x: 50, y: 150 },
        data: { label: "Telegram Message" },
      },
      {
        id: "node-2",
        type: "agent_scout",
        position: { x: 350, y: 150 },
        data: { label: "Generate 3 Hooks" },
      },
      {
        id: "node-3",
        type: "agent_writer",
        position: { x: 650, y: 150 },
        data: { label: "Draft Writer" },
      },
      {
        id: "node-4",
        type: "output_draft_store",
        position: { x: 950, y: 150 },
        data: { label: "Queue for Approval" },
      },
    ],
    edges: [
      { id: "e1-2", source: "node-1", target: "node-2" },
      { id: "e2-3", source: "node-2", target: "node-3" },
      { id: "e3-4", source: "node-3", target: "node-4" },
    ],
  },

  // 11. Multi-Platform Matrix
  {
    metadata: {
      id: "multi-platform-matrix",
      name: "Multi-Platform Matrix (LinkedIn + X + Newsletter)",
      description:
        "Generates a synchronized content campaign across LinkedIn post, Twitter/X thread, and weekly newsletter section.",
      icon: "Share2",
      category: "multiplatform",
      version: "2.0.0",
      isPrebuilt: true,
      createdAt: "2026-08-31T00:00:00Z",
      updatedAt: "2026-08-31T00:00:00Z",
    },
    nodes: [
      {
        id: "node-1",
        type: "trigger_manual",
        position: { x: 50, y: 200 },
        data: { label: "Core Idea / Announcement" },
      },
      {
        id: "node-2",
        type: "agent_writer",
        position: { x: 350, y: 200 },
        data: { label: "LinkedIn Post Writer" },
      },
      {
        id: "node-3",
        type: "repurpose_transformer",
        position: { x: 650, y: 100 },
        data: { label: "Twitter Thread Adapter", format: "twitter_thread" },
      },
      {
        id: "node-4",
        type: "repurpose_transformer",
        position: { x: 650, y: 300 },
        data: { label: "Newsletter Section Adapter", format: "newsletter" },
      },
      {
        id: "node-5",
        type: "output_draft_store",
        position: { x: 980, y: 200 },
        data: { label: "Save Omnichannel Campaign" },
      },
    ],
    edges: [
      { id: "e1-2", source: "node-1", target: "node-2" },
      { id: "e2-3", source: "node-2", target: "node-3" },
      { id: "e2-4", source: "node-2", target: "node-4" },
      { id: "e2-5", source: "node-2", target: "node-5" },
      { id: "e3-5", source: "node-3", target: "node-5" },
      { id: "e4-5", source: "node-4", target: "node-5" },
    ],
  },

  // 12. Classic 3-Agent Storyteller
  {
    metadata: {
      id: "classic-3agent-storyteller",
      name: "The Classic 3-Agent Neural Pipeline",
      description:
        "Standard LUNVO pipeline: Scout analyzes angles -> Writer crafts narrative -> Critic provides brutal 100-point audit.",
      icon: "Sparkles",
      category: "creation",
      version: "2.0.0",
      isPrebuilt: true,
      createdAt: "2026-08-31T00:00:00Z",
      updatedAt: "2026-08-31T00:00:00Z",
    },
    nodes: [
      {
        id: "node-1",
        type: "trigger_manual",
        position: { x: 50, y: 150 },
        data: { label: "Topic or Story Hook" },
      },
      {
        id: "node-2",
        type: "agent_scout",
        position: { x: 300, y: 150 },
        data: { label: "Scout Agent" },
      },
      {
        id: "node-3",
        type: "agent_writer",
        position: { x: 550, y: 150 },
        data: { label: "Writer Agent (Voice DNA)" },
      },
      {
        id: "node-4",
        type: "agent_critic",
        position: { x: 800, y: 150 },
        data: { label: "Critic Agent (Score 0-100)" },
      },
      {
        id: "node-5",
        type: "output_draft_store",
        position: { x: 1050, y: 150 },
        data: { label: "Save Polished Post" },
      },
    ],
    edges: [
      { id: "e1-2", source: "node-1", target: "node-2" },
      { id: "e2-3", source: "node-2", target: "node-3" },
      { id: "e3-4", source: "node-3", target: "node-4" },
      { id: "e4-5", source: "node-4", target: "node-5" },
    ],
  },
];
