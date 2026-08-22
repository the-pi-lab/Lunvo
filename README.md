# LUNVO 🚀

> **The Ultimate Open Source AI LinkedIn Growth Engine**

LUNVO is a powerful, locally-hosted, BYOK (Bring Your Own Key) Content Factory designed to help creators, founders, and marketers dominate LinkedIn—without risking account bans. 

Instead of relying on rigid, expensive SaaS platforms, LUNVO puts the power of a **3-Agent AI Pipeline** directly into your hands, completely open-source.

---

## 🌟 Key Features

### 1. Universal AI Router (BYOK)
No vendor lock-in. Plug in your own API keys for:
- OpenAI (GPT-4o, GPT-3.5)
- Anthropic (Claude 3.5 Sonnet)
- Google AI (Gemini 1.5 Pro)
- Groq / Local LLMs (via LM Studio / Ollama)

### 2. Multi-Agent Content Pipeline
Why use one AI when you can have a team? LUNVO uses a native, strict orchestrator:
- **🕵️‍♂️ Scout Agent**: Analyzes your topic, finds trends, and creates 3 distinct viral hooks (Data, Story, Controversial).
- **✍️ Writer Agent**: Drafts the post by strictly following your unique formatting and tone.
- **🧐 Critic Agent**: Audits the draft against the LinkedIn algorithm, removes fluff, fixes whitespace, and assigns a Virality Score (1-100).

### 3. Voice DNA 🧬
Tired of AI sounding like a robot? Configure your **Voice DNA** with interactive sliders (Formality, Emoji Usage, Technical Depth, Snark Level). LUNVO saves this schema locally and dynamically injects it into every prompt.

### 4. Zero-Ban Safety Architecture
LUNVO does **not** use unofficial LinkedIn APIs, web scrapers, or browser extensions that get accounts banned. We provide:
- OS-level safe `navigator.clipboard` functionality.
- Webhook dispatchers (Make.com, Zapier) for safe scheduling.

### 5. Instant Content Repurposer
Turn a single LinkedIn post into a multi-channel empire with one click:
- **Twitter Thread**: Automatically numbered and hook-optimized.
- **Newsletter / Blog**: Expanded long-form deep dive.
- **Video Script**: 60-second visual/audio script for TikTok & Reels.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS & Lucide React Icons
- **State & Storage**: Supabase (Cloud config) + LocalStorage (Sensitive Keys)
- **AI Integration**: Custom Universal AI Adapter (No heavy frameworks like LangChain, maximum speed and reliability).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Supabase Project (for optional cloud config syncing)
- At least one API Key (OpenAI, Anthropic, Gemini, or Groq)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/lunvo.git
   cd lunvo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open LUNVO:**
   Navigate to `http://localhost:3000` in your browser.

---

## 💡 How to Use

1. **Setup Your Keys**: Go to the **Settings** page and securely enter your API keys. LUNVO stores these locally in your browser.
2. **Tune Your Voice**: Go to **Voice DNA** and adjust the sliders to match your personal brand.
3. **Generate Content**: Head to the **Content Factory**. Type in a topic, and watch the 3-Agent pipeline build your post live.
4. **Repurpose**: Take your winning post to the **Repurposer Studio** and generate Twitter threads or newsletters.

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the Open Source Community.
