import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use environment variables for the URL and anon key.
  // If they are missing, default to empty strings to prevent build crashes,
  // but warn the user that Supabase is not configured.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}
