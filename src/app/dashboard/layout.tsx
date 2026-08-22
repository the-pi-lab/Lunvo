"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AppShell, { type UserProfile } from "@/components/shell/AppShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const isLocalMode =
    !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.trim() === "";

  useEffect(() => {
    let isMounted = true;

    const getProfile = async () => {
      if (isLocalMode) {
        if (isMounted) setUserProfile({ name: "Local Commander", plan: "offline" });
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("full_name, plan, persona_complete")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      if (data && data.persona_complete === false) {
        router.replace("/onboarding");
        return;
      }

      setUserProfile({
        name: data?.full_name || "Creative User",
        plan: data?.plan || "free",
      });
    };

    void getProfile();

    return () => {
      isMounted = false;
    };
  }, [router, supabase, isLocalMode]);

  return (
    <AppShell profile={userProfile} localMode={isLocalMode}>
      {children}
    </AppShell>
  );
}
