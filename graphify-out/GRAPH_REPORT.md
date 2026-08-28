# Graph Report - LUNVO (2026-08-28)

## Corpus Check

- 167 files · ~75,325 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 995 nodes · 1815 edges · 129 communities (55 shown, 74 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.86)
- Token cost: 28,500 input · 7,800 output

## Community Hubs (Navigation)

- API Routes
- Cloud & Connectors
- Voice DNA Studio
- Analyze API
- Create & Analyze UI
- Distribution & News
- AI Engine
- Carousel & Images
- Landing Film
- App Shell
- RSS & Search
- News Cache
- Local Store
- Scoring Engine
- Humanizer
- Tiptap Editor
- App Layout
- Voice Types
- Rate Limiter
- YouTube Helper
- Marketplace
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 115
- Community 116
- Community 117
- Community 118
- Community 123
- Community 124
- Community 125

## God Nodes (most connected - your core abstractions)

1. `unifiedAI()` - 33 edges
2. `cn()` - 24 edges
3. `AIProfile` - 22 edges
4. `searchTrendingArticles()` - 19 edges
5. `compilerOptions` - 18 edges
6. `scripts` - 17 edges
7. `getActiveAIProfile()` - 16 edges
8. `DnaTrainer()` - 15 edges
9. `rebuildCaches()` - 15 edges
10. `getVault()` - 14 edges

## Surprising Connections (you probably didn't know these)

- `LUNVO Logo Asset (Screenshot Duplicate)` --references--> `LUNVO Brand Mark` [INFERRED]
  Screenshot 2026-04-18 153032.png → public/brand/lunvo-logo.png
- `Apple Touch Icon` --references--> `LUNVO Brand Mark` [INFERRED]
  src/app/apple-icon.png → public/brand/lunvo-logo.png
- `Favicon Icon` --references--> `LUNVO Brand Mark` [INFERRED]
  src/app/icon.png → public/brand/lunvo-logo.png
- `Writer Agent` --references--> `Writer Agent` [EXTRACTED]
  CONTRIBUTING.md → README.md
- `Universal Router` --references--> `Universal AI Router` [EXTRACTED]
  CONTRIBUTING.md → README.md

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **Scout-Writer-Critic Serial Pipeline** — readme_scout_agent, readme_writer_agent, readme_critic_agent, contributing_orchestrator, contributing_scout_agent, contributing_writer_agent, contributing_critic_agent [EXTRACTED 1.00]
- **LUNVO Brand Identity System** — public_brand_lunvo_logo_lunvo_brand_mark, public_brand_lunvo_logo_gradient_palette, public_brand_lunvo_logo_white_l_cutout, public_icons_icon_192_pwa_icon_192, public_icons_icon_512_pwa_icon_512, src_app_apple_icon_apple_touch_icon, src_app_icon_favicon_icon, screenshot_2026_04_18_153032_lunvo_logo_duplicate [EXTRACTED 1.00]
- **Voice DNA Personalization Stack** — readme_voice_dna, contributing_voice_dna_ingestion, rebuild_plan_voice_dna_fix, readme_writer_agent, contributing_writer_agent [EXTRACTED 1.00]

## Communities (129 total, 74 thin omitted)

### Community 0 - "API Routes"

Cohesion: 0.07
Nodes (54): POST(), dynamic, getClientIp(), getProfileFromHeaders(), POST(), RepurposePage(), TabId, TABS (+46 more)

### Community 1 - "Cloud & Connectors"

Cohesion: 0.06
Nodes (33): CloudPage(), CONNECTORS, Platform, NewsConnectorsPage(), MARQUEE_WORDS, MagneticCTA(), ACTS, PipelineTheater() (+25 more)

### Community 2 - "Voice DNA Studio"

Cohesion: 0.07
Nodes (44): PersonaCard(), TabId, TABS, TunerSection(), SLASH_COMMANDS, TiptapEditor(), TiptapEditorProps, FailoverToggle() (+36 more)

### Community 3 - "Analyze API"

Cohesion: 0.06
Nodes (40): dynamic, getClientIp(), POST(), dynamic, getClientIp(), getIsBYOK(), POST(), AI_CONFIG (+32 more)

### Community 4 - "Create & Analyze UI"

Cohesion: 0.08
Nodes (42): AnalysisResult, AnalyzePostPage(), Score, CreatePage(), StepState, DraftsPage(), SourceFilter, DashboardPage() (+34 more)

### Community 5 - "Distribution & News"

Cohesion: 0.09
Nodes (35): Button, ButtonProps, buttonVariants, AllSizes, AllVariants, Default, Disabled, meta (+27 more)

### Community 6 - "AI Engine"

Cohesion: 0.12
Nodes (29): AIConfigCard(), ALL_CATEGORIES, ProviderGrid(), ProviderGridProps, addToVault(), clearVault(), getActiveProfile(), getActiveProfileId() (+21 more)

