"use client";

import { useEffect, useState } from "react";
import AppShell, { type UserProfile } from "@/components/shell/AppShell";
import { isLocalMode } from "@/lib/localMode";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const isDemo = isLocalMode();

  useEffect(() => {
    setUserProfile({ name: "Local Commander", plan: isDemo ? "offline" : "studio" });
  }, [isDemo]);

  return (
    <AppShell profile={userProfile} localMode={isDemo}>
      {children}
    </AppShell>
  );
}
