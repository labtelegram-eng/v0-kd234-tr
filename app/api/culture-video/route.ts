import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"
import { requireAdmin } from "@/lib/supabase-helpers"

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase.from("culture_video").select("*").eq("id", 1).maybeSingle()
    return NextResponse.json({ success: true, video: data ?? null })
  } catch (error) {
    console.error("Get culture video error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const { title, description, youtubeUrl, thumbnail, isActive } = await request.json()
    if (!title || !description) {
      return NextResponse.json({ error: "Название и описание обязательны" }, { status: 400 })
    }
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from("culture_video")
      .upsert(
        {
          id: 1,
          title,
          description,
          youtube_url: youtubeUrl ?? "",
          thumbnail: thumbnail ?? "",
          is_active: isActive ?? true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("*")
      .single()
    if (error) throw error
    return NextResponse.json({ success: true, video: data })
  } catch (error: any) {
    if (error?.message === "FORBIDDEN") return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    console.error("Update culture video error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
