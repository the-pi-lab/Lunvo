# Contributing to LUNVO 🤝

Thank you for your interest in contributing to LUNVO! As an open-source tool built for creators, we rely on the community to help us make the best AI content engine available.

## 🧠 Architecture Overview

To help you understand the codebase, here is a high-level overview of LUNVO's architecture.

### 1. The Universal Router (`src/lib/ai/universalRouter.ts`)

Instead of using heavy, opinionated frameworks (like LangChain or LlamaIndex), we use a custom, lightweight router.

- All AI providers (OpenAI, Anthropic, Gemini) are mapped to a standard `Message[]` protocol.
- If you want to add a new AI provider, you only need to add the mapping logic inside the `universalRouter.ts` switch statement.

### 2. The Agentic Pipeline (`src/lib/ai/agents/`)

LUNVO uses a strict serial agent pipeline, managed by `orchestrator.ts`.

1. **Scout Agent**: Generates hooks and structure based on a topic.
2. **Writer Agent**: Injects the user's `Voice DNA` and drafts the post.
3. **Critic Agent**: Reviews the draft against LinkedIn algorithm rules and returns a final score + formatted draft.

**Important Rule:** Agents communicate via strictly parsed JSON. When modifying prompts, ensure the LLM is explicitly instructed to output _only_ JSON without markdown code blocks.

### 3. Voice DNA Ingestion (`src/lib/ai/injector.ts`)

Voice DNA is stored locally or in Supabase. Before any request is sent to the Writer Agent, `injector.ts` intercepts the request and prepends a `system` prompt detailing the user's stylistic preferences (Emoji usage, snark level, etc.).

---

## 🛠️ Development Setup

1. Fork the repository and clone your fork.
2. Run `npm install`.
3. Create a `.env.local` file with your Supabase credentials (for database testing) and API keys (for AI testing).
4. Run the development server with `npm run dev`.

---

## 📝 Pull Request Guidelines

1. **Keep it Small**: Focus your PR on a single feature, bug fix, or improvement.
2. **Type Safety**: LUNVO strictly enforces TypeScript. Ensure your code has no `any` types unless absolutely necessary. Run `npm run build` locally before submitting a PR to ensure compilation succeeds.
3. **UI Consistency**: We use Tailwind CSS and Lucide Icons. Follow the existing design language (slate/blue/emerald color palettes, rounded-xl containers, dark mode compatibility).
4. **No Unofficial APIs**: Do not submit PRs that add unofficial LinkedIn API scraping or automation. LUNVO strictly adheres to OS-level distribution (Clipboard / Webhooks) to prevent account bans.

---

## 🌱 Good First Issues — 10 Starter Tasks

Pick one, keep PR <300 lines, run `npm run build` before push. All are `good first issue` labeled.

| #   | Issue                                                                                                      | Area         | File hint                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------- |
| 1   | **Ollama model selector UI** — dropdown for `llama3.2/qwen2.5/mistral` in Studio → Providers               | AI Engine    | `src/lib/ai/providers/registry.ts:645` + `src/components/settings/AIConfigCard.tsx:1` |
| 2   | **Hindi translation for landing** — `README_hi.md` + `src/app/layout.tsx:5` toggle                         | Docs/i18n    | `src/app/layout.tsx:5`                                                                |
| 3   | **Record 15s demo GIF** — Scout→Writer→Critic live + replace `README.md:71` placeholder                    | Docs         | `README.md:71`                                                                        |
| 4   | **Notion as news source** — add `fetchNotionTrending()` to `src/lib/rss/searchService.ts:170`              | News/RSS     | `src/lib/rss/searchService.ts:170`                                                    |
| 5   | **2 more carousel templates** — e.g. `Timeline` + `Comparison` in `src/lib/carousel/generator.ts:1`        | Carousel     | `src/lib/carousel/generator.ts:1`                                                     |
| 6   | **2 more image styles** — `Film Noir` + `Neon Pop` in `src/lib/ai/image/presets.ts:1`                      | Image Studio | `src/lib/ai/image/presets.ts:1`                                                       |
| 7   | **Humanizer banned list expansion** — add 10 more AI phrases to `src/lib/ai/humanizer.ts:7`                | Humanizer    | `src/lib/ai/humanizer.ts:7`                                                           |
| 8   | **3 marketplace PR templates** — `Product Hunt Launch` etc. in `src/lib/marketplace/templates.ts:1`        | Marketplace  | `src/lib/marketplace/templates.ts:1`                                                  |
| 9   | **Mobile UI polish** — `src/app/dashboard/create/page.tsx:1` pipeline steps `pl-[41px]` on small screens   | Dashboard    | `src/app/dashboard/create/page.tsx:1`                                                 |
| 10  | **Add GNews/Mediastack test** — mock `fetchCurrentsNewsByKeyword` in `src/lib/news/currentsService.ts:102` | News         | `src/lib/news/currentsService.ts:102`                                                 |

> Claim one: comment `I want #3` on the issue — we’ll assign it and mark `good first issue`.

## 🐞 Reporting Bugs

If you find a bug, please open an issue with:

- A clear title.
- Steps to reproduce.
- Your OS and browser.
- Any relevant logs from the console.

---

Welcome to the LUNVO team! Let's build the future of content together. 🚀
