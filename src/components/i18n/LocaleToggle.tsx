"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";

export function LocaleToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggle = () => {
    const newLocale = locale === "en" ? "hi" : "en";
    // With localePrefix: as-needed, / -> /hi, /hi/dashboard -> /dashboard
    let newPath: string;
    if (newLocale === "hi") {
      newPath = pathname.startsWith("/hi") ? pathname : `/hi${pathname}`;
    } else {
      newPath = pathname.startsWith("/hi") ? pathname.replace(/^\/hi/, "") || "/" : pathname;
    }
    router.push(newPath);
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-surface-container-low ring-1 ring-outline-variant/30 text-xs font-bold hover:bg-surface-container transition-colors"
      title={`Switch to ${locale === "en" ? "Hindi" : "English"}`}
    >
      <span className="text-[0.6875rem]">{locale === "en" ? "🇮🇳 हिंदी" : "🇬🇧 EN"}</span>
    </button>
  );
}
