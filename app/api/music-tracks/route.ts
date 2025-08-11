import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"
import { requireAdmin } from "@/lib/supabase-helpers"

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const url = new URL(req.url)
    const active = url.searchParams.get("active")

    let query = supabase
      .from("music_tracks")
      .select("id, name, artist, cover_image, youtube_url, order_index, is_active, created_at, updated_at")

    if (active === "true") {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query.order("order_index", { ascending: true })

    if (error) {
      console.error("Music GET error:", error)
      return NextResponse.json({ tracks: [] })
    }

    const tracks = (data || []).map((t) => ({
      id: t.id,
      name: t.name,
      artist: t.artist,
      coverImage: t.cover_image,
      youtubeUrl: t.youtube_url,
      order: t.order_index,
      isActive: t.is_active,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }))

    return NextResponse.json({ tracks })
  } catch (error) {
    console.error("Music GET error:", error)
    return NextResponse.json({ tracks: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { name, artist, coverImage, youtubeUrl, order } = body

    if (!name || !artist || !youtubeUrl) {
      return NextResponse.json({ error: "Название, исполнитель и YouTube URL обязательны" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from("music_tracks")
      .insert({
        name,
        artist,
        cover_image: coverImage || null,
        youtube_url: youtubeUrl,
        order_index: order || 0,
        is_active: true,
      })
      .select("*")
      .single()

    if (error) {
      console.error("Music POST error:", error)
      return NextResponse.json({ error: "Ошибка создания трека" }, { status: 500 })
    }

    const track = {
      id: data.id,
      name: data.name,
      artist: data.artist,
      coverImage: data.cover_image,
      youtubeUrl: data.youtube_url,
      order: data.order_index,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return NextResponse.json({ track })
  } catch (error: any) {
    console.error("Music POST error:", error)
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }
    return NextResponse.json({ error: "Ошибка создания трека" }, { status: 500 })
  }
}
