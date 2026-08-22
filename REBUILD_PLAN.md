# LUNVO v2.0 — Full Rebuild Plan (44 Phases)
> **Goal:** World's First 100% Open Source, Zero-Ban, BYOK + Local-First LinkedIn OS. Taplio $199 + Supergrow $69 + AuthoredUp $19 ko free me destroy + 1000 Stars in 1 Day.

---

## 0. Executive Summary

**Audit Verdict 55% Ready:**
- Idea A+ par execution adha. `src/lib/ai/router.ts:232` (server NVIDIA) + `src/lib/ai/universalRouter.ts:6` (client BYOK) alag. `src/app/dashboard/create/page.tsx:23` me `voiceDna=null` hard-coded — README ka killer feature dead.
- Design split: Landing `tailwind.config.ts:13` (#fff8f0 + Newsreader) vs Dashboard `src/app/dashboard/layout.tsx:104` (slate-50 + blue) — ek product ke 2 theme.
- Koi bhi open source BYOK + 3-Agent + Voice DNA + Real Dataset Scoring ek saath nahi deta. Wahi moat hai.

**v2.0 Principles:**
1. Single Source of Truth — 1 Router, 1 Design System, 1 Prompt Engine
2. Zero-Ban Guarantee — No unofficial LinkedIn API, sirf Clipboard/Webhook/MCP read-only
3. Local-First + BYOK — User ka key, user ka data, self-host in 30s
4. Community > Code — Har feature PR-ready, good-first-issue, docs-first

---

## 1. Tech Stack (Final)

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 15.3 App Router | `package.json:27` 14.2.15 -> 15 PPR + RSC |
| Language | TS 5.6 strict + noUncheckedIndexedAccess | `tsconfig.json:6` already strict |
| UI | Tailwind 3.4 + shadcn/ui + Radix | `package.json:15-18` Radix already |
| Motion | framer-motion 11.11 | `package.json:24` already |
| AI | Unified Router (OpenAI-compat + Gemini + Anthropic + Ollama) | Merge `router.ts` + `universalRouter.ts` |
| DB/Auth | Supabase SSR 0.5.1 + RLS | `package.json:20-21` |
| Validation | Zod 3.23 | `package.json:33` |
| Tests | Vitest + Playwright | NEW |
| Deploy | Vercel + Docker node:20-alpine | NEW |
| Icons | lucide-react 0.453 | `package.json:26` |

---

## 2. New Folder Structure

```
lunvo/
├── src/
│   ├── app/
│   │   ├── (marketing)/page.tsx           # src/app/page.tsx:1 redesign
│   │   ├── (app)/dashboard/
│   │   │   ├── layout.tsx                # NEW Shell (Sidebar + CmdK)
│   │   │   ├── page.tsx                  # src/app/dashboard/page.tsx:1 Bento 2.0
│   │   │   ├── create/page.tsx           # src/app/dashboard/create/page.tsx:1 fix voiceDna
│   │   │   ├── analyze/page.tsx
│   │   │   ├── drafts/page.tsx
│   │   │   ├── repurpose/page.tsx        # Coming Soon hatana
│   │   │   ├── learn/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── generate/route.ts         # src/app/api/generate/route.ts:112 unify
│   │       ├── analyze/route.ts
│   │       └── repurpose/route.ts        # NEW
│   ├── components/
│   │   ├── ui/ (button, dialog, ...)      # shadcn
│   │   ├── shell/ (Sidebar, CommandK, Topbar)
│   │   ├── editor/ (TiptapEditor, LinkedInPreview)
│   │   ├── analyze/ (ScoreGrid)
│   │   └── voice-dna/ (DnaTuner)         # src/components/voice-dna/DnaTuner.tsx:1 v2
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── router.unified.ts         # MERGE router.ts:232 + universalRouter.ts:6
│   │   │   ├── prompts.v3.ts             # src/lib/ai/prompts.ts:13 upgrade
│   │   │   ├── agents/ (scout, writer, critic, orchestrator.ts:1)
│   │   │   └── engagementPredictor.ts:1  # LIVE
│   │   ├── design/tokens.ts
│   │   └── supabase/ (client, server, streak.ts:1)
│   ├── styles/tokens.css                 # src/app/globals.css:1 replace
│   └── types/
├── supabase/migrations/ (009_*.sql)
├── docker/ (Dockerfile, docker-compose.yml)
├── docs/ (self-host, mcp)
├── .github/workflows/ci.yml
└── public/brand/
```

---

## 3. Design Tokens 2.0

**Problem:** 2 theme. Fix: Single token.

```css
:root {
  --background: #FBFAF9;
  --on-background: #1A1814;
  --surface: #FFFFFF;
  --surface-container: #F1EFE9;
  --surface-container-low: #F7F5F0;
  --surface-container-lowest: #FFFFFF;
  --primary: #004AC6;
  --primary-container: #2563eb;
  --secondary: #006e2d;
  --outline: rgba(26,24,20,0.08);
  --outline-variant: rgba(26,24,20,0.06);
  --error: #BA1A1A;
  --radius-xl: 16px;
  --radius-lg: 12px;
  --shadow-premium: 0 12px 40px rgba(26,24,20,0.06);
}
```

Typography: Newsreader 32-72px Headlines, Plus_Jakarta_Sans 14-16px Body, JetBrains_Mono 11px Meta. Already `src/app/layout.tsx:5` me loaded, ab dashboard me bhi same.

---

## 4. 44 Phases — Detailed

### STAGE 0: AUDIT LOCK
**Phase 01 — Code Freeze & Branch**
- Task: `git checkout -b v2-rebuild`, `build_log.txt` snapshot `docs/audit/build-2026-08-22.log` me save, `.next/` gitignore verify.
- Done: Branch pushed, log saved.

**Phase 02 — Env Audit**
- Task: `.env.example:1` + `src/lib/ai/router.ts:51` ke `getEnvValue()` 6 fallbacks audit -> `docs/env-map.md`. Single `AI_PROVIDER_KEYS` object banao.
- Done: No hard-coded fallback chain.

**Phase 03 — Tech Debt Registry**
- Task: Issue #1 `create/page.tsx:23 null`, #2 `router.ts:35 in-memory limiter`, #3 `scoutAgent.ts:41 brittle JSON`, #4 design split -> 10 GitHub Issues `good first issue`.
- Done: Issues created, `CONTRIBUTING.md:36` update.

### STAGE 1: FOUNDATION (Day 1-4)
**Phase 04 — Next 15 Upgrade**
- Task: `package.json:27` 14.2.15->15.3, `next.config.mjs:2` me `images.remotePatterns` + `headers()` CSP/HSTS.
- Done: `npm run build` pass Node20.

**Phase 05 — Strict TS**
- Task: `tsconfig.json` `noUncheckedIndexedAccess:true`, `src/lib/ai/router.ts:347` `any` -> Zod.
- Done: `tsc --noEmit` 0 errors.

**Phase 06 — Prettier + Husky**
- Task: `prettier + husky + lint-staged`, pre-commit `eslint --fix + tsc`.
- Done: Commit pe auto-fix.

**Phase 07 — Supabase RLS**
- Task: `001_initial_schema.sql` check, `users/posts/personas` RLS `auth.uid()=id`, missing -> `009_rls_fix.sql`.
- Done: Unauth SELECT 0 rows.

**Phase 08 — Logger**
- Task: `src/lib/logger.ts` pino, har `api/*/route.ts` standard `{error,code}`.
- Done: Prod logs me requestId.

**Phase 09 — Testing Harness**
- Task: `vitest + playwright`, first test `src/lib/ai/voiceDna/ingestor.ts:1` normalize.
- Done: `npm test` 1 pass.

### STAGE 2: DESIGN SYSTEM (Day 5-9)
**Phase 10 — shadcn/ui**
- Task: `npx shadcn init` add button/dialog/toast/card, `CreditBadge.tsx:1` replace.
- Done: `src/components/ui/button.tsx` exists.

**Phase 11 — Tokens.css**
- Task: `src/app/globals.css:1` -> CSS Vars, `tailwind.config.ts:13` vars se read.
- Done: Light/Dark via `html[data-theme]`.

**Phase 12 — App Shell V2**
- Task: `src/app/dashboard/layout.tsx:104` top-nav -> `Sidebar.tsx` 280px collapsible + `Topbar.tsx` 48px + `CommandK.tsx` Cmd+K. NAV_ITEMS 6.
- Done: Mobile bottom tab, Cmd+K opens.

**Phase 13 — Landing V2**
- Task: `src/app/page.tsx:155` hero left textarea + right live ScoreGrid, `src/app/page.tsx:306` 4->6 cards (Carousel, Humanizer).
- Done: Lighthouse 95+.

**Phase 14 — Motion**
- Task: `framer-motion` `AnimatePresence` har page `fade 200ms + slide 8px` standard, `src/app/dashboard/analyze/page.tsx:83` pattern.
- Done: No layout shift.

**Phase 15 — PWA**
- Task: `manifest.json` + `src/app/layout.tsx:40` themeColor + next-pwa SW.
- Done: Install prompt.

**Phase 16 — Storybook**
- Task: `localhost:6006` har `ui/*` preview.
- Done: Button stories visible.

### STAGE 3: AI ENGINE (Day 10-16) CRITICAL
**Phase 17 — Unified Router**
- Task: `router.ts:232` + `universalRouter.ts:6` -> `router.unified.ts` single `callAI(profile,messages)`. `types.ts:1` AIProfile enum strict.
- Done: Both create + api/generate same import.

**Phase 18 — Serverless Limiter**
- Task: `router.ts:35` in-memory -> Supabase `ai_usage` table / Upstash Redis, `check_and_increment_ai` RPC `004_daily_limits.sql` jaisa.
- Done: Parallel 2 req -> 429 correct.

**Phase 19 — Voice DNA Fix**
- Task: `create/page.tsx:23` null -> `getVoiceDNA()` from `storage.ts:1` + Supabase, `orchestrator.ts:19` pass, `injector.ts:9` verify.
- Done: Slider move -> next gen tone change.

**Phase 20 — Prompts V3 + Zod**
- Task: `prompts.ts:13` v3, `scoutAgent.ts:12` `writerAgent.ts:7` `criticAgent.ts:10` Zod validate, `parseAIJson` `router.ts:440` reuse, brittle replace hatana.
- Done: 100 gens 0 JSON error.

**Phase 21 — Engagement Live**
- Task: `engagementPredictor.ts:35` -> `api/generate/route.ts:261` + `api/analyze/route.ts:93` attach `predictedEngagementRate`, `dashboard/page.tsx:204` hard 94% replace.
- Done: Analyze shows Hook 8 + ER 3.2%.

**Phase 22 — News/RSS**
- Task: `api/generate/route.ts:74` `resolveNewsContext` -> `cacheService.ts:1` 6hr TTL + 5s timeout.
- Done: Same topic 2min -> cache hit.

**Phase 23 — Streaming**
- Task: `router.unified.ts` `stream:true`, `create/page.tsx:80` progress live token streaming.
- Done: Draft word-by-word.

**Phase 24 — Cost Guard**
- Task: `api/analyze-public/route.ts:1` IP limit 5/day, `analyze/route.ts:57` RPC public pe.
- Done: 6th unauth -> 429.

### STAGE 4: FEATURES (Day 17-25)
**Phase 25 — Editor V2**
- Task: `PostEditor.tsx:1` -> Tiptap + slash /hook /cta, side-by-side `LinkedInMobilePreview.tsx:1`, paste `normalizePostText`.
- Done: `/` -> menu.

**Phase 26 — Tuner V2**
- Task: `DnaTuner.tsx:1` 4 sliders + `extractorPrompt.ts:1` auto-fill + `ingestor.ts:21` validation.
- Done: Save -> toast + preview regen.

**Phase 27 — Repurposer LIVE**
- Task: `repurpose/page.tsx:1` Coming Soon hatana, `twitterThread.ts:1` `newsletterBlog.ts:1` `videoScript.ts:1` -> `/api/repurpose` + YouTube URL.
- Done: 1 post -> Thread + Newsletter 1 click.

**Phase 28 — Carousel (Moat #1)**
- Task: `pptxgenjs/canvas` 1080x1350 PDF, 5 templates, `src/lib/carousel/generator.ts` NEW.
- Done: Download PDF 5 slides.

**Phase 29 — Humanizer (Moat #2)**
- Task: `prompts.ts:25` banned + burstiness, `isHumanScore` meter, `src/lib/ai/humanizer.ts`.
- Done: Toggle ON -> 90% human.

**Phase 30 — Distribution**
- Task: `clipboard.ts:1` 1-click copy + `navigator.share` + Webhook + .ics.
- Done: Copy -> LinkedIn 1 tap.

**Phase 31 — Drafts V2**
- Task: `drafts/page.tsx:1` filter/search/inline `EngagementMeter.tsx:1` bulk delete.
- Done: 100 drafts search <200ms.

**Phase 32 — Learn/Marketplace**
- Task: `learn/page.tsx:1` -> Marketplace, PR templates, `rss/aiService.ts:1` daily hooks.
- Done: Use Template -> prefill.

**Phase 33 — Analyze Unify**
- Task: `analyze/page.tsx:1` + `page.tsx:343` -> `ScoreGrid.tsx` extract.
- Done: Same dark mode.

### STAGE 5: OSS INFRA (Day 26-30)
**Phase 34 — Docker**
- Task: `Dockerfile` node:20-alpine + `docker-compose.yml` + `setup.sh`, `README.md:69` doc.
- Done: `docker compose up` -> localhost:3000.

**Phase 35 — CI**
- Task: `.github/workflows/ci.yml` lint+tsc+build+vitest on PR, delete `build_log.txt`.
- Done: Broken PR fail.

**Phase 36 — Issue Templates**
- Task: `.github/ISSUE_TEMPLATE/bug.yml` `feature.yml` `CONTRIBUTING.md:36` update 10 good-first-issue.
- Done: New Issue form.

**Phase 37 — MCP Server (Moat #3)**
- Task: `src/mcp/server.ts` `@modelcontextprotocol/sdk` tools search_trending, analyze_draft read-only.
- Done: `npx lunvo-mcp` Claude visible.

**Phase 38 — Privacy**
- Task: `privacy/page.tsx:1` real, `next.config.mjs` CSP, PostHog optional.
- Done: securityheaders A.

**Phase 39 — i18n**
- Task: `next-intl` `README_hi.md` toggle `src/app/layout.tsx:5`.
- Done: /hi/dashboard works.

### STAGE 6: LAUNCH (Day 31-35)
**Phase 40 — README 2.0**
- Task: `README.md:56` placeholder->15s GIF + Live Demo + Deploy buttons + Star History + Contributors, badges Build Passing.
- Done: 10s me samajh.

**Phase 41 — Docs Site**
- Task: `docs/` -> Fumadocs `lunvo.vercel.app/docs` BYOK/self-host/API.
- Done: docs/self-host 3 steps.

**Phase 42 — PH/HN Assets**
- Task: Tagline `LUNVO — Open Source Taplio Killer. BYOK. Zero Ban. Self-Host in 30s.` Cover 1270x760 5 shots founder comment.
- Done: PH Schedule.

**Phase 43 — Launch Day**
- Task: D-Day 06:00 Show HN, 09:00 PH, 10:00 LinkedIn (LUNVO generated), 11:00 Reddit r/opensource, 14:00 Twitter, `referral/stats/route.ts:1` leaderboard.
- Done: 24h 1000 stars 100 forks.

**Phase 44 — Post-Launch**
- Task: `changelog/page.tsx:1` Keep a Changelog + Discord + weekly Thank You tweet.
- Done: Week2 1500 stars 20 contributors.

---

## 5. Timeline

| Week | Phases | Owner |
|------|--------|-------|
| Week1 | 04-16 Foundation+Design | Solo |
| Week2 | 17-24 AI Engine | Solo critical |
| Week3 | 25-33 Features | 1-2 devs |
| Week4 | 34-39 OSS + 40-44 Launch | Marketing+Dev |
| Solo 35d | 2 devs 18d |

## 6. Success Metrics (24h)

- GitHub 1000 stars 100 forks 20 issues 5 PRs
- Demo 500 signups 200 gens P95 <4s
- Quality `npm run build` 0 errors Lighthouse 90+

## 7. Risks

- AI cost spike -> Phase24 IP limit
- Ban risk -> Phase30 only Clipboard
- Drift -> Phase11 tokens single source

---

**Next:** Bolo toh Phase04 se TodoWrite bana ke start karu? Ya reorder?
