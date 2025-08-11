"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

export function getSupabaseBrowser() {
  if (client) return client
  // Prefer NEXT_PUBLIC_* on the client
  const url =
    (process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) || (process.env.SUPABASE_URL as string | undefined)
  const key =
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
    (process.env.SUPABASE_ANON_KEY as string | undefined)

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  return client
}
