import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const {
      role, 
      topics, 
      goal, 
      tone, 
      audience 
    } = body;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    if (!role || topics.length === 0 || !goal || !tone || !audience) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Helper to map human-readable labels to DB schema values
    const mapToDbValue = (val: string, type: 'role' | 'goal' | 'tone' | 'audience') => {
      const v = val.toLowerCase();
      if (type === 'role') {
        if (v.includes('student')) return 'student';
        if (v.includes('founder')) return 'founder';
        if (v.includes('freelancer')) return 'freelancer';
        if (v.includes('job seeker')) return 'job_seeker';
        if (v.includes('influencer')) return 'influencer';
        if (v.includes('product manager')) return 'product_manager';
        if (v.includes('marketing')) return 'marketing_expert';
        if (v.includes('sales')) return 'sales_professional';
        if (v.includes('creative')) return 'creative';
        if (v.includes('other')) return 'other';
      }
      if (type === 'goal') {
        if (v.includes('follower')) return 'followers';
        if (v.includes('lead')) return 'leads';
        if (v.includes('job')) return 'job';
        if (v.includes('brand')) return 'brand';
        if (v.includes('networking')) return 'networking';
        if (v.includes('leadership')) return 'leadership';
        if (v.includes('insight')) return 'insights';
        if (v.includes('growth')) return 'growth';
        if (v.includes('other')) return 'other';
      }
      if (type === 'tone') {
        if (v.includes('bold')) return 'bold';
        if (v.includes('story')) return 'story';
        if (v.includes('educational')) return 'educational';
        if (v.includes('casual')) return 'casual';
        if (v.includes('witty')) return 'witty';
        if (v.includes('data-driven') || v.includes('data')) return 'data_driven';
        if (v.includes('inspirational')) return 'inspirational';
        if (v.includes('controversial')) return 'controversial';
        if (v.includes('other')) return 'other';
      }
      if (type === 'audience') {
        if (v.includes('student')) return 'students';
        if (v.includes('founder')) return 'founders';
        if (v.includes('recruiter')) return 'recruiters';
        if (v.includes('engineer')) return 'engineers';
        if (v.includes('executive')) return 'executives';
        if (v.includes('creative')) return 'creatives';
        if (v.includes('other')) return 'other';
      }
      return v;
    };

    // 1. Mark onboarding as complete in users table FIRST
    const { error: userError } = await supabase
      .from("users")
      .update({ persona_complete: true })
      .eq("id", userId);

    if (userError) throw userError;

    // 2. THEN save persona (if this fails, user.persona_complete is still true, which is safer than the reverse)
    const { error: personaError } = await supabase
      .from("personas")
      .insert({
        user_id: userId,
        role: mapToDbValue(role, 'role'),
        topics: topics,
        goal: mapToDbValue(goal, 'goal'),
        tone: mapToDbValue(tone, 'tone'),
        audience: mapToDbValue(audience, 'audience')
      });

    if (personaError) throw personaError;

    // 3. Process referral if ref code exists in request
    const refCode = body?.ref_code;
    if (refCode && typeof refCode === 'string') {
      await supabase.rpc('process_referral', {
        p_referred_id: user.id,
        p_referral_code: refCode.trim().toUpperCase()
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Persona save error:", error);
    return NextResponse.json(
      { error: "Failed to save settings. Try again." },
      { status: 500 }
    );
  }
}
