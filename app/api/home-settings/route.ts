import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: settings, error: sErr } = await supabase
    .from("home_settings")
    .select("id, hero_title, hero_subtitle, hero_button_text, updated_at")
    .eq("id", 1)
    .maybeSingle()

  const { data: slides, error: slErr } = await supabase
    .from("hero_slides")
    .select("id, image, alt, order, is_active")
    .order("order", { ascending: true })

  if (sErr) console.error("Home settings error:", sErr)
  if (slErr) console.error("Hero slides error:", slErr)

  return NextResponse.json({
    settings: settings
      ? {
          id: settings.id,
          heroTitle: settings.hero_title,
          heroSubtitle: settings.hero_subtitle,
          heroButtonText: settings.hero_button_text,
          updatedAt: settings.updated_at,
        }
      : null,
    slides: slides?.map((s) => ({ id: s.id, image: s.image, alt: s.alt, order: s.order, isActive: s.is_active })) ?? [],
  })
}
