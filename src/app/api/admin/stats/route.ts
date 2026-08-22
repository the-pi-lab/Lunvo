import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "vinayakmahavar45@gmail.com";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return { supabase, user };
}

export async function GET() {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { supabase } = admin;

  // 1. Total users + signups today
  const { data: allUsers } = await supabase
    .from("users")
    .select("id, plan, created_at");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalUsers = allUsers?.length || 0;
  const todaySignups = allUsers?.filter((u) => new Date(u.created_at) >= today).length || 0;

  // Plan distribution
  const planCounts = {
    free: allUsers?.filter((u) => u.plan === "free" || !u.plan).length || 0,
    starter: allUsers?.filter((u) => u.plan === "starter").length || 0,
    pro: allUsers?.filter((u) => u.plan === "pro").length || 0,
  };

  // 2. Referral stats
  const { data: referrals } = await supabase
    .from("referrals")
    .select(`
      id,
      created_at,
      reward_status,
      referrer_id,
      referred_id
    `)
    .order("created_at", { ascending: false });

  const pendingApprovals = referrals?.filter((r) => r.reward_status === "pending") || [];

  // Get referrer details for pending approvals
  const referrerIds = [...new Set(pendingApprovals.map((r) => r.referrer_id))];
  let referrerDetails: any[] = [];
  if (referrerIds.length > 0) {
    const { data } = await supabase
      .from("users")
      .select("id, full_name, email, referral_points, plan")
      .in("id", referrerIds);
    referrerDetails = data || [];
  }

  const pendingWithDetails = pendingApprovals.map((r) => ({
    ...r,
    referrer: referrerDetails.find((u) => u.id === r.referrer_id),
  }));

  // Weekly signups (last 7 days)
  const weeklySignups = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const count =
      allUsers?.filter((u) => {
        const created = new Date(u.created_at);
        return created >= date && created < nextDate;
      }).length || 0;

    weeklySignups.push({
      date: date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
      count,
    });
  }

  return NextResponse.json({
    users: {
      total: totalUsers,
      today: todaySignups,
      weekly: weeklySignups,
      plans: planCounts,
    },
    referrals: {
      total: referrals?.length || 0,
      pending_approvals: pendingWithDetails,
      approved: referrals?.filter((r) => r.reward_status === "approved").length || 0,
    },
  });
}
