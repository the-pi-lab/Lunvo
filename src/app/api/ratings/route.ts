import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_ratings")
    .select("display_name, rating, opinion, created_at")
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 });
  }

  return NextResponse.json({ ratings: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const displayName = String(body?.display_name || "").trim();
  const opinion = String(body?.opinion || "").trim();
  const rating = Number(body?.rating);

  if (!displayName || displayName.length < 2) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!opinion || opinion.length < 5) {
    return NextResponse.json({ error: "Opinion is required" }, { status: 400 });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_ratings")
    .upsert(
      {
        user_id: user.id,
        display_name: displayName,
        rating,
        opinion,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
