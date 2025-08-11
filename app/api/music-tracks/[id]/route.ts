import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/utils/supabase/server"
import { requireAdmin } from "@/lib/supabase-helpers"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const body = await request.json()
    const supabase = createSupabaseServerClient()

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.artist !== undefined) updateData.artist = body.artist
    if (body.coverImage !== undefined) updateData.cover_image = body.coverImage
    if (body.youtubeUrl !== undefined) updateData.youtube_url = body.youtubeUrl
    if (body.order !== undefined) updateData.order_index = body.order
    if (body.isActive !== undefined) updateData.is_active = body.isActive

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from("music_tracks")
      .update(updateData)
      .eq("id", Number(params.id))
      .select("*")
      .single()

    if (error) {
      console.error("Music PUT error:", error)
      return NextResponse.json({ error: "Ошибка обновления трека" }, { status: 500 })
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

    return NextResponse.json({ success: true, track })
  } catch (error: any) {
    console.error("Music PUT error:", error)
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }
    return NextResponse.json({ error: "Ошибка обновления трека" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const supabase = createSupabaseServerClient()
    const { error } = await supabase.from("music_tracks").delete().eq("id", Number(params.id))

    if (error) {
      console.error("Music DELETE error:", error)
      return NextResponse.json({ error: "Ошибка удаления трека" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Music DELETE error:", error)
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }
    return NextResponse.json({ error: "Ошибка удаления трека" }, { status: 500 })
  }
}
