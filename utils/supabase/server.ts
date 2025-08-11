// Server-side Supabase client (uses server-only keys)
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

let serverClient: SupabaseClient | null = null

export function createSupabaseServerClient() {
  if (typeof window !== "undefined") {
    throw new Error("createSupabaseServerClient must be used on the server")
  }
  if (serverClient) return serverClient

  const url = process.env.SUPABASE_URL
  // Prefer service role on server; fallback to anon if SR not set
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      "Supabase server env vars are missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY",
    )
  }

  serverClient = createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "X-Client-Info": "thailand-travel-guide/server",
      },
    },
  })
  return serverClient
}

// Export createClient as required by API routes
export const createClient = createSupabaseServerClient
