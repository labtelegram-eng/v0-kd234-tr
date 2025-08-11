import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, image, alt, order, is_active")
    .eq("is_active", true)
    .order("order", { ascending: true })

  if (error) {
    console.error("Hero slides GET error:", error)
    return NextResponse.json({ slides: [] })
  }

  return NextResponse.json({
    slides: (data || []).map((s) => ({
      id: s.id,
      image: s.image,
      alt: s.alt,
      order: s.order,
      isActive: s.is_active,
    })),
  })
}
