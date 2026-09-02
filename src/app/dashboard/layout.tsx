"use client";

import { useEffect, useState, useCallback } from "react";
import AppShell, { type UserProfile } from "@/components/shell/AppShell";
import { isLocalMode } from "@/lib/localMode";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const isDemo = isLocalMode();

  const loadProfile = useCallback(() => {
    let name = "Local Commander";
    try {
      const stored = localStorage.getItem("lunvo_user_name");
      if (stored && stored.trim()) {
        name = stored.trim();
      }
    } catch {
      // storage unavailable
    }
    setUserProfile({ name, plan: isDemo ? "offline" : "studio" });
  }, [isDemo]);

  useEffect(() => {
    loadProfile();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ name?: string }>;
      if (customEvent.detail?.name) {
        setUserProfile((prev) => ({
          name: customEvent.detail.name!.trim() || "Local Commander",
          plan: prev?.plan ?? (isDemo ? "offline" : "studio"),
        }));
      } else {
        loadProfile();
      }
    };

    window.addEventListener("lunvo:user-profile-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("lunvo:user-profile-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadProfile, isDemo]);

  return (
    <AppShell profile={userProfile} localMode={isDemo}>
      {children}
    </AppShell>
  );
}