### Community 7 - "Carousel & Images"

Cohesion: 0.09
Nodes (22): DashboardLayout(), SilkCanvas(), PWARegister(), AppShell(), AppShellProps, UserProfile, CmdItem, CommandK() (+14 more)

### Community 8 - "Landing Film"

Cohesion: 0.07
Nodes (29): **/\*.d.ts, dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/_.ts, node_modules, \**/_.ts (+21 more)

### Community 9 - "App Shell"

Cohesion: 0.14
Nodes (24): EngagementMeter(), EngagementMeterProps, LinkedInMobilePreview(), LinkedInMobilePreviewProps, PostEditor(), PostEditorProps, runEngagementPredictor(), BANNED_AI_PHRASES (+16 more)

### Community 10 - "RSS & Search"

Cohesion: 0.08
Nodes (25): lint-staged, *.{json,css,md}, *.{ts,tsx,js,jsx}, name, private, scripts, build, build-storybook (+17 more)

### Community 11 - "News Cache"

Cohesion: 0.12
Nodes (15): ImageStudio(), ImageStudioProps, fallbackCanvas(), generateImage(), GenerateImageInput, GenerateImageResult, AspectRatio, buildImagePrompt() (+7 more)

### Community 12 - "Local Store"

Cohesion: 0.20
Nodes (15): fetchHackerNewsBestStories(), fetchHackerNewsStories(), HNStory, normalizeDescription(), CachedSearchEntry, computeRelevance(), getCachedResult(), getPrimaryKeyword() (+7 more)

### Community 13 - "Scoring Engine"

Cohesion: 0.28
Nodes (13): InlineMeter(), analyzeLocally(), BANNED_OPENERS, clamp(), CTA_PATTERNS, getLines(), label(), LocalAnalysis (+5 more)

### Community 14 - "Humanizer"

Cohesion: 0.14
Nodes (13): aliases, components, utils, rsc, $schema, style, tailwind, baseColor (+5 more)

### Community 15 - "Tiptap Editor"

Cohesion: 0.21
Nodes (12): ApiErrorCode, errorResponse(), successResponse(), baseMeta(), formatError(), getEnvLevel(), getRequestId(), LOG_LEVEL_ORDER (+4 more)

### Community 16 - "App Layout"

Cohesion: 0.32
Nodes (11): GET(), runtime, dynamic, extractHashtags(), GET(), POST(), revalidate, runtime (+3 more)

### Community 17 - "Voice Types"

Cohesion: 0.27
Nodes (11): GET(), LEARN_TOPICS, LearnNewsItem, CurrentsArticle, CurrentsResponse, fetchCurrents(), fetchCurrentsLatestNews(), fetchCurrentsNewsByKeyword() (+3 more)

### Community 18 - "Rate Limiter"

Cohesion: 0.17
Nodes (12): Critic Agent, Scout Agent, Voice DNA Ingestion, Writer Agent, Critic Agent, Engagement Predictor, Humanizer — Anti-AI-Slop, Scout Agent (+4 more)

### Community 19 - "YouTube Helper"

Cohesion: 0.45
Nodes (10): DEFAULT_STATE, getRssCacheSnapshot(), getRssCacheState(), pickRandomArticles(), pickRandomGeneratedPosts(), setCachedFeeds(), setGeneratedPostsCache(), setLastError() (+2 more)

### Community 20 - "Marketplace"

Cohesion: 0.20
Nodes (11): Agentic Pipeline, Orchestrator, Strict JSON Communication Protocol, Universal Router, BYOK (Bring Your Own Key), MCP Server, Multi-Channel Repurposer Studio, 3-Agent Neural Pipeline (+3 more)

### Community 21 - "Community 21"

Cohesion: 0.27
Nodes (9): cache, CacheEntry, _getCacheEntry(), _isCacheHit(), normalizeKey(), resolveNewsContext(), withTimeout(), SearchResult (+1 more)

### Community 22 - "Community 22"

Cohesion: 0.33
Nodes (10): dedupeArticles(), DEFAULT_FEEDS, fetchFeed(), fetchLatestRssArticles(), getConfiguredFeeds(), normalizeDescription(), normalizeFeedEntry(), parser (+2 more)

### Community 23 - "Community 23"

Cohesion: 0.22
Nodes (10): Gradient Palette Purple to Cyan, LUNVO Brand Mark, White L Cutout Negative Space, Blue Frame PWA Container, PWA Icon 192x192, Maskable Icon Variant, PWA Icon 512x512, LUNVO Logo Asset (Screenshot Duplicate) (+2 more)

### Community 24 - "Community 24"

Cohesion: 0.24
Nodes (6): Tab, MARKETPLACE_TEMPLATES, MarketplaceTemplate, GeneratedLinkedInPost, RssCacheSnapshot, RssFeedConfig

