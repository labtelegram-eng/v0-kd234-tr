import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from("blog_categories")
      .select("*")
      .eq("is_active", true)
      .order("order", { ascending: true })
    if (error) throw error
    return NextResponse.json({ categories: data ?? [] })
  } catch (e) {
    console.error("Categories GET error:", e)
    return NextResponse.json({ categories: [] }, { status: 200 })
  }
}
