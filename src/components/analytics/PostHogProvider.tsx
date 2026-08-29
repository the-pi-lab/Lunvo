"use client";

import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
    if (!key) return;

    // CDN lazy-load — no npm dep needed, zero bundle cost when disabled
    const script = document.createElement("script");
    script.src = "https://us-assets.i.posthog.com/array.js";
    script.async = true;
    script.onload = () => {
      const win = window as unknown as { posthog?: { init: (k: string, o: unknown) => void } };
      win.posthog?.init(key, {
        api_host: host,
        capture_pageview: false,
        capture_pageleave: true,
        persistence: "localStorage",
        autocapture: false,
        opt_out_capturing_by_default: true,
      });
    };
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return <>{children}</>;
}
