import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_ratings")
    .select("display_name, rating, opinion, created_at")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ hasRated: false });
  }

  return NextResponse.json({ hasRated: true, rating: data });
}
