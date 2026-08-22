import { callAI, type AICustomKeys } from "../ai/router";
import type { GeneratedLinkedInPost, RssArticle } from "./types";

const LINKEDIN_RSS_PROMPT = `Convert this tech news update into a high-performing LinkedIn post.

Title: {{title}}
Summary: {{description}}
Source: {{source}}

Rules:
- Strong hook in first line
- 5-8 short lines
- Professional and practical tone
- Focus on why it matters for founders/builders/creators
- End with a question or takeaway
- Do not use markdown
`;

const LINKEDIN_SYSTEM_PROMPT =
  "You are a concise LinkedIn ghostwriter. Turn headlines into sharp, useful, and relatable posts with a strong opening and a clear takeaway.";

function cleanDescription(description?: string): string {
  if (!description) {
    return "No description available.";
  }

  const cleaned = description
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= 700) {
    return cleaned;
  }

  const snippet = cleaned.slice(0, 700);
  const boundary = Math.max(snippet.lastIndexOf("."), snippet.lastIndexOf("!"), snippet.lastIndexOf("?"));
  if (boundary > 300) {
    return snippet.slice(0, boundary + 1).trim();
  }

  const lastSpace = snippet.lastIndexOf(" ");
  if (lastSpace > 300) {
    return `${snippet.slice(0, lastSpace).trim()}...`;
  }

  return `${snippet.trim()}...`;
}

function buildPrompt(article: RssArticle): string {
  return LINKEDIN_RSS_PROMPT
    .replace("{{title}}", article.title)
    .replace("{{description}}", cleanDescription(article.description))
    .replace("{{source}}", article.source);
}

function buildFallbackPost(article: RssArticle): string {
  const description = cleanDescription(article.description);
  const sourceName = (article.source.split("(")[0] ?? "").trim();

  return [
    article.title,
    "",
    description !== "No description available." ? description : `This trend is getting attention across ${sourceName}.`,
    "",
    "My take: the advantage is not just consuming this news, but acting on it faster than the market.",
    "",
    "What is your view on this shift?",
  ].join("\n");
}

export async function generateLinkedInPostFromArticle(article: RssArticle, customKeys?: AICustomKeys): Promise<GeneratedLinkedInPost> {
  try {
    const post = await callAI(LINKEDIN_SYSTEM_PROMPT, buildPrompt(article), "free", 0.7, 280, customKeys);

    return {
      post: post.trim(),
      source: article.source,
      title: article.title,
      description: cleanDescription(article.description),
      generatedAt: new Date().toISOString(),
      fallback: false,
    };
  } catch {
    return {
      post: buildFallbackPost(article),
      source: article.source,
      title: article.title,
      description: cleanDescription(article.description),
      generatedAt: new Date().toISOString(),
      fallback: true,
    };
  }
}

export async function generateLinkedInPostsFromArticles(articles: RssArticle[], customKeys?: AICustomKeys): Promise<GeneratedLinkedInPost[]> {
  if (!articles.length) {
    return [];
  }

  const limit = Math.min(10, articles.length);
  const selectedArticles = articles.slice(0, limit);
  return Promise.all(selectedArticles.map((article) => generateLinkedInPostFromArticle(article, customKeys)));
}
