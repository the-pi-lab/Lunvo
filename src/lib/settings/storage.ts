import { AIProfile } from '@/lib/ai/types';
import { createClient } from '@/utils/supabase/client';
import { getActiveAIProfile, setActiveAIProfile } from '@/lib/apiHelper';

export async function saveProfileToStorage(profile: AIProfile): Promise<void> {
  // 1. Save strictly to local storage (API keys stay here!)
  setActiveAIProfile(profile);

  // 2. Save non-sensitive parts to Supabase if user is logged in
  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (userData?.user) {
      // Create a safe version without the API key
      const safeProfile = { ...profile };
      safeProfile.apiKey = 'REDACTED_LOCAL_ONLY';
      
      await supabase.from('profiles').upsert({
        id: userData.user.id,
        ai_provider: safeProfile.provider,
        ai_model: safeProfile.model,
        ai_base_url: safeProfile.baseURL,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    }
  } catch (error) {
    console.warn("Could not sync non-sensitive profile settings to Supabase:", error);
    // Non-fatal, since local storage works
  }
}

export async function loadProfileFromStorage(): Promise<AIProfile | null> {
  // Always prefer local storage since it has the real API key
  const localProfile = getActiveAIProfile();
  if (localProfile && localProfile.apiKey !== 'REDACTED_LOCAL_ONLY') {
    return localProfile;
  }
  
  return null;
}
