/**
 * Cloud Storage Providers — 5 options, BYOC (Bring Your Own Cloud)
 * Default is local-first (localStorage). If user wants cloud, they pick one and paste keys.
 * Keys stored locally, never sent to us.
 */

export interface CloudProviderDef {
  id: string;
  name: string;
  desc: string;
  keyUrl: string;
  docsUrl?: string;
  placeholder: string;
  color: string;
  fields: { key: string; label: string; placeholder: string; type: "text" | "password" }[];
}

export const CLOUD_PROVIDERS: CloudProviderDef[] = [
  {
    id: "supabase",
    name: "Supabase",
    desc: "Postgres + Auth + Storage — most popular OSS cloud",
    keyUrl: "https://supabase.com/dashboard",
    docsUrl: "https://supabase.com/docs/guides/api",
    placeholder: "https://xyz.supabase.co",
    color: "#3ECF8E",
    fields: [
      { key: "url", label: "Supabase URL", placeholder: "https://xyz.supabase.co", type: "text" },
      { key: "anonKey", label: "Anon Key", placeholder: "eyJ...", type: "password" },
    ],
  },
  {
    id: "convex",
    name: "Convex",
    desc: "Reactive backend — real-time, zero config",
    keyUrl: "https://dashboard.convex.dev",
    docsUrl: "https://docs.convex.dev",
    placeholder: "https://happy-animal-123.convex.cloud",
    color: "#EE342F",
    fields: [
      { key: "url", label: "Convex URL", placeholder: "https://xxx.convex.cloud", type: "text" },
    ],
  },
  {
    id: "firebase",
    name: "Firebase",
    desc: "Google — Firestore + Auth, generous free tier",
    keyUrl: "https://console.firebase.google.com",
    docsUrl: "https://firebase.google.com/docs",
    placeholder: "your-project-id",
    color: "#FFCA28",
    fields: [
      { key: "projectId", label: "Project ID", placeholder: "my-project-123", type: "text" },
      { key: "apiKey", label: "API Key", placeholder: "AIza...", type: "password" },
    ],
  },
  {
    id: "turso",
    name: "Turso (libSQL)",
    desc: "Edge SQLite — fast, cheap, local-first sync",
    keyUrl: "https://turso.tech",
    docsUrl: "https://docs.turso.tech",
    placeholder: "libsql://your-db.turso.io",
    color: "#06B6D4",
    fields: [
      { key: "url", label: "Database URL", placeholder: "libsql://xxx.turso.io", type: "text" },
      { key: "token", label: "Auth Token", placeholder: "eyJ...", type: "password" },
    ],
  },
  {
    id: "planetscale",
    name: "PlanetScale",
    desc: "Serverless MySQL — branching, scale to zero",
    keyUrl: "https://app.planetscale.com",
    docsUrl: "https://planetscale.com/docs",
    placeholder: "pscale_pw_xxx",
    color: "#000000",
    fields: [
      { key: "host", label: "Host", placeholder: "aws.connect.psdb.cloud", type: "text" },
      { key: "username", label: "Username", placeholder: "xxxx", type: "text" },
      { key: "password", label: "Password", placeholder: "pscale_pw_...", type: "password" },
    ],
  },
];

const PREFIX = "lunvo_cloud_";

export function getCloudConfig(providerId: string): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(`${PREFIX}${providerId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}

export function setCloudConfig(providerId: string, config: Record<string, string>): void {
  if (typeof window === "undefined") return;
  const hasValue = Object.values(config).some((v) => v && v.trim());
  if (!hasValue) {
    window.localStorage.removeItem(`${PREFIX}${providerId}`);
  } else {
    window.localStorage.setItem(`${PREFIX}${providerId}`, JSON.stringify(config));
  }
}

export function hasAnyCloud(): boolean {
  if (typeof window === "undefined") return false;
  return CLOUD_PROVIDERS.some((p) => Boolean(window.localStorage.getItem(`${PREFIX}${p.id}`)));
}

export function getActiveCloudProvider(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("lunvo_cloud_active");
}

export function setActiveCloudProvider(id: string | null): void {
  if (typeof window === "undefined") return;
  if (!id) window.localStorage.removeItem("lunvo_cloud_active");
  else window.localStorage.setItem("lunvo_cloud_active", id);
}
