/**
 * Environment Variable Check Script
 * Logs status of required environment variables.
 */

const requiredEnvs = [
  // Supabase is now OPTIONAL (Phase 18 local-first). Rate limiter uses memory/Upstash/connector.
  // Uncomment if you require hosted auth:
  // "NEXT_PUBLIC_SUPABASE_URL",
  // "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  // "SUPABASE_SERVICE_ROLE_KEY",
];

const aiProviderEnvs = [
  "NVIDIA_API_KEY_DEEPSEEK",
  "NVIDIA_API_KEY_MOONSHOT",
  "NVIDIA_SHARED_API_KEY",
  "GEMINI_API_KEY",
  "GROQ_API_KEY",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
];

console.log("🔍 Checking Environment Variables...");

let missing = false;

requiredEnvs.forEach((env) => {
  if (process.env[env]) {
    console.log(`✅ ${env} is set.`);
  } else {
    console.log(`❌ ${env} is MISSING.`);
    missing = true;
  }
});

const configuredAiProviders = aiProviderEnvs.filter((env) => Boolean(process.env[env]));

if (configuredAiProviders.length === 0) {
  // Local-first: BYOK via UI vault works keyless-server. Warn only, don't fail.
  console.log("⚠️  No server AI key configured — local-first BYOK vault still works.");
  console.log("   Set GEMINI_API_KEY or GROQ_API_KEY for free-tier platform routes.");
} else {
  console.log(`✅ AI providers configured: ${configuredAiProviders.join(", ")}`);
}

const hasDeepseekNvidia = Boolean(
  process.env.NVIDIA_API_KEY_DEEPSEEK ||
  process.env.NVIDIA_SHARED_API_KEY ||
  process.env.NVIDIA_NIM_API_KEY_2
);

const hasMoonshotNvidia = Boolean(
  process.env.NVIDIA_API_KEY_MOONSHOT ||
  process.env.NVIDIA_PREMIUM_API_KEY ||
  process.env.NVIDIA_NIM_API_KEY_1
);

if (!hasDeepseekNvidia) {
  console.log("⚠️  DeepSeek key missing. Free/Starter routing for DeepSeek will fall back.");
}

if (!hasMoonshotNvidia) {
  console.log("⚠️  Moonshot key missing. Starter/Pro routing for Moonshot will fall back.");
}

if (!hasDeepseekNvidia && !hasMoonshotNvidia) {
  console.log("⚠️  NVIDIA NIM keys are not configured. Traffic will use fallback providers only.");
}

if (!process.env.CURRENTS_API_KEY) {
  console.log(
    "⚠️  CURRENTS_API_KEY is not set. Trending/search will run without Currents API augmentation."
  );
} else {
  console.log("✅ CURRENTS_API_KEY is set.");
}

if (missing) {
  console.log("\n⚠️  Some required environment variables are missing.");
  process.exit(1);
} else {
  console.log("\n✨ All required environment variables are present.");
}
