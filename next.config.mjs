import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.star-history.com" },
      { protocol: "https", hostname: "socialify.git.ci" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "capsule-render.vercel.app" },
      { protocol: "https", hostname: "readme-typing-svg.herokuapp.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "img.shields.io" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      https: false,
    };
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            // Self-host hardened defaults: no unsafe-eval, explicit allowlist.
            // NOTE (self-host): connect-src keeps user webhook wildcards (*.zapier/*.make)
            // by design — deployer owns keys/bill. To lock down, proxy via /api/webhook/proxy
            // and remove the two wildcards below.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://us.i.posthog.com https://us-assets.i.posthog.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://image.pollinations.ai https://placehold.co https://avatars.githubusercontent.com https://img.shields.io https://api.dicebear.com https://api.star-history.com https://socialify.git.ci https://capsule-render.vercel.app https://readme-typing-svg.herokuapp.com",
              "connect-src 'self' https://image.pollinations.ai https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com https://api.groq.com https://api.deepseek.com https://openrouter.ai https://api.x.ai https://api.mistral.ai https://models.github.ai https://router.huggingface.co https://api.cerebras.ai https://api.sambanova.ai https://integrate.api.nvidia.com https://api.fireworks.ai https://api.together.xyz https://deepinfra.com https://api.hyperbolic.xyz https://api.novita.ai https://api.tokenfactory.nebius.com https://api.lambda.ai https://api.scaleway.ai https://inference.baseten.co https://api.crusoecloud.ai https://api.iointelligence.com https://api.replicate.com https://api.minimax.io https://api.moonshot.ai https://open.bigmodel.cn https://dashscope-intl.aliyuncs.com https://api.upstage.ai https://api.sarvam.ai https://api.clarifai.com https://api.chutes.ai https://inference.do-ai.run https://api.venice.ai https://api.perplexity.ai https://api.cohere.ai https://ai-gateway.vercel.sh https://api.cloudflare.com https://aihubmix.com https://api.302.ai https://api.us.langdb.ai https://api.letta.com https://ollama.com https://api.telegram.org https://us.i.posthog.com https://us-assets.i.posthog.com http://localhost:* http://127.0.0.1:* https://*.zapier.com https://*.make.com https://api.bufferapp.com https://www.youtube.com https://noembed.com",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
              "report-uri /api/csp-report",
            ].join("; "),
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
