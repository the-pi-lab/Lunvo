import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's referral data
  const { data: userData } = await supabase
    .from("users")
    .select("referral_code, referral_points, plan")
    .eq("id", user.id)
    .single();

  // Get list of people they referred
  const { data: referrals } = await supabase
    .from("referrals")
    .select("referred_id, created_at, reward_status")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  // Get referred users' names (for display)
  const referredIds = (referrals || []).map((r) => r.referred_id);
  let referredUsers: any[] = [];
  if (referredIds.length > 0) {
    const { data } = await supabase
      .from("users")
      .select("id, full_name, created_at")
      .in("id", referredIds);
    referredUsers = data || [];
  }

  const points = userData?.referral_points || 0;
  const pointsNeeded = 150;
  const isEligible = points >= pointsNeeded;

  return NextResponse.json({
    referral_code: userData?.referral_code,
    referral_link: `${process.env.NEXT_PUBLIC_APP_URL}/?ref=${userData?.referral_code}`,
    total_referrals: (referrals || []).length,
    points,
    points_needed: pointsNeeded,
    points_remaining: Math.max(0, pointsNeeded - points),
    is_eligible_for_upgrade: isEligible,
    referrals: (referrals || []).map((r) => ({
      ...r,
      user: referredUsers.find((u) => u.id === r.referred_id),
    })),
  });
}
