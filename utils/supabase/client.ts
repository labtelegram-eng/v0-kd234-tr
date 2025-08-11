// Browser-side Supabase client (uses NEXT_PUBLIC_* vars)
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null = null

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
  browserClient = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: { headers: { "X-Client-Info": "thailand-travel-guide/browser" } },
  })
  return browserClient
}
