import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from("news")
      .select("id, title")
      .eq("is_active", true)
      .order("published_at", { ascending: false })

    if (error) {
      console.error("News list GET error:", error)
      return NextResponse.json({ items: [] })
    }

    return NextResponse.json({ items: data || [] })
  } catch (error) {
    console.error("News list GET error:", error)
    return NextResponse.json({ items: [] })
  }
}
