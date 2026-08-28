/**
 * News API Provider Registry — 8 providers, BYOC style (like AI registry)
 * Each provider needs an API key pasted in Dashboard → News Connectors.
 * Keys stored locally (localStorage), never sent to our server except via connector.
 */

export interface NewsProviderDef {
  id: string;
  name: string;
  keyUrl: string;
  docsUrl?: string;
  color: string;
  freeTier?: boolean;
  // how to call: handled by newsClient
  enabledByDefault?: boolean;
}

export const NEWS_PROVIDERS: NewsProviderDef[] = [
  {
    id: "currents",
    name: "Currents API",
    keyUrl: "https://currentsapi.services/en/api",
    docsUrl: "https://currentsapi.services/en/docs/authentication",
    color: "#2563EB",
    freeTier: true,
  },
  {
    id: "newsapi",
    name: "NewsAPI.org",
    keyUrl: "https://newsapi.org/register",
    docsUrl: "https://newsapi.org/docs",
    color: "#DC2626",
    freeTier: true,
  },
  {
    id: "gnews",
    name: "GNews",
    keyUrl: "https://gnews.io/register",
    docsUrl: "https://gnews.io/docs/v4#introduction",
    color: "#7C3AED",
    freeTier: true,
  },
  {
    id: "mediastack",
    name: "Mediastack",
    keyUrl: "https://mediastack.com/product",
    docsUrl: "https://mediastack.com/documentation",
    color: "#0EA5E9",
    freeTier: true,
  },
  {
    id: "newsdata",
    name: "NewsData.io",
    keyUrl: "https://newsdata.io/register",
    docsUrl: "https://newsdata.io/documentation",
    color: "#059669",
    freeTier: true,
  },
  {
    id: "thenewsapi",
    name: "TheNewsAPI",
    keyUrl: "https://www.thenewsapi.com/register",
    docsUrl: "https://www.thenewsapi.com/documentation",
    color: "#EA580C",
    freeTier: true,
  },
  {
    id: "worldnews",
    name: "World News API",
    keyUrl: "https://worldnewsapi.com",
    docsUrl: "https://worldnewsapi.com/docs",
    color: "#1E293B",
    freeTier: true,
  },
  {
    id: "bingnews",
    name: "Bing News Search",
    keyUrl: "https://portal.azure.com/#create/Microsoft.BingSearch",
    docsUrl: "https://learn.microsoft.com/en-us/bing/search-apis/bing-news-search/",
    color: "#008373",
    freeTier: false,
  },
];

const STORAGE_PREFIX = "lunvo_news_key_";

export function getNewsKey(providerId: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(`${STORAGE_PREFIX}${providerId}`);
}

export function setNewsKey(providerId: string, key: string): void {
  if (typeof window === "undefined") return;
  if (!key.trim()) {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${providerId}`);
  } else {
    window.localStorage.setItem(`${STORAGE_PREFIX}${providerId}`, key.trim());
  }
}

export function getAllNewsKeys(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string> = {};
  for (const p of NEWS_PROVIDERS) {
    const v = window.localStorage.getItem(`${STORAGE_PREFIX}${p.id}`);
    if (v) out[p.id] = v;
  }
  return out;
}

export function hasAnyNewsKey(): boolean {
  if (typeof window === "undefined") return false;
  return NEWS_PROVIDERS.some((p) =>
    Boolean(window.localStorage.getItem(`${STORAGE_PREFIX}${p.id}`))
  );
}
