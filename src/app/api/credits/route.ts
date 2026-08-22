import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getPlanLimits(plan: string) {
  if (plan === "pro") {
    return { analyze: 15, generate: 10 };
  }

  if (plan === "starter") {
    return { analyze: 5, generate: 5 };
  }

  return { analyze: 2, generate: 2 };
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData, error } = await supabase
    .from("users")
    .select("plan, daily_analyze_count, daily_generate_count, daily_reset_date")
    .eq("id", user.id)
    .single();

  if (error || !userData) {
    return NextResponse.json({ error: "User data not found" }, { status: 404 });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const needsReset = userData.daily_reset_date && userData.daily_reset_date < todayStr;

  let analyzeUsed = userData.daily_analyze_count || 0;
  let generateUsed = userData.daily_generate_count || 0;

  if (needsReset) {
    const { error: resetError } = await supabase
      .from("users")
      .update({
        daily_analyze_count: 0,
        daily_generate_count: 0,
        daily_reset_date: todayStr,
      })
      .eq("id", user.id);

    if (resetError) {
      return NextResponse.json({ error: "Service error" }, { status: 500 });
    }

    analyzeUsed = 0;
    generateUsed = 0;
  }

  const plan = userData.plan || "free";
  const limits = getPlanLimits(plan);

  return NextResponse.json({
    plan,
    analyze: {
      used: analyzeUsed,
      limit: limits.analyze,
      resets_at: "midnight UTC",
    },
    generate: {
      used: generateUsed,
      limit: limits.generate,
      resets_at: "midnight UTC",
    },
  });
}