### Community 25 - "Community 25"

Cohesion: 0.22
Nodes (9): eslint, devDependencies, eslint, @storybook/addon-docs, @storybook/addon-mcp, @vitest/browser-playwright, @storybook/addon-docs, @storybook/addon-mcp (+1 more)

### Community 26 - "Community 26"

Cohesion: 0.22
Nodes (9): gsap, dependencies, gsap, react-hook-form, @tiptap/extension-placeholder, @tiptap/react, react-hook-form, @tiptap/extension-placeholder (+1 more)

### Community 27 - "Community 27"

Cohesion: 0.25
Nodes (6): fadeIn, fadeSlide, PageTransition(), PageTransitionProps, staggerChild, staggerContainer

### Community 29 - "Community 29"

Cohesion: 0.46
Nodes (7): cleanDescription(), composeTrendingPost(), dynamic, extractHashtags(), GET(), hashText(), pickVariant()

### Community 30 - "Community 30"

Cohesion: 0.29
Nodes (4): DEMO_LINES, FULL_DEMO, StudioMockup(), useTyping()

### Community 31 - "Community 31"

Cohesion: 0.29
Nodes (6): extends, rules, @next/next/no-img-element, react/no-unescaped-entities, next/core-web-vitals, plugin:storybook/recommended

### Community 32 - "Community 32"

Cohesion: 0.29
Nodes (5): jetbrainsMono, metadata, newsreader, plusJakarta, viewport

### Community 34 - "Community 34"

Cohesion: 0.62
Nodes (6): unifiedText(), buildFallbackPost(), buildPrompt(), cleanDescription(), generateLinkedInPostFromArticle(), generateLinkedInPostsFromArticles()

### Community 35 - "Community 35"

Cohesion: 0.33
Nodes (5): aiProviderEnvs, configuredAiProviders, hasDeepseekNvidia, hasMoonshotNvidia, requiredEnvs

### Community 37 - "Community 37"

Cohesion: 0.47
Nodes (4): applyTheme(), initTheme(), setTheme(), Theme

### Community 38 - "Community 38"

Cohesion: 0.53
Nodes (5): DevtoArticle, fetchDevtoArticles(), fetchDevtoArticlesByTags(), fetchDevtoTrending(), normalizeDescription()

### Community 39 - "Community 39"

Cohesion: 0.53
Nodes (5): fetchGithubTrending(), fetchGithubTrendingViaAPI(), GithubTrendingRepo, normalizeDescription(), parseGithubTrendingHTML()

### Community 44 - "Community 44"

Cohesion: 0.67
Nodes (3): LUNVO, Zero-Ban Philosophy, Zero-Ban Guarantee

### Community 45 - "Community 45"

Cohesion: 0.67
Nodes (3): 44 Phases Roadmap, Audit Verdict 55% Ready, LUNVO v2.0 Rebuild Plan

## Knowledge Gaps

- **299 isolated node(s):** `next/core-web-vitals`, `plugin:storybook/recommended`, `react/no-unescaped-entities`, `@next/next/no-img-element`, `config` (+294 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **74 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `Reveal()` connect `Cloud & Connectors` to `Community 24`, `API Routes`, `Voice DNA Studio`, `Create & Analyze UI`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 25` to `RSS & Search`, `Community 50`, `Community 51`, `Community 52`, `Community 55`, `Community 56`, `Community 61`, `Community 62`, `Community 64`, `Community 85`, `Community 86`, `Community 87`, `Community 88`, `Community 89`, `Community 90`, `Community 91`, `Community 92`, `Community 93`, `Community 94`, `Community 95`, `Community 96`, `Community 97`, `Community 98`, `Community 99`, `Community 100`, `Community 101`, `Community 102`, `Community 103`, `Community 104`, `Community 105`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 26` to `RSS & Search`, `Community 53`, `Community 54`, `Community 57`, `Community 58`, `Community 59`, `Community 60`, `Community 63`, `Community 65`, `Community 67`, `Community 68`, `Community 69`, `Community 70`, `Community 71`, `Community 72`, `Community 73`, `Community 74`, `Community 75`, `Community 76`, `Community 77`, `Community 78`, `Community 79`, `Community 80`, `Community 81`, `Community 82`, `Community 83`, `Community 84`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `plugin:storybook/recommended`, `react/no-unescaped-entities` to the rest of the system?**
  _299 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.07367737747484583 - nodes in this community are weakly interconnected._
- **Should `Cloud & Connectors` be split into smaller, more focused modules?**
  _Cohesion score 0.05605499735589635 - nodes in this community are weakly interconnected._
- **Should `Voice DNA Studio` be split into smaller, more focused modules?**
  _Cohesion score 0.0711864406779661 - nodes in this community are weakly interconnected._
