import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "vinayakmahavar45@gmail.com";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { referral_id, action, referrer_id } = await req.json();
  // action: 'approve' | 'reject'

  if (action === "approve") {
    // 1. Update referral status
    await supabase
      .from("referrals")
      .update({
        reward_status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: ADMIN_EMAIL,
      })
      .eq("id", referral_id);

    // 2. Upgrade referrer to Starter for 1 month
    // (You manually set end date — for now just update plan)
    await supabase
      .from("users")
      .update({ plan: "starter" })
      .eq("id", referrer_id);

    // 3. Reset their points (they used 150)
    await supabase
      .from("users")
      .update({ referral_points: 0 })
      .eq("id", referrer_id);
  } else if (action === "reject") {
    await supabase
      .from("referrals")
      .update({ reward_status: "rejected" })
      .eq("id", referral_id);
  }

  return NextResponse.json({ success: true });
}
